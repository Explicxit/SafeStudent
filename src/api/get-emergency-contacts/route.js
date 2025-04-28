async function handler({ type = null, available = null } = {}) {
  try {
    const queryFields = `
      id, name, role, phone, email, description, 
      available_hours, is_available, sort_order, contact_type, created_at
    `;

    let queryText = `SELECT ${queryFields} FROM emergency_contacts WHERE deleted_at IS NULL`;
    const values = [];
    let paramIndex = 1;
    const conditions = [];

    if (type && type !== "all") {
      conditions.push(`contact_type = $${paramIndex}`);
      values.push(type);
      paramIndex++;
    }

    if (available === true) {
      conditions.push("is_available = true");
    }

    if (conditions.length > 0) {
      queryText += ` AND ${conditions.join(" AND ")}`;
    }

    queryText += ` ORDER BY sort_order ASC, name ASC`;

    const contacts = await sql(queryText, values);

    if (!contacts || !Array.isArray(contacts)) {
      return {
        ok: false,
        json: [],
      };
    }

    return {
      ok: true,
      json: contacts,
    };
  } catch (error) {
    console.error("Error fetching emergency contacts:", error);
    return {
      ok: false,
      error: "Failed to fetch emergency contacts",
      json: [],
    };
  }
}
export async function POST(request) {
  return handler(await request.json());
}