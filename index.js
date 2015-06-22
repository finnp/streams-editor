var FlowGraph = require('flowgraph')
var FlowGraphView = require('flowgraph').View
var insertCss = require('insert-css')

window.graph = new FlowGraph()
graph.addNode('A')
graph.addNode('B')
graph.addNode('C')
graph.connect('C', 'B', 'out', 'in')

var view = new FlowGraphView(graph)
document.body.appendChild(view.svg)

view.on('node-select', function (node) {
  console.log(node)
})

insertCss(FlowGraph.css)


// 
var Windows = require('./windows')
var windows = new Windows()
windows.add({name:'example', x: 10, y: 10})

