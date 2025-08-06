import {
  createBrowserRouter,
  RouterProvider,
} from "react-router";
import HomeComponent from "./component/BookList";
import BookDetailComponent from "./component/BookCard";

const router = createBrowserRouter([
  {
    path: "/",
    Component: HomeComponent,
  },
  {
    path: "/book/:id",
    Component: BookDetailComponent,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
