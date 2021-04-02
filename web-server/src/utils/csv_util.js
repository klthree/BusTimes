const fs = require('fs');
const readline = require('readline');
const path = require('path');
const haversine = require('haversine');
const eDistance = require('./helpers.js').euclideanDistance;
const PriorityQueue = require('./pq.js').PriorityQueue;
const all_stops = require ('../data/all_stops.json');
const getCoords = require('./geocoder.js').getCoords;

const tripsThroughStop = (stpid, wait) => {
    return new Promise((resolve, reject) => {
        let stopTimes = fs.createReadStream(path.join(__dirname, '../data/stop_times.txt'));
        let stopStream = readline.createInterface(
            {
                input: stopTimes
            }
        )

        let indexStpId = -1, indexTrpId = -1, indexArr = -1, indexDep = -1;
        let i = 0;
        let trips = {};
        
        stopStream.on('line', line => {
            const fields = line.split(',');

            if(i === 0) {
                // console.log(fields);
                trips["stop"] = stpid;
                indexArr = fields.indexOf('arrival_time');
                indexDep = fields.indexOf('departure_time');
                indexStpId = fields.indexOf('stop_id');
                indexTrpId = fields.indexOf('trip_id');
                i++;
            } else if(fields[indexStpId] === stpid
                        && valid(fields[indexDep], wait)) {
                trips[fields[indexTrpId]] = fields[indexArr];
            }
        }).on('close', () => {
            if(trips.length === 1) {
                reject("Stop " + stpid + " does not exist");
            } else {
                resolve(trips);
            }
        });
        return trips;
    })
}

// Accepts a route_id and returns an array of trip_id's
const tripsPerRoute = rtId => {
    return new Promise((resolve, reject) => {
        const trips = path.join(__dirname, '../data/trips.txt');
        const tripStream = fs.createReadStream(trips);
        const tripStreamReader = readline.createInterface({
            input: tripStream
        })

        let tripList = [];
        let i = 0;
        let indexRID = -1;
        let indexTID = -1;
        let indexDir = -1;

        tripStreamReader.on('line', line => {
            const fields = line.split(',');

            if(i === 0) {
                indexRID = fields.indexOf('route_id');
                indexTID = fields.indexOf('trip_id');
                indexDIR = fields.indexOf('direction_id');
                i++;
            }

            if(fields[indexRID] === rtId) {
                tripList.push({
                    trips: fields[indexTID],
                    direction: fields[indexDIR]
                });
            }
        }).on('close', () => {
            if(tripList.length === 0) {
                reject("No trips found");
            } else {
                resolve(Promise.all(tripList));
            }
        })
    })
}

const adjacency = (tripA, tripB) => {

}

const nearestTrips = (start) => {
    let closestStops = closest_stops(start, 5);
    let tripArray = [];

    (closestStops.sorted_stops).map(stop => {
        stopCodeToId(stop.stpid)
            .then(stpcd => tripsThroughStop(stpcd, 10))
            .then(trips => {
                tripArray.push(trips);
                return tripArray;
            })
            .then(result => {if(result.length === (closestStops.sorted_stops).length){console.log(result)}});
            console.log(Promise.all(tripArray))
    })
    // let x = Promise.all(tripArray);  
    // console.log(x)  
    return Promise.all(tripArray);
}

/**
 * Given a location, obtains starting coordinates with getCoords, and returns a list
 * of the 'top' closest transit stops.
 * 
 * @param {string} start - location name.
 * @param {number} top - number of stop names to return.
 * @returns {promise} - object containing 'q', priority q with list of closest stops.
 */
const closest_stops = (start, top) => {
    return new Promise(async (resolve, reject) => {
        let startCoords = await getCoords(start);
        console.log(startCoords.lat + " " + startCoords.lon);
        let splitter = ",";
        let latPos = 4;
        let lonPos = 5;
        let standardLen = 7;

        const greaterThan = (a, b) => {
            let aSplit = a.split(splitter);
            let bSplit = b.split(splitter);
            aLatPos = latPos + aSplit.length - standardLen;
            aLonPos = lonPos + aSplit.length - standardLen;
            bLatPos = latPos + bSplit.length - standardLen;
            bLonPos = lonPos + bSplit.length - standardLen;

            let distToA = eDistance({lat: aSplit[aLatPos], lon: aSplit[aLonPos]}, startCoords);
            let distToB = eDistance({lat: bSplit[bLatPos], lon: bSplit[bLonPos]}, startCoords);

            return distToA > distToB; 
        }
        
        const closestStops = new PriorityQueue(greaterThan, top);
        const stopFile = path.join(__dirname, "../data/stops.txt");
        const stopStream = fs.createReadStream(stopFile);
        const stopStreamReader = readline.createInterface({input:stopStream});
        let lineNumber = 0;

        stopStreamReader.on('line', (line) => {
            // let min = 1;
            if (lineNumber != 0) {
                closestStops.insert(line);
                // console.log();
            }

            lineNumber++;
        }).on('close', () => {
            resolve(closestStops);
        })
    })
    
    // let walking_distance = haversine(start, {latitude: all_stops[0].lat, longitude: all_stops[0].lon}, {unit: 'mile'})
}

