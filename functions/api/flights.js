export async function onRequestGet(context) {
  try {
    const { searchParams } = new URL(context.request.url);
    const lat = searchParams.get("lat") || "50.9";
    const lon = searchParams.get("lon") || "6.9";
    const dist = searchParams.get("dist") || "250"; // nautical miles, max 250

    const res = await fetch(`https://api.adsb.lol/v2/lat/${lat}/lon/${lon}/dist/${dist}`);
    if (!res.ok) {
      return new Response(JSON.stringify({ error: true, status: res.status }), {
        status: 502, headers: { "content-type": "application/json", "access-control-allow-origin": "*" }
      });
    }
    const data = await res.json();
    const flights = (data.ac || []).map(a => ({
      callsign: (a.flight || "").trim(),
      lat: a.lat,
      lon: a.lon,
      altitude: a.alt_baro,
      velocity: a.gs,
      heading: a.track
    })).filter(f => f.lat && f.lon);

    return new Response(JSON.stringify(flights), {
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: true, message: err.message }), {
      status: 500, headers: { "content-type": "application/json", "access-control-allow-origin": "*" }
    });
  }
}
