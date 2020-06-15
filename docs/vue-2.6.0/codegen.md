## 1. 构造compiler

> 个人觉得  本章  可以大概看看我写的内容  最有效的方法是查看测试用例  很详细 覆盖很全面
> 这一段比较绕，主要是包装compile，最终暴露出compile本身以及包装后的compileToFunctions

### 1.1 compiler和compileToFunctions的基础baseCompile

> 它是对src/compiler包下暴露出的核心parse进行初步包装，我们知道parse传入template，返回的是ast语法树，此时生成的render，staticRenderFns是一个代码块字符串，可以用作外部使用的方法体

```javascript

function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {
  const ast = parse(template.trim(), options)         // 前一篇讲的parse，输出ast树
  if (options.optimize !== false) {                   // 如果需要进行优化，执行优化器，把ast树入参进行优化
    optimize(ast, options)                            // 优化过程
  }
  const code = generate(ast, options)                 // 渲染相关的code生成核心，也是我们这篇文章要讲的重点，此时生成的render，staticRenderFns是一个代码块字符串，可以用作外部使用的方法体
  return {
    ast,
    render: code.render,                              // 生成的渲染代码块 一般作为方法体使用 with(){}相关
    staticRenderFns: code.staticRenderFns             // 静态相关渲染函数
  }
}

```

### 1.2 包装baseCompile成compile，编译器的功能入口

> 执行createCompilerCreator生成器，在baseCompile的基础上包装compile，返回的render是字符串代码块，入参baseCompile，处理baseOptions相关数据

```javascript

/**
* 1. copy一份baseOptons，finalOptions = baseOptions，这边我们提一下初始时候的directives，v-text， v-model，v-html
* 2. 定义errors和tips集合，在编译过程中调用options.warn方法时收集，根据报错level选择压入tips或者errors
* 3. 按策略合并finalOptions和options
* 4. 调用baseCompile，返回编译结果
* 5. 最后对各属性的表达式进行正确性校验，递归检测所有节点，在编译模板过程中侧重的是检查name的合法性，这边是统一检查value的合法性
*    (1). type = 1的节点，普通el节点，带有属性指令列表等，
*    (2). 指令匹配，检查for循环中的表达式正确性，  例如v-for="'item' in list" v-for="continue in list"，通过这种形式来检测值的合法性new Function(`var ${ident}=_`)
*    (3). 通用检查表达式合法性，通过new Function(`return ${exp}`)检查关键字和不合法表达式
*    (4). 事件handler检查，关键字等，有个特殊情况，比如说$delete和delete，会先匹配是否有delete关键字，然后$delete，匹配$字符，$delete，$set等对应的正是第一篇中提到的，实例上的api
* 6. 此时的compile是提供对外提供的编译功能包
* */

```

### 1.3 包装compile成compileToFunctions

> 在compile的基础上包装成compileToFunctions，此时获取的render已经是一个方法实例，通过new Function(code)得到

```javascript

/**
* 1. vue编译模板后转换ast成字符串代码块，需要提供一个执行环境，就是new Function(code)，不过这属于执行动态代码行为，有些浏览器策略会禁止这种形式，还有类似的，比如eval方法，所以要检测报错为浏览器安全策略问题导致vue不可用
* 2. 这边可以提一下为什么模板中的变量可以直接访问到实例上对应的属性，vue用了with(){}语句，改变作用域
* 3. 设置模板缓存，避免对编译过的内容再次编译，直接用template本身作为key，是不是属性名称不限制长度呀
* 4. 开始对编译过程中收集的errors和tips循环输出，也就是开发中的那一堆堆飘红报错统一从这边输出
* 5. 调用createFunction，通过new Function(compiled.render)构造方法实例，并且步骤相关错误
* 6. 此时的render，staticRenderFns是一个完整正确的渲染方法，vue挂载的时候调用的正是这两类
* */

```

## 2. 开始我们的代码块生成之旅，codegen

> 上面提到了渲染代码块和方法的生成过程，接下来我们深入到他们的具体生成流程

### 2.1 入口方法generate

```javascript
// 如果不存在ast，默认生成div dom
// vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
const code = ast ? genElement(ast, state) : '_c("div")'
// render的初始化模板
render: `with(this){return ${code}}`,

// 静态渲染函数组初始值[]
staticRenderFns: state.staticRenderFns

```

