const coordForm = document.querySelector('#loc-search');
const search = document.querySelector('input');
const coords = document.querySelector('#results');
const stops = document.querySelector('#closestStops');

coordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const place = search.value;

    fetch('http://localhost:3000/bus?loc=' + place).then((response) => {
        response.json().then((data) => {
            if (typeof data.coordinates === 'string') {
                coords.textContent = data.coordinates;
            } else {
                let latitude = data.coordinates.lat;
                let longitude = data.coordinates.lon;
                let topStops = "";
                coords.textContent = "Coordinates: " + latitude + ", " + longitude;

                stops.innerHTML = "";
                for (let i = 0; i < data.stops.length; i++) {
                    let toInsert = '<p>' + data.stops[i][0] + '</p>';
                    stops.insertAdjacentHTML("afterbegin", toInsert);
                }
            }
        })
    })
})