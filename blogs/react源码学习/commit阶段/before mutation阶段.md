# before mutation 阶段

renderer 工作的阶段被称为 commit 阶段。commit 阶段可以分为三个子阶段：

- before mutation 阶段(执行 DOM 操作前)

- mutation 阶段（执行 DOM 操作）

- layout 阶段（执行 DOM 操作后）

## before mutation 概览

before mutation 阶段整个过程就是遍历 effectList 并调用 commitBeforeMutationEffects 函数处理

```typescript
//保存之前的优先级，以同步优先级执行，执行完毕后恢复之前优先级
const previousLanePriority = getCurrentUpdateLanePriority();
setCurrentUpdateLanePriority(SyncLanePriority);

// 将当前上下文标记为CommitContext,作为commit阶段的标志
const prevExecutionContext = executionContext;
eecutionContext |= CommitContext;

// 处理focus状态
focusedInstanceHandle = prepareForCommit(root.containerInfo);
shouldFireAfterActiceInstanceBlur = false;

// beforeMutation阶段的主函数
commitBeforeMutationEffects(finishedWork);

forcuseInstanceHandle = null;
```

## commitBeforeMutationEffects

```typescript
function commitBeforeMutationEffects() {
  while (nextEffect !== null) {
    const current = nextEffect.alternate;

    if (!shouldFireAfterActiceInstanceBlur && focusedInstanceHandle !== null) {
      // fouces bulr相关
    }

    const effectTag = nextEffect.effectTag;

    // 调用getSnapshotBeforeUpdate
    if ((effectTag & Snapshot) !== NoEffect) {
      commitBeforeMutationEffectOnFiber(current, nextEffect);
    }

    // 调度useEffect
    if ((effect & passive) !== NoEffect) {
      if (!rootDoesHavePassiveEffects) {
        rootDoesHavePassiveEffects = true;
        scheduleCallback(normalSchedulerPriority, () => {
          flushPassiveEffects();
          return null;
        });
      }
    }
    nextEffect = nextEffect.nextEffect;
  }
}
```

三部分：

- 处理 DOM 节点渲染/删除后 autoFocus、blur 逻辑

- 调用 getSnapshotBeforeUpdate 生命周期钩子

- 调度 useEffect

### 调用 getSnapshotBeforeUpdate

commitBeforeMutationEffectOnFiber 会调用 getSnapshotBeforeUpdate

React 16 之后 componentWillxxx 钩子增加了 UNSAFE\_前缀，原因是 Stack Reconciler 重构为 Fiber Reconciler 后，render 阶段的任务可能中断/重新开始，对应的组件在 render 阶段的生命周期钩子可能触发多次

为此提供了替代色生命周期钩子 getSnapshotbeforeUpdate,其是在 commit 阶段内的 before mutatioin 阶段调用的，由于 commit 阶段是同步的，所以不会遇到多次调用的问题

### 调度 useEffect

sheduleCallback 方法由 Scheduler 模块提供，用于以某个优先级异步调度一个回到函数

```typescript
// 调度useEffect
if ((effectTag & Passive) !== NoEffect) {
  if (!rootDoesHavePassiveEffects) {
    rootDoesHavePassiveEffects = true;
    scheduleCallback(NormalSchedulerPriority, () => {
      // 触发useEffect
      flushPassiveEffects();
      return null;
    });
  }
}
```

在此处，被异步调度的回调函数就会触发 useEffect 的方法 flushPassiveEffects

useEffect 方法为何以及如何被异步调度

#### 如何异步调度

在 flushPassiveEffects 方法内部会从全局变量 rootWithPendingPassiceEffects 获取 effectList。

effectList 中保存了需要执行副作用的 fiber 节点，其中副作用包括：

- 插入 DOM 节点(Placement)

- 更新 DOM 节点(Update)

- 删除 DOM 节点(Deletion)

除此外，当一个 FunctionComponent 含有 useEffect 或 useLayoutEffect，他对应的 Fiber 节点也会被赋值 effectTag

在 flushPassiveEffects 方法内部会遍历 rootWithPendingPassiveEffects(即 effectList)执行 effect 回调函数

如果在此时直接执行，rootWithPendingPassiveEffects === null,上一节 layout 之后的代码片段会根据 rootDoesHavePassiveEffects === true 决定是否入职 rootWithPendingPassiveEffects

```typescript
const rootDidHavePassiveEffects = rootDoesHavePassiveEffects;
if (rootDoesHavePassiveEffects) {
  rootDoesHavePassiveEffects = false;
  rootWithPendingPassiveEffects = root;
  pendingPassiveEffectsLanes = lanes;
  pendingPassiveEffectsRenderPriority = renderPriorityLevel;
}
```

所以整个 useEffect 异步调用分为三步：

- before mutation 阶段在 scheduleCallback 中调度 flushPassiveEffects

- layout 阶段之后将 effectList 赋值给 rootWithPendingPassiveEffects

- shceduleCallback 触发 flushPassiveEffects,flushPassiveEffects 内部遍历 rootWithPendingPassiveEffects

#### 为什么要异步调用

> 与 componentDidMount、comopnentDidUpdate 不同的是，在浏览器完成布局与绘制之后，传给 useEffect 的函数会延迟调用。这使得它适用于许多常见的副作用场景，比如设置订阅和事件处理等情况，因此不应该在函数中执行阻塞浏览器更新屏幕的操作

useEffect 异步执行的原因是防止同步执行时阻塞浏览器渲染

## 总结

在 before mutation 阶段，会遍历 effectList，依次执行：

- 处理 DOM 节点 渲染/删除后的 autoFocus/blur 逻辑

- 调用 getSnapshotBeforeUpdate 生命周期钩子

- 调度 useEffect
