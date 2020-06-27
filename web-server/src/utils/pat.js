// git testing

const got = require('got');
let get_loc = (loc) => {
    return new Promise((resolve, reject) => {
        resolve(loc);
    })
};

let get_routes = (loc) => {
    return new Promise((resolve, reject) => {
        (async () => {
            try {
                const busURL = 'http://truetime.portauthority.org/bustime/api/v3/getroutes?key=Tn3GgGfQdbNCmy3HMKix3XLFa&format=json';
                const response = await got(busURL);
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
        const dirURL = 'http://truetime.portauthority.org/bustime/api/v3/getdirections?key=Tn3GgGfQdbNCmy3HMKix3XLFa&rt='
                            + route.rt + '&format=json&rtpidatafeed=' + route.rtpidatafeed;
    
        const response = await got(dirURL);
        resp = JSON.parse(response.body);
        route.dir = resp["bustime-response"].directions;
        return route;
    })
    
    return Promise.all(rl);
}

const get_stops = (route, direction, rtpi) => {
    return new Promise((resolve, reject) => {
        (async () => {
            try {
                const stopsURL = 'http://truetime.portauthority.org/bustime/api/v3/getstops?key=Tn3GgGfQdbNCmy3HMKix3XLFa&rt='
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

const get_vehicles = (route) => {
    return new Promise((resolve, reject) => {
        (async () => {
            try {
                const vehURL = 'http://truetime.portauthority.org/bustime/api/v3/getvehicles?key=Tn3GgGfQdbNCmy3HMKix3XLFa&rt='
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

module.exports = {
    get_routes,
    get_dir,
    get_stops,
    get_vehicles
}
