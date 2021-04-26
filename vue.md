## vue-router
### 动态路由 以及 嵌套路由
```js
const routes = [
  {
    name: 'login',
    path: '/login',
    component: Login
  },
  // 嵌套路由
  {
    path: '/',
    component: Layout,
    children: [
      {
        name: 'index',
        path: '',
        component: Index
      },
      {
        name: 'detail',
        path: 'detail/:id',
        // 开启props 会把url中的参数传递给组件
        // 在组件中通过 props 来接收
        props: true,
        component: () => import('@/views/Detail.vue')
      }
    ]
  }
]



<template>
  <div>
    <!-- 方式1： 通过当前路由规则，获取数据 -->
    通过当前路由规则获取：{{ $route.params.id }}

    <br>
    <!-- 方式2：路由规则中开启 props 传参 -->
    通过开启 props 获取：{{ id }}
  </div>
</template>

<script>
export default {
  name: 'Detail',
  props: ['id']
}
</script>

<style>

</style>

```

### 编程式导航
```js
this.$router.push("/")//path
this.$router.push({name: "Home"}) //name
this.$router.push({name: "detail",params:{id:1}}) // path: 'detail/:id',
this.$router.push({path: "detail",query:{id:1}}) 


this.$router.go(-1)  //后退上一次

this.$router.replace()  //与push 方法用法相同  但是 会替换当前的地址 不会向浏览器历史栈中添加记录
```
### Hash与History模式区别
不管哪种模式 都是客户端路由的实现方式 当路径发生变化后，不会向服务器发送请求
- 表现形式
1. hash模式
https://music.163.com/#/playlist?id=2366555
2. history模式
https://music.163.com/playlist/2366555  
要用好history模式需要服务端的配合支持

- 原理区别
1. hash模式是基于锚点，以及onhashchange事件
2. history模式是基于html5中的historyAPI
history.pushState() IE10以后才支持  history.replaceState()
#### History模式的使用
- History需要服务器的支持
- 单页面应用中，服务端不存在http://www.testurl.com/login这样的地址会返回找不到该页面
- 在服务端应该除了静态资源外都返回单页面应用的index.html
> 在node服务器中如何配置
```js
//导入处理history模式的模块
const history = require("connect-history-api-fallback")
//注册处理history模式的中间件
app.use(history())

``` 

> 在nginx中如何配置
```js
// start nginx.exe 启动nginx
// nginx.exe -s reload 重启 nginx
// 把打包好的  放在nginx安装目录下的  html 文件夹里

// 修改nginx的配置文件 config/nginx.conf 文件
location / {
  //加一行代码   $uri 是指当前请求的这个路径  根据配置 如果找不到文件 依次往后找
  try_files $uri $uri/ /index.html   
}


```
##  VueRouter实现原理
### Hash模式
- URL中#后面的内容作为路径地址
- 监听hashchange事件
- 根据当前路由地址找到对应组件重新渲染
### History模式
- 通过history.pushState()方法改变地址栏
- 监听popstate事件
- 根据当前路由地址找到对应组件重新渲染

### VueRouter类图
       VueRouter       
+ options
+ data
+ routeMap
+ Constructor（Options）:VueRouter
_ install(Vue):void
+ init():void
+ initEvent():void
+ createRouteMap():void
+ initComponents(Vue):void