### 2.2 关于template在v-pre下的两个现象

```html
<!--v-pre指令在编译模板的根标签上时
    全局state.pre为true，
    不能解析v-pre中的template
    会以这种形式存在
    <template>
       #document-fragment
    </template>
    不会展示template下的内容
    关于文档片段节点 可以查看这里https://www.cnblogs.com/xiaohuochai/p/5816048.html
    
    <* 摘抄 javascript提供了一个文档片段DocumentFragment的机制。如果将文档中的节点添加到文档片段中，
    就会从文档树中移除该节点。把所有要构造的节点都放在文档片段中执行，
    这样可以不影响文档树，也就不会造成页面渲染。当节点都构造完成后，
    再将文档片段对象添加到页面中，这时所有的节点都会一次性渲染出来，
    这样就能减少浏览器负担，提高页面渲染速度
    *>
-->
<div v-pre>  
  <div>
    <p>xxx</p>
    <p>yyy</p>
    <template>
      <span>{{xxx}}</span>
    </template>
  </div>
</div>

```

```html
<!--v-pre指令在编译模板的根标签上时
    全局state.pre为false，
    在处理template时，丢弃template本身，内容作为该节点的children处理
    <span>中的内容将照正常dom显示
-->
<div>  
  <div v-pre>
    <p>xxx</p>
    <p>yyy</p>
    <template>
      <span>{{xxx}}</span>
    </template>
  </div>
</div>

```

### 2.3 静态节点树解析

假设接下来是我们要处理html
```html

<section class="parse-index" :xx="xxx">
  <div class="static-tree">              // div1
    <div style="height: 10px;">
      <p>静态节点p</p>
      <p>静态节点span</p>
      <input value="静态节点p"/>
    </div>
  </div>
</section>

```
```javascript

/**
* 1. 很明显div1是静态节点树的根节点
* 2. staticRoot=true，el.staticProcessed = false，调用genStatic，修改el.staticProcessed = false
* 3. 遇见一个静态节点树就调用一次genStatic，state.staticRenderFns.push(`with(this){return ${genElement(el, state)}}`)
* 4. 子节点继续调用genElement正常执行生成流程
* 5. 改造字符代码块，_m=renderStatic，传入当前staticRenderFns，以及是否在for循环中的标记staticInFor
*  `_m(${
*      state.staticRenderFns.length - 1
*    }${
*      el.staticInFor ? ',true' : ''
*    })`
* 6. 上面的讲述中，略过了genElement的具体过程，可查看  ### 2.4 genElement的处理内容
* */

// hoist static sub-trees out
function genStatic (el: ASTElement, state: CodegenState): string {
  el.staticProcessed = true
  // Some elements (templates) need to behave differently inside of a v-pre
  // node.  All pre nodes are static roots, so we can use this as a location to
  // wrap a state change and reset it upon exiting the pre node.
  // 这边是一个state暂存器  类似一个开关 在处理完所有static内容后 恢复为state最初的pre标志
  const originalPreState = state.pre
  if (el.pre) {
    // 在pre下所有element也应该有pre=true的标识 且会影响到data的生成
    state.pre = el.pre
  }
  // 从这段逻辑来看  它把各个静态根节点渲染方法分截存储  
  // 如果存在多个静态分段 就会有多个静态根节点 每个都会生成一段静态渲染代码
  // 推入staticRenderFns
  state.staticRenderFns.push(`with(this){return ${genElement(el, state)}}`)
  state.pre = originalPreState
  // target._m = renderStatic
  // 返回当前静态渲染code片段
  return `_m(${
    state.staticRenderFns.length - 1
  }${
    el.staticInFor ? ',true' : ''
  })`
}
```

### 2.4 genOnce的处理内容

