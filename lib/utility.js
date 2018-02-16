var request = require('sync-request');
/**
 * get time string
 */
function getCurrentDayTimestamp() {
    var d = new Date();

    return new Date(
        Date.UTC(
            d.getFullYear(),
            d.getMonth(),
            d.getDate(),
            d.getHours(),
            d.getMinutes(),
            d.getSeconds()
        )
    ).toISOString().slice(0, 19);
}

module.exports.getCurrentDayTimestamp = getCurrentDayTimestamp;


/**
 * fetch content by url
 * @param {*} url 
 * @param {*} callBack 
 * @param {*} onError 
 */
function urlCheck(url, callBack, onError) {
    try {

        var request = require('sync-request');

        var res = request('GET', url, {
            'headers': {
                'user-agent': 'firefox'
            }
        });

        callBack(url, res);

    } catch (err) {
        onError(err);
    }

};

module.exports.urlCheck = urlCheck;


function exit(){
    process.exit()
}

module.exports.exit = exit;
