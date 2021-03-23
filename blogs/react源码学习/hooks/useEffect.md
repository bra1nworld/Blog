# useEffect

commit 阶段流程中

> 在 flushPassiveEffects 方法内部会从全局变量 rootWithPendingPaddiveEffects 获取 effectList

## flushPassiveEffectsImpl

flushPassiveEffects 内部会设置优先级，并执行 flushPassiveEffectsImpl.  
flushPassiveEffects 主要做三件事：

- 调用该 useEffect 在上一次 render 时的销毁函数
- 调用该 useEffect 在本次 render 时的回调函数
- 如果存在同步任务，不需要等待下次时间循环的宏任务，提前执行它

在 v16 中第一步是同步执行的，在官方博客中提到：

> 副作用清理函数（如果存在）在 React16 中同步运行。我们发现，对于大型应用程序来说，这不是理想选择，因为同步会减缓屏幕的过度（例如，切换标签）
> 基于这个原因，在 v17 中，useEffect 的两个阶段会在页面渲染后（layout 阶段后）异步执行。（事实，从代码来看：16.13.1 已经是异步执行了）

## 阶段一：销毁函数的执行

useEffect 的执行需要保证所有组件 useEffect 的销毁函数必须都执行完才能执行任意一个组件的 useEffect 的回调函数。  
这是因为多个组件间可能公用同一个 ref。  
如果不是按照“全部销毁”再“全部执行”的顺序，那么在某个组件 useEffect 的销毁函数中修改的 ref.current 可能影响到另一个组件 useEffect 的回调函数中的同一个 ref 的 current 属性。  
在 useLayoutEffect 中也有同样的问题，所以他们都遵循“全部销毁”再“全部执行”的顺序。  
在阶段一，会遍历并执行所有 useEffect 的销毁函数。

```typescript
// pendingPassiveHookEffetsUnmount中保存了所有需要执行销毁的useEffect
const unmountEffects = pendingPassiveHookEfectsUnmount;
pendingPassiceHooksUnmount=[];

// pedningPassiveHookEffectsUnmount数组的索引i保存需要销毁的effect，i+1保存该effect对应的fiber
for (let i = 0; i < unmountEffects.length; i+=2) {
    const effect=((unmountEffects[i]:any):HookEffect)
    const fiber=((unmountEffects[i+1]:any):Fiber);
    const destory=effect.destory;
    effect.destroy=undefined;

    if(typeof destory === 'function'){
        //销毁函数存在则执行
        try {
            destroy()
        } catch (error) {
            captureCommitPhaseError(fiber,error)
        }
    }
}
```

向 pendingPassiveHookEffectsUnmount 数组内 push 数据的操作发生在 layout 阶段 commitLayoutEffectOnFiber 方法内部的 shedulePassiveEffects 方法中

```typescript
function schedulePassiveEffects(finishedWork:Fiber){
    const updateQueue:FunctionComponentUpdateQueue | null =(finishedWork.updateQueue: any);
    const lastEffect = updateQueue !== null ? updateQueue.lastEffect:null;
    if(lastEffect !== null){
        const firstEffect = lastEffect.next;
        let effect=firstEffect;
        do{
            const {next,tag}=effect;
            if(
                (tag & HookPassive) !== NoHookEffect &&
                (tag & HookHasEffect ) !== NoHookEffect
            ){
                // 向pendingPassiveHookEffectsUnmount 数组内push要销毁的effect
                enqueuePendingPassiveHookEffectUnmount(finishedWork,effect)
                // 向pendingPassiveHookEffectsMount 数组内push要执行回调的effect
                enqueuePendingPassiveHookEffectmount(finishedWork,effect)
            }
            effect=next;
        }while (effect!==firstEffect)
    }
}
```

## 阶段二：回调函数的执行

与阶段一类似，同样遍历数组，执行对应 effect 的回调函数  
其中向 pendingPassiveHookEffectsMount 中 push 数据的操作同样发生在 schedulePassiveEffects 中

```typescript
// pendingPassiveHookEffetsMount中保存了所有需要执行回调的useEffect
const mountEffects = pendingPassiveHookEfectsMount;
pendingPassiveHookEffectsMount=[];

// pendingPassiveHookEffectsMount数组的索引i保存需要执行回调的effect，i+1保存该effect对应的fiber
for (let i = 0; i < mountEffects.length; i+=2) {
    const effect=((mountEffects[i]:any):HookEffect)
    const fiber=((mountEffects[i+1]:any):Fiber);
        try {
            const create = effect.create;
            effect.destroy=create()
        } catch (error) {
            captureCommitPhaseError(fiber,error)
        }

}
```
