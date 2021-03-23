# Hooks 数据结构

## dispatcher

真实 Hooks 中，组件 mount 时的 hook 与 update 时的 hook 来源于不同的对象，这类对象在源码中被称为 dispatcher

```javascript
// mount时的Dispatcher
const HooksDispatcherOnMount: Dispatcher = {
  useCallback: mountCallback,
  useContext: readContext,
  useEffect: mountEffect,
  useImperativeHandle: mountImperativeHandle,
  useLayoutEffect: mountLayoutEffect,
  useMemo: mountMemo,
  useReducer: mountReducer,
  useRef: mountRef,
  useState: mountState,
  // ...
};

// update时的Dispatcher
const HooksDispatcherOnUpdate: Dispatcher = {
  useCallback: updateCallback,
  useContext: readContext,
  useEffect: updateEffect,
  useImperativeHandle: updateImperativeHandle,
  useLayoutEffect: updateLayoutEffect,
  useMemo: updateMemo,
  useReducer: updateReducer,
  useRef: updateRef,
  useState: updateState,
  // ...省略
};
```

mount 时调用的 hook 和 update 时调用的 hook 是两个不同的函数。  
在 FunctionComponent render 前，会根据 FunctionComponent 对应 fiber 的以下条件区分 mount 与 update  
并将不同情况对应 dispatcher 赋值给全局变量 ReactCurrentDispatcher 的 current 属性

```javascript
ReactCurrentDispatcher.current =
  current === null || current.memoizedState === null
    ? HooksDispatcherOnMount
    : HooksDispatcherOnUpdate;
```

不同调用栈上下文为 ReactCurrentDispatcher.current 赋值不同的 dispatcher，则 FunctionComponent render 时调用的 hook 也是不同的函数

## Hook 的数据结构

```typescript
const hook: Hook = {
  memoizedState: null,

  baseState: null,
  baseQueue: null,
  queue: null,

  next: null,
};
```

> hook 与 FunctionComponent fiber 都存在 memoizedState 属性  
> fiber.memoizedState:FunctionComponent 对应 fiber 保存的 hooks 链表  
> hook.memoizedState:Hooks 链表中保存的单一 hook 对应的数据

不同类型 hook 的 memoizedState 保存不同类型数据：

- useState:对于 const [state,updateState]=useState(initialState),memoizedState 保存 state 的值

- useReducer:对于 const [state,dispatch] = useReducer(reducer,{}),memoizedState 保存 setate 的值

- useEffect: memoizedState 保存包含 useEffect 回调函数，依赖项等的链表数据结构 effect,effect 链表同时会保存在 fiber.updateQueue 中

- useRef:对于 useRef(1),memoizedState 保存{current:1}

- useMemo:对于 useMemo(callback,[depA]),memoizedState 保存[callback(),depA]

- useCallback:对于 useCallback(callback,[depA]),memoizedState 保存[callback,depA].与 useMemo 的区别是，useCallback 保存的是 callback 函数本身，而 useMemo 保存的是 callback 函数执行结果

- useContext:hook 没有 memoizedState
