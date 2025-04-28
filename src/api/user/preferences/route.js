async function handler() {
  const session = getSession();
  if (!session?.user?.id) return null;

  const prefs = await sql`
    SELECT * FROM user_preferences 
    WHERE user_id = ${session.user.id}`;
  return prefs[0];
}
export async function POST(request) {
  return handler(await request.json());
}