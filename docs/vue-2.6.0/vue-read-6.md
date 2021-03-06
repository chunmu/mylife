> 这篇文章我们将讲mount相关的内容，app初始dom挂载通过 new Vue().mount()完成

### 1. _c = createElement

> 对gencode生成结果执行，生成对应的vnode树

```javascript
/**
* 1. createElement 参数整理
* 2. _createElement 
* 3. 检查data.__bo__，不能用含有监听标记的对象作为vnode的data，在render的时候提供一个全新对象使用，data是解析得到的数据 类似{staticClass: 'xxx'}
* 4. 处理用户自行调用createElement时候的逻辑
*   if (isDef(data) && isDef(data.is)) {
*      tag = data.is
*    }
*    在之前碰到的模板中直接<div :is="xx">这种形式会被如下处理，所以这边是
*    if ((binding = getBindingAttr(el, 'is'))) {
*      el.component = binding
*    }
*    果然 用jsx生成 获取用户如果用户提供的is值 
*        child: {
*          render () {
*            return this.$createElement('div', {is: false})
*          }
*        }
* 5. 如果用户提供的tag不合法 例如is给的值为假值，找不到tag，则返回一个empty VNode
* 6. 接下来是判断key的构成 理论上只支持数字或者字符串 如果有@binding动态绑定也行，但是求得的值也应该是原始值 字符串或者数字
* 7. 允许提供的children第一顺位为一个方法 且设置为scopedSlots的默认处理方法,也就是插槽的默认内容
* 8. 提供一个开关normalizeChildren，是否需要每次经过额外的children校验和处理逻辑，理论上提供的是正常的child node节点合集，但是可以切换开关，
*    处理各种骚操作 比如用户提供的children = ['xxx', _c(), ...]  'xxx'需要额外包装一层，得到一个text类型的vnode
*    举个例子  h = createElement(tag, data, children)  children可能出现的额情况如下
*    ['子节点1', _c(), _c()]  || ['子节点1', [_c(), _c()]]  || ['子节点1', '子节点2', [_c(), _c()]]
*    这类情况嵌套数组应该是为了照顾用户分类设置子节点，children中元素对应的都是h的子节点，二维数组是方便用户的一种表现形式
*    自己点元素类型可以是数字，字符串等 会包装秤vnode，但是要注意，子节点唯一对应的vnode是唯一的，如果使用两个外在形式相同的元素，也需要调用createElement来生成不同的vnode   
* 9. 开始对tag进行判断分类处理  如果tag是字符串
*    (1). 如果是普通浏览器保留标签或者是用户自留标签，直接生成对应vnode，
*    (2). 如果没有带有data并且可以在options链中找到对应components配置的对象，调用createComponent直接创建相关的组件节点VNode
*         createComponent相关信息可以查看  ### 2. createComponent
*    (3). 最后一种情境是未知的或者未定义的标签处理
* 10. 如果tag是一个对象，直接调用createComponent
* 11. 对createComponent处理返回的vnode进行判断处理 如果是数组 直接返回
*     如果是没有返回值 返回空vnode
* */


```

### 2. createComponent

```javascript

/**
* 1. const baseCtor = context.$options._base 获取构造器
* 2. 刚刚分析了Ctor有两种来源 第一个是components中获取组件配置对象，另一种是用户自定义的配置对象
* 3. 将配置对象Ctor经过 Vue也就是_base的extend方法进行包装处理 回顾一下extend的处理逻辑,合并祖先options，并且返回一个Vue类的扩展构造器Sub，所以每一个组件都要经过这么一个流程，实例多了就傻b了
*    最近有碰到的场景就是element-ui中树形组件数量巨大的性能问题，很大原因就是实例数量过多
*    是组件实例 并不是标签,需要维护一个完整的生命周期
* 4. 异步组件的处理,没有做特殊处理,创建一个空节点vnode，并且打上标记 asyncMeta = { data, context, children, tag } node.asyncFactory = factory
* 5. 关于异步组件  回顾一下使用方式
*    Vue.component('async-component', function () {}) 注意 传入的是一个function
*    在注册全局component的时候，可以发现type === 'component' && isPlainObject(definition),如果不是一个对象 并不会执行extend，所以还没有Vue挂载的相关api，当然也没有cid
*    isUndef(Ctor.cid)  如果没有 当成是一个异步组件，需要创建一个vnode用来占位
*    调用的是resolveAsyncComponent来处理 详情查看 #### 2.1 resolveAsyncComponent
*    
* */

```


