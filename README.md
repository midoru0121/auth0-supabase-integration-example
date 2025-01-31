## Getting Started

### 1: Set up an Auth0.

## App Settings

From the Auth0 dashboard, click the menu to the right of the Auth0 logo, and select Create tenant.

Select a Region - JP.

Select Development Tag.

Create your application. Select the `Regular Web Applications` option and click Create.

Select `Settings` and navigate to the Application URIs section, and update the following:

![Image](https://github.com/user-attachments/assets/06465bbf-7b3a-4334-836e-c9bf1bc054cd)

Allowed Callback URLs: `http://localhost:3000/api/auth/callback`
Allowed Logout URLs: `http://localhost:3000`

Select OAuth and set JSON Web Token Signature to `RS256`.

![Image](https://github.com/user-attachments/assets/644b5421-12aa-4583-853f-28940824ff17)
![Image](https://github.com/user-attachments/assets/05f17c99-4447-46a3-9816-57333af1aafb)
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
