const client = require('../lib/client');
// import our seed data:
const characters = require('./characters.js');
const coordinates = require('./coordinates.js');
const location_guesses = require('./location_guesses.js');
const sessions = require('./sessions.js');
const usersData = require('./users.js');
const locations = require('./locations.js');
const { getEmoji } = require('../lib/emoji.js');


run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );

    const user = users[0].rows[0];

    await Promise.all(
      characters.map(character => {
        const { description, personality, catchphrase, accessory, clothing, vague_why } = character;
        return client.query(`
                    INSERT INTO characters (description, personality, catchphrase, accessory, clothing, vague_why)
                    VALUES ($1, $2, $3, $4, $5, $6);
                `,
        [description, personality, catchphrase, accessory, clothing, vague_why]);
      })
    );

    await Promise.all(
      locations.map(location => {
        const { country, region, city, longitude, latitude, currency_symbol, sunrise, sunset, time_zone, image_url } = location;
        return client.query(`
                    INSERT INTO locations (country, region, city, longitude, latitude, currency_symbol, sunrise, sunset, time_zone, image_url)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
                `,
        [country, region, city, longitude, latitude, currency_symbol, sunrise, sunset, time_zone, image_url]);
      })
    );

    await Promise.all(
      coordinates.map(coordinate => {
        const { lat, lon } = coordinate;
        return client.query(`
                    INSERT INTO coordinates (lat, lon)
                    VALUES ($1, $2);
                `,
        [lat, lon]);
      })
    );

    await Promise.all(
      location_guesses.map(location_guess => {
        const { guess_1, guess_1_lat_lon, guess_2, guess_2_lat_lon, guess_3, guess_3_lat_lon, guess_4, guess_4_lat_lon, found, location_id } = location_guess;
        return client.query(`
                    INSERT INTO location_guesses (guess_1, guess_1_lat_lon, guess_2, guess_2_lat_lon, guess_3, guess_3_lat_lon, guess_4, guess_4_lat_lon, found, location_id, user_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);
                `,
        [guess_1, guess_1_lat_lon, guess_2, guess_2_lat_lon, guess_3, guess_3_lat_lon, guess_4, guess_4_lat_lon, found, location_id, user.id]);
      })
    );

    await Promise.all(
      sessions.map(session => {
        const { name, location_1, location_2, location_3, location_4, location_5, date, character_id } = session;
        return client.query(`
                    INSERT INTO sessions (name, location_1, location_2, location_3, location_4, location_5, date, character_id, user_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
                `,
        [name, location_1, location_2, location_3, location_4, location_5, date, character_id, user.id]);
      })
    );

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch (err) {
    console.log(err);
  }
  finally {
    client.end();
  }
}
