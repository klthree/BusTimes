// git testing
const fs = require('fs');
const got = require('got');
const haversine = require('haversine');
const bus_key = require('./key')();

const baseURL = 'http://truetime.portauthority.org/bustime/api/v3';

// Returns a list of transit routes in Pittsburgh.
let get_routes = (loc) => {
    return new Promise((resolve, reject) => {
        (async () => {
            try {
                const routeURL = baseURL + '/getroutes?key=' + bus_key + '&format=json';
                const response = await got(routeURL);
                const resp = JSON.parse(response.body);
                const route_list = [];
                const locRegExp = new RegExp(loc, 'i');
    
                resp["bustime-response"].routes.forEach((route) => {
                    if(locRegExp.test(route.rtnm)) {
                        route_list.push(route);
                    }
                });
                
                if(route_list.length > 0) {
                    // console.log(true);
                    resolve(route_list);
                } else {
                    reject("Route not found.")
                }
            } catch(error) {
                console.error(error);
            }
        })();
    })
}

// Given an array of routes, adds array of directions to route object. Largely trivial for
// Pittsburgh - everything is Inbound (toward downtown) or Outbound (away from downtown).
const get_dir = (route_list) => {
    const rl = route_list.map(async (route) => {
        const dirURL = baseURL + '/getdirections?key=' + bus_key + '&rt='
                            + route.rt + '&format=json&rtpidatafeed=' + route.rtpidatafeed;
        const response = await got(dirURL);
        resp = JSON.parse(response.body);
        route.dir = resp["bustime-response"].directions;
        return route;
    })
    
    return Promise.all(rl);
}

// Given an array of routes with a subarray of directions, returns stops for those route/direction pairs
const get_route_stops = (route_dir_list) => {
    const stops_per_route = route_dir_list.map(async (route) => {
        const stoplist = (route.dir).map(async (direction) => {
            let dirId = direction.id;
            const stopsURL = baseURL + '/getstops?key=' + bus_key + '&rt='
                + route.rt + '&dir=' + dirId + '&format=json&rtpidatafeed='
                + route.rtpidatafeed;   
                        
            const response = await got(stopsURL);
            const resp = JSON.parse(response.body);
            route[dirId] = (resp["bustime-response"].stops);
            
            return route;
        })
        // Check this - return directly?
        let x = Promise.all(stoplist);
        
        return x;
    });
    
    let y = Promise.all(stops_per_route);
    return y;
}

// Accepts a location object of coordinates, a list of stops,
// and returns the top 'top' closest stops to 'start.' 
const get_closest_stops = (start, stoplist, top) => {
    stoplist.sort((stopA, stopB) => {
        return haversine(start, {latitude: stopA.lat, longitude: stopA.lon})
            - haversine(start, {latitude: stopB.lat, longitude: stopB.lon})
    })

    return stoplist.slice(0, top);
}

// Given a route, returns a list of vehicles currently running on that route
const get_vehicles = (route) => {
    return new Promise((resolve, reject) => {
        (async () => {
            try {
                const vehURL = baseURL + '/getvehicles?key=' + bus_key + '&rt='
                                        + route + '&format=json&rtpidatafeed=Port%20Authority%20Bus';
                const response = await got(vehURL);
                const resp = JSON.parse(response.body);
                resolve(resp["bustime-response"].vehicle);                        
            } catch(e) {
                console.error(e);
            }
        })();
    })
}

// Given a stop and, optionally, a rt, returns a set of predicted arrivals and departures to and from the stop
const get_predictions = (stpid, rt) => {
    return new Promise((resolve, reject) => {
        (async () => {
            
            try {
                const predictURL = baseURL + '/getpredictions?key=' + bus_key
                        + '&stpid=' + stpid + '&format=json&rtpidatafeed=Port%20Authority%20Bus';
                const response = await got(predictURL);
                const resp = JSON.parse(response.body);
                // console.log(resp["bustime-response"]);
                if(resp["bustime-response"].error) {
                    resolve(resp["bustime-response"].error);
                }
                resolve(resp["bustime-response"].prd);
            } catch(e) {
                // console.error(e);
                return e;
            }
        })()
    })
}

// This function changes nested arrays to a one dimensional array
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
function flatDeep(arr, d = 1) {
    return d > 0 ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatDeep(val, d - 1) : val), [])
                 : arr.slice();
};

module.exports = {
    get_routes,
    get_dir,
    get_route_stops,
    get_closest_stops,
    get_vehicles,
    get_predictions
}
