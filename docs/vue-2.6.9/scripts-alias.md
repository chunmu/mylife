# alias

> 别名设置 在代码中可以直接通过别名导入

```javascript

module.exports = {
  vue: resolve('src/platforms/web/entry-runtime-with-compiler'), // vue 对象文件
  compiler: resolve('src/compiler'), // 编译核心文件
  core: resolve('src/core'), // vue核心文件
  shared: resolve('src/shared'), // 工具包
  web: resolve('src/platforms/web'), // web相关
  weex: resolve('src/platforms/weex'), // weex相关
  server: resolve('src/server'), // ssr相关
  entries: resolve('src/entries'), // 
  sfc: resolve('src/sfc') // 
}

```

