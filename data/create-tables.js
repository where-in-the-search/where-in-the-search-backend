const client = require('../lib/client');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    await client.query(`
                CREATE TABLE users (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(256) NOT NULL,
                    hash VARCHAR(512) NOT NULL
                ); 
                CREATE TABLE characters (
                  id SERIAL PRIMARY KEY,
                  description VARCHAR(512) NOT NULL,
                  personality VARCHAR(512) NOT NULL,
                  catchphrase VARCHAR(512) NOT NULL,
                  accessory VARCHAR(512) NOT NULL,
                  clothing VARCHAR(512) NOT NULL,
                  vague_why VARCHAR(512) NOT NULL
                );     
                CREATE TABLE locations (
                  id SERIAL PRIMARY KEY NOT NULL,
                  country VARCHAR(512) NOT NULL,
                  region VARCHAR(512) NOT NULL,
                  city VARCHAR(512) NOT NULL,
                  longitude VARCHAR(512) NOT NULL,
                  latitude VARCHAR(512) NOT NULL,
                  currency_symbol VARCHAR(512) NOT NULL,
                  sunrise VARCHAR(512) NOT NULL,
                  sunset VARCHAR(512) NOT NULL,
                  time_zone VARCHAR(512) NOT NULL,
                  image_url VARCHAR(512) NOT NULL
                );
                CREATE TABLE coordinates (
                  id SERIAL PRIMARY KEY NOT NULL,
                  lat VARCHAR(512) NOT NULL,
                  lon VARCHAR(512) NOT NULL
                );  
                CREATE TABLE location_guesses (
                    id SERIAL PRIMARY KEY,
                    guess_1 VARCHAR(512) NOT NULL,
                    guess_1_lat_lon VARCHAR(512) NOT NULL,
                    guess_2 VARCHAR(512),
                    guess_2_lat_lon VARCHAR(512),
                    guess_3 VARCHAR(512),
                    guess_3_lat_lon VARCHAR(512),
                    guess_4 VARCHAR(512),
                    guess_4_lat_lon VARCHAR(512),
                    found BOOLEAN NOT NULL,
                    location_id INTEGER NOT NULL REFERENCES locations(id),
                    user_id INTEGER NOT NULL REFERENCES users(id)
                );        
                CREATE TABLE sessions (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(512) NOT NULL,
                    location_1 INTEGER NOT NULL REFERENCES location_guesses(id),
                    location_2 INTEGER NOT NULL REFERENCES location_guesses(id),
                    location_3 INTEGER NOT NULL REFERENCES location_guesses(id),
                    location_4 INTEGER NOT NULL REFERENCES location_guesses(id),
                    location_5 INTEGER NOT NULL REFERENCES location_guesses(id),
                    date VARCHAR(512) NOT NULL,
                    user_id INTEGER NOT NULL REFERENCES users(id),
                    character_id INTEGER NOT NULL REFERENCES characters(id)
                );


        `);

    console.log('create tables complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch (err) {
    console.log(err);
  }
  finally {
    client.end();
  }

}
