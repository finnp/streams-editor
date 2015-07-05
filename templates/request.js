exports.fn = function (opts) {
  var request = require('hyperquest')
  return request(opts.url)
}

exports.params = [
  {name: 'url', type: 'string'}
]

exports.out = true
