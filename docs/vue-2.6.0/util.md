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