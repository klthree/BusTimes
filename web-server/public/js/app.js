const coordForm = document.querySelector('#loc-search');
const search = document.querySelector('input');
const coords = document.querySelector('#results');
const slc = document.querySelector("#stopListContainer");

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
                coords.textContent = "Coordinates: " + latitude + ", " + longitude;

                slc.innerHTML = ""
                slc.insertAdjacentHTML("afterbegin", "<div id=closestStopList></div>");
                let stopList = document.querySelector("#closestStopList");
                
                for (let i = 0; i < data.stops.length; i++) {
                    let toInsert = '<p>' + data.stops[i][0] + '</p>';
                    stopList.insertAdjacentHTML("afterbegin", toInsert);
                }
            }
        })
    })
})