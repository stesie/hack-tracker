

function drawChart() {
    var db = require('db').current();
    db.getView('hack-tracker', 'hacksByLevel', { group: true }, function(err, data) {
	var chartData = [ [ "Level", "friendly", "enemy" ] ];
	var hacks = { "friendly": {}, "enemy": {} };

	for(var i = 0; i < data.rows.length; i ++) {
	    hacks[data.rows[i].key[0]][data.rows[i].key[1]] = data.rows[i].value;
	}

	for(var i = 1; i <= 8; i ++) {
	    chartData.push([ "L" + i, hacks["friendly"][i] || 0, hacks["enemy"][i] || 0 ]);
	}

	var options = {
	    colors: [ 'blue', 'green' ],
            //title: 'Number of hacks per level',
            vAxis: { title: 'Hack Level' }
	};

	var chart = new google.visualization.BarChart(document.getElementById('chart_hacksByLevel'));
	chart.draw(google.visualization.arrayToDataTable(chartData), options);
    });

    db.getView('hack-tracker', 'itemsPerHack', { group: true }, function(err, data) {
	var chartData = [ [ "Item type", "friendly", "enemy" ] ];
	var hacks = { "friendly": {}, "enemy": {} };
	var itemTypes = {};

	for(var i = 0; i < data.rows.length; i ++) {
	    hacks[data.rows[i].key[0]][data.rows[i].key[1]] = data.rows[i].value;
	    itemTypes[data.rows[i].key[1]] = 1;
	}

	for(var itemType in itemTypes) {
	    if(itemType === "_hack") {
		continue;
	    }

	    chartData.push([
		itemType,
		(hacks["friendly"][itemType] || 0) / hacks["friendly"]["_hack"],
		(hacks["enemy"][itemType] || 0) / hacks["enemy"]["_hack"]
	    ]);
	}

	var options = {
	    colors: [ 'blue', 'green' ],
            vAxis: { title: 'Item type' }
	};

	var chart = new google.visualization.BarChart(document.getElementById('chart_itemsPerHack'));
	chart.draw(google.visualization.arrayToDataTable(chartData), options);
    });

};


exports.init = function() {
    window.$ = require('jquery');

    google.load("visualization", "1", {packages:["corechart"]});
    google.setOnLoadCallback(drawChart);
}

exports.views = require('./views');
