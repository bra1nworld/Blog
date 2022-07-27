# React生命周期

## Hooks组件

**函数组件**的本质是函数，没有state的概念的，因此**不存在生命周期**一说，仅仅是一个**render函数**而已  
但是引入Hooks之后就不同了，它能让组件在不使用class的情况下使用state以及其他的React特性，相比与class的生命周期概念来说，它更接近于实现状态同步，而不是响应生命周期。但是我们可以利用useState,useEffect()和useLayoutEffect()来模拟实现生命周期。  
即：**Hooks组件更接近于实现状态同步，而不是响应生命周期事件**

### Hooks组件对比类组件

- **constructor：** 函数组件不需要构造函数，我们可以通过调用useState来初始化state，如果计算比较麻烦，可以传一个函数给useState。

    ```javascript
    const [num,UpdateNum]=useState[0]
    ```

- **getDerivedStateFromProps:** 一般情况下用不到这个函数，可以在**渲染过程中更新state**，以达到实现getDerivedStateFromProps的目的

    ```javascript
    function scrillView({row}){
        let [isScrollingDown,setIsScrollingDown]=useState(false);
        let [prevRow,setPrevRow]=useState(null);

        if(row !== prevRow){
            setIsScrollingDown(prevRow!==null && row>prevRow);
            setPrevRow(row)
        }

        return `Scrolling down:${isScrollingDown}`
    }
    ```

    React会立即退出第一次渲染并用更新后的state重新运行组件以避免耗费太多性能

- **shouldConponentUpdate:**  可以用React.memo包裹一个组件来对它的props进行浅比较
    ```javascript
    const Button=React.memo((props)=>{
        //具体的组件
    })
    ```

    注意：**React.memo等效于PureComponent**，它只浅比较props。这里也可以使用useMemo优化每一个节点

-  **render：** 函数组件体本身

-  **componentDidMount,componentDidUpdate:** useLayoutEffect与他们两的调用阶段是一样的。推荐**一开始使用useEffect**，只有当它出问题的时候再尝试使用useLayoutEffect。useEffect可以表达所有这些的组合
    ```javascript
    // componentDidMount
    useEffect(()=>{
      // 需要在 componentDidMount 执行的内容
    }, [])

    useEffect(() => {
      // 在 componentDidMount，以及 count 更改时 componentDidUpdate 执行的内容
      document.title = `You clicked ${count} times`;
      return () => {
        // 需要在 count 更改时 componentDidUpdate（先于 document.title = ... 执行，遵守先清理后更新）
        // 以及 componentWillUnmount 执行的内容
      } // 当函数中 Cleanup 函数会按照在代码中定义的顺序先后执行，与函数本身的特性无关
    }, [count]); // 仅在 count 更改时更新
    ```

    **React会等待浏览器完成画面渲染之后才会延迟调用useEffect，因此会使得额外操作很方便**。

-  **componentWillUnmount:** 相当于useEffect里面重返回的cleanup函数

    ```javascript
    //componentDidMount/componnetWillUnmount
    useEffect(()=>{
        //需要在componenntDidMount执行的内容
        return function cleanup(){
            //需要在componentWillUnmount里执行的内容
        }
    }.[])
    ```

    componentDidCatch 和 getDerivedStateFromError:目前还没有这些方法的hook等价写法，但很快会加上

| class组件 | hooks组件 |
| - | - |
| constructor | useState |
| getDerivedStateFromProps | useState里面update函数 |
| shouldComponentUpdate | useMemo |
| render | 函数本身 |
| componentDidMount | useEffect |
| componentDidUpdate | useEffect |
| componentWillUnmoung | useEffect返回的函数 |
| componentDidCatch | 无 |
| getDerivedStateFromError | 无 |

## 单个组件的生命周期

### 1.生命周期

v16.3之前

#### 挂载阶段

* constructor：避免将props的值复制给state
* componentWillMount
* render：react最重要的步骤，创建虚拟dom，进行diff算法，更新dom树都在此进行
* componentDidMount

#### 组件更新阶段

* componentWillReceiveProps
* shouldComponentUpdate
* componentWillUpdate
* render
* componentDidUpdate

#### 卸载阶段

* componentWillUnMount

