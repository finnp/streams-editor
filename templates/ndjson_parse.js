exports.fn = function () {
  var ndjson = require('ndjson')
  return ndjson.parse()
}

exports.in = true
exports.out = true
