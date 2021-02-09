const host = "https://ades-2b01.herokuapp.com/";
var arrivalChart;
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
        <select id="queueid${trackingBoxCount}" class="queueid" name="queueid" onchange="arrivalRate(${trackingBoxCount})"></select>
        <input type="checkbox" name="hideInactive" id="hideInactive${trackingBoxCount}" class="hideInactive" onclick="checkInactive(id)" checked>
        <label for="hideInactive">Hide Inactive</label>
        <div id="error${trackingBoxCount}" class="error"><img src="./images/erroricon.png" width="30" height="30"></div><br>
        <canvas id="chart${trackingBoxCount}" class="chart"></canvas>
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
    const trackBoxID = id.replace(/^\D+/g, '');
    const companyid = document.getElementById("companyid" + trackBoxID).value;

    displayElement("loading" + trackBoxID, "block")
    document.getElementById("invalid-input" + trackBoxID).setAttribute("style", `display: none`);

    fetch(`${host}/company/queue?company_id=${companyid}`)
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            // Clear the options for previous queueid
            const options = document.getElementById(id).getElementsByClassName("queueid")[0];
            while (options.firstChild) {
                options.removeChild(options.lastChild);
            }

            displayElement("loading" + trackBoxID, "none")
            if (json.code == "INVALID_QUERY_STRING") {
                document.getElementById("invalid-input" + trackBoxID).innerText = "Invalid Company ID"
                document.getElementById("invalid-input" + trackBoxID).setAttribute("style", `display: block`);
            } else if (json.length == 0) {
                document.getElementById("invalid-input" + trackBoxID).innerText = "Unknown Company ID"
                document.getElementById("invalid-input" + trackBoxID).setAttribute("style", `display: block`);
            }

            const selectqueueid = document.createElement('option');
            selectqueueid.value = 0;
            selectqueueid.innerText = "Select Queue ID";
            document.getElementById("queueid" + trackBoxID).appendChild(selectqueueid);
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
            displayElement("loading" + trackBoxID, "none")
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

function arrivalRate(id) {
    if (id == 0) { } else {
        const labels = [];
        const dataset = [];

        const chart = document.getElementById("chart" + id);
        chart.style.display = "block";

        createChart(id, labels, dataset);
        setInterval(() => {
            updateChart(id, Chart.instances[id - 1]);
        }, 3000);
    }
}

function updateChart(id, chart) {
    const queueid = document.getElementById("queueid" + id).value;
    const date = moment().subtract(3, "minutes");
    const dateISO = date.format()
    const formatted = dateISO.replace("+", "%2B");
    displayElement("loading" + id, "block")

    fetch(`${host}/company/arrival_rate?queue_id=${queueid}&from=${formatted}&duration=3`)
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            displayElement("error" + id, "none")
            displayElement("loading" + id, "none")

            var labels = [];
            var dataset = [];
            console.log(json);

            for (var i = 0; i < json.length; i++) {
                var timestamp = new Date(json[i].timestamp * 1000);
                labels.push(timestamp.getHours() + ":" + (timestamp.getMinutes() < 10 ? '0' : '') + timestamp.getMinutes());
                dataset.push(json[i].count);
            }
            chart.data.datasets[0].data = dataset;
            chart.data.labels = labels;
            chart.update();
        })
        .catch(function (err) {
            displayElement("error" + id, "block")
            displayElement("loading" + id, "none")
            console.log(err);
        })
}

function createChart(id, labels, dataset) {
    var chart = document.getElementById('chart' + id).getContext('2d');

    arrivalChart = new Chart(chart, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Arrival Rate',
                data: dataset,
                borderColor: "gold",
                borderWidth: 2,
                pointBorderColor: "transparent"
            }],
            fill: false,
        },
        options: {
            legend: {
                display: 'false'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    },
                    scaleLabel: {
                        display: true,
                        labelString: "# of Customers",
                        fontColor: "gold"
                    }
                }],
                xAxes: [{
                    ticks: {
                        maxTicksLimit: 10
                    },
                    scaleLabel: {
                        display: true,
                        labelString: "Time",
                        fontColor: "gold"
                    }
                }]
            },
            animation: false
        }
    });
}

function displayElement(id, shown) {
    document.getElementById(id).setAttribute("style", `display: ${shown}`);
}

function closeTracking(id) {
    document.getElementById(id).parentElement.remove();
}