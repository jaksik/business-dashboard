import { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user }) {
      // Only allow your specific email
      if (user.email === process.env.AUTHORIZED_EMAIL) {
        return true
      }
      return false
    },
    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after successful sign in
      if (url.startsWith('/')) return `${baseUrl}/dashboard`
      else if (new URL(url).origin === baseUrl) return `${baseUrl}/dashboard`
      return baseUrl
    },
    async session({ session }) {
      return session
    },
    async jwt({ token }) {
      return token
    },
  },
}
