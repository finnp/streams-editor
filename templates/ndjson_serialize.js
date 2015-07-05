exports.fn = function () {
  var ndjson = require('ndjson')
  return ndjson.serialize()
}
exports.in = true
exports.out = true
