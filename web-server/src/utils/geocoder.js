const mapkey = require('./keys.js').mapboxKey;
const forwardGeocodeClient = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodeSvc = forwardGeocodeClient({accessToken: mapkey});

/**
 * Given a location string, uses the Mapbox javascript module to return coordinates.
 * 
 * @param {string} loc 
 * @returns {object} - {lat, lon}
 */
const getCoords = (loc) => {
    return new Promise(async (resolve, reject) => {
        let response = await geocodeSvc.forwardGeocode({query: loc, limit: 1}).send();

        if (response.body.features.length == 0) {
            reject("Invalid placename");
        } else {
            let name = response.body.features[0].place_name;
            let coordinates = {lat: response.body.features[0].center[1], lon: response.body.features[0].center[0]};
            resolve({placename: name, coordinates: coordinates});
        }
    })
    // .catch(error => console.log("Inside geocoder.js: " + error));
}

// const processCoords = async () => {
//     let loc = "Pittsburgh PA";
//     let co = await getCoords(loc);
//     console.log(loc + " is at " + co);
// }
// processCoords();

module.exports = {
    getCoords,
}