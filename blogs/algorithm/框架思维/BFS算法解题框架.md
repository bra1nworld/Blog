# BFS 算法解题框架

```typescript
/*
leecode:
111.二叉树的最小深度（简单）
752.打开转盘锁（中等）
*/
```

DFS 和 BFS 的区别：

DFS 算法就是回溯算法；

BFS 核心思想就是把一些问题抽象成图，从一个点开始，想四周开始扩散。一般来说 BFS 算法都是用【队列】这种数据结构，每次将一个节点周围的所有节点加入队列。

BFS 相对 DFS 最主要的区别是：**BFS 找到的路径一定是最短的，但代价就是空间复杂度比 DFS 大很多**。

## 一、算法框架

**BFS 本质就是让你在一幅【图】中找到从起点 start 到终点 target 的最近距离**。

```typescript
// 计算从起点start到终点target的最近距离
function BFS(start:Node,target:Node){
    // 核心数据结构
    let q:Node[];
    // 避免走回头路，大部分时候是必须的，但是像一般二叉树结构，没有子节点到父节点的指针，不会走回头路，就不需要visited
    let visited:Set<Node>;

    q.push(start);// 将起点加入队列
    visited.add(start);
    let step=0;// 记录扩散的步数

    while(q not empty){
        let l=q.length;
        // 将当前队列中的所有节点向四周扩散
        for(let i=0 ; i<l;i++){
            let cur=q.shift();
            // 划重点：判断是否到达终点
            if(cur is target) return step;
            // 将cur的相邻节点加入队列
            // cur.adj()泛指cur相邻的节点
            for(x of cur.adj()){
                if(!visited.has(x)){
                    q.push(x);
                    visited.add(x)
                }
            }
        }
        // 划重点：更新步数在这里
        step ++
    }
}
```

## 二叉树最小高度

**显然起点就是 root 根节点，终点就是最靠近根节点的那个【叶子节点】**，叶子节点就是两个子节点都是 null 的节点：

```typescript
if (cur.left === null && cur.right === null) {
  // 到达叶子节点
}
```

```typescript
// 给定二叉树[3,9,20,null,null,15,7]
function minDepth(root: TreeNode) {
  if (root == null) return 0;
  let q = [];
  q.push(root);
  // root 本身就是一层，depth初始化为1
  let depth = 1;

  while (q.length != 0) {
    let l = q.length;
    // 将当前队列中的所有节点向四周扩散
    for (let i = 0; i < l; i++) {
      let cur: TreeNode = q.shift();
      // 判断是否到达终点
      if (cur.left == null && cur.right == null) return depth;
      // 将cur的相邻节点加入队列
      if (cur.left != null) q.push(cur.left);
      if (cur.right != null) q.push(cur.right);
    }
    depth++;
  }
  return depth;
}
```

**1.为什么 BFS 可以找到最短距离，DFS 不行吗？**

首先，BFS 的逻辑，depth 每增加一次，队列中的所有节点都向前迈一步，这保证了第一次到达终点时，走的步数是最少的。

DFS 找最短路径，时间复杂度相对高很多，DFS 实际上是靠递归的堆栈记录走过的路径，若想找到最短路径，肯定需要把二叉树中所有树杈都搜索完才能对比得出最短的路径，而 BFS 借助队列做到一次一步【齐头并进】，是可以在不遍历完整树的条件下找到最短距离。

**2.BFS 的优势，为什么 DFS 还要存在？**

BFS 可以找到最短距离，但是空间复杂度高，而 DFS 空间复杂度较低。

以二叉树问题为例，假设给你的这个二叉树是满二叉树，节点数为 N，对 DFS 算法来说，空间复杂度无非就是递归堆栈，最坏情况下顶多就是树的高度，即 O(logN).

BFS 算法，队列中每次都会储存着二叉树一层的节点，这样的话最坏情况下空间复杂度应该是树的最底层节点的数量，也就是 N/2，用 Big O 表示的话就是 O(N)

BFS 一般是在找最短路径时使用 BFS，其他时候还是 DFS 使用得多一些（主要是递归代码好写）

## 揭开密码锁的最少次数

```typescript
// 0-9是个数字，自由旋转，初始数字是0000；deadends：一旦数字和列表里的任何一个元素形同就会永久锁定
```

每个节点有 8 个相邻的节点，让你求最短距离，即典型额 BFS，先写框架代码：

