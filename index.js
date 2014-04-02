var gm = require('gm');
var fs = require('fs');
var imageMagick = gm.subClass({ imageMagick: true });
var async = require('async');
var debug = require('debug')('resizer');

debug("loaded resizer module");

module.exports.resize = function(path, sizes, targetDir, callback) {
    function magick(size, magickCallback) {
        imageMagick(path).resize(size, size).stream('png', function (err, stdout, stderr) {
            if (err) {
                magickCallback(err);
            }
            else {
                var targetPath = targetDir + size + '.png';
                var one = fs.createWriteStream(targetPath);
                stdout.pipe(one);
                stdout.once('end', function() {
                    magickCallback(null, targetPath);
                });
            }
        });
    }
    async.map(sizes, magick, function(err, results) {
        debug("results: ", results);
        callback(err, results);
    });
};

/*
exports.resize = function(path, sizes, targetDir, callback) {
    function magick(size, magickCallback) {
        imageMagick(path).resize(size, size).stream('png', magickCallback);
    }
    async.map(sizes, magick, function(err, results) {
        debug("results: ", results);
        callback(err, results);
    });
};
*/
