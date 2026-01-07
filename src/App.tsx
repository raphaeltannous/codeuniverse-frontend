import { RouterProvider } from "react-router";
import AppRoutes from "./AppRoutes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserProvider } from "./context/UserContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProvider>
          <ThemeProvider>
            <RouterProvider router={AppRoutes} />
          </ThemeProvider>
        </UserProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
