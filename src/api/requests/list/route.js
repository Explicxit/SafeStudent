async function handler({ type, status, dateRange, search, sort = "newest" }) {
  const session = getSession();
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  if (!["sos", "assistance"].includes(type)) {
    return { ok: false, error: "Invalid request type" };
  }

  try {
    let conditions = ["1=1"];
    let values = [];
    let paramCount = 1;

    if (status) {
      conditions.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    if (dateRange?.start) {
      conditions.push(`created_at >= $${paramCount}`);
      values.push(new Date(dateRange.start));
      paramCount++;
    }

    if (dateRange?.end) {
      conditions.push(`created_at <= $${paramCount}`);
      values.push(new Date(dateRange.end));
      paramCount++;
    }

    if (search) {
      conditions.push(`(
        CAST(id AS TEXT) LIKE $${paramCount} 
        OR COALESCE(location, '') LIKE $${paramCount}
        OR COALESCE(description, '') LIKE $${paramCount}
      )`);
      values.push(`%${search}%`);
      paramCount++;
    }

    const orderBy = sort === "oldest" ? "ASC" : "DESC";

    const query = `
      SELECT 
        r.*,
        creator.name as creator_name,
        acknowledger.name as acknowledger_name,
        resolver.name as resolver_name
      FROM assistance_requests r
      LEFT JOIN auth_users creator ON r.created_by = creator.id
      LEFT JOIN auth_users acknowledger ON r.acknowledged_by = acknowledger.id
      LEFT JOIN auth_users resolver ON r.resolved_by = resolver.id
      WHERE type = $${paramCount} 
      AND ${conditions.join(" AND ")}
      ORDER BY created_at ${orderBy}
    `;

    values.push(type);

    const results = await sql(query, values);

    return {
      ok: true,
      data: results,
    };
  } catch (error) {
    return {
      ok: false,
      error: "Failed to fetch requests",
    };
  }
}
export async function POST(request) {
  return handler(await request.json());
}