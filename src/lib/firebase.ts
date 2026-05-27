import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'

// Guard: Firebase must only initialize on the client with real env vars.
// During SSG/build the env vars are empty, so we skip initialization.
function createFirebaseAuth(): Auth | null {
  if (typeof window === 'undefined') return null           // SSR/build — skip
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  if (!apiKey) return null                                 // env vars not set

  const config = {
    apiKey,
    authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  }

  const app: FirebaseApp = getApps().length === 0 ? initializeApp(config) : getApps()[0]
  return getAuth(app)
}

// Export a getter so it's always evaluated lazily at call-time (never at import time)
export function getFirebaseAuth(): Auth {
  const a = createFirebaseAuth()
  if (!a) throw new Error('Firebase Auth is not available. Check NEXT_PUBLIC_FIREBASE_* env vars.')
  return a
}
