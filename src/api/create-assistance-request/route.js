async function handler({
  type,
  location,
  description,
  category,
  urgency = "normal",
}) {
  if (!type || !["sos", "assistance"].includes(type)) {
    return {
      ok: false,
      error: "Invalid request type",
    };
  }

  try {
    const queries = [
      sql`
        INSERT INTO assistance_requests 
        (type, location, description, status, category, urgency) 
        VALUES (
          ${type}, 
          ${location || "Unknown"}, 
          ${description || "Emergency Assistance Needed"}, 
          'pending',
          ${category},
          ${urgency}
        ) 
        RETURNING *
      `,
    ];

    if (type === "sos") {
      queries.push(
        sql`
          INSERT INTO sos_alerts (status, location)
          VALUES ('active', ${location || "Unknown"})
        `
      );
    }

    const [result] = await sql.transaction(queries);
    const [request] = result;

    if (!request) {
      throw new Error("Insert succeeded but no row was returned");
    }

    return { ok: true, data: request };
  } catch (error) {
    console.error("Error in createAssistanceRequest:", error);
    return {
      ok: false,
      error: "Unable to create assistance request. Please try again.",
    };
  }
}
export async function POST(request) {
  return handler(await request.json());
}