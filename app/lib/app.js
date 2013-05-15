

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
	    width: 900, height: 500,
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
	    width: 900, height: 500,
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
		width: 550, height: 500,
		title: hackType
	    };

	    var chart = new google.visualization.PieChart(document.getElementById('chart_itemcountPerHack_' + hackType));
	    chart.draw(google.visualization.arrayToDataTable(chartData), options);
	}

    });

    db.getView('hack-tracker', 'itemLevelsToHackLevels', { group: true, group_level: 2 }, function(err, data) {
	var hacks = { "friendly": {}, "enemy": {} };
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
		width: 550, height: 500,
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
	    width: 900, height: 500,
	    colors: [ 'blue', 'green' ],
            vAxis: { title: 'Item type wrt. hack level' }
	};

	var chart = new google.visualization.BarChart(document.getElementById('chart_avgResultsOfHack'));
	chart.draw(google.visualization.arrayToDataTable(chartData), options);
    });

    db.getView("hack-tracker", "hackPatterns", { group: true, group_level: 2 }, function(err, data) {
	var options = $.map(data.rows, function(row) {
	    return $("<option>").text(row.key[0] + '-' + row.key[1]);
	});

	$("#pattern-choice").append(options);
    });
};

exports.init = function() {
    window.$ = require('jquery');

    google.load("visualization", "1", { packages: [ "corechart", "orgchart", "table" ] });
    google.setOnLoadCallback(drawChart);

    $("#pattern-choice").parent("form").on("submit", function(ev) {
	ev.preventDefault();

	/* Split pattern into two pieces again. */
	var pattern = $("#pattern-choice :selected").text();
	var firstDash = pattern.indexOf("-");
	pattern = [ pattern.substr(0, firstDash), pattern.substr(firstDash + 1)];

	require('db').current().getView("hack-tracker", "hackPatterns", {
	    group: true,
	    startkey: pattern,
	    endkey: pattern.concat(9, 9, 9, 9)
	}, function(err, data) {
	    var totals = { _all: 0 };
	    $.each(data.rows, function(i, row) {
		var pattern = row.key.slice(2);

		for(; pattern.length; pattern.pop()) {
		    var key = pattern.join("-");
		    totals[key] = (totals[key] || 0) + row.value;
		}

		totals["_all"] += row.value;
	    });

	    var chartData = new google.visualization.DataTable();
	    chartData.addColumn("string", "Node");
	    chartData.addColumn("string", "Manager");

	    chartData.addRow([
		{ v: "_all", f: "<span class=\"freq\">" + totals["_all"] + "</span>" }, null
	    ]);

	    $.each(totals, function(key, value) {
		if(key === "_all") {
		    return;
		}

		var parent = key.split("-").slice(0, -1).join("-");

		if(parent === "") {
		    parent = "_all";
		}

		var rFreqAll = Math.round(value / totals["_all"] * 10000) / 100 + "&nbsp;%";
		var rFreqParent = Math.round(value / totals[parent] * 10000) / 100 + "&nbsp;%";

		chartData.addRow([
		    {
			v: key,
			f: key + "<br/>" +
			    "<span class=\"freq\">" + value + "</span><br/>" +
			    "<span class=\"rel-freq-parent\">" + rFreqParent + "</span><br/>" +
			    "<span class=\"rel-freq-all\">" + rFreqAll + "</span><br/>"
		    },
		    parent,
		]);
	    });

	    var chart = new google.visualization.OrgChart(document.getElementById('chart_hackPatterns'));
	    chart.draw(chartData, { allowHtml: true, allowCollapse: true });
	});
    });
}

exports.views = require('./views');
