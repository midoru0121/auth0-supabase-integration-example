## Getting Started

### 1: Create an Auth0 tenant.

From the Auth0 dashboard, click the menu to the right of the Auth0 logo, and select Create tenant.

Select a Region - JP.

Select Development Tag.

Create your application. Select the `Regular Web Applications` option and click Create.

Select Settings and navigate to the Application URIs section, and update the following:

Allowed Callback URLs: `http://localhost:3000/api/auth/callback`
Allowed Logout URLs: `http://localhost:3000`

Select OAuth and set JSON Web Token Signature to `RS256`.
![Image](https://github.com/user-attachments/assets/644b5421-12aa-4583-853f-28940824ff17)
![Image](https://github.com/user-attachments/assets/05f17c99-4447-46a3-9816-57333af1aafb)
![Image](https://github.com/user-attachments/assets/59f1898e-18ef-47cc-a173-9b0ed2b6c803)

Add Auth0

### 2: Creating a Supabase project

![Image](https://github.com/user-attachments/assets/b035bdd9-597d-4497-8342-c81cc8467ad5)

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
