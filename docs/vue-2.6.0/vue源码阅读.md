# Vue

> 以问题解答的方式阅读和理解vue源码


### 1. vue应用根节点如何完成应用挂载


假设现有如下html
```html

<body>
  <div id="app"></div>
  <div>兄弟节点</div>
</body>

```

```javascript

// 起始部分
const app = new Vue()

app.$mount('.app')

// 看看mount执行过程
// 检查是否有render render是一个代码块 类似于 function () {with(this){return _c('section',{staticClass:"todoapp"})}
// 如果没有render 尝试获取template 通过选择器获取
  if (!options.render) {
    let template = options.template
    // 获取template
    ...
    // 构建render
    if (template) {
      /* istanbul ignore if */
      const { render, staticRenderFns } = compileToFunctions(template, {
        outputSourceRange: process.env.NODE_ENV !== 'production',
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns
      ...
    }
    // 执行prototype的mount方法 
    return mount.call(this, el, hydrating)
  }

// 开始mount => mountComponent
// 调用_render() 生成VNode关系树
// _udate()触发更新调起__patch__
// 注意 此时参数为$el 也就是section.app
vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)

// 进入patch方法，且oldVnode是真实节点  并且会给真实节点$el补充一个vnode
oldVnode = emptyNodeAt(oldVnode)

const oldElm = oldVnode.elm // section.app
// 通过它拿到parentNode关联上 当前是body
const parentElm = nodeOps.parentNode(oldElm)

createElm(
  vnode,
  insertedVnodeQueue,
  oldElm._leaveCb ? null : parentElm, // 给transition用的
  nodeOps.nextSibling(oldElm) // 兄弟节点  div
)

// 此时并不是component，而是一个真实节点
// elm储存dom节点
vnode.elm = vnode.ns
  ? nodeOps.createElementNS(vnode.ns, tag)
  : nodeOps.createElement(tag, vnode)
setScope(vnode)

// createChildren 并没有子节点
createChildren(vnode, children, insertedVnodeQueue)
if (isDef(data)) {
  invokeCreateHooks(vnode, insertedVnodeQueue)
}
// 执行插入操作  parentElm = body, vnode.elm = app, refElm = div兄弟节点
insert(parentElm, vnode.elm, refElm)

// 有parent，有兄弟节点，调取insertBefore
function insert (parent, elm, ref) {
  if (isDef(parent)) {
    if (isDef(ref)) {
      if (nodeOps.parentNode(ref) === parent) {
        nodeOps.insertBefore(parent, elm, ref)
      }
    } else {
      nodeOps.appendChild(parent, elm)
    }
  }
}

// 到这一步 已经生成了一套完整dom了，不过还有一个问题，oldVnode.elm还在dom树上，也就是说，此时有两个相同的section标签
// 调用removeVnodes 清除旧有dom 之后就只存在一个section 且是经过vue处理后的
if (isDef(parentElm)) {
  removeVnodes(parentElm, [oldVnode], 0, 0)
} else if (isDef(oldVnode.tag)) {
  invokeDestroyHook(oldVnode)
}
```

### 2. 父子组件的关系是怎么构建的


假设html

```html

<body>
  <div id="app">
    <child>
      <grand-son></grand-son>
    </child>
  </div>
</body>

```

- 生成code块

```javascript

"with(this){return _c('section',{staticClass:"app"},[_c('child',[_c('grand-son')],1)],1)}"

```

- 生成VNode关系

```javascript

// 实际执行

with (this) {
  return _c('section', {
    staticClass: 'app'
  }, [
    _c('child', [
      _c('grand-son')
    ], 1)
  ], 1)
}

// 生成的vnode关系  也就是dom渲染关系

父VNode = {
  children: [VNode] //child VNode 在函数参数中执行，就是说子vnode生成早于父节点vnode
  children: [ // child展开
    {
      children: [VNode] // grandSon VNode
    }
  ]
}

// 需要注意的是 _c方法将包装VNode 调用vdom/create-component.js中的createComponent方法生成VNode
// 在父组件中如何获取子组件的额配置信息
// 分两种 一种是构造函数级别的扩展options.components，另一种是组件内部注册组件
// 通过context.options获取 tag即为组件id
// isDef(Ctor = resolveAsset(context.$options, 'components', tag))
if (typeof tag === 'string') {
  ...
  } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
    // component
    
    vnode = createComponent(Ctor, data, context, children, tag)
  } else {
    ...
// 此时还不知道child的具体渲染内容，不过已经在父组件中绑定了一个children: [child]
// 在子组件mount的时候会挂载子组件的实际内容

// 其中有个逻辑是 在组件VNode的data对象中挂载组件钩子 不是咱们用户常见的实例钩子
// 组件钩子包括 init, prepatch, insert, destroy

installComponentHooks(data)

VNode.data.init = ...
VNode.data.prepatch = ...
VNode.data.insert = ...
VNode.data.destroy = ...

```
- 父组件渲染触发子组件渲染

