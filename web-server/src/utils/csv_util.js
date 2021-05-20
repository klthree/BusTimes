const fs = require('fs');
const readline = require('readline');
const path = require('path');
const haversine = require('haversine');
const eDistance = require('./helpers.js').euclideanDistance;
const PriorityQueue = require('./pq.js').PriorityQueue;
const all_stops = require ('../data/all_stops.json');
const getCoords = require('./geocoder.js').getCoords;
const addTime = require('./dateTimeHelpers').addTime;
const stringifyBoolean = require('@mapbox/mapbox-sdk/services/service-helpers/stringify-booleans');
const { resolve } = require('path');

const routeIdFromTripId = (tripId) => {
    return new Promise((resolve, reject) => {
        let trip = {};
        let trips = fs.createReadStream(path.join(__dirname, '../data/trips.txt'));
        let tripStream = readline.createInterface(
            {
                input: trips
            }
        )

        tripStream.on("line", line => {
            let lineArr = line.split(",");

            if (lineArr[2] === tripId) {
                // console.log("Route found");
                trip = {
                    route: lineArr[0],
                    headsign: lineArr[3]
                }
            }
        }).on("close", () => {
            if (trip.route != undefined) {
                resolve(trip);
            } else {
                reject("No route could be found that matches that trip.");
            }
        })
    })
}

// (async () => {
//     let route = await routeIdFromTripId("3953-1639101");
//     console.log(route);
// }
// )();
/**
 * For a given stop, returns the trips through that stop between the current time
 * and 'wait' minutes in the future.
 * 
 * @param {string} stpid 
 * @param {number} wait
 * @returns {object}
 */
const tripsThroughStop = (stpid, wait) => {
    return new Promise((resolve, reject) => {
        let stopTimes = fs.createReadStream(path.join(__dirname, '../data/stop_times.txt'));
        let stopStream = readline.createInterface(
            {
                input: stopTimes
            }
        )

        let stopIdIndex = -1, tripIdIndex = -1, arrivalIndex = -1, departureIndex = -1;
        let i = 0;
        let trips = {};
        
        stopStream.on('line', async line => {
            const fields = line.split(',');

            if(i === 0) {
                // console.log(fields);
                trips["stop"] = stpid;
                arrivalIndex = fields.indexOf('arrival_time');
                departureIndex = fields.indexOf('departure_time');
                stopIdIndex = fields.indexOf('stop_id');
                tripIdIndex = fields.indexOf('trip_id');
                i++;
            } else if(fields[stopIdIndex] === stpid
                        && valid(fields[departureIndex], wait)) {
                let rt = await routeIdFromTripId(fields[tripIdIndex]);
                trips[rt.headsign] = fields[arrivalIndex];
            }
        }).on('close', () => {
            if(trips.length === 1) {
                reject("Stop " + stpid + " does not exist");
            } else {
                if (Object.keys(trips).length === 1) {
                    trips.noTrips = "No upcoming trips. Try a different time frame?";
                }
                resolve(trips);
            }
        });
        return trips;
    })
}

// (async () => {
//     console.log(await tripsThroughStop("N70015", 60 * 20));
// })();


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

