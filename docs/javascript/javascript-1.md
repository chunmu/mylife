# javascript


## void 0与undefined比较

```javascript

var a  = arguments[0] !== (void 0 ) ? arguments[0] : 2;

// undefined可以被重写 局部作用域中可以
// void是一个运算符  可以对任何表达式运算求值 void不能被重写
// void 后面跟任何表达式都会得到undefined 0 是最短表达式
// 很多压缩工具void 0可以代替undefined  省了部分字节。。。

```


## AMD,UMD,CMD,CommonJS,ES6module


### commonJS

- 特点

1、模块可以多次加载，但是只会在第一次加载时运行一次，然后运行结果就被缓存了，以后再加载，就直接读取缓存结果。要想让模块再次运行，必须清除缓存。
2、模块加载会阻塞接下来代码的执行，需要等到模块加载完成才能继续执行——同步加载。
3、服务器环境，nodejs的模块规范是参照commonJS实现的
4、导入：require('路径')
5、module.exports和exports
6、module.exports和exports的的区别是exports只是对module.exports的一个引用，相当于Node为每个模块提供一个exports变量，指向module.exports。这等同在每个模块头部，有一行var exports = module.exports;这样的命令

```javascript

// a.js
// 相当于这里还有一行：var exports = module.exports;代码
exports.a = 'Hello world';  // 相当于：module.exports.a = 'Hello world';

// b.js
var moduleA = require('./a.js');
console.log(moduleA.a);     // 打印出hello world

```

### AMD

- 特点

1. 异步加载
2. 管理模块之间的依赖性，便于代码的编写和维护
3. 浏览器环境 requireJS是参照AMD规范实现的
4. 导入：require(['模块名称'], function ('模块变量引用'){// 代码});
5. 导出：define(function (){return '值');


```javascript

// a.js
define(function (){
　　return {
　　　a:'hello world'
　　}
});
// b.js
require(['./a.js'], function (moduleA){
    console.log(moduleA.a); // 打印出：hello world
});

```

### CMD

- 特点

1. CMD是在AMD基础上改进的一种规范，和AMD不同在于对依赖模块的执行时机处理不同，CMD是就近依赖，而AMD是前置依赖
2. 浏览器环境 seajs是参照UMD规范实现的，requireJS的最新的几个版本也是部分参照了UMD规范的实现
3. 导入：define(function(require, exports, module) {});
4. 导出：define(function (){return '值');


```javascript

// a.js
define(function (require, exports, module){
　　exports.a = 'hello world';
});
// b.js
define(function (require, exports, module){
    var moduleA = require('./a.js');
    console.log(moduleA.a); // 打印出：hello world
});

```


### UMD

- 特点

1. 兼容AMD和commonJS规范的同时，还兼容全局引用的方式
2. 浏览器或服务器环境 
3. 无导入导出规范，只有如下的一个常规写法：

```javascript

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        //AMD
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        //Node, CommonJS之类的
        module.exports = factory(require('jquery'));
    } else {
        //浏览器全局变量(root 即 window)
        root.returnExports = factory(root.jQuery);
    }
}(this, function ($) {
    //方法
    function myFunc(){};
    //暴露公共方法
    return myFunc;
}));

```

<br>
<br>
<br>

### ES6 module

- 特点

1. 按需加载（编译时加载）
2. import和export命令只能在模块的顶层，不能在代码块之中（如：if语句中）,import()语句可以在代码块中实现异步动态按需动态加载
3. 浏览器或服务器环境（以后可能支持）ES6的最新语法支持规范
4. 导入：import {模块名A，模块名B...} from '模块路径'
5. 导出：export和export default
6. import('模块路径').then()方法
7. export只支持对象形式导出，不支持值的导出，export default命令用于指定模块的默认输出，只支持值导出，但是只能指定一个，本质上它就是输出一个叫做default的变量或方法。


```javascript

/*错误的写法*/
// 写法一
export 1;

// 写法二
var m = 1;
export m;

// 写法三
if (x === 2) {
  import MyModual from './myModual';
}

/*正确的三种写法*/
// 写法一
export var m = 1;

// 写法二
var m = 1;
export {m};

// 写法三
var n = 1;
export {n as m};

// 写法四
var n = 1;
export default n;

// 写法五
if (true) {
    import('./myModule.js')
    .then(({export1, export2}) => {
      // ...·
    });
}

// 写法六
Promise.all([
  import('./module1.js'),
  import('./module2.js'),
  import('./module3.js'),
])
.then(([module1, module2, module3]) => {
   ···
});

```

<br>
<br>
<br>
<br>

## js宏任务微任务,promise&setTimeout

### js运行机制

- 执行栈 

存储函数调用的栈结构，先进后出

- 主线程 

现在正在执行栈中的某个事件

- Event Loop

    - 执行栈选择最先进队列的宏任务 一般是script，执行其中同步代码直至结束
    - 检查是否存在微任务，有则执行微任务队列至其为空
    - 如有必要 会执行dom操作  dom操作修改也是同步任务  渲染是异步
    - 开始下一轮tick，执行宏任务中的异步代码

- 宏任务

    - 宿主(node，浏览器)发起的任务
    - es6称为task
    - script,settimeout,setInterval,I/O,UI rendering,postMessage,MessageChannel,setImediate

- 微任务

    - js引擎发起的任务
    - 在ES6称为jobs
    - Promise，MutaionObserver,process.nextTick

- 结论 

执行完一轮宏任务后，执行微任务，再继续下一轮宏任务，微任务，setTimeout放置在下一轮宏任务中  所以promise执行快