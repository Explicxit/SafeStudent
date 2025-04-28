async function handler({
  page = 1,
  limit = 10,
  sort = "timestamp",
  order = "desc",
  severity,
  search,
}) {
  const offset = (page - 1) * limit;
  const values = [];
  const conditions = [];
  let paramCount = 1;

  if (severity && ["low", "medium", "high"].includes(severity)) {
    conditions.push(`severity = $${paramCount}`);
    values.push(severity);
    paramCount++;
  }

  if (search) {
    conditions.push(
      `(LOWER(title) LIKE $${paramCount} OR LOWER(message) LIKE $${paramCount})`
    );
    values.push(`%${search.toLowerCase()}%`);
    paramCount++;
  }

  const validSortFields = ["timestamp", "title", "severity"];
  const sortField = validSortFields.includes(sort) ? sort : "timestamp";
  const sortOrder = order.toLowerCase() === "asc" ? "ASC" : "DESC";
  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  values.push(limit, offset);

  const result = await sql.transaction((sql) => [
    sql(
      `SELECT COUNT(*) FROM emergency_alerts ${whereClause}`,
      values.slice(0, -2)
    ),
    sql(
      `
      SELECT * 
      FROM emergency_alerts 
      ${whereClause}
      ORDER BY ${sortField} ${sortOrder}
      LIMIT $${paramCount}
      OFFSET $${paramCount + 1}
    `,
      values
    ),
  ]);

  return {
    alerts: result[1],
    pagination: {
      total: parseInt(result[0][0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(result[0][0].count) / limit),
    },
  };
}
export async function POST(request) {
  return handler(await request.json());
}