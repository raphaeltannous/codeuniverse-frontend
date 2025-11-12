import { useEffect } from "react";
import { RouterProvider } from "react-router";
import AppRoutes from "./AppRoutes";

function App() {
  useEffect(() => {
    document.body.setAttribute("data-bs-theme", "dark");
  }, []);


  return (
    <RouterProvider router={AppRoutes} />
 )
}

export default App
