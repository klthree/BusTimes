const fs = require('fs');
const got = require('got');
const bus_key = require('./key')();
const ras_obj = require ('../data/routes_and_stops2.json');
const baseURL = 'http://truetime.portauthority.org/bustime/api/v3';
const stops = require('../data/all_stops.json');

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
                        // console.log(route.rt);
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

// Given an array of routes, with each route object containing an array of possible directions,
// add comprehensive lists of stops per direction per route and return.
const get_stops_per_route = async (route_dir_list) => {
    const uniqStops = [];
    let end2 = await Promise.all(route_dir_list.map(async route => {
        let end = await Promise.all(route.dir.map(async (direction) => {
            let dirId = direction.id;
            const stopsURL = baseURL + '/getstops?key=' + bus_key + '&rt='
                + route.rt + '&dir=' + dirId + '&format=json&rtpidatafeed='
                + route.rtpidatafeed;   
            const response = await got(stopsURL);
            const resp = JSON.parse(response.body);

            resp["bustime-response"].stops.forEach(stp => {
                if(uniqStops.filter(st => st.stpid === stp.stpid).length === 0) {
                    uniqStops.push(stp);
                }
            })

            route[dirId] = (resp["bustime-response"].stops);            
        }))
        return route;
    }));
    fs.writeFileSync("./web-server/src/data/all_stops.json", JSON.stringify(uniqStops), 'utf8', () => {});
    
    return end2;
}

const routes_per_stop = (stopid) => {
    if(!stopid) {   
        stops.forEach(stop => {
            stop["routes"] = [];
            Object.values(ras_obj).forEach(route =>{
                route.dir.forEach(direction => {
                    route[direction["id"]].forEach(stp => {
                        if(stop.stpid === stp.stpid && !stop.routes.includes(route.rt)) {
                            stop.routes.push({rtnm: route.rt, dir: direction.id});
                            // console.log(route.dir);
                            // console.log(stop);
                        }
                    })
                })
            })
        })
        fs.writeFileSync("./web-server/src/data/all_stops.json", JSON.stringify(stops), 'utf8', () => {});
    } else {
        rts = [];
        Object.values(ras_obj).forEach(route =>{
            route.dir.forEach(direction => {
                route[direction["id"]].forEach(stp => {
                    if(stopid === stp.stpid) {
                        rts.push(route.rt + " " + direction.id);
                        // console.log(stop);
                    }
                })
            })
        })
        return rts;
    }
        console.log(stops.length);
    
}

let objectifier = (route_list) => {
    let r_obj = route_list.reduce((acc, curr) => {
        if(!(curr.rt in acc)) {
            acc[curr.rt] = curr;
        }

        return acc; 
    }, {});

    fs.writeFileSync("./web-server/src/data/routes_and_stops2.json", JSON.stringify(r_obj), 'utf8', () => {});
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
    get_stops_per_route,
    routes_per_stop,
    objectifier
}