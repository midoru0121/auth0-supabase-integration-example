// Auth0のミドルウェアを使用して認証を必要とするルートを保護
import {
  getSession,
  withMiddlewareAuthRequired,
} from "@auth0/nextjs-auth0/edge";

const AUTH0_LOGOUT_URL = "/api/auth/logout";

import { NextResponse } from "next/server";

export default withMiddlewareAuthRequired(async function middleware(req) {
  try {
    // レスポンスオブジェクトを作成
    const res = NextResponse.next();
    // セッション情報を取得
    const session = await getSession(req, res);

    // セッションが存在しない場合、ログアウトURLにリダイレクト
    if (!session) {
      return NextResponse.redirect(new URL(AUTH0_LOGOUT_URL, req.url));
    }

    // Supabaseトークンの有効期限をチェック（現在時刻 + 1時間 > トークン期限）
    const isSupabaseTokenExpired =
      Math.floor(Date.now() / 1000) > session.supabaseAccessTokenExpiredAt;

    // Supabaseのトークンが期限切れの場合、ログアウトURLにリダイレクト
    if (isSupabaseTokenExpired) {
      return NextResponse.redirect(new URL(AUTH0_LOGOUT_URL, req.url));
    }

    // 問題なければ元のレスポンスを返す
    return res;
  } catch (error) {
    // エラーが発生した場合はエラーページにリダイレクト
    console.error("Middleware error:", error);
    throw error;
  }
});

// protectedで始まるパスすべてに対してミドルウェアを適用
export const config = {
  matcher: "/protected/:path*",
};
