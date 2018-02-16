/**
 * Packages
 */
const fs = require('fs')

var request = require('sync-request');
var urlExists = require('url-exists');


var io = require('./lib/io.js');
var utility = require('./lib/utility.js');

var config = require('./config.json');
const csv = require('csvtojson');
const json2csv = require('json2csv');


/**
 * Regex
 */
var extensionRegx = /\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/gmi
var errorPageRegex = /smarterror/g

/**
 * Valid extension
 */
var validDataFileExtensions = ['.CSV', '.csv', '.CSV', '.tsv', '.TSV'];

/**
 * result data set
 */
var data = [];
var fields = ['filePath', 'Id', 'productUrl', 'returnUrl'];



/**
 * scan every folder as defined in config
 */
config.foldersToScan.forEach(function(folder) {

    
    if(folder.isActive!="1"){
        return;
    }


    var folderPath = config.rootFolder + '/' + folder.folderName + '/';

    io.listFiles(folderPath,extensionRegx,validDataFileExtensions, function(filename) {

        var filePath = folderPath + filename;

        csv()
            .fromFile(filePath)
            .on('json', (jsonObj) => {


                console.log(jsonObj);return;

                var productUrl = jsonObj[folder.urlColumn];

                var id = jsonObj[folder.idColumn];

                utility.urlCheck(productUrl, function(url, res) {

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

                var resultFilePath = config.resultFolder + '/result-' + utility.getCurrentDayTimestamp() + '.csv';



                fs.writeFile(resultFilePath, resultCsv, function(err) {
                    if (err) {
                        throw err;
                    }

                    console.log(resultFilePath);


                    var processedFolder = folderPath + 'processed';

                    if (!fs.existsSync(processedFolder)) {
                        fs.mkdirSync(processedFolder);
                    }

                    io.move(filePath, processedFolder + '/' + utility.getCurrentDayTimestamp() + '-' + filename, function() {
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






/*
process.on('exit', function (){
    console.log("Exiting...");
});
*/
//console.log("Exiting.....");
//process.exit();
