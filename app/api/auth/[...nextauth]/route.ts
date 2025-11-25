import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
// @ts-ignore - Vercel TS nem talál típusokat bcrypt-hez, de a runtime működik
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      authorization: {
        params: {
          display: "popup",
        },
      },
    }),

    CredentialsProvider({
      name: "Email / telefon + jelszó",
      id: "credentials",
      credentials: {
        identifier: { label: "Email vagy telefonszám", type: "text" },
        password: { label: "Jelszó", type: "password" },
      },
      async authorize(credentials) {
        const rawIdentifier = credentials?.identifier ?? "";
        const password = credentials?.password ?? "";

        const identifier = rawIdentifier.trim();

        if (!identifier || !password) {
          return null;
        }

        let user = null;

        // Ha @ van benne → email, különben telefonszám
        if (identifier.includes("@")) {
          user = await prisma.user.findUnique({
            where: { email: identifier },
          });
        } else {
          const normalizedPhone = identifier.replace(/\s+/g, "");
          user = await prisma.user.findUnique({
            where: { phone: normalizedPhone },
          });
        }

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email ?? undefined,
          name: user.name ?? undefined,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("https://essenciastore.com")) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
