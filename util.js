var loadTextResource = (url, callback) => {
    var request = new XMLHttpRequest();
    request.open('get', url + '?please-dont-cache=' + Math.random(), true);
    request.onload = () => {
        if (request.status < 200 || request.status > 299) {
            callback(`Error: Http Status $request.status on resource $url`)
        } else {
            callback(null, request.responseText);
        }
    };
    request.send();
};

var loadImage = (url, callback) => {
    var image = new Image();
    image.onload = () => {
        callback(null, image);
    };
    image.src = url;
};

var loadJSONResource = (url, callback) => {
    loadTextResource(url, function(err, result) {
        if (err) {
            callback(err);
        } else {
            try {
                callback(null, JSON.parse(result));
            } catch (e) {
                callback(e);
            }

        }
    });
};