var h = require('virtual-dom/h')
var diff = require('virtual-dom/diff')
var patch = require('virtual-dom/patch')
var createElement = require('virtual-dom/create-element')
var uuid = require('uuid')
var indexArray = require('index-array')

module.exports = Windows

function Windows() {
  this.list = []

  this.defaultConfig = {fn: [
    "var streams = require('stream')",
    "var stream = streams.PassThrough({objectMode: true})",
    "return stream"
  ].join('\n')}
  
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

Windows.prototype.add = function add(win, id) {
  win.id = win.id || id || uuid()
  this.list.push(win)
  return win.id
}

Windows.prototype.remove = function (id) {
  this.list = this.list.filter(function (win) {
    return win.id !== id
  })
}

Windows.prototype.hide = function (id) {
  var win = this.getWindow(id)
  win.hidden = true
}

Windows.prototype.show = function (id) {
  var win = this.getWindow(id)
  win.hidden = false
}

Windows.prototype.setPosition = function (id, pos) {
  var win = this.getWindow(id)
  win.x = pos.x
  win.y = pos.y
}

Windows.prototype.ondrag = function(id, ev) {
  this.dragWindow = this.getWindow(id)
  this.dragWindow.offsetX = ev.offsetX
  this.dragWindow.offsetY = ev.offsetY
}

Windows.prototype.render = function render() {
  var defaultBody = this.defaultBody
  var divWindows = this.list
    .map(function (win) {
      var style = {
        top: win.y + 'px',
        left: win.x + 'px',
        visibility: (win.hidden ? 'hidden' : 'visible')
      }
      var id = win.id
      var ondrag = this.ondrag.bind(this, id)
      var close = this.hide.bind(this, id)
      
      var form = []
      ;(win.config.params || []).forEach(function (param) {
        form.push(h('div', {className: 'form-label'}, param.name))
        form.push(h('input', {dataset: {name: param.name}}))
      })
      form.push(h('textarea', win.config.fn || defaultBody.fn))
      
      return h('div.window', {style: style, id: 'window-' + win.id}, [
        h('div.bar', {onmousedown: ondrag},[
          h('div.name', win.name),
          h('div.close', {onclick: close}, '×')
        ]),
        h('div.body', form)
      ])
    }.bind(this))
  return h('div.windows', divWindows)
}