# 单节点 Diff

对于单个节点，我们以类型 object 为例，会进入 reconcileSingleElement

```typescript
const isObject = typeof newChild === "object" && newChild !== null;

if (isObject) {
  // 对象类型，可能是REACT_ELEMENT_TYPE或REACT_PORTAL_TYPE
  switch (newChild.$$typeof) {
    case REACT_ELEMENT_TYPE:
      //调用reconcileSingleElement处理
      break;

    // ...
    default:
      break;
  }
}
```

这个函数会做如下事情

![单节点Diff](../../../resource/blogs/images/Fiber架构的实现原理/单节点Diff.png)

判断第二步 DOM 节点是否可以复用：

```typescript
function reconcileSingleElement(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  element: ReactElement,
): Fiber {
  const key = element.key;
  let child = currentFirstChild;

  // 判断是否存在对应DOM节点
  while (child !== null) {
    // 上一次更新存在DOM节点，接下来判断是否可以复用

    // 首先比较key 是否相同
    if (child.key === key) {
      // key相同，接下来比较type是否相同
      switch (child.tag) {
        // ...省略case

        default:
          if (child.elementType === element.type) {
            // type相同则表示可以复用
            // 返回复用的fiber
            return existing;
          }

          // type不同则跳出switch
          break;
      }

      // 代码执行到这里代表：key相同但type不同
      // 将该fiber及其兄弟fiber标记为删除
      deleteRemainingChildren(returnFiber, child);
      break;
    } else {
      // key不同,将该fiber标记为删除
      deleteChild(returnFiber, child);
    }
    child = child.sibling;
  }

  // 创建新Fiber，并返回
}
```

React 通过**先判断 key 是否相同**，如果 key 相同**则判断 type 是否相同**，只有都相同时一个 DOM 节点才能复用。

需要注意的细节：

- 当 child!== null 且 key 相同且 type 不同时执行 deleteRemainingChildren 将 child 及其兄弟 fiber 都标记删除

- 当 child!== null 且 key 不同时仅将 child 标记删除

例子：当前页面有 3 个 li，需要全部删除，再插入一个 p；

```tsx
// 当前页面显示的
ur > li * 3;

// 这次需要更新的
ul > p;
```

由于本次更新时只有一个 p，属于单一节点的 Diff，会走上面介绍的代码逻辑。

在 reconcileSingleElement 中遍历之前的 3 个 fiber(对应的 DOM 为 3 个 li)，寻找本次更新的 p 是否可以复用之前的 3 个 fiber 中的某个 DOM。

当 key 相同且 type 不同时，代表我们已经找到本次更新的 p 对应的上次 fiber，但是 p 与 li type 不同，不能复用。既然唯一的可能性已经不能复用。则剩下的 fiber 都没有机会复用，所以都删除。

当 key 不同时只代表遍历到的该 fiber 不能被 p 复用，后面还有兄弟 fiber 还没有遍历到。所以仅仅标记该 fiber 删除
