# interview

## React中Keys的作用是什么

Keys是React用于追踪哪些列表中元素被修改，被添加或者被移除的辅助标识。

```javascript
render(){
    return (
        <ul>
        {
            this.state.todoItems.map((item,key)=>{
                return <li key={key}>{item}</li>
            })
        }
        </ul>
    )
}
```

在开发过程中，我们需要保证某个元素的key在同级元素中具有唯一性。在React Diff算法中React会借助元素的key值来判断该元素是新近创建的还是被移动而来的元素，从而减少不必要的元素重渲染。此外，React还需要借助Key值来判断元素与本地状态的关联关系，因此我们绝不可忽视转换函数中Key的重要性

## 调用setState之后发生了什么

在代码中调用setState函数之后，React会将传入的参数对象和组件的当前状态合并，然后触发所谓的调和过程（Reconcilition）。经过调和过程，React会以相对高效的方式根据新的状态构建React元素树并且着手重新渲染整个UI界面。在React得到元素树之后，React会自动计算出新的树和老树的节点差异，然后根据差异对界面进行最小化重渲染。在差异计算算法中，React能够相对精确地直到哪些位置发生了变化以及应该如何改变，这就保证了按需更新，而不是全部重新渲染。

## React生命周期函数

1.初始化阶段：

* getDefaultProps:获取实例的默认属性
* getInitialState:获取每个实例的初始化状态
* componentWillMount:组件即将被装载，渲染到页面上
* render:组件在生成虚拟的DOM节点
* componentDidMount:组件真正再被装载之后

2.运行中状态：

* componentWillReceiveProps：组件将要接收到属性的时候调用
* shouldComponentUpdate:组件接受新属性或者新状态的时候（可以返回false，接收数据后不更新，阻止render调用，后面的函数不会被继续执行了）
* componentWillUpdate:组件即将更新不能修改属性和状态
* render:组件重新描绘
* componentDidUpdate:组件已经更新

3.销毁阶段

* componentWillUnmount:组件即将销毁

## React最新的生命周期（16以后）

React 16 之后有三个生命周期被废弃（但未删除）

* componentWillMount
* componentWillReceiveProps
* componentWillUpdate

1.挂载阶段

* constructor: 构造函数，最先被执行，我们通常在构建函数里初始化state对象或者给自定义方法绑定this
* getDerivedStateFromProps: statis getDerivedStateFromProps(nextProps,prevState),这是个静态方法，当我们接收到新的属性想去修改我们state，可以使用getDerivedStateFromProps
* render:render函数是纯函数,只返回需要渲染的东西,不应该包含其他的业务逻辑，可以返回原生的DOM，React组件,Fragment,字符串数字等
*componentDidMount:组件装载后调用，此时我们可以获取到DOM节点并操作，比如对服务器请求，订阅都可以写在这里，但是需要在componentWillUnmoung中取消订阅

2.更新阶段

* getDerivedStateFromProps:此方法在更新挂载阶段都可能调用
* shouldComponentUpdate:shouldComponentUpdate(nextProps,nextState),有两个参数nextProps和nextState，表示新的属性和变化之后的state，返回一个boolean
* render:更新阶段也会触发此生命周期
* getSnapshotBeforeUpdate:getSnapshotBeforeUpdate(prevProps,prevState),这个方法在render之后，componentDidUpdate之后调用，这个函数有一个返回值，会作为第三个参数传给componentDidUpdate，如果你不想要返回值，可以返回null，此生命周期必须与componentDidUpdate搭配使用
* componentDidUpdate:componentDidUpdate(prevProps,prevState,snapshot)，该方法在getSnapshotBeforeUpdate方法之后被调用，有三个参数prevProps,prvState,snapshot,如果触发某些回调函数时需要用到DOM元素的状态，则将对比或计算的过程迁移至getSnapshotBeforeUpdate,然后componentBeforeUpdate，然后componentDidUpdate中统一触发回调或更新状态