```typescript
function moveOne(s: string, index: number, directioin: 1 | -1) {
  const targetStr = s[index];
  let finalStr;
  if (direction === 1) {
    finalStr = targetStr === "9" ? "0" : targetStr + 1;
  } else {
    finalStr = targetStr === "0" ? "9" : targetStr - 1;
  }
}

// bfs框架，打印出所有可能的密码
function bfs(target: string) {
  const q = [];
  q.push("0000");

  while (q.length > 0) {
    let len = q.length;
    // 将当前队列中的所有节点向周围扩散
    for (let i = 0; i < len; i++) {
      let cur = q.shift();

      // 判断是否到达终点
      // ...

      // 将一个节点的相邻节点加入队列
      for (let j = 0; j < 4; j++) {
        let up = moveOne(cur, j, 1);
        let down = moveOne(cur, j, -1);
        q.push(up);
        q.push(down);
      }
    }
    // 增加步数
    // ...
  }
  return;
}
```

上述代码框架还有以下问题需要解决：

- 1.会走回头路，比如我们从‘0000’拨到‘1000’，但是等从队列拿出’1000‘时，还会拨出一个’0000‘，这样的话就会产生死循环。

- 2.没有终止条件，按照题目要求，我们找到 target 就应该结束并返回拨动的次数

- 3.没有对 deadends 的处理

优化后的代码：

```typescript
function openLock(deadends: string[], target: string) {
  // 记录需要跳过的死亡密码
  const deads = new Set();
  deadends.forEach((end) => {
    deads.add(end);
  });
  // 记录已经穷举过的密码，防止重复
  const visited = new Set();
  const q = [];
  // 从起点开始启动广度优先搜索
  let step = 0;
  q.push("0000");
  visited.add("0000");

  while (q.length > 0) {
    let len = q.length;
    // 将当前队列中的所有节点向周围扩散
    for (let i = 0; i < q; i++) {
      let cur = q.shift();

      // 判断是否到达终点
      if (deads.has(cur)) continue;
      if (cur === target) return step;

      // 将一个节点的未遍历相邻节点加入队列
      for (let j = 0; j < 4; j++) {
        let up = moveOne(cur, j, 1);
        if (!visited.contains(up)) {
          q.push(up);
          visited.add(up);
        }
        let down = moveOne(cur, j, -1);
        if (!visited.contains(down)) {
          q.push(down);
          visited.add(down);
        }
      }
    }
    // 增加步数
    step++;
  }
  return -1;
}
```

## 双向 BFS 优化

**传统的 BFS 框架就是从起点开始想四周扩散，遇到终点时停止，而双向 BFS 则是从起点和终点同时开始扩散，当两边有交集的时候停止**，从复杂度看，虽然最坏复杂度都是 O(N),但是双向 BFS 优化只需要遍历半棵树。

**双向 BFS 的局限性在于你必须知道终点在哪里**，对比上述两个例子，二叉树最小高度问题，不知道终点在哪里，就无法使用双向 BFS；但是第二个密码锁的问题，是可以用双向 BFS 算法来提高效率的。

```typescript
function openLock(deadends: string[], target: string) {
  // 记录需要跳过的死亡密码
  const deads = new Set();
  deadends.forEach((end) => {
    deads.add(end);
  });
  // 记录已经穷举过的密码，防止重复
  const visited = new Set();
  const q1 = new Set();
  const q2 = new Set();
  // 从起点开始启动广度优先搜索
  let step = 0;
  q1.add("0000");
  q2.add(target);

  while (!q1.isEmpty() && !q2.isEmpty()) {
    let temp = new Set();
    let len = q.length;
    // 将当前队列中的所有节点向周围扩散
    for (let cur of q1) {
      // 判断是否到达终点
      if (deads.has(cur)) continue;
      if (q2.has(cur)) return step;

      visited.add(cur);

      // 将一个节点的未遍历相邻节点加入队列
      for (let j = 0; j < 4; j++) {
        let up = moveOne(cur, j, 1);
        if (!visited.has(up)) {
          temp.add(up);
        }
        let down = moveOne(cur, j, -1);
        if (!visited.has(down)) {
          temp.add(down);
        }
      }
    }
    // 增加步数
    step++;
    // temp 相当于q1
    // 这里交换q1 q2，下一轮while就是扩散q2
    q1 = q2;
    q2 = temp;
  }
  return -1;
}
```

双向 BFS 还是遵循 BFS 算法框架的，只是**不再使用队列，还是 Set 方面快速判断两个集合是否有交集**。

另一个点就是**while 循环的最后交换 q1 和 q2 的内容，所以只要默认扩散 q1 就相当于轮流扩散 q1 和 q2**
