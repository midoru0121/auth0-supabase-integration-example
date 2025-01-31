## Getting Started

### 1: Set up an Auth0.

## App Settings

From the Auth0 dashboard, click the menu to the right of the Auth0 logo, and select Create tenant.

Select a Region - JP.

Select Development Tag.

Create your application. Select the `Regular Web Applications` option and click Create.

Select `Settings` and navigate to the Application URIs section, and update the following:

![Image](https://github.com/user-attachments/assets/06465bbf-7b3a-4334-836e-c9bf1bc054cd)

Copy Domain, Client Id, Client Secret! We use these data later.

![Image](https://github.com/user-attachments/assets/644b5421-12aa-4583-853f-28940824ff17)

Set Allowed Callback URLs: `http://localhost:3000/api/auth/callback`
Set Allowed Logout URLs: `http://localhost:3000`

![Image](https://github.com/user-attachments/assets/05f17c99-4447-46a3-9816-57333af1aafb)

Select OAuth and set JSON Web Token Signature to `RS256`.

![Image](https://github.com/user-attachments/assets/59f1898e-18ef-47cc-a173-9b0ed2b6c803)

## Auth0 Management API Settings

Select Auth0 Management API and select `Machine to Machine Applications` and check Authrozed button. And Open Cheveron.

![MachineToMachineApplications](https://github.com/user-attachments/assets/5dd3d72b-53fc-469e-ba5e-0e8bdb4e7b93)

![SelectAuth0ManagementAPI](https://github.com/user-attachments/assets/91b68db3-4d99-4cca-8628-40c67225a69d)

Add `read:users` and `update:users` permissions then update.

![permissions](https://github.com/user-attachments/assets/0761dd70-b93b-401f-8bed-b08aabe6bfce)

## Create an user role

Select Roles and create `Autenticated` role.

![IcreateRole1](https://github.com/user-attachments/assets/516318f3-3ff7-4528-9b0b-c0bf3f375cd3)

![IcreateRole2](https://github.com/user-attachments/assets/31872540-82d5-4527-b526-af33a1f21b00)

And copy Role ID. We use this id later.

![createRole3](https://github.com/user-attachments/assets/15639ae2-9c48-41ce-90b3-11e3fdcd74d6)

## Setting up Auth0 Post Login Action.

After user login, we assign the user add default assig role. So let's set up `Post Login Action`.

Select Actions => Triggers and choose post-login. And choose `Build from scratch`.

![CreateAction](https://github.com/user-attachments/assets/6ad9758a-3601-4017-be23-1f6126e0e2a1)

![CreateAction2](https://github.com/user-attachments/assets/af677761-be0a-4d67-8104-6957e3fab4fc)

![CreateAction3](https://github.com/user-attachments/assets/7809b2d4-755f-4c4d-ac36-01a10d02726a)

![CreateAction4](https://github.com/user-attachments/assets/e2082079-6b8c-48df-a2e1-4c458687fb9d)

Add Secrets `DOMAIN` . `CLIENT_SECRET`, `CLIENT_ID` by selecting secrets.

![CreateAction5](https://github.com/user-attachments/assets/c4ff31d2-a28e-48ba-ae40-3548cbb39898)

Add dependency `auth0` and `axios`

![CreateAction6](https://github.com/user-attachments/assets/0d247593-1a5e-4896-993c-b685165c109f)

Set up post login. Replace YOUR_ROLE_ID to real role id.

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

### 2: Creating a Supabase project

![Image](https://github.com/user-attachments/assets/b035bdd9-597d-4497-8342-c81cc8467ad5)

![jwt](https://github.com/user-attachments/assets/a8ada4bb-a8e5-42f9-b056-8c16e341c645)

### 3 Run this application

Copy `.env.local.example` to `.env.local`.

```bash

# Use the output of the following command as the value for AUTH0_SECRET.
# node -e "console.log(crypto.randomBytes(32).toString('hex'))"
# > https://github.com/auth0/nextjs-auth0
AUTH0_SECRET=any-secure-value

# You can find Auth0 values in the Settings section under Basic Information for your application.
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://<name-of-your-tenant>.<region-you-selected>.auth0.com
AUTH0_CLIENT_ID=get-from-auth0-dashboard
AUTH0_CLIENT_SECRET=get-from-auth0-dashboard

# You can find the Supabase values under Settings > API for your project.
NEXT_PUBLIC_SUPABASE_URL=get-from-supabase-dashboard
NEXT_PUBLIC_SUPABASE_ANON_KEY=get-from-supabase-dashboard
SUPABASE_JWT_SECRET=get-from-supabase-dashboard
```

https://auth0.com/blog/assign-default-role-on-sign-up-with-actions/

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
