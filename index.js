var Stream = require('readable-stream');
var StreamQueue = require('streamqueue');

// Helper
function getStreamFromBuffer(string) {
  var stream = new Stream.Readable();
  stream._read = function() {
    stream.push(new Buffer(string));
    stream._read = stream.push.bind(stream, null);
  };
  return stream;
}

exports.prepend = function(string) {
  var stream = new Stream.Transform({objectMode: true});
  var prependedBuffer = new Buffer(string);

  stream._transform = function(file, unused, cb) {
    if(file.isNull()) {
      return cb(null, file);
    }
    if(file.isStream()) {
      file.contents = new StreamQueue(
        getStreamFromBuffer(prependedBuffer),
        file.contents
      );
      return cb(null, file);
    }
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
    if(file.isNull()) {
      return cb(null, file);
    }
    if(file.isStream()) {
      file.contents = new StreamQueue(
        file.contents,
        getStreamFromBuffer(appendedBuffer)
      );
      return cb(null, file);
    }
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
    if(file.isNull()) {
      return cb(null, file);
    }
    if(file.isStream()) {
      file.contents = new StreamQueue(
        getStreamFromBuffer(prependedBuffer),
        file.contents,
        getStreamFromBuffer(appendedBuffer)
      );
      return cb(null, file);
    }
    file.contents = Buffer.concat([prependedBuffer, file.contents, appendedBuffer],
      appendedBuffer.length + file.contents.length + prependedBuffer.length);
    cb(null, file);
  };

  return stream;
};

exports.transform = function(fn) {
  var stream = new Stream.Transform({objectMode: true});

  stream._transform = function(file, unused, cb) {
    if(file.isNull()) {
      return cb(null, file);
    }
    if(file.isStream()) {
      file.contents = file.contents.pipe(new Stream.Transform());
      file.contents._transform = function(chunk, encoding, cb) {
        cb(null, new Buffer(fn(chunk.toString())))
      };
      return cb(null, file);
    }
    file.contents = new Buffer(fn(file.contents.toString()));
    cb(null, file);
  };

  return stream;
};

