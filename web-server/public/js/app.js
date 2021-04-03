const coordForm = document.querySelector('#loc-search');
const search = document.querySelector('input');
const place = document.querySelector('#placename');
const slc = document.querySelector("#stopListContainer");

coordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchterm = search.value;

    fetch('http://localhost:3000/bus?loc=' + searchterm).then((response) => {
        response.json().then((data) => {
            if (typeof data.placename === 'string' && data.placename.includes("Error")) {
                place.textContent = data.placename;
            } else {
                place.textContent = "Stops near " + data.placename + ":";

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