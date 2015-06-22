var FlowGraph = require('flowgraph')
var FlowGraphView = require('flowgraph').View
var insertCss = require('insert-css')

window.graph = new FlowGraph()
graph.addNode('a')
graph.addNode('b')
graph.addNode('c')
graph.connect('c', 'b', 'out', 'in')

var view = new FlowGraphView(graph)
document.body.appendChild(view.svg)

var Windows = require('./windows')
var windows = new Windows()


graph.nodes.forEach(function (node) {
  windows.add({id: node.id, name: node.id, x: node.x, y: node.y})
  windows.hide(node.id)
})

view.on('node-select', function (node) {
  windows.show(node.id)
  windows.setPosition(node.id, node)
})

insertCss(FlowGraph.css)

window.streamCode = function () {
  var edges = graph.getEdges()
  var streams = graph.nodes.map(function (node) {
    var firstline = 'var ' + node.id + ' = (function() {'
    var selector = '#window-' + node.id + ' textarea'
    console.log(selector)
    var content = document.querySelector(selector).value
    return [firstline, content, '})()'].join('\n')
  }).join('\n')
  var pipes = edges.map(function (edge) {
    console.log(edge)
    return edge.source.id + '.pipe(' + edge.target.id + ')'
  }).join('\n')
  return streams + '\n\n' + pipes
}


//https://github.com/maxogden/browser-module-sandbox