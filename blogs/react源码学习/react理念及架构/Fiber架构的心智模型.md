# Fiber 架构的心智模型

代数效应：能够将副作用（异步请求等）从函数逻辑中分离，使函数关注点保持纯粹

## 代数效应在 React 中的应用

最明显的例子就是 Hooks，我们只需要假设 useState 返回的是我们想要的 state，并编写业务逻辑就行

## 代数效应与 Generator

React15 到 React16，协调器（Reconciler）重构的一大目的是：将老的同步更新的架构变为异步可中断更新  
异步可中断更新可以理解为：更新在执行过程中可能会被打断（浏览器时间分片用尽或有更高优任务插队），当可以继续执行时恢复之前执行的中间状态  
这就是代数效应中 try...handle 的作用。  
浏览器原生就支持类似的实现，这就是 Generator。  
React 放弃 Generator 的原因：

- 类似 async，Generator 也是传染性的，使用了 Generator 则上下文的其他函数也需要作出改变

- Generator 执行的中间状态是上下文关联的

考虑如下例子：

```javascript
function* doWork(A, B, C) {
  var x = doExpensiveWorkA(A);
  yield;
  var y = x + doExpensiveWorkB(B);
  yield;
  var z = y + doExpensiveWorkC(C);
  return z;
}
```

每当浏览器有空闲时间都会依次执行其中一个 doExpensiveWork,当时间用尽则会中断，当再次恢复时会从中断位置继续执行。  
只考虑“单一优先级任务的中断与继续”情况下 Generator 可以很好的实现**异步可中断更新**。  
但是当我们考虑“高优先级任务插队”的情况，如果此时已经完成 doExpensiveWorkA 与 doExpensiveWorkB 计算出 x 与 y  
此时 B 组件接收到一个高优更新，由于 Generator 执行的中间状态是上下文关联的，所以计算 y 时无法复用之前已经计算出的 x，需要重新计算  
如果通过全局变量保存之前执行的中间状态，又会引入新的复杂度

因此，Reac 没有采用 Generator 实现协调器

## 代数效应与 Fiber

Fiber 中文译名为“纤程”，与进程（Process）、线程（Thread）、协程（Coroutine）同为程序执行过程  
JS 中，协程的实现便是 Generator

React Fiber 可以理解为：  
React 内部实现的一套状态更新机制，支持任务不同优先级，可中断与恢复，并且回复后可以复用之前的中间状态。  
每个任务更新单元为 React Element 对于的 Fiber 节点
