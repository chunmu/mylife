# 附录

## 1. repeat字符串倍数拼接方法

```javascript

  // repeat工具方法的实现
  // 假设n = 1
  // 1 % 2 === 1
  // res += str

  // 假设n === 3
  // 3 % 2 === 1
  // str复刻
  // 左移运算 后续str都是翻倍长度之后的计算  n左移之后的值 都是2的某个倍数
  const repeat = (str, n) => {
    let res = ''
    while (n) {
      if (n % 2 === 1) res += str
      if (n > 1) str += str
      n >>= 1
    }
    return res
  }

```

## 2. util.extend工具扩展方法


```javascript

/**
 * Mix properties into target object.
 */
// 并没有用assign  从from取 放置到to
export function extend (to: Object, _from: ?Object): Object {
  for (const key in _from) {
    to[key] = _from[key]
  }
  return to
}

```

## 3. normalizeProps规范化prop

> 允许的各种定义props接收方式全部格式化处理成xxx: {type: ..., default: ...}

```javascript

/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 */
function normalizeProps (options: Object, vm: ?Component) {
  const props = options.props
  if (!props) return
  const res = {}
  let i, val, name
  // props: ['xxxx', 'yyy']
  // 最终都会组装成 xxxx: { type: null, default: ''}
  if (Array.isArray(props)) {
    i = props.length
    while (i--) {
      val = props[i]
      if (typeof val === 'string') {
        name = camelize(val)
        res[name] = { type: null }
      } else if (process.env.NODE_ENV !== 'production') {
        warn('props must be strings when using array syntax.')
      }
    }
  // 如果是对象类型 遍历处理
  } else if (isPlainObject(props)) {
    for (const key in props) {
      val = props[key]
      name = camelize(key)
      res[name] = isPlainObject(val)
        ? val // xxx: { type: String, ...}
        : { type: val } // xxx: String  => {type: String}
    }
  } else if (process.env.NODE_ENV !== 'production') {
    warn(
      `Invalid value for option "props": expected an Array or an Object, ` +
      `but got ${toRawType(props)}.`,
      vm
    )
  }
  options.props = res
}

```


## 4. normalizeInject注入接收格式化

```javascript

/**
 * Normalize all injections into Object-based format
 */
function normalizeInject (options: Object, vm: ?Component) {
  const inject = options.inject
  if (!inject) return
  const normalized = options.inject = {}
  // 重写了inject
  // 可以是inject = ['', '']
  // 可以是inject = {xxx: {from: 'xxx'}}
  // 可以是inject = {xx: 'xxx'}
  // 最终都是组装成  xx = {from: 'xxx'}
  if (Array.isArray(inject)) {
    for (let i = 0; i < inject.length; i++) {
      normalized[inject[i]] = { from: inject[i] }
    }
  } else if (isPlainObject(inject)) {
    for (const key in inject) {
      const val = inject[key]
      normalized[key] = isPlainObject(val)
        ? extend({ from: key }, val)
        : { from: val }
    }
  } else if (process.env.NODE_ENV !== 'production') {
    warn(
      `Invalid value for option "inject": expected an Array or an Object, ` +
      `but got ${toRawType(inject)}.`,
      vm
    )
  }
}

```


## 5. normalizeDirectives指令规范化

```javascript

/**
 * Normalize raw function directives into object format.
 */
// 指令解析  xxx = {bind: fun, update: fun}
function normalizeDirectives (options: Object) {
  const dirs = options.directives
  if (dirs) {
    for (const key in dirs) {
      const def = dirs[key]
      if (typeof def === 'function') {
        dirs[key] = { bind: def, update: def }
      }
    }
  }
}

```


## 6. invokeWithErrorHandling handler调用统一处理

```javascript

// 假设this.on(key, fn)
// handler.apply(this=vm, args)
export function invokeWithErrorHandling (
  handler: Function,
  context: any,
  args: null | any[],
  vm: any,
  info: string
) {
  let res
  try {
    res = args ? handler.apply(context, args) : handler.call(context)
    if (isPromise(res)) {
      res.catch(e => handleError(e, vm, info + ` (Promise/async)`))
    }
  } catch (e) {
    handleError(e, vm, info)
  }
  return res
}

```


## 7. $updateListeners更新和注销事件注册


```javascript

export function updateListeners (
  on: Object,
  oldOn: Object,
  add: Function,
  remove: Function,
  createOnceHandler: Function,
  vm: Component
) {
  let name, def, cur, old, event
  for (name in on) {
    def = cur = on[name]
    old = oldOn[name]
    // 规范化事件名称 包括冒泡标记 once标记 passive标记
    event = normalizeEvent(name)
    /* istanbul ignore if */
    if (__WEEX__ && isPlainObject(def)) {
      cur = def.handler
      event.params = def.params
    }
    // 无效绑定警告
    if (isUndef(cur)) {
      process.env.NODE_ENV !== 'production' && warn(
        `Invalid handler for event "${event.name}": got ` + String(cur),
        vm
      )
    } else if (isUndef(old)) {
      // 是否已经构建过handler了
      if (isUndef(cur.fns)) {
        cur = on[name] = createFnInvoker(cur, vm)
      }
      // 如果是once修饰 创建特有的调用方法
      if (isTrue(event.once)) {
        cur = on[name] = createOnceHandler(event.name, cur, event.capture)
      }
      add(event.name, cur, event.capture, event.passive, event.params)
    } else if (cur !== old) {
      old.fns = cur
      on[name] = old
    }
  }
  // oldListeners中存在 listeners中不存在的  当成需要注销的事件
  for (name in oldOn) {
    if (isUndef(on[name])) {
      event = normalizeEvent(name)
      remove(event.name, oldOn[name], event.capture)
    }
  }
}

```

## 8. createFnInvoker

```javascript

// 根绝用户提供的事件handler进行一个function包裹 用户可以定义一个数组handlers
export function createFnInvoker (fns: Function | Array<Function>, vm: ?Component): Function {
  function invoker () {
    const fns = invoker.fns
    if (Array.isArray(fns)) {
      const cloned = fns.slice()
      for (let i = 0; i < cloned.length; i++) {
        invokeWithErrorHandling(cloned[i], null, arguments, vm, `v-on handler`)
      }
    } else {
      // return handler return value for single handlers
      return invokeWithErrorHandling(fns, null, arguments, vm, `v-on handler`)
    }
  }
  invoker.fns = fns
  return invoker
}

```