async function handler({ id }) {
  try {
    if (!id) {
      return { error: "Contact ID is required" };
    }

    const [deletedContact] = await sql(
      `UPDATE emergency_contacts 
       SET deleted_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [id]
    );

    if (!deletedContact) {
      return { error: "Contact not found" };
    }

    return { success: true, contact: deletedContact };
  } catch (error) {
    console.error("Error deleting contact:", error);
    return { error: "Failed to delete contact" };
  }
}
export async function POST(request) {
  return handler(await request.json());
}