#### 2.1. resolveAsyncComponent

```javascript

/**
* 1. 在定义异步组件的时候提供一个工厂方法factory
* 2. 我们讲的createComponent都是运行时方法，如果factory.error则判断组件信息获取失败，查看是否有errorComp失败占位组件
* 3. 查看是否resolved组件 就是工厂方法已经执行完且有结果resolved
* 4. 接下来就是异步组件还没有获取到的占位处理逻辑
*    (1). 找出当前render的父实例 该异步组件的拥有者之一
*    (2). factory的owners收集owner
*    (3). 如果有loading标记且有loading组件，渲染该过渡组件
*    (4). 如果是初始化，并没有渲染过，则配置owners，且记录sync=true标记
*    (5). ;(owner: any).$on('hook:destroyed', () => remove(owners, owner)),如果owner，则移除该异步组件的所属关系
* 5. 执行factory，对返回值res进行判断处理，如果是一个promise对象，分别执行resolve,reject执行链
*    如果res.component是一个promise，加上then处理，有个大家比较熟悉的就是vue router中 component: () => xxx这种方式，对应的就是它了
*    分别判断是否需要调动配置的错误占位组件或者loading组件
*    如果配置的delay === 0，loading生效，如果在delay后还没有resolve，调起loading组件使用，且通知所属父组件强制更新当前渲染状态，
*    在timeout的时间内，并没有resolved，调起reject
*    对应的resolve处理方法，赋值resolved，扩展成了Vue类
*    如果是异步，
*/


/**
* 6. 如果是异步 调用强制更新 会出现渲染loading组件 或者渲染目标组件
*    如果是同步，则执行完resolveAsyncComponent直接返回目标组件对象，取消所属关系
* */

if (!sync) {
  forceRender(true)
} else {
  owners.length = 0
}

/**
* 7. 超时时间的处理 用户自定义超时限制
* */

if (isDef(res.timeout)) {
  setTimeout(() => {
    if (isUndef(factory.resolved)) {
      reject(
        process.env.NODE_ENV !== 'production'
          ? `timeout (${res.timeout}ms)`
          : null
      )
    }
  }, res.timeout)
}

/**
* 8. 如果返回的位undefined 也就是异步组件 resolved还未定义，创建一个vnode占位
* */
if (Ctor === undefined) {
  // return a placeholder node for async component, which is rendered
  // as a comment node but preserves all the raw information for the node.
  // the information will be used for async server-rendering and hydration.
  return createAsyncPlaceholder(
    asyncFactory,
    data,
    context,
    children,
    tag
  )
}
```

#### 2.1. resolveAsyncComponent

```javascript
/**
* 9. 更新全局配置信息 可能会有调用Vue.mixin这种事件发生 注册了新的filter 组件等
* */
resolveConstructorOptions(Ctor)


/**
* 10. 后续再来看这段
* */

transformModel(Ctor.options, data)

/**
* 11. propsdata解析 后续回头看这段
* */

const propsData = extractPropsFromVNodeData(data, Ctor, tag)

/**
* 12. 函数式组件 回头看
* */

createFunctionalComponent(Ctor, propsData, data, context, children)



/**
* 13. 抽象组件 只保留slot
* */

const slot = data.slot
data = {}
if (slot) {
  data.slot = slot
}

/**
* 14. 安装组件钩子  不是实例生命周期钩子
* */

componentVNodeHooks = {init, prepatch, insert, destory}

/**
* 15. 创建组件占位vnode，vnode标签 `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`
* */

```

### 3 render流程

> 在new Vue().$mount()时候发生的事情

#### 3.1 $mount

```javascript

/**
* 1. new Vue().$mount调用的是覆盖定义的Vue.prototype.$mount = function外层处理方法
* */

// 核心mount挂载方法
const mount = Vue.prototype.$mount

// 挂载路口过渡方法
Vue.prototype.$mount = function (){}

/**
* 2. 校验 应用挂载目标不能是body或者html标签
* */
if (el === document.body || el === document.documentElement) {
  process.env.NODE_ENV !== 'production' && warn(
    `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
  )
  return this
}

