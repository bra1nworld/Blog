# completeWork

![completeWork流程图](../../../resource/blogs/images/Fiber架构的实现原理/completeWork流程图.png)

组件执行 beginWork 后会创建子 Fiber 节点，节点上可能存在 effectTag。

## 流程概览

类似 beginWork,completeWok 也是针对不同 fiber.tag 调用不同处理逻辑

```typescript
function completeWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
): Fiber | null {
  const newProps = workInProgress.pendingProps;

  switch (workInProgress.tag) {
    case IndeterminateComponent:
    case LazyComponent:
    case SimpleMemoComponent:
    case FunctionComponent:
    case ForwardRef:
    case Fragment:
    case Mode:
    case Profiler:
    case ContextConsumer:
    case MemoComponent:
      return null;
    case ClassComponent: {
      // ...省略
      return null;
    }
    case HostRoot: {
      // ...省略
      updateHostContainer(workInProgress);
      return null;
    }
    case HostComponent: {
      // ...省略
      return null;
    }
  // ...省略
```

页面渲染所必须的 HostComponent（即原生 DOM 组件对应的 Fiber 节点）

## 处理 HostComponent

和 beginWork 一样，我们根据 current === null ? 判断是 Mount 还是 update

同时针对 HostComponent,判断 update 时我们还需要考虑 workInProgress.stateNode != null? (即该 Fiber 节点是否存在对应的 DOM 节点)

```typescript
case HostComponent:{
    popHostContext(workInProgress);
    const rootContainerInstance = getRootHostContainer();
    const type = workInProgress.type;

    if(current !== null && workInProgress.stateNode != null){
        // update的情况
        // ...省略
    }else {
        // mount的情况
        // ...
    }

    return null
}
```

## update 时

当 update 时，Fiber 节点已经存在对应 DOM 节点，不需要生成 DOM 节点。需要做的是处理 props，比如：

- onClick、onChange 等回调函数的注册

- 处理 style prop

- 处理 DANGEROUSLY_SET_INNER_HTML prop

- 处理 children prop

主要逻辑是调用 updateHostComponent 方法

```typescript
if (current !== null && workInprogress.stateNode != null) {
  // update的情况
  updateHostComponent(
    current,
    workInProgress,
    type,
    newProps,
    rootContainerInstance,
  );
}
```

在 updateHostComponent 内部，被处理完的 props 会被赋值给 workInProgress.updateQueue，并最终会在 commit 阶段被渲染在页面上

```typescript
workInProgress.updateQueue = (updatePayload:any)
```

其中 updatePayload 为数组形式，他的偶数索引的值为变化的 prop key,奇数索引的值为变化的 prop value

## mount 时

主要三个逻辑：

- 为 Fiber 节点生成对应的 DOM 节点

- 将子孙 DOM 节点插入刚生成的 DOM 节点中

- 与 update 逻辑中的 updateHostComponent 类似的处理 props 过程

```typescript
// mount的情况

// ...省略服务端渲染相关逻辑

const currentHostContext = getHostContext();

// 为fiber创建对应的DOM节点

const instance = createInstance(
  type,
  newProps,
  rootContainerInstance,
  currentHostContext,
  workInProgress,
);

// 将子孙DOM节点插入刚生成的DOM节点中
appendAllChildren(instance, workInProgress, false, false);

// DOM节点赋值给fiber.stateNode
workInProgress.stateNode = instance;

// 与update逻辑中的updateHostComponent类似的处理props过程
if (
  finalizeInitialChildren(
    instance,
    type,
    newProps,
    rootContainerInstance,
    currentHostContext,
  )
) {
  markUpdate(workInProgress);
}
```

mount 时只会在 rootFiber 存在 Placement effetTag.那么 commit 阶段是如何通过一次插入 DOM 操作（对应一个 Placement effectTag）将整颗 DOm 树插入页面的呢？

原因在于 completeWork 中的 appendAllChildren 方法。

由于 completeWork 属于“归”阶段调用的函数，每次调用 appendAllChildren 时都会将已生成的子孙 DOM 节点插入当前生成的 DOM 节点下，那么当“归”到 rootFiber 时，就已经有一个构建好的离屏 DOM 树

## effectList

至此 render 阶段的绝大部分工作已完成

那么作为 DOM 操作的依据，commit 阶段需要找到所有有 effectTag 的 Fiber 节点并以此执行 effectTag 对应操作。难道要在 commit 再遍历以此 Fiber 树寻找 effectTag！== null 的 fiber 节点吗？

为了解决这个问题，在 completeWork 的上层函数 completeUnitOfWork 中，每个执行完 completeWork 且存在 effectTag 的 Fiber 节点会被保存在一条被称为 effectList 的单向链表中。

effectList 中第一个 Fiber 节点保存在 fiber.firstEffect,最后一个元素保存在 fiber.lastEffect。

类似 appendAllChildren，在“归”阶段，所有有 effectTag 的 Fiber 节点都会被追加在 effectList 中，最终形成一条以 rootFiber.firstEffect 为起点的单向链表

```typescript
                       nextEffect         nextEffect
rootFiber.firstEffect -----------> fiber -----------> fiber
```

这样在 commit 阶段只需要遍历 effectList 就能执行所有 effect 了

## 流程结尾

至此，render 阶段全部工作完成，在 performSyncWorkOnRoot 函数中 fiberRootNode 被传递给 commitRoot 方法，开启 commit 工作流程