/**
 * Given a location, obtains starting coordinates with getCoords, and returns a list
 * of the 'top' closest transit stops.
 * 
 * @param {string} start - location name.
 * @param {number} top - number of stop names to return.
 * @returns {promise} - object containing 'q', priority q with list of closest stops.
 */
 const closest_stops = (start, acceptableDistance) => {
    return new Promise(async (resolve, reject) => {
        let locData = null;
        try {
            locData = await getCoords(start)
        } catch(error) {
            reject(error);
            // console.log("Inside closest_stops: " + error);
            return;
        };
        
        // let startCoords = locData.coordinates;
        
        // let placename = locData.placename;
    
        // console.log(startCoords.lat + " " + startCoords.lon);
        let splitter = ",";
        let latPos = 4;
        let lonPos = 5;
        let standardLen = 7;

        // const greaterThan = (a, b) => {
        //     let aSplit = a.split(splitter);
        //     let bSplit = b.split(splitter);
        //     aLatPos = latPos + aSplit.length - standardLen;
        //     aLonPos = lonPos + aSplit.length - standardLen;
        //     bLatPos = latPos + bSplit.length - standardLen;
        //     bLonPos = lonPos + bSplit.length - standardLen;

        //     let distToA = eDistance({lat: aSplit[aLatPos], lon: aSplit[aLonPos]}, startCoords);
        //     let distToB = eDistance({lat: bSplit[bLatPos], lon: bSplit[bLonPos]}, startCoords);

        //     return distToA > distToB; 
        // }
        
        let startSplit = start.split(splitter);
        let startLatPosition = latPos + startSplit.length - standardLen;
        let startLonPosition = lonPos + startSplit.length - standardLen;
        let startLatitude = startSplit[startLatPosition];
        let startLongitude = startSplit[startLonPosition];
        let stopname = start.match(/\".*\"/);
        console.log(startLatitude);
        console.log(startLongitude);

        const closeEnough = (stopA, acceptDist) => {
            let stopASplit = stopA.split(splitter);
            stopALatPos = latPos + stopASplit.length - standardLen;
            stopALonPos = lonPos + stopASplit.length - standardLen;
            let distToA = haversine({latitude: startLatitude, longitude: startLongitude}, {latitude: stopASplit[stopALatPos], longitude: stopASplit[stopALonPos]}, {unit: 'mile'})
            
            return distToA <= acceptDist;
        }

        const closestStops = [];
        
        // if (top != 0) {
        //     closestStops = new PriorityQueue(greaterThan, top);
        // } 
        
        const stopFile = path.join(__dirname, "../data/stops.txt");
        const stopStream = fs.createReadStream(stopFile);
        const stopStreamReader = readline.createInterface({input:stopStream});
        let lineNumber = 0;

        stopStreamReader.on('line', (line) => {
            if (lineNumber != 0 && closeEnough(line, acceptableDistance)) {
                closestStops.push(line)                
            }

            lineNumber++;
        }).on('close', () => {
            resolve({stopPQ: closestStops, stopname: stopname});
        })
    })

    
    // let walking_distance = haversine(start, {latitude: all_stops[0].lat, longitude: all_stops[0].lon}, {unit: 'mile'})
}

// Testing for closest_stops()
// (async () => {
//     let place1 = "aflkewwjfalwkjoivwaejvoiwjvoiwev";
//     let stops = await closest_stops(place1, 5);
//     console.log(stops);
// })();

/**
 * 
 * @param {string} start - starting location 
 * @returns 
 */
const nearestTrips = async (start) => {
    let perfStart = process.hrtime.bigint();
    let closestStops = await closest_stops(start, 10);
    let end = process.hrtime.bigint();
    let duration = end - perfStart;
    console.log("closest_stops() took " + duration + " nanoseconds, or " + (duration / BigInt(1000000000) + " seconds"));
    
    let stopArr = closestStops.stopPQ.q.splice(1);
    let tripArray = [];
    console.log(stopArr);
    let wait = 60;

    let startLoop = process.hrtime.bigint();
    for (let i = 1; i < stopArr.length; i++) {
        let stpid = stopArr[i].match(/^(\w*)\b/);
        let stpName = stopArr[i].match(/".*"/);
        
        perfStart = process.hrtime.bigint();
        tripArray.push({stopName: stpName[0], trips: await tripsThroughStop(stpid[0], wait)})
        end = process.hrtime.bigint();
        console.log("tripsThroughStop() took " + (end - perfStart) + " nanoseconds");
    }
    let endLoop = process.hrtime.bigint();
    console.log("tripsThroughStop() took " + ((endLoop - startLoop) / BigInt(1000000000)) + " seconds");

    return Promise.all(tripArray);
}
// (async () => {
//     let nTrips = await nearestTrips("Haslage Ave");
//     console.log(nTrips);
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