```javascript

const app = new Vue()

app.$mount('.app')

// 执行mount方法 => mountComponent   => vm._render()
// _render() 实质上就是生成VNode的方法
// 此时已经有了完整的VNode关系树
// => vm._update()

// _update逻辑中，将当前_update实例替换成全集激活实例
// 并且生成一个方法引用restoreActiveInstance，在当前update结束后将还原激活实例为之前的上层实例

const restoreActiveInstance = setActiveInstance(vm)

// 模拟激活实例切换 假设有三层父子关系 parentVM, childVM, grandSonVm

// 1. 执行第一层 
activeInstance = null
// update
activeInstance = parentVM

// 执行__patch__
// 创建parent节点挂载
createElm(
  vnode,
  insertedVnodeQueue,
  // extremely rare edge case: do not insert if old element is in a
  // leaving transition. Only happens when combining transition +
  // keep-alive + HOCs. (#4590)
  oldElm._leaveCb ? null : parentElm, // 给transition用的
  nodeOps.nextSibling(oldElm)
)
// 在createElm中检查children
createChildren(vnode, children, insertedVnodeQueue)

// children中检查每个child
for (let i = 0; i < children.length; ++i) {
  createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i)
}

// 检查createComponent child VNode将走这个分支

let i = vnode.data
// 检查组件钩子 很明显进这里
if (isDef(i)) {
  if (isDef(i = i.hook) && isDef(i = i.init)) {
    // 此时i = i.init 执行的是init钩子
    i(vnode, false /* hydrating */)
  }
  ...
}

// 接下来查看init做的事情
init (vnode: VNodeWithData, hydrating: boolean): ?boolean {
  // 很明显 此时并没有生成componentInstance实例  所以走createComponentInstanceForVnode
  if (
    vnode.componentInstance &&
    !vnode.componentInstance._isDestroyed &&
    vnode.data.keepAlive
  ) {
    // kept-alive components, treat as a patch
    const mountedNode: any = vnode // work around flow
    componentVNodeHooks.prepatch(mountedNode, mountedNode)
    
  } else {
    // 重点 activeInstance
    const child = vnode.componentInstance = createComponentInstanceForVnode(
      vnode,
      activeInstance
    )
    child.$mount(hydrating ? 
      vnode.elm : undefined, hydrating)
  }
},

// createComponentInstanceForVnode 这一轮中 activeInstance = parentVM
// 这边挂载options上的parent关系
const options: InternalComponentOptions = {
  _isComponent: true,
  _parentVnode: vnode,
  parent // parent = activeInstance = parentVM
}

// 子组件渲染开始
child.$mount(hydrating ? 
  vnode.elm : undefined, hydrating)

// 2. 在第二层内部

activeInstance = childVM

// 3. 第三层

activeInstance = grandSonVM

// 第三层执行完 
activeInstance = childVM
// 第二层执行完
activeInstance = parentVM
// 第一层执行完
activeInstance = null

// 这边详解一下dom挂载关联

// 1. 在根节点中，生成了一个dom节点 至于根节点怎么挂载的 请看第一个问题
createElm(
  vnode,
  insertedVnodeQueue,
  // extremely rare edge case: do not insert if old element is in a
  // leaving transition. Only happens when combining transition +
  // keep-alive + HOCs. (#4590)
  oldElm._leaveCb ? null : parentElm, // 给transition用的
  nodeOps.nextSibling(oldElm)
)

// elm储存dom节点
vnode.elm = vnode.ns
  ? nodeOps.createElementNS(vnode.ns, tag)
  : nodeOps.createElement(tag, vnode) // 完成第一轮根节点dom挂载

// createChildren 注意这个parentElm的传递 此时还是section.app
if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {}

// 子节点component执行mount，也会像根节点一样生成一个dom createElement(tag)
insert(parentElm=app, vnode.elm = child, ...) // 完成了dom关系的绑定

```

