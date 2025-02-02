import { getSession } from "@auth0/nextjs-auth0";
import { getSupabase } from "../utils/supabase";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  // ユーザーセッションを取得
  const session = await getSession();

  // セッションまたはユーザーが存在しない場合、ホームにリダイレクト
  if (!session || !session.user) {
    redirect("/");
  }

  // Supabaseアクセストークンの確認
  if (!session.user.supabaseAccessToken) {
    throw new Error("No supabaseAccessToken");
  }

  // Supabaseクライアントの初期化
  const supabase = getSupabase(session.user.supabaseAccessToken);
  // データベースからすべてのTodoを取得
  const { data, error } = await supabase.from("todo").select("*");

  // エラーハンドリング
  if (error) {
    // エラーをログに出力
    console.log(error);

    // SupabaseのJWTが有効期限切れの場合、Auth0からもログアウトさせる。
    if ("JWT expired" === error.message) {
      redirect("/api/auth/logout");
    }

    // その他のエラーをスロー
    throw new Error(error?.message);
  }

  // データが存在しない場合のメッセージを返す
  if (!data) {
    return "No data";
  }

  // Todoリストをレンダリング
  return (
    <ul>
      {data.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}