![生命周期](../../resource/blogs/images/React生命周期/react16.3以前生命周期.png)

这种生命周期存在一个问题：**当更新复杂组件的最上层组件时，调用栈会很长，如果在进行复杂操作时，可能长时间阻塞主线程，带来用户体验不好，Fiber就是为了解决这个问题**

v16.3之后  

**Fiber本质上是一个虚拟的堆栈帧，新的调度器会按照优先级自由调度这些帧，从而将之前的同步渲染改成了异步渲染，在不影响体验的情况下去分段计算更新**。  
对于异步渲染，分为两阶段：  
1.reconciliation：

* componentWillMount
* componentWillReceiveProps
* shouldComponentUpdate
* componentWillUpdate

2.commit

* componentDidMount
* componentDidUpdate

其中，reconciliation阶段是可以被打断的，所以reconcilation阶段执行的函数就会出现多次调用的情况
&nbsp;
所以16.3引入了新的api来解决这个问题难：

* static getDerivedStateFromProps:该函数在**挂载阶段和组件更新阶段**都会执行，即**每次获取新的props或state之后都会被执行，在挂载阶段用来代替componentWillMount；在更新阶段配合componentDidUpdate**，可以覆盖componentWillReceiveProps的所有用法
&nbsp;
同时它是一个静态函数，所以函数体内不能访问this,会根据nextProps和prevState计算出预计的状态改变，返回结果会被送给setState，**返回null则说明不需要更新state，并且这个返回是必须的**
* getSnapshotBeforeUpdate:该函数会在**render之后，DOM更新前**被调用，用于读取最新的DOM数据
&nbsp;
返回一个值，**作为componentDidUpdate的第三个参数**；配合componentDidUpdate，可以覆盖componentWillUpdate的所有用法

&nbsp;
注意：v16.3中只用在组件挂载阶段或组件props更新过程才会调用,即如果是因为自身setState引发或者forceUpdate引发，而不是由父组件引发的话，那么static getDerivedStateFromProps也不会被调用，16.4版本中更正为都调用

&nbsp;
更新后的生命周期：

&nbsp;
1.挂载阶段

* constructor
* static getDerivedStateFromProps
* render
* componentDidMount

2.更新阶段

* static getDerivedStateFromProps
* shouldComponentUpdate
* render
* getSnapshotBeforeUpdate
* comonentDidUpdate

3.卸载阶段

* componentWillUnmount

### 2.生命周期的误区

#### 误解一：getDerivedStateFromProps和componentWillReceiveProps只会在props改变时才会调用

实际上，**只要父级重新渲染，getDerivedStateFromProps和componentWillReceiveProps都会重新调用，不管props有没有变化**，所以，在这两个方法内直接将props赋值到state是不安全的。

```javascript
//子组件
class PhoneInput extends Component{
    state={phone:this.prps.phone};

    handleChange=e=>{
        this.setState({phone:e.target.value})
    }

    componentWillReceiveProps(nextProps){
        //不要这么做
        //这样会覆盖掉之前所有的组件内state更新
        this.setState({phone:nextProps.phone})
    }

    render(){
        const {phone}=this.state;
        return <input onChange={this.handleChange} value={phone}>
    }
}

//父组件
class App extends Component{
    constructor(){
        super();
        this.state={
            count:0
        }
    }

    componentDidMount(){
        //使用了setInterval,使得App每秒钟渲染一次
        this.interval=setInterval(
            ()=>this.setState(prevState=>({
                count:prevState.count+1
            })),1000
        )
    }

    componentWillUnmount(){
        clearInterval(this.interval)
    }

    render(){
        return (<></>)
    }
}
```

当然，我们可以在父组件App中shouldComponentUpdate比较props的email是不是修改再决定要不要重新渲染，但是如果子组件接收多个props（较为复杂），就很难处理，而且shouldComponentUpdate主要是用来提升性能的，不推荐开发者操作shouldCompoentUpdate(可以使用React.pureComponent)

&nbsp;

我们也可以使用**在props变化后修改state**

```javascript
class PhoneInput extends Component {
  state = {
    phone: this.props.phone
  };

  componentWillReceiveProps(nextProps) {
    // 只要 props.phone 改变，就改变 state
    if (nextProps.phone !== this.props.phone) {
      this.setState({
        phone: nextProps.phone
      });
    }
  }
  
  // ...
}
```

