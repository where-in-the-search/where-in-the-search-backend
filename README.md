# # Else by Elsewhere

Else by Elsewhere is a guessing game featuring location images from around the world.

Players are presented with an unlabeled image and asked to submit their guesses about where in the world the image location might be (with the option to receive hints).

Upon completing five rounds of this guessing game, players are directed to the results page, which will display the locations they saw during the game (and whether or not they correctly identified each).

The app uses [Google Maps Static Street View](https://developers.google.com/maps/documentation/streetview/overview) for its location images, and [GeoDataSource](https://www.geodatasource.com/web-service) for the location seed data on the backend.

Locations were chosen based on a large list of semi-arbitrary coordinates collected by the development team, using Google Street View's coverage map as a guide. These coordinates were used to generate the location data, and the location data were used to populate hints and parse user guesses for correctness.

The frontend code for Else by Elsewhere can be found [here](https://github.com/where-in-the-search/where-in-the-search-frontend).