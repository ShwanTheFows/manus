import { prisma } from "./prisma"
import { compare } from "bcrypt"
import { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

// Type for the user object returned by authorize
type AuthUser = {
  id: string
  email: string
  name: string
  city: string | null
  academicyear: string | null
  isadmin: boolean
  randomKey: string
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/auth",
    signOut: "/auth",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Sign in",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "your@email.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            password: true,
            firstname: true,
            lastname: true,
            city: true,
            academicyear: true,
            isadmin: true,
          },
        })

        if (!user) {
          console.log("User not found")
          return null
        }

        // Compare entered password with hashed password
        const isPasswordValid = await compare(credentials.password, user.password)
        if (!isPasswordValid) {
          console.log("Invalid password")
          return null
        }

        console.log("User authenticated:", user)

        // Return safe user object
        const safeUser: AuthUser = {
          id: user.id.toString(),
          email: user.email,
          name: `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim(),
          city: user.city,
          academicyear: user.academicyear,
          isadmin: user.isadmin,
          randomKey: "Hey cool",
        }

        return safeUser
      },
    }),
  ],
  callbacks: {
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          city: token.city as string | null,
          academicyear: token.academicyear as string | null,
          isadmin: token.isadmin as boolean,
          randomKey: token.randomKey as string,
        },
      }
    },
    jwt: ({ token, user }) => {
      if (user) {
        const u = user as AuthUser
        return {
          ...token,
          id: u.id,
          email: u.email,
          name: u.name,
          city: u.city,
          academicyear: u.academicyear,
          isadmin: u.isadmin,
          randomKey: u.randomKey,
        }
      }
      return token
    },
  },
}
