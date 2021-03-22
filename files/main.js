let chartWrap = document.getElementById('chart-wrap');

let countries = document.getElementById('countries');
let status = document.getElementById('status');

let selectedCountry = null;
let selectedStatus = null;

const init = function () {
    getCountries().then(res => {
        res.forEach(country => {
            let option = document.createElement('option');
            option.value = country['Slug'];
            option.text = country['Country'];

            countries.appendChild(option);
        });
    });
    renderNav();
}

const renderNav = function () {
    let items = [
        "Confirmed",
        "Deaths",
        "Recovered",
        "Active",
        "Confirmed-Daily",
        "Deaths-Daily",
        "Recovered-Daily",
        "Active-Daily",
    ];
    items.forEach(s => {
        let option = document.createElement('option');
        option.value = s;
        option.text = s;
        status.appendChild(option);
    });
}

const getCountries = async function () {
    return request('https://api.covid19api.com/countries');
}

const getDayOneData = async function (slug) {
    return request('https://api.covid19api.com/total/dayone/country/' + slug);
}

const request = async function(url, type = "GET") {
    return await fetch(url, {
        method: type,
        redirect: 'follow'
    })
    .then(response => response.text())
        .then(result => JSON.parse(result))
        .catch(error => console.log('error', error));
}


const send = function () {
    selectedStatus = status.value;
    selectedCountry = countries.value;

    if (selectedStatus == null || selectedStatus == "") {
        alert('Lütfen Durum Seçimi Yapınız');
    }
    else if (selectedCountry == null || selectedCountry == "") {
        alert('Lütfen Ülke Seçimi Yapınız');
    } else {
        console.log("Selecteds:", selectedStatus, selectedCountry);


        getDayOneData(selectedCountry).then(data => {
            console.log(data);
            let chartType = "bar";
            if (selectedStatus == "Confirmed" || selectedStatus == "Deaths" || selectedStatus == "Recovered" || selectedStatus == "Active") {
                chartType = "line";
            }
            renderChart(chartType, data);
        });
    }
}


const renderChart = function (type = "bar", covids) {
    let drawBackgroundColor =  function() {
        var data = new google.visualization.DataTable();
        data.addColumn('number', 'X');
        data.addColumn('number', 'Dogs');


        data.addRows([
            [0, 0], [1, 10], [2, 23], [3, 17], [4, 18], [5, 9],
            [6, 11], [7, 27], [8, 33], [9, 40], [10, 32], [11, 35],
            [12, 30], [13, 40], [14, 42], [15, 47], [16, 44], [17, 48],
            [18, 52], [19, 54], [20, 42], [21, 55], [22, 56], [23, 57],
            [24, 60], [25, 50], [26, 52], [27, 51], [28, 49], [29, 53],
            [30, 55], [31, 60], [32, 61], [33, 59], [34, 62], [35, 65],
            [36, 62], [37, 58], [38, 55], [39, 61], [40, 64], [41, 65],
            [42, 63], [43, 66], [44, 67], [45, 69], [46, 69], [47, 70],
            [48, 72], [49, 68], [50, 66], [51, 65], [52, 67], [53, 70],
            [54, 71], [55, 72], [56, 73], [57, 75], [58, 70], [59, 68],
            [60, 64], [61, 60], [62, 65], [63, 67], [64, 68], [65, 69],
            [66, 70], [67, 72], [68, 75], [69, 80]
        ]);

        var options = {
            hAxis: {
                title: 'Time'
            },
            vAxis: {
                title: 'Popularity'
            },
            backgroundColor: '#f1f8e9'
        };

        var chart = new google.visualization.LineChart(document.getElementById('chart-wrap'));
        chart.draw(data, options);
    }

    google.charts.load('current', { packages: ['corechart', 'line'] });
    google.charts.setOnLoadCallback(drawBackgroundColor);
}

const renderChart_Orjinal = function (type = "bar", data) {
    console.log(typeof data);
    if (typeof data != "object" || data.length == 0 || data == undefined) {
        alert('Veriye ulaşılamadı, üzgünüz');
    }

    let ctx = document.createElement('canvas');
    ctx.width = "400";
    ctx.height = "400";

    chartWrap.innerHTML = "";
    chartWrap.appendChild(ctx);


    let labels = [];
    let datasets = [];


    for (var i = data.length - 60; i < data.length; i++)
    {
        var diff = 0;
        switch (selectedStatus) {
            case "Confirmed":
                diff = data[i].Confirmed;
                break;
            case "Deaths":
                diff = data[i].Deaths;
                break;
            case "Recovered":
                diff = data[i].Recovered;
                break;
            case "Active":
                diff = data[i].Active;
                break;
            case "Confirmed-Daily":
                diff = data[i].Confirmed - data[i - 1].Confirmed;
                break;
            case "Deaths-Daily":
                diff = data[i].Deaths - data[i - 1].Deaths;
                break;
            case "Recovered-Daily":
                diff = data[i].Recovered - data[i - 1].Recovered;
                break;
            case "Active-Daily":
                diff = data[i].Active - data[i - 1].Active;
                break;
            default:
                break;
        }
        diff = diff < 0 ? diff * -1 : diff;
        var labeldate = new Date(data[i]["Date"]);
        var parsedDate = moment(labeldate).format('MMMM DD YY');
        console.log(parsedDate);
        labels.push(parsedDate);
        datasets.push(diff);
    }


    let mainChart = new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: selectedCountry.toUpperCase() + " Corona Data",
                data: datasets,
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });


}
