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
var xlsx = require('node-xlsx');
/**
 * Regex
 */
var extensionRegx = /\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/gmi
var errorPageRegex = /smarterror/g
/**
 * Valid extension
 */
var validDataFileExtensions = ['.CSV', '.csv', '.CSV', '.tsv', '.TSV', '.txt', ".TXT"];
/**
 * result data set
 */
var data = [];
var fields = ['filePath', 'Id', 'productUrl', 'returnUrl'];
/**
 * scan every folder as defined in config
 */
config.foldersToScan.forEach(function(folder) {
    if (folder.skip == "1") {
        return;
    }
    var folderPath = config.rootFolder + '/' + folder.folderName + '/';
    fs.readdir(folderPath).then(function(err, filenames){
        return filenames;
    }).then(function(filename){
        console.log(filename);
    });
});