
## 1. 模板编译器

> 如果用户提供的options并没有render函数，则查找其携带的template字段提供的模板串，模板编译器则完成字符串解析成ast语法树的核心工具，关于[AST语法树](https://juejin.im/post/5bff941e5188254e3b31b424)，
> 编译器将在AST语法树上标记各种关键信息 e.g: filter，text等标记
> 所谓的服务端喧嚷就是在服务端调用编译器执行编译输出相应render函数的一个过程，这样处理之后前端Vue库文件就不用携带编译器相关的源码，可以解除相关代码的打包，所以可以有效减少Vue js文件体积

- 关于模板编译整体流程 文字表述

```javascript

/**
 * => Vue实例执行mount挂载，发现没有render函数，且提供了template字符串，需要调用编译器解析
 * => 调用编译器生成动态节点渲染方法render和静态节点渲染方法集合staticRenderFns
 * => 调用编译器的时候需要调用子方法parse把字符串解析成AST语法树，对节点进行字段扩展
 * => parse中调用html-parse方法输入字符串，逐个输出关键字符节点信息
 * => 在上述操作完成后，调用优化方法标记是否静态节点
 * => 调用代码生成器，将AST语法树组装成可执行代码块
 * => 向编译器调用方输出AST结果&render动态节点渲染函数&staticRenderFns静态节点渲染函数集合
 * */

```

- 关于模板编译整体流程 流程导图展示

![](https://user-gold-cdn.xitu.io/2019/12/4/16ecec43369fb559?w=1105&h=2715&f=png&s=174097)

## 2. 模板编译核心之html-parser

> 模板解析的本质是字符的逐一循环处理，所以性能消耗比较大，服务端渲染有比较明显的性能优势

### 2.1 模板解析中用到的正则梳理

- attribute 属性匹配正则


> 关于正则表达式相关知识可以点击这里[正则 掘金](https://juejin.im/post/5cdcd42551882568651554e6)

```javascript
/**
* ^\s*                                                      空白符开头  一个或多个
* ([^\s"'<>\/=]+)                                           匹配属性名称的子表达式 非空白符且不是"'<>\/=
* (?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))     后半部分子表达式
* ?:                                                        非捕获组，不缓存匹配记录，对属性这种高频出现的正则匹配有明显的性能提升
* \s*(=)\s*  <div username = "xxx.zhang">                   表示这样也合法
* (?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+))                  属性值部分
* "([^"]*)"+                                                "包裹除它本身的0或多个符合条件的内容
* |'([^']*)'+                                               或者'包裹除它本身的0或多个符合条件的内容
* |([^\s"'=<>`]+))                                          或者没有两者包裹的不包含空白符和这些指定字符的内容
* */

/**
* 该正则匹配的情况如下
* <div v-bind:username="xxx.zhang" :username="xxx.zhang" :username = "xxx.zhang"  @callme="handleCallme" username>  
* */
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/

```

- dynamicArgAttribute 指令正则匹配

> 与attribute的区别是 属性名称是一个变量

```javascript

/**
* ^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+\][^\s"'<>\/=]*)             前半部分
* ^\s*                                                        空白符开头  一个或多个
* (?:v-[\w-]+:|@|:|#)                                         这边就是经常出现的v-指令匹配，:指令匹配，@事件绑定匹配 #slot绑定，[w-]还加个- 这种情况比较少 可能是匹配 v-re-get  也就是用户可能自定义个指令re-get
* \[[^=]+\]                                                   动态属性匹配的关键正则 v-bind[name]=""  绑定的属性名称是变量的时候                                                            
* ([^\s"'<>\/=]+) 匹配属性名称的子表达式 非空白符且不是"'<>\/=
* (?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))       后半部分子表达式
* ?:                                                          非捕获组，不缓存匹配记录，对属性这种高频出现的正则匹配有明显的性能提升
* \s*(=)\s*  <div username = "xxx.zhang">                     表示这样也合法
* (?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+))                    属性值部分
* "([^"]*)"+                                                  "包裹除它本身的0或多个符合条件的内容
* |'([^']*)'+                                                 或者'包裹除它本身的0或多个符合条件的内容
* |([^\s"'=<>`]+))                                            或者没有两者包裹的不包含空白符和这些指定字符的内容
* */
/**
* 该正则匹配的情况如下
* <div v-bind:[name]="xxx.zhang" :[name]="xxx.zhang" :[name] = "xxx.zhang"  @[dosomething]="handleCallme">
* <div [name]>                                               这样是非法的 属性名称非法
* */
const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/

```

- startTagOpen   开始标签起点匹配正则

- startTagClose  开始标签终点匹配正则

- engTag         结束标签匹配正则

```javascript
/**
* 上述三个标签正则类型都以下面正则为基础
* */
ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeRegExp.source}]*`   // 解析 \\-\\.  这边ncname是个字符串 并不是正则表达式  所以需要双反斜杠表示

```

### 2.2 parseHTML字符串解析流程

> 我们将用文字来表述整个过程，比较冗长，具体源码等可以看我的仓库代码并附有注释

假设要处理的html代码如下：

