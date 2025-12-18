import { useEffect } from "react";
import { RouterProvider } from "react-router";
import AppRoutes from "./AppRoutes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserProvider } from "./context/UserContext";
import { AuthProvider } from "./context/AuthContext";

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    document.body.setAttribute("data-bs-theme", "dark");
  }, []);


  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProvider>
          <RouterProvider router={AppRoutes} />
        </UserProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
