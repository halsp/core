<p align="center">
  <a href="https://ipare.org/" target="blank"><img src="https://ipare.org/images/logo.png" alt="Ipare Logo" width="200"/></a>
</p>

<p align="center">Ipare - 面向云的现代渐进式轻量 <a href="http://nodejs.org" target="_blank">Node.js</a> 框架</p>
<p align="center">
    <a href="https://github.com/ipare/ipare/blob/main/LICENSE" target="_blank"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="GitHub license" /></a>
    <a href=""><img src="https://img.shields.io/npm/v/@ipare/core.svg" alt="npm version"></a>
    <a href=""><img src="https://badgen.net/npm/dt/@ipare/core" alt="npm downloads"></a>
    <a href="https://nodejs.org/en/about/releases/"><img src="https://img.shields.io/node/v/@ipare/core.svg" alt="node compatibility"></a>
    <a href="#"><img src="https://github.com/ipare/ipare/actions/workflows/test.yml/badge.svg?branch=main" alt="Build Status"></a>
    <a href="https://codecov.io/gh/ipare/ipare/branch/main"><img src="https://img.shields.io/codecov/c/github/ipare/ipare/main.svg" alt="Test Coverage"></a>
    <a href="https://github.com/ipare/ipare/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"></a>
    <a href="https://gitpod.io/#https://github.com/ipare/ipare"><img src="https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod" alt="Gitpod Ready-to-Code"></a>
    <a href="https://paypal.me/ihalwang" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
</p>

## 开始使用

请跟随文档 [ipare.org](https://ipare.org) 📚

## 线上示例

请访问 <http://minimal.ipare.org> 🌈

> 该示例是由 `@ipare/cli` 生成，运行于 [StackBlitz](https://stackblitz.com)，可以在线编辑、运行、调试

## 介绍

<!--intro-->

Ipare 是一个面向云的现代渐进式轻量 <a href="http://nodejs.org" target="_blank">Node.js</a> 框架

可以运行于原生 NodeJS 服务，也可以运行于 serverless

### 渐进式

可以根据项目渐进式安装 Ipare 组件，包括路由、IOC、视图渲染、过滤器、请求管道等等

由于核心思想是中间件和依赖注入，因此 Ipare 的扩展性更强，你可以按需增加更多其他功能，也可以轻量运行小应用

### 多环境运行

Ipare 既可以运行在 serverless，也可以运行在原生 nodejs 服务、微服务等场景

Ipare 原生支持 serverless，作为云函数比其他 nodejs 框架速度更快

### 先进特性

Ipare 源码全部使用 TypeScript 开发，有完善的智能提示

mva 架构让项目各模块耦合度更低

可选的装饰器功能让接口设计更加简单

预编译路由，启动和响应速度更快，适合用于 serverless

开箱即用的 [CLI](https://github.com/ipare/cli) 让创建、调试、运行项目更加简单

<!--intro-end-->

## 贡献

在提交 PR 前请先阅读 [Contributing to Ipare](https://github.com/ipare/ipare/blob/main/CONTRIBUTING.md).

<a href="https://github.com/ipare/ipare/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=ipare/ipare" />
</a>

## 遇到问题

首先查找是否已有相关问题：

1. 查看文档 [ipare.org](https://ipare.org) 是否有相关内容
2. 查看 [Discussions](https://github.com/ipare/ipare/discussions) 是否有相关讨论
3. 查看 [Issues](https://github.com/ipare/ipare/issues) 是否有相关内容

如果以上没有找到答案：

- 一般性问题请在讨论区提问 [Discussions](https://github.com/ipare/ipare/discussions)
- 代码问题或不符预期的行为请提 [Issues](https://github.com/ipare/ipare/issues)

如果你能通过代码解决这个问题欢迎提交 [Pull requests](https://github.com/ipare/ipare/pulls)

## License

[MIT](https://opensource.org/licenses/MIT)

Copyright (c) 2022-present, Hal Wang