### Vue的构建版本
- 运行时版本：不支持template模板，需要打包的时候提前编译
- 完整版：包含运行时和编译器，体积比运行时版本大10K左右，程序运行的时候把模板转换成render函数
```js
// 路由规则
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),

    children:[
      {
        path:"/about/children",
        name:"children",
        component:() => import("@/views/children.vue")
      }
    ]
  }
]
// VueRouter
let _Vue = null;

export default class VueRouter{
    static install(Vue){
        // 1.判断当前插件是否已经被安装
        if ( VueRouter.install.installed ) {
            return; //如果插件被安装 则直接 return
        }
        // 记录当前插件已经被安装
        VueRouter.install.installed = true;
        // 2.把Vue构造函数记录到全局变量
        _Vue = Vue;
        // 3.把创建Vue实例时候传入的router对象注入到Vue实例上
        // _Vue.prototype.$router =  
        // 混入
        _Vue.mixin({
            beforeCreate(){
                if ( this.$options.router ) {
                    _Vue.prototype.$router = this.$options.router
                    this.$options.router.init()
                }
            }
        })

    }
    // 初始化三个属性
    constructor(options){
        this.options = options
        // this.routeMap = {} 
        //this.routeMap = [] //嵌套路由的实现 
        _Vue.util.defineReactive(this,'routeMap',[])
        this.current = "/"  //创建一个响应式的对象
    }
    
    // createRouteMap(){
    //     // 遍历所有的路由规则，以键值对的形式 存储到routeMap中 键是 path  值是对应的组件
    //     this.options.routes.forEach( route => {
    //         this.routeMap[route.path] = route.component
    //     })
    // }
    createRouteMap(routes){
        routes = routes || this.options.routes
        for ( const route of routes ) {
            if (route.path === "/" && this.current === "/") {
                this.routeMap.push(route)
                return
            }
            if( route.path !== "/" && this.current.indexOf(route.path) != -1 ) {
                this.routeMap.push(route)
                if (route.children) {
                    this.createRouteMap(route.children)
                }
                return
            }  
        }

    }

    initComponents(Vue){  //vue实例在全局变量中可以拿到，传递参数是为了减少这个方法和外部的依赖
        const self = this
        Vue.component("router-link",{
           props:{
               to:String
           },
        //    template:"<a :href='to' ><slot></slot></a>" 运行时版本的Vue是不支持模板编译 可以通过vue.config.js  中去配置 runtimeCompiler 设置为 true  默认值是false
         render(h){
           return h("a",{
               attrs:{
                   href:this.to
               },
               on:{
                   click:this.clickHandler
               }
           },[this.$slots.default])  
         },
         methods: {
             clickHandler(e){
                 e.preventDefault()
                 history.pushState({},"",this.to) //三个参数 第一个data是传给popState事件的参数 第二个是title  第三个是 要改变的url
                //  将浏览器的url 赋值给 current 由于current 是响应式的数据 所以视图会发生对应的更新
                 this.$router.current = this.to
                 self.routeMap=[]
                 self.createRouteMap()
                
             }
         }
       }) 
       
       Vue.component("router-view",{
        
           render(h){
                //标记自己是一个 router-view组件
                this.$vnode.data.routerView = true
                //标记当前router-view的深度
                let depth = 0;
                let parent = this.$parent
                while(parent){
                    const vondeData = parent.$vnode && parent.$vnode.data
                    if ( vondeData ) {
                        if ( vondeData.routerView ) {
                            // 说明当前的parent是一个router-view
                            depth++;
                        }
                    }
                    parent = parent.$parent
                }
                 
                let component = null
                const route =   self.routeMap[depth]
                if (route) {
                    component = route.component
                }
                return h(component)
           }
       })
      
    }

    init () { //包装 createRouteMap   initComponents  initEvent 这三个方法 方便使用
        this.createRouteMap();
        this.initComponents(_Vue);
        this.initEvent()
    }

    initEvent(){
        window.addEventListener("popstate",() => {
            this.data.current = window.location.pathname
            this.routeMap=[]
            this.createRouteMap()
        })
    }

}

```
## Vue 响应式原理

###  Object.defineProperty
```html
<body>
  <div id="app">
    hello
  </div>
  <script>
    // 模拟 Vue 中的 data 选项
    let data = {
      msg: 'hello'
    }

    // 模拟 Vue 的实例
    let vm = {}

    // 数据劫持：当访问或者设置 vm 中的成员的时候，做一些干预操作
    Object.defineProperty(vm, 'msg', {
      // 可枚举（可遍历）
      enumerable: true,
      // 可配置（可以使用 delete 删除，可以通过 defineProperty 重新定义）
      configurable: true,
      // 当获取值的时候执行
      get () {
        console.log('get: ', data.msg)
        return data.msg
      },
      // 当设置值的时候执行
      set (newValue) {
        console.log('set: ', newValue)
        if (newValue === data.msg) {
          return
        }
        data.msg = newValue
        // 数据更改，更新 DOM 的值
        document.querySelector('#app').textContent = data.msg
      }
    })

    // 测试
    vm.msg = 'Hello World'
    console.log(vm.msg)
  </script>
```
### Object.defineProperty多个成员

