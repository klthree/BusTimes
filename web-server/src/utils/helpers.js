/*
    const euclideanDistance = (ptA, ptB)
    const containsTrip = (obj, tripId)    
    const containsStop = (arr, stopId)
    const trimmer = (obj)
*/


/**
 * Takes two objects with properties lat and lon.
 * 
 * @param {Object} ptA 
 * @param {Object} ptB 
 * @returns {number} - Approximate Euclidean distance between ptA and ptB
 */
const euclideanDistance = (ptA, ptB) => {
    let latA, lonA, latB, lonB;

    if(typeof ptA.lat === "string") {
        latA = parseFloat(ptA.lat);
    } else {
        latA = ptA.lat;
    }
    if(typeof ptA.lon === "string") {
        lonA = parseFloat(ptA.lon);
    } else {
        lonA = ptA.lon;
    }
    if(typeof ptB.lat === "string") {
        latB = parseFloat(ptB.lat);
    } else {
        latB = ptB.lat;
    }
    if(typeof ptB.lon === "string") {
        lonB = parseFloat(ptB.lon);
    } else {
        lonB = ptB.lon;
    }

    // console.log(latA + ", " + lonA + ", " + latB + ", " + lonB + ", ")
    const d = Math.sqrt(Math.pow((latA - latB), 2) + Math.pow((lonA - lonB), 2));
    // console.log(d);
    return d;
}

// TEST: euclideanDistance
// (() => {
//     console.log("\nTesting distance(ptA, ptB):");
//     const ptA = {
//         lat: 40.444384,
//         lon: -80.000594
//     }
//     const ptB = {
//         lat: 40.463034,
//         lon: -79.991610
//     }
//     let start = process.hrtime();
//     console.log(distance(ptA, ptB));
//     let end = process.hrtime(start);
//     console.log(end[0] + " " + end[1]/1000000);
// })();

/**
 * Iterates through obj searching for tripId, returning index of match, or -1 if not found.
 * 
 * @param {Object} obj - Array containing tripId's, or object containing tripId's 
 * @param {String} tripId - Numerical id for a trip, used in trips.txt, stop_times.txt,
 * @returns 
 */
const containsTrip = (obj, tripId) => {
    let tripTimeA = process.hrtime();
    // console.log(tripId)
    if(Array.isArray(obj)) {
        for(let i = 0; i < obj.length; i++) {
            if(obj[i].trip === tripId) {
                let tripTimeB = process.hrtime(tripTimeA);
                // console.log(tripTimeB);
                return i;
            };
        }
    } else {
        let keyList = Object.keys(obj);
        if(keyList.length === 0) return -1;
        // if(keyList.includes(tripId)) return keyList.indexOf(tripId);
        // console.log("LIST OF KEYS!")
        // console.log(keyList)
        for(let i = 0; i < keyList.length; i++) {
            // console.log(keyList.length)
            // console.log(keyList[i])
            if(keyList[i] === tripId) {
                let tripTimeB = process.hrtime(tripTimeA);
                // console.log(tripTimeB);
                return i;
            };
        }
    }
    let tripTimeB = process.hrtime(tripTimeA);
    // console.log(tripTimeB);
    return -1;
}

/**
 * Iterates through array arr and return the index of stopId, or -1 if not found.
 * @param {Object} arr 
 * @param {String} stopId 
 * @returns 
 */
const containsStop = (arr, stopId) => {
    for(let i = 0; i < arr.length; i++) {
        if(arr[i][0] === stopId) {
            return i;
        };
    }
    return -1;
}

/**
 * 
 * @param {Object} obj 
 */
const trimmer = (obj) => {
    let keyList = Object.keys(obj);
    for(let i = 0; i < keyList.length; i++) {
        if(obj[keyList[i]].destination.length === 0) {
            delete obj[keyList[i]];
        }
    }
}

module.exports = {
    euclideanDistance,
    containsTrip,
    containsStop,
    trimmer
}
