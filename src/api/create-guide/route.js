async function handler({
  title,
  content,
  category,
  steps = [],
  tag = "General",
}) {
  if (!title || !content || !category) {
    return { error: "Missing required fields" };
  }

  const session = getSession();
  const userId = session?.user?.id;

  const result = await sql`
    INSERT INTO first_aid_guides 
    (title, content, category, steps, tag, created_by) 
    VALUES (${title}, ${content}, ${category}, ${JSON.stringify(
    steps
  )}, ${tag}, ${userId})
    RETURNING *
  `;

  return result[0];
}
export async function POST(request) {
  return handler(await request.json());
}