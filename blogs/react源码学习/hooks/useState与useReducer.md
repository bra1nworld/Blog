# useState 与 useReducer

## 流程概览

```typescript
function App() {
  const [state, dispatch] = useReducer(reducer, { a: 1 });

  const [num, updateNum] = useState(0);

  return (
    <div>
      <button onClick={() => dispatch({ type: "a" })}>{state.a}</button>
      <button onClick={() => updateNum((num) => num + 1)}>{num}</button>
    </div>
  );
}
```

- 声明阶段：即 App 调用时，会一次执行 useReducer 与 useState 方法

- 调动阶段：即点击按钮后，dispatch 或 updateNum 被调用时

## 声明阶段

当 FunctionComponent 进入 render 阶段的 beginWork 时，会调用 renderWithHooks 方法。该方法内部会执行 FunctionComponent 对应函数（即 fiber.type）  
两个 hook 源码如下：

```typescript
function useState(initialState) {
  var dispatcher = resolveDispatcher();
  return dispather.useState(initialState);
}

function useReducer(reducer, initialArg, init) {
  var dispatcher = resolveDispather();
  return dispather.useReducer(reducer, initialArg, init);
}
```

mount 与 update 场景 hook 会调用不同处理函数

### mount 时

mount 时，useRedcer 会调用 mountReducer，useState 会调用 mountState

```typescript
function mountState<S>(
    initialState:(()=>S) | S,
):[S,Dispatch<BasicStateAction<S>>]{
    // 创建并返回当前hook
    // 对应hooks简单实现中useState方法的isMount逻辑部分
    const hook =mountWorkInProgressHook()

    // ...赋值初始state

    // 创建queue
    const queue= ( hook.queue = {
        // 与简单实现中的同名字段意义相同，保存update对象
        pending:null,
        // 保存dispatchAction.bind()的值
        dispatch:null,
        // 上一次render时使用的reducer
        lastRenderedReducer:basicStateReducer,
        // 上一次render时的state
        lastRenderedState:(initialState:any)
    })

    // ...创建dispatch
    return [hook.memoizedState,dispatch]
}

function mountReducer<S,I,A>(
    reducer:(S,A)=>S,
    initialArg:I,
    init?:I=>S
):[S,Dispatch<A>]{
    // 创建并返回当前hook
    const hook =mountWorkInProgressHook()

    // ...赋值初始state

    // 创建queue
    const queue=(hook.queue={
        pending:null,
        dispatch:null,
        lastRenderedReducer:reducer,
        lastRenderedState:(initialState:any)
    })

    // ...创建dispatch
    return [hook.memoizedState,dispatch]
}

```

其中 useReducer 的 lastRenderedReducer 为传入的 reducer 参数。useState 的 lastRenderedReducer 为 basicStateReducer.

```typescript
function basicStateReducer<S>(state: S, action: BasicStateAction<S>): S {
  return typeof action === "function" ? action(state) : action;
}
```

> useState 即 reducer 参数为 basicStateReducer 的 useReducer

### update 时

update 时，useReducer 和 useState 调用的是同一个函数 updateReducer

```typescript
function updateReducer<S,I,A>(
    reducer:(S,A)=>S,
    initialArg:I,
    init?:I=>S
):[S,Dispatch<A>]{
    const hook=updateWorkInProgressHook();
    const queue=hook.queue;

    queue.lastRenderedReducer=reducer;

  // ...同update与updateQueue类似的更新逻辑

  const dispatch: Dispatch<A> = (queue.dispatch: any);
  return [hook.memoizedState, dispatch];
}
```

> 找到对应 hook，根据 update 计算出该 hook 的新 state 并返回

mount 时获取当前 hook 使用的是 mountWorkInProgressHook,而 update 时使用的是 updateworkInProgressHook,原因是：

- mount 时可以确定是调用 ReactDOM.render 或相关初始化 API 产生的更新，只会执行一次

- update 可能是在事件回调或副作用中触发更新或者是 render 阶段触发的更新，为了避免组件无限循环更新，后者需要区别对待

在 render 阶段触发更新的例子：

```javascript
funciton App(){
    const [num,updateNum] = useState(0)

    updateNum(num+1)

    return (
        <button onClick={() => updateNum(num => num + 1)}>{num}</button>
    )
}

```

上述例子中，App 调用时，代表已经进入 render 阶段执行 renderWithHooks  
在 App 内部，调用 updateNum 会触发一次更新，如果不对这种情况下触发的更新作出限制，那么这次更新会开启一次新的 render 阶段，最终会无限循环更新。

> React 用一个标记变量 didScheduleRenderPhaseUpdate 判断是否是 render 阶段触发的更新

## 调用阶段

调用阶段会执行 dispatchAction，此时 FunctionComponent 对应的 fiber 以及 hook.queue 已经通过调用 bind 方法预先作为参数传入

```typescript
function dispatchAction(fiber, queue, action) {
  var update = {
    eventTime: eventTime,
    lane: lane,
    suspenseConfig: suspenseConfig,
    action: action,
    eagerReducer: null,
    eagerState: null,
    next: null,
  };

  // 将update加入queue.pending

  var alternate = fiber.alternate;

  // currentlyRenderingFiber即workInProgressHook，workInProgress存在代表当前处于render阶段
  // 触发更新时通过bind预先保存的fiber与workInProgress全等，代表本次更新发生于FunctionComponent对应fiber的render阶段
  // 所以这是一个render阶段触发的更新，需要标记变量didScheduleRenderPhaseUpdate后续单独处理
  if (
    fiber === currentlyRenderingFiber$1 ||
    (alternate !== null && alternate === currentlyRenderingFiber$1)
  ) {
    // render 阶段触发的更新
    didScheduleRenderPhaseUpdateDuringThisPass = disScheduleRenderPhaseUpdate = true;
  } else {
    // fiber.lanes保存fiber上存在的update的优先级
    // fiber.lanes=== NoLanes意味着fiber上不存在update
    // 我们已知，通过update计算state发生在声明阶段，这是因为该hook上可能存在多个不同优先级的update，最终state的值有多个update共同决定
    // 但是当fiber上不存在update，则调用阶段创建的update为该hook上第一个update，在声明阶段及计算state时也只有依赖该update，完全不需要进入声明阶段再计算state
    // 好处：如果计算出的state与该hook之前保存的state一直，那么完全不需要开启一次调度。即使计算出的state与该hook之前保存的state不一致，在声明阶段也可以直接使用调用阶段已经计算出的state
    if (
      fiber.lanes === NoLanes &&
      (alternate === null || alternate.lanes === NoLanes)
    ) {
      // fiber的updateQueue为空，优化路径
    }

    scheduleUpdateOnFiber(fiber, lane, eventTime);
  }
}
```

> 创建 update，将 update 加入 queue.pending 中，并开启调度
