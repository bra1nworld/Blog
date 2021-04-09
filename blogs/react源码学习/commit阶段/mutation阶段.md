# mutation

执行 DOM 操作的 mutation 阶段，类似 before mutation 阶段，mutation 阶段也是遍历 effectList，执行函数 commitMutationEffects

```typescript
nextEffect = firstEffect;

do {
  try {
    commitMutationEffects(root, renderPriorityLevel);
  } catch (error) {
    invariant(nextEffect !== null, "should be working on an effect");
    captureCommitPhaseError(nextEffect, error);
    nextEffect = nextEffect.nextEffect;
  }
} while (nextEffect !== null);
```

## commitMutationEffects

```typescript
function commitMutationEffects(root: FiberRoot, renderPriorityLevel) {
  //遍历effectList
  while (nextEffect !== null) {
    const effectTag = nextEffect.effectTag;

    // 根据ContentReset effectTag重置文字节点
    if (effectTag & ContentReset) {
      commitResetTextContent(nextEffect);
    }

    //更新ref

    if (effectTag & Ref) {
      const current = nextEffect.alternate;
      if (current !== null) {
        commitDetachRef(current);
      }
    }

    //根据effectTag分别处理
    const primaryEffectTag =
      effectTag & (Placement | Update | Deletion | Hydrating);

    switch (primaryEffectTag) {
      // 插入DOM
      case Placement: {
        commitPlacement(nextEffect);
        nextEffect.effectTag &= ~Placement;
        break;
      }

      // 插入DOM 并更新DOM
      case PlacementAndUpdate: {
        // 插入
        commitPlacement(nextEffect);

        nextEffect.effectTag &= ~Placement;

        //更新
        const current = nextEffect.alternate;
        commitWork(current, nextEffect);
        break;
      }
      // SSR
      case HydratingAndUpdate: {
        nextEffect.effectTag &= ~Hydrating;

        const current = nextEffect.alternate;
        commitWork(current, nextEffect);
        break;
      }
      // 更新DOM
      case Update: {
        const current = nextEffect.alternate;
        commitWork(current, nextEffect);
        break;
      }
      // 删除DOM
      case Deletion: {
        commitDeletion(root, nextEffect, renderPriorityLevel);
        break;
      }
    }

    nextEffect = nextEffect.nextEffect;
  }
}
```

commitMutationEffects 会遍历 effectList，对每个 Fiber 节点执行如下三个操作：

- 根据 ContentReset effectTag 重置文字节点

- 更新 ref

- 根据 effectTag 分别处理，其中 effectb 包括（Placement | Update | Deletion | Hydrating）（Hydrating 作为服务端渲染暂时不关注）

### Placement effect

当 Fiber 节点含有 Placement effectTag，意味着该 Fiber 节点对应 DOM 节点需要插入到页面中

调用的方法是 commitPlacement

分三步：

- 1. 获取父级 DOM 节点，其中 finishedWork 为传入的 Fiber 节点

```typescript
const parentFiber = getHostParentFiber(finishedWork);
// 父级DOM节点
const parentStateNode = parentFiber.stateNode;
```

- 2.获取 Fiber 节点的 DOM 兄弟节点

```typescript
const before = getHostSibling(finishedWork);
```

- 3.根据 DOM 兄弟节点是否存在决定调用 parentNode.insertBefore 或 parentNode.appendChild 执行 DOM 插入操作

```typescript
// parentStateNode是否是rootFiber
if (isContainer) {
  insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
} else {
  insertOrAppendPlacementNode(finishedWork, before, parent);
}
```

getHostSibling（获取兄弟节点 DOm 节点）执行很耗时，当在同一个父 fiber 节点下一次执行多个插入操作,getHostSibling 算法复杂度为指数级

这是由于 Fiber 节点不只包括 HostComponent，所以 Fiber 树和渲染的 DOM 树节点并不是一一对应的，从 Fiber 节点找到 DOM 节点很可能跨层级遍历

demo:

```typescript
function Item() {
  return <li><li>;
}

function App() {
  return (
    <div>
      <Item/>
    </div>
  )
}

ReactDOM.render(<App/>, document.getElementById('root'));
```

对应的 Fiber 树和 DOM 树结构为：

```typescript
// Fiber树
          child      child      child       child
rootFiber -----> App -----> div -----> Item -----> li

// DOM树
#root ---> div ---> li
```

当在 div 的子节点 Item 前插入一个新节点 p，即 App 变为：

```typescript
function App() {
  return (
    <div>
      <p></p>
      <Item />
    </div>
  );
}
```

对应的 Fiber 树和 DOM 树结构未：

```typescript
// Fiber树
          child      child      child
rootFiber -----> App -----> div -----> p
                                       | sibling       child
                                       | -------> Item -----> li
// DOM树
#root ---> div ---> p
             |
               ---> li
```

此时 DOM 节点 p 的兄弟节点为 li，而 Fiber 节点 p 对应的兄弟 DOM 节点为：

```typescript
fiberP.sibling.child;
```

### Update effect

当 Fiber 节点含有 Update effectTag，意味着该 Fiber 节点需要更新。调用的方法为 commitWork，他会根据 Fiber.tag 分别处理

主要关注 FunctionComponent 和 HostComponent

#### FunctionComponent mutation

当 fiber.tag 为 FunctionComponent，会调用 commitHookEffectListUnmount.该方法会遍历 effectList，执行所有 useLayoutEffect hook 的销毁函数

```typescript
useLayoutEffect(() => {
  // ...一些副作用逻辑

  return () => {
    // ...这就是销毁函数
  };
});
```

#### HostComponent mutation

当 fiber.tag 为 HostComponent,会调用 commitUpdate.

最终会在 updateDOMProperties 中将 render 阶段 completeWork 中为 Fiber 节点赋值的 updateQueue 对应的内容渲染在页面上

```typescript
for (let i = 0; i < updatePayload.length; i++) {
  const propKey = updatePayload[i];
  const propValue = updatePayload[i + 1];

  // 处理style
  if (propKey === STYLE) {
    setValueForStyles(domElement, propValue);
    // 处理 DANGEROUSLY_SET_INNER_HTML
  } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
    setInnerHTML(domElement, propValue);
    // 处理 children
  } else if (propKey === CHILDREN) {
    setTextContext(domElement, propValue);
  } else {
    // 处理剩余props
    setValueForProperty(domElement, propKey, propValue, isCustomComponentTag);
  }
}
```

### deletion effect

当 Fiber 节点含有 Deletion effectTag，意味着该 Fiber 节点对应的 DOM 节点需要从页面中删除，调用的方法为 commitDeletion，该方法会执行如下操作:

- 递归调用 Fiber 节点及其子孙 Fiber 节点中 fiber.tag 为 ClassComponnet 的 componentWillUnmount 生命周期钩子，从页面移除 Fiber 节点对应 DOM 节点

- 解绑 ref

- 调度 useEffect 的销毁函数
