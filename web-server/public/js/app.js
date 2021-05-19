const coordForm = document.querySelector('#loc-search');
const originVal = document.querySelector('#origin');
const destinationVal = document.querySelector('#destination');
const oPlace = document.querySelector('#origPlacename');
const dPlace = document.querySelector('#destPlacename');
const oslc = document.querySelector("#origStopListCont");
const dslc = document.querySelector("#destStopListCont");

coordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    oslc.innerHTML = "";
    dslc.innerHTML = "";
    const origin = originVal.value;
    const destination = destinationVal.value;

    let origData = await fetch('http://localhost:3000/bus?loc=' + origin);
    let destData = await fetch('http://localhost:3000/bus?loc=' + destination);

    let origJSON = await origData.json();
    let destJSON= await destData.json();
    console.log(origJSON);
    
    if (!origJSON["error"] && !destJSON["error"]) {
        oPlace.textContent = "Stops near " + origJSON["placename"] + ":";
        dPlace.textContent = "Stops near " + destJSON["placename"] + ":";
        oslc.insertAdjacentHTML("afterbegin", "<div id=oClosestStopList class=stoplist></div>");
        dslc.insertAdjacentHTML("afterbegin", "<div id=dClosestStopList class=stoplist></div>");
        let oStopList = document.querySelector("#oClosestStopList");
        let dStopList = document.querySelector("#dClosestStopList");

        for (let i = 0; i < origJSON["stops"].length; i++) {
            let toInsert = '<p>' + origJSON["stops"][i][0] + '</p>';
            oStopList.insertAdjacentHTML("afterbegin", toInsert);
        }
        for (let i = 0; i < destJSON["stops"].length; i++) {
            let toInsert = '<p>' + destJSON["stops"][i][0] + '</p>';
            dStopList.insertAdjacentHTML("afterbegin", toInsert);
        }
    } else {
        oslc.innerHTML = "";
        dslc.innerHTML = "";
        oPlace.textContent = "Error: " + origJSON["error"];
    }
})