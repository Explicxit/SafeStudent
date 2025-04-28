async function handler({
  label,
  category,
  urgency = "normal",
  sort_order = 0,
}) {
  if (!label || !category) {
    return { error: "Label and category are required" };
  }

  if (
    ![
      "Student Assistance",
      "Teacher Assistance",
      "Student/Teacher Assistance",
      "Other",
    ].includes(category)
  ) {
    return { error: "Invalid category" };
  }

  if (!["urgent", "normal"].includes(urgency)) {
    return { error: "Invalid urgency level" };
  }

  try {
    const [option] = await sql`
      INSERT INTO assistance_request_options 
      (label, category, urgency, sort_order)
      VALUES 
      (${label}, ${category}, ${urgency}, ${sort_order})
      RETURNING *
    `;

    return { option };
  } catch (error) {
    return { error: "Failed to create assistance option" };
  }
}
export async function POST(request) {
  return handler(await request.json());
}