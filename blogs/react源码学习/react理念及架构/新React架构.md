# React16 架构

React 架构可以分为三层：

- Scheduler(调度器)——调度任务的优先级，高任务优先进入 Renconciler

- Reconciler(协调器) —— 负责找出变化的组件

- Renderer(渲染器) —— 负责将变化的组件渲染到页面上

相较 React15，React16 新增了 Scheduler(调度器)

## Scheduler(调度器)

判断是否有剩余时间作为任务中断的标准，其实浏览器已经实现了 API，requestIdleCallback，但是有以下问题：

- 浏览器兼容性

- 触发频率不稳定，受很多因素影响，比如当我们的浏览器切换 tab 后，之前 tab 注册的 requestIdleCallback 触发的频率会变得很低

因此 React 实现了功能更完备的 requestIdleCallback polyfill，这就是 Scheduler。除了在空闲时触发回调的功能外，Scheduler 还提供了多种调度优先级任务设置

## Reconciler(协调器)

更新工作从递归变成了可以中断的循环过程，每次循环都会调用 shouldYield 判断当前是否剩余时间

```typescript
function workLoopConcurrent() {
  // Perfoorm work until Scheduler asks us to yield
  while (workInProgress !== null && !shouldYield()) {
    workInProgress = performUnitOfWork(workInProgress);
  }
}
```

React16 如何解决中断更新时 DOM 渲染不完全的问题？

在 React16 中，Reconciler 与 Renderer 不再交替工作，当 Scheduler 将任务交给 Reconciler 后，Reconciler 会为变化的虚拟 DOM 打上代表增/删/改的标记

```typescript
export const Placement = /*             */ 0b0000000000010;
export const Update = /*                */ 0b0000000000100;
export const PlacementAndUpdate = /*    */ 0b0000000000110;
export const Deletion = /*              */ 0b0000000001000;
```

整个 Scheduler 与 Reconciler 的工作都在内存中进行，只有当所有组件都完成 Reconciler 的工作，才会统一交给 Renderer

## Renderer（渲染器）

Renderer 根据 Reconciler 为虚拟 DOM 打的标记，同步执行对应的 DOM 操作

渲染可能被中断的原因：

- 有其他更高优任务需要先更新

- 当前帧没有剩余时间

scheduler 和 reconciler 阶段工作都在内存中进行，不会更新页面上的 DOM，所以即使反复中断，用户也不会看见更新不完全的 DOM
