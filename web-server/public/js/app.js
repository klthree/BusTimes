const validator = require("@mapbox/mapbox-sdk/services/service-helpers/validator");
const { routes_per_stop } = require("../../src/utils/init");

const coordForm = document.querySelector('#loc-search');
const search = document.querySelector('input');
// document.querySelector('')
coordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const place = search.value;
    // console.log(place);
    window.open('http://localhost:3000/bus?loc=' + place, "_self");

    // fetch('http://localhost:3000/bus?loc=' + place).then((response) => {
    //     response.json().then((data) => {
    //         console.log("testy");
    //         console.log(data);
    //     })
    // })
})

// fetch('http://localhost:3000/?loc=pittsburgh').then((response) => {
//     response.json().then((data) => {
//         console.log(data);
//     })
// })