```html
<body>
  <div id="app">
    hello
  </div>
  <script>
    // 模拟 Vue 中的 data 选项
    let data = {
      msg: 'hello',
      count: 10
    }

    // 模拟 Vue 的实例
    let vm = {}

    proxyData(data)

    function proxyData(data) {
      // 遍历 data 对象的所有属性
      Object.keys(data).forEach(key => {
        // 把 data 中的属性，转换成 vm 的 setter/setter
        Object.defineProperty(vm, key, {
          enumerable: true,
          configurable: true,
          get () {
            console.log('get: ', key, data[key])
            return data[key]
          },
          set (newValue) {
            console.log('set: ', key, newValue)
            if (newValue === data[key]) {
              return
            }
            data[key] = newValue
            // 数据更改，更新 DOM 的值
            document.querySelector('#app').textContent = data[key]
          }
        })
      })
    }

    // 测试
    vm.msg = 'Hello World'
    console.log(vm.msg)
  </script>
</body>

```

### proxy
```html
<body>
  <div id="app">
    hello
  </div>
  <script>
    // 模拟 Vue 中的 data 选项
    let data = {
      msg: 'hello',
      count: 0
    }

    // 模拟 Vue 实例
    let vm = new Proxy(data, {
      // 执行代理行为的函数
      // 当访问 vm 的成员会执行
      get (target, key) {
        console.log('get, key: ', key, target[key])
        return target[key]
      },
      // 当设置 vm 的成员会执行
      set (target, key, newValue) {
        console.log('set, key: ', key, newValue)
        if (target[key] === newValue) {
          return
        }
        target[key] = newValue
        document.querySelector('#app').textContent = target[key]
      }
    })

    // 测试
    vm.msg = 'Hello World'
    console.log(vm.msg)
  </script>
</body>

```
### 发布者订阅者模式
```html
<body>
  <script>
    // 事件触发器   信号中心
    class EventEmitter {
      constructor () {
        // { 'click': [fn1, fn2], 'change': [fn] }
        this.subs = Object.create(null)
      }

      // 注册事件  订阅者
      $on (eventType, handler) {
        this.subs[eventType] = this.subs[eventType] || []
        this.subs[eventType].push(handler)
      }

      // 触发事件 发布者
      $emit (eventType) {
        if (this.subs[eventType]) {
          this.subs[eventType].forEach(handler => {
            handler()
          })
        }
      }
    }

    // 测试  信号中心
    let em = new EventEmitter()
    // 订阅者
    em.$on('click', () => {
      console.log('click1')
    })
    em.$on('click', () => {
      console.log('click2')
    })

    // 发布者
    em.$emit('click')
  </script>
</body>
```
### 观察者模式
```html
<body>
  <script>
    // 发布者-目标
    class Dep {
      constructor () {
        // 记录所有的订阅者
        this.subs = []
      }
      // 添加订阅者
      addSub (sub) {
        if (sub && sub.update) {
          this.subs.push(sub)
        }
      }
      // 发布通知
      notify () {
        this.subs.forEach(sub => {
          sub.update()
        })
      }
    }
    // 订阅者-观察者
    class Watcher {
      update () {
        console.log('update')
      }
    }

    // 测试
    let dep = new Dep()
    let watcher = new Watcher()

    dep.addSub(watcher)

    dep.notify()
  </script>
</body>
```

