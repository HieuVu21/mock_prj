import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import HomeComponent from "./component/BookList";
import BookDetailComponent from "./component/BookCard";
import SearchResults from "./component/SearchResults";
import Profile from "./pages/Profile";
import CartPage from "./pages/CartPage";
import ProtectedRoute from "./component/ProtectedRoute";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import OrderDetail from "./pages/OrderDetail";

const router = createBrowserRouter([
  {
    path: "/",
    Component: HomeComponent,
  },
  {
    path: "/books/:id",
    Component: BookDetailComponent,
  },
  {
    path: "/search",
    Component: SearchResults,
  },
  {
    path: "/profile",
    element: <ProtectedRoute><Profile /></ProtectedRoute>,
  },
  {
    path: "/profile/order",
    element: <ProtectedRoute><Profile /></ProtectedRoute>,
  },
  {
    path: "/cart",
    element: <ProtectedRoute><CartPage /></ProtectedRoute>,
  },
  {
    path: "/orders/:id",
    element: <ProtectedRoute><OrderDetail /></ProtectedRoute>,
  },
]);

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
        <Toaster position="bottom-right" toastOptions={{ duration: 2500 }} />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;