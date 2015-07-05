var fs = require('fs')
var templateFolder = './templates/'
var fs = require('fs')

var files = fs.readdirSync(templateFolder)
var templates = {}

files
  .map(function (file) {
    return file.slice(0, -3)
  })
  .forEach(function (file) {
    var template = require(templateFolder + file)
    template.fn = template.fn.toString()
    templates[file] = template
  })

fs.writeFileSync('./templates.json', JSON.stringify(templates, null, ' '))
