async function handler({ city }) {
  if (!city) {
    return {
      ok: false,
      error: "City name is required",
    };
  }

  try {
    const response = await fetch(
      `/integrations/weather-by-city/weather/${encodeURIComponent(city)}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      return {
        ok: false,
        error: "Weather service unavailable",
      };
    }

    const data = await response.json();
    return {
      ok: true,
      data: {
        temperature: Math.round(data.current.temp_c),
        feelsLike: Math.round(data.current.feelslike_c),
        humidity: data.current.humidity,
        windSpeed: Math.round(data.current.wind_kph),
        conditions: data.current.condition.text,
        uvIndex: data.current.uv,
        visibility: data.current.vis_km,
        precipitationChance: Math.round(data.current.precip_mm),
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: "Unable to fetch weather data",
    };
  }
}
export async function POST(request) {
  return handler(await request.json());
}