import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  useAuth as useClerkAuth,
  useUser as useClerkUser,
} from '@clerk/clerk-react'

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const hasClerkKey = CLERK_KEY?.startsWith('pk_') && !CLERK_KEY.includes('xxx')

export { SignInButton, SignUpButton }

export function useAuth() {
  return useClerkAuth()
}

export function useUser() {
  return useClerkUser()
}

export default function AuthProvider({ children }) {
  if (!hasClerkKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 text-center dark:bg-slate-900">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Clerk configuration required</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Set VITE_CLERK_PUBLISHABLE_KEY in frontend/.env and restart the frontend.</p>
        </div>
      </div>
    )
  }

  return (
    <ClerkProvider publishableKey={CLERK_KEY}>
      {children}
    </ClerkProvider>
  )
}
