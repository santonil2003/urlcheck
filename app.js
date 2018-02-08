/**
 * Packages
 */
const fs = require('fs')

var request = require('sync-request');
var urlExists = require('url-exists');
var config = require('./config.json');
const csv = require('csvtojson');


config.foldersToScan.forEach(function(folder) {

    var folderPath = config.rootFolder + '/' + folder.folderName + '/';

    var data = {};
    

    listFiles(folderPath, function(filename) {
        
        var filePath = folderPath + filename;

        csv()
            .fromFile(filePath)
            .on('json', (jsonObj) => {
                console.log(jsonObj);
            })
            .on('done', (error) => {
                console.log(error)
            });

    }, function(err) {
        throw err;
    });

    /*

 */

});




// list files from given path
function listFiles(dirname, onFileList, onError){
    fs.readdir(dirname, function(err, filenames) {
        if (err) {
            onError(err);
            return;
        }

        filenames.forEach(function(filename) {
            onFileList(filename);
        });

    });
}

// read file content from given path
function readFiles(dirname, onFileContent, onError) {
    fs.readdir(dirname, function(err, filenames) {
        if (err) {
            onError(err);
            return;
        }
        filenames.forEach(function(filename) {
            fs.readFile(dirname + filename, 'utf-8', function(err, content) {
                if (err) {
                    onError(err);
                    return;
                }
                onFileContent(filename, content);
            });
        });
    });
}




function urlCheck() {
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
            console.log("Error : " + url + " , Message : " + err.message);
        }
    });
};


//console.log("Exiting.....");
//process.exit();