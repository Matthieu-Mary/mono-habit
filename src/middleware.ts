import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/login",
  },
});

export const config = {
  matcher: [
    // Routes qui nécessitent une authentification
    "/dashboard/:path*",
    "/habits/:path*",
  ],
};
