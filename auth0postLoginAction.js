/**
 * Handler that will be called during the execution of a PostLogin flow.
 * ログイン後の処理を実行するハンドラー
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 *                     - ユーザーとログインコンテキストの詳細情報
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 *                          - ログイン動作を変更するためのメソッドを持つインターフェース
 */
exports.onExecutePostLogin = async (event, api) => {
  // Axiosをインポート

  const axios = require("axios").default;

  // Auth0 Management APIクライアントをインポート

  const { ManagementClient } = require("auth0");

  // カスタムクレーム用の名前空間を定義
  const roleNamespace = "https://auth0-supabase-interation-example.com/roles";

  // ユーザーが既にロールを持っている場合は処理を終了
  if (
    event.authorization &&
    event.authorization.roles &&
    event.authorization.roles.length > 0
  ) {
    console.log("This user have roles.");
    // 既存のロールをカスタムクレームとして設定
    const roles = event.authorization.roles.join(",");
    api.idToken.setCustomClaim(roleNamespace, roles);

    return;
  }

  try {
    // Management API用のアクセストークンを取得
    const options = {
      method: "POST",
      url: `https://${event.secrets.DOMAIN}/oauth/token`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: event.secrets.CLIENT_ID,
        client_secret: event.secrets.CLIENT_SECRET,
        audience: `https://${event.secrets.DOMAIN}/api/v2/`,
        scope: "read:roles update:users",
      }),
    };

    const response = await axios.request(options);

    // Management APIクライアントを初期化
    const management = new ManagementClient({
      domain: event.secrets.DOMAIN,
      token: response.data.access_token,
    });

    // ユーザーにロールを割り当て
    const params = { id: event.user.user_id };
    const data = { roles: [event.secrets.DEFAULT_ROLE_ID] };

    await management.users.assignRoles(params, data);

    // APIからロールの詳細情報を取得
    const roleResponse = await axios.get(
      `https://${event.secrets.DOMAIN}/api/v2/roles/${event.secrets.DEFAULT_ROLE_ID}`,
      {
        headers: {
          Authorization: `Bearer ${response.data.access_token}`,
        },
      }
    );
    // ユーザーのロール名をIDトークンのカスタムクレームとして設定
    api.idToken.setCustomClaim(roleNamespace, roleResponse.data.name);

    console.log("Success");
  } catch (e) {
    // エラーをログに出力
    console.log(e);
  }
};
