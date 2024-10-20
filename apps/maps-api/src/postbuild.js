const path = require('path');
const fs = require('fs');
const nodeModulesPath = '"./../../';

const dir = 'S:\\projects\\nest-monorepo\\dist\\apps\\maps-api';

function fromDir(startPath, filter, callback) {
  var files = fs.readdirSync(startPath);
  for (var i = 0; i < files.length; i++) {
    var filename = path.join(startPath, files[i]);
    var stat = fs.lstatSync(filename);
    if (stat.isDirectory()) {
      fromDir(filename, filter, callback); //recurse
    } else if (filter.test(filename)) callback(filename);
  }
}

const replaceList = [
  /("@nestjs\/axios")/g,
  /("@nestjs\/.*)"/g,
  /("typeorm)"/g,
  /("moment)"/g,
  /("firebase-admin)"/g,
];

fromDir(dir, /\.js$/, function (filename) {
  //
  const depth = filename.split('\\').length - 2;

  const getPatch = (depth) => {
    let path = nodeModulesPath;
    for (let i = 0; i < depth; i++) {
      path += '../';
    }
    return path + 'node_modules/';
  };

  fs.readFile(filename, 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }
    let result = data;
    replaceList.forEach((regEx) => {
      result = result.replace(regEx, (it) => {
        return getPatch(depth) + it.substr(1);
      });
    });

    fs.writeFile(filename, result, 'utf8', function (err) {
      if (err) return console.log(err);
    });
  });
});
