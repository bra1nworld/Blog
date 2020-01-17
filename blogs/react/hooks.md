# React Hooks

## 一.组件类的缺点

React的核心是组件，16.8之前，组件的标准写法是类

```typescript
import React,{Component} from 'react';
export default class Button extends Component{
    constructor(){
        super()
        this.state={
            buttonText:'click me'
        }
        this.handleClick=this.handleClick.bind(this)
    }

    handleClick(){
        this.setState(()=>{
            return {buttonText:'Thanks'}
        })
    }

    render(){
        const {buttonText}=this.state;
        return <button onClick={this.handleClick}>{buttonText}</button>
    }
}
```

这个组件类仅仅是一个按钮，但是可以看到，它的代码已经很‘重’了，真实的React App 由多个类按照层级，一层层构成，复杂度成倍增长，再加入Redux，就变得更复杂  
React的几个缺点：

* **大型组件很难拆分和重构，也很难测试**
* **业务逻辑分散在组件的各个方法之中，导致重复逻辑或关联逻辑**
* **组件类引入了复杂的编程模式，比如render props 和高阶组件**

## 二.函数组件

React团队希望，组件不要变成复杂的容器，最好只是数据流的管道，开发者根据需要，组合管道即可。**组件的最佳写法应该是函数，而不是类**。  
React早就支持函数组件，如下：

```typescript
function Welcome(props){
    return <h1>{props.name}</h1>
}
```

但是这种写法有重大限制，**必须是纯函数，不能包含状态，也不支持生命周期方法**，因此无法取代类。
&nbsp;
**React Hooks的设计目的，就是加强版的函数组件，完全不适用‘类’，就能写出一个全功能的组件**。

**React Hooks要解决的问题是状态共享**，是继render-props和higher-order components之后的第三种状态共享方案，不会产生jsx嵌套地狱问题  
这个状态指的是状态逻辑，所以称为**状态逻辑复用**更恰当，因为共享数据处理逻辑，不会共享数据本身

## 三.常用hooks

**React Hooks的意思是，组件尽量写成纯函数，如果需要外部功能和副作用，就用钩子把外部代码‘钩’进来**。React Hooks就是这些钩子  
几个最常用的钩子函数：

* useState()
* useContext()
* useReducer()
* useEffect()
* useMemo()
* useCallback()

### 1.useState

```typescript
import React, { useState } from "react";

export default function  Button()  {
  const  [buttonText, setButtonText] =  useState("Click me,   please");

  function handleClick()  {
    setButtonText("Thanks, been clicked!");
  }

  return  <button  onClick={handleClick}>{buttonText}</button>;
}
```

### 2.useContext

有两个组件Navbar 和Messages之间共享状态

```typescript
const AppContext=React.createContext({})

<AppContext.provider value=({
    username:'name'
})>
<div class='App'>
    <Navbar/>
    <Messages/>
</div>
</Appcontext.Provider>
```

AppContext.Provider提供了一个Context对象，这个对象可以被子组件共享

```typescript
const Navbar=()=>{
    const {username}=useContext(AppContext);
    return (
        <p>{username}</p>
    )
}
```

### 3.useReducer

```typescript
const [state,dispatch]=useReducer(reducer,initialState)

```

useReducer的基本用法，它接受Reducer函数和状态的初始值作为参数，返回一个数组。数组的第一个成员是状态的当前值，第二个成员是发送action的dispatch函数

```typescript
const myReducer=(state,action)=>{
    switch(action.type){
        case 'countUp':
            return {
                ...state,
                count:state.count+1
            }
        default :
        return state
    }
}


function App(){
    const [state,dispatch]=useReducer(myReducer,{count:0})
    return (
        <div>
            <button onClick={()=>dispatch({type:'countUp'})}>
            +1
            </button>
        </div>
    )
}

```

由于Hooks可以提供共享状态和Reducer函数，所以它在这些方面可以取代Redux，但是，它没法提供中间件（middleware）和时间旅行（timetravel），如果需要用到这两个功能，还是需要用redux

### 4.useEffect

useEffect用来引用具有副作用的操作，最常见的就是向服务器请求数据，以前，放在componentDidMount里面的代码，现在可以放在useEffect中

