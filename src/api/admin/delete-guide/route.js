async function handler({ id }) {
  await sql`DELETE FROM first_aid_guides WHERE id = ${id}`;
  return { success: true };
}
export async function POST(request) {
  return handler(await request.json());
}