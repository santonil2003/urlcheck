const fs = require('fs')


/**
 *  move file
 * @param {*} oldPath 
 * @param {*} newPath 
 * @param {*} callback 
 */
function move(oldPath, newPath, callback) {

    fs.rename(oldPath, newPath, function (err) {
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

        readStream.on('close', function () {
            fs.unlink(oldPath, callback);
        });

        readStream.pipe(writeStream);
    }
}

module.exports.move = move;


/**
 *  list files
 * @param {*} dirname 
 * @param {*} onFileList 
 * @param {*} onError 
 */
function listFiles(dirname, extensionRegx,validDataFileExtensions, onFileList, onError) {
    fs.readdir(dirname, function (err, filenames) {
        if (err) {
            onError(err);
            return;
        }

        filenames.forEach(function (filename) {

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


module.exports.listFiles = listFiles;



/**
 * read files
 * @param {*} dirname 
 * @param {*} onFileContent 
 * @param {*} onError 
 */
function readFiles(dirname, onFileContent, onError) {
    fs.readdir(dirname, function (err, filenames) {
        if (err) {
            onError(err);
            return;
        }
        filenames.forEach(function (filename) {
            fs.readFile(dirname + filename, 'utf-8', function (err, content) {
                if (err) {
                    onError(err);
                    return;
                }
                onFileContent(filename, content);
            });
        });
    });
}

module.exports.readFiles = readFiles;
