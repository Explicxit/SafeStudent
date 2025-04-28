async function handler(body) {
  try {
    const session = getSession();
    if (!session?.user?.id) {
      return { error: "Authentication required" };
    }

    const {
      name,
      role,
      phone,
      email,
      description = null,
      available_hours = null,
      is_available = true,
      contact_type = "general",
      sort_order = 0,
    } = body;

    if (!name?.trim() || !role?.trim() || !phone?.trim() || !email?.trim()) {
      return { error: "Name, role, phone and email are required fields" };
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return { error: "Invalid email format" };
    }

    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      return { error: "Invalid phone format" };
    }

    const validTypes = [
      "emergency",
      "counseling",
      "medical",
      "general",
      "crisis",
    ];
    if (contact_type && !validTypes.includes(contact_type)) {
      return { error: "Invalid contact type" };
    }

    const [contact] = await sql`
      INSERT INTO emergency_contacts 
      (name, role, phone, email, description, available_hours, is_available, contact_type, sort_order)
      VALUES 
      (${name}, ${role}, ${phone}, ${email}, ${description}, ${available_hours}, ${is_available}, ${contact_type}, ${sort_order})
      RETURNING *
    `;

    return {
      success: true,
      data: contact,
    };
  } catch (error) {
    console.error("Error creating contact:", error);
    if (error.code === "23505") {
      return { error: "Contact already exists" };
    }
    return { error: "Failed to create contact" };
  }
}
export async function POST(request) {
  return handler(await request.json());
}