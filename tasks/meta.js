module.exports = function(grunt) {

  grunt.registerTask("meta", function() {
    require('shelljs/global');
    var fs = require('fs');
    var path = require('path');
    var format = require('util').format;
    var files = find(path.resolve('./tests'))
      .filter(function(item) {
        return /test.html$/.test(item);
      }).map(function(item) {
        return item
          .replace(path.resolve('./tests'), '')
          .replace('/test.html', '')
          .replace(/^|$/g, '"');
      });

    var runner = path.resolve('./_site/tests/runner.html');
    var script = format('<script>testSuites = [%s]</script>', files.join(','));
    var html = fs.readFileSync(runner).toString()
      .replace(/(<\/head>)/, script + '$1');
    fs.writeFileSync(runner, html);
  });
};