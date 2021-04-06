# beginwork

![beginWork流程图](../../resource/blogs/images/Fiber架构的实现原理/beginWork流程图.png)

## 方法概览

beginwork 工作是传入当前 Fiber 节点，创建子 Fiber 节点

```typescript
function beginwork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
): Fiber | null {
  //....
}
```

- current:当前组件对应的 Fiber 节点在上一次更新时的 Fiber 节点，即 workInProgress.alternate

- workInProgress:当前组件对应的 Fiber 节点

- renderLanes:优先级相关

基于双缓存机制，除 rootFiber 以外，组件 mount 时，由于是首次渲染，是不存在当前组件对应的 Fiber 节点在上一次更新时的 Fiber 节点，即 mount 时 currnt === null;因此可以通过 current === null?来区组件处于 mount 还是 update。

因此 beginWork 可以分为两部分工作：

- update 时：如果 current 存在，在满足一定条件时可以复用 current 节点，这样就能克隆 current.child 作为 workInProgress.child，就不需要新建 workInprogress.child.

- mount 时，除 fiberRootNode 以外，current === null.会根据 fiber.tag 不同，创建不同类型的子 Fiber 节点

```typescript
function beginWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
): Fiber | null {
  // update时：如果current存在可能存在优化路径，可以复用current（即上一次更新的Fiber节点）
  if (current !== null) {
    // ...省略

    // 复用current
    return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
  } else {
    didReceiveUpdate = false;
  }

  // mount时：根据tag不同，创建不同的子Fiber节点
  switch (workInProgress.tag) {
    case IndeterminateComponent:
    // ...省略
    case LazyComponent:
    // ...省略
    case FunctionComponent:
    // ...省略
    case ClassComponent:
    // ...省略
    case HostRoot:
    // ...省略
    case HostComponent:
    // ...省略
    case HostText:
    // ...省略
    // ...省略其他类型
  }
}
```

## update 时

满足如下情况时，didReceiveUpdate === false（即可以直接复用前一次更新的子 Fiber，不需要新建子 Fiber）

- 1.oldProps=== newProps && workInProgress.type === current.type,即 props 与 fiber.type 不变
- 2.!includesSomeLane(renderLanes,updateLanes),即当前 Fiber 优先级不够

```typescript
if (current !== null) {
  const oldProps = current.memoizedProps;
  const newProps = workInProgress.pendingProps;

  if (
    oldProps !== newProps ||
    hasLegacyContextChanged() ||
    (__DEV__ ? workInProgress.type !== current.type : false)
  ) {
    didReceiveUpdate = true;
  } else if (!includesSomeLane(renderLanes, updateLanes)) {
    didReceiveUpdate = false;
    switch (
      workInProgress.tag
      //...
    ) {
    }

    return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
  } else {
    disReceiveUpdate = false;
  }
} else {
  didReceiveUpdate = false;
}
```

## mount 时

当不满足优化路径时，我们进入第二部分，新建子 Fiber

```typescript
// mount时：根据tag不同，创建不同的Fiber节点
switch (workInProgress.tag) {
  case IndeterminateComponent:
  // ...省略
  case LazyComponent:
  // ...省略
  case FunctionComponent:
  // ...省略
  case ClassComponent:
  // ...省略
  case HostRoot:
  // ...省略
  case HostComponent:
  // ...省略
  case HostText:
  // ...省略
  // ...省略其他类型
}
```

对于常见组件类型，如 FunctionComponent/ClassComponent/HostComponent，最终会进入 reconcileChildren 方法

## reconcileChildren

该函数名是 Reconciler 模块的核心部分

- 对于 mount 的组件，他会创建新的子 Fiber 节点

- 对于 update 组件，他会将当前的组件与该组件在上次更新时对应的 Fiber 节点比较（diff 算法），将比较的结果生成新 Fiber 节点

```typescript
export function reconcileChildren(
  current: Fiber | null,
  workInProgress: Fiber,
  nextChildren: any,
  renderLanes: Lanes,
) {
  if (current === null) {
    // 对于mount的组件
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren,
      renderLanes,
    );
  } else {
    // 对于update的组件
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren,
      renderLanes,
    );
  }
}
```

不论走哪个逻辑，最终它会生成新的子 fiber 节点并赋值给 workInProgress.child，作为本次 beginwork 返回值，并作为下次 performUnitOfWork 执行时 workInProgress 的传参

> mountChildFibers 与 reconcileChildFibers 这两个方法逻辑基本一致。唯一的区别是：reconcileChildFibers 会成为的 Fiber 节点带上 effectTag 属性，而 mountChildFibers 不会

## effectTag

render 节点工作是在内存中进行，当工作结束后会通知 Renderer 需要执行的 DOM 操作，要执行 DOM 操作的具体类型就保存在 fiber.effectTag 中

```typescript
// DOM需要插入到页面中
export const Placement = /*                */ 0b00000000000010;
// DOM需要更新
export const Update = /*                   */ 0b00000000000100;
// DOM需要插入到页面中并更新
export const PlacementAndUpdate = /*       */ 0b00000000000110;
// DOM需要删除
export const Deletion = /*                 */ 0b00000000001000;
```

如果要通知 Renderer 将 Fiber 节点对应的 DOM 节点插入页面中，需要满足两个条件：

- fiber.stateNode 存在，即 Fiber 节点中保存了对应的 DOM 节点

- （fiber.effectTag & Placement）！== 0，即 Fiber 节点存在 Placement effectTag

mount 时，fiber.stateNode === null,且在 reconcileChildren 中调用 mountChildFibers 不会为 Fiber 节点赋值 effectTag。那首屏渲染如何完成呢？

1.fiber.stateNode 会在 completeWork 中创建  
2.假设 mountChildFibers 也会赋值 effectTag，那么 mount 时整颗 fiber 树所有节点都会有 Placement effectTag,那么 commit 在执行 DOM 操作时每个节点都会执行一次插入操作，这样大量的 ODM 操作效率是极低的

因此在 mount 时只有 rootFiber 会赋值 Placement effectTag，在 commit 节点只会执行一次插入操作
