const fs = require('fs');
const haversine = require('haversine');
// const ras = require ('../data/routes_and_stops.json');
// const stops = require ('../data/allStops.json');

/** Determines whether two routes can be considered adjacent
    to one another. Two routes are considered adjacent if they
    have stops that are within a specified distance of one another.
*/
const adjacency = (routeA, routeB) => {
    // if adjacent, return the stops
    // if not, return null
    let acceptable_dist = 0.1;
    const stopOptions = [];

    routeA.dir.forEach(directionA => {
        routeA[directionA.id].forEach(stopA => {
            routeB.dir.forEach(directionB => {
                routeB[directionB.id].forEach(stopB => {
                    let actual_dist = haversine({latitude: stopA.lat, longitude: stopA.lon},
                        {latitude: stopB.lat, longitude: stopB.lon}, {unit:'miles'})
                    if((actual_dist) <= acceptable_dist) {
                        stopOptions.push([routeA.rt, stopA, routeB.rt, stopB, actual_dist]);
                    }
                })
            })
        })
    })

    if(stopOptions.length != 0) {
        return stopOptions;
    } else {
        return null;
    }
}

const get_predictions = (stpid, rtid, vid) => {
    return new Promise((resolve, reject) => {
        (async () => {            
            try {
                const query = "";
                if(stpid) query = '&stpid=' + stpid;
                else if(stpid && rtid) query = '&stpid=' + stpid + '&rtid=' + rtid;
                else if(vid) query = '&vid=' + vid;
                else return "Invalid arguments";

                const predictURL = baseURL + '/getpredictions?key=' + bus_key
                        + query + '&format=json&rtpidatafeed=Port%20Authority%20Bus';
                const response = await got(predictURL);
                const resp = JSON.parse(response.body);
                
                if(resp["bustime-response"].error) {
                    resolve (resp["bustime-response"].error.msg);
                }

                resolve(resp["bustime-response"].prd);
            } catch(error) {
                console.error(error);
                
                // throw new Error(error);
            }
        })()
    })
}

const get_vehicles = (options) => {
    return new Promise((resolve, reject) => {
        (async () => {
            try {
                let vehURL = "";
                if(options.route) {
                    vehURL = baseURL + '/getvehicles?key=' + bus_key + '&rt='
                                            + options.route + '&format=json&rtpidatafeed=Port%20Authority%20Bus';
                } else if(options.vid) {
                    vehURL = baseURL + '/getvehicles?key=' + bus_key + '&vid='
                                            + options.vid + '&format=json&rtpidatafeed=Port%20Authority%20Bus';
                } else {
                    resolve("Invalid parameters");
                }
                const response = await got(vehURL);
                const resp = JSON.parse(response.body);
                resolve(resp["bustime-response"].vehicle);
                
            } catch(e) {
                console.error(e);
            }
        })();
    })
}

const closest_stops = (start, stoplist, top) => {
    stoplist.sort((stopA, stopB) => {
        return haversine(start, {latitude: stopA.lat, longitude: stopA.lon})
            - haversine(start, {latitude: stopB.lat, longitude: stopB.lon})
    })
    
    let walking_distance = haversine(start, {latitude: stoplist[0].lat, longitude: stoplist[0].lon}, {unit: 'mile'})

    return {walking_distance: walking_distance, sorted_stops: stoplist.slice(0, top)};
}

let time_convert = (military_time) => {
    if(parseInt(military_time.slice(0, 2)) > 12) {
        let hour = parseInt(military_time.slice(0, 2)) - 12;
        military_time = hour.toString() + military_time.slice(2) + " PM";
    } else {
        military_time += " AM";
    }
    return military_time;
}



module.exports = {
    get_predictions,
    closest_stops,
    get_vehicles
}