// Testing for closest_stops()
// (async () => {
//     let place1 = "General Robinson st 15212";
//     let stops = await closest_stops(place1, 5);
//     console.log(stops);
// })();

const isCloseTo = (ptA, ptB, accDist) => {
    return haversine(ptA, ptB) <= accDist;
}

const stopIdToLoc = stpid => {
    return new Promise((resolve, reject) => {
        let stops = fs.createReadStream(path.join(__dirname, '../data/stops.txt'));
        let stopStream = readline.createInterface(
            {
                input: stops
            }
        )

        let i = 0;
        let indexLat = -1;
        let indexLon = -1;

        stopStream.on('line', line => {
            const fields = line.split(',');

            if(i === 0) {
                indexLat = fields.indexOf("stop_lat");
                indexLon = fields.indexOf("stop_lon");
                i++;
            } else if(fields[1] === stpid) {
                resolve({
                    latitude: fields[indexLat],
                    longitude: fields[indexLon]
                })
            }
        }).on('close', () => reject("Stop " + stpcd + " does not exist"));
    })
}

// Accepts "common" stop number and returns csv stop_id
const stopCodeToId = stpcd => {
    return new Promise((resolve, reject) => {
        let stops = fs.createReadStream(path.join(__dirname, '../data/stops.txt'));
        let stopStream = readline.createInterface(
            {
                input: stops
            }
        )

        let i = 0;

        stopStream.on('line', line => {
            const fields = line.split(',');

            if(i === 0) {
                // console.log(fields);
                i++;
            } else if(fields[1] === stpcd) {
                resolve(fields[0]);
            }

        }).on('close', () => reject("Stop " + stpcd + " does not exist"));
    })
}

// Accepts the common short route name and returns, as a Promise,
// the route_id as used in the relevant csv files.
const routeShortToId = rsn => {
    return new Promise((resolve, reject) => {
        const routes = path.join(__dirname, '../data/routes.txt');
        const rtStream = fs.createReadStream(routes);
        const rtStreamReader = readline.createInterface({
            input: rtStream
        })

        let i = 0;
        let indexShort = -1;
        let indexRouteId = -1;

        rtStreamReader.on('line', line => {
            const fields = line.split(',');
            if(i === 0) {
                indexShort = fields.indexOf('route_short_name');
                indexRouteId = fields.indexOf('route_id');
                i++;
            }
            
            if(fields[indexShort] === rsn) {
                resolve(fields[indexRouteId]);
            }
        }).on('close', () => {
            reject("Route not found");
        })
    })
}

const valid = (scheduled, wait) => {
    let today = new Date(Date.now()).toLocaleDateString();
    let sched = new Date(today + " " + scheduled);

    return sched.getTime() > Date.now() && sched.getTime() < addTime(wait);
}



// *****TESTING*****

// stopCodeToId('213')
//     .then(stopid => tripsThroughStop(stopid, 30))
//     .then(result => {
//         for(key in result) {
//             console.log(key);
//         }
// }).catch(err => console.log(err));

// nearestTrips(ptA).then(t => console.log('hit' + t));
// let time = '16:16:00';
// const event = new Date('August 19, 1975 23:15:30');
// let now = new Date(Date.now());
// let today = new Date(Date.now()).toLocaleDateString();
// const tester = new Date(today + " " + time);
// console.log(tester.getTime());
// console.log(now.getTime() - tester.getTime());

// Testing routeShortToId
// (async () => {
//     try {
//         let ans = await routeShortTorouteId('6');
//         console.log(ans);
//     } catch (err) {
//         console.log(err);
//     }
// })();

// routeShortTorouteId('41').then(result => tripsPerRoute(result)).then(result => console.log(result)).catch(err => console.log(err));

// let timespan = 30;
// let msIns = 1000;
// let sInm = 60;
// let maxWait = timespan * msIns * sInm;

// let now = new Date(Date.now());
// let nowTime = now.toLocaleTimeString('en-US', {hour12: false});
// console.log(nowTime);

// let end = new Date(Date.now() + maxWait);
// let lastTime = end.toLocaleTimeString('en-US', {hour12: false});
// console.log(lastTime);

// console.log(end.getTime());

module.exports = {
    closest_stops,
}