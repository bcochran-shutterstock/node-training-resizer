var gm = require('gm');
var fs = require('fs');
var imageMagick = gm.subClass({ imageMagick: true });
var async = require('async');

exports.resize = function(path, sizes, targetDir, callback) {
    function magick(size, magickCallback) {
        imageMagick(req.files.image.path).resize(size, size).stream('png', function (err, stdout, stderr) {
            if (err) {
                magickCallback(err);
            }
            else {
                var targetPath = targetDir + size + '.png';
                var one = fs.createWriteStream(targetPath);
                stdout.pipe(one);
                magickCallback(null, targetPath);
            }
        });
    }
    console.log('resizing %s', req.files.image.name);
    async.map(sizes, magick, callback);
};

exports.resize = function (req, res, next) {
    function magick (size, cb) {
        // the uploaded file can be found as `req.files.image` and the
        imageMagick(req.files.image.path)
            .resize(size, size)
            .stream('png', function (err, stdout, stderr) {
                if (err) return cb(err);
                var one = fs.createWriteStream(__dirname + '/../public/images/' + size + '.png');
                stdout.pipe(one);
                cb();
            });
    }
    // title field as `req.body.title`
    console.log('resizing %s', req.files.image.name);
    async.map([150, 250, 500], magick, function (err) {
        res.render('images');
    })
};