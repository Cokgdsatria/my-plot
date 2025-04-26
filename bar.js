
BAR = document.getElementById("barplot");

var data = [{
    x: ['High Distinction', 'Distinction', 'Credit', 'Pass', 'Fail'],
    y: [10,40,25,25,0],
    type: 'bar',
}];

var layout = {font: {size: 18}};
var config = {responsive: true};

Plotly.newPlot(BAR, data, layout, config);