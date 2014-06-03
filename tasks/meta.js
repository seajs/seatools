module.exports = function(grunt) {
  var fs = require('fs');
  var path = require('path');
  var format = require('util').format;

  grunt.registerMultiTask("meta", function() {
    var shelljs = require('shelljs');

    var options = this.options({
      isPublish: false,
      isTest: false
    });

    var scriptContent = '';
    // seajs 使用手动配置 meta
    if (fs.existsSync(path.resolve('./tests/meta.js'))) {
      scriptContent = fs.readFileSync(path.resolve('./tests/meta.js')).toString();
      grunt.log.writeln('Generate testSuites from ./tests/meta.js');
    } 

    // 插件则自动生成 meta
    else {
      var files = shelljs.find(path.resolve('./tests'))
        .filter(function(item) {
          return /test.html$/.test(item);
        }).map(function(item) {
          return item
            .replace(path.resolve('./tests') + '/', '')
            .replace('/test.html', '')
            .replace(/^|$/g, '"');
        });

      scriptContent = format('testSuites = [%s];\n', files.join(','));
      grunt.log.writeln('Generate testSuites by scaning directory');
    }

    var plugins, pkg = require(path.resolve('./package.json'));
    // 只适用于 seajs 本身
    if (!/^seajs-/.test(pkg.name)) {
      // seajs 本地测试的时候把插件代码复制到 _site 下
      if (options.isTest && !/^seajs-/.test(pkg.name)) {
        plugins = fs.readdirSync(path.resolve('..'))
          .filter(function(item) {
            return /^seajs-/.test(item);
          });
  
        plugins.forEach(function(item) {
          var pluginBase = path.resolve('../' + item);
          shelljs.cp('-rf', path.join(pluginBase, 'tests/spec/*'), path.resolve('./_site/tests/' + item));
          shelljs.cp('-rf', path.join(pluginBase, 'dist/*'), path.resolve('./_site/dist'));
          if(item == 'seajs-debug') {
            shelljs.cp('-r', path.join(pluginBase, 'src/store.js'), path.resolve('./_site/src/'));
          }
          var testHtml = path.resolve('./_site/tests/' + item + '/test.html');
          var s = fs.readFileSync(testHtml, { encoding: 'utf-8' });
          s = s.replace(/<script\s+[^>,]+\/sea\.js"><\/script>/, '<script src="../../dist/sea.js"></script>');
          s = s.replace(/<script\s+[^>,]+\/seajs-(\w+?)\.js"><\/script>/, '<script src="../../dist/seajs-$1.js"></script>');
          fs.writeFileSync(testHtml, s, { encoding: 'utf-8' });
        });
  
        scriptContent += format(
          'testSuites = testSuites.concat(%s);\n',
          JSON.stringify(plugins, null, 2)
        );
        grunt.log.writeln('Test mode, get ' + plugins.length + ' plugins from parent directory');
      }

      // 发布的时候会把插件的测试用例也加上
      if (options.isPublish) {
        var done = this.async();
        var url = require('url');
        var https = require('https');
        var parsed = url.parse('https://api.github.com/orgs/seajs/repos');
        parsed.headers = {
          'User-Agent': 'seajs'
        };
        var req = https.get(parsed, function(res) {
          var data = '';
          res.on('data', function (chunk) {
            data += chunk;
          });
          res.on('end', function() {
            plugins = JSON.parse(data.toString())
              .map(function(item) {
                return item.name;
              })
              .filter(function(item) {
                return /^seajs-/.test(item);
              })
              .map(function(item) {
                return format('/%s/tests/spec', item);
              });
            scriptContent += format(
              'testSuites = testSuites.concat(%s);\n',
              JSON.stringify(plugins, null, 2)
            );
            grunt.log.writeln('Publish mode, get ' + plugins.length + ' plugins from github');
            insertScript(scriptContent);
            done();
          });
        });
      } else {
        insertScript(scriptContent);
      }
    } else {
      insertScript(scriptContent);
    }
  });

  function insertScript(content) {
    var script = format('<script>%s</script>', content);
    var runner = path.resolve('./_site/tests/runner.html');
    var html = fs.readFileSync(runner).toString()
      .replace(/(<\/head>)/, script + '$1');
    fs.writeFileSync(runner, html);
  }
};
