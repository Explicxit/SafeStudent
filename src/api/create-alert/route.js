async function handler({ title, message, severity = "low" }) {
  try {
    const session = getSession();
    if (!session?.user) {
      return { error: "Authentication required" };
    }

    const [adminCheck] = await sql(
      "SELECT is_admin FROM auth_users WHERE id = $1",
      [session.user.id]
    );

    if (!adminCheck?.is_admin) {
      return { error: "Admin access required" };
    }

    if (!title?.trim() || !message?.trim()) {
      return { error: "Title and message are required" };
    }

    if (!["low", "medium", "high"].includes(severity)) {
      return { error: "Severity must be low, medium, or high" };
    }

    if (title.length > 200) {
      return { error: "Title must be less than 200 characters" };
    }

    if (message.length > 1000) {
      return { error: "Message must be less than 1000 characters" };
    }

    const [alert] = await sql(
      "INSERT INTO emergency_alerts (title, message, severity) VALUES ($1, $2, $3) RETURNING *",
      [title, message, severity]
    );

    if (!alert) {
      return { error: "Failed to create alert" };
    }

    return {
      success: true,
      alert,
    };
  } catch (error) {
    return {
      error: "Internal server error",
      details: error.message,
    };
  }
}
export async function POST(request) {
  return handler(await request.json());
}