exports.fn = function () {
  var through = require('through2')
  return through.obj(function (chunk, enc, cb) {
    this.push(chunk)
    cb()
  })
}

exports.in = true
exports.out = true
