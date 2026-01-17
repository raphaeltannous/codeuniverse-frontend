import { RouterProvider } from "react-router";
import AppRoutes from "./AppRoutes";
import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from "@tanstack/react-query";
import { UserProvider } from "./context/UserContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";
import { NotificationContainer } from "./components/NotificationContainer";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof Error && error.message.includes("401")) {
        // Clear auth and redirect
        localStorage.removeItem("auth");
        queryClient.clear();
        window.location.href = "/accounts/login";
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      if (error instanceof Error && error.message.includes("401")) {
        // Clear auth and redirect
        localStorage.removeItem("auth");
        queryClient.clear();
        window.location.href = "/accounts/login";
      }
    },
  }),
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 401 errors
        if (error instanceof Error && error.message.includes("401")) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProvider>
          <ThemeProvider>
            <NotificationProvider>
              <RouterProvider router={AppRoutes} />
              <NotificationContainer />
            </NotificationProvider>
          </ThemeProvider>
        </UserProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
