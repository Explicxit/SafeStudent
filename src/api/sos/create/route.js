async function handler() {
  const session = getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const [sosAlert] = await sql.transaction([
    sql`
      INSERT INTO sos_alerts (created_by) 
      VALUES (${session.user.id}) 
      RETURNING *
    `,
    sql`
      INSERT INTO emergency_alerts (title, message, severity)
      VALUES ('SOS ALERT', '🚨 EMERGENCY: SOS Signal Received!', 'high')
    `,
  ]);

  return sosAlert[0];
}
export async function POST(request) {
  return handler(await request.json());
}