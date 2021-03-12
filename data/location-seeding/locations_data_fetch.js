// this was used to seed our database but is not in active use
const { shapeLocations } = require('./munge-utils.js');
const coordinates = require('../coordinates.js');

const locations = shapeLocations(coordinates);

module.exports = locations;