```javascript

/**
* 1. 调用genOnce，onceProcessed = true，且流程中中有三个情况分支处理，
* 2. v-once带有if指令，则先解析if条件，在if中有处理once的情况，完整闭环，细节我们再genIf的时候讲到
* 3. el.staticInFor如果为true，表示该el为for循环下的静态节点，向上查找节点的key属性，如果没有找到提示once指令只能放置在有key设置的v-for循环内部
* 4. 如果没有设置key，可以在页面生成，但是会对diff算法产生影响
* 5. 如果有key属性，返回`_o(${genElement(el, state)},${state.onceId++},${key})`，_o = markOnce
* 6. 如果没有if条件块也不是在for循环中，则当成是一个静态树形根节点来处理，但是假如里面有实例变量呢，
*    所以这边所谓的静态渲染方法其实不是说里面的内容一定是没有变量什么的，而是可以有各种实例访问或者不访问都行，但是只执行一次，只是为渲染逻辑提供方便，后续详解这块内容
* 7. 在这边把once指令中的内容当做静态节点树处理，会渲染一次且可以访问实例上的属性
* */

// v-once  对once存在的几种情况判断 生成对应的代码块
function genOnce (el: ASTElement, state: CodegenState): string {
  el.onceProcessed = true
  if (el.if && !el.ifProcessed) {
    return genIf(el, state)
    // once在static中
  } else if (el.staticInFor) {
    let key = ''
    let parent = el.parent
    // 向上追溯for标签所在el
    while (parent) {
      if (parent.for) {
        key = parent.key
        break
      }
      parent = parent.parent
    }
    // 追溯中未发现for循环中el的key标识 发出警告 但是并未中断代码块生成
    if (!key) {
      process.env.NODE_ENV !== 'production' && state.warn(
        `v-once can only be used inside v-for that is keyed. `,
        el.rawAttrsMap['v-once']
      )
      return genElement(el, state)
    }
    // target._o = markOnce 渲染once相关函数  onceId
    return `_o(${genElement(el, state)},${state.onceId++},${key})`
  } else {
    return genStatic(el, state)
  }
}
```

### 2.5 genFor的处理内容

```javascript

/**
* 1. 在是组件不是保留标签&&tag !== slot&&tag !== template的情况下，需要设置key属性，用于diff算法，后续会提到
* 2. 标记forProcessed=true
* 3. 假设<div v-for="item in list">div</div>将生成这个字符串，_l((list),function(item){return _c('div',[_v("div")])})
*   (1). 其中_l = renderList，_c = createElement，_v = createTextVNode
*   (2). 有个细节，_l((list), ...)，括号包裹list，这就成了个表达式，会执行(list)，对应的情况就是list不一定是一个现成的结果对象或数组，有可能是一个computed中声明的对象需要执行get才能拿到具体值，或者是个方法，返回结果才是我们预期的循环目标
* 4. 假设<child v-for="item in list">div</child>将生成这个字符串，_l((list),function(item){return _c('child',[_v("div")])})
* 5. 上面示例中我们没有带上迭代器，<child v-for="item, key, index in list">div</child>
*     将得到_l((obj),function(item,key,index){return _c('child',[_v("div")])})，多了一个参数组装部分，在renderList的参数方法中加上了迭代参数function(item,key,index)
* 6. 接下来继续执行genElement，包装返回结果
* */

export function genFor (
  el: any,
  state: CodegenState,
  altGen?: Function,
  altHelper?: string
): string {
  const exp = el.for
  const alias = el.alias
  const iterator1 = el.iterator1 ? `,${el.iterator1}` : ''
  const iterator2 = el.iterator2 ? `,${el.iterator2}` : ''

  // key检查 for循环中需要key来处理diff算法
  if (process.env.NODE_ENV !== 'production' &&
    state.maybeComponent(el) &&
    el.tag !== 'slot' &&
    el.tag !== 'template' &&
    !el.key
  ) {
    state.warn(
      `<${el.tag} v-for="${alias} in ${exp}">: component lists rendered with ` +
      `v-for should have explicit keys. ` +
      `See https://vuejs.org/guide/list.html#key for more info.`,
      el.rawAttrsMap['v-for'],
      true /* tip */
    )
  }

  el.forProcessed = true // avoid recursion
  // target._l = renderList
  return `${altHelper || '_l'}((${exp}),` +
    `function(${alias}${iterator1}${iterator2}){` +
      `return ${(altGen || genElement)(el, state)}` +
    '})'
}
```


### 2.6 genIf的处理内容

```javascript

