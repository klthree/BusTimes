// git testing

const path = require('path');
const express = require('express');
const bus_routes = require('./bus_routes');
const app = express();

app.use(express.static(path.join(__dirname, '../public')));

app.get('/bus', (req, res) => {
    loc = "";
    bus_routes.get_routes(loc, (x) => {
        res.send(x);    
    })
})

app.listen(3000, () => {
    console.log('Server up on port 3000')
})