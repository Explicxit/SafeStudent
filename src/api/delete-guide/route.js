async function handler({ id }) {
  if (!id) {
    return { error: "Missing guide ID" };
  }

  const result = await sql`
    UPDATE first_aid_guides 
    SET deleted_at = CURRENT_TIMESTAMP 
    WHERE id = ${id} 
    RETURNING *`;

  if (result.length === 0) {
    return { error: "Guide not found" };
  }

  return result[0];
}
export async function POST(request) {
  return handler(await request.json());
}