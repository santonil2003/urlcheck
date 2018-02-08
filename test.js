

const fs = require('fs')

var request = require('sync-request');
var urlExists = require('url-exists');
var config = require('./config.json');
const csv = require('csvtojson');


var url = "https://www.microsoft.com/en-au/store/d/halo-wars-2-ultimate-editkion-for-xbox-one/8MJCs3670Q3CH/FP2B";

var request = require('sync-request');

        var res = request('GET', url, {
            'headers': {
                'user-agent': 'firefox'
            }
        });

        console.log(url);
        console.log(res.url);

        if(url==res.url){
            console.log("OK");
        }