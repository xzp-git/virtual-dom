import { init } from 'snabbdom/build/package/init'
import { h } from 'snabbdom/build/package/h'

const patch = init([])

// 第一个参数、：标签选择器
// 第二个参数 ： 如果是字符串就是标签中的文本内容
let vnode = h("div#container.cls","hello world")


let app = document.querySelector("#app")

// 第一个参数 旧的vnode  可以是DOM元素
// 第二个参数 新的vnode
// 新的 VNode

let oldVnode = patch(app, vnode)

vnode = h("div#container.xxx","hello Snabbdom")

patch(oldVnode,vnode)