```html
<section class="html-parse-example">
  <div class="level1">
    <!--测试注释解析-->
    <!--[if IE]>
    IE
    <![endif]-->
  
    <!--[if IE6]>
    IE >= IE6
    <![endif]-->
  
    <!--[if !IE]>
    NOT IE
    <![endif]-->
  
    Normal
    <div class="level2">
      level2
      <div class="level3" :level="level3">
        level3
        <div class="level4" :level="'level4'">
          level4
        </div>
          名字<input type="text" v-model="username" />
          姓氏<input type="text" v-model="surname" />
        <p>用来测试expectHTML-p<div>用来测试expectHTML-div</div>content001</p>
        <p>测试双括号号输出 -- {{username}} -- Mustache语法</p>
        <!-- 用来测试自定义组件解析 -->
        <my-component1 v-bind:username="username" :user="user"></my-component1>
        <!-- 用来测试自定义组件解析 -->
        <my-component2 v-bind:username="username" :user="user" />
      </div>
    </div>
  </div>
</section>

```

#### 2.2.1 第一批次解析

```javascript

const stack = []                 // 定义栈，用来存放解析过程中的标签信息
let index = 0                    // 定义游标，用来标记当前字符串处理位置
let last, lastTag                // last用来备份字符流数据，lastTag用来标记结尾标签信息

/**
* 1. 如果html不为空，备份数据last=html，此时不存在lastTag
* 2. 查找左尖括号的位置，定位非纯文本的位置，此时textEnd === 0
* 3. 当前开头字串<section class="html-parse-example">略过注释，条件注释，开始标签终点匹配，结束标签匹配，执行开始标签解析
* 4. 命中开始标签匹配，定义match对象，挂载标签名称，初始化属性数组，记录开始索引start
* 5. 调用advance方法游标前移，html从游标位置往后截取
* 6. 定义end，attr分别存储开始标签终点匹配信息，attr属性匹配信息，开始循环匹配
* 7. 命中属性匹配 class，attr对象记录属性开始索引start，结束索引end，压入前面match对象挂载的attrs数组
* 8. 调用advance，命中开始标签终点，非自闭合标签且需要斜杠标记结尾，前移索引，<section class="html-parse-example">解析结果如下信息
* match = {
*   tagName: 'section',
*   start: 0,
*   end: 36,
*   attrs: [
*     {
*       0: 'class="html-parse-example"',               // 匹配到的全部内容
*       1: 'class',                                    // 第一个子表达式内容 属性名称
*       2: '=',                                        // =
*       3: 'html-parse-example'                        // 第三个子表达式匹配内容 表达式
*       start: 8,
*       end: 35,
*     }
*   ]
* }
* 9. 处理开始标签匹配结果，整理属性集合，获取属性名称和value表达式
*   const args = match.attrs[i]
*   const value = args[3] || args[4] || args[5] || ''  [3], [4], [5]分别表示第3，4，5子表达式正则匹配的表达式
*   let html = 'v-html="html | xxxxxxxx"'  args[3]
*   let html = "v-html='html | xxxx'"  args[4]
*   let html = "v-html=html"   args[5]
* 10. 不是自闭合标签，压入栈标签信息
* 11. 如果options.start存在，抛出相关匹配信息
* 12. 此时stack=[
*   {
*     tag: 'div',
*     lowerCasedTag: 'div',
*     attrs: [...],
*     start: ,
*     end: 
*   }
* ]
* */

```

#### 2.2.1 第二批次解析

```javascript

/**
* 1. 解析到注释标签，如果options带有comment方法且标记需要保存注释内容，则调用comment抛出注释相关的索引，内容等信息
* 2. 注释和条件注释等并不会把相关信息压入栈
* 3. div(level4)处理完开始标签部分
* 4. 此时lastTag = 'div'                   // class="level4"
* 5. 此时stack=[
*   {
*     tag: 'div',                         // class="html-parse-example"
*     lowerCasedTag: 'div',
*     attrs: [...],
*     start: ,
*     end: 
*   },
*   {
*     tag: 'div',                         // class="level1"
*   },
*   {
*     tag: 'div',                         // class="level2"
*   }
*   {
*     tag: 'div',                         // class="level3"
*   }
* ]
* */

```

#### 2.2.1 第三批次解析

此时剩余的html内容如下:

```html

        </div>
          名字<input type="text" v-model="username" />
          姓氏<input type="text" v-model="surname" />
        <p>用来测试expectHTML-p<div>用来测试expectHTML-div</div>content001</p>
        <p>测试双括号号输出 -- {{username}} -- Mustache语法</p>
        <!-- 用来测试自定义组件解析 -->
        <my-component1 v-bind:username="username" :user="user"></my-component1>
        <!-- 用来测试自定义组件解析 -->
        <my-component2 v-bind:username="username" :user="user" />
      </div>
    </div>
  </div>
</section>

```

> 其实我觉得只要在pos的位置索引不等于stack的末尾索引不就是没有匹配的标签吗 pos !== stack.length - 1就报错

```javascript

/**
* 当前lastTag='div'
* 1. 匹配到结束标签</div> 调用parseEndTag
* 2. 开始回溯 stack从末端开始遍历 找到与之匹配的元素 我们回头找到在最末尾位置 找到之后记住pos = 3
* 3. pos >= 0成立，再次逆向遍历stack，如果在i>pos位置上存在标签 则是没有对应结束标签的情况，报错has no matching end tag
* 4. 我们这边是正常结束 i === pos 所以执行options.end(stack[i].tag, start, end)
* 5. 以pos为末端截断stack，相当于栈弹出末端元素
* */

```

#### 2.2.2 第四批次解析

此时剩余的html内容如下:

