import { useQueryClient } from "@tanstack/react-query"
import { createContext, useContext, useEffect, useState } from "react"

type AuthState = {
  isAuthenticated: boolean
  mfaPending: boolean
  jwt?: string
  mfaToken?: string
}

type AuthContextType = {
  auth: AuthState
  loginStarted: (mfaToken: string) => void
  completeMfa: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}

const STORAGE_KEY = "auth"

const isJwtValid = (token?: string) => {
  if (!token) return false;
  try {
    const base64Payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64Payload));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp ? payload.exp > now + 5 : true;
  } catch {
    return false;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    mfaPending: false,
  })
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed: AuthState = JSON.parse(saved)
      if (parsed.jwt && !isJwtValid(parsed.jwt)) {
        localStorage.removeItem(STORAGE_KEY)
        setAuth({ isAuthenticated: false, mfaPending: false })
      } else {
        setAuth(parsed)
      }
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
  }, [auth, hydrated])

  const loginStarted = (mfaToken: string) => {
    setAuth({
      mfaPending: true,
      isAuthenticated: false,
      mfaToken,
    })
  }

  const completeMfa = (token: string) => {
    setAuth({
      mfaPending: false,
      isAuthenticated: true,
      jwt: token,
    })
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    queryClient.clear();
    setAuth({ isAuthenticated: false, mfaPending: false })
  }

  return (
    <AuthContext.Provider value={{ auth, loginStarted, completeMfa, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