3.卸载阶段

* componentWillUnmount

## shouldComponentUpdate是做什么的（react性能优化是哪个周期函数）

shouldComponentUpdate这个方法用来判断是否需要render方法重新描绘dom。因为dom的描绘非常消耗性能，如果我们能在shouldComponentUpdate方法中能够写出更优化的dom diff算法，可以极大地提高性能

## 为什么虚拟dom会提高性能

虚拟dom相当于在js和真实dom中间加了一个缓存，利用dom diff算法避免了没有必要的dom操作，从而提高性能。  
用javascript对象结构表示DOM树的结构；然后用这个树构建一个真正的DOM树，插到文档当中状态变更的时候，重新构造一颗新的对象树。然后用新的树和旧的树进行比较，记录两棵树差异把2所记录的差异应用到步骤1所构建的真正的DOM树上，视图就更新了  

**Virtual DOM 真正的价值从来都不是性能，而是它**  
1) 编写可维护性的代码，提升研发效率，为函数式的 UI 编程方式打开了大门；  
2) 跨平台，可以渲染到 DOM 以外的 backend，比如 ReactNative。  

**原生 DOM 操作 vs. 通过框架封装操作。**  
这是一个性能 vs. 可维护性的取舍。框架的意义在于为你掩盖底层的 DOM 操作，让你用更声明式的方式来描述你的目的，从而让你的代码更容易维护。没有任何框架可以比纯手动的优化 DOM 操作更快，因为框架的 DOM 操作层需要应对任何上层 API 可能产生的操作，它的实现必须是普适的。针对任何一个 benchmark，我都可以写出比任何框架更快的手动优化，但是那有什么意义呢？在构建一个实际应用的时候，你难道为每一个地方都去做手动优化吗？出于可维护性的考虑，这显然不可能。框架给你的保证是，你在不需要手动优化的情况下，我依然可以给你提供过得去的性能。   

**React 从来没有说过 “React 比原生操作 DOM 快”。**   
React 的基本思维模式是每次有变动就整个重新渲染整个应用。如果没有 Virtual DOM，简单来想就是直接重置 innerHTML。很多人都没有意识到，在一个大型列表所有数据都变了的情况下，重置 innerHTML 其实是一个还算合理的操作... 真正的问题是在 “全部重新渲染” 的思维模式下，即使只有一行数据变了，它也需要重置整个 innerHTML，这时候显然就有大量的浪费。我们可以比较一下   **innerHTML vs. Virtual DOM 的重绘性能消耗：**    

- innerHTML:  render html string O(template size) + 重新创建所有 DOM 元素 O(DOM size)
- Virtual DOM: render Virtual DOM + diff O(template size) + 必要的 DOM 更新 O(DOM change)Virtual DOM render + diff    

显然比渲染 html 字符串要慢，但是！它依然是纯 js 层面的计算，比起后面的 DOM 操作来说，依然便宜了太多。可以看到，innerHTML 的总计算量不管是 js 计算还是 DOM 操作都是和整个界面的大小相关，但 Virtual DOM 的计算量里面，只有 js 计算和界面大小相关，DOM 操作是和数据的变动量相关的。前面说了，和 DOM 操作比起来，js 计算是极其便宜的。  
这才是为什么要有 Virtual DOM：它保证了    

- 1）不管你的数据变化多少，每次重绘的性能都可以接受；  
- 2) 你依然可以用类似 innerHTML 的思路去写你的应用。  

## react diff原理

* 把树形结构按照层级分解，只比较同级元素
* 把列表结构的每个单元添加唯一的key，方便比较
* React只会匹配相同class的component
* 合并操作，调用component的setState方法的时候，React将其标记为dirty，到每一个事件循环结束，React检查所有标记dirty的component重新绘制
* 选择性子树渲染，开发人员可以重写shouldComponentUpdate提高diff性能

## React中的refs的作用是什么

