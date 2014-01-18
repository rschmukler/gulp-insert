var insert = require('../'),
    expect = require('expect.js'),
    File = require('gulp-util').File;

describe('Append', function() {
  it('appends the string onto the file', function(done) {
    var stream = insert.append(' world');

    var fakeFile = new File({
      cwd: __dirname,
      base: __dirname + 'test',
      path: __dirname + 'test/file.js',
      contents: new Buffer('Hello')
    });

    stream.on('data', function(file) {
      expect(file.contents.toString()).to.be('Hello world');
      done();
    });

    stream.write(fakeFile);
    stream.end();
  });

});

describe('Prepend', function() {
  it('prepends the string onto the file', function(done) {
    var stream = insert.prepend('Hello');

    var fakeFile = new File({
      cwd: __dirname,
      base: __dirname + 'test',
      path: __dirname + 'test/file.js',
      contents: new Buffer(' world')
    });

    stream.on('data', function(file) {
      expect(file.contents.toString()).to.be('Hello world');
      done();
    });

    stream.write(fakeFile);
    stream.end();
  });
});
