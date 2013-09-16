module.exports = function(grunt) {
  var fs = require('fs');
  var path = require('path');
  var format = require('util').format;

  // 在每个 js 尾部添加 seajs.use 保证插件马上执行
  grunt.registerMultiTask("appenduse", function() {
    var options = this.options();
    var dest = this.data.dest;
    this.files.forEach(function(item) {
      var id = options.idleading + item.dest.replace(dest, '').replace('.js', '');
      var data = format('\nseajs.require("%s");\n', id);
      fs.appendFileSync(path.resolve(item.dest), data);
    });
  });
};
