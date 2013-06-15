
exports.hacksByLevel = function() {
    var db = require('db').current();
    var options = { group: true };
    var epoch = $("#epoch-choice :selected").val();

    if(epoch !== "_all") {
	options.startkey = [ parseInt(epoch) ];
	options.endkey = [ parseInt(epoch), "z" ];
    }

    db.getView('hack-tracker', 'hacksByLevel', options, function(err, data) {
	var chartData = [ [ "Level", "friendly", "enemy", "neutral" ] ];
	var hacks = { "friendly": {}, "enemy": {}, "neutral": {} };

	for(var i = 0; i < data.rows.length; i ++) {
	    hacks[data.rows[i].key[1]][data.rows[i].key[2]] =
		(hacks[data.rows[i].key[1]][data.rows[i].key[2]] || 0) + data.rows[i].value;
	}

	for(var i = 1; i <= 8; i ++) {
	    chartData.push([
		"L" + i,
		hacks["friendly"][i] || 0,
		hacks["enemy"][i] || 0,
		hacks["neutral"][i] || 0
	    ]);
	}

	var options = {
	    width: 900, height: 500,
	    colors: [ 'blue', 'green', 'grey' ],
            vAxis: { title: 'Hack Level' }
	};

	var chart = new google.visualization.BarChart(document.getElementById('chart_hacksByLevel'));
	chart.draw(google.visualization.arrayToDataTable(chartData), options);
    });
};


function _itemsPerHackStat(hackData, itemType) {
    if(typeof hackData[itemType] === "undefined") {
	return [ 0, 0, 0 ];
    }

    var hackCount = hackData["_hack"]["count"]

    var average = hackData[itemType]["sum"] / hackCount;
    var stdDev = Math.sqrt((hackData[itemType]["sumsqr"]
			    - Math.pow(hackData[itemType]["sum"], 2) / hackCount)
			   / (hackCount - 1));

    return [
	average,
	Math.max(0, average - 2 * stdDev),
	average + 2 * stdDev,
    ];
}


exports.itemsPerHack = function() {
    var db = require('db').current();
    var options = { group: true };
    var epoch = $("#epoch-choice :selected").val();

    if(epoch !== "_all") {
	options.startkey = [ parseInt(epoch) ];
	options.endkey = [ parseInt(epoch), "z" ];
    }

    db.getView('hack-tracker', 'itemsPerHack', options, function(err, data) {
	var hacks = { "friendly": {}, "enemy": {}, "neutral": {} };
	var itemTypes = {};

	/* The data array is structured as follows:

	   key[0] = epoch index
	   key[1] = hack type (enemy/frienly)
	   key[2] = item type (reso/xmp/etc)

	   value contains a _stats object with sum, count, sumsqr.

	   There is the special pseudo item type "_hack", which provides us with the
	   total number of hacks. */

	for(var i = 0; i < data.rows.length; i ++) {
	    hacks[data.rows[i].key[1]][data.rows[i].key[2]] =
		hacks[data.rows[i].key[1]][data.rows[i].key[2]] || {};

	    for(var el in data.rows[i].value) {
		hacks[data.rows[i].key[1]][data.rows[i].key[2]][el] =
		    (hacks[data.rows[i].key[1]][data.rows[i].key[2]][el] || 0) + data.rows[i].value[el];
	    }

	    itemTypes[data.rows[i].key[2]] = 1;
	}

	var data = new google.visualization.DataTable();
	data.addColumn({ type: "string", role: "domain", label: "Item type" });
	data.addColumn({ type: "number", role: "data", label: "friendly" });
	data.addColumn({ type: "number", role: "interval" });
	data.addColumn({ type: "number", role: "interval" });
	data.addColumn({ type: "number", role: "data", label: "enemy" });
	data.addColumn({ type: "number", role: "interval" });
	data.addColumn({ type: "number", role: "interval" });
	data.addColumn({ type: "number", role: "data", label: "neutral" });
	data.addColumn({ type: "number", role: "interval" });
	data.addColumn({ type: "number", role: "interval" });

	for(var itemType in itemTypes) {
	    if(itemType === "_hack") {
		continue;
	    }

	    data.addRow([ itemType ].concat(
		_itemsPerHackStat(hacks["friendly"], itemType),
		_itemsPerHackStat(hacks["enemy"], itemType),
		_itemsPerHackStat(hacks["neutral"], itemType)
	    ));
	}

	var options = {
	    width: 900, height: 500,
	    colors: [ 'blue', 'green', 'grey' ],
            vAxis: { title: 'Item type' }
	};

	var chart = new google.visualization.BarChart(document.getElementById('chart_itemsPerHack'));
	chart.draw(data, options);
    });
};

