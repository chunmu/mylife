(window.webpackJsonp=window.webpackJsonp||[]).push([[22],{344:function(t,a,s){"use strict";s.r(a);var n=s(33),e=Object(n.a)({},(function(){var t=this,a=t.$createElement,s=t._self._c||a;return s("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[s("h2",{attrs:{id:"_1-构造compiler"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1-构造compiler"}},[t._v("#")]),t._v(" 1. 构造compiler")]),t._v(" "),s("blockquote",[s("p",[t._v("这一段比较绕，主要是包装compile，最终暴露出compile本身以及包装后的compileToFunctions")])]),t._v(" "),s("h3",{attrs:{id:"_1-1-compiler和compiletofunctions的基础basecompile"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1-1-compiler和compiletofunctions的基础basecompile"}},[t._v("#")]),t._v(" 1.1 compiler和compileToFunctions的基础baseCompile")]),t._v(" "),s("blockquote",[s("p",[t._v("它是对src/compiler包下暴露出的核心parse进行初步包装，我们知道parse传入template，返回的是ast语法树，此时生成的render，staticRenderFns是一个代码块字符串，可以用作外部使用的方法体")])]),t._v(" "),s("div",{staticClass:"language-javascript extra-class"},[s("pre",{pre:!0,attrs:{class:"language-javascript"}},[s("code",[t._v("\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("function")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("baseCompile")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token parameter"}},[t._v("template"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" string"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n  options"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" CompilerOptions")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" CompiledResult "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" ast "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("parse")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("template"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("trim")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" options"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("         "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 前一篇讲的parse，输出ast树")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("options"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("optimize "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("!==")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("false")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("                   "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 如果需要进行优化，执行优化器，把ast树入参进行优化")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("optimize")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("ast"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" options"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("                            "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 优化过程")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" code "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("generate")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("ast"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" options"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("                 "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 渲染相关的code生成核心，也是我们这篇文章要讲的重点，此时生成的render，staticRenderFns是一个代码块字符串，可以用作外部使用的方法体")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    ast"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    render"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" code"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("render"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("                              "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 生成的渲染代码块 一般作为方法体使用 with(){}相关")]),t._v("\n    staticRenderFns"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" code"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("staticRenderFns             "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 静态相关渲染函数")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n")])])]),s("h3",{attrs:{id:"_1-2-包装basecompile成compile，编译器的功能入口"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1-2-包装basecompile成compile，编译器的功能入口"}},[t._v("#")]),t._v(" 1.2 包装baseCompile成compile，编译器的功能入口")]),t._v(" "),s("blockquote",[s("p",[t._v("执行createCompilerCreator生成器，在baseCompile的基础上包装compile，返回的render是字符串代码块，入参baseCompile，处理baseOptions相关数据")])]),t._v(" "),s("div",{staticClass:"language-javascript extra-class"},[s("pre",{pre:!0,attrs:{class:"language-javascript"}},[s("code",[t._v("\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v('/**\n* 1. copy一份baseOptons，finalOptions = baseOptions，这边我们提一下初始时候的directives，v-text， v-model，v-html\n* 2. 定义errors和tips集合，在编译过程中调用options.warn方法时收集，根据报错level选择压入tips或者errors\n* 3. 按策略合并finalOptions和options\n* 4. 调用baseCompile，返回编译结果\n* 5. 最后对各属性的表达式进行正确性校验，递归检测所有节点，在编译模板过程中侧重的是检查name的合法性，这边是统一检查value的合法性\n*    (1). type = 1的节点，普通el节点，带有属性指令列表等，\n*    (2). 指令匹配，检查for循环中的表达式正确性，  例如v-for="\'item\' in list" v-for="continue in list"，通过这种形式来检测值的合法性new Function(`var ${ident}=_`)\n*    (3). 通用检查表达式合法性，通过new Function(`return ${exp}`)检查关键字和不合法表达式\n*    (4). 事件handler检查，关键字等，有个特殊情况，比如说$delete和delete，会先匹配是否有delete关键字，然后$delete，匹配$字符，$delete，$set等对应的正是第一篇中提到的，实例上的api\n* 6. 此时的compile是提供对外提供的编译功能包\n* */')]),t._v("\n\n")])])]),s("h3",{attrs:{id:"_1-3-包装compile成compiletofunctions"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1-3-包装compile成compiletofunctions"}},[t._v("#")]),t._v(" 1.3 包装compile成compileToFunctions")]),t._v(" "),s("blockquote",[s("p",[t._v("在compile的基础上包装成compileToFunctions，此时获取的render已经是一个方法实例，通过new Function(code)得到")])]),t._v(" "),s("div",{staticClass:"language-javascript extra-class"},[s("pre",{pre:!0,attrs:{class:"language-javascript"}},[s("code",[t._v("\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("/**\n* 1. vue编译模板后转换ast成字符串代码块，需要提供一个执行环境，就是new Function(code)，不过这属于执行动态代码行为，有些浏览器策略会禁止这种形式，还有类似的，比如eval方法，所以要检测报错为浏览器安全策略问题导致vue不可用\n* 2. 这边可以提一下为什么模板中的变量可以直接访问到实例上对应的属性，vue用了with(){}语句，改变作用域\n* 3. 设置模板缓存，避免对编译过的内容再次编译，直接用template本身作为key，是不是属性名称不限制长度呀\n* 4. 开始对编译过程中收集的errors和tips循环输出，也就是开发中的那一堆堆飘红报错统一从这边输出\n* 5. 调用createFunction，通过new Function(compiled.render)构造方法实例，并且步骤相关错误\n* 6. 此时的render，staticRenderFns是一个完整正确的渲染方法，vue挂载的时候调用的正是这两类\n* */")]),t._v("\n\n")])])]),s("h2",{attrs:{id:"_2-开始我们的代码块生成之旅，codegen"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-开始我们的代码块生成之旅，codegen"}},[t._v("#")]),t._v(" 2. 开始我们的代码块生成之旅，codegen")]),t._v(" "),s("blockquote",[s("p",[t._v("上面提到了渲染代码块和方法的生成过程，接下来我们深入到他们的具体生成流程")])]),t._v(" "),s("h3",{attrs:{id:"_2-1-入口方法generate"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-1-入口方法generate"}},[t._v("#")]),t._v(" 2.1 入口方法generate")]),t._v(" "),s("div",{staticClass:"language-javascript extra-class"},[s("pre",{pre:!0,attrs:{class:"language-javascript"}},[s("code",[s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 如果不存在ast，默认生成div dom")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" code "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" ast "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("?")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("genElement")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("ast"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" state"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'_c(\"div\")'")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// render的初始化模板")]),t._v("\nrender"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token template-string"}},[s("span",{pre:!0,attrs:{class:"token template-punctuation string"}},[t._v("`")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("with(this){return ")]),s("span",{pre:!0,attrs:{class:"token interpolation"}},[s("span",{pre:!0,attrs:{class:"token interpolation-punctuation punctuation"}},[t._v("${")]),t._v("code"),s("span",{pre:!0,attrs:{class:"token interpolation-punctuation punctuation"}},[t._v("}")])]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token template-punctuation string"}},[t._v("`")])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 静态渲染函数组初始值[]")]),t._v("\nstaticRenderFns"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" state"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("staticRenderFns\n\n")])])]),s("h3",{attrs:{id:"_2-2-关于template在v-pre下的两个现象"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-2-关于template在v-pre下的两个现象"}},[t._v("#")]),t._v(" 2.2 关于template在v-pre下的两个现象")]),t._v(" "),s("div",{staticClass:"language-html extra-class"},[s("pre",{pre:!0,attrs:{class:"language-html"}},[s("code",[s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("\x3c!--v-pre指令在编译模板的根标签上时\n    全局state.pre为true，\n    不能解析v-pre中的template\n    会以这种形式存在\n    <template>\n       #document-fragment\n    </template>\n    不会展示template下的内容\n    关于文档片段节点 可以查看这里https://www.cnblogs.com/xiaohuochai/p/5816048.html\n    \n    <* 摘抄 javascript提供了一个文档片段DocumentFragment的机制。如果将文档中的节点添加到文档片段中，\n    就会从文档树中移除该节点。把所有要构造的节点都放在文档片段中执行，\n    这样可以不影响文档树，也就不会造成页面渲染。当节点都构造完成后，\n    再将文档片段对象添加到页面中，这时所有的节点都会一次性渲染出来，\n    这样就能减少浏览器负担，提高页面渲染速度\n    *>\n--\x3e")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("div")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("v-pre")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("  \n  "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("div")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("p")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("xxx"),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("p")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("p")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("yyy"),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("p")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("template")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("span")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("{{xxx}}"),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("span")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("template")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("div")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("div")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n\n")])])]),s("div",{staticClass:"language-html extra-class"},[s("pre",{pre:!0,attrs:{class:"language-html"}},[s("code",[s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("\x3c!--v-pre指令在编译模板的根标签上时\n    全局state.pre为false，\n    在处理template时，丢弃template本身，内容作为该节点的children处理\n    <span>中的内容将照正常dom显示\n--\x3e")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("div")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("  \n  "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("div")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("v-pre")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("p")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("xxx"),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("p")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("p")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("yyy"),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("p")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("template")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("span")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("{{xxx}}"),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("span")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("template")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("div")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("div")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n\n")])])]),s("h3",{attrs:{id:"_2-3-静态节点树解析"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-3-静态节点树解析"}},[t._v("#")]),t._v(" 2.3 静态节点树解析")]),t._v(" "),s("p",[t._v("假设接下来是我们要处理html")]),t._v(" "),s("div",{staticClass:"language-html extra-class"},[s("pre",{pre:!0,attrs:{class:"language-html"}},[s("code",[t._v("\n"),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("section")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("class")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("parse-index"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v(":xx")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("xxx"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("div")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("class")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("static-tree"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("              // div1\n    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("div")]),s("span",{pre:!0,attrs:{class:"token style-attr language-css"}},[s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("style")])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('="')]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token property"}},[t._v("height")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" 10px"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("p")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("静态节点p"),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("p")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("p")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("静态节点span"),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("p")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("input")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("value")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("静态节点p"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("/>")])]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("div")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("div")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("section")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n\n")])])]),s("div",{staticClass:"language-javascript extra-class"},[s("pre",{pre:!0,attrs:{class:"language-javascript"}},[s("code",[t._v("\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("/**\n* 1. 很明显div1是静态节点树的根节点\n* 2. staticRoot=true，el.staticProcessed = false，调用genStatic，修改el.staticProcessed = false\n* 3. 遇见一个静态节点树就调用一次genStatic，state.staticRenderFns.push(`with(this){return ${genElement(el, state)}}`)\n* 4. 子节点继续调用genElement正常执行生成流程\n* 5. 改造字符代码块，_m=renderStatic，传入当前staticRenderFns，以及是否在for循环中的标记staticInFor\n*  `_m(${\n*      state.staticRenderFns.length - 1\n*    }${\n*      el.staticInFor ? ',true' : ''\n*    })`\n* 6. 上面的讲述中，略过了genElement的具体过程，可查看  ### 2.4 genElement的处理内容\n* */")]),t._v("\n\n")])])]),s("h3",{attrs:{id:"_2-4-genonce的处理内容"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-4-genonce的处理内容"}},[t._v("#")]),t._v(" 2.4 genOnce的处理内容")]),t._v(" "),s("div",{staticClass:"language-javascript extra-class"},[s("pre",{pre:!0,attrs:{class:"language-javascript"}},[s("code",[t._v("\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("/**\n* 1. 调用genOnce，onceProcessed = true，且流程中中有三个情况分支处理，\n* 2. v-once带有if指令，则先解析if条件，在if中有处理once的情况，完整闭环，细节我们再genIf的时候讲到\n* 3. el.staticInFor如果为true，表示该el为for循环下的静态节点，向上查找节点的key属性，如果没有找到提示once指令只能放置在有key设置的v-for循环内部\n* 4. 如果没有设置key，可以在页面生成，但是会对diff算法产生影响\n* 5. 如果有key属性，返回`_o(${genElement(el, state)},${state.onceId++},${key})`，_o = markOnce\n* 6. 如果没有if条件块也不是在for循环中，则当成是一个静态树形根节点来处理，但是假如里面有实例变量呢，\n*    所以这边所谓的静态渲染方法其实不是说里面的内容一定是没有变量什么的，而是可以有各种实例访问或者不访问都行，但是只执行一次，只是为渲染逻辑提供方便，后续详解这块内容\n* 7. 在这边把once指令中的内容当做静态节点树处理，会渲染一次且可以访问实例上的属性\n* */")]),t._v("\n\n")])])]),s("h3",{attrs:{id:"_2-5-genfor的处理内容"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-5-genfor的处理内容"}},[t._v("#")]),t._v(" 2.5 genFor的处理内容")]),t._v(" "),s("div",{staticClass:"language-javascript extra-class"},[s("pre",{pre:!0,attrs:{class:"language-javascript"}},[s("code",[t._v("\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v('/**\n* 1. 在是组件不是保留标签&&tag !== slot&&tag !== template的情况下，需要设置key属性，用于diff算法，后续会提到\n* 2. 标记forProcessed=true\n* 3. 假设<div v-for="item in list">div</div>将生成这个字符串，_l((list),function(item){return _c(\'div\',[_v("div")])})\n*   (1). 其中_l = renderList，_c = createElement，_v = createTextVNode\n*   (2). 有个细节，_l((list), ...)，括号包裹list，这就成了个表达式，会执行(list)，对应的情况就是list不一定是一个现成的结果对象或数组，有可能是一个computed中声明的对象需要执行get才能拿到具体值，或者是个方法，返回结果才是我们预期的循环目标\n* 4. 假设<child v-for="item in list">div</child>将生成这个字符串，_l((list),function(item){return _c(\'child\',[_v("div")])})\n* 5. 上面示例中我们没有带上迭代器，<child v-for="item, key, index in list">div</child>\n*     将得到_l((obj),function(item,key,index){return _c(\'child\',[_v("div")])})，多了一个参数组装部分，在renderList的参数方法中加上了迭代参数function(item,key,index)\n* 6. 接下来继续执行genElement，包装返回结果\n* */')]),t._v("\n\n")])])]),s("h3",{attrs:{id:"_2-6-genif的处理内容"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-6-genif的处理内容"}},[t._v("#")]),t._v(" 2.6 genIf的处理内容")]),t._v(" "),s("div",{staticClass:"language-javascript extra-class"},[s("pre",{pre:!0,attrs:{class:"language-javascript"}},[s("code",[t._v("\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("/**\n* 1. el.ifProcessed = true\n* 2. 执行genIfConditions，传入el.ifConditions.slice()，截取副本入参\n* 3. 如果conditions长度为0，则'_e()'，创建空节点\n* 4. 例子正常的if-else\n*    <div v-if=\"showIf\">if</div>\n*    <div v-else-if=\"showElseIf\">if</div>\n*    <div v-else>else</div>\n*    该例中，conditions=[{exp:'showIf'}, {exp: 'showElseIf'}, {exp: undefined}]，\n*    处理第一个元素时，(showIf)?_c('div',[_v(\"if\")]):...\n*    将会执行(showIf)表达式，选择前半部分或者后半部分渲染内容\n*    处理完第二个元素时，(showIf)?_c('div',[_v(\"if\")]):(showElseIf)?_c('div',[_v(\"if\")]):_c('div',[_v(\"else\")])，构造三元表达式来执行选择性渲染\n* 5. 如果带有v-once指令，渲染方法替换成_m=markOnce，like (a)?_m(0):_m(1)\n* */")]),t._v("\n\n")])])]),s("h3",{attrs:{id:"_2-7-genslot的处理内容"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-7-genslot的处理内容"}},[t._v("#")]),t._v(" 2.7 genSlot的处理内容")]),t._v(" "),s("div",{staticClass:"language-javascript extra-class"},[s("pre",{pre:!0,attrs:{class:"language-javascript"}},[s("code",[t._v("\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("/**\n* 1. 解析el.tag === 'slot'的情况，const slotName = el.slotName || '\"default\"'\n* 2. 有可能<slot><div>div</div></slot>，如果没有在外层指定插槽内容，则会显示它自带的内容\n* */")]),t._v("\n\n")])])]),s("h3",{attrs:{id:"_2-8-genprops的处理内容"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-8-genprops的处理内容"}},[t._v("#")]),t._v(" 2.8 genProps的处理内容")]),t._v(" "),s("div",{staticClass:"language-javascript extra-class"},[s("pre",{pre:!0,attrs:{class:"language-javascript"}},[s("code",[t._v("\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v('/**\n* 1. 分成静态属性和动态属性处理，在浏览器环境下，字符串表达式不允许换行，需要transformSpecialNewlines转换\n* 2. 例子\n*    <div userpassword="123445"></div>\n*    <div :[username]="className"></div>\n*    <div :username="className"></div>\n*    <input :value.prop="className"></input>\n*   (1). {"userpassword":"123445"} \n*   (2). _d({},[username,className])          // _d = bindDynamicKeys绑定动态key\n*   (3). {"username":className}\n*   (4). {"value":className}\n*   生成的拼接语句\n*   (1). 一种是attrs相关的，attrs:{"username":className},\n*   (2). 一种是domprop相关的，domProps:{"value":className},\n*   (3). 一种是对应动态属性名称的，_b({},"div",_d({},[username,className]))，这边已经涉及到我们genData的内容了\n* */')]),t._v("\n\n")])])]),s("h3",{attrs:{id:"_2-9-gencomponent属性数据的处理"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-9-gencomponent属性数据的处理"}},[t._v("#")]),t._v(" 2.9 genComponent属性数据的处理")]),t._v(" "),s("div",{staticClass:"language-javascript extra-class"},[s("pre",{pre:!0,attrs:{class:"language-javascript"}},[s("code",[t._v("\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("/**\n* 1. 如果el.component=true，执行genComponent解析\n* 2. 如果是非内联模板，则调用genChildren继续解析，children来源在这里\n*         if (element.slotScope) {\n*            // scoped slot\n*            // keep it in the children list so that v-else(-if) conditions can\n*            // find it as the prev node.\n*            const name = element.slotTarget || '\"default\"'\n*            ;(currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element\n*          }\n*          currentParent.children.push(element)\n* 3. 这边不详细解析内部渲染逻辑\n* */")]),t._v("\n\n")])])]),s("h3",{attrs:{id:"_2-10-gendata属性数据的处理"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-10-gendata属性数据的处理"}},[t._v("#")]),t._v(" 2.10 genData属性数据的处理")]),t._v(" "),s("div",{staticClass:"language-javascript extra-class"},[s("pre",{pre:!0,attrs:{class:"language-javascript"}},[s("code",[t._v("\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v('/**\n* 1. 如果el节点不是纯净节点!el.plain，则解析得到data\n* 2. 如果el.inlineTemplate = false，解析子节点，拼接code\n* 3. 生成的data作为_c方法的参数使用，整体表现形式是一个对象字符序列化，在实际执行的时候它就是一个option对象{}\n* 4. 调用genDirectives处理指令相关信息\n* 5. el.key => data += `key:${el.key},`\n* 6. el.ref => data += `ref:${el.ref},`\n* 7. el.refInFor => data += `refInFor:true,`\n* 8. el.pre => data += `pre:true,`\n* 9. el.component => data += `tag:"${el.tag}",`\n* 10. 过一遍state.dataGenFns，处理style，class属性绑定生成\n*  (1). <input class="username-static" :class="dynamicClass"/>  => staticClass:"username-static",class:dynamicClass,\n*  (2). <input style="padding-left: 10px;" :style="dynamicStyle"/> => staticStyle:{"padding-left":"10px"},style:(dynamicStyle),\n* 11. el.attrs => data += `attrs:${genProps(el.attrs)},`\n* 12. el.props => data += `domProps:${genProps(el.props)},`\n* 13. el.events => data += `${genHandlers(el.events, false)},`，genHandler请查看  ### 2.12 genHandlers的处理内容\n* 14. el.nativeEvents => data += `${genHandlers(el.events, false)},`，genHandler请查看  ### 2.12 genHandlers的处理内容\n* 15. el.slotTarget && !el.slotScope  => data += `slot:${el.slotTarget},`\n* 16. genScopedSlots处理内容 查看 ### 2.13 genScopedSlots处理内容\n* 17. 经过上面指令处理，如果存在el.model则包装一遍\n*     data += `model:{value:${\n*        el.model.value\n*      },callback:${\n*        el.model.callback\n*      },expression:${\n*        el.model.expression\n*      }},`\n* */')]),t._v("\n\n")])])]),s("h3",{attrs:{id:"_2-11-genchildren的处理内容"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-11-genchildren的处理内容"}},[t._v("#")]),t._v(" 2.11 genChildren的处理内容")]),t._v(" "),s("div",{staticClass:"language-javascript extra-class"},[s("pre",{pre:!0,attrs:{class:"language-javascript"}},[s("code",[t._v("\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("/**\n* 1. 对el为for循环标记，下属子元素单一的进行优化处理，执行genElement生成代码，并且附带normalizationType，关于子节点规范化类型参数，后续会讲到\n* 2. 非上述情况则对children map处理\n* */")]),t._v("\n\n")])])]),s("h3",{attrs:{id:"_2-11-gendirectives的处理内容"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-11-gendirectives的处理内容"}},[t._v("#")]),t._v(" 2.11 genDirectives的处理内容")]),t._v(" "),s("div",{staticClass:"language-javascript extra-class"},[s("pre",{pre:!0,attrs:{class:"language-javascript"}},[s("code",[t._v("\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v('/**\n* 1. 内建指令 在directives中收集的指令有 cloak html model text，我们把这四种情况拆分讲解\n*   (1). v-html，本质上就是挂载属性innerHTML，`_s(${dir.value})`，_s = toString\n*   (2). v-text，本质上是挂载textContent属性，`_s(${dir.value})`\n*   (3). v-cloak，讲一下我的理解，首先这个指令的作用是屏蔽在vue实例完成编译之前的样式控制，一般用来加样式display，因为在编译完成前的空档会有表达式等原样显示，编译结束后赋值就会有闪烁的情况等，\n*        样式是通过属性选择器完成匹配[v-cloak]{display: none}，那理论上我取什么名字都能有这个效果呀，为啥只能cloak呢，\n*        因为在编译的时候v-xxx这种格式的会被编译成指令，如果没有在指令文件中找到匹配的处理方法的话会报编译错误，而vue中预先定义了cloak的指令内容，虽然方法是个\n*        noop空方法，但是占位置定义了cloak了，这样解析的时候就不会报错了，编译后正常显示内容是因为移除了v-cloak指令属性 **********\n*   (4). v-model，内容比较多，单独列出来\n* 2. v-model，调用model方法，如果el.tag === \'input\' && type === \'file\'，不能使用双向绑定，只读类型\n*   (1). 如果是自定义组件genComponentModel，我们分三种情况给三种结果，其中value="(username)"，expression=""username""\n*  <child v-model="username"></child>              // callback="function ($$v) {username=$$v}"\n*  <child v-model.trim="username"></child>         // callback="function ($$v) {username=(typeof $$v === \'string\'? $$v.trim(): $$v)}"\n*  <child v-model.number="username"></child>       // callback="function ($$v) {username=_n($$v)}"\n*  \n*  <child v-model="username"></child>              // dirs="directives:[{name:"model",rawName:"v-model",value:(username),expression:"username"}]"\n*  <child v-model.trim="username"></child>         // dirs="directives:[{name:"model",rawName:"v-model.trim",value:(username),expression:"username",modifiers:{"trim":true}}]"\n*  <child v-model.number="username"></child>       // dirs="directives:[{name:"model",rawName:"v-model.number",value:(username),expression:"username",modifiers:{"number":true}}]"\n*  \n* */')]),t._v("\n\n")])])]),s("h3",{attrs:{id:"_2-12-genhandlers的处理内容"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-12-genhandlers的处理内容"}},[t._v("#")]),t._v(" 2.12 genHandlers的处理内容")]),t._v(" "),s("div",{staticClass:"language-javascript extra-class"},[s("pre",{pre:!0,attrs:{class:"language-javascript"}},[s("code",[t._v("\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v('/**\n* 1. const prefix = isNative ? \'nativeOn:\' : \'on:\'      // 根据isNative确定代码块前缀\n* 2. 不绑定handler的情况<child @click></child>            // 生成的结果=on:{"click":function($event){}}\n* 3. 绑定handler为数组的情况 <child @do-handler="handlers"></child> handlers=[fn,fn]    // on:{"do-handler":handlers}，这种情况handler解析出来的表达式为"handlers"\n* 4. 真正handlers为数组的例子 <div @click="handlers">div</div>   // 生成的结果on:{"click":handlers}\n* 5. 3和4中的handers这种绑定方式并不是多个handlers数组绑定，只能算是一个普通表达式，后续我给大家找个handlers数组的例子\n* 6. 通过simplePathRE正则匹配判断是否为简单路径的handler方法，也就是类似这种handlClick或者handlerObj.handlClick等这种简单表达式形式 doThis\n*    对应的是这种形式 <div @click="handlerClick">div</div>  输出结果on:{"click":handlerClick}\n* 7. 通过fnExpRE判断是否为方法格式的handler绑定，类似这种<div @click="function () {handlerClick()}">div</div>，结果=on:{"click":function () {handlerClick()}}\n*    对应的是这种形式 <div @click="function () {handlerClick()}">div</div>\n* 8. 通过fnInvokeRE替换剩下的满足simplePathRE，也就是存在方法调用的情况  输出结果=on:{"click":function($event){return handlerClick()}}\n*    对应的是这种形式 <div @click="handlerClick()">div</div>，和6对比一下，区别是啥，调用的时候\n*    (1). 有传递dom原生事件对象$event，无法传自定义参数\n*    (2). 没有有传递dom原生事件对象$event，可以自定义参数传递，但是获取不到$event\n*    (3). 中间那种正好解决这两种的情况，但是不优雅，所提提供了这三种模式<div @click="function (e) {handlerClick(e, \'custom\')}">div</div>\n* 9. 以上情况都是没有带修饰符下的处理，进行第一轮修饰符处理假设\n*    modifierCode map如下\n*       stop: \'$event.stopPropagation();\',\n*       prevent: \'$event.preventDefault();\',\n*       self: genGuard(`$event.target !== $event.currentTarget`),\n*       ctrl: genGuard(`!$event.ctrlKey`),\n*       shift: genGuard(`!$event.shiftKey`),\n*       alt: genGuard(`!$event.altKey`),\n*       meta: genGuard(`!$event.metaKey`),\n*       left: genGuard(`\'button\' in $event && $event.button !== 0`),\n*       middle: genGuard(`\'button\' in $event && $event.button !== 1`),\n*       right: genGuard(`\'button\' in $event && $event.button !== 2`)\n*   假设<input @click.middle="handler1">div</input>  生成这么一个条件表达式if(\'button\' in $event && $event.button !== 1)return null;，对应的键值keys也会被记录下来\n* 10. exact修饰符的处理，系统键[\'ctrl\', \'shift\', \'alt\', \'meta\']过滤出不在这边的键值，输出结果=if($event.ctrlKey||$event.shiftKey||$event.metaKey)return null;\n*     关于exact的作用，就是系统键之间可以做到触发精确的按键事件，具体可以看文档，\n*     一直按着alt + 其他普通键可以触发alt，一直按着alt+shift也可以触发alt，加上exact之后就不会再触发\n* 11. 其他未内置的修饰符key直接push进keys\n* 12. keys遍历组装代码块，<input @keydow.down="handler1">div</input> 输出结果=if(!$event.type.indexOf(\'key\')&&_k($event.keyCode,"down",40,$event.key,["Down","ArrowDown"]))return null;\n*     _k = checkKeyCodes，检查事件与键盘按键事件的对应关系\n* 13. 接下来又是对三种绑定handle类型的对应处理   \n* */')]),t._v("\n\n")])])]),s("h3",{attrs:{id:"_2-13-genscopedslots处理内容"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-13-genscopedslots处理内容"}},[t._v("#")]),t._v(" 2.13 genScopedSlots处理内容")]),t._v(" "),s("div",{staticClass:"language-javascript extra-class"},[s("pre",{pre:!0,attrs:{class:"language-javascript"}},[s("code",[t._v("\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("/**\n* 1. 判断是否需要强制刷新needsForceUpdate 执行containsSlotChild，如果el.type === 1也就是常用节点，tag === 'slot'返回true\n* 2. 如果上述判断还没有确定needsForceUpdate为true，则再进一步判断存在slotScope作用域的需要强制更新\n* 3. 开始map遍历slots生成代码块\n* 4.   <child>\n*         <template v-slot:header>\n*           <span>header</span>\n*         </template>\n*       </child> \n*       生成的结果=scopedSlots:_u([{key:\"header\",fn:function(){return [_c('span',[_v(\"header\")])]},proxy:true}]), `${genScopedSlots(el, el.scopedSlots, state)},\n* */")]),t._v("\n\n")])])])])}),[],!1,null,null,null);a.default=e.exports}}]);