
function searchTracking() {
    // console.log("safasd");
    fetch('http://localhost:8080/company/queue?company_id=1000000001')
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            console.log(json);
            return json
        })
        .catch(function (err) {
            alert("error")
        })
}

function addTracking() {
    const row = document.getElementsByClassName("row")

    const trackingBox = `<div id="tracking-box">
        <form action="#" id="tracking-form" onSubmit="searchTracking()">
            <label for="companyid" id="label-companyid">Company Id</label>
            <input type="text" id="companyid" name="companyid">

            <input type="submit" value="Search" id="btnSubmit"><br><br>

            <label for="queueid">Queue Id</label>
            <input type="text" id="queueid" name="queueid">

            <input type="checkbox" name="hideInactive" id="hideInactive">
            <label for="hideInactive">Hide Inactive</label>
        </form>
    </div>`;

    const addTrackingBox = `<div id="add-tracking-box">
        <button id="btnAddTracking" onclick="addTracking()">+ Add Tracking</button>
    </div>`;

    if (row[row.length - 1].getElementsByClassName("column")[0].textContent != "") {
        const addRow = document.createElement('div');
        addRow.className = "row";
        addRow.innerHTML = `<div class="column"></div>
                                 <div class="column"></div>`
        document.getElementById("container").appendChild(addRow);
        row[row.length - 2].getElementsByClassName("column")[0].innerHTML = trackingBox;
        row[row.length - 2].getElementsByClassName("column")[1].innerHTML = addTrackingBox;
    } else {
        row[row.length - 2].getElementsByClassName("column")[1].innerHTML = trackingBox;
        row[row.length - 1].getElementsByClassName("column")[0].innerHTML = addTrackingBox;
    }
}