Refs是React提供给我们的安全访问DOM元素或者某个组件实例的句柄。我们可以为元素添加ref属性然后在回调函数中接受该元素在DOM书中的句柄，该值会作为回调函数的第一个参数返回

```javascript
class CustomForm extends Component {
  handleSubmit = () => {
    console.log("Input Value: ", this.input.value)
  }
  render () {
    return (
      <form onSubmit={this.handleSubmit}>
        <input
          type='text'
          ref={(input) => this.input = input} />
        <button type='submit'>Submit</button>
      </form>
    )
  }
}
```

上述代码中的input域包含了一个ref属性，该属性申明的回调函数会接受input对应的DOM元素，我们将其绑定到this指针。

## 如果创建了类似下面的Twitter元素，那么它相关的类定义是什么样

```javascript
<Twitter username='tylermcginnis33'>
  {(user) => user === null
    ? <Loading />
    : <Badge info={user} />}
</Twitter>

import React, { Component, PropTypes } from 'react'
import fetchUser from 'twitter'
// fetchUser take in a username returns a promise
// which will resolve with that username's data.
class Twitter extends Component {
  // finish this
}
```

如果你还不熟悉**回调渲染模式**（Render Callback Pattern），这个模式中，**组件会接受某个函数作为其子组件，然后在渲染函数中以props.children进行调用**

```javascript
import React, { Component, PropTypes } from 'react'
import fetchUser from 'twitter'
class Twitter extends Component {
  state = {
    user: null,
  }
  static propTypes = {
    username: PropTypes.string.isRequired,
  }
  componentDidMount(){
      fetchUser(this.props.username)
        .then(user=>this.setState({user}))
  }
  render () {
    return this.props.children(this.state.user)
  }
}
```

这种模式的优势在于**将父组件和子组件解耦合，父组件可以直接访问子组件的内部状态，而不需要再通过props传递**，这样父组件能够更为方便的控制子组件展示的UI界面

## 展示组件（presentational component）和容器组件（Container component）之间的不同

* 展示组件关心组件看起来是什么。**展示专门通过props接收数据和回调**，并且几乎不会有自身的状态，但当展示组件拥有自身的状态时，通常也值关心UI状态而不是数据的状态
* 容器组件则更关心组件是如何运作的。**容器组件会为展示组件或者其他容器组件提供数据和行为**，他们会调用Flux actions，并将其作为回调提供给展示组件。容器组件经常有状态的，因为他们是（其他组件的）数据源

## 类组件（Class component）和函数式组件（Funcitonal component）之间的不同

* 类组件不仅允许使用更多的额外功能，如组件自身的状态和生命周期钩子，也能使组件直接访问store并维持状态
* 当组件仅是接受props，并将组件自身渲染到页面时，该组件就是一个‘无状态组件（stateless component）’,可以使用一个纯函数来创建这样的组件，这种组件也被称为哑组件或展示组件

## 组件的状态（state）和属性（props）的不同

* state是一种数据结构，用以组件挂载时所需数据的默认值。state可能会随着时间的推移而发生突变，但多数时候是作为用户事件行为的结果
* props则是组件的配置。props由父组件传递给子组件，并且就子组件而言，props是不可变更的。组件不能改变自身的props，但是可以把其子组件的props放在一起（统一管理）。props也不仅仅是数据--回调函数也可以通过props传递

## 受控组件（controlled component）

在HTML中，类似 input ，textarea select这样的表单元素会维护自身的状态，并基于用户的输入来更新。当用户提交表单时，前面提到的元素的值将随表单一起被发送。但在React中不同，包含**表单元素的组件将会在state中追踪输入的值，并且每次调用回调函数时，如onChange会更新state，重新渲染组件**，一个输入表单元素，他的值通过React的这种方式来控制，即为受控组件

## 高阶组件（higher order component）

