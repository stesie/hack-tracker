exports.hacksByLevel = {
    map: function(doc) {
	var hackLevel = require('views/lib/levels').getHackLevelFromDoc(doc);
	emit([doc.hack.type, hackLevel], 1);
    },

    reduce: "_count"
};

