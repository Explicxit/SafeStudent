async function handler({ id }) {
  if (!id) {
    return { error: "Option ID is required" };
  }

  try {
    const [option] = await sql(
      "UPDATE assistance_request_options SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [id]
    );

    if (!option) {
      return { error: "Assistance option not found" };
    }

    return { option };
  } catch (error) {
    return { error: "Failed to delete assistance option" };
  }
}
export async function POST(request) {
  return handler(await request.json());
}