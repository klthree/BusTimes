const fs = require('fs');
const express = require('express');
const path = require('path');
const init = require('./utils/init');
const process = require('./utils/process');
const ras = require ('./data/routes_and_stops.json')
const all_stops = require ('./data/all_stops.json');

const app = express();

app.use(express.static(path.join(__dirname, '../public')));
const views = path.join(__dirname, '../templates/views');
app.set('view engine', 'pug');
app.set('views', views);

app.get('/bus', (req, res) => {
    
    const start = {
        latitude: 40.444498,
        longitude:  -80.000726
    }
    const dest = {
        latitude: 40.463261,
        longitude: -79.991807
    }

    const near_start = process.closest_stops(start, all_stops, 5);
    const near_dest = process.closest_stops(dest, all_stops, 5);

    const to_take = [];
    
    // https://stackoverflow.com/a/32961666
    near_start.sorted_stops.forEach(stop_s => {
        console.log(stop_s);
        near_dest.sorted_stops.forEach(stop_d => {
            stop_s.routes.forEach(rt_s => {
                stop_d.routes.forEach(rt_d => {
                    if(JSON.stringify(rt_s) === JSON.stringify(rt_d)) {
                        to_take.push({rtnm: rt_s, start: stop_s.stpnm, destination: stop_d.stpnm});
                    }
                })
            })
        })
    })

    // let result = init.routes_per_stop();

    res.send(to_take);

    // loc = "";

    // let rs = await init.get_routes(loc);
    // console.log(rs.length);

    // let rd = await init.get_dir(rs);

    // init.get_stops_per_route(ras)
    // .then(response => {
    //     fs.writeFileSync("./web-server/src/data/routes_and_stops3.json", JSON.stringify(response), 'utf8', () => {});
    //     res.send(response);
    // })

    
})

app.listen(3000, async () => {
    console.log('Server up on port 3000');
})