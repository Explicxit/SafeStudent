async function handler() {
  try {
    const guides = await sql`
      SELECT 
        id,
        title,
        category,
        tag,
        steps,
        'Click to view detailed steps' as action_text
      FROM first_aid_guides 
      ORDER BY category, title
    `;

    return guides;
  } catch (error) {
    return {
      error: "Failed to fetch first aid guides",
      details: error.message,
    };
  }
}
export async function POST(request) {
  return handler(await request.json());
}