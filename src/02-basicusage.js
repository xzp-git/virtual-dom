import { init } from '../node_modules/snabbdom/build/package/init.js'
import { h } from '../node_modules/snabbdom/build/package/h.js'
// 1. 导入模块
 
import { styleModule } from "../node_modules/snabbdom/build/package/modules/style.js"
import { eventListenersModule } from "../node_modules/snabbdom/build/package/modules/eventlisteners.js"


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
 let app = document.querySelector("#app")

 patch(app,vnode)





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


