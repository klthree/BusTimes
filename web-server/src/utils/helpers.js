/*
    const getToday = ()
    const addTime = (toAdd)
    const to12 = (time)
    const before = (timeA, timeB)
    const euclideanDistance = (ptA, ptB)
    const checkTime = (datetimeToTest, wait) 
    const containsTrip = (obj, tripId)    
    const containsStop = (arr, stopId)
    const trimmer = (obj)
    */

/**
 * @returns {string} - Current day of week as "Sunday", "Saturday", or "Weekday"
 */
const getToday = () => {
    let today = new Date(Date.now()).getDay();
    
    if(today === 0) {
        return "Sunday";
    } else if(today === 6) {
        return "Saturday";
    } else {
        return "Weekday";
    }
}

/**
 * 
 * @param {number} toAdd - Number of minutes to add to current time
 * @returns {number} - current time + toAdd in ms
 */
const addTime = (toAdd) => {
    let msps = 1000;
    let spm = 60;
    let current = new Date(Date.now());
    let msAdd = toAdd * spm * msps;
    let future = current.getTime() + msAdd;
    
    return current.getTime() + msAdd;
}

// TEST: addTime
// (() => {
//     let wait = 19;

//     console.log("\nTesting addTime(toAdd)");
//     console.log("now: " + new Date(Date.now()).toLocaleTimeString());
    
//     let start = process.hrtime();
//     let later = new Date(addTime(wait)).toLocaleTimeString();
//     console.log("added " + wait + ": " + later);

//     let end = process.hrtime(start);
//     console.log(end[0] + "s " + end[1]/1000000 + "ms")
// })();

/**
 * Converts a time from 24 hour to 12 hour
 * @param {string} time - as hh:mm:ss
 * @returns {string, undefined} current time in 12 hour format, hh:mm:ss, or undefined
 * if the hours segment of the argument provided represents a time greater than or 
 * equal to 25 hours.
 */
const to12 = (time) => {
    let hr = time.slice(0, 2);

    if(parseInt(hr) == 24) {
        time = time.replace(hr, hr % 2);
    } else if (parseInt(hr) > 24) {
        return undefined;
    }
    
    const today = new Date(Date.now()).toLocaleDateString();
    return new Date(today + " " + time).toLocaleTimeString();
}

// TEST: to12
(() => {
    console.log("\nTesting to12(time):")
    let start = process.hrtime();
    let result = to12('25:38:59');
    let end = process.hrtime(start);

    console.log(result);
    console.log("That took " + end[0] + "s " + end[1]/1000000 + "ms")
})();

/**
 * 
 * @param {string} timeA 
 * @param {string} timeB - "hh:mm:ss"
 * @returns {boolean} - true if timeA is earlier than time B
 */
const before = (timeA, timeB) => {
    const today = new Date(Date.now()).toLocaleDateString();
    return (new Date(today + " " + timeB).getTime() - new Date(today + " " + timeA).getTime()) > 0;
}

// TEST: before
// (() => {
//     console.log("\nTesting before(timeA, timeB):");
//     let start = process.hrtime();
//     console.log(before('20:19:09', '23:22:45'));
//     let end = process.hrtime(start);
// console.log(end[0] + " " + end[1]/1000000);
// })();

/**
 * Accepts an Object dateTimeToTest and returns true if the time it specifies falls between 
 * now and 'wait' minutes from now. Returns false if time is outside that window or undefined.
 * @param {Object} datetimeToTest - Date and time to test. {year, month, day, hour, minute}
 * @param {number} wait - Number of minutes
 * @returns {boolean} - true if time is 
 */
 const checkTime = (datetimeToTest, wait) => {
    let secPerHr = 60;
    let milliPerSec = 1000;
    let waitInMilli = wait * secPerHr * milliPerSec;
    let toTest = new Date(datetimeToTest.year, datetimeToTest.month, datetimeToTest.day,
                            datetimeToTest.hour, datetimeToTest.minute);
    // console.log(toTest.toLocaleString());
    let toTestMilli = toTest.getTime();
    
    return toTestMilli > Date.now() && toTestMilli < Date.now() + waitInMilli;
}

// Test checkTime()
/*timeToTest = {
    year: 2021,
    month: 2,
    day: 26,
    hour: 0,
    minute: 42
};
console.log(checkTime(timeToTest, 30));
console.log("Done testing checkTime()");
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
    getToday,
    addTime,
    to12,
    before,
    euclideanDistance,
    checkTime,
    containsTrip,
    containsStop,
    trimmer
}
