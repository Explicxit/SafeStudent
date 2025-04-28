async function handler({ id }) {
  if (!id) {
    return { error: "Missing tip ID" };
  }

  const result = await sql`
    UPDATE wellbeing_tips 
    SET deleted_at = CURRENT_TIMESTAMP 
    WHERE id = ${id} 
    RETURNING *`;

  if (result.length === 0) {
    return { error: "Tip not found" };
  }

  return result[0];
}
export async function POST(request) {
  return handler(await request.json());
}