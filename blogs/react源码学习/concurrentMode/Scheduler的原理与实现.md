# Scheduler

Scheduler 主要包含两个功能：

- 1.时间切片

- 2.优先级调度

## 时间切片原理

时间切片本质是模拟实现 requestIdleCallback。

除去”浏览器重排/重绘“，下图是浏览器一帧中可以用于执行 JS 的时机

```typescript
一个task(宏任务) -- 队列中全部job（微任务） -- requestAnimationFrame -- 浏览器重排/重绘 - reqiestIdleCallback
```

requestIdleCallback 是在”浏览器重排/重绘“后如果当前帧还有空余时间时被调用的

浏览器并没有提供其他 API 能够在同样的时机（浏览器重排/重绘后）调用以模拟其实现。

唯一能精准控制调用时机的 API 是 requestAnimationFrame，他能让我们在”浏览器重排/重绘“之前执行 JS。

这也是为什么我们通常用这个 API 实现 JS 动画 —— 这是浏览器渲染前的最后时机，所以动画能快速被渲染。

所以，退而求其次，Scheduler 的时间切片功能是通过 task（宏任务）实现的。

最常见的 task 当属 setTimeout 了。但是有个 task 比 setTimeout 执行时机更靠前，即 MessageChannel。

所以 Scheduler 将需要被执行的回调函数作为 MessageChannel 的回调执行。如果当前宿主环境不支持 MessageChannel，则使用 setTimeout。

在 React 的 render 阶段，开启 Concurrent Mode 时，每次遍历前，都会通过 Scheduler 提供的 shouldYield 方法判断是否需要中断遍历，使浏览器有时间渲染：

```typescript
function workLoopConcurrent() {
  // Perform work until Scheduler asks us to yield
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}
```

是否中断的依据，最重要的一点便是每个任务的剩余时间是否用完。Scheduler 中，为任务分配的初始剩余时间为 5ms。随着应用运行，会通过 fps 动态调整分配任务的可执行时间。

这也解释了为什么启用 Concurrent Mode 后每个任务的执行时间大体都是多余 5ms 的一小段时间——每个时间切片被设定为 5ms，任务本身再执行一小段时间，所以整体时间是多于 5ms 的时间。

当 shouldYield 为 true，performUnitOfWork 被中断后如何重新启动的。

## 优先级调度

首先我们来了解优先级的额来源。需要明确的一点是，Scheduler 是独立于 React 的包，所以它的优先级也是独立于 React 的优先级的。

Scheduler 对外暴露了一个方法 unstable_runWithPriority.

这个方法接受一个优先级与一个回调函数，在回调函数内部调用获取优先级的方法都会取得第一个参数对应的优先级：

```typescript
function unstable_runWithPriority(priorityLevel, eventHandler) {
  switch (priorityLevel) {
    case ImmediatePriority:
    case UserBlockingPriority:
    case NormalPriority:
    case LowPriority:
    case IdlePriority:
      break;
    default:
      priorityLevel = NormalPriority;
  }

  var previousPriorityLevel = currentPriorityLevel;
  currentPriorityLevel = priorityLevel;

  try {
    return eventHandler();
  } finally {
    currentPriorityLevel = previousPriorityLevel;
  }
}
```

Scheduler 内部存在 5 中优先级。

在 React 内部凡是涉及到优先级调度的地方，都会使用 unstable_runWithPrority.

比如，我们知道 commit 阶段是同步执行的。可以看到，commit 阶段的起点 commitRoot 方法的优先级为 ImmediateSchedulerPriority。

ImmediateSchedulerPriority 即 ImmediatePriority 的别名，为最高优先级，会立即执行。

```typescript
function commitRoot(root) {
  const renderPriorityLevel = getCurrentPriorityLevel();
  runWithPriority(
    ImmediateSchedulerPriority,
    commitRootImpl.bind(null, root, renderPriorityLevel),
  );
  return null;
}
```

## 优先级的意义

Scheduler 对外暴露最重要的方法便是 unstable_scheduleCallback.该方法用于以某个优先级注册回调函数。

比如在 React 中，之前讲过在 commit 阶段的 beforeMutation 阶段会调度 useEffect 的回调：