exports.itemcountPerHack = function() {
    var db = require('db').current();
    db.getView('hack-tracker', 'itemcountPerHack', { group: true }, function(err, data) {
	var hacks = { "friendly": {}, "enemy": {}, "neutral": {} };

	for(var i = 0; i < data.rows.length; i ++) {
	    hacks[data.rows[i].key[0]][data.rows[i].key[1]] = data.rows[i].value;
	}

	for(var hackType in hacks) {
	    var chartData = [ [ "Item type", "Quantity" ] ];

	    for(var i = 0; i < 10; i ++) {
		chartData.push([ "" + i, hacks[hackType][i] || 0 ]);
	    }

	    var options = {
		width: 550, height: 500,
		title: hackType
	    };

	    var chart = new google.visualization.PieChart(document.getElementById('chart_itemcountPerHack_' + hackType));
	    chart.draw(google.visualization.arrayToDataTable(chartData), options);
	}

    });
};

exports.itemLevelsToHackLevels = function() {
    var db = require('db').current();
    db.getView('hack-tracker', 'itemLevelsToHackLevels', { group: true }, function(err, data) {
	var hacks = { "friendly": {}, "enemy": {} };
	var levels = [ -1, 0, 1, 2, "none" ];

	for(var i = 0; i < data.rows.length; i ++) {
	    if(data.rows[i].key[1] <= 1 || data.rows[i].key[1] >= 7) {
		/* Ignore drops from L1, L7 & L8 portals, since these cannot drop
		   L-1, L+1 or L+2 items (partly). */
		continue;
	    }

	    hacks[data.rows[i].key[0]][data.rows[i].key[2]] = (hacks[data.rows[i].key[0]][data.rows[i].key[2]] || 0) + data.rows[i].value;
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
		width: 550, height: 500,
		title: 'Level difference (' + hackType + ' hacks)'
	    };

	    var chart = new google.visualization.PieChart(document.getElementById('chart_itemLevelsToHackLevels_' + hackType));
	    chart.draw(google.visualization.arrayToDataTable(chartData), options);
	}
    });
};

exports.itemLevelsDifferentHackLevels = function() {
    var db = require('db').current();
    db.getView('hack-tracker', 'itemLevelsToHackLevels', { group: true }, function(err, data) {
	var chartData = [ [ "Hack type & level", "-1", "0", "1", "2", "none" ] ];
	var hackTypes = [ "friendly", "enemy" ];
	var hacks = { };
	var totals = { };

	for(var i = 0; i < data.rows.length; i ++) {
	    var hackType = data.rows[i].key[0] + " L" + data.rows[i].key[1];
	    hacks[hackType] = hacks[hackType] || { };
	    hacks[hackType][data.rows[i].key[2]] = data.rows[i].value;

	    totals[hackType] = (totals[hackType] || 0) + data.rows[i].value;
	}

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
	    width: 900, height: 500,
	    isStacked: true
	};

	var chart = new google.visualization.BarChart(document.getElementById('chart_itemLevelsDifferentHackLevels'));
	chart.draw(google.visualization.arrayToDataTable(chartData), options);

    });
};

exports.itemLevelsToLevelFractions = function() {
    var db = require('db').current();
    db.getView('hack-tracker', 'itemLevelsToHackLevelFractions', { group: true }, function(err, data) {
	var chartData = [ [ "Hack type & level fraction", "-1", "0", "1", "2", "none" ] ];
	var tableData = new google.visualization.DataTable();
	var hackTypes = [ "friendly", "enemy" ];
	var hacks = { };
	var totals = { };

	tableData.addColumn("string", "Hack type");
	for(var i = 0; i < 8; i ++) {
	    tableData.addColumn("number", i + "/8");
	}

	tableData.addRows(2);
	tableData.setCell(0, 0, "friendly");
	tableData.setCell(1, 0, "enemy");

	for(var i = 0; i < data.rows.length; i ++) {
	    var hackType = data.rows[i].key[0] + " " + (data.rows[i].key[1] * 8) + "/8";
	    hacks[hackType] = hacks[hackType] || { };
	    hacks[hackType][data.rows[i].key[2]] = data.rows[i].value;

	    totals[hackType] = (totals[hackType] || 0) + data.rows[i].value;
	}

	for(var i = 0; i < hackTypes.length; i ++) {
	    for(var fraction = 0; fraction < 8; fraction ++) {
		var hackType = hackTypes[i] + " " + fraction + "/8";
		var row = [ hackType ];
		var itemCount = 0;

		if(!hacks[hackType]) {
		    continue;
		}

		for(var j = 1; j < chartData[0].length; j ++) {
		    var num = hacks[hackType][chartData[0][j]] || 0;
		    itemCount += num;
		    row.push(num / totals[hackType]);
		}

		chartData.push(row);
		tableData.setCell(i, 1 + fraction, itemCount);
	    }
	}

	var options = {
	    width: 900, height: 500,
	    isStacked: true
	};

	var chart = new google.visualization.BarChart(document.getElementById('chart_itemLevelsToLevelFractions'));
	chart.draw(google.visualization.arrayToDataTable(chartData), options);

	var table = new google.visualization.Table(document.getElementById('table_itemLevelsToLevelFractions'));
        table.draw(tableData, { });
    });
};

