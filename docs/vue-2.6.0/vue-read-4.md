## 1. new Vue

> 在第一篇我们讲的是import vue的过程，这篇我们讲new Vue的处理过程，在系列文章中，vm表示vue实例，Vue表示构造函数，vue表示这个库本身

### 1.1 _init方法

> 这边会扯到一波原型链相关知识，请看这里[掘金上原型链的一篇文章](https://juejin.im/post/5cc99fdfe51d453b440236c3)

```javascript

function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

// new Vue()之后，执行_init(options)
// 此时的options是一个vue配置对象的基本配置  {mixins: [], data: {}, methods: {}}等

// 开始执行_init
vm._uid = uid++       // 实例计数器，每次新建一个实例自增1

// 如果是非生产环境，埋点测试性能
startTag = `vue-perf-start:${vm._uid}`
endTag = `vue-perf-end:${vm._uid}`
mark(startTag)

// 标记 vue实例flag
vm._isVue = true

// 开始options合并

/**
* initInternalComponent
* 1. 组件里面options的表现形式为$options，继承自构造函数的options
* 2. 设置parent，_parentVnode，propsData, _parentListeners,_renderChildren,_componentTag,render,staticRenderFns等
* */

/**
* resolveConstructorOptions
* 1. 不是内部组件的时候走这里
* 2. 如果Ctor.super不存在，那就是这种情况，直接new Vue(options)
* 3. 这样的话，就用不着合并options，除了vue内置的一些options配置，还有实例化时传的options，直接调用mergeOptions合并就行
* 4. 还有一种就是调用了Vue.extend方法生成新的类似Vue实例，为什么是类似，看下面一段extend方法中的源码
* 5. Sub = 一个VueComponent构造函数，从Super中复制一份Super中的prototype，合并初始options，顶级Super = Vue
*     const Sub = function VueComponent (options) {
*        this._init(options)
*      }
*      Sub.prototype = Object.create(Super.prototype)
*      Sub.prototype.constructor = Sub
*      Sub.cid = cid++
*      Sub.options = mergeOptions(
*        Super.options,
*        extendOptions
*      )
*    Sub.superOptions = Super.options
*    Sub.extendOptions = extendOptions
*    Sub.sealedOptions = extend({}, Sub.options)
* 6. resolveConstructorOptions(vm.constructor)，vm.constructor，也就是访问prototype上的constructor属性，指向Vue，或者类似Vue
* 7. 这个时候options有啥
*    options: {
*      components: {
*        KeepAlive,
*        Transition,
*        TransitionGroup
*      },
*      directives: {
*        model,
*        show
*      }
*    }
* 8. 如果有super属性，是通过extend创建的实例，   
*    extend = function () {
*      Sub['super'] = Super = this  // 在Vue.extend的时候，this指向Vue本身
*    }
*    假设  let Son = Vue.extend(sonOptions)，let Child = Son.extend(childOptions)，let vm = new Child()
*    那么在处理resolveConstructorOptions时，vm.constructor = Child，继承childOptions，
*    Child.Super = Son，继承sonOptions，Son.Super指向Vue，继承Vue初始化的options，当然不是简单的继承，这边就涉及到了options的合并策略问题
* 9. 在extend中有这么一段  Sub.superOptions = Super.options，然后superOptions !== cachedSuperOptions判断条件就是在判断Sub.superOptions !== Super.options的可能性，
*    上面那个例子继续使用
*    (1). 按照递归顺序，应该是Son.superOptions === Vue.options
*       [1]. true，而且在Vue.extend中已经合并过一次options到Son的options中了，所以继续比较Child.superOptions === Son.options
*       [2]. 直接返回Son的mergeOptions(Son.options, options)
*    (2)，如果不相等就重新合并过一次
*    (3). 这里比较绕，主要是constructor的指向还有就是逻辑，总结就是在extend中已经把来源构造函数上的options已经合并到目标构造函数上了，后面就是比较来源构造函数的options有没有变，没有就不用合并了，用目标上的就行
*         有变就再次摘出来合并一次
* 10. 如果Vue构造函数的options改变了，则Son的superOtions = Vue.options，然后重新合成一份Son.options，就得Son.options不要了，
*     找出一份修改的options集合，合并到extendOptions，再合并到superOptions，排一下优先级
*     任何情况下子级比父级优先，但是如果父级修改了options，会及时更新子级的superOptions
*     这边通过extend的参数前后顺序来判断优先级，反正挺绕的，实际用的时候碰上可以到时候输出看效果就行，懂大概合并的options逻辑就行
* 11. mergeOptions相关请查阅    ### 1.2 mergeOptions
* 12. initProxy(vm)访问代理设置，在vm中拦截以下行为并发出警告
*     (1). 是否为允许访问的全局变量
*     (2). 在data，methods等中没有定义的属性访问报错
*     (3). 保留字段，保留修饰符等得篡改告警等
*     (4). 一般对象通过拦截get，set API，with语句块内的访问拦截has API
* 13. 标记_self指向实例自身
* 14. initLifecycle初始化生命周期钩子
*     (1). parent指向检查，一般是指向上一级，不过如果父级是一个abstract类型实例，则继续修改parent指向更上层非abstract实例，abstract实例只类似这种组件  <transition-group>等
*     (2). vm.$root = parent ? parent.$root : vm递归查找root节点
*     (3). 初始化相关变量
*        vm.$children = []
*        vm.$refs = {}
*        vm._watcher = null
*        vm._inactive = null
*        vm._directInactive = false
*        vm._isMounted = false
*        vm._isDestroyed = false
*        vm._isBeingDestroyed = false
* 15. initEvents，父级中获取在子级上绑定的事件处理
*     (1). 调用updateComponentListeners，然后调用updateListeners，在调用该方法前后 全局变量target指向本实例vm，处理完之后置为undefined
*     (2). add方法调用实例上的$on方法，在实例的_events上挂载event对象，包括事件名称和事件事件handler
*     (3). 如果包含有钩子事件，打上_hasHookEvent标记
*     (4). remove方法调用实力上的$off方法,如果没传参表示清空所有事件，返回空的_events对象，如果传入的是数组，递归处理，如果时间不存在指定的删除时间，直接return，如果传入了fn handler，找出对应方法并且在_events对应时间名称下的数组中移除该方法，事件卸载
*     (5). 细讲 updateListeners  请查看 ### 1.4 updateListeners
* 16. initRender，渲染相关初始化
*     (1). 
*        vm._vnode = null // the root of the child tree
*        vm._staticTrees = null // v-once cached trees
*        const options = vm.$options
*        const parentVnode = vm.$vnode = options._parentVnode // the placeholder node in parent tree
*        const renderContext = parentVnode && parentVnode.context
*        vm.$slots = resolveSlots(options._renderChildren, renderContext)  // 将在codegen中讲解,源码阅读系列第三篇
*        vm.$scopedSlots = emptyObject
*     (2). 绑定VNode创建方法，   
*       vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
*       vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)
*     (3). 这边需要解析响应式原理，后续会讲到  
* 17. callHook => 调用第一个生命周期钩子beforeCreate， 此时
*     (1). 可以访问到实例vm，并没有渲染dom
*     (2). 已经经过了数据合并，所以可以访问到data，methods，props等数据
* 18. initInjections
*     (1). 之前我们分析的inject格式处理，form值代表的就是在父级provide中的具体key
*     (2). 从inject中获取form值，在父级中递归查号_provided中对应的key，返回查找结果，并且在当前实例vm中定义相应属性或方法
*     (3). 假设  inject: [{from: 'foo'}] provide: {foo: function xx() {}},则会在vm中定义vm.foo = xx
*     (4). 如果不存在source，也就是没找到provide来源父级实例，则使用默认方法，如果不存在默认方法，报错提醒warn(`Injection "${key}" not found`, vm)
*     (5). 发现它源码只是查找parent不存在才表示父级没有对应的注入信息，这边有个疑问，如果inject中的from的可以，在父级的provide中不存在的处理逻辑，后面看到的时候补上
* 19. initState 这边是一大块内容，请查看 ### 1.5 数据初始化内容 
* 
* 20. initProvide  直接调用provide方法生成相关信息
* 21. callHook  => 调用created生命周期钩子，此时
*     (1). 已经完成了所有的数据项准备，已经可以访问到所有数据项
*     (2). 可以访问实例
*     (3). 还未进行dom挂载
*     (4). 已经完成了data，props，computed，watch等初始化
* 22. 校验组件名formatComponentName用于获取性能监听标记
* 23. 如果存在el属性，执行挂载,挂载内容请查看 第五篇源码阅读
*/      
// 上面有个mergeOptions没有提及，单独解析这块，查看 ### 1.2 mergeOptions
```


### 1.2 mergeOptions

```javascript

/**
* 1. 检查components注册的字段合法性检测，不能是保留标签，内建组件名称等，比较通用的写法如下
*     props: {
*       username: {
*         type: String,
*         default: 'pdd'
*       }
*     }
* 2. 格式化props，如果是数组，成员只能是String，props: ['username', '...']，会被包装成
*    props: {
*      username: {
*        type: null
*      }
*    }
* 3. 还有一种非正常格式需要处理
*    props: {
*      username: String   
*    }
*    包装成  =>
*    props: {
*      username: {
*        type: String
*      }
*    }
* 4. inject的集中写法，inject: ['foo'], inject: {foo: 'bar'}, inject: {foo: {from: 'bar', default: 'foo'}},default也可以是函数
*    他们的解析结果
*    (1). inject: {foo: {from: 'foo'}}
*    (2). inject: {foo: {from: 'bar'}}
*    (3). inject: {foo: {from: 'bar', default: 'foo'}}
* 5. 格式化指令，一般有两种  dir = {bind: func, update: func}，dir = func转为前面这种格式，bind和update都是func
* 6. 关于extends和mixins的区别 在使用上
*    (1). extends: {options}   mixins: [mixin1, mixin2, ...]
*    (2). 前者基于单个扩展 后者可以同时多个扩展
*    (3). 多个mixin不是覆盖而是
*    (4). extends执行顺序早于mixin，在mixin之前执行
* 7. if (!child._base) 如果options中不存在_base，也就是普通options对象，只有一些基本属性没有实力相关的东西，类似options = {created() {}, data () {}}这些
*    也就是extends和mixins这种扩展适用于组件扩展，全局请用Vue.mixin()这种方式
* 8. 开始按照对应策略合并 请查看 ### 1.3 各种合并策略
* 9. 合并的结果是返回一个全新的对象options
* */

```

### 1.3 各种合并策略

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