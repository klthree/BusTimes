const coordForm = document.querySelector('#loc-search');
const search = document.querySelector('input');
const coords = document.querySelector('#results');

coordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const place = search.value;

    fetch('http://localhost:3000/bus?loc=' + place).then((response) => {
        response.json().then((data) => {
            if (typeof data.coordinates === 'string') {
                coords.textContent = data.coordinates;
            } else {
                let latitude = data.coordinates[1];
                let longitude = data.coordinates[0];
                coords.textContent = "Coordinates: " + latitude + ", " + longitude;
            }
        })
    })
})