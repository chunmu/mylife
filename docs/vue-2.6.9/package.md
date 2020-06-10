# package

> 以package.json中的命令作为分析入口

### npm run dev

> 开局 启动开发

```javascript

// 开始rollup打包 监听文件
rollup -w -c scripts/config.js --environment TARGET:web-full-dev

```

### rollup & webpack的使用场景

> 打包工具rollup

- rollup

偏向于js库，如果只是js代码，希望做es转换模块解析，一次性加载所有资源，剔除冗余代码（webpack也有这个功能）,比较专注

- webpack

偏向于前端工程应用级，UI库等，涉及到css,html,图片等复杂场景和代码拆分，扩展性强，插件机制完善