/**
* 1. el.ifProcessed = true
* 2. 执行genIfConditions，传入el.ifConditions.slice()，截取副本入参
* 3. 如果conditions长度为0，则'_e()'，创建空节点
* 4. 例子正常的if-else
*    <div v-if="showIf">if</div>
*    <div v-else-if="showElseIf">if</div>
*    <div v-else>else</div>
*    该例中，conditions=[{exp:'showIf'}, {exp: 'showElseIf'}, {exp: undefined}]，
*    处理第一个元素时，(showIf)?_c('div',[_v("if")]):...
*    将会执行(showIf)表达式，选择前半部分或者后半部分渲染内容
*    处理完第二个元素时，(showIf)?_c('div',[_v("if")]):(showElseIf)?_c('div',[_v("if")]):_c('div',[_v("else")])，构造三元表达式来执行选择性渲染
* 5. 如果带有v-once指令，渲染方法替换成_m=markOnce，like (a)?_m(0):_m(1)
* */


// 核心 生成三元运算符来判断该渲染的代码块
export function genIf (
  el: any,
  state: CodegenState,
  altGen?: Function,
  altEmpty?: string
): string {
  el.ifProcessed = true // avoid recursion
  // 处理conditions
  return genIfConditions(el.ifConditions.slice(), state, altGen, altEmpty)
}

function genIfConditions (
  conditions: ASTIfConditions,
  state: CodegenState,
  altGen?: Function,
  altEmpty?: string
): string {
  if (!conditions.length) {
    // target._e = createEmptyVNode       // 生成一个空vnode节点
    return altEmpty || '_e()'
  }

  const condition = conditions.shift()
  if (condition.exp) {
    return `(${condition.exp})?${
      genTernaryExp(condition.block)
    }:${
      genIfConditions(conditions, state, altGen, altEmpty)
    }`
  } else {
    return `${genTernaryExp(condition.block)}`
  }

  // v-if with v-once should generate code like (a)?_m(0):_m(1)
  function genTernaryExp (el) {
    return altGen
      ? altGen(el, state)
      : el.once
        ? genOnce(el, state)
        : genElement(el, state)
  }
}
```

### 2.7 genSlot的处理内容

```javascript

/**
* 1. 解析el.tag === 'slot'的情况，const slotName = el.slotName || '"default"'
* 2. 有可能<slot><div>div</div></slot>，如果没有在外层指定插槽内容，则会显示它自带的内容
* 3. 太多情况了  看vue测试单元用例  很直观
* */

```

### 2.8 genProps的处理内容

```javascript

/**
* 1. 分成静态属性和动态属性处理，在浏览器环境下，字符串表达式不允许换行，需要transformSpecialNewlines转换
* 2. 例子
*    <div userpassword="123445"></div>
*    <div :[username]="className"></div>
*    <div :username="className"></div>
*    <input :value.prop="className"></input>
*   (1). {"userpassword":"123445"} 
*   (2). _d({},[username,className])          // _d = bindDynamicKeys绑定动态key
*   (3). {"username":className}
*   (4). {"value":className}
*   生成的拼接语句
*   (1). 一种是attrs相关的，attrs:{"username":className},
*   (2). 一种是domprop相关的，domProps:{"value":className},
*   (3). 一种是对应动态属性名称的，_b({},"div",_d({},[username,className]))，这边已经涉及到我们genData的内容了
* */

```

### 2.9 genComponent属性数据的处理

```javascript

/**
* 1. 如果el.component=true，执行genComponent解析
* 2. 如果是非内联模板，则调用genChildren继续解析，children来源在这里
*         if (element.slotScope) {
*            // scoped slot
*            // keep it in the children list so that v-else(-if) conditions can
*            // find it as the prev node.
*            const name = element.slotTarget || '"default"'
*            ;(currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element
*          }
*          currentParent.children.push(element)
* 3. 这边不详细解析内部渲染逻辑
* */

```

### 2.10 genData属性数据的处理

```javascript

