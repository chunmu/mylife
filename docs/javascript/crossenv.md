# cross-env

## 大概理解

> 在执行cross-env命令时获取到前置参数，开启子线程处理这些参数

```javascript

node test.js  xxx=xxx  process.env = {xxx: 'xxx', ...}

cross-env  xxx=xxx process.env = {xxx: 'xxx', ...}

// package.json中配置有bin文件 里面存放了js文件 在跑npm或者yarn命令时 执行该js文件
// cross-env 获取argv，cross-env NODE_ENV=production  argv包含NODE_ENV=production
// 获取到后 处理参数 调用子进程处理环境变量 后续的命令执行会沿用inline命令行中已设置好的变量
// 在后续的可执行命令中 node test.js   process.env.NODE_ENV = production
// 在其引用的库spawn也是经过一层跨平台的spawn包装 这个不做介绍

```

```javascript

function crossEnv(args, options = {}) {
  const [envSetters, command, commandArgs] = parseCommand(args)
  const env = getEnvVars(envSetters)
  if (command) {
    const proc = spawn(
      // run `path.normalize` for command(on windows)
      commandConvert(command, env, true),
      // by default normalize is `false`, so not run for cmd args
      commandArgs.map(arg => commandConvert(arg, env)),
      {
        stdio: 'inherit',
        shell: options.shell,
        env,
      },
    )
    process.on('SIGTERM', () => proc.kill('SIGTERM'))
    process.on('SIGINT', () => proc.kill('SIGINT'))
    process.on('SIGBREAK', () => proc.kill('SIGBREAK'))
    process.on('SIGHUP', () => proc.kill('SIGHUP'))
    proc.on('exit', (code, signal) => {
      let crossEnvExitCode = code
      // exit code could be null when OS kills the process(out of memory, etc) or due to node handling it
      // but if the signal is SIGINT the user exited the process so we want exit code 0
      if (crossEnvExitCode === null) {
        crossEnvExitCode = signal === 'SIGINT' ? 0 : 1
      }
      process.exit(crossEnvExitCode) //eslint-disable-line no-process-exit
    })
    return proc
  }
  return null
}

```

## isWindows

```javascript

process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE)

```


## commandConvert 变量替换

> 如果使用一个不存在的变量，类unix脚本解释为空 windows原值使用

```javascript

// In Windows, non-existent variables are not replaced by the shell,
// so for example "echo %FOO%" will literally print the string "%FOO%", as
// opposed to printing an empty string in UNIX. See kentcdodds/cross-env#145
// If the env variable isn't defined at runtime, just strip it from the command entirely


// 从env中获取暂存的变量值
return env[varName] ? `%${varName}%` : ''

```

## 其他一些操作

```javascript

/**
 * This will transform UNIX-style list values to Windows-style.
 * For example, the value of the $PATH variable "/usr/bin:/usr/local/bin:."
 * will become "/usr/bin;/usr/local/bin;." on Windows.
 * @param {String} varValue Original value of the env variable
 * @param {String} varName Original name of the env variable
 * @returns {String} Converted value
 */

// /usr/bin:/usr/local/bin:.
// ; 和 :之间的转换


```
