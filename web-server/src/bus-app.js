// git testing
const fs = require('fs');
const path = require('path');
const express = require('express');
const haversine = require('haversine');
const bus_routes = require('./utils/pat');
const patSync = require('./utils/patSync');
const routesAndStops = require('./data/routes_and_stops.json');

// const test = require('./test');

const app = express();

app.use(express.static(path.join(__dirname, '../public')));

app.get('', (req, res) => {

    res.send("hello");
})

app.get('/bus', (req, res) => {

    const start = {
        latitude: 40.444420,
        longitude: -80.000632
    }
    const dest = {
        latitude: 40.408970,
        longitude:  -79.987326
    }

    /**
     * Proposed approach:
        * get closest stops for origin
        * get closest stops for destination
        *
        * if a route is shared, return that route, origin stop, destination stop
        * if no route is shared,
        *      if any route from orig is adjacent to a route from dest
        *          return route, orig stop, midO stop, midD stop, dest stop
     */


    // console.log("Num of routes: " + Object.keys(routesAndStops).length);

    let i = 0;
    for (key in routesAndStops) {
        console.log(key + " " + i++);
    }

    let y = patSync.adjacency(routesAndStops['88'], routesAndStops['P68']);

    if(y !== null) {
        res.send(y);
    } else {
        res.send("These routes are not adjacent");
    }
})

// app.get('/bus', async (req, res) => {

//     loc = "";

//     // let v = await bus_routes.get_all_stops();
//     // let y = await bus_routes.get_stops(88, "OUTBOUND", "Port Authority Bus");
//     // let z = await bus_routes.get_vehicles(88);


//     let closeStops = await bus_routes.get_closest_stops(start, allStops, 5);
//     let w = await bus_routes.get_predictions(closeStops[0].stpid);

//     console.log("W " + w);
//     res.send(w);
// })

app.listen(3000, async () => {
    // let loc = "";

    console.log('Server up on port 3000');

    if(!fs.existsSync("./web-server/src/data/routes_and_stops.json")
            || !fs.existsSync("./web-server/src/data/allStops.json"))  {
                patSync.route_and_stop_grabber();
            }
})
