const jsonServer = require("json-server");
const path = require("path");
const dotenv = require("dotenv");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

dotenv.config();

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "api.json"));
const middlewares = jsonServer.defaults();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

server.use(middlewares);
server.use(jsonServer.bodyParser);
server.db = router.db;

// CORS middleware
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Token verification middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  console.log('=== TOKEN VERIFICATION ===');
  console.log('Path:', req.path);
  console.log('Method:', req.method);
  console.log('Auth header:', authHeader);
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    console.log('Token received:', token.substring(0, 30) + '...');
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      console.log('✅ Token verified successfully');
      console.log('User info:', { email: decoded.email, sub: decoded.sub });
    } catch (err) {
      console.log('❌ Token verification failed:', err.message);
      req.user = null;
    }
  } else {
    console.log('No authorization header');
    req.user = null;
  }
  
  console.log('Final req.user:', req.user ? 'EXISTS' : 'NULL');
  console.log('=== END VERIFICATION ===\n');
  next();
};

// Apply token verification
server.use(verifyToken);

// Auth middleware for protected routes
const requireAuth = (req, res, next) => {
  if (!req.user || !req.user.email) {
    console.log('🚫 Auth required but user not found');
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Valid token required'
    });
  }
  console.log('✅ Auth check passed for:', req.user.email);
  next();
};

// Custom login route with bcrypt password comparison
server.post('/login', async (req, res) => {
  console.log('=== LOGIN REQUEST ===');
  const { email, password } = req.body;
  console.log('Login attempt:', { email, password });
  
  const db = router.db;
  const user = db.get('users').find({ email }).value();
  
  if (!user) {
    console.log('❌ User not found');
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  console.log('User found:', { id: user.id, email: user.email, role: user.role });
  
  // Sửa: Dùng bcrypt.compare để so sánh password hash
  let passwordValid = false;
  try {
    // Kiểm tra xem password trong DB có phải hash không
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$')) {
      // Password đã hash, dùng bcrypt.compare
      passwordValid = await bcrypt.compare(password, user.password);
      console.log('🔐 Using bcrypt comparison for hashed password');
    } else {
      // Password plain text (fallback cho development)
      passwordValid = user.password === password;
      console.log('⚠️  Using plain text comparison (development mode)');
    }
  } catch (error) {
    console.log('❌ Password comparison error:', error.message);
    passwordValid = false;
  }
  
  if (!passwordValid) {
    console.log('❌ Password invalid');
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // Generate token
  const token = jwt.sign(
    { 
      email: user.email, 
      sub: user.id.toString(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
    },
    JWT_SECRET
  );
  
  console.log('✅ Login successful, token generated');
  console.log('Token:', token.substring(0, 30) + '...');
  
  res.json({
    accessToken: token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name || user.fullName,
      role: user.role
    }
  });
});

// Custom register route with bcrypt password hashing
server.post('/register', async (req, res) => {
  const { email, password, name, role = 'user' } = req.body;
  
  const db = router.db;
  const existingUser = db.get('users').find({ email }).value();
  
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }
  
  // Hash password trước khi lưu
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const newUser = {
    id: Date.now(),
    email,
    password: hashedPassword, // Lưu password đã hash
    name,
    role,
    createdAt: new Date().toISOString()
  };
  
  db.get('users').push(newUser).write();
  
  const token = jwt.sign(
    { 
      email: newUser.email, 
      sub: newUser.id.toString(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60)
    },
    JWT_SECRET
  );
  
  res.status(201).json({
    accessToken: token,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    }
  });
});

