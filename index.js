var FlowGraph = require('flowgraph')
var FlowGraphView = require('flowgraph-editor')

var insertCss = require('insert-css')
var Sandbox = require('browser-module-sandbox')
var delegate = require('delegate-dom')
var extend = require('xtend')
var domArray = require('dom-array')

var templates = require('./templates.json')

var templatesElement = document.querySelector('#templates')
var startButton = document.querySelector('#start')

Object.keys(templates).forEach(function (name) {
  var li = document.createElement('li')
  var button = document.createElement('button')
  var text = document.createTextNode(name)
  button.appendChild(text)
  li.appendChild(button)
  templatesElement.appendChild(li)
  button.setAttribute('class', 'btn-add')
})

var sandbox = new Sandbox({
  name: 'streams-editor',
  cdn: 'https://wzrdwzrd.herokuapp.com',
  container: document.body
})

sandbox.on('bundleEnd', function () {
  startButton.innerHTML = 'Start'
  console.log('Bundled.')
})

var graph = new FlowGraph()

var view = new FlowGraphView(graph)
document.body.appendChild(view.svg)

var Windows = require('./windows')
var windows = new Windows()

graph.on('node-deleted', function (node) {
  windows.remove(node.id)
})

graph.on('node-added', function (node) {
  windows.add({id: node.id, name: node.id + '(' + node.label + ')', x: node.x + 100, y: node.y, config: node.config})
  windows.hide(node.id)
})

view.on('node-select', function (node) {
  windows.show(node.id)
  windows.setPosition(node.id, {x: node.x + 108, y: node.y})
})

insertCss(FlowGraphView.css)

function runCode () {
  var edges = graph.getEdges()
  var nodeOutFn = "function nodeOut(id) {\nvar stream = require('stream-wrapper').defaults({objectMode:true})\nreturn stream.writable(function(chunk, enc, cb) {\nif(chunk.length) chunk = chunk.toString()\nparent.postMessage({type: 'nodeOut', id: id}, '*')\ncb()\n})\n}"
  var streams = graph.nodes.map(function (node) {
    // code
    var selectorCode = '#window-' + node.id + ' textarea'
    var content = document.querySelector(selectorCode).value
    // opts
    var selectorOpts = '#window-' + node.id + ' input'
    var opts = {}
    domArray(document.querySelectorAll(selectorOpts)).forEach(function (elem) {
      opts[elem.dataset.name] = elem.value
    })

    var firstline = 'var ' + node.id + ' = ('
    var noEnd = '\n' + node.id + '.end = function noop() {}'

    var nodeProgram = [firstline, content, ')(' + JSON.stringify(opts) + ')', noEnd]
    if (node.outports.length > 0) {
      var nodeOut = node.id + '.pipe(nodeOut("' + node.id + '"))'
      nodeProgram.push(nodeOut)
    }
    return nodeProgram.join('\n')
  }).join('\n')
  var pipes = edges.map(function (edge) {
    return edge.source.id + '.pipe(' + edge.target.id + ')'
  }).join('\n')
  var bundle = [nodeOutFn, streams, pipes].join('\n\n')
  console.log(bundle)
  sandbox.bundle(bundle)
}

window.addEventListener('message', receiveMessage, false)

function receiveMessage (e) {
  if (typeof e.data === 'string') console.log(e.data)
  if (typeof e.data === 'object') {
    if (e.data.type === 'nodeOut') {
      view.blinkEdge(e.data.id)
    }
  }
}

delegate.on(templatesElement, 'button', 'click', function (e) {
  var label = e.target.innerText
  var config = templates[label]
  var opts = {label: label, config: config}
  if (!config.in) opts.inports = []
  if (!config.out) opts.outports = []

  var options = extend({
    x: 200,
    y: 200
  }, opts)
  try {
    graph.addNode(options)
  } catch(e) {
    console.error(e.message)
  }
})

startButton.addEventListener('click', function () {
  startButton.innerHTML = 'bundling…'
  runCode()
})
