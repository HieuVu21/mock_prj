import {
  createBrowserRouter,
  RouterProvider,
} from "react-router";
import HomeComponent from "./component/BookList";
import BookDetailComponent from "./component/BookCard";
import SearchResults from "./component/SearchResults";
import CartPage from "./component/CartPage";

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
    path: "/cart",
    Component: CartPage,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
