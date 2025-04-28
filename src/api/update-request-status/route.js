async function handler({ id, type, status }) {
  const session = getSession();
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  if (!id || !status || !type) {
    return { ok: false, error: "ID, type, and status are required" };
  }

  if (!["pending", "acknowledged", "resolved"].includes(status)) {
    return { ok: false, error: "Invalid status" };
  }

  if (!["sos", "assistance"].includes(type)) {
    return { ok: false, error: "Invalid request type" };
  }

  try {
    const now = new Date();
    const queries = [
      sql`
        UPDATE assistance_requests 
        SET status = ${status},
            resolved_at = ${status === "resolved" ? now : null},
            resolved_by = ${status === "resolved" ? session.user.id : null},
            acknowledged_at = ${status === "acknowledged" ? now : null},
            acknowledged_by = ${
              status === "acknowledged" ? session.user.id : null
            }
        WHERE id = ${id} AND type = ${type}
        RETURNING *
      `,
    ];

    if (type === "sos" && status === "resolved") {
      queries.push(sql`
        UPDATE sos_alerts 
        SET status = 'resolved',
            resolved_at = ${now},
            resolved_by = ${session.user.id}
        WHERE created_at = (
          SELECT created_at 
          FROM assistance_requests 
          WHERE id = ${id}
        )
      `);
    }

    const [updateResult] = await sql.transaction(queries);

    if (!updateResult.length) {
      return { ok: false, error: "Request not found" };
    }

    return {
      ok: true,
      data: updateResult[0],
    };
  } catch (error) {
    return {
      ok: false,
      error: "Failed to update request status",
    };
  }
}
export async function POST(request) {
  return handler(await request.json());
}