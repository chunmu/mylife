# babel-runtime


### 使用场景

> 不希望引入的垫片修改原生全局api或者属性

1. babel-polyfill是用于提前使用es6之后api的垫片，但是它的本质是改写全局相应api的对象或方法，用core-js实现的一套来运行
2. 这样就会改写全局的api，例如window.Promise，如果我用户有去二次使用或者开发这个全局对象，用到的会是core-js的部分
3. 规避这个问题就是  new Promise()代码开发的时候用到的Promise转换成成core-js中的对应实现，且不修改全局属性
4. 这样就可以忽略宿主环境的各种情况
5. babel-runtime就不会修改全局属性  其实也就是别名处理，编译阶段也是用别名后的api
6. babel-runtime下api包括core-js下的api，具体可以查看文档

```javascript

// index.js
var promise = new Promise;



// 转换后  并没有改写全局，且使用的是core-js中的对象 
import _Promise from "babel-runtime/core-js/promise";  // >>>> 01
var promise = new _Promise();    // >>>> 02


// 要把01行代码转换成02行代码   需要插件
// babel-plugin-transform-runtime
```