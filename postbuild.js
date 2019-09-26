var path = require('path');
var fs = require('fs');

function fromDir(startPath, filter, callback) {

  var files = fs.readdirSync(startPath);
  for (var i = 0; i < files.length; i++) {
    var filename = path.join(startPath, files[i]);
    var stat = fs.lstatSync(filename);
    if (stat.isDirectory()){
      fromDir(filename, filter, callback); //recurse
    }
    else if (filter.test(filename)) callback(filename);
  }
}

fromDir('./dist', /\.ts$/, function (filename) {
  fs.unlink(filename);
});

fromDir('./dist', /\.js$/, function (filename) {
  //fs.unlink(filename);
  fs.readFile(filename, 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }
    var result = data.replace('"@nestjs/core', '"./../node_modules/@nestjs/core');

    fs.writeFile(filename, result, 'utf8', function (err) {
      if (err) return console.log(err);
    });
  });
});
