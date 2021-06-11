# BFS 算法解题框架

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