```html

         />
          姓氏<input type="text" v-model="surname" />
        <p>用来测试expectHTML-p<div>用来测试expectHTML-div</div>content001</p>
        <p>测试双括号号输出 -- {{username}} -- Mustache语法</p>
        <!-- 用来测试自定义组件解析 -->
        <my-component1 v-bind:username="username" :user="user"></my-component1>
        <!-- 用来测试自定义组件解析 -->
        <my-component2 v-bind:username="username" :user="user" />
      </div>
    </div>
  </div>
</section>

```

```javascript

/**
* 1. 匹配开始标签终input端部分 />，end[1] = '/'，所以打上自闭合标记，不用调用options.start方法也不用切换lastTag，也不用往stack压入标签
* 2. 继续处理模板
* 
* */

```

#### 2.2.3 第五批次解析

此时剩余的html内容如下:

```html

        <p>用来测试expectHTML-p<div>用来测试expectHTML-div</div>content001</p>
        <p>测试双括号号输出 -- {{username}} -- Mustache语法</p>
        <!-- 用来测试自定义组件解析 -->
        <my-component1 v-bind:username="username" :user="user"></my-component1>
        <!-- 用来测试自定义组件解析 -->
        <my-component2 v-bind:username="username" :user="user" />
      </div>
    </div>
  </div>
</section>

```

```javascript

/**
* 1. 这边涉及到的是关于和浏览器端是否保持一致的处理
* 2. <p><div>content</div></p>  在浏览器中会这样表现 <p level="1"></p><div></div><p level="2"></p>
* 3. 也就是说如果用户传入字符串如上<p><div>content</div></p>, 要保持一致的话，需要特殊处理
* 4. 解析p之后，遇到div，符合lastTag === 'p' && isNonPhrasingTag(tagName)，p标签包裹块级标签，所以特殊处理
* 5. 在处理div的时候，lastTag = 'p'，则调用一遍parseEnd('p')，清除掉stack中保存的['p']，stack = []，继续处理 压入div， ['div']
* 6. 又遇见</p>，往stack中查找p，没有找到，pos = -1，进入特殊块，调用欧赔options.start('p')，options.end('p')
* 7. 就由一个p标签对变成了两个p标签对，且拍平与div处于同级 content001会被转移到外层
* 8. 另外一种就是是否允许左开的标签  类似这种  <img> <p> 或者自定义允许指定名称的组件可以没有结束标签
* 9. <img> 这是左开  <img /> 这是自闭合
* */

```

#### 2.2.4 第六批次解析

此时剩余的html内容如下:

```html

        <p>测试双括号号输出 -- {{username}} -- Mustache语法</p>
        <!-- 用来测试自定义组件解析 -->
        <my-component1 v-bind:username="username" :user="user"></my-component1>
        <!-- 用来测试自定义组件解析 -->
        <my-component2 v-bind:username="username" :user="user" />
      </div>
    </div>
  </div>
</section>

```

```javascript

/**
* 1. text内容处理  textEnd >= 0表示text和标签内容混排，如果textEnd<0 则所有都是纯粹的text内容，直接调用options.chars()抛出
* 2. 如果last === html的两种情况，第一种是传进来的html本身就有问题，没有需要编译各种标签的内容，另一种是结尾处是一段纯文本，在开发模式下会告警
* */

```

#### 2.2.5 收尾

> 字符解析的核心就是这样了 还有一些内容比如是否富文本标签的处理，一些换行处理，细节大家可以自己看看

- 关于性能优化的细节

可以看到parseStartTag的频率是最高的，放置到循环末端有一定的优化作用

- 用一张图来展示上述流程


