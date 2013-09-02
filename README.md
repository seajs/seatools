# Seatools

> Seajs helpers that can build, debug and test.

---

## 安装

```
$ npm install seatools -g
```

## 使用说明

Seatools 是为了 seajs 和他的插件们能快速开发和调试而产生的。

### 构建

seajs 本身的构建与插件略有不同，但插件们的构建方式应该要保持一致。

```
$ seatools build
```

### 调试

生成文档到 _site 目录

```
$ seatools site
```

起服务调试，支持 livereload，默认端口为 8000。

```
$ seatools site -w
```

### 测试

**测试之前需要先生成站点**

用 phantom 测试 file 协议

```
$ seatools test --local
```

用 phantom 测试 http 协议

```
$ seatools test --http
```

用 totoro 测试跨浏览器，首先查看下是否有 server

```
$ totoro list
$ seatools test --totoro
```

### 发布

把站点发布到 gh-pages 中

```
$ seatools publish
```

## 资源

- seatools 使用说明 https://github.com/seajs/seajs/issues/924
- 插件开发的一些规则 https://github.com/seajs/seatools/issues/2

### License

MIT
