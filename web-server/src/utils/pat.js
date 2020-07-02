// git testing
const got = require('got');
const bus_key = require('./key')();

const baseURL = 'http://truetime.portauthority.org/bustime/api/v3';

let get_loc = (loc) => {
    return new Promise((resolve, reject) => {
        resolve(loc);
    })
};

// Returns a list of bus and rail routes in Pittsburgh.
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

// Given an array of routes, returns possible directions. Largely trivial for
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

// Given a route and direction, returns a list of stops along that route
const get_stops = (route, direction, rtpi) => {
    return new Promise((resolve, reject) => {
        (async () => {
            try {
                const stopsURL = baseURL + '/getstops?key=' + bus_key + '&rt='
                                        + route + '&dir=' + direction + '&format=json&rtpidatafeed=' + rtpi;
                const response = await got(stopsURL);
                const resp = JSON.parse(response.body);
                resolve(resp["bustime-response"].stops);
            } catch(e) {
                console.error(e);
            }
        })();
    })
}

// const get_all_stops = () {
//     return new Promise((resolve, reject) => {
//         (async () => {
//             try{

//             } catch(e) {
//                 console.error(e);
//             }
//         })()
//     })
// }

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

const get_predictions = (stpid, rt) => {
    return new Promise((resolve, reject) => {
        (async () => {
            
            try {
                const predictURL = baseURL + '/getpredictions?key=' + bus_key
                        + '&stpid=' + stpid + '&format=json&rtpidatafeed=Port%20Authority%20Bus';
                const response = await got(predictURL);
                const resp = JSON.parse(response.body);
                resolve(resp["bustime-response"].prd);
            } catch(e) {
                console.error(e);
            }
        })()
    })
}

module.exports = {
    get_routes,
    get_dir,
    get_stops,
    get_vehicles,
    get_predictions
}
