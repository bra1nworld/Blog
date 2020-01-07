# 虚拟DOM原理

Virtual DOM是对DOM的抽象，本质上是Javascript对象，这个对象就是更加轻量级的对DOM的描述

## 为什么需要Virtual DOM

首先，我们都知道在前端性能优化的一个秘诀就是尽可能少的操作DOM，不仅仅是DOM相对较慢，更因为频繁变动DOM会造成浏览器的回流和重绘，这些都是性能杀手，因此我们需要这一层抽象，在patch过程中尽可能的一次性将差异更新到DOM中
&nbsp;
现代前端框架一个基本要求就是无须手动操作DOM，一方面是因为手动操作DOM无法保证程序性能，多人协作的项目中如果review不严格，可能会有开发者写出写能较低的代码，另一方面更重要的是省去手动DOM操作大大提高开发效率
&nbsp;
最后也是Vitrual DOM最初的目的，就是更好的跨平台，比如Node.js就没有DOM，如果要是先SSR，其中一个方式就是借助Virtual DOM，应为Virtual DOM是javascript对象

## Virtual DOM关键要素

### Virtual DOM的创建

```javascript
/**
 * 生成 vnode
 * @param  {String} type     类型，如 'div'
 * @param  {String} key      key vnode的唯一id
 * @param  {Object} data     data，包括属性，事件等等
 * @param  {Array} children  子 vnode
 * @param  {String} text     文本
 * @param  {Element} elm     对应的 dom
 * @return {Object}          vnode
 */
function vnode(type, key, data, children, text, elm) {
  const element = {
    __type: VNODE_TYPE,
    type, key, data, children, text, elm
  }

  return element
}
```

这个函数很简单，接受一定的参数，再根据这些参数返回的一个对象，这个对象就是DOM的抽象

### Virtual DOM Tree的创建

上面已经申明了一个vnode函数用于单个Virtual DOM的创建工作，但是我们都知道DOM其实是一个Tree

```javascript
function h(type,config,...children){
    const props={};
    let key=null;

    //获取key，填充props对象
    if(config !=null){
        if(hasValueKey(config)){
            key='' + config.key
        }

        for(let propName in config){
            if(hasOwnProperty.call(config,propName) && !RESERVED_PROPS[propName]){
                props[propName]=config[propName]
            }
        }
    }

    return vnode(
        type,
        key,
        props,
        flattenArray(children).map(c=>{
            return isPrimitive(c)?vnode(undefined,undefined,undefined,undefined,c):c
        })
    )
}
```

### Virtual DOM的更新

Virtual DOM归根结底是Javascript对象，我们得想办法将Virtual DOM与真实的DOM对应，也就是说，需要我们申明一个函数，此函数可以将vnode转化为真实DOM

```javascript
function createElm(vnode, insertedVnodeQueue) {
  let data = vnode.data
  let i
  // 省略 hook 调用
  let children = vnode.children
  let type = vnode.type

  /// 根据 type 来分别生成 DOM
  // 处理 comment
  if (type === 'comment') {
    if (vnode.text == null) {
      vnode.text = ''
    }
    vnode.elm = api.createComment(vnode.text)
  }
  // 处理其它 type
  else if (type) {
    const elm = vnode.elm = data.ns
      ? api.createElementNS(data.ns, type)
      : api.createElement(type)

    // 调用 create hook
    for (let i = 0; i < cbs.create.length; ++i) cbs.create[i](emptyNode, vnode)

    // 分别处理 children 和 text。
    // 这里隐含一个逻辑：vnode 的 children 和 text 不会／应该同时存在。
    if (isArray(children)) {
      // 递归 children，保证 vnode tree 中每个 vnode 都有自己对应的 dom；
      // 即构建 vnode tree 对应的 dom tree。
      children.forEach(ch => {
        ch && api.appendChild(elm, createElm(ch, insertedVnodeQueue))
      })
    }
    else if (isPrimitive(vnode.text)) {
      api.appendChild(elm, api.createTextNode(vnode.text))
    }
    // 调用 create hook；为 insert hook 填充 insertedVnodeQueue。
    i = vnode.data.hook
    if (i) {
      i.create && i.create(emptyNode, vnode)
      i.insert && insertedVnodeQueue.push(vnode)
    }
  }
  // 处理 text（text的 type 是空）
  else {
    vnode.elm = api.createTextNode(vnode.text)
  }

  return vnode.elm
}
```

根据type生成对应的DOM，把data里定义的各种属性设置到DOM上

### Virtual DOM的diff

[Virtual DOM diff](./diff算法.md)
