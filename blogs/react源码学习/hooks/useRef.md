# useRef

ref 是 reference(引用)的缩写.在 React 中，我们习惯用 ref 保存 DOM。  
事实上，任何需要被“引用”的数据都可以保存在 ref 中，useRef 的出现将这种思想进一步推广.  
由于 string 类型的 ref 已不推荐使用，所以本节针对 function | {current:any} 类型的 ref

## ref 数据结构

与其他 hook 一样，对于 mount 与 update，useRef 对应两个不同 dispatcher

```typescript
function mountRef<T>(initialValue:T):{|current: T|}{
    // 获取当前useRef hook
    const hook=mountWorkInProgressHook();
    // 创建ref
    const ref={current:initialValue};
    hook.memoizedState=ref;
    return ref
}

function updateRef<T>(initialValue:T):{|current:T|}{
    // 获取当前useRef hook
    const hook=updateWorkInProgressHook();
    // 返回保存的数据
    return hook.memoizedState
}

```

useRef 仅仅是返回一个包含 current 属性的对象。  
react.createRef 的实现

```typescript
export function createRef(): RefObject {
  const refObject = {
    current: null,
  };

  return refObject;
}
```

## ref 的工作流程

在 React 中，HostComponent，ClassComponent,ForwordRef 可以复制 ref 属性

```typescript
// HostComponent
<div ref={domRef}></div>
// ClassComponent / ForwardRef
<App ref={cpnRef}>
```

其中，ForwardRef 只是将 ref 作为第二参数传递下去，不会进入 ref 工作流程。所以讨论 ref 工作流程时会排除 ForwardRef

```typescript
// 对于ForwardRef,secondArg为传递下去的ref
let children = Component(props, secondArg);
```

我们知道 HostComponent 在 commit 阶段的 mutaion 阶段执行 DOM 操作 。所以，对于 ref 的更新也是发生在 mutaion 阶段。  
而 mutaion 阶段执行 DOM 操作的依据为 effectTag。所以对于 HostComponent,ClassComponent，如果包含 ref 操作，那么也会赋值相应的 effectTag

```typescript
// ...
export const Placement = /*                    */ 0b0000000000000010;
export const Update = /*                       */ 0b0000000000000100;
export const Deletion = /*                     */ 0b0000000000001000;
export const Ref = /*                          */ 0b0000000010000000;
// ...
```

ref 的工作流程可以分为俩部分：

- render 阶段为含有 ref 属性的 fiber 添加 Ref effectTag

- commit 阶段为包含 Ref effectTag 的 fiber 执行对应操作

## render 阶段

在 render 阶段的 beginWork 与 completeWork 中有个同名方法 markRef 用于含有 ref 属性的 fiber 增加 Ref effectTag

```typescript
// begainWork 的markRef
function markRef(current: Fiber | null, workInProgress: Fiber) {
  const ref = workInProgress.ref;
  if (
    (current === null && ref !== null) ||
    (current !== null && current !== ref)
  ) {
    // Schedule a Ref effect
    workInProgress.effectTag |= Ref;
  }
}

// completeWork的markRef
function markRef(workInProgress: Fiber) {
  workInProgress.effectRag |= Ref;
}
```

beginWork 中，如下两处调用了 markRef：

- updateClassComponent 内的 finishClassComponent，对应 classComponent。classComponent 即使 shouldComponentUpdate 为 false，该组件也会调用 markRef

- updateHostComponent，对应 HostComponent 在 completeWork 中，如下两处调用 markRef：

- completeWrok 中 HostComponent 类型

- completeWrok 中的 ScopeComponent 类型

组件对应 fiber 被赋值 Ref effectTag 需要满足的条件：

- fiber 类型为 HostComponent，ClassComponent，ScopeComponnet

- 对于 mount，workInProgress.ref !== null,即存在 ref 属性

- 对于 update,current.ref !== workInProgress.ref，即 ref 属性改变

## commit 阶段

在 commit 阶段的 mutation 阶段中，对于 ref 属性改变的情况，需要先移除之前的 ref。

```typescript
function commitMutationEffects(root: FiberRoot, renderPriorityLevel) {
  while (nextEffect !== null) {
    const effectTag = nextEffect.effectTag;

    if (effectTag & Ref) {
      const current = nextEffect.alternate;
      if (current !== null) {
        // 移除之前的ref
        commitDetachRef(current);
      }
    }
  }
}

function commitDetachRef(current: Fiber) {
  const currentRef = current.ref;
  if (currentRef !== null) {
    if (typeof currentRef === "function") {
      // function 类型ref,调用它，传参为null
      currentRef(null);
    } else {
      // 对象类型ref,current赋值为null
      currentRef.current = null;
    }
  }
}
```

在 mutation 阶段，对于 Deletion effectTag 的 fiber(对应需要删除的 DOM 节点)，需要递归它的子树，对子孙 fiber 的 ref 执行类似 commitDetachRef 的操作  
在 commitDeletion --- unmountHostComponents --- commitUnmout --- ClassComponent | HostComponent 类型 case 中调用 safeltDetachRef 方法负责执行类似 commitDetachRef 的操作

```typescript
function safelyDetachRef(current: Fiber) {
  const ref = current.ref;
  if (ref !== null) {
    if (typeof ref === "function") {
      try {
        ref(null);
      } catch (refError) {
        captureCommitPhaseError(current, refError);
      }
    } else {
      ref.current = null;
    }
  }
}
```

ref 的赋值阶段

> commitLayoutEffect 会执行 commitAttachRef(赋值 ref)

```typescript
function commitAttachRef(finishedWork: Fiber) {
  const ref = finishedWork.ref;
  if (ref !== null) {
    // 获取ref属性对应的Component实例
    const instance = finishedWork.stateNode;
    let instanceToUse;
    switch (finishedWork.tag) {
      case HostComponent:
        instanceToUse = getPublicInstance(instance);
        break;
      default:
        instanceToUse = instance;
    }

    // 赋值ref
    if (typeof ref === "function") {
      ref(instanceToUse);
    } else {
      ref.current = instanceToUse;
    }
  }
}
```

## ref 工作流程

- 对于 FunctionComponent,useRef 负责创建并返回对应 ref

- 对于赋值了 ref 属性的 HostComponent 与 ClassComponent，会在 redner 阶段经历赋值 Ref effecTag,在 commit 阶段执行对应 ref 操作
