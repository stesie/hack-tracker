exports.getPortalLevelFromDoc = function(doc, exact) {
    var resoSum = 0;

    for(var i = 0; i < 8; i ++) {
	resoSum += doc.resos[i];
    }

    if(exact) {
	return resoSum / 8;
    }
    else {
	return Math.floor(resoSum / 8);
    }
}

exports.getHackLevelFromDoc = function(doc) {
    var portalLevel = require('views/lib/levels').getPortalLevelFromDoc(doc);
    return doc.hacker.level < portalLevel ? doc.hacker.level : portalLevel;
}
