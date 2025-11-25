import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
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
      name: "Email és jelszó",
      // FONTOS: az id maradjon "credentials", így hívjuk a signIn-ben is
      id: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Jelszó", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;

        // 🔥 IDEIGLENES, DEMÓ LOGIKA:
        // EZZEL FOG MŰKÖDNI:
        // email:    teszt@essencia.local
        // jelszó:   Jelszo123
        if (email === "teszt@essencia.local" && password === "Jelszo123") {
          return {
            id: "demo-user-1",
            name: "Essencia Demo User",
            email,
          };
        }

        // Ha nem egyezik → sikertelen bejelentkezés
        return null;
      },
    }),
  ],

  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("https://essenciastore.com")) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
