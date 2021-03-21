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



const renderChart = function (type = "bar", data) {
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


    for (var i = data.length - 30; i < data.length; i++)
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
        console.log(labeldate);
        labels.push(labeldate.getDay() + "-" + labeldate.getMonth() + "-" + labeldate.getFullYear());
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
