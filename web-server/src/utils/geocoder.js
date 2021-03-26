const mapkey = require('./keys.js').mapboxKey;
const forwardGeocodeClient = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodeSvc = forwardGeocodeClient({accessToken: mapkey});

const getCoords = async (loc) => {
    try {
        let response = await geocodeSvc.forwardGeocode({query: loc, limit: 1}).send();
        // console.log(response);
        return response.body.features[0].center;
    } catch (error) {
        console.error(error);
    }
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