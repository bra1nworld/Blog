# Fiber 架构的工作原理

## 什么是双缓存

当我们用 canvas 绘制动画，每一帧绘制前都会调用 ctx.clearRect 清除上一帧的画面  
如果当前帧画面计算量比较大，导致清除上一帧画面到绘制当前帧画面之间有较长间隙，就会出现白屏。  
为了解决这个问题，我们可以在内存中绘制当前帧动画，绘制完毕后直接用当前帧替换上一帧画面，由于省去了两帧替换间的计算时间，不会出现从白屏到出现画面的闪烁情况。  
这种**在内存中构建并直接替换**的技术叫做**双缓存**。

React 使用“双缓存”来完成 Fiber 树的构建与替换————对应着 DOM 树的创建与更新

## 双缓存 Fiber 树

在 React 中最多会同时存在两棵 Fiber 树，当前屏幕上显示内容对应的 Fiber 树成为 currentFiber 树，正在内存中构建的 Fiber 树为 workInProgress Fiber 树

current Fiber 树中的 Fiber 节点被称为 current fiber，workInProgress Fiber 树中的 Fiber 节点被称为 workInProgress fiber，他们通过 alternate 属性链接

```typescript
currentFiber.alternate === workInProgressFiber;
workInProgressFiber.alternate === currentFiber;
```

React 应用的根节点通过使 current 指针在不同 Fiber 树的 rootFiber 间切换来完成 current Fiber 树指向的切换  
即当 workInProgress Fiber 树 构建完成交给 Renderer 渲染在页面上后，应用根节点的 current 指针指向 workInProgress Fiber 树，此时 workInProgress Fiber 树就变为 current fiber 树

每次状态更新都会产生新的 workInProgress Fiber 树，通过 current 与 workInProgress 的替换，完成 DOM 更新

## mount 时

```javascript
function App() {
  const [num, add] = useState(0);
  return <p onClick={() => add(num + 1)}>{num}</p>;
}

ReactDOM.render(<App />, document.getElementById("root"));
```

1. 首次执行 ReactDOM.render 会创建 fiberRootNode（源码中叫 fiberRoot）和 rootFiber。其中 fiberRootNode 是整个应用的根节点，rootFiber 是 App 所在组件树的根节点

之所以要区分 fiberRootNode 与 rootFiber，是因为在应用中我们可以多次调用 ReactDOM.render 渲染不同的组件树，他们会拥有不同的 rootFiber。但是整个应用的根节点只有一个，那就是 fiberRootNode。

fiberRootNode 的 current 会指向当前页面上已经渲染内容对应 Fiber 树，即 current Fiber 树

```javascript
fiberRootNode.current = rootFiber;
```

由于是首屏渲染，页面中还没有挂载任何 DOM，所以 fiberRootNode.current 指向的 rootFiber 没有任何子 Fiber 节点（即 current Fiber 树为空）

2.render 阶段，根据组件返回的 JSX 在内存中一次创建 Fiber 节点并连接在一起构建 Fiber 树，被称为 workInProgress Fiber 树

在构建 workInProgress Fiber 树时会尝试复用 current Fiber 树中已有的 Fiber 节点内的属性，在首屏渲染时只有 rootFiber 存在对应的 current fiber（即 rootFiber.alternate）

3.已构建完的 workInProgress Fiber 树在 commit 阶段渲染到页面。

此时 DOM 更新为树对应的样子，fiberRootNode 的 current 指针指向 workInprogress Fiber 树使其变为 current Fiber 树

## update 时

1.状态改变时，会开启一次新的 render 阶段并构建一颗新的 workInProgress Fiber 树

和 mount 时一样，workInProgress fiber 的创建可以复用 current Fiber 树对应的节点数据

> 这个决定是否复用的过程就是 diff 算法

2.workInProgress Fiber 树在 render 阶段完成构建后进入 commit 阶段渲染到页面上，渲染完毕后，workInProgress Fiber 树变为 current Fiber 树
