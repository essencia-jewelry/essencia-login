import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    // Itt döntjük el, sikeres login után hova mehet a user
    async redirect({ url, baseUrl }) {
      // Ha a redirect URL az Essencia Shopify domainre mutat, engedjük
      if (url.startsWith("https://essenciastore.com")) {
        return url;
      }

      // Ha relatív URL (pl. /valami), akkor maradjon az app domainen
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      // Biztonsági alapértelmezett: menjen vissza az app főoldalára
      return baseUrl;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
