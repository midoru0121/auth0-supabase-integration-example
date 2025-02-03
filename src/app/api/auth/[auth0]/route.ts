import {
  AfterCallbackAppRoute,
  handleAuth,
  handleCallback,
  handleLogout,
  Session,
} from "@auth0/nextjs-auth0";
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

// Auth0のコールバック後に実行される関数
const afterCallback: AfterCallbackAppRoute = async (
  req: NextRequest,
  session: Session
) => {
  // Auth0でユーザーにアサインされているロールを取得する。カンマ区切り
  const userRoles =
    session?.user["https://auth0-supabase-interation-example.com/roles"];

  // Supabase認証用のJWTトークンのペイロードを作成
  const supabaseJWTPayload = {
    userRoles: userRoles.split(","),
    userId: session.user.sub,
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  };

  // 環境変数のチェック
  if (!process.env.SUPABASE_JWT_SECRET) {
    throw new Error("SUPABASE_JWT_SECRET not set");
  }

  session.supabaseAccessTokenExpiredAt = supabaseJWTPayload.exp;

  // JWTトークンを生成してセッションに追加。Supabaseの認証に用いる。
  session.user.supabaseAccessToken = jwt.sign(
    supabaseJWTPayload,
    process.env.SUPABASE_JWT_SECRET
  );
  // Auth0から取得したユーザーロールとIDを使用してJWTトークンを生成
  // トークンの有効期限は1時間
  // 生成したトークンはSupabaseの認証に使用される

  return session;
};

// Auth0の認証ハンドラー
export const GET = handleAuth({
  // コールバック処理
  async callback(req: NextApiRequest, res: NextApiResponse) {
    try {
      const response = await handleCallback(req, res, {
        afterCallback,
      });
      return response;
    } catch (error) {
      // エラーハンドリング
      if (error instanceof Error) {
        return new Response(error.message, { status: 500 });
      }
      return new Response("An unknown error occurred.", { status: 500 });
    }
  },
  // ログアウト処理
  logout: handleLogout({
    returnTo: "/",
  }),
});
