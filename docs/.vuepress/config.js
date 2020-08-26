module.exports = {
  base: '/mylife/',
  title: '捡到一颗白矮星',
  description: '总是听到自己心跳的声音',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'github', link: 'https://github.com/chunmu' }
    ],
    sidebar: [
      '',
      ['/myself/', '反思'],
      ['/fenfen/', '时间线'],
      ['/source/', '资源收集'],
      ['/todo/', 'todo'],
      ['/noagain/', '不再发生'],
      {
        title: 'vue-2.6.0',
        children: [
          ['/vue-2.6.0/import', 'import vue后发生的事情'],
          ['/vue-2.6.0/compiler', '模板解析与ast语法树生成'],
          ['/vue-2.6.0/codegen', '代码生成codegen'],
          ['/vue-2.6.0/vm', 'vm实例初始化过程'],
          ['/vue-2.6.0/api', 'vue源码阅读之api解析']
        ]
      },
      {
        title: 'javascript',
        children: [
          ['/javascript/javascript-1', 'javascript基础语法记录'],
          ['/javascript/crossenv', 'cross-env源码分析']
        ]
      },
      {
        title: 'babel',
        children: [
          ['/babel/polyfill', 'polyfill解析'],
          ['/babel/babel-runtime', 'babel-runtime'],
        ]
      },
      ['/less/', 'less'],
      ['/color/', 'color']
    ]
  }
}