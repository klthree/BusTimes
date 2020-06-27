// git testing

const path = require('path');
const express = require('express');
const bus_routes = require('./utils/pat');
const app = express();

app.use(express.static(path.join(__dirname, '../public')));

app.get('/bus', async (req, res) => {
    loc = "";
    let x = await bus_routes.get_routes(loc).then((response) => bus_routes.get_dir(response));
    let y = await bus_routes.get_stops(8, "OUTBOUND", "Port Authority Bus");
    let z = await bus_routes.get_vehicles(6);
    res.send(z);
})

app.listen(3000, () => {
    console.log('Server up on port 3000')
})