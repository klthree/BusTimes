const fs = require('fs');
const readline = require('readline');
const path = require('path');
const haversine = require('haversine');
const routesAndStops = require('./data/routes_and_stops.json');
const pq = require('./utils/pq.js').PriorityQueue;
const helpers = require('./utils/helpers.js');

let read = (filename) => {
    return new Promise((resolve, reject) => {
        // console.log(__dirname)
        const routePath = path.join(__dirname, './data/' + filename + '.txt');
        const routeStream = fs.createReadStream(routePath);
        const rs = readline.createInterface({
            input: routeStream
        })

        let stopPQ;
        let hrb = process.hrtime();
        let i = 0;
        let headings = [];
        
        // https://stackoverflow.com/a/57798824
        rs.on('line', (line) => {
            let values = line.split(',');

            if(i === 0) {
                const begin = {
                    latitude: 40.444384,
                    longitude: -80.000594
                }
                headings = values;
                stopPQ = new pq(10, (a, b) => {
                    ptA = {
                        latitude: a[headings.indexOf('stop_lat')],
                        longitude: a[headings.indexOf('stop_lon')]
                    }
                    ptB = {
                        latitude: b[headings.indexOf('stop_lat')],
                        longitude: b[headings.indexOf('stop_lon')]
                    }   

                    return (haversine(ptA, begin) - haversine(ptB, begin)) > 0;
                })

                i++;
            } else {
                const begin = {
                    latitude: 40.444384,
                    longitude: -80.000594
                }
                values.push(" " + haversine({
                    latitude: values[headings.indexOf('stop_lat')],
                    longitude: values[headings.indexOf('stop_lon')]
                }, begin));
                stopPQ.insert(values);
                // console.log(stopPQ);
                // console.log(values[4]);
                i++;
            }
        }).on('close', () => {
            let hre = process.hrtime(hrb);
            console.log(i)
            console.log(hre[0] + "s " + hre[1]/1000 + "ms");
            resolve(Promise.all(stopPQ.get_q()));
        })

    })
}

const reader = (filename, callback, ...args) => {
    return new Promise((resolve, reject) => {
        // console.log(__dirname)
        let hrb = process.hrtime();
        const routePath = path.join(__dirname, './data/' + filename + '.txt');
        const routeStream = fs.createReadStream(routePath);
        const rs = readline.createInterface({
            input: routeStream
        })

        let i = 0;
        let headings = [];
        let result = [];
        
        // https://stackoverflow.com/a/57798824
        rs.on('line', (line) => {
            let values = line.split(',');

            if(i === 0) {
                headings = values;
                i++;
            } else {
                callback(values, headings, result);
            }
        }).on('close', () => {
            let hre = process.hrtime(hrb);
            console.log(hre[0] + "s " + hre[1]/1000 + "ms");
            resolve(Promise.all(result));
        })

    })
}

reader('stops', (values, headings, result) => {
    // console.log(values[headings.indexOf('stop_name')]);
    if(values[headings.indexOf('stop_id')][0] === 'N') {
        result.push(values[headings.indexOf('stop_id')]);
    }
})
.then(result => {console.log(result)})

// read('stops').then(res => {
//     console.log(typeof res)
//     for(let i = 0; i < res.length; i++) {
//         console.log(i + " " + res[i]);
//     }
// });
