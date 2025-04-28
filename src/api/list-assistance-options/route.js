async function handler() {
  const options = await sql`
    SELECT * FROM assistance_request_options 
    WHERE is_active = true 
    ORDER BY sort_order ASC
  `;

  return { options };
}
export async function POST(request) {
  return handler(await request.json());
}