/**
* 3. 如果没有render内容，则需要获取template并且调用编译模块进行解析
* 4. 处理完之后 调用核心mount处理逻辑 mountComponent
* */

```

#### 3.2 mountComponent

```javascript

/**
* 1. 如果没有render 构造一个空vnode占位 保证逻辑执行没问题,在非生产环境下将会得到非法格式报错，没有提供模板或者ast解析对象
* */

vm.$options.render = createEmptyVNode

/**
* 2. 调起组件实例生命周期钩子 beforeMount,在这个钩子执行的时候，主流程会继续往下走,并且不是马上就完成挂载 还有很多处理流程
* */

/**
* 3. 调起_update更新
* */

updateComponent = () => {
  vm._update(vm._render(), hydrating)
}


const prevEl = vm.$el  // 获取旧的el
const prevVnode = vm._vnode  // 获取旧的vnode
const restoreActiveInstance = setActiveInstance(vm)  // 设置当前激活实例 后面会用于挂载子组件实例

vm._vnode = vnode // 保存当前节点作为旧节点 再次_update时将会作为旧节点

/**
 * 4. __patch__调用该方法完成dom派发渲染  关于该方法请查看 ### 4. __patch__
*/

// 如果不存在旧节点 新建
vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)

// 更新
vm.$el = vm.__patch__(prevVnode, vnode)

/**
 * 5. 整理vm和el的关系
*/
if (prevEl) {
  prevEl.__vue__ = null  // 解除绑定 旧的vm将被回收
}
if (vm.$el) {
  vm.$el.__vue__ = vm    // 新的el与vm的绑定关系
}


```

### 4. __patch__

> __patch__ = createPatchFunction() 是一个函数执行后的返回值 且返回值也是一个函数

### 4.1 createPatchFunction中执行后返回的方法patch

```javascript

/**
 * 1. 装载各指令的钩子处理函数 eg:内置指令 v-model ['create', 'activate', 'update', 'remove', 'destroy'] 
*/

for (i = 0; i < hooks.length; ++i) {
  cbs[hooks[i]] = []
  for (j = 0; j < modules.length; ++j) {
    if (isDef(modules[j][hooks[i]])) {
      cbs[hooks[i]].push(modules[j][hooks[i]])
    }
  }
}

/**
 * 2. 如果现vnode未定义且oldVnode也未定义 直接中断patch,如果有vnode没有oldvnode，作为一个小会旧节点的逻辑操作
*/

if (isUndef(vnode)) {
  if (isDef(oldVnode)) invokeDestroyHook(oldVnode)
  return
}

/**
 * 3. 在又新节点vnode的前提下如果没有旧节点oldVnode 表示新建组件createElm
*/

// 已经使用的组件不能直接继续使用 克隆一份vnode数据
if (isDef(vnode.elm) && isDef(ownerArray)) {}

// patch方法内函数createComponent()
// 如果之前已经挂载有实例vm componentInstance，并且是keepAlive缓存组件
// 调起挂载的组件钩子  init
if (isDef(i = i.hook) && isDef(i = i.init)) {
  i(vnode, false /* hydrating */)
}

/**
 * 4. init钩子的调用
*/


if (
  vnode.componentInstance &&
  !vnode.componentInstance._isDestroyed &&
  vnode.data.keepAlive
) {
  // 如果已经有挂载实例 且未销毁状态 且缓存 当做是一次更新渲染
  const mountedNode: any = vnode
  // 直接调起组件钩子prepatch
  componentVNodeHooks.prepatch(mountedNode, mountedNode)
} else {
  const child = vnode.componentInstance = createComponentInstanceForVnode(
    vnode,
    activeInstance
  )
  child.$mount(hydrating ? vnode.elm : undefined, hydrating)
}
/**
 * 5. createComponentInstanceForVnode 为vnode创建实例
*/
// options中的_parentVnode指向关联vnode 并不是父级的意思 而是从vnode衍生出来的实例
const options: InternalComponentOptions = {
  _isComponent: true,
  _parentVnode: vnode,
  parent // parent是当前处理状态的vnode实例 这里就是完整渲染树衔接的关键部分
  /**
   * 假设我们是在渲染一个应用根节点 我们再调用mount的时候已经存在了一个实例vm 且在执行mount的试试 当前激活实例activeInstance赋值
   * 在渲染过程中找到一个节点的标签符合自定义组件名称限定 判断是一个用户自定义组件
   * 牛逼
   * 在子组件新建时查找当前激活实例activeInstance,绑定父子关系 就链接了两个渲染树的关系
  */
}

