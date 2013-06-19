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

    return 3;
}
