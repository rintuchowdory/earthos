export async function onRequestGet(context) {
  try {
    // Bounded region query to stay under the free-tier CPU limit.
    // Default: Europe. Pass ?bbox=lamin,lomin,lamax,lomax to override.
    const { searchParams } = new URL(context.request.url);
    const bbox = searchParams.get("bbox") || "35,-10,60,30";
    const [lamin, lomin, lamax, lomax] = bbox.split(",");

    const url = `https://opensky-network.org/api/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;
    const res = await fetch(url, { headers: { "Accept": "application/json" } });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: true, status: res.status, statusText: res.statusText }), {
        status: 502, headers: { "content-type": "application/json", "access-control-allow-origin": "*" }
      });
    }
    const data = await res.json();
    const flights = (data.states || [])
      .filter(s => s[5] !== null && s[6] !== null)
      .slice(0, 300)
      .map(s => ({
        callsign: (s[1] || "").trim(),
        lon: s[5],
        lat: s[6],
        altitude: s[7],
        velocity: s[9],
        heading: s[10]
      }));
    return new Response(JSON.stringify(flights), {
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: true, message: err.message }), {
      status: 500, headers: { "content-type": "application/json", "access-control-allow-origin": "*" }
    });
  }
}
