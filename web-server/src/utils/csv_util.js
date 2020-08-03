const fs = require('fs');
const readline = require('readline');
const path = require('path');
const haversine = require('haversine');
const all_stops = require ('../data/all_stops.json');

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

// Takes starting coordinates, a complete list of bus stops,
// and the desired number of stops, and returns 'top' stops
// nearest the starting coordinates.
const closest_stops = (start, top) => {4
    all_stops.sort((stopA, stopB) => {
        return haversine(start, {latitude: stopA.lat, longitude: stopA.lon})
            - haversine(start, {latitude: stopB.lat, longitude: stopB.lon})
    })
    
    let walking_distance = haversine(start, {latitude: all_stops[0].lat, longitude: all_stops[0].lon}, {unit: 'mile'})

    return {walking_distance: walking_distance, sorted_stops: all_stops.slice(0, top)};
}

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

const addTime = (toAdd) => {
    let msps = 1000;
    let spm = 60;
    let current = new Date(Date.now());
    let msAdd = toAdd * spm * msps;
    let future = current.getTime() + msAdd;
    
    return (current.getTime() + msAdd);
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

const ptA = {
    latitude: 40.444384,
    longitude: -80.000594
}
const ptB = {
    latitude: 40.463034,
    longitude: -79.991610
}

nearestTrips(ptA).then(t => console.log('hit' + t));
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