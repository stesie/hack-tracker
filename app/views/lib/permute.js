function objectLength(obj) {
    var size = 0, key;

    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }

    return size;
};

function permute(prefix, epoch, data, recKey, recData) {
    recKey = recKey || "";
    recData = recData || [];

    for(var i in data) {
	var subKey = recKey + "-" + i;
	var sub = JSON.parse(JSON.stringify(data));
	delete sub[i];

	if(objectLength(sub) === 0) {
            emit(prefix.concat(subKey.substr(1), epoch, recData, data[i]), null)
	}
	else {
            permute(prefix, epoch, sub, subKey, recData.concat(data[i]));
	}
    }
}

exports.permute = function(prefix, epoch, data) {
    permute(prefix, epoch, data);
};
