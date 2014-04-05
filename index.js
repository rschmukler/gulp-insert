var Stream = require('readable-stream');

exports.prepend = function(string) {
  var stream = new Stream.Transform({objectMode: true});
  var prependedBuffer = new Buffer(string);

  stream._transform = function(file, unused, cb) {
    file.contents = Buffer.concat([prependedBuffer, file.contents],
      prependedBuffer.length + file.contents.length);
    cb(null, file);
  };

  return stream;
};

exports.append = function(string) {
  var stream = new Stream.Transform({objectMode: true});
  var appendedBuffer = new Buffer(string);

  stream._transform = function(file, unused, cb) {
    file.contents = Buffer.concat([file.contents, appendedBuffer],
      appendedBuffer.length + file.contents.length);
    cb(null, file);
  };

  return stream;
};

exports.wrap = function(begin, end) {
  var stream = new Stream.Transform({objectMode: true});
  var prependedBuffer = new Buffer(begin);
  var appendedBuffer = new Buffer(end);

  stream._transform = function(file, unused, cb) {
    file.contents = Buffer.concat([prependedBuffer, file.contents, appendedBuffer],
      appendedBuffer.length + file.contents.length + prependedBuffer.length);
    cb(null, file);
  };

  return stream;
};

exports.transform = function(fn) {
  var stream = new Stream.Transform({objectMode: true});

  stream._transform = function(file, unused, cb) {
    file.contents = new Buffer(fn(file.contents.toString()));
    cb(null, file);
  };

  return stream;
};

