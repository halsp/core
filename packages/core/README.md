<p align="center">
  <a href="https://ipare.org/" target="blank"><img src="https://ipare.org/images/logo.png" alt="Ipare Logo" width="200"/></a>
</p>

<p align="center">Ipare - 面向云的现代渐进式轻量 <a href="http://nodejs.org" target="_blank">Node.js</a> 框架</p>
<p align="center">
    <a href="https://github.com/ipare/core/blob/main/LICENSE" target="_blank"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="GitHub license" /></a>
    <a href=""><img src="https://img.shields.io/npm/v/@ipare/core.svg" alt="npm version"></a>
    <a href=""><img src="https://badgen.net/npm/dt/@ipare/core" alt="npm downloads"></a>
    <a href="https://nodejs.org/en/about/releases/"><img src="https://img.shields.io/node/v/vite.svg" alt="node compatibility"></a>
    <a href="#"><img src="https://github.com/ipare/core/actions/workflows/test.yml/badge.svg?branch=main" alt="Build Status"></a>
    <a href="https://codecov.io/gh/ipare/core/branch/main"><img src="https://img.shields.io/codecov/c/github/ipare/core/main.svg" alt="Test Coverage"></a>
    <a href="https://github.com/ipare/core/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"></a>
    <a href="https://gitpod.io/#https://github.com/ipare/core"><img src="https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod" alt="Gitpod Ready-to-Code"></a>
    <a href="https://paypal.me/ihalwang" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
</p>

## 介绍

Ipare 是一个面向云的现代渐进式轻量 <a href="http://nodejs.org" target="_blank">Node.js</a> 框架

可以运行于 http 服务，也可以运行于 serverless

### 渐进式

可以根据项目渐进式安装 Ipare 组件，路由、Ioc、视图、过滤器、请求管道等等

由于核心思想是中间件和依赖注入，因此 Ipare 的扩展性更强，你可以按需增加更多其他功能

### 多环境运行

Ipare 既可以运行在 serverless 也可以运行在原生 nodejs 服务、微服务等场景

Ipare 原生支持 serverless，作为云函数比其他 nodejs 框架速度更快

### 先进特性

Ipare 源码全部使用 TypeScript 开发，有完善的智能提示

mva 架构让项目各模块耦合度更低

可选的装饰器功能让接口设计更加简单

预编译路由，启动和响应速度更快，适合用于 serverless 的 nodejs 框架

## 安装

```
npm install @ipare/core
```

## 开始使用

请访问 <https://ipare.org>

## 贡献

请阅读 [Contributing to @ipare/core](https://github.com/ipare/core/blob/main/CONTRIBUTING.md)

### 贡献列表

<a href="https://github.com/ipare/core/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=ipare/core" />
</a>

## License

Ipare is MIT licensed.
