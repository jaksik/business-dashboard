//
// This is your updated authOptions configuration
//

import { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // 1. ADD AUTHORIZATION SCOPE FOR YOUTUBE
      authorization: {
        params: {
          scope:
            'openid email profile https://www.googleapis.com/auth/youtube.readonly',
        },
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user }) {
      // Only allow your specific email (this is unchanged)
      if (user.email === process.env.AUTHORIZED_EMAIL) {
        return true
      }
      return false
    },
    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after successful sign in (this is unchanged)
      if (url.startsWith('/')) return `${baseUrl}/dashboard`
      else if (new URL(url).origin === baseUrl) return `${baseUrl}/dashboard`
      return baseUrl
    },

    // 2. PERSIST THE ACCESS TOKEN TO BE USED FOR API CALLS
    async jwt({ token, account }) {
      // The 'account' object is only available on the initial sign-in.
      // We are saving the access_token and refresh_token to the JWT.
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      // We are sending the accessToken to the client-side session object.
      // This allows you to access it in your components and API routes.
      // Note: A type definition might be needed to avoid TypeScript errors on session.accessToken
      session.accessToken = token.accessToken as string 
      return session
    },
  },
}