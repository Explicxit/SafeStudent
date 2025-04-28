async function handler() {
  const alerts = await sql`
    SELECT * FROM emergency_alerts 
    ORDER BY timestamp DESC
  `;

  return alerts;
}
export async function POST(request) {
  return handler(await request.json());
}