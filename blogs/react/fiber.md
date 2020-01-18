# React Fiber

在Virtual DOM操作之前，先通过VDOM前后对比得出更需要更新的部分，再去操作真实的DOM，减少了浏览器多次操作DOM的成本，这个过程叫做reconcilliation（协调算法），由于前端引用量级越来越大，reconciliation已经略显疲态，React Fiber是对React核心算法的重写。
&nbsp;
**Fiber本质上是一个虚拟的堆栈帧，新的调度器会按照优先级自由调度这些帧，从而将之前的同步渲染改成了异步渲染，在不影响体验的情况下去分段计算更新**

## 动机

VDOM工作原理：在react发布之初，设想未来的UI渲染会是异步的，从setState（）的设计和react内部的事务机制可以看出这一点。**在react16版本以前，reconciler采用自顶向下递归，从根组件或setState（）后的组件开始，更新整个子树**。如果组件树不大不会有问题，但是**当组件树越来越大，递归遍历的成本就越高，持续占用主线程，这样主线程上的布局，动画等周期性任务以及交互响应就无法立即得到处理**，造成顿卡的视觉效果。

## 工作原理

为解决js执行时间过长，就是fiber reconciler要做的事情，简而言之就是将要执行的js做拆分，保证不会阻塞主线程即可。

### 1.拆什么

react15中，更新主要分为两个步骤完成：

* diff diff的实际工作是对比preInstance和nextInstance的状态,找出差异及其对应的VDOM change，diff本质上是一些计算（遍历，比较），是可拆分的（算一半待会接着算）
* patch 将diff算法出来的差异队列更新到真实的DOM节点上，React并不是计算出一个差异就执行一次patch，而是计算出全部差异并放入差异队列后，再一次性的去执行patch方法完成真实的DOM更新

最后的patch阶段更新，是一连串的DOM操纵，虽然可以根据diff后得到的change list做拆分，但是意义不大，不仅导致内部维护的DOM状态和实际的不一致，也会影响体验，所以应该做的是对diff阶段进行拆分，从ReactDOM渲染10000个子组件的过程，可以看到在diff执行阶段主线程一直被占用，无法进行其他任何操作I/O操作，直到运行完成

### 2.怎么拆

由此引出了React Fiber的解决方案，以一个fiber为单位来进行拆分，fiber tree是根据VDOM tree构造出来的，树形结构完全一致，只是包含的信息不同，以下是fiber tree节点的部分结构

```javascript
{
    alternate: Fiber|null, // 在fiber更新时克隆出的镜像fiber，对fiber的修改会标记在这个fiber上
    nextEffect: Fiber | null, // 单链表结构，方便遍历 Fiber Tree 上有副作用的节点
    pendingWorkPriority: PriorityLevel, // 标记子树上待更新任务的优先级
    stateNode: any, // 管理 instance 自身的特性
    return: Fiber|null, // 指向 Fiber Tree 中的父节点
    child: Fiber|null, // 指向第一个子节点
    sibling: Fiber|null, // 指向兄弟节点
}
```

Fiber依次通过return，child，及sibling的顺序对ReactElement做处理，将之前简单的树结构，变成了基于单链表的树结构，维护了更多的节点关系

### 3.执行顺序

**Stack在执行时是以一个tree为单位处理；Fiber则是以一个fiber的单位执行。Stack只能同步的执行，Fiber则可以针对该Fiber做调度处理**。也就是说，假设现在有个 Fiber 其单链表（Linked List）结构为 A → B → C，当 A 执行到 B 被中断的话，可以之后再次执行 B → C，这对 Stack 的同步处理结构来说是很难做到的。
&nbsp;
在React Fiber执行的过程中，主要分为两个阶段（phase）：

* render/reconciliation(interruptible)
* commit(not interruptible)

第一阶段主要工作是自顶向下构建一个完整的Fiber Tree，在rerender的过程中，根据之前生成的树，构建名为workinProgress 的Fiber Tree用于更新操作。  
比如：在构建过程中，以一个fiber节点为单位自顶向下对比，如果发现跟节点没有发生变化，根据其child指针，把list节点复制到workingprogress Tree中，  
**每处理完一个fiber节点，react都会检查当前时间片是否够用，如果发现当前时间片不够用了，就会标记下一个要处理的任务优先级，根据优先级来决定下一个时间片要处理什么任务**

> requestIdleCallback会让一个低优先级的任务在空闲期被调用，而requestAnimationFrame会让一个高优先级的任务在下一个栈桢被调用，从而保证了主线程按照优先级执行fiber单元  
> 优先级顺序为：文本框输入>本次调度结束需完成的任务>动画过渡>交互反馈>数据更新>不会显示但以防将来会显示的任务

当reconciliation结束后，根节点的effect list里记录了包括DOM change在内的所有side effect ，在第二阶段commit 执行更新操作，这样一个完整的流程。

## tip

生命周期大换血在react 16版本中，虽然依旧支持之前的生命周期，但是官方已经说明在下个版本将会废弃其中的部分，这么做的原因，**主要是reconciliation的重写导致。在render/reconciliation的过程中，因为存在优先级和时间片的概念，一个任务很可能执行到一半就被其他优先级更高的任务所替代，或者因为时间原因被终止，当再次执行这个任务时，是从头开始执行一遍，就会导致组件的某些will生命周期函数可能被多次调用而影响性能**.
