module.exports = function(grunt) {

  grunt.registerMultiTask("meta", function() {
    require('shelljs/global');
    var fs = require('fs');
    var path = require('path');
    var format = require('util').format;

    var options = this.options({
      isPublish: false,
      isTest: false
    });

    var scriptContent = '';
    // seajs 使用手动配置 meta
    if (fs.existsSync(path.resolve('./tests/meta.js'))) {
      scriptContent = fs.readFileSync(path.resolve('./tests/meta.js')).toString();
    } 

    // 插件则自动生成 meta
    else {
      var files = find(path.resolve('./tests'))
        .filter(function(item) {
          return /test.html$/.test(item);
        }).map(function(item) {
          return item
            .replace(path.resolve('./tests') + '/', '')
            .replace('/test.html', '')
            .replace(/^|$/g, '"');
        });

      scriptContent = format('testSuites = [%s];', files.join(','));
    }

    // 发布的时候会把插件的测试用例也加上
    if (options.isPublish) {
      var pkg = require(path.resolve('./package.json'));
      if (!/^seajs-/.test(pkg.name) && pkg['seajs-plugin']) {
        var plugins = pkg['seajs-plugin'].map(function(item) {
          return format('/%s/tests/spec', item);
        });
        scriptContent += format('testSuites = testSuites.concat(%s);\n', JSON.stringify(plugins, null, 2));
      }
    }

    // seajs 本地测试的时候把插件代码复制到 _site 下
    if (options.isTest) {
      var plugins = fs.readdirSync(path.resolve('..'))
        .filter(function(item) {
          return /^seajs-/.test(item);
        });

      plugins.forEach(function(item) {
        var pluginBase = path.resolve('../' + item);
        cp('-rf', path.join(pluginBase, 'tests/spec/*'), path.resolve('./_site/tests/' + item));
        cp('-rf', path.join(pluginBase, 'dist/*'), path.resolve('./_site/dist'));
      });

      scriptContent += format(
        'testSuites = testSuites.concat(%s);\n',
        JSON.stringify(plugins, null, 2)
      );
    }

    var script = format('<script>%s</script>', scriptContent);
    var runner = path.resolve('./_site/tests/runner.html');
    var html = fs.readFileSync(runner).toString()
      .replace(/(<\/head>)/, script + '$1');
    fs.writeFileSync(runner, html);
  });
};
