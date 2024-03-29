# 多节点 Diff

考虑一个 FunctionComponent

```tsx
function List() {
  return (
    <ul>
      <li key="0">0</li>
      <li key="1">1</li>
      <li key="2">2</li>
      <li key="3">3</li>
    </ul>
  );
}
```

它的返回值 jsx 对象的 children 属性不是单一节点，而是包含四个对象的数组

```typescript
{
    $$typeof:Symbol,
    key:null,
    props:{
        children: [
            {$$typeof: Symbol(react.element), type: "li", key: "0", ref: null, props: {…}, …}
            {$$typeof: Symbol(react.element), type: "li", key: "1", ref: null, props: {…}, …}
            {$$typeof: Symbol(react.element), type: "li", key: "2", ref: null, props: {…}, …}
            {$$typeof: Symbol(react.element), type: "li", key: "3", ref: null, props: {…}, …}
        ]
    },
    ref:null,
    type:'ul'
}
```

这种情况下，reconcileChildFibers 的 newChild 参数类型为 Array，在 reconcileChildFibers 函数内部对应如下情况：

```typescript
if (isArray(newChild)) {
  // 调用reconcileChildrenArray处理
  // ......
}
```

## 概览

### 情况 1：节点更新

```tsx
// 更新前
<ul>
    <li key = "0" className="before">0</li>
    <li key = "1">1</li>
</ul>

// 更新后 情况1 --- 节点属性变化
<ul>
    <li key = "0" className="after">0</li>
    <li key = "1">1</li>
</ul>

// 更新后 情况2 ———— 节点类型更新
<ul>
    <div key = "0">0</div>
    <li key = "1">1</li>
</ul>
```

### 情况 2：节点新增或减少

```tsx
// 更新前
<ul>
    <li key = "0">0</li>
    <li key = "1">1</li>
</ul>

// 更新后 情况1 --- 新增节点
<ul>
    <li key = "0">0</li>
    <li key = "1">1</li>
    <li key = "2">2</li>
</ul>

// 更新后 情况2 ———— 删除节点
<ul>
    <li key = "1">1</li>
</ul>
```

### 情况 3:节点位置变化

```tsx
// 更新前
<ul>
    <li key = "0">0</li>
    <li key = "1">1</li>
</ul>


// 更新后
<ul>
    <li key = "1">1</li>
    <li key = "0">0</li>
</ul>
```

同级多个节点的 Diff，一定属于以上三种情况中的一种或多种

## Diff 的思路

首先想到的方案：

- 1.判断当前节点的更新属于哪种情况。
- 2.如果是新增，执行新增逻辑。
- 3.如果是删除，执行删除逻辑。
- 4.如果是更新，执行更新逻辑。

按这个方案的前提是————**不同操作的优先级是形同的**；

但 React 团队发现，在日常开发中，相较于新增和删除，更新组件发生的频率更高，所以 Diff 会优先判断当前节点是否属于更新

> 当我们做数组相关的算法题时，经常使用双指针从数组头和尾同时遍历以提高效率，但是这里却不行。  
> 虽然本次更新的 JSX 对象 newChildren 为数组形式，但是和 newChildren 中每个组件进行比较的是 current fiber，同级的 Fiber 节点是由 sibling 指针链接形成的单链表，即不支持双指针遍历。

基于以上原因，Diff 算法的整体逻辑会经历两轮遍历：

第一轮：处理更新的节点。

第二轮：处理剩下的不属于更新的节点

## 第一轮遍历

- 1.let i=0,遍历 newChildren,将 newChildren[i]与 oldFiber 比较，判断 DOM 节点是否可复用。

- 2.如果可复用，i++,继续比较 newChildren[i]与 oldFiber.sibling，可以复用则继续遍历。

- 3.如果不可复用，分两种情况：

  a.key 不用则导致不可复用，立即跳出整个遍历，**第一轮遍历结束**

  b.key 相同 type 不同导致不可复用，会将 oldFiber 标记为 DELETION,并继续遍历

> 由于 fiber 是单链，所以有一处不同，后续的都不用考虑了

- 4.如果 newChildren 遍历完(即 i===newChildren.length -1) 或者 oldFiber 遍历完（即 oldFiber.sibling === null）,跳出遍历，**第一轮遍历结束**

