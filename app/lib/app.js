

function drawChart() {
    var db = require('db').current();
    db.getView('hack-tracker', 'hacksByLevel', { group: true }, function(err, data) {
	console.log(data.rows, data);
	var chartData = [ [ "Level", "friendly", "enemy" ] ];
	var hacks = { "friendly": {}, "enemy": {} };

	for(var i = 0; i < data.rows.length; i ++) {
	    hacks[data.rows[i].key[0]][data.rows[i].key[1]] = data.rows[i].value;
	}

	console.log(hacks);

	for(var i = 1; i <= 8; i ++) {
	    chartData.push([ "L" + i, hacks["friendly"][i] || 0, hacks["enemy"][i] || 0 ]);
	}

	console.log(chartData);

	var options = {
	    colors: [ 'blue', 'green' ],
            title: 'Number of hacks per level',
            vAxis: { title: 'Hack Level' }
	};

	var chart = new google.visualization.BarChart(document.getElementById('chart_div'));
	chart.draw(google.visualization.arrayToDataTable(chartData), options);
    });

};


exports.init = function() {
    window.$ = require('jquery');

    google.load("visualization", "1", {packages:["corechart"]});
    google.setOnLoadCallback(drawChart);
}

exports.views = require('./views');
