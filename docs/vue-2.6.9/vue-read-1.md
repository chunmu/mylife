
> 本篇文章对应的vue源码为2.6.0-release版本，适合对vue相对比较熟悉的读者，阅读愉快。

## 1. vue工程结构

> 这个部分有很多只是挂载一个api的操作，我们不会详细讲它每个api的工作内容，但是会提及它的大概作用

### 1.1 图片展示完整工程目录

> 这边有本人在操作时产生的个人文件，请大家忽略

![](https://user-gold-cdn.xitu.io/2019/11/25/16ea0b6d800735b1?w=1102&h=463&f=png&s=79896)

### 1.2 这边是我们比较关注的文件目录


    |-- vue2.6.0-release
        |-- flow                      // 关于flow文件目录 可怜它烂尾了
        |-- scripts                   // 关于构建脚本文件目录
        |-- src
            |-- compiler
            |-- core
            |-- platforms
            |-- server
            |-- sfc
            |-- shared
        |-- test
        |-- types

### 1.3 scripts目录

> 主要是rollup打包构建的配置

#### 1.4 build文件

> rollup打包脚本

#### 1.5 config文件

> 各种类型输出文件的配置文件，关于[UMD, CommonJS, AMD](https://segmentfault.com/a/1190000012419990)可以查阅这篇文章

```javascript

const builds = {
  // Runtime+compiler CommonJS build (CommonJS)
  // 这是我这次学习的类型  cjs  nodejs环境
  'web-full-cjs-dev': {
    entry: resolve('web/entry-runtime-with-compiler.js'), // 对应的入口文件
    dest: resolve('dist/vue.common.dev.js'),
    format: 'cjs',
    env: 'development',
    alias: { he: './entity-decoder' },
    banner
  },
  'web-full-cjs-prod': {
    entry: resolve('web/entry-runtime-with-compiler.js'), // 对应的入口文件
    dest: resolve('dist/vue.common.prod.js'),
    format: 'cjs',
    env: 'production',
    alias: { he: './entity-decoder' },
    banner
  }
}


```

### 1.6 flow目录

> 想了解的人可以点击这里[静态类型检测器](https://zhenyong.github.io/flowtype/)，烂尾了，个人认为稍微熟悉flow就行，对后续的vue源码学习并没有很大影响 

### 1.7 src目录

> 代码核心目录  后续将进行详细了解

### 1.8 test

> 测试代码目录，相当好用



## 2 一切开始的地方 Vue构造函数的定义位置

在使用vue的时候  会有下面这些用法

```
Vue.mixins({})

new Vue({
    created () {
        // this
    }
})

```

所以肯定有这么一个地方  定义 Vue () {}，我们可以从config中的入口文件开始寻找Vue
```
=> scripts/config web/entry-runtime-with-compiler      // 打包入口web/entry-runtime-with-compiler
=> src/platforms/web/entry-runtime-with-compiler.js    // import Vue from './runtime/index'
=> src/platforms/web/runtime/index.js                  // import Vue from 'core/index'
=> src/core/index                                      // import Vue from './instance/index'
=> src/core/instance/index                             // 在这里 function Vue
```

### 2.1 详解Vue定义

```
function Vue (options) {
  // 在测试或者开发环境检测实例是否是通过new Vue的形式生成的 否则告警 因为后续的所有操作都是围绕vue实例进行
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options) // 实例执行方法  我们后续会学习到
}

```

## 3. Vue全局API包装历程

> 接下来是vue的全局API包装 有部分内容是进行api挂载，我们可能只进行结果描述而不进行实际分析 具体使用会在后续阐明  分为实例和构造函数API挂载 区别请查看[一张图理解JS的原型（prototype、_proto_、constructor的三角关系）](https://juejin.im/post/5b729c24f265da280f3ad010)

### 3.1 initMixin

```
// 初始化方法挂载
Vue.prototype._init = function () {}
```

### 3.2 stateMixin

> data, props数据代理设置

```
  /**
   * 数据劫持 这也是Vue实现原理核心 这边用于数据代理
   * 所有Vue实例中形如this.xxx访问data都是在访问this._data.xxx
   * 所有Vue实例中形如this.xxx访问props都是在访问this._props.xxx
   * 劫持data set 对更改this.data指向进行更改的操作进行告警
   * 劫持props set 提示该对象只读 
   * */
  const dataDef = {}
  dataDef.get = function () { return this._data } 
  const propsDef = {}
  propsDef.get = function () { return this._props }
  if (process.env.NODE_ENV !== 'production') {
    dataDef.set = function () {
      warn(
        'Avoid replacing instance root $data. ' +
        'Use nested data properties instead.',
        this
      )
    }
    propsDef.set = function () {
      warn(`$props is readonly.`, this)
    }
  }
  Object.defineProperty(Vue.prototype, '$data', dataDef)
  Object.defineProperty(Vue.prototype, '$props', propsDef)
```
```
  // observer中的set，delete方法
  Vue.prototype.$set = set                  // 设置观测对象
  Vue.prototype.$delete = del               // 观测对象的删除
  Vue.prototype.$watch = function () {}     // 实例上的$watch
```

### 3.3 eventsMixin

```
  Vue.prototype.$on = function () {}      // 添加监听器
  Vue.prototype.$once = function () {}    // 添加一次性监听器
  Vue.prototype.$off = function () {}     // 卸载监听器
  Vue.prototype.$emit = function () {}    // 发射事件
```

### 3.4 lifecycleMixin

```
  Vue.prototype._update = function () {}         // 视图更新 注重点在于视图组件更新
  Vue.prototype.$forceUpdate = function () {}    // 强制更新 注重点在于强制触发observer相应更新
  Vue.prototype.$destroy = function () {}        // 销毁当前实例
```

### 3.5 renderMixin

> 渲染相关的处理和API挂载

```
  Vue.prototype.$nextTick = function () {}         // 视图更新 注重点在于视图组件更新
  Vue.prototype._render = function () {}           // 强制更新 注重点在于强制触发observer相应更新
```

#### 3.5.1 installRenderHelpers

```
// 后续将逐一补充其作用 都是挂载操作 没有执行
export function installRenderHelpers (target: any) {
  target._o = markOnce                  // 标记once指令相关属性
  target._n = toNumber
  target._s = toString
  target._l = renderList                // 渲染for循环
  target._t = renderSlot
  target._q = looseEqual
  target._i = looseIndexOf
  target._m = renderStatic              // 渲染静态内容
  target._f = resolveFilter
  target._k = checkKeyCodes
  target._b = bindObjectProps           // 动态属性绑定
  target._v = createTextVNode           // 创建Text VNode节点
  target._e = createEmptyVNode          // 创建empty VNode节点
  target._u = resolveScopedSlots
  target._g = bindObjectListeners
  target._d = bindDynamicKeys           //  <div :[username]="className"></div>，设置动态key的方法
  target._p = prependModifier
}

```

### 3.6 initGlobalAPI

> 可以注意到前面都是配置Vue.prototype实例方法  接下来是构造函数API挂载

#### 3.6.1 代理config

```
  /**
   * 劫持config配置的set方法 只读对象 不应该直接修改Vue.config  而是在传入参数中按需配置字段
   * */
  const configDef = {}
  configDef.get = () => config
  if (process.env.NODE_ENV !== 'production') {
    configDef.set = () => {
      
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  Object.defineProperty(Vue, 'config', configDef)
```

#### 3.6.2 全局配置config解析
```
// 关于config全局配置字段解析 有遗漏的后续逐渐补上
export default ({
  optionMergeStrategies: Object.create(null),             // 各种合并策略的配置 最好不要去改动它 除非对它的机制非常熟悉
                                                          // Object.create(null) 这样创建的对象相对而言更纯净
  silent: false,                                          // 是否保持静默 禁止console.warn输出
  productionTip: process.env.NODE_ENV !== 'production',   // 控制开发模式的一个提醒
  devtools: process.env.NODE_ENV !== 'production',        // devtools工具开关
  performance: false,                                     // 是否输出记录性能数据 比如vue的渲染耗时 编译耗时记录
  errorHandler: null,                                     // 可以自定义错误处理方法 比如收集vue error上报等
  warnHandler: null,                                      // 可以自定义warn处理方法 比如收集vue warn上报等
  ignoredElements: [],                                    // 可忽略编译的自定义标签
  keyCodes: Object.create(null),                          // 键值合集
  isReservedTag: no,                                      // 某标签是否保留标签 放到全局不知道是啥作用
  isReservedAttr: no,                                     // 某属性是否保留属性 放到全局不知道是啥作用
  isUnknownElement: no,                                   // 未知元素
  getTagNamespace: noop,                                  // 获取标签命名空间
  parsePlatformTagName: identity,
  mustUseProp: no,                                        // 是否必须传入的prop  比如selct标签必须接收value属性当做prop
  async: true,
  _lifecycleHooks: LIFECYCLE_HOOKS                        // 生命周期钩子 beforeCreate, created, beforeMount, mounted, beforeUpdate, updated, beforeDestory, destroyed, activated, deactivated, errorCaptured, serverPrefetch
}: Config)

```

#### 3.6.3 Vue.util

```
  Vue.util = {
    warn,                    // 有一段格式化vue实例调用栈的处理 后续补充详情
    extend,                  // 工具文件中自定义了extend方法 for...in循环取值设值 可遍历原型链上扩展属性 assign不会
    mergeOptions,            // options合并策略 new Vue(options)
    defineReactive           // observer工具方法
  }
```

```
  Vue.prototype.set = function () {}                // set
  Vue.prototype.delete = function () {}             // delete
  Vue.prototype.nextTick = function () {}           // nextTick
  Vue.prototype.observable = function () {}         // observable
```

#### 3.6.4 Vue.options初始化

> 初始化构造函数上options 将作为所有后续options的祖先级对象

```
  /**
   * Vue.options = {
   *   components: {},
   *   directives: {},
   *   filters: {}
   * }
   * */
  Vue.options = Object.create(null)
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })
  
  Vue.options._base = Vue                               // _base => Vue
  
  extend(Vue.options.components, builtInComponents)     // 全局内置组件keep-alive
```

#### 3.6.5 initUse Vue.use

Vue.use的实现部分，提供一个操作Vue全局或者实例相关逻辑或者api的聚合，规范化插件安装，要是每个库都来一遍import Vue => Vue.use 人都傻了

- use定义部分

> use方法返回值是Vue 所以可以链式安装插件 Vue.use(plugin1).use(plugin2)

```javascript
  Vue.use = function (plugin: Function | Object) {
    // 判断同一插件是否重复注册
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // additional parameters
    const args = toArray(arguments, 1)
    // 传入install的起始位置参数为 this = Vue
    args.unshift(this)
    // 优先尝试通过install安装插件 可以认为是Vue推荐的插件安装标准格式
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args)
    }
    installedPlugins.push(plugin)
    return this
  }
```

- 官方文档复制一遍，说得很清楚，它的功能范围

```javascript

MyPlugin.install = function (Vue, options) {
  // 1. 添加全局方法或属性
  Vue.myGlobalMethod = function () {
    // 逻辑...
  }

  // 2. 添加全局资源
  Vue.directive('my-directive', {
    bind (el, binding, vnode, oldVnode) {
      // 逻辑...
    }
    ...
  })

  // 3. 注入组件选项
  Vue.mixin({
    created: function () {
      // 逻辑...
    }
    ...
  })

  // 4. 添加实例方法
  Vue.prototype.$myMethod = function (methodOptions) {
    // 逻辑...
  }
}

```

#### 3.6.6 initMixin Vue.mixin

- Vue.mixin定义

本质是直接调用mergeOptions来进行mixins选项合并，这边就牵扯到了我们要关注的一个重点，options的合并策略，里面内容比较多，我们放后面用实际代码来解析

```javascript
  Vue.mixin = function (mixin: Object) {
    this.options = mergeOptions(this.options, mixin)
    return this
  }

```

#### 3.6.7 initExtend

```javascript

Vue.extend = function () {}              // 组件扩展核心方法 后续用实际代码来解析

```

#### 3.6.8 initAssetRegisters

> 这边就是Vue.component， Vue.directive，Vue.filter全局API的定义了

三段注册逻辑混合在一起 增加了不必要的type判断，不过又要与ASSET_TYPES保持一致，暂时没想到更好的解决方式 不过这个开销不大 不会有性能问题

```javascript

  ASSET_TYPES.forEach(type => {
    Vue[type] = function (
      id: string,
      definition: Function | Object
    ): Function | Object | void {
      if (!definition) {
        // 如果注册的内容存在 返回对应id  注册之后是存储在对应的位置 Vue.options中的{components: {}, filters: {}, directives: {}}集合中
        /**
        * Vue.component('my-component')  
        *   => 
        * Vue.options = {
        *   ...,
        *   components: {
        *     'my-component': MyComponent
        *   }
        * }
        * */
        return this.options[type + 's'][id]
      } else {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production' && type === 'component') {
          // 校验组件名称的合法性
          validateComponentName(id)
        }
        if (type === 'component' && isPlainObject(definition)) {
          // 优先使用component对象内部定义的name属性来命名组件 没有则使用注册时使用的id来命名 也可看成是组件使用时候的标签名
          definition.name = definition.name || id
          // 这边就是用到了extend，后续我们会讲到这个
          definition = this.options._base.extend(definition)             
        }
        // 如果是指令且指令的配置为一个方法  则默认该指令的绑定和更新都是调用这个方法
        if (type === 'directive' && typeof definition === 'function') {
          definition = { bind: definition, update: definition }
        }
        this.options[type + 's'][id] = definition
        return definition
      }
    }
  })

```

#### 3.6.9 validateComponentName  组件名称合法性校验

```javascript
  // 普遍支持unicode字符 包括中文  数学符号 emoji等 不过最好不要这么玩
  if (!new RegExp(`^[a-zA-Z][\\-\\.0-9_${unicodeRegExp.source}]*$`).test(name)) {
    warn(
      'Invalid component name: "' + name + '". Component names ' +
      'should conform to valid custom element name in html5 specification.'
    )
  }
  // 是否保留字 保留标签 或者内建组件  slot  components  这些不能用 keep-alive等也不能用（内置组件）
  if (isBuiltInTag(name) || config.isReservedTag(name)) {
    warn(
      'Do not use built-in or reserved HTML elements as component ' +
      'id: ' + name
    )
  }

```

### 3.7 ssr服务端渲染想相关

> 暂时不关注这个

```javascript

Object.defineProperty(Vue.prototype, '$isServer', {
  get: isServerRendering
})

Object.defineProperty(Vue.prototype, '$ssrContext', {
  get () {
    /* istanbul ignore next */
    return this.$vnode && this.$vnode.ssrContext
  }
})

// expose FunctionalRenderContext for ssr runtime helper installation
Object.defineProperty(Vue, 'FunctionalRenderContext', {
  value: FunctionalRenderContext
})

```

### 3.8 Vue的版本植入

```javascript

Vue.version = '__VERSION__'    // 获取的是主项目package.json的版本号

// 回头找找srcipts/config文件中的代码块  rullup变量设置  会在打包的工程中替换对应字串
// built-in vars
const vars = {
  __WEEX__: !!opts.weex,
  __WEEX_VERSION__: weexVersion,
  __VERSION__: version
}

```

### 3.9 平台相关utils挂载和预置平台相关的内置组件和平台相关的__patch__方法

```javascript

// install platform specific utils
Vue.config.mustUseProp = mustUseProp                            // 判断是否必须强制通过props引入
Vue.config.isReservedTag = isReservedTag                        // 判断是否保留标签
Vue.config.isReservedAttr = isReservedAttr                      // 判断是否保留属性
Vue.config.getTagNamespace = getTagNamespace                    // 获取命名空间
Vue.config.isUnknownElement = isUnknownElement                  // 无法识别的组件名称


// install platform runtime directives & components
extend(Vue.options.directives, platformDirectives)              // v-model&v-show
extend(Vue.options.components, platformComponents)              // Transition&TransitionGroup

// install platform patch function
Vue.prototype.__patch__ = inBrowser ? patch : noop              // 分发渲染通信的核心

```

### 3.10 mount方法 挂载api 核心方法 

```javascript

// public mount method
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating)
}

```

### 3.11 关于开发相关的温馨提示和devtools的初始化

```javascript

// devtools global hook
/* istanbul ignore next */
if (inBrowser) {
  setTimeout(() => {
    if (config.devtools) {
      if (devtools) {
        devtools.emit('init', Vue)                        // devtools使用
      } else if (
        process.env.NODE_ENV !== 'production' &&
        process.env.NODE_ENV !== 'test'
      ) {
        console[console.info ? 'info' : 'log'](
          'Download the Vue Devtools extension for a better development experience:\n' +
          'https://github.com/vuejs/vue-devtools'
        )
      }
    }
    if (process.env.NODE_ENV !== 'production' &&
      process.env.NODE_ENV !== 'test' &&
      config.productionTip !== false &&                    // new Vue({config})的config中productionTip变量的使用位置
      typeof console !== 'undefined'
    ) {
      console[console.info ? 'info' : 'log'](
        `You are running Vue in development mode.\n` +
        `Make sure to turn on production mode when deploying for production.\n` +
        `See more tips at https://vuejs.org/guide/deployment.html`
      )
    }
  }, 0)
}

```

## 结语

上述就是Vue引入后做的一些初始化过程，经过这么一个流程之后，该有的全局API，实例api有了一个雏形，
上面过程中有执行过程的我都有进行解析，还有一些简单的方法定义也做了解析，不过核心和重点依旧没有涉及，
在下一期中我们将了解Vue的模板解析过程

<br>
<br>
如果可以，请喝杯咖啡，ヾ(≧▽≦*)o

![](https://user-gold-cdn.xitu.io/2019/12/13/16efafe4704796ea?w=287&h=288&f=jpeg&s=41747)