async function handler() {
  const session = getSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const isAdmin = await sql`
    SELECT is_admin FROM auth_users WHERE id = ${session.user.id}
  `;

  if (!isAdmin?.[0]?.is_admin) {
    throw new Error("Unauthorized - Admin access required");
  }

  const [sosRequests, assistanceRequests] = await sql.transaction([
    sql`
      SELECT COUNT(*) as count 
      FROM assistance_requests 
      WHERE type = 'sos' AND status != 'resolved'
    `,
    sql`
      SELECT COUNT(*) as count 
      FROM assistance_requests 
      WHERE type = 'assistance' AND status = 'pending'
    `,
  ]);

  return {
    activeSosCount: parseInt(sosRequests[0].count),
    pendingAssistanceCount: parseInt(assistanceRequests[0].count),
  };
}
export async function POST(request) {
  return handler(await request.json());
}