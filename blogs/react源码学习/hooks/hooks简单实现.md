# hooks 实现

## 工作原理

以 useState Hook 为例：

```javascript
function App() {
  const [num, updateNum] = useState(0);

  return <p onClick={() => updateNum((num) => num + 1)}>{num}</p>;
}
```

更新步骤分为 mount 和 update：  
1.调用 ReactDOM.render 会产生 mount 的更新，更新内容为 useState 的 initialValue  
2.点击 p 标签触发 updateNum 会产生一次 update 的更新,更新内容为 num=>num+1

## 更新是什么

> 通过一些途径产生**更新**，**更新**会造成组件 render

**更新**的即为以下数据结构

```javascript
const update = {
  // 更新执行的函数
  action,
  // 与同一个Hook的其他更新形成链表
  next: null,
};
```

尝试修改 App 的 onClick

```javascript
// 之前
return <p onClick={() => updateNum((num) => num + 1)}>{num}</p>;

// 之后
return (
  <p
    onClick={() => {
      updateNum((num) => num + 1);
      updateNum((num) => num + 1);
      updateNum((num) => num + 1);
    }}
  >
    {num}
  </p>
);
```

## update 数据结构

上述修改后的 update 会形成**环状单向链表**  
调用 updateNum 实际调用的是 dispatchActioin.bind(null, hook.queue),我们先来了解下该函数：

```javascript
function dispatchAction(queue, action) {
  // 创建update
  const update = {
    action,
    next: null,
  };

  // 环状单向链表操作
  if (queue.pending === null) {
    update.next = update;
  } else {
    update.next = queue.pending.next;
    queue.pending.next = update;
  }
  queue.pending = update;

  // 模拟React开始调度更新
  schedule();
}
```

链表解析：

```javascript
// 当产生第一个update (u0),此时queue.pending === null.
// update.next= update; 即 u0.next=u0,它会和自己首尾相连形成**单向环状链表**。
// queue.pending = u0;
queue.pending = u0 ---> u0
                ^        |
                |        |
                ----------

// 当产生第二个update(u1),update.next=queue.pending.next;此时quque.pending.next===u0,即u1.next = u0
// quque.pending.next=update,即 u0.next = u1.
// queue.pending = update ,即 queue.pending = u1
queue.pending = u1 ---> u0
                ^        |
                |        |
                ----------

// 按照该例子模拟插入多个update时，会发现queue.pending始终指向最后一个插入的update
// 好处在于当遍历update时，queue.pending.next指向第一个插入的update
```

## 状态如何保存

**更新** 产生的 **update**对象会保存在 **queue**中。  
不同于 classComponent 的实例可以存储数据，对于 FunctionComponent，queue 存储在**其对应 fiber 中**  
精简的 fiber 结构：

```javascript
// App 组件对应的fiber对象
const fiber = {
  // 保存该FunctionComponent对应的Hooks链表
  memoizedState: null,
  // 指向App函数
  stateNode: App,
};
```

## Hook 数据结构

**Hook**与**update**类似，都通过**链表**链接，不过**Hook**是**无环**的**单向链表**

```javascript
hook = {
  // 保存update的queue，及上文的queue
  queue: {
    pending: null,
  },
  // 保存Hook对应的state
  memoizedState: initialState,
  // 与下一个Hook链接形成单向无环链表
  next: null,
};
```

> 注意区分 update 和 hook 的所属关系：
> 每个 useState 分别对应一个 hook 对象。
> 调用 useState 时，updateNum 产生的 update 保存在 useState 对应的 hook.queue 中

## 模拟 React 调度更新流程

使用 isMount 变量代指 mount 还是 update

```javascript
// 首次render时是mount
isMount = true;

function schedule() {
  // 更新前将workInProgressHook重置为fiber保存的第一个Hook
  workInProgressHook = fiber.memoizedState;
  // 触发组件render
  fiber.stateNode();
  // 组件首次render为mount，以后再触发的更新为update
  isMount = false;
}
```

通过**workInProgressHook**变量指向当前正在工作的 hook

```javascript
workInProgressHook = fiber.memoizedState;
```

在组件 render 时，每当遇到下一个 useState，我们移动 workInProgressHook 的指针

```javascript
workInProgressHook = workInProgressHook.next;
```

这样，只要每次组件 render 时 useState 的调用顺序及数量保持一致，那么始终可以通过 workInProgressHook 找到当前 useState 对应的 hook 对象  
到此为止，我们已经完成第一步：

> 1.通过一些途径产生**更新**，**更新**会造成组件**render**

接下来实现第二步：

> 2.组件 render 时 useState 返回的**num**为更新后的结果

## 计算 State

组件 render 时会调用 useState，其大致逻辑如下：

```javascript
function useState(initialState) {
  // 当前useState使用的hook会被赋值该变量
  let hook;

  if (isMount) {
    // mount时为该useState生成hook
    hook = {
      queue: {
        pending: null,
      },
      memoizedState: initialState,
      next: null,
    };

    // 将hook插入fiber.memoizedState链表末尾
    if (!fiber.memoizedState) {
      fiber.memoizedState = hook;
    } else {
      workInProgressHook.next = hook;
    }

    // 移动workInProgressHook指针
    workInProgressHook = hook;
  } else {
    // update时找到对应hook
    hook = workInProgressHook;
    // 移动workinProgressHook指针
    workProgressHook = workInProgressHook.next;
  }

  // update执行前的初始state
  let baseState = hook.memoizedState;
  if (hook.queue.pending) {
    // 获取update环状单向链表中第一个update
    let firstUpdate = hook.queue.pending.next;

    do {
      // 执行update action
      const action = firstUpdate.action;
      baseState = action(baseState);
      firstUpdate = firstUpdate.next;

      // 最后一个update执行完后跳出循环
    } while (firstUpdate !== hook.queue.pending.next);

    // 清空queue.pending
    hook.queue.pending = null;
  }

  // 将update actoin执行完后的state作为memoizedState
  hook.memoizedState = baseState;

  return [baseState, dispatchAction.bind(null, hook.queue)];
}
```

## 与 React 的区别

代码模拟 hook 的运行相比 React Hooks 的区别：  
1.React Hooks 没有使用 isMount 变量，而是在不同时机使用不同的 dispatcher，换言之，mount 时的 useState 与 update 时的 useState**不是同一个函数**  
2.React Hooks 有中途跳过**更新**的优化手段  
3.React Hooks 有 batchedUpdates，当在 click 中触发三次 updateNum，精简 React 会触发三次更新，而 React 只会**触发一次**
4.React Hooks 的 update 有**优先级**概念，可以跳过不高优先的**update**
