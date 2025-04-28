async function handler({ name, user_type, grade, section }) {
  const session = getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  if (!name || name.trim().length < 2) {
    return { error: "Name is required and must be at least 2 characters" };
  }

  if (!user_type || !["student", "teacher", "staff"].includes(user_type)) {
    return {
      error: "Valid user type (student, teacher, or staff) is required",
    };
  }

  if (user_type === "student" && !grade) {
    return { error: "Grade is required for students" };
  }

  const values = [
    name.trim(),
    user_type,
    session.user.id,
    grade || null,
    section || null,
  ];

  try {
    const [user] = await sql(
      `UPDATE auth_users 
       SET name = $1,
           user_type = $2,
           grade = $4,
           section = $5,
           has_completed_profile = true
       WHERE id = $3
       RETURNING *`,
      values
    );

    if (!user) {
      return { error: "User not found" };
    }

    return { user };
  } catch (error) {
    return { error: "Failed to update profile" };
  }
}
export async function POST(request) {
  return handler(await request.json());
}