### 步骤 3 跳出的遍历

此时 newChildren 没有遍历完，oldFiber 也没有遍历完

例子如下:

```typescript
// 更新前
<li key="0">0</li>
<li key="1">1</li>
<li key="2">2</li>

// 更新后
<li key="0">0</li>
<li key="2">1</li>
<li key="1">2</li>
```

第一个节点可复用，遍历到 key === 2 的节点发现 key 改变，不可复用，跳出遍历，等待第二轮遍历处理。  
此时 oldFiber 剩下 key === 1，key===2 未遍历，newChildren 剩下 key === 2、key===1 未遍历

### 步骤 4 跳出的遍历

可能 newChildren 遍历完，或 oldFiber 遍历完，或他们同时遍历完

```tsx
// 之前
<li key="0" className="a">0</li>
<li key="1" className="b">1</li>

// 之后 情况1 —— newChildren与oldFiber都遍历完
<li key="0" className="aa">0</li>
<li key="1" className="bb">1</li>

// 之后 情况2 —— newChildren没遍历完，oldFiber遍历完
// newChildren剩下 key==="2" 未遍历
<li key="0" className="aa">0</li>
<li key="1" className="bb">1</li>
<li key="2" className="cc">2</li>

// 之后 情况3 —— newChildren遍历完，oldFiber没遍历完
// oldFiber剩下 key==="1" 未遍历
<li key="0" className="aa">0</li>
```

## 第二轮遍历

对第一轮遍历的结果分别讨论：

### newChildren 与 oldFiber 同时遍历完

最理想情况：只需在第一轮遍历进行组件更新。此时 Diff 结束

### newChildren 没遍历完，oldFiber 遍历完

已有的 DOM 节点都复用了，这时还有新加入的节点，意味着本次更新有新节点插入，我们只需要遍历剩下的 newChilren 为生成的 workInProgress fiber 依次标记 Placement

### newChildren 遍历完，oldFiber 都未遍历完

意味着本次更新比之前节点数量少，有节点被删除了。所以需要遍历剩下的 oldFiber，一次标记 Deletion

### newChildren 与 oldFiber 都没遍历完

这意味着有节点在这次更新中改变了位置。 这是 Diff 算法最精髓也是最难懂的部分

## 处理移动的节点

由于有节点改变了位置，所以不能再用位置索引 i 对比前后的节点，那么如何才能将同一个节点在两次更新中对应上呢？

需要用到 key

为了快速找到 key 对应的 oldFiber，我们将所有还未处理的 oldFiber 存入以 key 为 key，oldFiber 为 value 的 Map 中

```typescript
const existingChildren = mapRemainingChildren(returnFiber, oldFiber);
```

接下来遍历剩余的 newChildren,通过 newChildren[i].key 就能在 existingChildren 中找到 key 相同的 oldFiber

## 标记节点是否移动

既然我们的目标是寻找移动的节点，那么我们需要明确：节点是否移动是以什么为参照物？

我们的参照物是：最后一个可复用的节点在 oldFiber 中的位置索引（用变量 lastPlacedIndex 表示）。

由于本次更新中节点是按 newChildren 的顺序排列。在遍历 newChildren 过程中，每个**遍历到的可复用节点**一定是当前遍历到的**所有可复用节点**中**最靠右的那个**，即一定在 lastPlaceIndex 对应的**可复用的节点**在本次更新中位置的后面。

那么只需要比较**遍历到的可复用节点**在上次更新时是否也在 lastPlacedIndex 对应的 oldFiber 后面，就能知道两次更新中这两个节点的相对位置改变没有。

我们用变量 oldIndex 表示**遍历到的可复用节点**在 oldFiber 中的位置索引。如果 oldIndex < lastPlacedIndex,代表本次更新该节点需要向右移动。lastPlacedIndex 初始为 0，每遍历一个可复用的节点，如果 oldIndex>=lastPlacedIndex，则 lastPlacedIndex=oldIndex

## Demo1