/**
 * 6. 我们看看prepatch做了啥
*/
// 获取options 组件配置 获取旧有实例 调起updateChildComponent #### 4.4 updateChildComponent
const options = vnode.componentOptions
const child = vnode.componentInstance = oldVnode.componentInstance
updateChildComponent()      #### 4.4 updateChildComponent


/**
 * 7. 如果有oldVnode 走更新流程
*/
patchVnode()

// 如果是vnode复用  需要复制一份vnode
if (isDef(vnode.elm) && isDef(ownerArray)) {
  // clone reused vnode
  vnode = ownerArray[index] = cloneVNode(vnode)
}

/**
 * 8. hydrate处理
*/
// 如果旧节点是异步处理节点 且如果该异步节点的resolved有值 调用hydrate处理
// 如果还未resolve，标记当前节点vnode.isAsyncPlaceholder = true 继续占位 不进行处理
// 可以看看这个函数执行的地方 
// 第一个是patchVnode   一般是比较两个新旧节点之间的更新行为
// patch方法中如果是服务端渲染处理流程
hydrate() // 看看这个函数做了什么

// 如果不是有效的节点类型 返回false
if (process.env.NODE_ENV !== 'production') {
  if (!assertNodeMatch(elm, vnode, inVPre)) {    // 是否为vue-component等
    return false
  }
}

if (isDef(data)) {
  // 执行钩子
  if (isDef(i = data.hook) && isDef(i = i.init)) i(vnode, true /* hydrating */)
  if (isDef(i = vnode.componentInstance)) {
    // child component. it should have hydrated its own tree.

    initComponent(vnode, insertedVnodeQueue)
    return true
  }
}
```

#### 4.2 invokeDestroyHook 组件销毁和失活流程

> 销毁组件需要关注两个事情 一个是实例上绑定的各种数据和监听器 一个是组件失活处理

```javascript

/**
 * 1. 如果vnode.data挂载了数据 一般是创建组件的时候会挂载组件钩子函数 ['insert', 'init', 'destory']等
*/

if (isDef(data)) {
  if (isDef(i = data.hook) && isDef(i = i.destroy)) i(vnode) // 先调用vnode钩子destory
  for (i = 0; i < cbs.destroy.length; ++i) cbs.destroy[i](vnode) // 再调用指令钩子destory
}

/**
 * 2. 组件钩子destory的内容
*/

destroy (vnode: MountedComponentVNode) {
  const { componentInstance } = vnode
  /**
   * 这边这个判断条件需要注意一下 个人想法如下
   * 在patch中不传第二个参数可以调起销毁流程 直接vm.$destory也可以调起销毁流程
   * 如果两个流程操作的部分有重叠  需要这个标识来做处理_isDestroyed,对性能是有帮助的
   * 同理inactive激活失活类似
   * */ 
  if (!componentInstance._isDestroyed) { // 如果示例未销毁状态 需要走销毁流程
    if (!vnode.data.keepAlive) { // 如果没有keepAlive缓存，则销毁实例
      componentInstance.$destroy()
    } else {
      // 如果是缓存实例 失活处理
      deactivateChildComponent(componentInstance, true /* direct */)
    }
  }
}

/**
 * 3. 我们看看实例销毁做了什么事情 $destroy
*/

// 判断是否正在销毁中
if (vm._isBeingDestroyed) {
  return
}

// 调用beforeDestroy
callHook(vm, 'beforeDestroy')

// 移除父子关联
if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
  remove(parent.$children, vm)
}

// 卸载监听器
if (vm._watcher) {
  vm._watcher.teardown()
}
let i = vm._watchers.length
while (i--) {
  vm._watchers[i].teardown()
}

/**
 * 这边这个判断条件需要注意一下 个人想法如下
 * 在patch中不传第二个参数可以调起销毁流程 直接vm.$destory也可以调起销毁流程
 * 如果两个流程操作的部分有重叠  需要这个标识来做处理_isDestroyed,对性能是有帮助的
 * 同理inactive激活失活类似
 * */ 
