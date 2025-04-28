async function handler({
  page = 1,
  limit = 10,
  category = null,
  search = null,
  startDate = null,
  endDate = null,
}) {
  const offset = (page - 1) * limit;
  let query =
    "SELECT COUNT(*) as count FROM wellbeing_tips WHERE deleted_at IS NULL";
  let querySelect = "SELECT * FROM wellbeing_tips WHERE deleted_at IS NULL";
  const values = [];
  let paramCount = 1;

  if (category) {
    query += ` AND category = $${paramCount}`;
    querySelect += ` AND category = $${paramCount}`;
    values.push(category.toLowerCase());
    paramCount++;
  }

  if (search) {
    query += ` AND LOWER(tip) LIKE $${paramCount}`;
    querySelect += ` AND LOWER(tip) LIKE $${paramCount}`;
    values.push(`%${search.toLowerCase()}%`);
    paramCount++;
  }

  if (startDate) {
    query += ` AND created_at >= $${paramCount}`;
    querySelect += ` AND created_at >= $${paramCount}`;
    values.push(new Date(startDate));
    paramCount++;
  }

  if (endDate) {
    query += ` AND created_at <= $${paramCount}`;
    querySelect += ` AND created_at <= $${paramCount}`;
    values.push(new Date(endDate));
    paramCount++;
  }

  querySelect += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${
    paramCount + 1
  }`;

  const fullValues = [...values, limit, offset];

  const [{ count }] = await sql(query, values);
  const tips = await sql(querySelect, fullValues);

  return {
    tips,
    pagination: {
      total: parseInt(count),
      totalPages: Math.ceil(parseInt(count) / limit),
      currentPage: page,
      limit,
    },
  };
}
export async function POST(request) {
  return handler(await request.json());
}