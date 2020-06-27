<<<<<<< HEAD
// git master

const path = require('path');
const express = require('express');
const bus_routes = require('./bus_routes');
=======
// git testing

const path = require('path');
const express = require('express');
const bus_routes = require('./utils/pat');
>>>>>>> testing
const app = express();

app.use(express.static(path.join(__dirname, '../public')));

<<<<<<< HEAD
app.get('/bus', (req, res) => {
    loc = "";
    bus_routes.get_routes(loc, (x) => {
        res.send(x);    
    })
=======
app.get('/bus', async (req, res) => {
    loc = "";
    let x = await bus_routes.get_routes(loc).then((response) => bus_routes.get_dir(response));
    let y = await bus_routes.get_stops(8, "OUTBOUND", "Port Authority Bus");
    let z = await bus_routes.get_vehicles(6);
    res.send(z);
>>>>>>> testing
})

app.listen(3000, () => {
    console.log('Server up on port 3000')
})