exports.itemLevelsEmptySlots = function() {
    var db = require('db').current();
    db.getView('hack-tracker', 'itemLevelsToHackLevelEmptySlots', { group: true }, function(err, data) {
	var chartData = [ [ "Hack type & level fraction", "-1", "0", "1", "2", "none" ] ];
	var tableData = new google.visualization.DataTable();
	var hackTypes = [ "friendly", "enemy" ];
	var hacks = { };
	var totals = { };

	tableData.addColumn("string", "Hack type");
	for(var i = 0; i <= 8; i ++) {
	    tableData.addColumn("number", "" + i);
	}

	tableData.addRows(2);
	tableData.setCell(0, 0, "friendly");
	tableData.setCell(1, 0, "enemy");

	for(var i = 0; i < data.rows.length; i ++) {
	    var hackType = data.rows[i].key[0] + " " + data.rows[i].key[2];

	    if(data.rows[i].key[1] >= 2 && data.rows[i].key[1] < 7) {
		hacks[hackType] = hacks[hackType] || { };
		hacks[hackType][data.rows[i].key[3]] = (hacks[hackType][data.rows[i].key[3]] || 0) + data.rows[i].value;

		totals[hackType] = (totals[hackType] || 0) + data.rows[i].value;
	    }
	}

	for(var i = 0; i < hackTypes.length; i ++) {
	    for(var emptySlots = 0; emptySlots <= 8; emptySlots ++) {
		var hackType = hackTypes[i] + " " + emptySlots;
		var row = [ hackType ];
		var itemCount = 0;

		if(!hacks[hackType]) {
		    continue;
		}

		for(var j = 1; j < chartData[0].length; j ++) {
		    var num = hacks[hackType][chartData[0][j]] || 0;
		    itemCount += num;
		    row.push(num / totals[hackType]);
		}

		chartData.push(row);
		tableData.setCell(i, 1 + emptySlots, itemCount);
	    }
	}

	var options = {
	    width: 900, height: 500,
	    isStacked: true
	};

	var chart = new google.visualization.BarChart(document.getElementById('chart_itemLevelsEmptySlots'));
	chart.draw(google.visualization.arrayToDataTable(chartData), options);

	var table = new google.visualization.Table(document.getElementById('table_itemLevelsEmptySlots'));
        table.draw(tableData, { });
    });
};

exports.avgResultsOfHack = function() {
    var db = require('db').current();
    db.getView('hack-tracker', 'avgResultsOfHack', { group: true }, function(err, data) {
	var chartData = [ [ "Item type", "friendly", "enemy", "neutral" ] ];
	var hacks = { "friendly": {}, "enemy": {}, "neutral": {} };
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
		    (hacks["enemy"][key] || 0) / hacks["enemy"]["_hack"],
		    (hacks["neutral"][key] || 0) / hacks["neutral"]["_hack"]
		]);
	    }
	}

	var options = {
	    width: 900, height: 500,
	    colors: [ 'blue', 'green', 'grey' ],
            vAxis: { title: 'Item type wrt. hack level' }
	};

	var chart = new google.visualization.BarChart(document.getElementById('chart_avgResultsOfHack'));
	chart.draw(google.visualization.arrayToDataTable(chartData), options);
    });
};

exports.hackPatterns = function() {
    var db = require('db').current();
    db.getView("hack-tracker", "hackPatterns", { group: true, group_level: 2 }, function(err, data) {
	var options = $.map(data.rows, function(row) {
	    return $("<option>").text(row.key[0] + '-' + row.key[1]);
	});

	$("#pattern-choice").append(options);
    });
};
