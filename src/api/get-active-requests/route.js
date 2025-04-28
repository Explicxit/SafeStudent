async function handler() {
  const session = getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const requests = await sql`
      SELECT 
        ar.*,
        cu.name as created_by_name,
        au.name as acknowledged_by_name,
        ru.name as resolved_by_name
      FROM assistance_requests ar
      LEFT JOIN auth_users cu ON ar.created_by = cu.id
      LEFT JOIN auth_users au ON ar.acknowledged_by = au.id
      LEFT JOIN auth_users ru ON ar.resolved_by = ru.id
      WHERE ar.status != 'resolved'
      ORDER BY ar.created_at DESC
    `;

    const sosRequests = requests.filter((r) => r.type === "sos");
    const assistanceRequests = requests.filter((r) => r.type === "assistance");

    return {
      sos: sosRequests,
      assistance: assistanceRequests,
    };
  } catch (error) {
    return { error: "Failed to fetch active requests" };
  }
}
export async function POST(request) {
  return handler(await request.json());
}