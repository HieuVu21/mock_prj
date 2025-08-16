import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import HomeComponent from "./component/BookList";
import BookDetailComponent from "./component/BookCard";
import SearchResults from "./component/SearchResults";
import Profile from "./pages/Profile";

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
    Component: Profile,
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="bottom-right" toastOptions={{ duration: 2500 }} />
    </>
  );
}

export default App;
