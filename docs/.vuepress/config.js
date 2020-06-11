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
      ['/todo/', '要和宝宝要做的一百件事'],
      ['/noagain/', '让宝宝不开心的事情'],
      ['/source/', '资源收集'],
      {
        title: 'vue-2.6.0',
        children: [
          ['/vue-2.6.0/import', 'import vue后发生的事情']
        ]
      },
      {
        title: 'javascript',
        children: [
          ['/javascript/javascript-1', 'javascript基础语法记录'],
          ['/javascript/crossenv', 'cross-env源码分析']
        ]
      },
      ['/less/', 'less'],
      ['/color/', 'color']
    ]
  }
}