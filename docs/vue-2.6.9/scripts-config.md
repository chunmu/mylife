# config


### 指定构建入口文件

- 关于[AMD UMD,CMD,CommonJS,ES6 module](https://segmentfault.com/a/1190000012419990)可以查阅这篇文章

```javascript
  // npm run dev中指定了environment = target:web-full-cjs-dev
  // Runtime+compiler CommonJS规范
  'web-full-cjs-dev': {
    entry: resolve('web/entry-runtime-with-compiler.js'), // 入口文件
    dest: resolve('dist/vue.common.dev.js'),
    format: 'cjs',
    env: 'development',
    alias: { he: './entity-decoder' },
    banner
  },

```

### vars

替换打包中的同名变量值,比如version是一个动态的且在打包时由我们指定
获取package.json中的版本号，在代码中会替换vue.version = version的值
一般是开关类  还有标记类

启动后发现的有 
1. __WEEX__   
2. __WEEX_VERSION__   
3. __VERSION__   
4. process.env.NEW_SLOT_SYNTAX     // 是否使用新的slot语法
5. process.env.VBIND_PROP_SHORTHAND  // 是否启用快捷绑定语法
6. process.env.NODE_ENV  // 当前环境  dev=development   prod=production(生产环境)会移除掉不必要的告警和提示等