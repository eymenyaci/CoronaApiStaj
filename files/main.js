let chartWrap = document.getElementById('chart-wrap'); // chart load area

let countries = document.getElementById('countries');
let status = document.getElementById('status');

let selectedCountry = null;
let selectedStatus = null;

// ilk çalışan metod - uygulama açılır açılmaz
const init = function () {
    renderNav();

    // dönen ülkeleri countries elementine option elementi olarak ekler
    getCountries().then(res => {
        res.sort((a, b) => (a['Slug'] > b['Slug']) ? 1 : -1); // alfabeye göre sıralama
        // tek tek tüm ülkeleri dönüyoruz ve option elementi haline getirip countries elementine ekliyoruz.
        res.forEach(country => {
            let option = document.createElement('option');
            option.value = country['Slug'];
            option.text = country['Country'];
            if (option.value == "turkey") {
                option.selected = true;
            }
            countries.appendChild(option); // option elementi ekliyor
        });
        send(); // auto send
    });
}

// status değişkeninin olduğu elemente değerleri yükler
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
        if (s == "Confirmed-Daily") {
            option.selected = true;
        }
        status.appendChild(option); // status elementine option elementi ekler
    });
}

// ülkeler verilerini getiriyor
const getCountries = async function () {
    return request('https://api.covid19api.com/countries');
}

// ülke slug ına göre verileri getiriyor
const getDayOneData = async function (slug) {
    return request('https://api.covid19api.com/total/dayone/country/' + slug);
}

// api istek gönderme metodu
const request = async function(url, type = "GET") {
    return await fetch(url, {
        method: type,
        redirect: 'follow'
    })
    .then(response => response.text())
        .then(result => JSON.parse(result))
        .catch(error => console.log('error', error));
}


// göster butonuna basınca çalışır
const send = function () {
    selectedStatus = status.value;
    selectedCountry = countries.value;

    getDayOneData(selectedCountry).then(data => {
        renderChart(data); // her ülke datası geldiğinde renderChart çalışır
    });
}


// google chart servisini kullanarak arayüzde grafik datası gösteriyoruz.
const renderChart = function (data) {
    let drawBackgroundColor =  function() {
        var datatable = new google.visualization.DataTable();
        datatable.addColumn('string', 'X');
        datatable.addColumn('number', selectedStatus);

        let listCovid = [];

        // son 60 datayı gösteriyoruz.
        // listCovid array değişkeninin yapısına uygun hale getiriyoruz => [ ['',''],['',''],['',''], ]
        for (var i = data.length - 60; i < data.length; i++) {
            var diff = 0; // burda bir önceki değerdeki farkı buluyoruz.
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
            var parsedDate = moment(labeldate).format('DD MMMM YY');
            listCovid.push([parsedDate, diff]); // [ ['',''],['',''],['',''], ] bu yapıya getiriyoruz
        }

        // data olarak seçilen statüyü ve tarihi grafikte gösteriyoruz.

        datatable.addRows(listCovid); // [ ['',''],['',''],['',''], ] bu yapıdaki datamızı datatable a ekliyoruz.

        var options = {
            hAxis: {
                title: 'Date',
            },
            vAxis: {
                title: selectedCountry.toUpperCase(),
            },
            backgroundColor: '#f1f8e9'
        };

        var chart = new google.visualization.LineChart(chartWrap);
        chart.draw(datatable, options);
    }

    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(drawBackgroundColor);
}
