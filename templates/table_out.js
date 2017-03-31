exports.fn = function () {
  var htmltable = require('htmltable')
  return htmltable(document.querySelector('footer'))
}

exports.in = true