## Virtual DOM  虚拟DOM
- 了解什么是虚拟DOM 以及虚拟DOM的作用
- Snabbdom的基本使用
- Snabbdom的源码解析 
## 什么是Virtual DOM
- Virtual DOM，是由普通的JS对象来描述DOM对象
- 创建真实DOM的成本是很高的
- 使用Virtual DOM来描述真实DOM  成本很低
```js
{
  sel: "div",
  data:{},
  children:undefined,
  text:"Hello Virtual DOM "
  elm:undefined,
  key:undefined
}
```
- 为什么要使用Virtual DOM ？
1. 前端开发刀耕火种的时代
2. MVVM框架解决视图和状态同步的问题
3. 模板引擎可以简化视图操作，没办法跟踪状态
4. 虚拟DOM跟踪状态变化
5. 虚拟DOM可以维护程序的状态，跟踪上一次的状态
6. 通过比较前后两次状态的差异更新真实DOM

### Virtual DOM 的作用  和 虚拟DOM 的库

- 维护视图和状态的关系
- 复杂视图情况下提升渲染性能
- 跨平台
  1. 浏览器平台渲染DOM
  2. 服务端渲染SSR(Nuxt.js/Next.js)
  3. 原生应用(Weex/React Native)
  4. 小程序(mpvue/uni-app)等
### 虚拟DOM 库
- Snabbdom  （主要学习）
1. vue.js2.x内部使用的虚拟DOM就是改造的Snabbdom
2. 大约200SLOC(single line of code)   200行
3. 通过模块扩展
4. 源码使用TypeScript开发
5. 最快的Vritual DOM 之一
- virtual-dom
## Snabbdom 的基本使用
```js
import { init } from 'snabbdom/build/package/init'
import { h } from 'snabbdom/build/package/h'

const patch = init([])

let vnode = h("div#container", [
    h("h1","Hello Snabbdom"),
    h("p","这是一个p")
])

let app = document.querySelector("#app")

let oldVnode = patch(app,vnode)

setTimeout( ()=> {
//    vnode = h("div#container",[
//        h("h1","Hello World"),
//        h("p","Hello P")
//    ])
//    patch(oldVnode, vnode)

// 清除div中的内容
patch(oldVnode,h("!"))
},2000)

```
### 模块作用
- Snabbdon的核心库并不能处理Dom元素的属性/样式/事件等，可以通过注册Snabbdom默认提供的模块来实现
- Snabbdom中的模块可以用来扩展Snabbdom的功能
- Snabbdom中的模块的实现是通过注册全局的钩子函数来实现的
### 官方提供的模块
- attributes
- props
- dataset
- class
- style
- eventlisteners  
使用步骤
- 导入使用步骤
- init（）中注册模块
- h（）函数的第二个参数出使用模块

```js
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
```

### Snabbdom源码解析
- 如何学习源码
1. 宏观了解
2. 带着目标看源码
3. 看源码的过程要不求甚解
4. 调式
5. 参考资料
#### Snabbdom的核心
- init()设置模块，创建patch()函数
- 使用h()函数创建JavaScript对象（VNode）描述真实DOM
- patch()比较新旧两个Vnode
- 把变化的内容更新到真实DOM树
##### h函数介绍
- 作用：创建VNode对象
- Vue中的h函数
- h函数最早见于hyperscript，使用JavaScrit创建超文本
> 函数重载
- 参数个数或参数类型不同的函数
- JavaScript中没有重载的概念
- TypeScript中有重载，不过重载的实现还是通过代码调整参数
> 常用快捷键
- 鼠标选中 F12 转到定义【或者 ctrl+鼠标左键】  alt +  <- (方向键左)  返回到之前的位置
#### patch整体过程分析
- patch(oldVnode,newVnode)
- 把新节点中变化的内容渲染到真实的DOM，最后返回新节点作为下一次处理的旧节点
- 对比新旧VNode是否相同节点（节点的key和sel相同）
- 如果不是相同节点，删除之前的内容，重新渲染
- 如果是相同节点，再判断新的VNode是否有text，如果有并且和oldVnode的text不同，直接更新文本内容
- 如果新的VNode有children，判断子节点是否有变化
> createEklm 函数
- 作用 ： 把Vnode节点转换成对应的DOM元素，把DOM元素存储到Vnde上对应的elm属性上，并没有把创建的元素挂载到DOM树上。
1. // 执行用户设置的 init 钩子函数
2. // 把 vnode转换成真实的DOM对象（没有渲染到页面）
3. // 返回新创建的DOM
#### init函数
