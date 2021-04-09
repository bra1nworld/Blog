# layout 阶段

该阶段触发的生命周期钩子和 hook 可以直接访问到已经改变后的 DOM，即该阶段是可以参与 DOM layout 的阶段

## 概览

layout 阶段也是遍历 effectlist，执行函数 commitLayoutEffects

```typescript
root.current = finishedWork;

nextEffect = firstEffect;
do {
  try {
    commitLayoutEffects(root, lanes);
  } catch (error) {
    invariant(nextEffect !== null, "should be working on an effect.");
    captureCommitPhaseError(nextEffect, error);
    nextEffect = nextEffect.nextEffect;
  }
} while (nextEffect !== null);
```

## commitLayoutEffects

```typescript
function commitLayoutEffects(root: FiberRoot, committedLanes: Lanes) {
  while (nextEffect !== null) {
    const effectTag = nextEffect.effectTag;

    if (effectTag & (Update | Callback)) {
      const current = nextEffect.alternate;
      commitLayoutEffectOnFiber(root, current, nextEffect, commitedLanes);
    }

    // 赋值ref

    if (effectTag & Ref) {
      commitAttachRef(nextEffect);
    }

    nextEffect = nextEffect.nextEffect;
  }
}
```

- 1.commitLayoutEffectOnFiber(调用生命周期钩子和 hook 相关操作)

- 2.commitAttachRef(赋值 ref)

## commitLayoutEffectOnFiber

commitLayoutEffectOnFiber 方法会根据 fiber.tag 对不同类型的节点分别处理

- 对于 ClassComponent,他会通过 current === null ? 区分是 mount 还是 update，调用 componentDidMount 或 componentDidUpdate

触发状态更新的 this.setState 如果赋值了第二个参数回调函数，也会在此时调用

```typescript
this.setState({ xxx: 1 }, () => {
  console.log("i am update~");
});
```

- 对于 FunctionComponent 及**相关类型**，他会调用 useLayoutEffect hook 的回调函数，调度 useEffect 的销毁与回调函数

> 相关类型指 特殊处理后的 FunctionComponent，比如 ForwardRef,React.memo 包裹的 FunctionComponent

```typescript
switch (finishedWork.tag) {
  //以下都是FunctionComponent及相关类型
  case FunctionComponent:
  case ForwardRef:
  case SimpleMemoComopnent:
  case Block: {
    // 执行useLauoutEffect的回调函数
    commitHookEffectListMount(HookLayout | HookHasEffect, finishedWork);
    // 调度useEffect的销毁函数与回调函数
    schedulePassiveEffects(finishedWork);
  }
}
```

update effect 时，mutation 阶段会执行 useLayoutEffect hook 的销毁函数  
useLayoutEffect hook 从上一次更新的**销毁函数**调用到本次更新的**回调函数**调用是同步执行的

而 useEffect 则需要先调度，在 layout 阶段完成后再异步执行

这就是 useLayoutEffect 与 useEffect 的区别

- 对于 HostRoot，即 rootFiber，如果赋值了第三个参数回调函数，也会在此时调用

```typescript
ReactDOM.render(<App />, document.querySelector("#root"), function () {
  console.log("123");
});
```

## commitAttachRef

commitLayoutEffects 会做的第二件事是 commitAttachRef:获取 DOM 实例，更新 ref

```typescript
function commitAttachRef(finishedWork: Fiber) {
  const ref = finishedWork.ref;
  if (ref !== null) {
    const instance = finishedWork.stateNode;

    // 获取DOM实例

    let instanceToUse;
    switch (finishedWork.tag) {
      case HostComponent:
        instanceToUse = getPublicInstance(instance);
        break;

      default:
        instanceToUse = instance;
    }

    if (typeof ref === "function") {
      // 如果ref是函数形式，调用回调函数
      ref(instanceToUse);
    } else {
      // 如果ref是ref实例形式，赋值ref.current
      ref.current = instanceToUse;
    }
  }
}
```

## current Fiber 树切换

至此，整个 layout 阶段就结束了

```typescript
root.current = finishedWork;
```

在双缓存机制一节，workInProgress Fiber 树在 commit 阶段完成渲染后会变为 current Fiber 树。这行代码的作用就是切换 fiberRootNode 指向 current Fiber 树

为什么这行代码这这个地方（mutation 阶段结束后，layout 阶段开始前）

componentWillUnmount 会在 mutation 阶段执行。此时 current Fiber 树还指向前一次更新的 Fiber 树，在生命周期钩子内获取的 DOM 还是更新前的。

componentDidMount 和 componentDidUpdate 会在 layout 阶段执行。此时 current Fiber 树已经指向更新后的 Fiber 树，在生命周期钩子内获取的 DOM 就是更新后的
