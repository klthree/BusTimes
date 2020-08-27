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

// Takes time in minutes to add to current time and returns result in ms
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

// Takes a string representing time in 24-hr format and returns that time in 12-hr format
const to12 = (time) => {
    let hr = time.slice(0, 2);

    if(parseInt(hr) >= 24) {
        time = time.replace(hr, hr % 2);
    }
    
    const today = new Date(Date.now()).toLocaleDateString();
    return new Date(today + " " + time).toLocaleTimeString();
}

// TEST: to12
// (() => {
//     console.log("\nTesting to12(time):")
//     let start = process.hrtime();
//     let result = to12('14:03:59');
//     let end = process.hrtime(start);

//     console.log(result);
//     console.log(end[0] + "s " + end[1]/1000000 + "ms")
// })();

// Takes two times as strings and returns true if the time specified by the first argument precedes the second
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


// takes two objects with properties lat and lon
// returns rough approximation of the distance between those points. Not accurate on larger scale.
let distance = (ptA, ptB) => {
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

// TEST: distance
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
 * 
 * time, string - Time to evaluate
 * wait, number - Time, in minutes, to establish upper boundary on valid time.
 * returns true if 'time' is within the temporal window
 * delimited by the current time and the current time + wait.
 */
const checkTime = (time, wait) => {
    if(time === undefined) {
        return false;
    }
    let nowHours = new Date(Date.now()).getHours();

    if(nowHours === 0) {
        nowHours = 24;
    } else if(nowHours === 1) {
        nowHours = 25;
    } else if(nowHours === 2) {
        nowHours = 26;
    }

    let nowMinutes = new Date(Date.now()).getMinutes();
    // console.log("NOW: " + nowMinutes)
    let testHours = parseInt(time.slice(0, 2));
    // console.log("TEST: " + testHours)
    let testMinutes = parseInt(time.slice(3, 5));
    // console.log("TEST: " + testMinutes)
    let futureHours = Math.floor(wait / 60) + nowHours;
    // console.log("FUTURE: " + futureHours)
    let futureMinutes = (wait % 60) + nowMinutes;
    // console.log("FUTURE: " + futureMinutes)

    if((testHours > nowHours
            || (testHours === nowHours && testMinutes > nowMinutes))
        && ((testHours < futureHours)
            || (testHours === futureHours && testMinutes < futureMinutes)))
    {
        return true;
    }

    return false;
}

// console.log(checkTime('20:38:00', 30));

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

const containsStop = (arr, stopId) => {
    for(let i = 0; i < arr.length; i++) {
        if(arr[i][0] === stopId) {
            return i;
        };
    }
    return -1;
}

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
    distance,
    checkTime,
    containsTrip,
    containsStop,
    trimmer
}