```typescript
const Person=({personId})=>{
    const [loading,setLoading]=useState(true)
    const [person,setPerson]=useState({})

    useEffect(()=>{
        setLoading(true);
        fetch(`http://xxx.xxx`)
            .then(response=>response.json())
            .then(data=>{
                setPerson(data)
                setLoading(false)
            })
    },[personId])

    if(loading === true){
        return <p> Loading </p>
    }

    return <div>{person.name}</div>
}
```

### 5.useMemo useCallback

useCallback和useMemo的参数useEffect一致，他们之间最大的区别是useEffect会用于处理副作用，而前两个hooks不能
&nbsp;
**useMemo和useCallback都会在组件第一次渲染的时候执行，之后会在其依赖的变量发生变化时再次执行；并且这两个hooks都会返回缓存的值，useMemo返回缓存的变量，useCallback返回缓存的函数**
&nbsp;

场景：一个父组件，其中包含子组件，子组件接受一个函数作为props；通常而言，如果父组件更新了，子组件也会执行更新；但是大多数场景下，更新是没有必要的，我们可以借助useCallback来返回函数，然后把这个函数作为props传递给子组件；这样，子组件就能避免不必要的更新

```javascript
import React,{useState,useCallback,useEffect} from 'react';
function Parent(){
    const [count,setCount]=useState(1);
    const [val,setVal]=useState('');

    const callback=useCallback(()=>{
        return count;
    },[count])

    return <div>
        <h2>{count}</h2>
        <Child callback={callback}></Child>
        <div>
            <button onClick={()=> setCount(count+1)}>+</button>
            <input value={val} onChange={event=>setVal(event.target.value)} />
        </div>
    </div>
}

function Child({callback}){
    const [count,setCount]=useState(()=>callback())

    useEffect(()=>{
        setCount(callback())
    },[callback])

    return <div>{count}</div>
}

```

## 四.React Hooks的特点

* 1.多个状态不会产生嵌套，写法还是铺平的（renderProps可以通过compose解决,可不但使用略微繁琐，而且应为强制封装一个新对象而增加实体数量）
* 2.Hooks可以引用其他Hooks
* 3.更容易将组件的UI和状态分离

## 五.React Hooks带来的变化

### 1.Hooks带来的约定

Hook函数必须以use命名开头，因为这样才方便selint做检查，**防止用condition判断包裹useHook语句**
&nbsp;
为什么不能用condition包裹useHook语句：
&nbsp;
React Hooks并不是通过Proxy或者getters实现的，而是通过数组实现的，当状态改变依次执行多个hooks时，每次useState都会改变下标，如果useState被包裹在condition中，那每次执行的下标可能对不上，导致useState导出的setter更新错数据。**Hook的调用顺序在每次渲染中都是相同的**。

### 2.状态与UI的界限会越来越清晰

因为React Hooks的特性，如果一个Hook不产生UI，那么它可以永远被其他Hook封装，虽然允许副作用，但是被包裹在useEffect里，总体来说还是函数式的。而Hooks要集中在UI函数顶部写，也很容易养成书写无状态UI组件的好习惯，践行‘状态与UI分开’这个理念会更容易。

## 六.React Hooks实践

### 1.DOM副作用修改/监听

一节看上去和组件关系不大的麻烦事，比如修改页面标题（切换页面记得改成默认标题），监听页面大小变化（组件销毁记得取消监听），断网时提示（一层层装饰器要堆成小山了）。而React Hooks特别擅长这种事

>由于React Hooks降低了高阶组件使用成本，那么一套生命周期才能完成的‘杂耍’将变得非常简单

#### 1)修改页面title

直接在useEffect中修改title，在销毁时再次给一个默认标题即可，这个简单的函数可以抽象在项目工具函数里，每个页面组件都需要调用

```javascript
function useDocumentTitle(title){
    useEffect(
        ()=>{
            document.title=title;
            return ()=> {
                document.title='old title'
            }
        }
    )
}
```

#### 2)监听页面大小变化，网络是否断开

效果：在组件调用useWindowSize时，可以拿到页面大小，并且在浏览器缩放时自动触发组件更新

```javascript
const windowSize=useWindowSize()
return <div>页面高度：{windowSize.innerWidth}</div>
```

实现：和标题思路基本一致，这次从window.innerHeight等API直接拿到页面高宽即可，注意此时可以用window.addEventListener('resize')监听页面大小变化，此时调用setValue将会触发调用自身的UI组件rerender

```javascript
function getSize(){
    return {
        innerHeight:window.innerHeight,
        innerWidth:window.innerWidth,
        outerHeight:window.outerHeight,
        outerWidth:window.outerWidth
    }
}

