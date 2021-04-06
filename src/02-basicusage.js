import { init } from 'snabbdom/build/package/init'
import { h } from 'snabbdom/build/package/h'
// 1. 导入模块
 
import { styleModule } from "snabbdom/build/package/style"
import { eventListenersModule } from "snabbdom/build/package/eventlistenters"


// 2. 注册模块
const patch = init([ 
    styleModule,
    eventListenersModule
 ])

// 3.使用h()函数的第二个参数传入模块中使用的数据（对象）

let vnode = h("div", [
    h("h1", { style:{backgroundColor: "red"} },"Hello World"),
    h("p", {on:{click: eventHandler}},"hello P")
])

function eventHandler () {
    console.log("别点我 疼");
}
// let vnode = h("div#container", [
//     h("h1","Hello Snabbdom"), 
//     h("p","这是一个p")

// ])

// let app = document.querySelector("#app")

// let oldVnode = patch(app,vnode)

// setTimeout( ()=> {
// //    vnode = h("div#container",[
// //        h("h1","Hello World"),
// //        h("p","Hello P")
// //    ])
// //    patch(oldVnode, vnode)

// // 清除div中的内容
// patch(oldVnode,h("!"))
// },2000)


