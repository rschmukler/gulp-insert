var streamMap = require('map-stream');

exports.prepend = function(string) {
  return streamMap(function(file, cb) {
    file.contents = new Buffer(string + file.contents.toString());
    cb(null, file);
  });
};

exports.append = function(string) {
  return streamMap(function(file, cb) {
    file.contents = new Buffer(file.contents.toString() + string);
    cb(null, file);
  });
};
