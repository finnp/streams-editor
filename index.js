var FlowGraph = require('flowgraph')
var FlowGraphView = require('flowgraph').View
var insertCss = require('insert-css')
var Sandbox = require('browser-module-sandbox')
var h = require('virtual-dom/h')
var templates = require('./templates.json')
var delegate = require('delegate-dom')
var extend = require('xtend')


var templatesElement = document.querySelector('#templates')
var startButton = document.querySelector('#start')
var addNodeForm = document.querySelector('#add-node')
var nodeNameInput = document.querySelector('#node-name')

Object.keys(templates).forEach(function (name) {
  var li = document.createElement('li')
  var button = document.createElement('button')
  var text = document.createTextNode(name)
  button.appendChild(text)
  li.appendChild(button)
  templatesElement.appendChild(li)
})

delegate.on(templatesElement, 'button', 'click', function (e) {
  var label = e.target.innerText 
  var body = h('textarea', templates[label])
  newNode({id: label, body: body})
})

addNodeForm.addEventListener('submit', function (e) {
  e.preventDefault()
  newNode({id: nodeNameInput.value})
})

startButton.addEventListener('click', function () {
  startButton.innerHTML = 'bundling...'
  runCode()
})

function newNode(opts) {
  opts = opts || {}
  var options = extend({
    x: 200,
    y: 200
  }, opts)
  var node = graph.addNode(options)
  if(node) {
    windows.add({id: node.id, name: node.id, x: node.x + 100, y: node.y, body: node.body})
    windows.hide(node.id)
  }
  else alert('ID already exists.')
}

// code for nodes (should go in own files)
var outnode = h('textarea', [
"var stream = require('stream-wrapper').defaults({objectMode:true})",
"return stream.writable(function(chunk, enc, cb) {",
"   parent.postMessage(chunk, '*')",
"   cb()",
"})"
].join('\n'))

window.addEventListener('message', receiveMessage, false)

function receiveMessage(event) {
  console.log(event.data)
}

var sandbox = new Sandbox({
  name: 'streams-editor',
  cdn: 'https://wzrd.in',
  container: document.body
})

sandbox.on('bundleEnd', function () {
  startButton.innerHTML = 'Start'
  console.log('Bundled.')
})

window.graph = new FlowGraph()
graph.addNode({id:'out', body: outnode, outports: [], x: 300, y: 300})

var view = new FlowGraphView(graph)
document.body.appendChild(view.svg)

var Windows = require('./windows')
var windows = new Windows()


graph.nodes.forEach(function (node) {
  windows.add({id: node.id, name: node.id, x: node.x, y: node.y, body: node.body})
  windows.hide(node.id)
})

graph.on('node-deleted', function (node) {
  windows.remove(node.id)
})

view.on('node-select', function (node) {
  windows.show(node.id)
  windows.setPosition(node.id, {x: node.x + 100, y: node.y})
})

insertCss(FlowGraph.css)

function runCode() {
  var edges = graph.getEdges()
  var streams = graph.nodes.map(function (node) {
    var firstline = 'var ' + node.id + ' = (function() {'
    var selector = '#window-' + node.id + ' textarea'
    var content = document.querySelector(selector).value
    return [firstline, content, '})()'].join('\n')
  }).join('\n')
  var pipes = edges.map(function (edge) {
    return edge.source.id + '.pipe(' + edge.target.id + ')'
  }).join('\n')
  sandbox.bundle(streams + '\n\n' + pipes)
}
