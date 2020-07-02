// git testing

const path = require('path');
const express = require('express');
const bus_routes = require('./utils/pat');
const app = express();


app.use(express.static(path.join(__dirname, '../public')));

app.get('', (req, res) => {
    
    res.send("hello");
})

// app.get('/bus', (req, res) => {
//     res.send('bus');
// })

app.get('/bus', async (req, res) => {
    
    loc = "";
    let w = await bus_routes.get_predictions(1403);
    let x = await bus_routes.get_routes(loc).then((response) => bus_routes.get_dir(response));
    let y = await bus_routes.get_stops(88, "OUTBOUND", "Port Authority Bus");
    let z = await bus_routes.get_vehicles(88);

    res.send(w);
})

// app.get

app.listen(3000, () => {
    console.log('Server up on port 3000')
})
