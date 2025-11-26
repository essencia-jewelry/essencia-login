// middleware.ts
export { default } from "next-auth/middleware";

// Itt mondjuk meg, mely útvonalakat védje a NextAuth middleware.
export const config = {
  matcher: [
    "/orders",        
    "/profile",
    "/settings",
    "/password",
  ],
};
