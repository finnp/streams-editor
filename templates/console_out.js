exports.fn = function () {
  var stream = require('stream-wrapper').defaults({objectMode: true})
  return stream.writable(function (chunk, enc, cb) {
    if (chunk.length) chunk = chunk.toString()
    window.parent.postMessage(chunk, '*')
    cb()
  })
}

exports.in = true
