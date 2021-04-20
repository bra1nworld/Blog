# Lane 模型

Scheduler 与 React 是两套优先级机制。在 React 中，存在多种使用不同优先级的情况，：（以下例子皆为 concurrent Mode 开启情况）

- 过期任务或同步任务使用同步优先级

- 用户交互产生的更新（比如点击事件）使用高优先级

- 网络请求产生的更新使用一般优先级

- Suspense 使用低优先级

React 需要设计一套满足如下需要的优先级机制：

- 可以表示优先级的不同

- 可能同时存在几个同优先级的更新，所以还得能表示批的概念

- 方便进行优先级相关计算

React 设计了 lane 模型

## 表示优先级的不同

不同赛车在不同赛道，内圈的赛道总长度更短，外圈更长。某几个临近的赛道长度可以看做差不多长。

lane 模型借鉴了同样的概念，使用 31 位的二进制表示 31 条赛道，位数越小赛道优先级越高，某些相邻的赛道拥有相同优先级

```typescript
export const NoLanes: Lanes = /*                        */ 0b0000000000000000000000000000000;
export const NoLane: Lane = /*                          */ 0b0000000000000000000000000000000;

export const SyncLane: Lane = /*                        */ 0b0000000000000000000000000000001;
export const SyncBatchedLane: Lane = /*                 */ 0b0000000000000000000000000000010;

export const InputDiscreteHydrationLane: Lane = /*      */ 0b0000000000000000000000000000100;
const InputDiscreteLanes: Lanes = /*                    */ 0b0000000000000000000000000011000;

const InputContinuousHydrationLane: Lane = /*           */ 0b0000000000000000000000000100000;
const InputContinuousLanes: Lanes = /*                  */ 0b0000000000000000000000011000000;

export const DefaultHydrationLane: Lane = /*            */ 0b0000000000000000000000100000000;
export const DefaultLanes: Lanes = /*                   */ 0b0000000000000000000111000000000;

const TransitionHydrationLane: Lane = /*                */ 0b0000000000000000001000000000000;
const TransitionLanes: Lanes = /*                       */ 0b0000000001111111110000000000000;

const RetryLanes: Lanes = /*                            */ 0b0000011110000000000000000000000;

export const SomeRetryLane: Lanes = /*                  */ 0b0000010000000000000000000000000;

export const SelectiveHydrationLane: Lane = /*          */ 0b0000100000000000000000000000000;

const NonIdleLanes = /*                                 */ 0b0000111111111111111111111111111;

export const IdleHydrationLane: Lane = /*               */ 0b0001000000000000000000000000000;
const IdleLanes: Lanes = /*                             */ 0b0110000000000000000000000000000;

export const OffscreenLane: Lane = /*                   */ 0b1000000000000000000000000000000;
```

其中，同步优先级占用的赛道为第一位：

```typescript
export const SyncLane: Lane = /*                        */ 0b0000000000000000000000000000001;
```

从 SyncLane 往下一直到 SelectiveHydrationLane，赛道优先级逐步降低

## 表示”批“的概念

有几个变量占用了几条赛道，比如：

```typescript
const InputDiscreteLanes: Lanes = /*                    */ 0b0000000000000000000000000011000;
export const DefaultLanes: Lanes = /*                   */ 0b0000000000000000000111000000000;
const TransitionLanes: Lanes = /*                       */ 0b0000000001111111110000000000000;
```

这就是批的概念，被称作 lanes（区别与优先级的 lane）。

- InputdiscreateLanes 是”用户交互“触发更新会拥有的优先级范围

- DefaultLanes 是”请求数据返回后触发更新“拥有的优先级范围

- TransitionLanes 是 Suspense、useTransition、useDeferredValue 拥有的优先级范围

**越低优先级的 lanes 占用的位越多,原因是：越低优先级的更新越容易被打断，导致积压下来，所以需要更多的位。相反，最高优的同步更新的 SyncLane 不需要多余的 lanes** 。

## 方便进行优先级相关计算

既然 lane 对应了二进制的位，那么优先级相关设计其实就是位运算

是否存在交集

```typescript
export function includesSomeLane(a: Lanes | Lane, b: Lanes | Lane) {
  return (a & b) !== NoLanes;
}
```

b 是否是 a 的子集

```typescript
export function isSubsetOfLanes(set: Lanes, subset: Lanes | Lane) {
  return (set & subset) === subset;
}
```

位合并

```typescript
export function mergeLanes(a: Lanes | Lane, b: Lanes | Lane): Lanes {
  return a | b;
}
```

从 set 对应 lanes 移除 subset 对应的 lane

```typescript
export function removeLanes(set: Lanes, subset: Lanes | Lane): Lanes {
  return set & ~subset;
}
```
