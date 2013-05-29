
function prepareTab($tab) {
    var hash = $tab.attr("href").substr(1);

    if($tab.data('initialized') !== true) {
        require('lib/charts')[hash]();
	$tab.data('initialized', true);
    }
}

function makePassword() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for(var i = 0; i < 8; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

exports.init = function() {
    window.$ = require('jquery');

    $(".nav-tabs li a").on("shown", function(ev) {
        prepareTab($(ev.target));
    });

    $("#create-user-dialog").on("shown", function(ev) {
	$("#create-user-name").val("");
	$("#create-user-password").val(makePassword());
    });

    $("#create-user-btn").on("click", function(ev) {
	var doc = {
	    "_id": "org.couchdb.user:" + $("#create-user-name").val(),
	    "name": $("#create-user-name").val(),
	    "type": "user",
	    "roles": [ "hack-tracker" ],
	    "password": $("#create-user-password").val()
	}

	var url = require("db").current().url;
	var i = url.lastIndexOf("/");

	url = url.slice(0, i) + "/_users";
	var db = require('db').use(url);
	db.saveDoc(doc, function(err, data) {
	    $("#create-user-dialog").modal("hide");
	});
    });

    google.load("visualization", "1", { packages: [ "corechart", "orgchart", "table" ] });
    google.setOnLoadCallback(function() {
	prepareTab($(".nav-tabs .active a"));
    });

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
