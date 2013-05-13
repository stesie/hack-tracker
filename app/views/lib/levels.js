exports.getPortalLevelFromDoc = function(doc) {
    var resoSum = 0;

    for(var i = 0; i < 8; i ++) {
	resoSum += doc.resos[i];
    }

    return Math.floor(resoSum / 8);
}

exports.getHackLevelFromDoc = function(doc) {
    var portalLevel = require('views/lib/levels').getPortalLevelFromDoc(doc);
    return doc.hacker.level < portalLevel ? doc.hacker.level : portalLevel;
}
