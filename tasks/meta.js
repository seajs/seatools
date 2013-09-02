module.exports = function(grunt) {

  grunt.registerMultiTask("meta", function() {
    require('shelljs/global');
    var fs = require('fs');
    var path = require('path');
    var format = require('util').format;

    var options = this.options({
      isPublish: false
    });

    var files = find(path.resolve('./tests'))
      .filter(function(item) {
        return /test.html$/.test(item);
      }).map(function(item) {
        return item
          .replace(path.resolve('./tests') + '/', '')
          .replace('/test.html', '')
          .replace(/^|$/g, '"');
      });

    // 发布的时候会把插件的测试用例也加上
    if (options.isPublish) {
      var pkg = require(path.resolve('./package.json'));
      if (!/^seajs-/.test(pkg.name) && pkg['seajs-plugin']) {
        files = pkg['seajs-plugin'].map(function(item) {
          return format('"/%s/tests/spec"', item);
        }).concat(files);
      }
    }

    var runner = path.resolve('./_site/tests/runner.html');
    var script = format('<script>testSuites = [%s]</script>', files.join(','));
    var html = fs.readFileSync(runner).toString()
      .replace(/(<\/head>)/, script + '$1');
    fs.writeFileSync(runner, html);
  });
};