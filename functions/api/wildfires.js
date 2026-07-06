export async function onRequestGet(context) {
  try {
    const { env } = context;
    if (!env.FIRMS_API_KEY) {
      return new Response(JSON.stringify({ error: true, message: "FIRMS_API_KEY secret not set" }), {
        status: 500, headers: { "content-type": "application/json", "access-control-allow-origin": "*" }
      });
    }
    const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${env.FIRMS_API_KEY}/VIIRS_SNPP_NRT/world/1`;
    const res = await fetch(url);
    const csv = await res.text();

    // If FIRMS returned an error message instead of CSV, surface it instead of silently returning [].
    if (!csv.includes(",") || csv.toLowerCase().includes("invalid") || csv.toLowerCase().includes("error")) {
      return new Response(JSON.stringify({ error: true, raw: csv.slice(0, 300) }), {
        status: 502, headers: { "content-type": "application/json", "access-control-allow-origin": "*" }
      });
    }

    const rows = csv.trim().split("\n");
    const headers = rows[0].split(",");
    const fires = rows.slice(1, 2001).map(row => {
      const cols = row.split(",");
      const obj = Object.fromEntries(headers.map((h, i) => [h.trim(), cols[i]]));
      return {
        lat: parseFloat(obj.latitude),
        lon: parseFloat(obj.longitude),
        brightness: parseFloat(obj.bright_ti4 || obj.brightness),
        confidence: obj.confidence
      };
    });
    return new Response(JSON.stringify(fires), {
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: true, message: err.message }), {
      status: 500, headers: { "content-type": "application/json", "access-control-allow-origin": "*" }
    });
  }
}
