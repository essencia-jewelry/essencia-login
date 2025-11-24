import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

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
    }),
    // később ide jöhet majd egy CredentialsProvider is (email/jelszó)
  ],

  callbacks: {
    async redirect({ url, baseUrl }) {
      // Ha Shopify-ra mutat, engedjük:
      if (url.startsWith("https://essenciastore.com")) {
        return url;
      }

      // Relatív URL → maradjon az app domainen
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      // Biztonsági default
      return baseUrl;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
