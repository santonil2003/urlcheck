/**
 * Packages
 */
const fs = require('fs')

var request = require('sync-request');
var urlExists = require('url-exists');
var intersection = require('array-intersection');


var config = require('./config.json');
const csv = require('csvtojson');
const json2csv = require('json2csv');

//https://www.microsoft.com/library/errorpages/smarterror.aspx?correlationId=7+7R6nS4SU6rNWIx.1


var data = [];
var fields = ['filePath', 'Id', 'productUrl', 'returnUrl'];
var extensionRegx = /\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/gmi
var errorPageRegex = /smarterror/g

var validDataFileExtensions = ['.CSV', '.csv', '.CSV'];

config.foldersToScan.forEach(function(folder) {

    var folderPath = config.rootFolder + '/' + folder.folderName + '/';

    listFiles(folderPath, function(filename) {

        var filePath = folderPath + filename;

        csv()
            .fromFile(filePath)
            .on('json', (jsonObj) => {

                var productUrl = jsonObj[folder.urlColumn];

                var id = jsonObj[folder.idColumn];

                urlCheck(productUrl, function(url, res) {

                    var returnUrl = res.url;

                    var isSmartError = returnUrl.match(extensionRegx);

                    if (isSmartError) {

                        var errorData = {
                            "filePath": filePath,
                            "Id": id,
                            "productUrl": url,
                            "returnUrl": returnUrl
                        };

                        data.push(errorData);

                    }

                }, function(err) {
                    console.log(err.message);
                });
            })
            .on('done', (error) => {

                var resultCsv = json2csv({ data: data, fields: fields });

                var resultFilePath = config.resultFolder + '/result-' + getCurrentDayTimestamp() + '.csv';



                fs.writeFile(resultFilePath, resultCsv, function(err) {
                    if (err) {
                        throw err;
                    }
                    console.log(resultFilePath);



                    var processedFolder = folderPath + 'processed';

                    if (!fs.existsSync(processedFolder)) {
                        fs.mkdirSync(processedFolder);
                    }

                    move(filePath, processedFolder + '/' + getCurrentDayTimestamp() + '-' + filename, function() {
                        console.log(filePath + " moved to " + processedFolder);
                    });

                });



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

            var fileExtension = filename.match(extensionRegx);

            if (fileExtension && fileExtension.length) {
                var searchIndex = validDataFileExtensions.indexOf(fileExtension[0]);

                if (searchIndex >= 0) {
                    onFileList(filename);
                }
            }



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


function move(oldPath, newPath, callback) {

    fs.rename(oldPath, newPath, function(err) {
        if (err) {
            if (err.code === 'EXDEV') {
                copy();
            } else {
                callback(err);
            }
            return;
        }
        callback();
    });

    function copy() {
        var readStream = fs.createReadStream(oldPath);
        var writeStream = fs.createWriteStream(newPath);

        readStream.on('error', callback);
        writeStream.on('error', callback);

        readStream.on('close', function() {
            fs.unlink(oldPath, callback);
        });

        readStream.pipe(writeStream);
    }
}



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
        // `toIsoString` returns something like "2017-08-22T08:32:32.847Z"
        // and we want the first part ("2017-08-22")
    ).toISOString().slice(0, 23);
}



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


/*
process.on('exit', function (){
    console.log("Exiting...");
});
*/
//console.log("Exiting.....");
//process.exit();