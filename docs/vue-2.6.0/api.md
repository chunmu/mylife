# 全局api解析

## 1. $nextTick

### 1.1 使用场景

当你设置vm.someData = 'new value'，该组件不会立即重新渲染。当刷新队列时，组件会在事件循环队列清空时的下一个“tick”更新。多数情况我们不需要关心这个过程，但是如果你想在 DOM 状态更新后做点什么，这就可能会有些棘手。虽然 Vue.js 通常鼓励开发人员沿着“数据驱动”的方式思考，避免直接接触 DOM，但是有时我们确实要这么做。为了在数据变化之后等待 Vue 完成更新 DOM ，可以在数据变化之后立即使用Vue.nextTick(callback) 。这样回调函数在 DOM 更新完成后就会调用


### 1.2 js运行机制,宏任务微任务,promise&setTimeout

- 执行栈 

存储函数调用的栈结构，先进后出

- 主线程 

现在正在执行栈中的某个事件

- Event Loop

    - 执行栈选择最先进队列的宏任务 一般是script，执行其中同步代码直至结束
    - 检查是否存在微任务，有则执行微任务队列至其为空
    - 如有必要 会执行dom操作  dom操作修改也是同步任务  渲染是异步
    - 开始下一轮tick，执行宏任务中的异步代码

- 宏任务macrotask

    - 宿主(node，浏览器)发起的任务
    - es6称为task
    - script,settimeout,setInterval,I/O,UI rendering,postMessage,MessageChannel,setImediate

- 微任务microtask

    - js引擎发起的任务
    - 在ES6称为jobs
    - Promise，MutaionObserver,process.nextTick

- 结论 

执行完一轮宏任务后，执行微任务，再继续下一轮宏任务，微任务，setTimeout放置在下一轮宏任务中  所以promise执行快

### 1.3 vue的实现

- 定义全局变量callbacks收集回调方法,定义pending开关 控制callbacks的稳定性，确保当前执行的时候没有插入操作，或者插入之后再进行rush对于性能的提升

```javascript

const callbacks = []
let pending = false

```

- 定义调用方法

```javascript

function flushCallbacks () {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  // 先进先执行
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}

```

- 定义宏任务微任务生成器

优先判断是否支持Promise,ie环境下会若条件允许会使用MutationObserver，继续尝试setImmediate，setTimeout

```javascript

  // ios移动端在有setTimeout的触发的情况下  会执行promise微任务
  if (isIOS) setTimeout(noop)
  
  isUsingMicroTask = true // 是否启用微任务作为nexttick的实现方式 在处理ie下事件绑定有用到

```

- nextTick


```javascript 

export function nextTick (cb?: Function, ctx?: Object) {
  let _resolve
  // 构造一个匿名方法 方法中包括了cb执行逻辑，且带上可选的上下文ctx
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  })
  // 避免多次执行 在上部分压入数组的过程中 已经执行完毕 
  // 已经成功把要处理的cb压入callbacks
  // 如果pending=true,上一次的flushCallbacks还未执行，这次压入的会和之前的一起flush
  // 如果pending=false,则开启一次新的flush
  // 避免了n次执行的情况
  if (!pending) {
    pending = true
    timerFunc()
  }
  // $flow-disable-line
  // 空cb并没有看出有什么意义
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}

```

## mergeOptions合并方法和策略

```javascript

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 */
export function mergeOptions (
  parent: Object,
  child: Object,
  vm?: Component
): Object {
  if (process.env.NODE_ENV !== 'production') {
    // 检查组件名称是否合法 非保留标签 unicode范围内字符标签
    checkComponents(child)
  }

  if (typeof child === 'function') {
    child = child.options
  }

  normalizeProps(child, vm)
  normalizeInject(child, vm)
  normalizeDirectives(child)

  // Apply extends and mixins on the child options,
  // but only if it is a raw options object that isn't
  // the result of another mergeOptions call.
  // Only merged options has the _base property.
  // 具有_base属性的讲跳过 不再进行处理
  // _base = Vue 执行构造函数
  // 一般是通过Vue.extend()这样的扩展方式 extend中将会继承super，在初次处理时，遍历循环处理所有extends mixins
  // mergeOptions执行完后 Sub的options将含有_base
  // 对性能很有帮助 避免重复处理规范法操作
  // Sub.options = mergeOptions(
  //   Super.options,
  //   extendOptions
  // )
  // 一般特指构造函数上的options 具有不应该变动的特征  用户自定义options扩展 有可能后续有改变的情况存在
  // 从逻辑上看 含有base的都是构造函数上的options
  // Vue.extend(customOptions)
  // customOptions保持独立 生成的options含有_base
  if (!child._base) {
    // extends扩展
    if (child.extends) {
      parent = mergeOptions(parent, child.extends, vm)
    }
    // mixins扩展
    if (child.mixins) {
      for (let i = 0, l = child.mixins.length; i < l; i++) {
        parent = mergeOptions(parent, child.mixins[i], vm)
      }
    }
  }

  const options = {}
  let key
  // 开始合并 不知道拆分合并的意义  哦  有可能parent有 而child没有
  for (key in parent) {
    mergeField(key)
  }
  // 补充合并 parent中没有的 加上补充
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }
  function mergeField (key) {
    const strat = strats[key] || defaultStrat
    // 涉及到data props  hook等的合并策略 具体可查看我github中的注释
    options[key] = strat(parent[key], child[key], vm, key)
  }
  return options
}

```