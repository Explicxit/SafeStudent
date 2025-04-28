async function handler() {
  const session = getSession();
  if (!session?.user?.id) {
    return {
      isAdmin: false,
      userId: null,
      error: "Not authenticated",
    };
  }

  const [user] = await sql`
    SELECT id, is_admin, email, name
    FROM auth_users 
    WHERE id = ${session.user.id}
    AND deleted_at IS NULL
  `;

  if (!user) {
    return {
      isAdmin: false,
      userId: session.user.id,
      error: "User not found",
    };
  }

  return {
    isAdmin: user.is_admin || false,
    userId: user.id,
    email: user.email,
    name: user.name,
    error: null,
  };
}
export async function POST(request) {
  return handler(await request.json());
}