const path = require('path');
const express = require('express');
// const expressValidator = require('express-validator');
const getCoords = require('./utils/geocoder.js').getCoords;
const closestStops = require('./utils/csv_util').closest_stops;

const app = express();

app.use(express.static(path.join(__dirname, '../public')));
const views = path.join(__dirname, '../templates/views');
app.set('view engine', 'pug');
app.set('views', views);

app.get('/', (req, res) => {
    res.render('index', {
        title: 'Homepage',
        message: 'Enter Location:'
    });
})

app.get('/bus', (req, res) => {
    if (req.query.loc) {
        console.log(req.query.loc);
        getCoords(req.query.loc) 
        .then(async (result) => {
            console.log(result);
            let stops = await closestStops(req.query.loc, 5);
            stops = stops.get_q();
            let stopNames = [];
            for (let i = 1; i < stops.length; i++) {
                stopNames.push(stops[i].match(/\".*\"/));
            }

            console.log(stopNames);
            res.send({
                // error: error,
                coordinates: result,
                stops: stopNames
            })
        })
    } else {
        res.render('bus', {
            title: 'Homepage',
            message: 'Enter Location:'
        });
    }   
    
    // const start = {
    //     latitude: 40.444384,
    //     longitude: -80.000594
    // }
    // const dest = {
    //     latitude: 40.463034,
    //     longitude: -79.991610
    // }
    

    // const near_start = process.closest_stops(start, all_stops, 5);
    // const near_dest = process.closest_stops(dest, all_stops, 5);

    // const to_take = [];
    
    // // https://stackoverflow.com/a/32961666
    // near_start.sorted_stops.forEach(stop_s => {
    //     console.log(stop_s);
    //     near_dest.sorted_stops.forEach(stop_d => {
    //         stop_s.routes.forEach(rt_s => {
    //             stop_d.routes.forEach(rt_d => {
    //                 if(JSON.stringify(rt_s) === JSON.stringify(rt_d)) {
    //                     to_take.push({rtnm: rt_s, start: stop_s.stpnm, destination: stop_d.stpnm});
    //                 }
    //             })
    //         })
    //     })
    // })

    // let result = process.pathfinder(start, dest);
    // let result = process.adjacency(ras[6], ras[8]);

    // res.send(result);

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

app.get('/about', (req, res) => {
    res.render("about");
})

app.get('*', (req, res) => {
    res.render("404");
})

app.listen(3000, async () => {
    console.log('Server up on port 3000');
})