/**
* 1. 如果el节点不是纯净节点!el.plain，则解析得到data
* 2. 如果el.inlineTemplate = false，解析子节点，拼接code
* 3. 生成的data作为_c方法的参数使用，整体表现形式是一个对象字符序列化，在实际执行的时候它就是一个option对象{}
* 4. 调用genDirectives处理指令相关信息
* 5. el.key => data += `key:${el.key},`
* 6. el.ref => data += `ref:${el.ref},`
* 7. el.refInFor => data += `refInFor:true,`
* 8. el.pre => data += `pre:true,`
* 9. el.component => data += `tag:"${el.tag}",`
* 10. 过一遍state.dataGenFns，处理style，class属性绑定生成
*  (1). <input class="username-static" :class="dynamicClass"/>  => staticClass:"username-static",class:dynamicClass,
*  (2). <input style="padding-left: 10px;" :style="dynamicStyle"/> => staticStyle:{"padding-left":"10px"},style:(dynamicStyle),
* 11. el.attrs => data += `attrs:${genProps(el.attrs)},`
* 12. el.props => data += `domProps:${genProps(el.props)},`
* 13. el.events => data += `${genHandlers(el.events, false)},`，genHandler请查看  ### 2.12 genHandlers的处理内容
* 14. el.nativeEvents => data += `${genHandlers(el.events, false)},`，genHandler请查看  ### 2.12 genHandlers的处理内容
* 15. el.slotTarget && !el.slotScope  => data += `slot:${el.slotTarget},`
* 16. genScopedSlots处理内容 查看 ### 2.13 genScopedSlots处理内容
* 17. 经过上面指令处理，如果存在el.model则包装一遍
*     data += `model:{value:${
*        el.model.value
*      },callback:${
*        el.model.callback
*      },expression:${
*        el.model.expression
*      }},`
* */

```

### 2.11 genChildren的处理内容

```javascript

/**
* 1. 对el为for循环标记，下属子元素单一的进行优化处理，执行genElement生成代码，并且附带normalizationType，关于子节点规范化类型参数，后续会讲到
* 2. 非上述情况则对children map处理
* */

```

### 2.11 genDirectives的处理内容

```javascript

/**
* 1. 内建指令 在directives中收集的指令有 cloak html model text，我们把这四种情况拆分讲解
*   (1). v-html，本质上就是挂载属性innerHTML，`_s(${dir.value})`，_s = toString
*   (2). v-text，本质上是挂载textContent属性，`_s(${dir.value})`
*   (3). v-cloak，讲一下我的理解，首先这个指令的作用是屏蔽在vue实例完成编译之前的样式控制，一般用来加样式display，因为在编译完成前的空档会有表达式等原样显示，编译结束后赋值就会有闪烁的情况等，
*        样式是通过属性选择器完成匹配[v-cloak]{display: none}，那理论上我取什么名字都能有这个效果呀，为啥只能cloak呢，
*        因为在编译的时候v-xxx这种格式的会被编译成指令，如果没有在指令文件中找到匹配的处理方法的话会报编译错误，而vue中预先定义了cloak的指令内容，虽然方法是个
*        noop空方法，但是占位置定义了cloak了，这样解析的时候就不会报错了，编译后正常显示内容是因为移除了v-cloak指令属性 **********
*   (4). v-model，内容比较多，单独列出来
* 2. v-model，调用model方法，如果el.tag === 'input' && type === 'file'，不能使用双向绑定，只读类型
*   (1). 如果是自定义组件genComponentModel，我们分三种情况给三种结果，其中value="(username)"，expression=""username""
*  <child v-model="username"></child>              // callback="function ($$v) {username=$$v}"
*  <child v-model.trim="username"></child>         // callback="function ($$v) {username=(typeof $$v === 'string'? $$v.trim(): $$v)}"
*  <child v-model.number="username"></child>       // callback="function ($$v) {username=_n($$v)}"
*  
*  <child v-model="username"></child>              // dirs="directives:[{name:"model",rawName:"v-model",value:(username),expression:"username"}]"
*  <child v-model.trim="username"></child>         // dirs="directives:[{name:"model",rawName:"v-model.trim",value:(username),expression:"username",modifiers:{"trim":true}}]"
*  <child v-model.number="username"></child>       // dirs="directives:[{name:"model",rawName:"v-model.number",value:(username),expression:"username",modifiers:{"number":true}}]"
*  
* */

```

### 2.12 genHandlers的处理内容

```javascript

