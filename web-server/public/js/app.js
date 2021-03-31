const coordForm = document.querySelector('#loc-search');
const search = document.querySelector('input');
const coords = document.querySelector('#results');

coordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const place = search.value;
    console.log(place);

    fetch('http://localhost:3000/bus?loc=' + place).then((response) => {
        response.json().then((data) => {
            console.log(data);
            let latitude = data.coordinates[1];
            let longitude = data.coordinates[0];
            coords.textContent = "Coordinates: " + latitude + ", " + longitude;
        })
    })
})