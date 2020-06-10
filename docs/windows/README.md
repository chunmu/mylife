# windows

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
