var h = require('virtual-dom/h')
var diff = require('virtual-dom/diff')
var patch = require('virtual-dom/patch')
var createElement = require('virtual-dom/create-element')
var uuid = require('uuid')
var indexArray = require('index-array')

module.exports = Windows

function Windows() {
  this.list = []
  this.defaultBody = h('textarea')
  
  this.tree = this.render()
  this.rootNode = createElement(this.tree)
  document.body.appendChild(this.rootNode)
  
  this.dragWindow = {}

  setInterval(this.patch.bind(this), 20)
  
  window.addEventListener('mousemove', function (e) {
    this.dragWindow.x = e.pageX - this.dragWindow.offsetX
    this.dragWindow.y = e.pageY - this.dragWindow.offsetY
  }.bind(this))
  
  window.addEventListener('mouseup', function (e) {
    this.dragWindow = {}
  }.bind(this))
  
}

Windows.prototype.getWindow = function (id) {
  return indexArray(this.list, 'id')[id] || {}
}

Windows.prototype.patch = function () {
    var newTree = this.render()
    var patches = diff(this.tree, newTree)
    this.rootNode = patch(this.rootNode, patches)
    this.tree = newTree
}

Windows.prototype.add = function add(win) {
  win.id = uuid()
  this.list.push(win)
}

Windows.prototype.onmousedown = function(id, ev) {
  this.dragWindow = this.getWindow(id)
  this.dragWindow.offsetX = ev.offsetX
  this.dragWindow.offsetY = ev.offsetY
}

Windows.prototype.render = function render() {
  var defaultBody = this.defaultBody
  var divWindows = this.list.map(function (win) {
    var style = {
      top: win.y + 'px',
      left: win.x + 'px'
    }
    var id = win.id
    var onmousedown = this.onmousedown.bind(this, id)
    return h('div.window', {style: style}, [
      h('div.bar', {onmousedown: onmousedown},[
        h('div.name', win.name),
        h('div.close', '×')
      ]),
      h('div.body', win.body || defaultBody)
    ])
  }.bind(this))
  return h('div.windows', divWindows)
}