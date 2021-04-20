# Fiber 架构的实现原理

## Fiber 的起源

React15 及以前，Reconciler 采用递归的方式创建虚拟 DOM，递归过程是不能中断的。如果组件树的层级很深，递归会占用线程很多时间，造成卡顿

为了解决这个问题，React16 将**递归的无法中断的更新**重构为**异步的可中断更新**，由于曾经用于递归的虚拟 DOM 数据结构已经无法满足需要，所以 Fiber 架构才诞生

## Fiber 的含义

Fiber 包含三层含义：

1.作为架构来说，之前 React15 的 Reconciler 采用递归的方式执行，数据保存在递归调用栈中，所以被称为 stack Reconciler.React16 的 Reconciler 基于 Fiber 节点实现，被称为 Fiber Reconciler  
2.作为静态的数据结构来说，每个 Fiber 节点对应一个 React element，保存了该组件的类型（函数组件/类组件/原生组件）对应的 DOM 节点等信息  
3.作为动态的工作单元来说，每个 Fiber 节点保存了本次更新中该组件改变的状态，要执行的工作(需要被删除/被插入页面中/被更新...)

## Fiber 的结构

```typescript
// Fiber节点的属性定义，可以按三层含义将它们分类
function FiberNode(
  tag: WorkTag,
  pendingProps: mixed,
  key: null | string,
  mode: TypeOfMode,
) {
  // 作为静态数据结构的属性
  this.tag = tag;
  this.key = key;
  this.elementType = null;
  this.type = null;
  this.stateNode = null;

  // 用于连接其他Fiber节点形成Fiber树
  this.return = null;
  this.child = null;
  this.sibling = null;
  this.index = 0;

  this.ref = null;

  // 作为动态的工作单元的属性
  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.upreteQueue = null;
  this.memoizedState = null;
  this.dependencies = null;

  this.mode = mode;

  this.effectTag = NoEffect;
  this.nextEffect = null;

  this.firstEffect = null;
  this.lastEffect = null;

  // 调度优先级相关
  this.lanes = NoLanes;
  this.childLanes = NoLanes;

  // 指向fiber在另一次更新时对应的fiber
  this.alternate = null;
}
```

### 作为架构

每个 Fiber 节点有个对应的 React element，多个 Fiber 节点是如何连接形成树呢？

```javascript
// 指向父级Fiber节点
this.return = null;
//指向子Fiber节点
this.child = null;
//指向右边第一个兄弟Fiber节点
this.sibling = null;
```

组件结果示例：

```typescript
function App() {
  return (
    <div>
      i am
      <span> hh</span>
    </div>
  );
}
```

![Fiber树](../../../resource/blogs/images/Fiber架构的实现原理/fiber架构实例.png)

> 为什么父级指针叫做 return 而不是 parent 或者 father？因为作为一个工作单元，return 指节点执行完 completeWork 后会返回的下一个节点。子 Fiber 节点及其兄弟节点完成工作后会返回其父级节点。所以用 return 指代父级节点

### 作为静态的数据结构

保存了组件相关信息:

```typescript
// Fiber对应组件的类型 Function/Class/Host
this.tag = tag;
// key属性
this.key = key;
// 大部分情况同type,某些情况不同，比如FunctionComponent使用React.memo
this.elementType = null;
// 对于FunctionComponent，指函数本身，对于ClassComponent，指class，对于HostComponent，指DOM节点tagName
this.type = null;

// Fiber对应的真实DOM节点
this.stateNode = null;
```

### 作为动态的工作单元

作为动态的工作单元，Fiber 中如下参数保存了本次更新相关的信息

```typescript
// 保存本次更新造成的状态改变相关信息
this.pendingProps = pendingProps;
this.memoizedProps = null;
this.updateQueue = null;
this.memoizedState = null;
this.dependencies = null;

this.mode = mode;

// 保存本次更新会造成的DOM操作
this.effectTag = NoEffect;
this.nextEffect = null;
this.firstEffect = null;
this.lastEffect = null;

// 调度优先级相关
this.lanes = NoLanes;
this.childLanes = NoLanes;
```
