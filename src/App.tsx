import { useEffect } from "react";
import { RouterProvider } from "react-router";
import AppRoutes from "./AppRoutes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    document.body.setAttribute("data-bs-theme", "dark");
  }, []);


  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={AppRoutes} />
    </QueryClientProvider>
 )
}

export default App
