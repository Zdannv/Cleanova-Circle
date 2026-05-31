import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "../../../../lib/prisma"; // Adjust relative path since @/ might not be configured as expected

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Phone-Email / Password",
      credentials: {
        phone: { label: "Phone or Email", type: "text", placeholder: "08123456789 atau email@anda.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          throw new Error("Phone/Email dan Password wajib diisi");
        }

        // Identifier bisa berupa nomor telepon ATAU email (untuk user self-register).
        const identifier = credentials.phone.trim();
        const isEmail = identifier.includes("@");

        const user = await prisma.user.findUnique({
          where: isEmail
            ? { email: identifier.toLowerCase() }
            : { phone: identifier },
        });

        if (!user) {
          throw new Error("User not found");
        }

        // Validasi password.
        if (user.password) {
          // Password tersimpan bisa berupa hash bcrypt (self-register) atau
          // plaintext (data lama dari admin). Tangani keduanya.
          const looksHashed = /^\$2[aby]\$/.test(user.password);
          const valid = looksHashed
            ? await bcrypt.compare(credentials.password, user.password)
            : credentials.password === user.password;
          if (!valid) {
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
    async jwt({ token, user, trigger, session }: { token: any; user?: any; trigger?: string; session?: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.avatar = user.avatar;
      }
      if (trigger === "update" && session) {
        if (session.avatar) token.avatar = session.avatar;
        if (session.name) token.name = session.name;
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