**高阶组件是以一个组件为参数并返回一个新组件的函数**。HOC运行你重用代码，逻辑和引导抽象。最常见的可能是Redux的connect函数。除了简单分享工具库和简单组合，HOC最好的方式是共享React组件之间的行为。比如重构复用

## 为什么建议传递给setState的参数是一个callback而不是一个对象

因为this.props和this.state的更新可能是异步的，不能依赖他们来计算下一个state

## 除了在构造函数中绑定this,还有其他方式吗

可以使用属性初始值设定项来正确绑定回调，create-react-app也是默认支持的。在回调中你可以使用箭头函数，但问题是每次组件渲染的时候都会创建一个新的回调

## 在构造函数中调用super（props）的目的是什么

在super（）被调用之前，子类是不能使用this的，在ES6中子类必须在constructor中调用super()，传递props给super（）的原因则是便于（在子类中）能在constructor访问this.props

## 应该在React组件的何处发起ajax请求

应该在ComponentDidMount中发起网络请求。这个方法会在组件第一次‘挂载’（被添加到DOM）时执行，在组件的生命周期中仅会执行一次。更重要的是，你不能保证在组件挂载之前ajax请求已经完成，如果是这样，就意味着你将尝试在一个未挂载的组件上调用setState，这将不起作用。在componentDidMount中发起网络请求将保证这有一个组件可以更新了

## 事件在React中的处理方式

为了解决跨浏览器兼容性问题，React中的事件处理程序将传递到SyntheticEvent的实例中，它是React的浏览器本机事件的跨浏览器包装器。  
这些SyntheticEvent与原生事件具有相同的接口，除了它们在所有浏览器中都兼容。**React实际上并没有将事件附加到子节点本身。React将使用单个事件监听器监听顶层的所有事件。这对于性能是有好处的，也意味着在更新DOM时，React不需要担心跟踪事件监听器**

## createElement和cloneElement有什么区别

* createElement接收三个参数 第一个为标签名。如div，span，或React组件。第二个为传入的属性，第三个及之后的参数，皆作为组件的子组件

```javascript
React.createElement(
    type,
    [props],
    [...children]
)
```

* cloneElement接收三个参数，第一个是React元素，而不是标签名或者组件。**新添加的属性会并入原有的属性，传入到返回的新元素中，而旧的子元素将被替换**

```javascript
React.cloneElement(
    element,
    [props],
    [...children]
)
```

## React三种构建组件的方式

React.createClass,ES6 class ,无状态函数

## react组件的划分 业务组件 技术组件

* 根据组件的职责通常把组件分为UI组件和容器组件
* UI组件负责UI的呈现，容器组件负责管理数据和逻辑
* 两者通过React-Redux提供connect方法联系起来

## 简述flux思想

最大特点：数据‘单向流动’

* 用户访问view
* view发出用户的action
* dispatcher收到action，要求store进行相应更新
* store更新后，发出一个‘change’事件
* view收到‘change’事件后，更新页面

## 简述redux

* redux是一个引用数据流框架，主要解决了组件间状态共享的问题，原理是集中式管理。主要是三个核心方法：action，store，reducer，工作流程是view调用store的dispatch将action传入的store，reducer进行state操作，view通过store提供的getState获取最新的数据，Redux和Flex的区别：**Flex有多个store，在Flex中dispatcher被用来传递数据到注册的回调事件，Redux中只定义了一个可更新状态的store，redux把store和Dispathcer合并，结构更加清晰简单**
* 新增state，对状态的管理更加明确，通过redux，流程更加规范了，提高效率，缺点是当数据更新时，有时候组件不需要，也会重新绘制，有些影响效率。一般情况下，在构建多交互，多数据流的复杂项目中才会使用它们

## redux的缺点

* 一个组件所需要的数据必须由父组件传递过来，而不能向flex直接从store取
* 当一个组件数据更新时，即使父组件不需要用到这个组件，父组件还是会重新render，可能影响效率，或者需要写复杂的shouldComponentUpdate来判断
