async function handler() {
  const session = getSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const alerts = await sql`
    SELECT 
      ar.*, 
      creators.name as creator_name,
      acknowledgers.name as acknowledger_name,
      resolvers.name as resolver_name
    FROM assistance_requests ar
    LEFT JOIN auth_users creators ON ar.created_by = creators.id
    LEFT JOIN auth_users acknowledgers ON ar.acknowledged_by = acknowledgers.id
    LEFT JOIN auth_users resolvers ON ar.resolved_by = resolvers.id
    WHERE ar.type = 'sos'
    AND ar.status = 'pending'
    AND ar.created_at > NOW() - INTERVAL '24 hours'
    ORDER BY ar.created_at DESC
  `;

  return alerts;
}
export async function POST(request) {
  return handler(await request.json());
}