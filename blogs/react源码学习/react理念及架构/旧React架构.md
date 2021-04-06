# React15 架构

React15 架构可以分为两层：

- Reconciler(协调器)：负责找出变化的组件
- Renderer(渲染器)：负责将变化的组件渲染到页面上

## Reconciler(协调器)

React 中通过 this.setState,this.forceUpdate,ReactDOM.render 等 API 触发更新。触发更新时，Reconciler 会做如下工作：

- 调用函数组件，或 class 组件的 render 方法，将返回的 JSX 转化为虚拟 DOM

- 将虚拟 DOM 和上次更新时的虚拟 DOM 对比

- 通过对比找出本次更新中变化的虚拟 DOM

- 通知 Renderer 将变化的虚拟 DOM 渲染到页面上

## Renderer(渲染器)

React 支持跨平台，所以不同平台有不同的 Renderer，前端浏览器环境渲染的 Renderer-----ReactDOM  
其他：

- ReactNative 渲染器：渲染 App 原生组件
- ReactTest 渲染器，渲染出纯 Js 对象用于测试
- ReactArt 渲染器，渲染到 Canvas，SVG 或 VML（IE8）

## React15 架构的缺点

在 Reconciler 中，mount 的组件会调用 mountComponent，update 的组件会调用 updateComponent，这两个方法都会递归更新子组件

### 递归更新的缺点

由于递归执行，所以更新一旦开始，中途就无法中断。当层级很深时，递归更新时间超过了 16ms，用户交互就会卡顿，基于该原因，react 觉得重写架构
