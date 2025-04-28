async function handler({
  id,
  label,
  category,
  urgency,
  sort_order,
  is_active,
}) {
  if (!id) {
    return { error: "Option ID is required" };
  }

  const validCategories = [
    "Student Assistance",
    "Teacher Assistance",
    "Student/Teacher Assistance",
    "Other",
  ];

  const validUrgencyLevels = ["urgent", "normal"];

  if (category && !validCategories.includes(category)) {
    return { error: "Invalid category" };
  }

  if (urgency && !validUrgencyLevels.includes(urgency)) {
    return { error: "Invalid urgency level" };
  }

  const updates = [];
  const values = [];
  let paramCounter = 1;

  if (label !== undefined) {
    updates.push(`label = $${paramCounter}`);
    values.push(label);
    paramCounter++;
  }

  if (category !== undefined) {
    updates.push(`category = $${paramCounter}`);
    values.push(category);
    paramCounter++;
  }

  if (urgency !== undefined) {
    updates.push(`urgency = $${paramCounter}`);
    values.push(urgency);
    paramCounter++;
  }

  if (sort_order !== undefined) {
    updates.push(`sort_order = $${paramCounter}`);
    values.push(sort_order);
    paramCounter++;
  }

  if (is_active !== undefined) {
    updates.push(`is_active = $${paramCounter}`);
    values.push(is_active);
    paramCounter++;
  }

  if (updates.length === 0) {
    return { error: "No fields to update" };
  }

  values.push(id);
  const updateQuery = `
    UPDATE assistance_request_options 
    SET ${updates.join(", ")}, 
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramCounter}
    RETURNING *
  `;

  try {
    const [option] = await sql(updateQuery, values);
    return { option };
  } catch (error) {
    return { error: "Failed to update assistance option" };
  }
}
export async function POST(request) {
  return handler(await request.json());
}