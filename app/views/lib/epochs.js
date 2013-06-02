exports.getEpochFromDoc = function(doc) {
    if(doc.timestamp < 1369944000) {
	/* before virus introduction */
	return 0;
    }

    return 1;
}
