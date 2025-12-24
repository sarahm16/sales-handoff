export const getLatLng = async (address) => {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
  );
  const data = await response.json();
  console.log("geocode data", data);
  if (data.results.length > 0) {
    return {
      lat: data.results[0].geometry.location.lat,
      lng: data.results[0].geometry.location.lng,
    };
  } else {
    return { lat: 0, lng: 0 }; // Default values if no results found
  }
};

// Get coordinates for an array of items with address fields
export const getCoordsForAnArray = async (array) => {
  const updatedJson = await Promise.all(
    array.map(async (item) => {
      const address = `${item.address}, ${item.city}, ${item.state} ${item.zipcode}`;
      console.log("address", address);
      const { lat, lng } = await getLatLng(address);
      return {
        ...item,
        lat,
        lng,
      };
    })
  );
  console.log("Updated JSON with lat/lng:", updatedJson);

  return updatedJson;
};
