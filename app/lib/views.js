exports.hacksByLevel = {
    map: function(doc) {
	var hackLevel = require('views/lib/levels').getHackLevelFromDoc(doc);
	emit([doc.hack.type, hackLevel], 1);
    },

    reduce: "_count"
};

exports.itemsPerHack = {
    map: function(doc) {
	var items = {};
	for(var a in doc.hack.items) {
	    var item = doc.hack.items[a];
	    items[item.object] = items[item.object] || 0;
	    items[item.object] += item.quantity;
	}

	for(var a in items) {
	    emit([ doc.hack.type, a ], items[a]);
	}

	emit([ doc.hack.type, "_hack" ], 1);
    },

    reduce: "_sum"
};

exports.itemcountPerHack = {
    map: function(doc) {
	var count = 0;

	for(var a in doc.hack.items) {
	    count += doc.hack.items[a].quantity;
	}

	emit([doc.hack.type, count], 1);
    },

    reduce: "_count"
}

exports.itemLevelsToHackLevels = {
    map: function(doc) {
	var hackLevel = require('views/lib/levels').getHackLevelFromDoc(doc);
	var items = {};

	for(var a in doc.hack.items) {
	    var item = doc.hack.items[a];
	    var levelDelta = item.level ? (item.level - hackLevel) : 'none';

	    items[levelDelta] = (items[levelDelta] || 0) + item.quantity;
	}

	for(var a in items) {
	    emit([ doc.hack.type, a, hackLevel ], items[a]);
	}
    },

    reduce: "_sum"
};

exports.avgResultsOfHack = {
    map: function(doc) {
	var hackLevel = require('views/lib/levels').getHackLevelFromDoc(doc);
	var items = {};

	for(var a in doc.hack.items) {
	    var item = doc.hack.items[a];

	    if(!item.level) {
		continue;
	    }

	    emit([ doc.hack.type, item.object, item.level - hackLevel ], item.quantity);
	}

	emit([ doc.hack.type, '_hack', 0 ], 1);
    },

    reduce: "_sum"
};

