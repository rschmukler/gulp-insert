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

// Get string to insert
function getInsertString(arg, file) {
  if(typeof arg === 'function') {
    return arg(file);
  } else {
    return arg;
  }
}

exports.prepend = function(prepend) {
  var stream = new Stream.Transform({objectMode: true});

  stream._transform = function(file, unused, cb) {
    if(file.isNull()) {
      return cb(null, file);
    }
    var prependedBuffer = new Buffer(getInsertString(prepend, file));
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

exports.append = function(append) {
  var stream = new Stream.Transform({objectMode: true});

  stream._transform = function(file, unused, cb) {
    if(file.isNull()) {
      return cb(null, file);
    }
    var appendedBuffer = new Buffer(getInsertString(append, file));
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

  stream._transform = function(file, unused, cb) {
    if(file.isNull()) {
      return cb(null, file);
    }
    var prependedBuffer = new Buffer(getInsertString(begin, file));
    var appendedBuffer = new Buffer(getInsertString(end, file));
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

exports.transform = function (fn, isAsync) {
  if (isAsync === undefined) isAsync = false;
  var stream = new Stream.Transform({ objectMode: true });
  var isPromiseSupported = typeof Promise !== 'undefined';

  stream._transform = function (file, unused, cb) {
    if (file.isNull()) {
      return cb(null, file);
    }
    if (file.isStream()) {
      file.contents = file.contents.pipe(new Stream.Transform());
      file.contents._transform = function (chunk, encoding, cb) {
        if (isAsync) {
          var done = function (res) {
            cb(null, Buffer.from(res));
          }

          var result = fn(chunk.toString(), file, done);
          if (isPromiseSupported && result instanceof Promise) {
            result.then(done);
          }
        } else {
          cb(null, Buffer.from(fn(chunk.toString(), file)));
        }
      };
      return cb(null, file);
    }

    if (isAsync) {
      var done = function (res) {
        file.contents = Buffer.from(res);
        cb(null, file);
      }

      var result = fn(file.contents.toString(), file, done);
      if (isPromiseSupported && result instanceof Promise) {
        result.then(done);
      }
    } else {
      file.contents = Buffer.from(fn(file.contents.toString(), file));
      cb(null, file);
    }
  };

  return stream;
};

