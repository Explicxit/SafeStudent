async function handler({
  id,
  name,
  role,
  phone,
  email,
  description,
  available_hours,
  contact_type,
  is_available,
}) {
  const session = getSession();
  if (!session?.user?.id) {
    return { error: "Authentication required" };
  }

  if (!id) {
    return { error: "Missing contact ID" };
  }

  if (email) {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return { error: "Invalid email format" };
    }
  }

  if (phone) {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      return { error: "Invalid phone format" };
    }
  }

  if (
    contact_type &&
    !["emergency", "counseling", "medical", "general", "crisis"].includes(
      contact_type
    )
  ) {
    return { error: "Invalid contact type" };
  }

  const [contact] = await sql(
    `UPDATE emergency_contacts 
     SET name = COALESCE($1, name),
         role = COALESCE($2, role),
         phone = COALESCE($3, phone),
         email = COALESCE($4, email),
         description = COALESCE($5, description),
         available_hours = COALESCE($6, available_hours),
         contact_type = COALESCE($7, contact_type),
         is_available = COALESCE($8, is_available)
     WHERE id = $9 AND deleted_at IS NULL 
     RETURNING *`,
    [
      name,
      role,
      phone,
      email,
      description,
      available_hours,
      contact_type,
      is_available,
      id,
    ]
  );

  if (!contact) {
    return { error: "Contact not found" };
  }

  return { success: true, data: contact };
}
export async function POST(request) {
  return handler(await request.json());
}