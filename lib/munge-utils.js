const request = require('superagent');

function shapeCoordinates(data, coordLat, coordLon) {


  const { country, region, city, latitude, longitude, currency_symbol, sunrise, sunset, time_zone } = data;

  return {
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
}

async function shapeLocations(coordinates) {

  let locationArray = [];
  for (let coordinate of coordinates) {

    const data = await request
      .get(`https://api.geodatasource.com/city?key=${process.env.GDS_API_KEY}&lat=${coordinate.lat}&lng=${coordinate.lon}&format=json`);

    const shapedData = shapeCoordinates(data.body, coordinate.lat, coordinate.lon);
    locationArray.push(shapedData);

  }
  
  return locationArray;
}


module.exports = {
  shapeCoordinates,
  shapeLocations
};
