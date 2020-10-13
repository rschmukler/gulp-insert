# gulp-insert

String manipulation library for gulp

## Usage

```
npm install gulp-insert
```

```js
var insert = require('gulp-insert');
```

## Append

Appends a string onto the contents.

```js
.pipe(insert.append('world')); // Appends 'world' to the contents of every file
```

## Prepend

Prepends a string onto the contents.

```js
.pipe(insert.prepend('Hello')); // Prepends 'Hello' to the contents of every file
```
## Wrap

Wraps the contents with two strings.

```js
.pipe(insert.wrap('Hello', 'World')); // prepends 'hello' and appends 'world' to the contents
```

## Transform

Calls a function with the contents of the file.

```js
.pipe(insert.transform(function(contents, file) {
  return contents.toUpperCase();
}));
```

Transform has access to the underlying vinyl file. The following code adds a '//' comment with the full file name before the actual content.

```js
.pipe(insert.transform(function(contents, file) {

	var comment = '// local file: ' + file.path + '\n';
	return comment + contents;
}));
```

### Transform Async

Calls async transform with callback or promise

```js
.pipe(insert.transform(function(contents, file, done) {
	setTimeout(function () {
		done(contents.toUpperCase());
	}, 0);
}, true));
```

And with `Promise`

```js
.pipe(insert.transform(function(contents, file) {
	return new Promise(function (res) {
		setTimeout(function () {
			res(data.toUpperCase());
		}, 0);
	});
}, true));

.pipe(insert.transform(async function(contents, file) {
	await sleep(0);

	return contents.toUpperCase();
}, true));
```

See https://github.com/wearefractal/vinyl for docmentation on the 'file' parameter.
