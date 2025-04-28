async function handler({ id }) {
  if (!id) {
    return { error: "Missing alert ID" };
  }

  const [deletedAlert] = await sql`
    UPDATE emergency_alerts 
    SET deleted_at = CURRENT_TIMESTAMP 
    WHERE id = ${id} 
    RETURNING *
  `;

  if (!deletedAlert) {
    return { error: "Alert not found" };
  }

  return { success: true, alert: deletedAlert };
}
export async function POST(request) {
  return handler(await request.json());
}