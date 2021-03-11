const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');
const request = require('superagent');


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/characters', async (req, res) => {
  try {
    const data = await client.query('SELECT * from characters');

    res.json(data.rows);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.get('/coordinates/:id', async (req, res) => {
  try {
    const data = await client.query('SELECT * from coordinates where id=$1', [req.params.id]);

    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.get('/api/sessions', async (req, res) => {
  try {
    const data = await client.query('SELECT * from sessions WHERE user_id=$1', [req.userId]);

    res.json(data.rows);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.post('/api/sessions', async (req, res) => {
  try {
    const {
      name,
      locations,
      date,
      character_id } = req.body;

    const data = await client.query(`
    INSERT into sessions (name, locations, date, character_id, user_id)
    VALUES ($1, $2, $3, $4, $5)
    returning *`,
      [
        name,
        locations,
        date,
        character_id,
        req.userId
      ]);

    res.json(data.rows[0]);
  }
  catch (e) {
    res.status(500).json({ error: e.message });
  }

});

app.get('/api/sessions/:id', async (req, res) => {
  try {
    const data = await client.query('SELECT * from sessions WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]);

    res.json(data.rows[0]);
  }
  catch (e) {
    res.status(500).json({ error: e.message });
  }

});

app.delete('/api/sessions/:id', async (req, res) => {
  try {
    const data = await client.query('DELETE from sessions WHERE id=$1 AND user_id=$2 returning *', [req.params.id, req.userId]);

    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

// location guesses may be handle-able in state - the table and these endpoints may be superfluous
app.post('/api/location_guesses', async (req, res) => {
  try {
    const {
      guess_1,
      guess_1_lat_lon,
      guess_2,
      guess_2_lat_lon,
      guess_3,
      guess_3_lat_lon,
      guess_4,
      guess_4_lat_lon,
      found,
      location_id
    } = req.body;

    const data = await client.query(`
    INSERT into location_guesses (
      guess_1, 
      guess_1_lat_lon, 
      guess_2, 
      guess_2_lat_lon, 
      guess_3, 
      guess_3_lat_lon, 
      guess_4, 
      guess_4_lat_lon, 
      found,
      location_id,
      user_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    returning *`,
      [
        guess_1,
        guess_1_lat_lon,
        guess_2,
        guess_2_lat_lon,
        guess_3,
        guess_3_lat_lon,
        guess_4,
        guess_4_lat_lon,
        found,
        location_id,
        req.userId
      ]);

    res.json(data.rows[0]);
  }
  catch (e) {
    res.status(500).json({ error: e.message });
  }

});

app.put('/api/location_guesses/:id', async (req, res) => {
  try {
    const {
      guess_1,
      guess_1_lat_lon,
      guess_2,
      guess_2_lat_lon,
      guess_3,
      guess_3_lat_lon,
      guess_4,
      guess_4_lat_lon,
      found
    } = req.body;

    const data = await client.query(`
    UPDATE location_guesses 
      SET 
      guess_1 = $1, 
      guess_1_lat_lon = $2, 
      guess_2 = $3, 
      guess_2_lat_lon = $4, 
      guess_3 = $5, 
      guess_3_lat_lon =$6, 
      guess_4 = $7, 
      guess_4_lat_lon = $8, 
      found = $9
      WHERE id = $10 
      RETURNING *`,
      [
        guess_1,
        guess_1_lat_lon,
        guess_2,
        guess_2_lat_lon,
        guess_3,
        guess_3_lat_lon,
        guess_4,
        guess_4_lat_lon,
        found,
        req.params.id
      ]);


    res.json(data.rows[0]);
  }
  catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/location_guesses', async (req, res) => {
  try {
    const data = await client.query('SELECT * FROM location_guesses WHERE user_id=$1', [req.userId]);

    res.json(data.rows);
  }
  catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/locations', async (req, res) => {
  try {
    const data = await client.query('SELECT * FROM locations');

    res.json(data.rows);
  }
  catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/locations/:id', async (req, res) => {
  try {
    const data = await client.query('SELECT * FROM locations WHERE id=$1', [req.params.id]);

    res.json(data.rows[0]);
  }
  catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/locations', async (req, res) => {
  try {
    const {
      country,
      region,
      city,
      longitude,
      latitude,
      currency_symbol,
      sunrise,
      sunset,
      time_zone,
      image_url
    } = req.body;

    const data = await client.query(`
    INSERT into locations (
      country, 
      region, 
      city, 
      longitude, 
      latitude, 
      currency_symbol, 
      sunrise, 
      sunset, 
      time_zone, 
      image_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    returning *`,
      [
        country,
        region,
        city,
        longitude,
        latitude,
        currency_symbol,
        sunrise,
        sunset,
        time_zone,
        image_url
      ]);

    res.json(data.rows[0]);
  }
  catch (e) {
    res.status(500).json({ error: e.message });
  }

});


app.get('/geo-data-location/:lat&:lon', async (req, res) => {
  try {
    const data = await request
      .get(`https://api.geodatasource.com/city?key=${process.env.GDS_API_KEY}&lat=${req.params.lat}&lng=${req.params.lon}&format=json`);
    res.json(data.body);
  }
  catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