```typescript
if (!rootDoesHavePassiveEffects) {
  rootDoesHavePassiveEffects = true;
  scheduleCallback(NormalSchedulerPriority, () => {
    flushPassiveEffects();
    return null;
  });
}
```

这里的回调便是通过 scheduleCallback 调度的，优先级为 NormalSchedulerPriority，即 NormalPriority。

不同优先级意味着不同时长的任务过期时间：

```typescript
var timeout;
switch (priorityLevel) {
  case ImmediatePriority:
    timeout = IMMEDIATE_PRIORITY_TIMEOUT;
    break;
  case UserBlockingPriority:
    timeout = USER_BLOCKING_PRIORITY_TIMEOUT;
    break;
  case IdlePriority:
    timeout = IDLE_PRIORITY_TIMEOUT;
    break;
  case LowPriority:
    timeout = LOW_PRIORITY_TIMEOUT;
    break;
  case NormalPriority:
  default:
    timeout = NORMAL_PRIORITY_TIMEOUT;
    break;
}

var expirationTime = startTime + timeout;
```

其中：

```typescript
// Times out immediately
var IMMEDIATE_PRIORITY_TIMEOUT = -1;
// Eventually times out
var USER_BLOCKING_PRIORITY_TIMEOUT = 250;
var NORMAL_PRIORITY_TIMEOUT = 5000;
var LOW_PRIORITY_TIMEOUT = 10000;
// Never times out
var IDLE_PRIORITY_TIMEOUT = maxSigned31BitInt;
```

可以看到如果优先级是 ImmediatePriority，对应 IMMEDIATE_PRIORITY_TIMEOUT 为-1，那么

```typescript
var expirationTime = startTime - 1;
```

则该任务的过期时间比当前时间还短，表示它已经过期了，需要立即被执行

## 不同优先级任务的排序

优先级意味着任务的过期时间。如果某一刻，存在很多不同优先级的任务，对应不同的过期时间。

同时，又因为任务可以被延迟，所以我们可以将这些任务按是否被延迟分为：

- 已就绪任务

- 未就绪任务

```typescript
if (typeof options === "object" && options !== null) {
  var delay = options.delay;
  if (typeof delay === "number" && delay > 0) {
    // 任务被延迟
    startTime = currentTime + delay;
  } else {
    startTime = currentTime;
  }
} else {
  startTime = currentTime;
}
```

所以，Scheduler 存在两个队列：

- timerQueue:保存未就绪任务

- taskQueue：保存已就绪任务

每当有新的未就绪的任务被注册，我们将其插入 timerQueue 并根据开始时间重新排列 timerQueue 中任务的顺序。

当 timerQueue 中有任务就绪，即 startTime <= currentTime,我们将其取出并加入 taskQueue。

取出 taskQ 中最早过期的任务并执行他

为了能在 O(1)复杂度找到两个队列中农时间最早的那个任务，Scheduler 使用小顶堆实现了优先级队列。

> 那么当 shouldYield 为 true，以至于 performUnitOfWork 被中断是如何重新启动的呢？

在”取出 taskQueue 中最早过期的任务并执行他“这一步中的关键步骤：

```typescript
//当注册的回调函数执行后的返回值
const continuationCallback = callback(didUserCallbackTimeout);
currentTime = getCurrentTime();
if (typeof continuationCallback === "function") {
  // continuationCallback是函数,会将continuationCallback作为当前任务的回调函数
  currentTask.callback = continuationCallback;
  markTaskYield(currentTask, currentTime);
} else {
  //将当前被执行的任务清除出taskQueue
  if (enableProfiling) {
    markTaskCompleted(currentTask, currentTime);
    currentTask.isQueued = false;
  }
  if (currentTask === peek(taskQueue)) {
    // 将当前任务清除
    pop(taskQueue);
  }
}
advanceTimers(currentTime);
```

render 阶段被调度的函数为 performConcurrentWorkOnRoot，在该函数末尾有这样一段代码：

```typescript
if (root.callbackNode === originalCallbackNode) {
  // The task node scheduled for this root is the same one that's
  // currently executed. Need to return a continuation.
  return performConcurrentWorkOnRoot.bind(null, root);
}
```

在满足一定条件时，该函数会将自己作为返回值
