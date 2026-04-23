import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "../../../../lib/prisma"; // Adjust relative path since @/ might not be configured as expected

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Phone / Temporary Password",
      credentials: {
        phone: { label: "Phone Number", type: "text", placeholder: "e.g., 08123456789" },
        password: { label: "Temporary Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          throw new Error("Phone and Password are required");
        }

        const user = await prisma.user.findUnique({
          where: { phone: credentials.phone }
        });

        if (!user) {
          throw new Error("User not found");
        }

        // Validate Password 
        if (user.password) {
          if (credentials.password !== user.password) {
            throw new Error("Invalid password");
          }
        } else {
          const validPassword = process.env.TEMP_PASSWORD || "cleanova2026";
          if (credentials.password !== validPassword) {
            throw new Error("Invalid password");
          }
        }



        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.avatar = user.avatar;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        if (session.user) {
          session.user.id = token.id as string;
          session.user.role = token.role as string;
          session.user.avatar = token.avatar as string;
        }
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET || "cleanovasupersecret",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
