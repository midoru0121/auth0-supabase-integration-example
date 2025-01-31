// Auth0のミドルウェアを使用して認証を必要とするルートを保護
import { withMiddlewareAuthRequired } from "@auth0/nextjs-auth0/edge";

export default withMiddlewareAuthRequired();

// protectedで始まるパスすべてに対してミドルウェアを適用
export const config = {
  matcher: "/protected/:path*",
};
