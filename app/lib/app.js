

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

    db.getView('hack-tracker', 'itemcountPerHack', { group: true }, function(err, data) {
	var hacks = { "friendly": {}, "enemy": {} };

	for(var i = 0; i < data.rows.length; i ++) {
	    hacks[data.rows[i].key[0]][data.rows[i].key[1]] = data.rows[i].value;
	}

	for(var hackType in hacks) {
	    var chartData = [ [ "Item type", "Quantity" ] ];

	    for(var i = 0; i < 10; i ++) {
		chartData.push([ "" + i, hacks[hackType][i] || 0 ]);
	    }

	    var options = {
		title: hackType
	    };

	    var chart = new google.visualization.PieChart(document.getElementById('chart_itemcountPerHack_' + hackType));
	    chart.draw(google.visualization.arrayToDataTable(chartData), options);
	}

    });

    db.getView('hack-tracker', 'itemLevelsToHackLevels', { group: true, group_level: 2 }, function(err, data) {
	//var chartData = [ [ "Item type", "friendly", "enemy" ] ];
	var hacks = { "friendly": {}, "enemy": {} };
	//var totals = { "friendly": 0, "enemy": 0 };
	var levels = [ -1, 0, 1, 2, "none" ];

	for(var i = 0; i < data.rows.length; i ++) {
	    hacks[data.rows[i].key[0]][data.rows[i].key[1]] = data.rows[i].value;
	    //totals[data.rows[i].key[0]] += data.rows[i].value;
	}

	for(var hackType in hacks) {
	    var chartData = [ [ "Level difference", "Quantity" ] ];

	    for(var i = 0; i < levels.length; i ++) {
		chartData.push([
		    "" + levels[i],
		    (hacks[hackType][levels[i]] || 0),
		]);
	    }

	    var options = {
		title: 'Level difference (' + hackType + ' hacks)'
	    };

	    var chart = new google.visualization.PieChart(document.getElementById('chart_itemLevelsToHackLevels_' + hackType));
	    chart.draw(google.visualization.arrayToDataTable(chartData), options);
	}
    });

    db.getView('hack-tracker', 'itemLevelsToHackLevels', { group: true }, function(err, data) {
	var chartData = [ [ "Hack type & level", "-1", "0", "1", "2", "none" ] ];
	var hackTypes = [ "friendly", "enemy" ];
	var hacks = { };
	var totals = { };

	for(var i = 0; i < data.rows.length; i ++) {
	    var hackType = data.rows[i].key[0] + " L" + data.rows[i].key[2];
	    hacks[hackType] = hacks[hackType] || { };
	    hacks[hackType][data.rows[i].key[1]] = data.rows[i].value;

	    totals[hackType] = (totals[hackType] || 0) + data.rows[i].value;
	}

	console.log(hacks, totals);

	for(var i = 0; i < hackTypes.length; i ++) {
	    for(var level = 1; level <= 8; level ++) {
		var hackType = hackTypes[i] + " L" + level;
		var row = [ hackType ];

		if(!hacks[hackType]) {
		    continue;
		}

		for(var j = 1; j < chartData[0].length; j ++) {
		    row.push((hacks[hackType][chartData[0][j]] || 0) / totals[hackType]);
		}

		chartData.push(row);
	    }
	}

	var options = {
	    isStacked: true
	};

	console.log(chartData);

	var chart = new google.visualization.BarChart(document.getElementById('chart_itemLevelsDifferentHackLevels'));
	chart.draw(google.visualization.arrayToDataTable(chartData), options);

    });


    db.getView('hack-tracker', 'avgResultsOfHack', { group: true }, function(err, data) {
	var chartData = [ [ "Item type", "friendly", "enemy" ] ];
	var hacks = { "friendly": {}, "enemy": {} };
	var itemTypes = [ "R", "X", "C" ];

	for(var i = 0; i < data.rows.length; i ++) {
	    var key = data.rows[i].key[1] === '_hack' ? '_hack' :
		(data.rows[i].key[1].substr(0, 1) +
		 (data.rows[i].key[2] >= 0 ? '+' : '') +
		 data.rows[i].key[2]);

	    hacks[data.rows[i].key[0]][key] = data.rows[i].value;
	}

	for(var i = 0; i < itemTypes.length; i ++) {
	    for(var j = -1; j < 3; j ++) {
		var key = itemTypes[i] + (j >= 0 ? "+" : "") + j;

		chartData.push([
		    key,
		    (hacks["friendly"][key] || 0) / hacks["friendly"]["_hack"],
		    (hacks["enemy"][key] || 0) / hacks["enemy"]["_hack"]
		]);
	    }
	}

	var options = {
	    colors: [ 'blue', 'green' ],
            vAxis: { title: 'Item type wrt. hack level' }
	};

	var chart = new google.visualization.BarChart(document.getElementById('chart_avgResultsOfHack'));
	chart.draw(google.visualization.arrayToDataTable(chartData), options);
    });

};


exports.init = function() {
    window.$ = require('jquery');

    google.load("visualization", "1", {packages:["corechart"]});
    google.setOnLoadCallback(drawChart);
}

exports.views = require('./views');
