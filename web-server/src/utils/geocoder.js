const mbxClient = require('@mapbox/mapbox-sdk');
const mapkey = require('./keys.js').mapboxKey;

const forwardGeocodeClient = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodeSvc = forwardGeocodeClient({accessToken: mapkey});

geocodeSvc.forwardGeocode({
    query: 'Scottsdale, Arizona',
})
.send()
.then(resp => {
    console.log(resp.body);
    for (let i = 0; i < resp.body
}, err => {console.log(err)});
