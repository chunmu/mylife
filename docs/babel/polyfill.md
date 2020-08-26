# polyfill


> 本质上就是提前使用未被所有浏览器实现的语法，判断当前运行环境是否存在该api，不存在则植入api，称作垫片


```javascript

import 'polyfill';

```

实质上是引入了core-js和generator-runtime两个库集合

```javascript

// Cover all standardized ES6 APIs.
import "core-js/es6";

// Standard now
import "core-js/fn/array/includes";
import "core-js/fn/array/flat-map";
import "core-js/fn/string/pad-start";
import "core-js/fn/string/pad-end";
import "core-js/fn/string/trim-start";
import "core-js/fn/string/trim-end";
import "core-js/fn/symbol/async-iterator";
import "core-js/fn/object/get-own-property-descriptors";
import "core-js/fn/object/values";
import "core-js/fn/object/entries";
import "core-js/fn/promise/finally";

// Ensure that we polyfill ES6 compat for anything web-related, if it exists.
import "core-js/web";

import "regenerator-runtime/runtime";

```

