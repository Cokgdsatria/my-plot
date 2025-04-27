// Fungsi untuk load CSV menggunakan fetch API
async function loadCSV() {
    const response = await fetch('data.csv');
    const csvText = await response.text();

    // Parse CSV sederhana ke array objek
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split(',');
    const data = lines.slice(1).map(line => {
        const values = line.split(',');
        let obj = {};
        headers.forEach((h, i) => obj[h.trim()] = values[i].trim());
        return obj;
    });
    return data;
}

// Mengisi dropdown negara unik dari dataset
function populateCountrySelect(data) {
    const selectEl = document.getElementById('country-select');

    let countriesSet = new Set(data.map(d => d.Area));
    countriesSet.forEach(country => {
        let optionEl = document.createElement('option');
        optionEl.value = country;
        optionEl.textContent = country;
        selectEl.appendChild(optionEl);
    });
}

// Membuat Bar plot dengan Plotly berdasarkan tahun & nilai produksi beras suatu negara
function drawBarPlot(years, values) {
    let trace = {
        x: years,
        y: values,
        type: 'bar',
        marker: {color: 'rgb(255 ,64 ,129)'}
    };

    let layout = {
        title: 'Produksi Beras per Tahun (Bar Plot)',
        xaxis: {title: 'Tahun'},
        yaxis: {title: 'Produksi (tonnes)', zeroline: false},
        plot_bgcolor: '#121212',
        paper_bgcolor: '#121212',
        font: {color: '#e0e0e0'}
    };

    Plotly.newPlot('chart', [trace], layout, {responsive: true});
}

// Membuat Scatter plot biasa tanpa regresi linear dulu
function drawScatterPlot(years, values) {
    let trace = {
        x: years,
        y: values,
        mode: 'markers',
        type: 'scatter',
        marker: {color: 'rgb(130 ,170 ,255)', size: 10}
    };

    let layout = {
        title: 'Produksi Beras per Tahun (Scatter Plot)',
        xaxis: {title: "Tahun"},
        yaxis: {title: "Produksi (tonnes)", zeroline: false},
        plot_bgcolor: '#121212',
        paper_bgcolor: '#121212',
        font: {color: '#e0e0e0'}
    };

    Plotly.newPlot('chart', [trace], layout, {responsive: true});
}

// Fungsi regresi linear sederhana pakai least squares method di JS:
function linearRegression(x, y) {
    if (x.length !== y.length || x.length === 0)
        return null;

    var n = x.length, sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    for (let i = 0; i < n; i++) {
        sumX += parseFloat(x[i]);
        sumY += parseFloat(y[i]);
        sumXY += parseFloat(x[i]) * parseFloat(y[i]);
        sumXX += parseFloat(x[i]) * parseFloat(x[i]);
    }
    var slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    var intercept = (sumY - slope * sumX) / n;

    return {slope: slope, intercept: intercept};
}

// Membuat Regression plot gabungan scatter + garis regresi linear:
function drawRegressionPlot(years, values) {
    drawScatterPlot(years, values);

    var reg = linearRegression(years.map(Number), values.map(Number));
    if (!reg) return;

    var fitLineYears = [Math.min(...years), Math.max(...years)];
    var fitLineValues = [
        reg.slope * fitLineYears[fitLineYears.indexOf(Math.min(...years))] + reg.intercept,
        reg.slope * fitLineYears[fitLineYears.indexOf(Math.max(...years))] + reg.intercept];

    var regressionTrace = {
        x: fitLineYears,
        y: fitLineValues,
        mode: 'lines',
        type: 'scatter',
        name: "Regresi Linear",
        line: {
            color: "rgb(80,220,100)",
            width: 4
        }
    };

    setTimeout(() => {
        var currentData = document.getElementById("chart").data || [];
        var combinedTraces = currentData.concat([regressionTrace]);

        let layoutFull = {
            title: 'Produksi Beras per Tahun dengan Regresi Linear',
            xaxis: {title: "Tahun"},
            yaxis: {title: "Produksi (tonnes)", zeroline: false},
            plot_bgcolor: '#121212',
            paper_bgcolor: '#121212',
            font: {color: '#e0e0e0'},
        };

        // Buat ulang chart dengan gabungan traces tersebut supaya tampil lengkap.
        Plotly.newPlot("chart", combinedTraces, layoutFull, {responsive: true});

    }, 100);
}


// Event handler saat tombol "Tampilkan Grafik"
async function onUpdateClick() {
    const countrySelect = document.getElementById("country-select");
    const selectedCountry = countrySelect.value.trim();

    const plotTypeSelect = document.getElementById("plot-type");
    const selectedType = plotTypeSelect.value.trim();

    if (!selectedCountry) {
        alert("Silakan pilih negara terlebih dahulu.");
        return;
    }

    let filteredData = dataGlobal.filter(d => d.Area === selectedCountry);

    if (filteredData.length === undefined || filteredData.length === null || filteredData.length === false || filteredData.length === "") {
        alert(`Tidak ada data untuk ${selectedCountry}`);
        return;
    }

    let years = [];
    let production = [];

    filteredData.forEach(row => {
        if (row.Year && row.Value && !isNaN(row.Value)) {
            years.push(row.Year);
            production.push(parseFloat(row.Value));
        }
    });

    switch (selectedType) {
        case "bar":
            drawBarPlot(years, production);
            break;
        case "scatter":
            drawScatterPlot(years, production);
            break;
        case "regression":
            drawRegressionPlot(years, production);
            break;
        default :
            alert("Jenis grafik tidak dikenali.");
            break;


    }


}


// Global variable menyimpan dataset setelah load CSV sekali saja utk efisiensi akses selanjutnya.
let dataGlobal = [];

// Inisialisasi halaman setelah DOM siap:
// Load CSV -> isi dropdown -> pasang event listener tombol

document.addEventListener('DOMContentLoaded', () => {
    const updateButton = document.getElementById('update-btn');
    const countrySelect = document.getElementById('country-select');
    const plotTypeSelect = document.getElementById('plot-type');

    const triggerUpdate = () => {
        updateButton.click();
    };

    countrySelect.addEventListener('change', triggerUpdate);
    plotTypeSelect.addEventListener('change', triggerUpdate);
});

document.addEventListener('DOMContentLoaded', async () => {
    dataGlobal = await loadCSV();
    populateCountrySelect(dataGlobal);

    document.getElementById("update-btn").addEventListener('click', onUpdateClick);

});

