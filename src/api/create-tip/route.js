async function handler({ tip, category }) {
  if (!tip || !category) {
    return { error: "Missing required fields" };
  }

  const result = await sql`
    INSERT INTO wellbeing_tips (tip, category) 
    VALUES (${tip}, ${category}) 
    RETURNING *
  `;

  return result[0];
}
export async function POST(request) {
  return handler(await request.json());
}