// Cart routes
server.get('/cart', requireAuth, (req, res) => {
  console.log('=== GET CART ===');
  const userId = req.user.email;
  console.log('Getting cart for user:', userId);
  
  const db = router.db;
  let cart = db.get('carts').find({ userId }).value();

  if (!cart) {
    const newCart = {
      id: `cart_${Date.now()}`,
      userId,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    db.get('carts').push(newCart).write();
    console.log('✅ Created new empty cart');
    return res.status(200).json(newCart);
  }

  // Enrich cart items with book details
  const enrichedItems = cart.items.map(item => {
    const book = db.get('books').find({ id: item.bookId }).value();
    if (book) {
      return {
        ...book,
        quantity: item.quantity,
        cartItemId: item.id
      };
    }
    return null;
  }).filter(Boolean);

  console.log('✅ Cart retrieved with', enrichedItems.length, 'items');
  res.status(200).json({ ...cart, items: enrichedItems });
});

server.post('/cart/items', requireAuth, (req, res) => {
  const userId = req.user.email;
  const { bookId, quantity = 1 } = req.body;

  console.log('=== ADD CART ITEM ===');
  console.log('User:', userId);
  console.log('Book ID:', bookId);
  console.log('Quantity:', quantity);

  if (!bookId || typeof quantity !== 'number' || quantity <= 0) {
    console.log('❌ Invalid request body');
    return res.status(400).json({ error: 'Invalid bookId or quantity' });
  }

  const db = router.db;
  const book = db.get('books').find({ id: bookId }).value();
  if (!book) {
    console.log('❌ Book not found:', bookId);
    return res.status(404).json({ error: 'Book not found' });
  }

  let cart = db.get('carts').find({ userId }).value();
  if (!cart) {
    cart = {
      id: `cart_${Date.now()}`,
      userId,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.get('carts').push(cart).write();
    console.log('✅ Created new cart for user:', userId);
  }

  const existingItemIndex = cart.items.findIndex(item => item.bookId === bookId);
  if (existingItemIndex !== -1) {
    cart.items[existingItemIndex].quantity += quantity;
    console.log('✅ Updated existing item quantity');
  } else {
    cart.items.push({
      id: `item_${Date.now()}`, // Tạo ID mục giỏ hàng duy nhất
      bookId,
      quantity,
      addedAt: new Date().toISOString()
    });
    console.log('✅ Added new item to cart');
  }

  cart.updatedAt = new Date().toISOString();
  db.get('carts').find({ id: cart.id }).assign(cart).write();

  console.log('✅ Cart updated successfully');
  res.status(201).json({ message: 'Item added to cart', cart });
});

server.put('/cart/items/:id', requireAuth, (req, res) => {
  const userId = req.user.email;
  const { id: itemId } = req.params;
  const { quantity } = req.body;

  if (typeof quantity !== 'number' || quantity < 0) {
    return res.status(400).json({ error: 'Invalid quantity' });
  }

  const db = router.db;
  let cart = db.get('carts').find({ userId }).value();

  if (!cart) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  const itemIndex = cart.items.findIndex(item => item.id === itemId);

  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not found in cart' });
  }

  if (quantity === 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].quantity = quantity;
  }

  cart.updatedAt = new Date().toISOString();
  db.get('carts').find({ id: cart.id }).assign(cart).write();

  res.status(200).json({ message: 'Cart updated' });
});

server.delete('/cart/items/:id', requireAuth, (req, res) => {
  const userId = req.user.email;
  const { id: itemId } = req.params;

  const db = router.db;
  let cart = db.get('carts').find({ userId }).value();

  if (!cart) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  const itemIndex = cart.items.findIndex(item => item.id === itemId);

  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not found in cart' });
  }

  cart.items.splice(itemIndex, 1);
  cart.updatedAt = new Date().toISOString();
  db.get('carts').find({ id: cart.id }).assign(cart).write();

  res.status(204).send();
});

// Debug endpoint
server.get('/debug/token', (req, res) => {
  res.json({
    hasAuthHeader: !!req.headers.authorization,
    user: req.user,
    timestamp: new Date().toISOString(),
    jwtSecret: JWT_SECRET
  });
});

// Apply JSON Server router for other routes
server.use(router);

const PORT = process.env.PORT || 3000;

// Initialize database
const initializeDatabase = () => {
  const db = router.db;
  
  if (!db.has('carts').value()) {
    db.set('carts', []).write();
  }
  
  // Create test users with hashed passwords
  if (!db.has('users').value() || db.get('users').value().length === 0) {
    // Hash passwords for test users
    const testUsers = [
      {
        id: 1,
        email: 'test@example.com',
        password: '$2a$10$3OyHnkJgGwUETl4t4htKbenhRrhMaRJvyXDmeMyYv6K281Dsqcjha', // hash của '123456'
        name: 'Test User',
        role: 'user'
      },
      {
        id: 2,
        email: 'admin@gmail.com',
        password: '$2a$10$.sWh.AkcLwRERI90UdJIX.pWAkv8yRNoREAdC.3CXq3ixRNdm/CU6', // hash của '12345678aA@'
        name: 'Admin User',
        role: 'admin'
      }
    ];
    
    db.set('users', testUsers).write();
    console.log('✅ Test users created with hashed passwords');
  }
};

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 JWT Secret: ${JWT_SECRET}`);
  
  initializeDatabase();
  
  console.log('\n📋 Available endpoints:');
  console.log('- POST /login');
  console.log('- POST /register');
  console.log('- GET  /cart (auth required)');
  console.log('- POST /cart/items (auth required)');
  console.log('- PUT  /cart/items/:id (auth required)');
  console.log('- DELETE /cart/items/:id (auth required)');
  console.log('- GET  /debug/token');
  
  console.log('\n👤 Test users:');
  console.log('- admin@gmail.com / 12345678aA@ (admin)');
  console.log('- test@example.com / 123456 (user)');
});
