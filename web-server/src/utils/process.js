const fs = require('fs');
const path = require('path');
const readline = require('readline');
const got = require('got');
const haversine = require('haversine');
const distanceBetweenStops = require('./helpers.js').distanceBetweenStops;
const ras2 = require ('../data/routes_and_stops2.json');
const all_stops = require ('../data/all_stops');
const baseURL = 'http://truetime.portauthority.org/bustime/api/v3';
// const bus_key = require('./keys').busKey;
const closestStops = require('./csv_util.js').closest_stops;

const createBaseGraph = () => {
    return new Promise((resolve, reject) => {
        const stopFile = path.join(__dirname, "../data/stops.txt");
        console.log(stopFile);
        const stopStream = fs.createReadStream(stopFile);
        const stopStreamReader = readline.createInterface({input:stopStream});
        let lineNumber = 0;
        const stopGraph = {};
        console.log("Hello");

        stopStreamReader.on('line', (line) => {
            if (lineNumber != 0) {
                stopGraph[line] = [];               
            }

            lineNumber++;
        }).on('close', () => {
            console.log("Closing...");
            resolve(stopGraph);
        })
    })
}

// (async () => {
//     const sg = await createBaseGraph();

//     console.log(sg);
// })();

const addWalkingNodes = async baseGraph => {

    const finalGraph = {};

    for (const stopNode in baseGraph) {
    
        let stopid = stopNode.split(",")[0];
        finalGraph[stopNode.split(",")[0]] = [];
    
        for (const potentialNeighbor in baseGraph) {
    
            const distance = distanceBetweenStops(stopNode, potentialNeighbor);
    
            if (distance < 0.15) {
                
                finalGraph[stopid].push({stopid: potentialNeighbor.split(",")[0], method: "walk", distance: distance});
            }
        }
    } 
    
    fs.writeFileSync("./web-server/src/data/stopGraph.json", JSON.stringify(finalGraph), 'utf8', () => {});
    
}

(async () => {
    const graphSkeleton = await createBaseGraph();
    addWalkingNodes(graphSkeleton);
})();

const pathfinder = (start, end) => {
    const near_start = closest_stops(start, all_stops, 5);
    const near_dest = closest_stops(end, all_stops, 5);

    const to_take = [];
    
    // https://stackoverflow.com/a/32961666
    outer_loop: near_start.sorted_stops.forEach(stop_s => {
        near_dest.sorted_stops.forEach(stop_d => {
            stop_s.routes.forEach(rt_s => {
                stop_d.routes.forEach(rt_d => {
                    if(JSON.stringify(rt_s) === JSON.stringify(rt_d)) {
                        to_take.push({rtnm: rt_s, start: stop_s.stpnm, destination: stop_d.stpnm});
                    } else if(adjacency(ras2[rt_s.rtnm], ras2[rt_d.rtnm]) !== null) {
                        to_take.push({
                            rtnma: rt_s,
                            start: stop_s.stpnm,
                            connection: adjacency(ras2[rt_s.rtnm], ras2[rt_d.rtnm]).slice(0, 2),
                            rtnmd: rt_d,
                            destination: stop_d.stpnm,
                        })
                    }
                })
            })
        })
    })
    
    return to_take;


    /* if 'solution' array !isempty
     *      return solution
     * find lists of closest stops 
     *  iterate through each list of stops
     *      for each stop, iterate through routes
     *      if two stops share a route, push to 'solution' array
     *      push each route to 'seen' array
     *  
     *  if no two stops share a route
     *      iterate through each stop's routes again
     *          compare each route against all known routes for adjacency, ignoring routes in "seen"
     *  
    */

}

/** Determines whether two routes can be considered adjacent
    to one another. Two routes are considered adjacent if they
    have stops that are within a specified distance of one another.
    @param {Object} routeA
    @param {Object} routeB
    @return {Object} - Array of adjacent stops
*/
const adjacency = (routeA, routeB) => {
    // if adjacent, return the stops
    // if not, return null
    let acceptable_dist = 0.01;
    const stopOptions = []; 

    // console.log(routeA)
    // console.log(typeof routeA.dir);
    // console.log(routeA.dir[0].id);

    for(i = 0; i < routeA.dir.length; i++) {
        for(j = 0; j < routeA[routeA.dir[i].id].length; j++) {
            for(k = 0; k < routeB.dir.length; k++) {
                for(l = 0; l < routeB[routeB.dir[i].id].length; l++) {
                    let actual_dist = haversine({latitude: routeA[routeA.dir[i].id][j].lat, longitude: routeA[routeA.dir[i].id][j].lon},
                        {latitude: routeB[routeB.dir[i].id][l].lat, longitude: routeB[routeB.dir[i].id][l].lon}, {unit:'miles'});
                    if(actual_dist <= acceptable_dist) {
                        stopOptions.push([routeA.rt, routeA[routeA.dir[i].id][j], routeB.rt, routeB[routeB.dir[i].id][l], actual_dist]);
                    }
                }
            }
        }
    }

    if(stopOptions.length != 0) {
        return stopOptions;
    } else {
        return null;
    }
}

const get_predictions = async (stpid, rtid, vid) => {
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
            return resp["bustime-response"].error.msg;
        }

        return resp["bustime-response"].prd;
    } catch(error) {
        console.error(error);
        
        // throw new Error(error);
    }
}

const get_vehicles = async (options) => {
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
        
        return resp["bustime-response"].vehicle;
    } catch(e) {
        console.error(e);
    }
}
// get_vehicles({route: 6}).then(resp => console.log(resp));


module.exports = {
    pathfinder,
    get_predictions,
    get_vehicles,
    adjacency
}