var mocha = require('mocha');
var should = require('should');
var sinon = require('sinon');
var gm = require('gm');
var fs = require('fs');

describe("resizer", function() {

    var streamStub = sinon.stub();
    var resizeStub = sinon.stub().returns({
        stream: streamStub
    });
    var imageMagickStub = sinon.stub().returns({
        resize: resizeStub
    });
    
    sinon.stub(gm, 'subClass');
    gm.subClass.returns(imageMagickStub);

    sinon.stub(fs, 'createWriteStream');
    fs.createWriteStream.returns("stream");
    
    var resizer = require('../index');

    it('should create three sizes, write them, and return the paths', function(done) {
        var stdout = {
            pipe: sinon.spy(),
            once: sinon.stub().callsArgAsync(1)
        };
        var stderr = {};
        streamStub.callsArgWithAsync(1, null, stdout, stderr);
        resizer.resize("/foo.png", [1, 2, 3], "/public/somewhere/", function(err, results) {
            sinon.assert.calledWith(gm.subClass, { imageMagick: true });
            sinon.assert.calledWith(imageMagickStub, "/foo.png");
            sinon.assert.calledThrice(imageMagickStub);
            sinon.assert.calledWith(resizeStub, 1, 1);
            sinon.assert.calledWith(resizeStub, 2, 2);
            sinon.assert.calledWith(resizeStub, 3, 3);
            sinon.assert.calledWith(streamStub, 'png', sinon.match.func);
            sinon.assert.calledWith(fs.createWriteStream, "/public/somewhere/1.png");
            sinon.assert.calledWith(fs.createWriteStream, "/public/somewhere/2.png");
            sinon.assert.calledWith(fs.createWriteStream, "/public/somewhere/3.png");
            sinon.assert.calledWith(stdout.pipe, "stream");
            sinon.assert.calledThrice(stdout.pipe);
            results.should.eql(["/public/somewhere/1.png", "/public/somewhere/2.png", "/public/somewhere/3.png"])
            done();
        });
    });

    afterEach(function() {
        streamStub.reset();
        resizeStub.reset();
        imageMagickStub.reset();
    });

    after(function() {
        gm.subClass.restore();
        fs.createWriteStream.restore();
    });

});