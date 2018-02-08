var request = require('sync-request');
var urlExists = require('url-exists');
/**
 * url arrays
 */
var urls = [];
urls.push('https://www.microsoft.com/en-us/store/p/youtube-tv/9NCPJ3X23P3FN8?rtc=1');
urls.push('https://www.microsoft.com/en-us/store/p/youtube-tv/9NCPJ3XP3FN8?rtc=1');
urls.push('https://www.microsoftnaku.no');
/**
 * for every url check html
 */
urls.forEach(function(url) {
    console.log(url);
    try {
        urlExists(url, function(err, exists) {
            if (exists) {
                var request = require('sync-request');
                var res = request('GET', url, {
                    'headers': {
                        'user-agent': 'firefox'
                    }
                });
                console.log(res.url);
            } else {
                console.log(url + " Does not exist");
            }
        });
    } catch (err) {
        console.log("Error : "+url+" , Message : "+err.message);
    }
});