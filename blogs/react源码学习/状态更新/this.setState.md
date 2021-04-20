# this.setState

## 流程概览

this.setState 会调用 this.updater.enqueueSetState 方法

```typescript
Component.prototype.setState = function (partialState, callback) {
  if (
    !(
      typeof partialState === "object" ||
      typeof partialState === "function" ||
      partialState == null
    )
  ) {
    {
      throw Error(
        "setState(...): takes an object of state variables to update or a function which returns an object of state variables.",
      );
    }
  }
  this.updater.enqueueSetState(this, partialState, callback, "setState");
};
```

enqueueSetState 方法中就是从创建 update 到调度 update 的流程了

```typescript
enqueueSetState(inst, payload, callback) {
  // 通过组件实例获取对应fiber
  const fiber = getInstance(inst);

  const eventTime = requestEventTime();
  const suspenseConfig = requestCurrentSuspenseConfig();

  // 获取优先级
  const lane = requestUpdateLane(fiber, suspenseConfig);

  // 创建update
  const update = createUpdate(eventTime, lane, suspenseConfig);

  update.payload = payload;

  // 赋值回调函数
  if (callback !== undefined && callback !== null) {
    update.callback = callback;
  }

  // 将update插入updateQueue
  enqueueUpdate(fiber, update);
  // 调度update
  scheduleUpdateOnFiber(fiber, lane, eventTime);
}
```

需要注意的是对于 ClassComponent，update.payload 为 this.setState 的第一个传参（即要改变的 state）

## this.forceUpdate

在 this.updater 上，除了 enqueueSetState 外，还存在 enqueueForceUpdate，当我们调用 this.forceUpdate 时会调用它

除了赋值 update.tag=ForceUpdate,以及没有 payload 外，其他逻辑与 this.setState 一致

```typescript
enqueueForceUpdate(inst, callback) {
    const fiber = getInstance(inst);
    const eventTime = requestEventTime();
    const suspenseConfig = requestCurrentSuspenseConfig();
    const lane = requestUpdateLane(fiber, suspenseConfig);

    const update = createUpdate(eventTime, lane, suspenseConfig);

    // 赋值tag为ForceUpdate
    update.tag = ForceUpdate;

    if (callback !== undefined && callback !== null) {
      update.callback = callback;
    }

    enqueueUpdate(fiber, update);
    scheduleUpdateOnFiber(fiber, lane, eventTime);
  },
};
```

赋值 update.tag = ForceUpdate 有何作用呢？

在判断 ClassComponent 是否需要更新时有两个条件需要满足：

```typescript
const shouldUpdate =
  checkHasForceUpdateAfterProcessing() ||
  checkShouldComponentUpdate(
    workInProgress,
    ctor,
    oldProps,
    newProps,
    oldState,
    newState,
    nextContext,
  );
```

- checkHasForceUpdateAfterProcessing:内部会判断本次更新的 Update 是否为 ForceUpdate。即如果本次更新的 Update 中存在 tag 为 ForceUpdate，则返回 true；

- checkShouldComponentUpdate:内部会调用 shouldComponentUpdate 方法，以及当该 ClassComponent 为 pureComponent 时会浅比较 state 与 props；

所以当某次更新含有 tag 为 ForceUpdate 的 Update，那么当前 ClassComponent 不会受其他**性能优化手段**（shouldComponentUpdate | PureComponent）影响，一定会更新