// 实例上的$destory方法再次发起销毁流程__patch__
// 重点 按照销毁逻辑来看 子级组件销毁在前 依次由内到外调用destory钩子
vm.__patch__(vm._vnode, null)

// 卸载所有事件监听相关 不带参数的卸载  清空em._events对象
vm.$off() 

/**
 * 3. 这里说一下事件销毁逻辑
*/
// 3.1 清空事件 一般是销毁组件的时候调用  vm._events清空
if (!arguments.length) {
  vm._events = Object.create(null)
  return vm
}
// 3.2 移除指定事件
// 只提供事件名称的处理 删除逻辑
const cbs = vm._events[event]
if (!cbs) {
  return vm
}
if (!fn) {
  vm._events[event] = null
  return vm
}
// 处理事件绑定是一个数组handler的情况 找出符合条件的方法移除
let cb
let i = cbs.length
while (i--) {
  cb = cbs[i]
  if (cb === fn || cb.fn === fn) {
    cbs.splice(i, 1)
    break
  }
}

```


#### 4.3 createComponent

```javascript

```

### 3. __patch__方法，分发视图更新

> patch = createPatchFunction执行后返回的函数

```javascript

/**
* 1. 策略集合strats，初始值optionMergeStrategies，也就是提供给用户自行定义合并策略的一个入口
* 2. strats.data
*  (1). 关于这里 data为什么必须是一个function  因为通过data方法执行获取到的对象是一个新的对象副本
*  (2). 如果data为一个对象 则可能出现多个vue实例共享这个data对象 则可能出现不可控的问题 不同实例修改数据会反映在这一个data对象
*  (3). 每个options本质上就是一个vue对象的配置信息，可单配置，多个实例
*  (4). 基本校验
* 3. in a Vue.extend merge, both should be functions这个注释的意思是，他们是实例的构造函数，提供的data必须是一个函数,如果是实例那以他们为构造函数new出来的对象就会共享一个data实例
* 4. 没有vm的情况下，也就是extend扩展的构造函数内合并options，mergeDataOrFn返回一个合并策略方法，
*    那么结果extend下的data策略就是返回一个函数，该函数调用data下的数据合并处理过程mergeData
*    strat['data'] = 
* 5. mergeData递归处理data下面字段的方法，先判断支不支持新语法，通过Reflect.ownKeys获取当前对象上的自有属性
*    const keys = hasSymbol   
*      ? Reflect.ownKeys(from)
*      : Object.keys(from)
* 6. 这边有个    if (key === '__ob__') continue判断条件，这是预防该层级对象已经处于被观测状态，被观测的对象会带有__ob__标记,如果没有且属于字面值变量，则设置
* 7. 如果目标对象中没有对应的to[key],则需要调用观测方法，不论是对象或者字面值，如果存在则判断是否为对象，如果是对象则递归处理，不过从源码来看，字面值是以to对象为准，要合并到的目标为准,
*    比如： comA的data() {
*      return {
*        username: 'comA',
*      }
*    }
*    mixins: [{
*      data () {
*        username: 'comMixin'
*      }
*    }]
*    最后username = comA，以它的为准，具体场景表现为如果从mixin中有data()优先级低于生成实例时配置的options
* 8. 生命周期钩子的合并策略
*    并不是覆盖，而是累加，可能两个同名钩子处理逻辑须共存
*    如果钩子存在，需要构造一个保存狗仔集合的新数组，备份，避免共享实例的问题
* 9. assets钩子,component，directive, filter等得合并策略，直接使用覆盖操作，目标对象优先级高
* 10. strats.watch的合并策略
*    (1). if (!childVal) return Object.create(parentVal || null),如果不存在目标对象，直接以parentVal为蓝本生成一份return
*    (2). 格式校验，watch必须是一个对象
*    (3). 把需要合并的对象和目标对象的watch每个属性都改造成数组，因为这种watch合并不是简单的覆盖，而可能是处理逻辑的叠加，可能需要并存，所以存在下面这种格式
*      watch = {
*        username: [{
*          handler1: () => {}
*        }, {
*          handler2: () => {}
*        }]
*      }
* 11. props, methods, inject, computed的合并策略相同，直接使用覆盖操作，目标对象优先级高
* 12. strats.provide策略同data策略类似
* 13. 如果不存在合并策略，则使用默认合并策略，也就是如果childVal存在，则用它，否则用parentVal
* 14. 合并策略部分结束
* */

