import { getSession } from "@auth0/nextjs-auth0";

export default async function Home() {
  const session = await getSession();

  if (!session || !session.user) {
    return (
      <div>
        <p>You are not logged in.</p>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/api/auth/login">Login</a>
      </div>
    );
  }

  const { user } = session;

  console.log(user);

  return (
    <div>
      <p>
        Welcome {user.name}!{/* IMORTANT DO NOT USE Link component */}
        {/* https://community.auth0.com/t/logging-out-completely/118940/4 */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/api/auth/logout">Logout</a>
      </p>
    </div>
  );
}
