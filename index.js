var fs = require('fs');
var path = require('path');
var program = require('commander');
var directories = [];

program
	.version('0.0.1')
	.option('-n, --new [file]', 'Output file')
	.option('-u, --url [url]', 'Base URL for URL compisition')
	.option('-d, --directory [directory]', 'Directory to read')
	.parse(process.argv);

var randFileName = Math.random().toString(36).substring(2);
var outputFile = (program.new) ? program.new : randFileName + '.txt';
var baseURL = (program.url) ? program.url : '';
var parentdir = (program.directory) ? program.directory : process.env.PWD;

if (baseURL[baseURL.length -1] !== '/') {
	baseURL += '/';
}

var walk = function (dir, done) {
	var results = [];
	fs.readdir(dir, function (err, list) {
		if (err) return done(err);
		var pending = list.length;
		if (!pending) done(null, results);
		list.forEach(function (file) {
			file = path.resolve(dir, file);
			fs.stat(file, function (err, stat) {
				if (stat && stat.isDirectory()) {
					walk(file, function (err, res) {
						results = results.concat(res);
						if (!--pending) done(null, results);
					});
				}
				else {
					results.push(file);
					if (!--pending) done(null, results);
				}
			});
		});
	});
};

walk(parentdir, function (err, dirs) {
	if (err) throw err;
	dirs.map(function (file) {
		if (path.extname(file) == '.html') {
			var s = path.normalize(file).split('/');
			directories.push(s[s.length -2] + '/' + s[s.length -1]);
		}
	});
	if (!directories.length) return;
	var newfile = fs.createWriteStream(outputFile);
	newfile.on('error', err => err);

	directories.forEach(function (v) {
		newfile.write(baseURL + v.replace(path.extname(v), '-#affid#' + path.extname(v) + '\n\n'), 'utf8');
	});
	newfile.end();
});
