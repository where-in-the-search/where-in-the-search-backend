require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');
const { shapeLocations } = require('../lib/munge-utils.js');

describe('app routes', () => {
  describe('routes', () => {
    let token;

    beforeAll(async done => {
      execSync('npm run setup-db');

      client.connect();

      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });

      token = signInData.body.token; // eslint-disable-line

      return done();
    });

    afterAll(done => {
      return client.end(done);
    });

    test('returns chararcters', async () => {

      const expectation = [
        {
          'id': 1,
          'description': 'pilot',
          'personality': 'mad',
          'catchphrase': 'Hey!',
          'accessory': 'banana',
          'clothing': 'cape',
          'vague_why': 'debt to brother'
        },
        {
          'id': 2,
          'description': 'farmer',
          'personality': 'ambitious',
          'catchphrase': 'What!',
          'accessory': 'pitchfork',
          'clothing': 'large boots',
          'vague_why': 'a dream'
        }
      ];

      const data = await fakeRequest(app)
        .get('/characters')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('gets a set of coordinates by id', async () => {
      const expectation = {
        id: 4,
        lat: '14.6923634',
        lon: '121.037551'
      };

      const data = await fakeRequest(app)
        .get('/coordinates/4')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('creates a session as the test user', async () => {
      const newSession = {
        name: 'Chad',
        location_1: 3,
        location_2: 2,
        location_3: 1,
        location_4: 4,
        location_5: 5,
        date: '03-08-2021',
        user_id: 2,
        character_id: 1
      };

      const expectation = {
        ...newSession,
        id: 2
      };

      const data = await fakeRequest(app)
        .post('/api/sessions')
        .set({ Authorization: token })
        .send(newSession)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('gets all sessions for test user', async () => {
      const expectation = [
        {
          name: 'Chad',
          location_1: 3,
          location_2: 2,
          location_3: 1,
          location_4: 4,
          location_5: 5,
          date: '03-08-2021',
          character_id: 1,
          id: 2,
          user_id: 2
        }
      ];

      const data = await fakeRequest(app)
        .get('/api/sessions')
        .set({ Authorization: token })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('gets a session by id', async () => {
      const expectation = {
        name: 'Chad',
        location_1: 3,
        location_2: 2,
        location_3: 1,
        location_4: 4,
        location_5: 5,
        date: '03-08-2021',
        character_id: 1,
        id: 2,
        user_id: 2
      };

      const data = await fakeRequest(app)
        .get('/api/sessions/2')
        .set({ Authorization: token })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('deletes a session as the test user', async () => {
      const expectation = {
        name: 'Chad',
        location_1: 3,
        location_2: 2,
        location_3: 1,
        location_4: 4,
        location_5: 5,
        date: '03-08-2021',
        character_id: 1,
        user_id: 2,
        id: 2
      };

      const data = await fakeRequest(app)
        .delete('/api/sessions/2')
        .set({ Authorization: token })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('posts a set of guesses for a location as the test user', async () => {
      const newGuesses = {
        guess_1: 'Chicago',
        guess_1_lat_lon: '74.0264, 53.3246',
        guess_2: '',
        guess_2_lat_lon: '',
        guess_3: '',
        guess_3_lat_lon: '',
        guess_4: '',
        guess_4_lat_lon: '',
        found: false,
        location_id: 2,
        user_id: 2
      };

      const expectation = {
        ...newGuesses,
        id: 6
      };

      const data = await fakeRequest(app)
        .post('/api/location_guesses')
        .set({ Authorization: token })
        .send(newGuesses)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('updates a set of guesses for a location by id as the test user', async () => {
      const newGuesses = {
        guess_1: 'Chicago',
        guess_1_lat_lon: '74.0264, 53.3246',
        guess_2: 'San Ramon',
        guess_2_lat_lon: '74.0264, 53.3246',
        guess_3: '',
        guess_3_lat_lon: '',
        guess_4: '',
        guess_4_lat_lon: '',
        found: true
      };

      const expectation = {
        ...newGuesses,
        location_id: 2,
        user_id: 2,
        id: 6
      };

      const data = await fakeRequest(app)
        .put('/api/location_guesses/6')
        .set({ Authorization: token })
        .send(newGuesses)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('gets a set of guesses for a location as the test user', async () => {
      const expectation = [
        {
          guess_1: 'Chicago',
          guess_1_lat_lon: '74.0264, 53.3246',
          guess_2: 'San Ramon',
          guess_2_lat_lon: '74.0264, 53.3246',
          guess_3: '',
          guess_3_lat_lon: '',
          guess_4: '',
          guess_4_lat_lon: '',
          found: true,
          location_id: 2,
          user_id: 2,
          id: 6
        }
      ];

      const data = await fakeRequest(app)
        .get('/api/location_guesses')
        .set({ Authorization: token })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    // test.only('takes in coordinates and populates an array of shaped location data', async () => {
    //   const expectation = [
    //     {
    //       country: null,
    //       region: null,
    //       city: null,
    //       latitude: null,
    //       longitude: null,
    //       currency_symbol: null,
    //       sunrise: '06:06',
    //       sunset: '18:13',
    //       time_zone: '+00:00',
    //       image_url: 'https://maps.googleapis.com/maps/api/streetview?size=400x400&location=-134.5689,43.6589&fov=80&heading=70&pitch=0&key=AIzaSyBV92qk6srT_OMSxMs6_vdrdvJZhh360ho'
    //     },
    //     {
    //       country: 'PT',
    //       region: 'Regiao Autonoma dos Acores',
    //       city: 'Madalena',
    //       latitude: '38.5364',
    //       longitude: '-28.5266',
    //       currency_symbol: '€',
    //       sunrise: '07:10',
    //       sunset: '18:57',
    //       time_zone: '-01:00',
    //       image_url: 'https://maps.googleapis.com/maps/api/streetview?size=400x400&location=38.5345458,-28.5296401&fov=80&heading=70&pitch=0&key=AIzaSyBV92qk6srT_OMSxMs6_vdrdvJZhh360ho'
    //     },
    //     {
    //       country: 'PT',
    //       region: 'Aveiro',
    //       city: 'Aveiro',
    //       latitude: '40.6443',
    //       longitude: '-8.64554',
    //       currency_symbol: '€',
    //       sunrise: '06:52',
    //       sunset: '18:36',
    //       time_zone: '+00:00',
    //       image_url: 'https://maps.googleapis.com/maps/api/streetview?size=400x400&location=40.6417474,-8.655572&fov=80&heading=70&pitch=0&key=AIzaSyBV92qk6srT_OMSxMs6_vdrdvJZhh360ho'
    //     }
    //   ];

    //   const coordinates = [{
    //     lat: '-134.5689',
    //     lon: '43.6589',
    //   },
    //   {
    //     lat: '38.5345458',
    //     lon: '-28.5296401',
    //   },
    //   {
    //     lat: '40.6417474',
    //     lon: '-8.655572',
    //   }];


    //   const actual = await shapeLocations(coordinates);
      
    //   expect(actual).toEqual(expectation);
    // });



    test('gets a set of guesses for a location as the test user', async () => {
      const expectation = [
        {
          id: 1,
          country: 'Ukraine',
          region: 'Odessa',
          city: 'Odessa',
          longitude: '-134.5689',
          latitude: '43.6589',
          currency_symbol: '₴',
          sunrise: '7:04AM',
          sunset: '6:40PM',
          time_zone: '+02:00',
          hints: [
            'thyt',
            'gryt'
          ],
          image_url: 'nothing.com'
        },
        {
          id: 2,
          country: 'USA',
          region: 'Oregon',
          city: 'Portland',
          longitude: '-134.5689',
          latitude: '43.6589',
          currency_symbol: '$',
          sunrise: '7:04AM',
          sunset: '6:40PM',
          time_zone: '+02:00',
          hints: [
            'thyt',
            'gryt'
          ],
          image_url: 'nothing.com'
        },
        {
          id: 3,
          country: 'German',
          region: 'North Rhine-Westphalia',
          city: 'Dusseldorf',
          longitude: '-134.5689',
          latitude: '43.6589',
          currency_symbol: '€',
          sunrise: '7:04AM',
          sunset: '6:40PM',
          time_zone: '+02:00',
          hints: [
            'thyt',
            'gryt'
          ],
          image_url: 'nothing.com'
        },
        {
          id: 4,
          country: 'Australia',
          region: 'New South Wales',
          city: 'Sydney',
          longitude: '-134.5689',
          latitude: '43.6589',
          currency_symbol: '$',
          sunrise: '7:04AM',
          sunset: '6:40PM',
          time_zone: '+02:00',
          hints: [
            'thyt',
            'gryt'
          ],
          image_url: 'nothing.com'
        },
        {
          id: 5,
          country: 'Japan',
          region: 'Tokyo',
          city: 'Tokyo',
          longitude: '-134.5689',
          latitude: '43.6589',
          currency_symbol: '¥',
          sunrise: '7:04AM',
          sunset: '6:40PM',
          time_zone: '+02:00',
          hints: [
            'thyt',
            'gryt'
          ],
          image_url: 'nothing.com'
        }
      ];

      const data = await fakeRequest(app)
        .get('/locations')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('posts a new location', async () => {
      const newLocation = {
        country: 'Costa Rica',
        region: 'Alajuela',
        city: 'Palmares',
        longitude: '-134.5689',
        latitude: '43.6589',
        currency_symbol: '₡',
        sunrise: '7:04AM',
        sunset: '6:40PM',
        time_zone: '+02:00',
        hints: [
          'thyt',
          'gryt'
        ],
        image_url: 'nothing.com'
      };

      const expectation = {
        ...newLocation,
        id: 6
      };

      const data = await fakeRequest(app)
        .post('/locations')
        .send(newLocation)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });
});
