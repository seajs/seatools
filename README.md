# Seatools

> Provide build, test and other tools for Sea.js developers.


## Installation

```
$ npm install seatools -g
```


## Usage

If you are a developer of Sea.js or its plugins, using seatools will bring
a pleasant experience to boring coding work.


### build

Convert source files to distribution version through concatenating, compressing
and some other processing steps.

```
$ seatools build
```


### site

Generate site files for debugging etc.

```
$ seatools site
```

Start a http server which support livereload watching. The default protocol is
8000.

```
$ seatools site -w
```


### test

Run test cases in various environment.

Test in localfile protocol under phantom environment.

```
$ seatools test --local
```

Test in http protocol under phantom environment.

```
$ seatools test --http
```

Using totoro to run test cases in http protocol under connected real browsers.

```
$ seatools test --totoro
```


### publish

Publish site files to gh-pages branch.

```
$ seatools publish
```


## References

- <https://github.com/seajs/seajs/issues/924>
- <https://github.com/seajs/seatools/issues/2>