/**
* 1. const prefix = isNative ? 'nativeOn:' : 'on:'      // 根据isNative确定代码块前缀
* 2. 不绑定handler的情况<child @click></child>            // 生成的结果=on:{"click":function($event){}}
* 3. 绑定handler为数组的情况 <child @do-handler="handlers"></child> handlers=[fn,fn]    // on:{"do-handler":handlers}，这种情况handler解析出来的表达式为"handlers"
* 4. 真正handlers为数组的例子 <div @click="handlers">div</div>   // 生成的结果on:{"click":handlers}
* 5. 3和4中的handers这种绑定方式并不是多个handlers数组绑定，只能算是一个普通表达式，后续我给大家找个handlers数组的例子
* 6. 通过simplePathRE正则匹配判断是否为简单路径的handler方法，也就是类似这种handlClick或者handlerObj.handlClick等这种简单表达式形式 doThis
*    对应的是这种形式 <div @click="handlerClick">div</div>  输出结果on:{"click":handlerClick}
* 7. 通过fnExpRE判断是否为方法格式的handler绑定，类似这种<div @click="function () {handlerClick()}">div</div>，结果=on:{"click":function () {handlerClick()}}
*    对应的是这种形式 <div @click="function () {handlerClick()}">div</div>
* 8. 通过fnInvokeRE替换剩下的满足simplePathRE，也就是存在方法调用的情况  输出结果=on:{"click":function($event){return handlerClick()}}
*    对应的是这种形式 <div @click="handlerClick()">div</div>，和6对比一下，区别是啥，调用的时候
*    (1). 有传递dom原生事件对象$event，无法传自定义参数
*    (2). 没有有传递dom原生事件对象$event，可以自定义参数传递，但是获取不到$event
*    (3). 中间那种正好解决这两种的情况，但是不优雅，所提提供了这三种模式<div @click="function (e) {handlerClick(e, 'custom')}">div</div>
* 9. 以上情况都是没有带修饰符下的处理，进行第一轮修饰符处理假设
*    modifierCode map如下
*       stop: '$event.stopPropagation();',
*       prevent: '$event.preventDefault();',
*       self: genGuard(`$event.target !== $event.currentTarget`),
*       ctrl: genGuard(`!$event.ctrlKey`),
*       shift: genGuard(`!$event.shiftKey`),
*       alt: genGuard(`!$event.altKey`),
*       meta: genGuard(`!$event.metaKey`),
*       left: genGuard(`'button' in $event && $event.button !== 0`),
*       middle: genGuard(`'button' in $event && $event.button !== 1`),
*       right: genGuard(`'button' in $event && $event.button !== 2`)
*   假设<input @click.middle="handler1">div</input>  生成这么一个条件表达式if('button' in $event && $event.button !== 1)return null;，对应的键值keys也会被记录下来
* 10. exact修饰符的处理，系统键['ctrl', 'shift', 'alt', 'meta']过滤出不在这边的键值，输出结果=if($event.ctrlKey||$event.shiftKey||$event.metaKey)return null;
*     关于exact的作用，就是系统键之间可以做到触发精确的按键事件，具体可以看文档，
*     一直按着alt + 其他普通键可以触发alt，一直按着alt+shift也可以触发alt，加上exact之后就不会再触发
* 11. 其他未内置的修饰符key直接push进keys
* 12. keys遍历组装代码块，<input @keydow.down="handler1">div</input> 输出结果=if(!$event.type.indexOf('key')&&_k($event.keyCode,"down",40,$event.key,["Down","ArrowDown"]))return null;
*     _k = checkKeyCodes，检查事件与键盘按键事件的对应关系
* 13. 接下来又是对三种绑定handle类型的对应处理   
* */

```

### 2.13 genScopedSlots处理内容

```javascript

/**
* 1. 判断是否需要强制刷新needsForceUpdate 执行containsSlotChild，如果el.type === 1也就是常用节点，tag === 'slot'返回true
* 2. 如果上述判断还没有确定needsForceUpdate为true，则再进一步判断存在slotScope作用域的需要强制更新
* 3. 开始map遍历slots生成代码块
* 4.   <child>
*         <template v-slot:header>
*           <span>header</span>
*         </template>
*       </child> 
*       生成的结果=scopedSlots:_u([{key:"header",fn:function(){return [_c('span',[_v("header")])]},proxy:true}]), `${genScopedSlots(el, el.scopedSlots, state)},
* */

```


<br>
<br>
如果可以，请喝杯咖啡，ヾ(≧▽≦*)o

![](https://user-gold-cdn.xitu.io/2019/12/13/16efafe4704796ea?w=287&h=288&f=jpeg&s=41747)