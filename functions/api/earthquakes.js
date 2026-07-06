export async function onRequestGet(context) {
  try {
    const res = await fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson");
    if (!res.ok) {
      return new Response(JSON.stringify({ error: true, status: res.status, statusText: res.statusText }), {
        status: 502, headers: { "content-type": "application/json", "access-control-allow-origin": "*" }
      });
    }
    const data = await res.json();
    const quakes = data.features.map(f => ({
      id: f.id,
      mag: f.properties.mag,
      place: f.properties.place,
      time: f.properties.time,
      lon: f.geometry.coordinates[0],
      lat: f.geometry.coordinates[1],
      depth: f.geometry.coordinates[2]
    }));
    return new Response(JSON.stringify(quakes), {
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: true, message: err.message }), {
      status: 500, headers: { "content-type": "application/json", "access-control-allow-origin": "*" }
    });
  }
}
