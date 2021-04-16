# update 的结构与工作流程

## update 的分类

按照触发更新的方法所隶属的组件分类：

- ReactDOM.render —— HostRoot

- this.setState —— ClassComponent

- this.forceUpdate —— ClassComponent

- useState —— FunctionComponent

- useReducer —— FunctionComponent

一共三种组件（HostRoot | ClassComponent | FunctionComponent）可以触发更新.

由于不同类型组件工作方式不同，所以存在两种不同结构的 Update，其中 ClassComponent 与 HostRoot 公用一套 update 结构，FunctionComponent 一套 Update 结构。他们结构不同，但工作机制和工作流程大体相同。本节介绍前一种 Update。FunctionComponent 对应 Update，在 Hooks 章节

## Update 的结构

ClassComponent 与 HostRoot(即 rootFiber.tag 对应类型)的 Update 结构如下：

```typescript
const update: Update<*> = {
  // 任务时间，通过performance.now()获取的毫秒数。该字段在未来会重构
  evnetTime,

  //优先级相关字段，不同Update优先级可能是不同的
  lane,

  // Suspense相关
  suspenseConfig,

  // 更新的类型，包括UpdateState | ReplaceState | ForceUpdate | CaptureUpdate
  tag: UpdateState,

  // 更新挂载的数据，不同类型组件挂载的数据不同，对于ClassComponent,payload为this.setState的第一个传参，对于HostRoot,payload为ReactDOM.render的第一个传参
  payload: null,

  // 更新的回调函数。及在commit阶段layout子阶段提到的回调函数
  callback: null,

  // 与其他Update链接形成链表
  next: null,
};
```

> Update 由 createUpdate 方法返回

## Update 与 Fiber 的联系

Update 存在一个链接其他 Update 形成链表的字段 next。联系 React 中另一种以链表形式组成的结构 Fiber，他们之间有什么关联？

从双缓存机制我们知道，Fiber 节点组成 Fiber 树，页面中最多同时存在两颗 Fiber 树：

- 代表当前页面状态的 current Fiber 树

- 代表正在 render 阶段的 workInProgress Fiber 树

类似 Fiber 节点组成的 Fiber 树，Fiber 节点上的多个 Update 会组成链表并被包含在 Fiber.updateQueue 中。

> 什么情况下一个 Fiber 节点会存在多个 Udpate？

```typescript
onClick() {
  this.setState({
    a: 1
  })

  this.setState({
    b: 2
  })
}
```

> 类似上述操作会在 fiber 中产生两个 Update

Fiber 节点最多同时存在两个 UpdateQueue：

- current fiber 保存的 updateQueue 即 current updateQueue

- workInProgress fiber 保存的 updateQueue 即 workInProgress updateQueue

在 commit 阶段完成页面渲染后，workInProgress Fiber 树变为 current Fiber 树，workInProgress Fiber 树内 Fiber 节点的 updateQueue 就变成 current updateQueue

## updateQueue

updateQueue 三种类型，针对 HostComponent 的类型在 completeWork 一节介绍过。其余两种类型和 Update 的两种类型对应。

ClassComponent 与 HostRoot 使用 UpdateQueue 结构：

```typescript
const queue: UpdateQueue<State> = {
  // 本次更新前该Fiber节点的state，Update基于该state计算更新后的state
  // 可将baseState比作master分支
  baseState: fiber.memorizedState,

  //本次更新前该Fiber节点已保存的Update。以链表形式存在，链表头为firstBaseupdate,链表尾为lastBaseUpdate。之所以在更新产生前该Fiber节点内就存在Update，是由于某些Update优先级较低所以在上次render阶段由Update计算state时被跳过
  // 可以将baseUpdate类比git rebase 基于的commit
  firstBaseUpdate: null,
  lastBaseUpdate: null,

  // 触发更新时，产生的Update会保存在shared.pending中形成单向环状链表。当由Update计算state时这个环会被剪开并连接在lastBaseUpdate后面
  // 将shared.pending 类比本次需要提交的commit
  shared: {
    pending: null,
  },

  // 数组。保存update.callback!== null 的Update
  effects: null,
};
```

> UpdateQueue 由 initializeUpdateQueue 方法返回

## DEMO

updateQueue 相关代码逻辑涉及到大量链表操作，举例对 updateQueue 工作流程讲解。

假设有一个 fiber 刚经历 commit 阶段完成渲染。

该 fiber 上有两个优先级过低所以在上次的 render 阶段并没有处理的 Update。他们会成为下次更新的 baseUpdate。

```typescript
// 已存在的fiber update u1 u2
fiber.updateQueue.baseUpdate: u1 --> u2

// fiber触发两次更新，产生两个新的Update u3 u4
fiber.updateQueue.shared.pending:   u3 --> u4
                                     ^      |
                                     |______|
```

更新调度完成后进入 render 阶段。

```typescript
fiber.updateQueue.baseUpdate: u1 --> u2 --> u3 --> u4
```

接下来遍历 updateQueue.baseUpdate 链表，以 fiber.updateQueue.baseState 为初始 state，依次与遍历到的每个 Update 计算并产生新的 state（该操作类比 Array.prototype.reduce）。

在遍历时如果有优先级低的 Update 会被跳过。

当遍历完成后获得的 state，就是该 Fiber 节点在本次更新的 state（源码中叫做 memoizedState）。

state 的变化在 render 阶段产生与上次更新不同的 jsx 对象，通过 Diff 算法产生 effectTag，在 commit 阶段渲染在页面上。

渲染完成后 workInProgress Fiber 树变为 current Fiber 树。整个流程更新结束
