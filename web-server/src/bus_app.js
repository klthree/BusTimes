const path = require('path');
const express = require('express');
const bus_routes = require('./utils/bus_routes');
// git testing
const app = express();

app.use(express.static(path.join(__dirname, '../public')));

app.get('/bus', (req, res) => {
    loc = "baldwin";
    bus_routes.get_routes(loc, (x) => {
        res.send(x);    
    })
})

app.listen(3000, () => {
    console.log('Server up on port 3000')
})