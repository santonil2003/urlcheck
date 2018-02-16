/**
 * Packages
 */
const fs = require('fs');
var xlsx = require('node-xlsx');
const json2csv = require('json2csv');
var io = require('./lib/io.js');
var utility = require('./lib/utility.js');
var config = require('./config.json');


var runTime = utility.getCurrentDayTimestamp();

/**
 * Regex
 */
var extensionRegx = /\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/gmi
var errorPageRegex = /smarterror/g
/**
 * Valid extension
 */
var validDataFileExtensions = [".CSV", ".csv", ".CSV", ".tsv", ".TSV", ".txt", ".TXT"];
/**
 * result data set
 */
var errorPageUrls = [];
var disjointReturnUrls = [];

/**
* Processed files
*/
var processedFiles = [];

var resultSheetColumn = ['filePath', 'row', 'Id', 'productUrl', 'returnUrl'];
/**
 * scan every folder as defined in config
 */
config.foldersToScan.forEach(function(folder) {
    if (folder.skip == "1") {
        return;
    }
    var folderPath = config.rootFolder + '/' + folder.folderName + '/';
    io.listFiles(folderPath, extensionRegx, validDataFileExtensions, function(filename) {

        var filePath = folderPath + filename;
        var sheets = xlsx.parse(filePath);

         console.log("\nFile : " + filePath);
        // parse sheet
        sheets.forEach(function(sheet) {
            console.log("Sheet :  " + sheet.name);
            // rows from sheet
            var rows = sheet.data;
            var line = 0;
            rows.forEach(function(row) {

                /**
                * skip header column
                */
                if (line <= 0) {
                    line++;
                    return;
                }

                /**
                * read necssary data from file
                */
                var productUrl = row[folder.productUrlColumnIndex];
                var productId = row[folder.productIdColumnIndex];

                /**
                * scan url
                */
                utility.urlCheck(productUrl, function(url, res) {
                    var returnUrl = res.url;
                    var isSmartError = returnUrl.match(extensionRegx);
                    
                    /**
                    * Smart Error Url
                    */
                    if (isSmartError) {
                        
                        var errorData = {
                            "filePath": filePath,
                           "row": (line+1).toString(),
                            "Id": productId,
                            "productUrl": productUrl,
                            "returnUrl": returnUrl
                        };

                        errorPageUrls.push(errorData);
                    }

                    /**
                    * DisJoint  Url
                    */
                    if(productUrl.trim()!=returnUrl.trim()){
                         var disJointData = {
                            "filePath": filePath,
                            "row": (line+1).toString(),
                            "Id": productId,
                            "productUrl": productUrl,
                            "returnUrl": returnUrl
                        };

                         disjointReturnUrls.push(disJointData);
                    }



                }, function(err) {
                    console.log(err.message);
                });

            });


            // write the result csv
            var resultCsv = json2csv({ data: errorPageUrls, fields: resultSheetColumn });
            var resultFilePath = config.resultFolder + '/result-' + runTime + '.csv';
            console.log("Saving crawl result for "+filePath);


            fs.writeFile(resultFilePath, resultCsv, function(err) {
                if (err) {
                    throw err;
                }
            });


            return; // skip after reading sheet 1
        });


        /**
        * Move processed files inside processed folder
        */

          var processedFolder = folderPath + 'processed';

          var processedFilePath = processedFolder+'/'+runTime+'-'+filename;

            if (!fs.existsSync(processedFolder)) {
                fs.mkdirSync(processedFolder);
            }

            io.move(filePath,processedFilePath, function() {
                console.log(filePath + " Moved to " + fprocessedFilePath);
            });


        

    }, function(err) {
        // update global error...
        console.log(err);
    });
});


process.on('exit', function(code) {
   console.log("Exit....");
});