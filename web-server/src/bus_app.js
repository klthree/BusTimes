const path = require('path');
const express = require('express');
// const expressValidator = require('express-validator');
const getCoords = require('./utils/geocoder.js').getCoords;
const closestStops = require('./utils/csv_util').closest_stops;
const { nextTick } = require('process');

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

app.get('/bus', async (req, res, next) => {
    if (req.query.loc) {
        try {
            let stopData = await closestStops(req.query.loc, 0.25);
            console.log("Hallo gov");
            console.log(stopData);
            let stops = stopData.stopPQ;
            let stopname = stopData.stopname;
            console.log("OHOHOH " + stopname);
            
            let stopNames = [];
            
            for (let i = 0; i < stops.length; i++) {
                stopNames.push(stops[i].match(/\".*\"/));
            }

            res.send({
                stopname: stopname,
                stops: stopNames
            })
        } 
        catch(e) {
            next(e);
            // return;
        }
    } else {
        res.render('bus', {
            title: 'Homepage',
            inputLabel1: 'Origin:',
            inputLabel2: 'Destination:'
        });
    }    
})

app.get('/about', (req, res) => {
    res.render("about");
})

app.get('*', (req, res) => {
    res.render("404");
})

// Error handling
app.use((err, req, res, next) => {
    return res.status(422).send({error: err});
})

app.listen(3000, async () => {
    console.log('Server up on port 3000');
})
