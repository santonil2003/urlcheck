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
                var productUrl = jsonObj[folder.urlColumn];

                urlCheck(productUrl, function(url, res) {

                    if (res.url != url) {
                        console.log(filePath);
                        console.log(url);
                        console.log(res.url);
                        console.log("Not OK");
                    } else {
                        console.log(filePath);
                        console.log(url);
                        console.log(res.url);
                        console.log("OK");
                    }

                });
            })
            .on('done', (error) => {
                console.log(error)
            });

    }, function(err) {
        // update global error...
        console.log(err);
    });

    /*

 */

});




// list files from given path
function listFiles(dirname, onFileList, onError) {
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




function urlCheck(url, callBack) {
    try {

        var request = require('sync-request');

        var res = request('GET', url, {
            'headers': {
                'user-agent': 'firefox'
            }
        });

        callBack(url, res);


    } catch (err) {
        console.log("Error : " + url + " , Message : " + err.message);
    }

};


//console.log("Exiting.....");
//process.exit();