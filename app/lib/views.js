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
	    emit([ doc.hack.type, hackLevel, a ], items[a]);
	}
    },

    reduce: "_sum"
};

exports.itemLevelsToHackLevelFractions = {
    map: function(doc) {
	var portalLevel = require('views/lib/levels').getPortalLevelFromDoc(doc, true);

	if(doc.hacker.level < portalLevel || portalLevel < 2 || portalLevel >= 7) {
	    return;
	}

	var hackLevel = Math.floor(portalLevel);
	var items = {};

	for(var a in doc.hack.items) {
	    var item = doc.hack.items[a];
	    var levelDelta = item.level ? (item.level - hackLevel) : 'none';

	    items[levelDelta] = (items[levelDelta] || 0) + item.quantity;
	}

	for(var a in items) {
	    emit([ doc.hack.type, portalLevel - hackLevel, a ], items[a]);
	}
    },

    reduce: "_sum"
};

exports.itemLevelsToHackLevelEmptySlots = {
    map: function(doc) {
	var hackLevel = require('views/lib/levels').getHackLevelFromDoc(doc);
	var emptySlotCount = 0;

	for(var i = 0; i < 8; i ++) {
	    if(doc.resos[i] === 0) {
		emptySlotCount ++;
	    }
	}

	var items = {};

	for(var a in doc.hack.items) {
	    var item = doc.hack.items[a];
	    var levelDelta = item.level ? (item.level - hackLevel) : 'none';

	    items[levelDelta] = (items[levelDelta] || 0) + item.quantity;
	}

	for(var a in items) {
	    emit([ doc.hack.type, hackLevel, emptySlotCount, a ], items[a]);
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

exports.hackPatterns = {
    map: function(doc) {
	var resoSum = 0, xmpSum = 0, shieldSum = 0, keySum = 0;

	for(var a in doc.hack.items) {
	    var item = doc.hack.items[a];
	    if(item.object === "Resonator") {
		resoSum += item.quantity;
	    }
	    else if(item.object === "Xmp") {
		xmpSum += item.quantity;
	    }
	    else if(item.object === "Shield") {
		shieldSum += item.quantity;
	    }
	    else if(item.object === "Key") {
		keySum += item.quantity;
	    }
	}

	require("views/lib/permute").permute([ doc.hack.type ], {
	    "R": resoSum,
	    "X": xmpSum,
	});

	require("views/lib/permute").permute([ doc.hack.type ], {
	    "R": resoSum,
	    "X": xmpSum,
	    "SK": shieldSum + keySum
	});

	require("views/lib/permute").permute([ doc.hack.type ], {
	    "R": resoSum,
	    "X": xmpSum,
	    "S": shieldSum,
	    "K": keySum
	});
    },

    reduce: "_count"
}
