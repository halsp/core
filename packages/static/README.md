# @sfajs/static

sfa 静态资源中间件

- 能够返回静态资源
- 能够匹配单个文件或整个文件夹
- 可以托管静态网站

## 安装

```
npm i @sfajs/static
```

## 快速开始

使用 `startup.useStatic()`

```JS
import "@sfajs/static";
const result = await new SimpleStartup().useStatic().run();
```

或

```JS
import "@sfajs/static";
const result = await new OtherStartup().useStatic().run();
```

`useStatic` 如果不传任何参数，将匹配 `static` 文件夹

## 匹配文件夹

`@sfajs/static` 可以匹配整个文件夹，按文件系统匹配文件，`useStatic` 接收配置参数包含以下参数

#### dir

`@sfajs/static` 会在该文件夹中按访问路径匹配文件

因此你也可以选择使用多个 `dir`参数不同的 `useStatic`

如果不传此参数，默认值为 `static`，即项目下的 `static` 文件夹

#### prefix

url 访问前缀

比如你将图片放在 `static` 文件夹，但想用 `file` 前缀来访问：

`GET file/1.png`, `GET file/2.txt` 等

```JS
const result = await new SimpleStartup()
  .useStatic({
    dir: "static",
    prefix: "file",
  })
  .run();
```

#### encoding

读取文件的格式，此参数将直接影响 `body` 的内容

如在 http 中，该值可保持默认，或设置为 `binary`

在云函数中，该值应设置为 base64

#### file404

`@sfajs/static` 如果找不到匹配的静态文件，会根据此值寻找文件：

- 未设置，进入下一个中间件（如果存在）
- 值为文件相对路径，将查找 `dir` 下的该文件
- 值为 true，将查找 `dir` 下的 `404.html` 文件

#### method

允许的访问方法，可以为字符串 `GET`, `POST` 等访问方法，也可以为数组 `['GET', 'POST', '...']`

不设置将与 `GET` 效果相同

如果值为 `ANY` 或['ANY'] ，将允许任何访问方法

## 匹配文件

`@sfajs/static` 也可以指定单个文件，`useStatic` 接收配置参数包含以下参数

### file

指定文件的相对路径

### reqPath

指定访问路径，如果不设置将与 `file` 参数相同

### encoding

与 `匹配文件夹` 中的参数相同

### method

与 `匹配文件夹` 中的参数相同
