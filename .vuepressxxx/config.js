module.exports = {
  title: '捡到一颗白矮星',
  description: '总是听到自己心跳的声音',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'github', link: 'https://github.com/chunmu' }
    ],
    sidebar: [
      '',
      {
        title: 'vue',
        children: [
          ['/vue/vue-read-1', '第一篇 import vue后发生的事情'],
          ['/vue/vue-read-2', '第二篇 模板解析与ast语法树生成'],
          ['/vue/vue-read-3', '第三篇 构造render'],
          ['/vue/vue-read-4', '第四篇 实例初始化过程'],
          ['/vue/vue-read-5', '第五篇 响应式原理observe'],
          ['/vue/vue-read-6', '第六篇 应用dom渲染'],
        ]
      },
      ['/less/', 'less样式超级'],
      ['/color/', 'color颜色']
    ]
  }
}