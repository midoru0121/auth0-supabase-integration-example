[英語](https://github.com/midoru0121/auth0-supabase-integration-example/blob/main/README.md)

# nextjs-auth0-supabase-integration-example

## Auth0の設定

### Auth0アプリケーションの作成

Auth0に登録後、アプリケーションを作成して、 `Regular Web Applications` を選択して、作成します。

`Settings` をクリックして、設定に移動します。

![Image](https://github.com/user-attachments/assets/06465bbf-7b3a-4334-836e-c9bf1bc054cd)

`Domain`, `Client Id`, `Client Secret` を書き留めておきます。これらは後で使用します。

![Image](https://github.com/user-attachments/assets/644b5421-12aa-4583-853f-28940824ff17)

Allowed Callback URLsに `http://localhost:3000/api/auth/callback` を設定します。
Allowed Logout URLsに `http://localhost:3000` を設定します。

![Image](https://github.com/user-attachments/assets/05f17c99-4447-46a3-9816-57333af1aafb)

そして、OAuth and set JSON Web Token Signature を `RS256` に設定します。

![Image](https://github.com/user-attachments/assets/59f1898e-18ef-47cc-a173-9b0ed2b6c803)

`Connection` に移動して、 `google-oauth-2` を設定して、Googleアカウントでサインアップできるようにします。

![googleOAuthConnection](https://github.com/user-attachments/assets/28683d31-91ee-4f2b-a41e-75044644a713)

### Auth0 Management APIの設定

Auth0 Management APIを選択し、`Machine to Machine Applications`を選択して、`Authrozedボタン` をチェックします。そして詳細を開きます。

![MachineToMachineApplications](https://github.com/user-attachments/assets/20cfbfd0-c189-444e-9cd8-fc492f2c7149)

![SelectAuth0ManagementAPI](https://github.com/user-attachments/assets/91b68db3-4d99-4cca-8628-40c67225a69d)

`read:users`, `update:users`, `read:roles` 権限をPermissionとして追加します。

![permissions](https://github.com/user-attachments/assets/0761dd70-b93b-401f-8bed-b08aabe6bfce)

### Roleを作成する

`Roles` をクリックして `Autenticated` ロールを作成します。これをデフォルトのロールとしてユーザーにアサインするようにします。

![IcreateRole1](https://github.com/user-attachments/assets/516318f3-3ff7-4528-9b0b-c0bf3f375cd3)

![IcreateRole2](https://github.com/user-attachments/assets/31872540-82d5-4527-b526-af33a1f21b00)

作成した `Authenticated` ロールの `Role ID` を書き留めておきます。後ほど使います。

![createRole3](https://github.com/user-attachments/assets/15639ae2-9c48-41ce-90b3-11e3fdcd74d6)

## Setting up Auth0 Post Login Action.

ユーザーのログイン時に、デフォルトロールを付与するために `Post Login Action` を設定します。

`Actions` の `Triggers` を選択、 `post-login` をクリックします。

![CreateAction](https://github.com/user-attachments/assets/6ad9758a-3601-4017-be23-1f6126e0e2a1)

メニューから `Build from scratch` を選択します。

![CreateAction2](https://github.com/user-attachments/assets/af677761-be0a-4d67-8104-6957e3fab4fc)

Actionを命名して `Create` をクリックします。

![CreateAction3](https://github.com/user-attachments/assets/7809b2d4-755f-4c4d-ac36-01a10d02726a)

`Secrets` を選択して、`DOMAIN`、`CLIENT_SECRET`、`CLIENT_ID`、 `DEFAULT_ROLE_ID` を追加します。

`DOMAIN`、`CLIENT_SECRET`、`CLIENT_ID`はアプリケーションの設定画面から参照できます。`DEFAULT_ROLE_ID` は先程作った、 `Authenticated` ロールのIDです。

![CreateAction5](https://github.com/user-attachments/assets/c4ff31d2-a28e-48ba-ae40-3548cbb39898)

`Dependencies` をクリックして `auth0` と `axios` を追加します。

下記のコードを貼り付けます。

```javascript
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
    console.log("The user has roles.");
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
```

貼り付け終わったら、 `Deploy` をクリックします。

![CreateAction4](https://github.com/user-attachments/assets/e2082079-6b8c-48df-a2e1-4c458687fb9d)

先ほどの `post-login` の設定を開き、先ほど `Deploy` したアクションを `User Logged In` の直後にセットします。
これで、ユーザーがAuth0でログインしたときに、このアクションが走るようになり、すべてのユーザーに `Authenticated` ロールがアサインされるようになります。

![createAction7](https://github.com/user-attachments/assets/eb3e4872-4f25-4169-8902-8c2a16b8a79c)

### 2: Creating a Supabase project

Supabaseに登録後、 Settings -> API に移動して、 `Project URL` , `anon key` と `JWT_SECRET` を書き留めておきます。

![APISetting](https://github.com/user-attachments/assets/601509da-8834-4156-8106-c145defa5710)

![jwtsecret](https://github.com/user-attachments/assets/887a3b56-2f70-4dce-be12-e53b1bb52556)

`todoテーブル` を作成します。

![createTable](https://github.com/user-attachments/assets/d3f8d608-2219-4882-8340-2542a28d1810)

`title` (text型) カラムを追加して、 `Save` をクリックします。

![createTable2](https://github.com/user-attachments/assets/ffdaa8a1-4982-4589-a6a8-49024cea5946)

適当なデータを入れておきます。

![createTable3](https://github.com/user-attachments/assets/2fada978-8f2b-437b-b6c2-1948b2c3ee05)

todoテーブルのRLSポリシーを設定します。 `Auth0` で設定した `Authenticated` ロールを持たないユーザー以外からのデータ取得できないようにします。Next.jsからリクエストされたときのJWTをデコードして、 `userRoles` 配列の中に `Authenticated` が存在しないユーザからのリクエストを拒否します。

```sql
alter policy "JWT Authenticated can view todo"
on "public"."todo"
to public
using (
  ((auth.jwt() -> 'userRoles'::text) ? 'Authenticated'::text)
);
```

![jwt](https://github.com/user-attachments/assets/a8ada4bb-a8e5-42f9-b056-8c16e341c645)

`Save Policy` をクリックして、todo テーブルにRLSポリシーを適用します。

### 3 アプリの起動

`.env.local` ファイルを作成します。

```bash
# .env.local

# 下記のコマンドを叩いて作成されたシークレットを入力します。
# node -e "console.log(crypto.randomBytes(32).toString('hex'))"
# > この方法は https://github.com/auth0/nextjs-auth0 を参照しています。
AUTH0_SECRET=any-secure-value
AUTH0_BASE_URL=http://localhost:3000

# You can find Auth0 values in the Settings section under Basic Information for your application.
# The url of your Auth0 tenant domain
AUTH0_ISSUER_BASE_URL=https://<name-of-your-tenant>.<region-you-selected>.auth0.com
AUTH0_CLIENT_ID=get-from-auth0-dashboard
AUTH0_CLIENT_SECRET=get-from-auth0-dashboard

# You can find the Supabase values under Settings > API for your project.
NEXT_PUBLIC_SUPABASE_URL=get-from-supabase-dashboard
NEXT_PUBLIC_SUPABASE_ANON_KEY=get-from-supabase-dashboard
SUPABASE_JWT_SECRET=get-from-supabase-dashboard
```

起動して、 http://localhost:3000 にアクセスします。

```bash
pnpm dev
```

![Login](https://github.com/user-attachments/assets/60e18305-431b-4a82-943e-6f799b306b87)

`Login` をクリックして、メールアドレス認証、もしくはGoogle OAuthを使ってサインアップします。

http://localhost:3000/protected にアクセスします。このページにはAuth0でログインしていないとアクセスできないようになっています。

このページで先程、SupabaseのtodoテーブルにInsertしたデータが表示されれば、成功です。

![afterLogin](https://github.com/user-attachments/assets/0560986f-e037-42b9-8c84-3aaec014843a)
