exports.getEpochFromDoc = function(doc) {
    if(doc.timestamp < 1369944000) {
        /* before virus introduction */
        return 0;
    }

    if(doc.timestamp < 1370275200) {
        /* before increased xmp drop from enemy portals */
        return 1;
    }

    if(doc.timestamp < 1370556000) {
        /* before increased power cube drop rate */
        return 2;
    }

    if(doc.timestamp < 1371744000) {
        /* before link amp drop */
        return 3;
    }

    if(doc.timestamp < 1372348800) {
        /* before drop of other new mods like multi-hack & heat sink */
        return 4;
    }

    return 5;
}