function useWindowSize(){
    let [windowSize,setWindowSize]=useState(getSize());

    function handleResize(){
        setWindowSize(getSize())
    }

    useEffect(()=>{
        window.addEventListener('resize',handleResize)
        return ()=>{
            window.removeEventListener('resize',handleResize)
        }
    },[])

    return windowSize
}
```

#### 3) 动态注入CSS

效果：在页面注入一段class，并且当组件销毁时，移除这个class

```javascript
const className=useCss({
    color:'red'
})

return <div className={className}> text </div>
```

### 2.组件辅助

#### 1) 获取组件宽高

效果：通过调用useComponentSize拿到某个组件ref实例的高宽，并在高宽变化时，rerender并拿到最新的宽高

```javascript
const ref=useRef(null);
let componentSize=useComponentSize(ref)

return (
    <>
    {componentSize.width}
    <textArea ref={ref}>
    </>
)
```

实现：和DOM监听类似，这次换成了利用ResizeObserver对组件ref进行监听，同时在组件销毁时，销毁监听。  
其本质还是监听一些副作用，但通过ref的传递，可以对组件粒度进行监听和操作

```javascript
useLayoutEffect(()=>{
    handleResize()

    let resizeObserver=new ResizeObserver(()=>handleResize())
    resizeObserver.observe(ref.current)

    return ()=>{
        resizeObserver.disconnect(ref.current)
        resizeObserver=null
    }
},[])
```

#### 2)拿到onChange抛出的值

效果：通过useInputvalue()拿到Input框当前用户输入的值，而不是手动监听onChange再通过一个otherInputValue和一个回调函数把这一堆逻辑写在无关的地方

```javascript
let name=useInputValue('jake')
//name={value:'Jamie',onChange:[Function]}
return <input {...name}>
```

可以看到，这样不仅没有占用组件自己的state，也不需要手写onChange回调函数进行处理，这些处理都压缩成了一行use hook  
实现：

```javascript
function useInputValue(initialValue){
    let [value,setValue]=setState(initialValue)
    let onChange=useCallback(function(event){
        setValue(event.currentTarget.value)
    },[])

    return {
        value,
        onChange
    }
}
```

这里需要注意的时，我们对组件增强时，**组件的回调一般不需要销毁监听，而且仅需监听一次，这与DOM监听不同**，因此大部分场景，我们需要利用useCallback包裹，并传入一个空数组，来保证永远只监听一次，而且不需要在组件销毁时注销这个callback

### 3.做动画

利用React Hooks做动画，一般是拿到一些具有弹性变化的值，我们可以将值赋给进度条之类的组件，这样其进度变化就符合某种动画曲线

#### 1)弹性动画

效果：通过useSpring拿到动画值，组件以固定频率刷新，而这个动画值以弹性函数进行增减。
&nbsp;
实际调用方式一般是，先通过useState拿到一个值，再通过动画函数包住这个值，这样组件就会从原本的刷新一次，变成刷新N次，拿到的值也随着动画函数的规则变化，最后这个值会稳定到最终的输入值

```javascript
const [target,setTarget]=useState(50);
const value=useSpring(target);

return <div onClick={()=> setTarget(100)}>{value}</div>
```

实现：为了实现动画效果，需要依赖rebound库，它可以实现将一个目标值拆解为符合弹性动画函数过程的功能，那么我们需要利用React Hooks做的就是第一次接收到目标值是调用spring.setEndValue来触发动画事件，并在useEffect里做一次性监听，再值变时重新setValue即可  
setTarget联动useSpring重新计算弹性动画部分，是通过useEffect第二个参数实现的：

```javascript
useEffect(
    ()=>{
        if(spring){
            spring.setEndValue(targetValue)
        }
    },
    [targetValue]
)
```

也就是当目标值变化后，才会进行新的一轮rerender，所以useSpring并不需要监听调用处的setTarget，它只需要监听target的变化即可
