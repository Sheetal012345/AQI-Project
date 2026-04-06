export async function getCoordinates(place: string) {
  const res = await fetch(
    `https://api.opencagedata.com/geocode/v1/json?q=${place}&key=${process.env.OPENCAGE_KEY}`
  );

  const data = await res.json();

  if (!data.results.length) {
    throw new Error("Location not found");
  }

  return {
    lat: data.results[0].geometry.lat,
    lon: data.results[0].geometry.lng,
  };
}