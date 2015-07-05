exports.fn = function (opts) {
  var stream = require('stream-wrapper').defaults({objectMode: true})
  var started
  return stream.readable(function (size) {
    if (!started) setInterval(this.push.bind(this, opts.value), Number(opts.interval))
    started = true
  })
}

exports.params = [
  {name: 'value', type: 'string'},
  {name: 'interval', type: 'number'}
]

exports.out = true
