async function handler() {
  const [tip] =
    await sql`SELECT * FROM wellbeing_tips ORDER BY RANDOM() LIMIT 1`;
  return tip;
}
export async function POST(request) {
  return handler(await request.json());
}