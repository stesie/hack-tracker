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
