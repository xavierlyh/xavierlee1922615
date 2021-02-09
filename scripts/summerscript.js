const host = "http://localhost:8080";

var trackingBoxCount = 0;

function addTracking() {
    trackingBoxCount++;

    const trackingBox = document.createElement('div');
    trackingBox.className = "tracking-box";
    trackingBox.id = `tracking-box${trackingBoxCount}`
    trackingBox.innerHTML = `<button id="btnClose${trackingBoxCount}" class="btnClose" onclick="closeTracking(id)">x</button>

    <form action="javascript:void(0);" id="tracking-form${trackingBoxCount}" class="tracking-form" onSubmit="searchTracking(id)">
        <label for="companyid" id="label-companyid">Company Id</label>
        <input type="text" id="companyid${trackingBoxCount}" name="companyid" class="companyid">

        <input type="submit" value="Search" id="btnSubmit" class="btnSubmit">
        
        <div id="loading${trackingBoxCount}" class="loading"></div><br>
        <div id="invalid-input${trackingBoxCount}" class="invalid-input"></div><br>

        <label for="queueid" id="label-queueid">Queue Id</label>
        <select id="queueid${trackingBoxCount}" class="queueid" name="queueid"></select>

        <input type="checkbox" name="hideInactive" id="hideInactive${trackingBoxCount}" class="hideInactive" onclick="checkInactive(id)" checked>
        <label for="hideInactive">Hide Inactive</label>
    </form>`;

    const addTrackingBox = document.createElement('div');
    addTrackingBox.id = "add-tracking-box";
    addTrackingBox.innerHTML = `<button id="btnAddTracking" onclick="addTracking()">+ Add Tracking</button>`;

    const invisibleBox = document.createElement('div');
    invisibleBox.id = "invisible-box";

    document.getElementById("invisible-box").remove();
    document.getElementById("add-tracking-box").remove();
    document.getElementById("container").appendChild(trackingBox);
    document.getElementById("container").appendChild(addTrackingBox);
    document.getElementById("container").appendChild(invisibleBox);
}

function searchTracking(id) {
    // Clear the options for previous queueid
    const options = document.getElementById(id).getElementsByClassName("queueid")[0];

    while (options.firstChild) {
        options.removeChild(options.lastChild);
    }

    const trackBoxID = id.replace(/^\D+/g, '');
    const companyid = document.getElementById("companyid" + trackBoxID).value;

    displayLoading(trackBoxID, "block");
    document.getElementById("invalid-input" + trackBoxID).setAttribute("style", `display: none`);

    fetch(`${host}/company/queue?company_id=${companyid}`)
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            console.log(json);
            displayLoading(trackBoxID, "none");
            if (json.code == "INVALID_QUERY_STRING") {
                document.getElementById("invalid-input" + trackBoxID).innerText = "Invalid Company ID"
                document.getElementById("invalid-input" + trackBoxID).setAttribute("style", `display: block`);
            } else if (json.length == 0) {
                document.getElementById("invalid-input" + trackBoxID).innerText = "Unknown Company ID"
                document.getElementById("invalid-input" + trackBoxID).setAttribute("style", `display: block`);
            }
            for (let x = 0; x < json.length; x++) {
                const option = document.createElement('option');
                option.value = json[x].queue_id;
                option.innerText = json[x].queue_id;
                if (json[x].is_active == 0) {
                    option.innerText += " (X)";
                    option.setAttribute("is_active", "0");
                }
                document.getElementById("queueid" + trackBoxID).appendChild(option);
            }
            checkInactive("hideInactive" + trackBoxID);
        })
        .catch(function (err) {
            displayLoading(trackBoxID, "none");
            alert(err);
        })
}

function checkInactive(id) {
    const options = document.getElementById(id).parentElement.getElementsByClassName("queueid")[0].children;
    for (let y = 0; y < options.length; y++) {
        if (options[y].getAttribute("is_active") == 0 && document.getElementById(id).checked) {
            options[y].disabled;
            options[y].style.display = "none";
        } else {
            options[y].removeAttribute("disabled");
            options[y].style.display = "block";
        }
    }
}

function displayLoading(id, loading) {
    document.getElementById("loading" + id).setAttribute("style", `display: ${loading}`);
}

function closeTracking(id) {
    document.getElementById(id).parentElement.remove();
}