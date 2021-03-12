const request = require('superagent');

function shapeCoordinates(data, coordLat, coordLon) {

  const { country, region, city, latitude, longitude, currency_symbol, sunrise, sunset, time_zone } = data;

  const shapedCoordinates = {
    country,
    region,
    city,
    latitude,
    longitude,
    currency_symbol,
    sunrise,
    sunset,
    time_zone,
    image_url: `https://maps.googleapis.com/maps/api/streetview?size=400x400&location=${coordLat},${coordLon}&fov=80&heading=70&pitch=0&key=${process.env.GOOGLE_API_KEY}`
  };

  return shapedCoordinates;
}

async function getGeoDataSource(lat, lon) {

  const data = await request.get(`https://api.geodatasource.com/city?key=${process.env.GDS_API_KEY}&lat=${lat}&lng=${lon}&format=json`);

  return data.body;

}

async function shapeLocations(coordinates) {

  let locationArray = [];
  for (let coordinate of coordinates) {

    const data = await getGeoDataSource(coordinate.lat, coordinate.lon);

    const shapedData = shapeCoordinates(data, coordinate.lat, coordinate.lon);

    locationArray.push(shapedData);

  }

  return locationArray;
}


module.exports = {
  shapeCoordinates,
  shapeLocations
};