```

### 1.4 updateListeners

```javascript

/**
* 1. 规范化事件名称，之前模板解析的修饰符这边处理，判断是否含有capture，passive，once等得修饰符标记
* 2. isUndef(cur)，当前需要绑定的事件对应的handler未定义，也就是 @click="xxx"  xxx未定义
* 3. 如果需要替换的事件不存在，也就是新增事件，创建一个Invoker
* export function createFnInvoker (fns: Function | Array<Function>, vm: ?Component): Function {
*    function invoker () {
*      const fns = invoker.fns
*      if (Array.isArray(fns)) {
*        // 如果是数组 遍历调用handler
*        const cloned = fns.slice()
*        for (let i = 0; i < cloned.length; i++) {
*          invokeWithErrorHandling(cloned[i], null, arguments, vm, `v-on handler`)
*        }
*      } else {
*        // return handler return value for single handlers
*        return invokeWithErrorHandling(fns, null, arguments, vm, `v-on handler`)
*      }
*    }
*    invoker.fns = fns   // 挂载的handler集合
*    return invoker      // invoker()执行之时就会处理方法内的内容
*  }
* 4. 判断是否为一次性事件,生成一个执行函数，执行后$off卸载监听
* function createOnceHandler (event, fn) {
*    const _target = target
*    return function onceHandler () {
*      const res = fn.apply(null, arguments)
*      if (res !== null) {
*        _target.$off(event, onceHandler)
*      }
*    }
*  }
* 5. 调用$on新增事件监听
* 6. 如果当前handler与旧的handler不等，修改invoker上需要执行的函数集合fns,invoker相关信息绑定到新的新的listener中on[name] = old
* 7. 如果事件名称在目标对象中不存在，在旧有事件集合中存在，则需要进行卸载操作，调用$off
* */

```

### 1.5 数据初始化内容 initProps

```javascript

/**
* 1. initProps, 初始化props数据，说明props的数据优先级在methods，data之上
* 2. 缓存key数组，后续访问props数据直接遍历key数组，不用动态访问props对象的键，后续有用到这边这个伏笔
* 3. 校验props数据的合法性,也就是关于数据的type校验，default的获取等
*     props: {
*       showSubmit: {
*         type: Boolean,
*         default: true
*       }
*     }
* 4. isReservedAttribute进行关键字检查,比如slot，key，ref等，不能以这些作为props传入子组件
* 5. 设置props元素的set方法，拦截用户在子组件中对props的修改并告警
* 6. defineReactive设置props的观测系统，如果父组件中有修改props中的值，会执行相关update
* 7. 只有是根节点或者isUpdatingChildComponent中才能修改props中的值 这边需要补充具体场景
* 8. proxy(vm, `_props`, key),设置代理,访问props中的元素其实访问的都是vm._props中的数据
* */

```

### 1.6 数据初始化内容 initMethods初始化方法

```javascript

/**
* 1. initMethods, 初始化methods数据，优先级在data之上
* 2. 判断类型，只能是func
* 3. 查看是否对应的key是否已经在vm中绑定
* 4. 查看是否为保留方法名 比如生命周期钩子，不能冲突使用
* 5. bind(methods[key], vm)，这就是为什么methods中能访问到vm实例的原因了  this.xxx = function () {console.log(this)} this是vm实例
* */

```

### 1.7 数据初始化内容 initData， initWatcher, initComputed初始化方法

> 这边就涉及到了响应式管理了，内容留着，放在下一篇讲

```javascript

/**
* 1. 优先级: data > computed > watch 
* */

```
### 1.8 总结

主要是一些数据处理，还有就是两个生命周期钩子的调用 beforecreate，created，他们可以定义为async方法，不过并不会阻塞后续的主流程执行，建议大家照着源码来看我的学习记录，谢谢大家，流程图明天补上，今天先到者了，大家冬至快乐

<br>
<br>
如果可以，请喝杯咖啡，ヾ(≧▽≦*)o

![](https://user-gold-cdn.xitu.io/2019/12/13/16efafe4704796ea?w=287&h=288&f=jpeg&s=41747)