![](https://user-gold-cdn.xitu.io/2019/12/7/16ee0dcc90ee57af?w=3166&h=3887&f=png&s=631395)

## 3. 模板编译之ast语法树生成

> 最终输出结果是一个root ast节点，通过children属性来绑定子父级关系


### 3.1 相关正则解析

- onRE

```javascript

/**
* 匹配@或者v-on:开头，也就是事件绑定匹配
* */
export const onRE = /^@|^v-on:/

```

- dirRE

```javascript

/**
* 匹配@或者v-或者:开头，指令匹配 包括事件监听
* */
export const dirRE = process.env.VBIND_PROP_SHORTHAND
  ? /^v-|^@|^:|^\./
  : /^v-|^@|^:/

```

- forAliasRE

```javascript

/**
* 主要用途是匹配v-for循环相关
* 1. 子表达式1，匹配空白字符开头，非空白字符随后的0次或多次，
* 2. ([\s\S]*)  可以匹配到 str="  item"
* 3. ([\s\S]*?)  可以匹配到 str="  item, index"
* 4. ([\s\S]*?)\s+  可以匹配到 str="  item, index  "
* 5. (?:in|of)      非贪婪匹配 匹配到in或者of停止向下寻找
* 6. /([\s\S]*?)\s+(?:in|of)\s+   可以匹配到 str="  item, index of  "
* 7. ([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)   可以匹配到 str="  item, index of object"
* */
export const forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/

```

- forIteratorRE

```javascript

/**
* 匹配@或者v-on:开头，也就是事件绑定匹配，以下是我能想出来的几种形式，包括基础版本，嵌套版本本质上是对元素对象取值的扩展
* 1. v-for="item in list"
* 2. v-for="item, index in list"
* 3. v-for="item, key, index of obj"
* 4. v-for="(item, key, index) of obj"
* 5. v-for="[item1, item2], index in list"  list = [[], []]
* 6. v-for="{name, password}, key, index of obj"  obj = {key1: {name: '', password: ''}}
* 7. v-for="[item1, {name}], index in list"  list = [['xxx', {name: 'xx'}]
* */
export const forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/

```

- dynamicArgRE

```javascript

/**
* 匹配v-bind[xxx]  匹配xxx的
* */
const dynamicArgRE = /^\[.*\]$/

```

- modifierRE

```javascript

/**
* 匹配修饰符的  类似.prop  .enter  .prevent这些
* */
const dynamicArgRE = /^\[.*\]$/

```


- modifierRE

```javascript

/**
* 匹配v-slot插槽
* */
const slotRE = /^v-slot(:|$)|^#/

```

### 3.2 开始我们的parse旅程

> 接收html-parser抛出的数据信息，有层级顺序的组装ast节点，并且在该节点对象上进行各种相对应的属性扩展

![parse主流程示意图](https://user-gold-cdn.xitu.io/2019/12/12/16efaaf0027355ef?w=4007&h=4595&f=png&s=535961)

#### 3.2.1 关键变量定义

```javascript

const stack = []                            // 栈对象 代表节点层级
let root                                    // 根节点
let currentParent                           // 类似html-parser中的lastTag 当前处理节点的父节点
let inVPre = false                          // 是否在v-pre指令中
let inPre = false                           // 是否在<pre>标签中
```


#### 3.2.2 parseHTML开始调用 解析相关参数


```javascript

    expectHTML: options.expectHTML,                                       // 是否和浏览器行为保持一致
    isUnaryTag: options.isUnaryTag,                                       // 是否自闭合标签的判断方法
    canBeLeftOpenTag: options.canBeLeftOpenTag,                           // 是否可以左开标签判断方法
    shouldDecodeNewlines: options.shouldDecodeNewlines,                   // 编码解码相关配置
    shouldDecodeNewlinesForHref: options.shouldDecodeNewlinesForHref,     // href链接的换行或者制表符等编码解码处理
    shouldKeepComment: options.comments,                                  // 是否需要保留注释
    outputSourceRange: options.outputSourceRange,                         // 是否需要ourputSource

    options.start()                                                       // 接收start开始标签信息
    options.end()                                                         // 接收end结束标签信息
    options.chars()                                                       // 接收纯文本信息
    options.comment()                                                     // 接收注释信息
```

#### 3.2.3 html-parser调用start的执行过程

```javascript
/**
* 1. 调用createASTElement，创建ast节点element
* {
*    type: 1,
*    tag,
*    attrsList: attrs,
*    attrsMap: makeAttrsMap(attrs),
*    rawAttrsMap: {},
*    parent,
*    children: []
* }
* 2. 获取命名空间信息ns，有一些标签有ns特性，比如frame，svg等
* 3. 非生产模式下如果outputSourceRange为true，保存原始属性map集，校验属性名称的合法性，如果含有特殊字符将告警
* 4. 如果禁止标签混入启动告警，比如dom中混入srcipt标签，理论上合法，但是禁止使用，会带来副作用的标签，产生不可预料的情况
* 5. 先进行判断是否在v-pre指令中，如果含有v-pre属性，标记el.pre = true，可以跳过大量process处理指令的流程，只收集原生属性，需要对attrs进行处理，把值进行stringify
* 6. 判断是否在<pre>标签，如果是，保留text类型值为空的子节点
* 7. 判断该element是否处理过
* 8. 处理v-for属性processFor，例如v-for="(item, key, index) of obj"
*   el.for = 'obj'
*   el.alias = 'item'
*   el.iterator1 = 'key'
*   el.iterator1 = 'index'
* 9. 处理v-if属性processIf，例如v-if="count === 1" v-else v-else-if="count !== 1"
*   el.if = 'count === 1'
*   el.ifConditions.push({
*     exp: 'count === 1',
*     block: el
*   })
*   el.else = true
*   el.elself = 'count !== 1'
* 10. 处理v-once属性processOnce，v-once
*   el.once = true
* 11. 如果root=undefined，则把当前el设置为根节点root
* 12. 调用checkRootConstraints检查根节点合法性
*   (1). tag===slot，tag===template的不可以
*   (2). 不能在根节点中带有v-for指令
* 13. 如果不是自闭合标签，处理完当前节点后把当前节点标记为下个循环处理节点的父节点，且将当前节点压入栈stack，如果是自闭合标签，直接调用closeElement，处理关闭标签内容
* */


```

#### 3.2.4 html-parser调用end的执行过程

```javascript

/**
* 1. 获取栈末端元素就是需要进行处理的对应节点信息，stack末端元素移除，currentParent指向当前节点的前一个节点，
* */


```

#### 3.2.4 closeElement的处理内容

```javascript
/**
* 1. 调用trimEndingWhitespace，清除子节点为text类型且值为空的子元素 '<div><p>xxx</p>   </div>' 类似这种的，浏览器会保留空格，vue会把解析到的这种text空节点清除，如果是在pre标签中则需要保留
* 2. 调用processElement
* 3. processKey，如果tag === template，提示不能再template标签中使用key属性，如果存在for标签，提示transition-group用索引作key相当于没用
* 4. 判断是否为纯净节点，如果不存在key，不存在scopeslots，不存在属性列表
* 5. processRef，处理ref属性，el.ref = ref，检查当前ref是否在v-for指令下，el.refInFor = true
* 6. processSlotContent，处理slot，el.slotScope = slotScope，如果是template标签的slot，提示scope属性变更为slot-scope，v-for和slot-scope不要混用，提升v-for层级包裹slot-scope
* 7. 获取slot，el.slotTarget = slotTarget，如果不存在也就是匿名插槽即默认插槽，则处理为el.slotTarget = 'default'
* 8. 如果存在下面这种情况
*    <child>
*      <div slot-scope>显示div</div>  // 会被当成默认插槽  p标签将被丢弃 除非挂载上具名插槽
*      <p>显示p</p>
*    </child>
*    上面这段的处理代码在closeElement中，如果有slotScope，且slotTarget不存在 则当做默认default，而且后面同样带有slot-scope的匿名插槽的会覆盖前面的
*    if (element.slotScope) {
*       const name = element.slotTarget || '"default"'
*       ;(currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element
*     }
* 9. slotTargetDynamic是否为具名插槽，如果有slot属性，且tag!==template&&不存在slot-scope则当做原生属性处理
* 10. 如果插槽标签!==template&&不存在slotScope，会把slot当做原生属性保留一份，作用不明
* 11. @2.6之后的slot新语法v-slot，如果存在v-slot和slot-scope不能混用，新语法就是v-slot:user="scope"这种用法，
* 12. 新语法的适用标签只有template&自定义组件，在组件上使用slot表示组件中包裹的内容即为默认插槽的内容，如果组件上定义了插槽，内部又出现template且设置具名插槽类似这种<template v-slot:xxx>，则这种混用会报警，因为会出现作用域模糊的情况
*     上述判断的实现，在closeElement子标签的时候如果检测到slotScope，则自动在它的parent挂载scopedSlots，在closeEldment父级的时候，
*     处理slotScope，scopedSlots不为空对象，判断已经存在具名，从源码上看，只要组件下面有其他插槽内容，都会告警，表示有其它插槽，需要用template写法解决这种问题
* 13. scopedSlots储存新语法的slot集合
* 14. 包装一个slotContainer = {
*   slotTarget: name                  // v-slot:name
*   slotTargetDynamic: dynamic        // v-slot:[name]  dynamic = true
*   children: [...]                   // el.children处理过滤旧语法的slot相关children，el的child元素父级指向slotContainer
* }
* 15. processSlotOutlet处理<slot>标签，el.slotName="name" 提示不能把key属性放在该标签上，该标签实际上可能展开成复合标签内容
* 16. processComponent处理组件属性，获取:is或者inline-tempate属性，el.component = bingding，el.inlineTemplate = true
* 17. transforms依次执行，当前只有一个transform，src/platforms/web/compiler/class.js文件的transformNode方法，获取class属性信息，丢弃语法提示class="{{val}}"，现语法:class="val"
* 18. transformNode 
*     (1). 获取普通class属性，标记el.staticClass = JSON.stringify(staticClass)，获取:class或者v-bind:class，el.classBingding = classBinding
*     (2). 获取普通style属性，标记el.staticStye = JSON.stringify(staticStyle)，获取:style或者v-bind:style，el.styleBingding = styleBingding
* 19. 调用processAttrs处理各种指令，具体查看 #### 3.2.5 processAttrs的处理内容
* 20. 开始处理特殊情况 !stack.length && element !== root，这种情况如下
*   (1). template: `
*     <div v-if="showMain"></div>
*     <div v-else-if="showMiddle"></div>
*     <div v-else></div>
*   `,
*    允许这样的情况存在，如果没有if或者其他条件表达式，则会进行报错，只能容许一个根元素，
*    el.ifConditions = [
*       {
*         exp: 'showMiddle',
*         block: el
*       }
*    ]
*   (2). 这种情况也需要检查根元素的合法性，也就是把挂载条件表达式的标签调用checkRootConstraints检查合法性，不能为slot，template标签，不能在for循环中
* 21. 处理条件语句，如果当前父级存在且当前el不是forbidden元素，调用processIfConditions处理，详情请查看 #### 3.2.9 processIfConditions处理内容
* 22. 接下来就是我们之前提过的，如果element.slotScope，则会在其父级加上一个scopedSlots来保存相关信息
* 23. 当el压入父级children，当前element.parent = currentParent
* 24. element.children = element.children.filter(c => !(c: any).slotScope)，把<slot></slot>这种占标签删除
* 25. trimEndingWhitespace(element)再次清理结尾textnode节点
* 26. 修改当前节点范围内的inVPre和inPre的标识
* 27. postTransforms遍历调用处理el，不过web平台下为空数组
* */

```

#### 3.2.5 processAttrs的处理内容


![processAttrs流程示意图](https://user-gold-cdn.xitu.io/2019/12/13/16efade2d665e1df?w=1459&h=990&f=png&s=63458)

```javascript
/**
* 1. 属性列表的process处理流程
* 2. 循环遍历属性列表，匹配指令正则，如果没有匹配到，则当做原生属性来处理，stringify(value)，如果没匹配到指令且value中存在{{}}这种语法，提示告警
* 3. 如果匹配中了，el.hasBindings = true
* 4. 匹配属性名称中的修饰符，.once  .enter .passive等，经过parse返回后结果类似 {once: true, passive: true}
* 5. 处理.prop修饰符标记，关于prop修饰符，可查看这篇文章，https://segmentfault.com/a/1190000012820563，不想在html中暴露数据或者不想污染html，直接实现和props一样的效果可以用.prop修饰符，后续还需要深入了解
* 6. 匹配v-bind&:语法，如果命中，处理parseFilters，filter的处理过程可以查看  3.2.6
* 7. 判断是否为v-bind:[xx]形式，如果是，则isDynamic = true
* 8. 如果匹配到v-bind且没有找到表达式，提示绑定expression不能为空，也就是v-bind:xxx=""非法
* 9. 接下来处理存在修饰符的情况
* 10. 如果有prop修饰符且不是动态类型，则需要进行驼峰处理，特殊情况innerHtml需要特殊处理成innerHTML
* 11. 如果有camel，需要处理name为驼峰类型
* 12. 如果有sync修饰符，调用src/platform/web/directives/model.js文件的degenAssignmentCode解析表达式，
*    设 v-bind:xxx.sync="user"，则解析后生成 `user=$event`
*    设 v-bind:xxx.sync="user.username"或者v-bind:xxx.sync="user['username']"，则解析后生成 `$set(user, "username", $event)`
*    设 v-bind:xxx.sync="user.username"或者v-bind:xxx.sync="user.info.address" 则解析后生成 `$set(user.info, "address", $event)`
*    这一套解析过程可以看 #### 3.2.7 parseModel的处理内容
* 13. parseModel之后调用addHandler处理，addHandler的处理过程请看  #### 3.2.8 addHandler的处理内容
* 14. addHandler处理完之后，判断是有有.prop修饰符，或者不是自定义组件且平台相关必须为prop的属性，调用addProp处理，
*   (1). 假设 <child v-bind:surname.prop="surname">，
*   el.props = [
*     {
*        dynamic: false,
*        end: 78,
*        name: "surname",
*        start: 49,
*        value: "surname"
*     }
*   ]
*   // 这边还有些疑问 后续补充
*   (2). 什么叫平台标签必须props处理的呢，比如input的value就必须当做props处理 <input v-bind:value="surname">，对原生对象的prop绑定，propertity，不是自定义组件的props，也就是如下
*     let input = document.getElementByTag('input')
*     input.value = surname，surname与value强绑定 === 关系
*   (3). 假设<div v-bind:surname="surname"></div>
*   el.attrs = [
*     {
*        dynamic: false,
*        end: 78,
*        name: "surname",
*        start: 49,
*        value: "surname"
*     }
*   ]
* 15. 匹配事件监听指令，调用addHandler
* 16. 自定义指令解析，包括v-，或者@开头的属性，调用addDirective
*   (1). 假设<div v-pin="200"></div>
*   el.directives = [
*      arg: null,
*      end: 48,
*      isDynamicArg: false,
*      modifiers: undefined,
*      name: "pin",
*      rawName: "v-pin",
*      start: 37,
*      value: "200"
*   ]
* 17. 如果碰到v-model，进行v-model在for中的一个校验，
*   (1). 假设<div v-for="item in list"><child v-model="item"></div>，这样会导致一个告警，v-model不可以直接修改 v-for循环迭代时别名上的数据, 但是, 可以通过index下标来引用所需的数据, 可以达到相同目的
*   (2). 可以改成<div v-for="item, index in list"><child v-model="list[index]"></div>
* */

```

#### 3.2.6 parseFilters的处理内容

```javascript

/**
* 咱们以这个为例子想玲解析过程<h1 v-bind:xx="('haha' || yyy) | formatValue">todos</h1>
* 1. exp = ('haha' || yyy) | formatValue
* 2. i = 0, paren ++
* 3. i = 1, inSingle = true
* 4. i = 2, 3, 4, 5 haha
* 5. i = 6, inSingle = false
* 6. i = 7, c = '  inSingle = false
* 7, i = 8, 普通空格 
* 8, i = 9, i = \ 但是 i + 1 = | 不符合前后不为pipe的情况  所以不是管道符
* 9, i = 10, 11, 12, 13, 14, 15 = | yyy
* 10, i = 16, )  paren --   paren表示括号计数  此时 = 0
* 11, i = 17 普通空格
* 12, i = 18 |  前后没有管道符  此时括号 总括号  数组括号等计数为0  条件成立 获取expression = ('haha' || yyy)  此时expression结束undefined状态  下一次在匹配到  就是确实filter了
* 13, i = 19, 20, 21...29 结束循环匹配  各种计数也归零 inSingle等为false  如果expression不为undefined  则剩下的lastFilterIndex到i之间的string就是filter表达式
* 14, 上面没有列举多层filter的情况  如果有 则会在循环中处理中间的filter  末尾处理最后的filter  pushFilter
* */

/**
* 1. 在parseFilter处理后 调用wrapFilter输出解析内容
* 2. 假设模板 = <h1 v-bind:xx="('haha' || yyy) | formatValue | formatSize">todos</h1>
* 3. return _f("formatSize")(_f("formatValue")(('haha' || yyy)))
* 4. 解析后回到parseAttrs，得到value=_f("formatSize")(_f("formatValue")(('haha' || yyy)))
* */

```

#### 3.2.7 parseModel的处理内容


- 原注释，parseModel就是对下面几种情况的处理

```javascript

/**
 * Parse a v-model expression into a base path and a final key segment.
 * Handles both dot-path and possible square brackets.
 *
 * Possible cases:
 *
 * - test
 * - test[key]
 * - test[test1[key]]
 * - test["a"][key]
 * - xxx.test[a[a].test1[key]]
 * - test.xxx.a["asa"][test1[key]]
 *
 */

```
```javascript

/**
* 1. 第一部分解析，val.indexOf('[') < 0 || val.lastIndexOf(']') < len - 1的情况有下面几种
*   (1). 没有[]这两个字符，也就是全是点操作符的情况，v-bind:xxx.sync="user.userinfo.useraddress.addressName"，解析结果=`$set(user.userinfo。useraddress, "addressName", $event)`
*   (2). 或者]不在结尾位置，也就是这种情况，v-bind:xxx.sync="user.userinfo[xxx].useraddress"，解析结果=`$set(user.userinfo[xxx], "useraddress", $event)`
* 2. 第二部分解析1，假设v-bind:xxx.sync="user[userinfo][address]"
*   (1). 当前游标index = 0，index < len，未结束，遍历下一个字符，不是双引号或者单引号，开始方括号的处理
*   (2). 遇到方括号时，parseBracket(chr)，标记inBracket = 1，表示在方括号之间，标记expressionPos=index，表达式起始位置，继续匹配，如果遇到左方括号，inBracket+1，反之inBracket-1，
* 3. 第二部分解析2，假设v-bind:xxx.sync="user[userinfo][address]"
*   (1). 第一个左方括号和上面处理相似，第二个重新计数expressionPos = index，重新定位表达式的位置，找到对应右方括号索引，截取之间的内容作为表达式，解析结果=`$set(user[userinfo], useraddress, $event)`
* 4. 第二部分解析3，假设v-bind:xxx.sync="user[userinfo[xx]]"，
*   (1). 左方括号开始遇见一个左加一，遇见一个右减一，所以解析结果=`$set(user, userinfo[xx], $event)`
* 5. 第二部分解析4，带有双引号或者单引号的情况，总结规律就是，并没有对它们做特殊处理，只是调用工具方法parseString，使更高效的找到另一个相对应的双引号或者单引号，向右移动游标，这样省去了部分字符进入是否为方括号的判断
* 6. 总结
*   (1). 找出操作的目标对象，并以结尾部分作为key，事件$event作为辅助，调用$set方法进行刷新，
*   (2). parseString对性能方面的考虑比较深
*   (3). `$set(目标对象, key, $event)`
* */

```

#### 3.2.7 addHandler的处理内容

```javascript

/**
* 1. 检查如果passive和prevent两种修饰符同时出现，告警提示，passive告诉浏览器在用户自定义的事件处理handler中不会出现prevent处理逻辑，可以不用等用户的自定义handler处理完成再冒泡，而是直接事件冒泡，提供给外层的事件监听者，一定程度上有性能优势
* 2. 鼠标右键修饰符.right，
*    (1). name = contextmenu
*    (2). dynamic  name = (xx)==='click'?'contextmenu':(xx)
* 3. 鼠标middle修饰符
*    (1). name = mouseup
*    (2). dynamic name = (xxx)==='click'?'mouseup':(xxx)     // 鼠标middle为mouseup事件
* 4. capture修饰符，事件捕获由外到内 name = !click
* 5. once一次性事件监听 name = ~click
* 6. passive  name = &click
* 7. 如果有.native修饰符 el.nativeEvents收集handler，否则el.events收集handler
* 8. 假设<div @click.right="handlerClick">，新建handler，
*   newHandler = {
*     value: 'handleClick',
*     modifiers: modifiers,
*     dynamic
*   }
* 9. 如果events原有挂载，则在其基础上扩展，有important字段的放置顺序靠前
* 10. el.plain = false，有这么多修饰符，也不能称作纯净的节点了
* */

```

#### 3.2.8 查看.sync的具体调用addHandler

```javascript

/**
* 1. 假设 <div v-bind:user.sync="user">，
*   el = {
*     ...,
*     events: {
*       'update:user': {
*         end: 11,
*         start: 11,
*         value: 'user=$event'
*       },
*       plain: false
*     }
*   }
* 2. 假设 <div v-bind:[user].sync="user">，
*   el = {
*     ...,
*     events: {
*       '"update:"+(surname)': {
*         dynamic: true,
*         end: 11,
*         start: 11,
*         value: 'user=$event'
*       },
*       plain: false
*     }
*   }
* 3. 假设 <div v-bind:say-hi.sync="user">，
*   el = {
*     ...,
*     events: {
*       'update:say-hi': {
*         end: 11,
*         start: 11,
*         value: 'user=$event'
*       },
*       'update:sayHi': {
*         end: 11,
*         start: 11,
*         value: 'user=$event'
*       },
*       plain: false
*     }
*   }
* */

```

#### 3.2.9 processIfConditions处理内容

```javascript

/**
* 1. 假设
*     <div v-if="showMain"></div>                     // el1
*     <div v-else-if="showMiddle" el="middle"></div>  // el2
*     <div v-else-if="showBottom" el="bottom"></div>  // el3
*     <div v-else></div>                              // el4
*     (1). processIfConditions(el2)，查找父级然后往前找兄弟节点(v-if节点必然在其兄弟节点且当前兄弟节点们一定是顺序靠前的标签，后面的还没解析)，
*       如果找到if标记，则是一套条件表达式的初始位置，在该兄弟节点上加上el1.ifConditions = [{exp: showMiddle, block: el1}]
*     (2). 在查找兄弟节点的过程中，如果有找到v-if和v-else-if之间的内容，将会被忽略且告警
*     (3). 如果没有找到对应的含有if条件的兄弟节点，找不到匹配的条件块告警
* */

```

#### 3.2.10 html-parser调用chars的执行过程

```javascript

/**
* 1. 如果不存在currentParent && text === template，则表示没有根节点，只有text文本，告警
* 2. 如果不存在currentParent && text = text.trim()，告警在根元素之外的文本内容将被忽略
* 3. 几种情况的区分处理
*   (1). 如果在pre标签内部，且父级是style或者script，保留原始text，否则编码text内容
*   (2). 如果父级children不存在，就是一个末尾空节点，text = ''
*   (3). 如果需要保留空字符，text = preserveWhitespace ? ' ' : ''
* 4. 经过上面处理，如果text !== ''，
*   (1). 不在Pre标签内的，处理parseText，解析双中括号表达式，关于parseText处理内容，可以查看 
*   (2). 第二种情况是生成文本节点 {type: 3, text}
* */

```

#### 3.2.10 parseText处理内容

```javascript

/**
* 1. 先进行正则构建，如果用户提供了就用用户的，否则使用{{}}匹配
* 2. 假设 <p>客户姓名: {{username}},客户昵称:{{nickname}},soso</p>
*   (1). 定义游标index，match匹配到了{{username}}，此时lastIndex = 0与index之间的内容为 = 客户姓名: ，rasTokens和tokens都保存一份相关内容
*   (2). 调用parseFilters来处理match，tokens.push(`_s(${exp})`)，rawTokens.push({ '@binding': exp })，重新设置lastIndex = index + match[0].length
*   (3). 没有再匹配到{{}}时，比较lastIndex和text的长度，确认结尾有text内容，继续保存一份
*   (4). 综上
*     tokens = [
*        0: ""客户姓名: ""
*        1: "_s(username)"
*        2: "",客户昵称:""
*        3: "_s(nickname)"
*        4: "",soso""
*     ]
*     rasTokens = [
*        0: "客户姓名: "
*        1: {@binding: "username"}
*        2: ",客户昵称:"
*        3: {@binding: "nickname"}
*        4: ",soso"
*     ]
* */

```

#### 3.2.10 html-parser调用comment的执行过程

```javascript

/**
* 1. 当成普通文本节点处理，加上了isComment标识
* */

```


## 4. optimize优化相关

> 关于ast树的再次处理，打上特殊标识，为后面的渲染优化铺垫

```javascript

/**
* 1. 调用markStatic，node.static = isStatic(node)，判断当前节点是否为静态节点，循环递归遍历children中的元素，如果其中一个child不为静态节点则父节点node.isStatic = false，同样的处理node.ifConditions
* 2. 判断是否为静态节点的方法，isStatic，node.type === 2表示有表达式，不为静态节点，node.type === 3纯文本节点，静态节点，
*    (1). node.pre的为静态节点，动态节点有如下情况
*         node.hasBindings &&                        // dynamic bindings
*         node.if &&                                 // if
*         node.for &&                                // v-if or v-for or v-else
*         isBuiltInTag(node.tag) &&                  // not a built-in
*         isPlatformReservedTag(node.tag) &&         // not a component
*         !isDirectChildOfTemplateFor(node) &&       // 向上寻找父级标签是否为template
*         Object.keys(node).every(isStaticKey)       // 是否全部属性都是静态属性
*    (2). 理论上我觉得每个node有个static标记就可以了确定静态渲染所需的节点数据了，不过作者加上了markStaticRoots，子树根节点静态标记
*    (3). 注释的意思是，如果节点本身静态，但是children长度为1且唯一节点类型为纯文本，则不用缓存了直接重新渲染收益会比缓存好，没测试过
* 3. 总结一下，优化器就是给每个节点打上静态或者非静态标记   
* */

function isStatic (node: ASTNode): boolean {
  if (node.type === 2) { // expression
    return false
  }
  if (node.type === 3) { // text
    return true
  }
  return !!(node.pre || (
    !node.hasBindings && // no dynamic bindings
    !node.if && !node.for && // not v-if or v-for or v-else
    !isBuiltInTag(node.tag) && // not a built-in
    isPlatformReservedTag(node.tag) && // not a component
    !isDirectChildOfTemplateFor(node) &&
    Object.keys(node).every(isStaticKey)
  ))
}

function markStatic (node: ASTNode) {
  // 判断节点本事是否静态节点
  node.static = isStatic(node)
  if (node.type === 1) {
    // do not make component slot content static. this avoids
    // 1. components not able to mutate slot nodes
    // 2. static slot content fails for hot-reloading
    if (
      !isPlatformReservedTag(node.tag) &&
      node.tag !== 'slot' &&
      node.attrsMap['inline-template'] == null
    ) {
      return
    }
    for (let i = 0, l = node.children.length; i < l; i++) {
      const child = node.children[i]
      markStatic(child)
      // 如果子节点不满足静态要求 回溯到父节点也应该非静态节点
      if (!child.static) {
        node.static = false
      }
    }
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        const block = node.ifConditions[i].block
        markStatic(block)
        if (!block.static) {
          node.static = false
        }
      }
    }
  }
}

```

<br>
<br>
如果可以，请喝杯咖啡，ヾ(≧▽≦*)o

![](https://user-gold-cdn.xitu.io/2019/12/13/16efafe4704796ea?w=287&h=288&f=jpeg&s=41747)