这种也会导致一个问题，当props较为复杂时，props与state的关系不好控制，可能导致问题

&nbsp;

解决方案一：**完全可控的组件**

```javascript
function PhoneInput(props){
    return <input onChange={props.onChange} value={props.phone}/>
}
```

**完全由props控制，不派生state**。

&nbsp;

解决方案二：**有key的非可控组件**

```javascript
class PhoneInput extends Component {
  state = { phone: this.props.defaultPhone };

  handleChange = event => {
    this.setState({ phone: event.target.value });
  };

  render() {
    return <input onChange={this.handleChange} value={this.state.phone} />;
  }
}

<PhoneInput
  defaultPhone={this.props.user.phone}
  key={this.props.user.id}
/>
```

当key变化时，**React会创建一个新的，而不是更新一个既有的组件**

#### 误解二：将props的值直接复制给state

**应避免将props的值复制给state**。

```javascript
constructor(props){
    super(props)
    //千万不要这么做
    //直接用props，保证单一数据源
    this.state={phone:props.phone}
}
```

## 三.多个组件的执行顺序

### 1.父子组件

#### 1).挂载阶段

* 第一阶段，由父组件开始执行到自身的render，解析其下有哪些子组件需要渲染，并对其中**同步的子组件**进行创建，按**递归顺序**挨个执行各个子组件至render,生成到父子组件对应的VirtualDOM树，并commit到DOM
* 第二阶段，此时DOM节点已经生成完毕，组件挂载完成，开始后续流程，先依次触发同步子组件各自的componentDidMount，最后触发父组件的

**注意：如果父组件中包含异步子组件，则会在父组件挂载完成后创建**。  
最后执行顺序：
&nbsp;
父组件getDerivedStateFromProps -> 同步子组件getDerivedStateFromProps -> 同步子组件componentDidMount -> 父组件componentDidMount -> 异步子组件getDerivedStateFromProps -> 异步子组件componentDidMount

#### 2).更新阶段

**React的设计遵循单向数据流模型**，也就是说，数据均由父组件流向子组件

* 第一阶段，由父组件开始，执行

1.static.getDerivedStateFromProps  
2.shouldComponentUpdate  
更新到自身的render，解析其下有哪些子组件需要渲染，并对**子组件**进行创建，按**递归顺序**挨个执行各个子组件至render，生成到父子组件对应的virtualDOM树，并与已有的Virtual DOM 树比较，计算出 **Virtual DOM真正变化的部分**，并只针对该部分进行的原生DOM操作

* 第二阶段，此时DOM节点已经生成完毕，组件挂载完成，开始后续流程，先依次触发同步子组件以下函数，最后触发父组件的  
1.getSnapshotBeforeUpdate  
2.componentDidUpdate  
React会按照上面的顺序依次执行这些函数，每个函数都是各个子组件的先执行，然后才是父组件的执行。最后顺序如下：

&nbsp;
父组件getDerivedStateFromProps -> 父组件shouldComponentUpdate -> 子组件getDerivedStateFromProps -> 子组件shouldComponentUpdate ->子组件getSnapshotBeforeUpdate -> 父组件getSnapshotBeforeUpdate -> 子组件componentDidUpdate -> 父组件componentDidUpdate

#### 3).卸载阶段

componentWillUnmount(),顺序为**父组件的先执行，子组件按照在jsx中定义的顺序依次执行各自的方法**  
**注意**：如果卸载旧组件的同时伴随有新组件的创建，新组件会先被创建并执行完render，然后卸载不需要的旧组件，最后新组件执行挂载完成的回调

### 2.兄弟组件

* **挂载阶段**

若是同步路由，他们的创建顺序和其在公共父组件中定义的先后顺序是一致的  
若是异步路由，他们的创建顺序和js加载完成的顺序一致

* **更新阶段，卸载阶段**

兄弟节点之间的通信主要是经过父组件（Redux和Context也是通过改变父组件传递下来的props实现的），**满足React的设计遵循单向数据流模型，因此任何两个组件之间的通信，本质上都可以归结为父子组件更新的情况**
