async function handler({ tip, category, scheduledFor = null }) {
  if (!tip || !category) {
    return { error: "Tip and category are required" };
  }

  if (tip.length > 500) {
    return { error: "Tip must be less than 500 characters" };
  }

  const validCategories = [
    "mental",
    "physical",
    "emotional",
    "social",
    "environmental",
    "spiritual",
    "occupational",
    "financial",
  ];

  if (!validCategories.includes(category.toLowerCase())) {
    return {
      error: `Category must be one of: ${validCategories.join(", ")}`,
    };
  }

  if (scheduledFor) {
    const scheduledDate = new Date(scheduledFor);
    if (isNaN(scheduledDate.getTime())) {
      return { error: "Invalid schedule date format" };
    }
  }

  try {
    const newTip = await sql(
      "INSERT INTO wellbeing_tips (tip, category, scheduled_for) VALUES ($1, $2, $3) RETURNING *",
      [
        tip,
        category.toLowerCase(),
        scheduledFor ? new Date(scheduledFor) : null,
      ]
    );

    return {
      success: true,
      tip: newTip[0],
    };
  } catch (error) {
    return {
      error: "Failed to create tip",
      details: error.message,
    };
  }
}
export async function POST(request) {
  return handler(await request.json());
}