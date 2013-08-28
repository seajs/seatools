var path = require('path');

exports.runTotoro = function() {
  var Client = require('totoro').Client;
  new Client({
    adapter: path.join(__dirname, 'totoro-adapter.js')
  });
};

exports.runLocal = function() {
  console.log('local')
};

exports.runHttp = function() {
console.log('http')
};