```ts
// 更新前
abcd

// 更新后
acdb

=== 第一轮遍历开始 ===
a（更新前） vs a（更新后）
key不变，可复用
此时 a 对应的oldFiber（更新前的a）在之前的数组（abcd）中索引为0
所以 lastPlacedIndex = 0;

继续第一轮遍历...

c （更新后） vs b（更新前）

key改变，不能复用，跳出第一轮遍历

此时lastPlacedIndex === 0
=== 第一轮遍历结束 ===


=== 第二轮遍历开始 ===
newChildren === cdb，没用完，不需要执行删除旧节点
oldFiber === bcd，没用完，不需要执行插入新节点

将剩余oldFiber（bcd）保存为map

// 当前oldFiber：bcd
// 当前newChildren：cdb

继续遍历剩余newChildren

key===c在oldFiber中存在

const oldIndex = c（更新前）.index
此时 oldIndex === 2; // 之前节点为abcd，所以c.index===2
比较 oldIndex 与 lastPlacedIndex

如果 oldIndex >= lastPlacedIndex 代表该可复用节点不需要移动
并将 lastPlacedIndex = oldIndex；
如果 oldIndex < lastPlacedIndex 该可复用节点之前插入的位置索引小于这次更新需要插入的位置索引，代表该节点需要向右移动

在例子中，oldIndex 2 > lastPlacedIndex 0,
则lastPlacedIndex = 2；
c 节点位置不变

继续遍历剩余newChildren

// 当前oldFiber:bd
// 当前newChildren：db

key === d 在 oldFiber中存在
const oldIndex = d（更新前）.index
oldIndex 3 > lastPlacedIndex 2 // 之前节点为abcd，所以d.index === 3
则 lastPlacedIndex = 3;
d节点位置不变

继续遍历剩余newChildren

// 当前oldFiber：b
// 当前newChildren：b

key === b 在oldFiber中存在
const oldIndex = b （更新前）.index;
oldIndex 1 < lastPlacedIndex 3 //之前节点为abcd，所以b.index ===1
则b节点需要向右移动
=== 第二轮遍历结束 ===

最终acd三个节点都没有移动，b节点被标记为移动
```

## Demo2

```ts
// 之前
abcd

// 之后
dabc

===第一轮遍历开始===
d（之后）vs a（之前）
key改变，不能复用，跳出遍历
===第一轮遍历结束===

===第二轮遍历开始===
newChildren === dabc，没用完，不需要执行删除旧节点
oldFiber === abcd，没用完，不需要执行插入新节点

将剩余oldFiber（abcd）保存为map

继续遍历剩余newChildren

// 当前oldFiber：abcd
// 当前newChildren dabc

key === d 在 oldFiber中存在
const oldIndex = d（之前）.index;
此时 oldIndex === 3; // 之前节点为 abcd，所以d.index === 3
比较 oldIndex 与 lastPlacedIndex;
oldIndex 3 > lastPlacedIndex 0
则 lastPlacedIndex = 3;
d节点位置不变

继续遍历剩余newChildren

// 当前oldFiber：abc
// 当前newChildren abc

key === a 在 oldFiber中存在
const oldIndex = a（之前）.index; // 之前节点为 abcd，所以a.index === 0
此时 oldIndex === 0;
比较 oldIndex 与 lastPlacedIndex;
oldIndex 0 < lastPlacedIndex 3
则 a节点需要向右移动

继续遍历剩余newChildren

// 当前oldFiber：bc
// 当前newChildren bc

key === b 在 oldFiber中存在
const oldIndex = b（之前）.index; // 之前节点为 abcd，所以b.index === 1
此时 oldIndex === 1;
比较 oldIndex 与 lastPlacedIndex;
oldIndex 1 < lastPlacedIndex 3
则 b节点需要向右移动

继续遍历剩余newChildren

// 当前oldFiber：c
// 当前newChildren c

key === c 在 oldFiber中存在
const oldIndex = c（之前）.index; // 之前节点为 abcd，所以c.index === 2
此时 oldIndex === 2;
比较 oldIndex 与 lastPlacedIndex;
oldIndex 2 < lastPlacedIndex 3
则 c节点需要向右移动

===第二轮遍历结束===
```

我们以为从 abcd 变为 dabd，只需要将 d 移动到前面。

实际上 React**保持 d 不变，将 abc 分别移动到了 d 的后面**。

考虑性能，我们要尽量减少将节点从后面移动到前面的操作
