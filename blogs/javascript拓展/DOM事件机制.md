# DOM事件机制

## 一.DOM事件级别

共四个级别：DOM0级，DOM1级，DOM2级，DOM3级。而**DOM事件分为3个级别：DOM 0级事件处理，DOM 2级事件处理，DOM 3级事件处理**。由于DOM 1级中没有事件的相关内容，所以没有DOM 1级事件

### 1.DOM 0级事件

el.onClick=function(){}

```javascript
// 例1
var btn = document.getElementById('btn');
 btn.onclick = function(){
     alert(this.innerHTML);
 }
```

**同一个元素不能同时绑定多个同类型事件，这些方法都是在当前元素事件行为的冒泡阶段（或者目标阶段）执行的**。

### 2.DOM 2级事件

el.addEventListener(event-name , callback , useCapture)  
useCapture：**默认是false，代表事件在冒泡阶段执行**

```javascript
// 例2
var btn = document.getElementById('btn');
btn.addEventListener("click", test, false);
function test(e){
    e = e || window.event;
    alert((e.target || e.srcElement).innerHTML);
    btn.removeEventListener("click", test)
}
//IE9-:attachEvent()与detachEvent()。
//IE9+/chrom/FF:addEventListener()和removeEventListener()
```

### 3.DOM 3级事件

* UI事件：如：load，scroll
* 焦点事件：blur，focus
* 鼠标事件： mouseup，dbclick
* 滚轮事件： mousewheel
* 文本事件： textInput
* 键盘事件： keydown，keypress
* 合成事件： 当为IME（输入法编辑器）输入字符时触发，如：compositionstart
* 变动事件：当底层DOM结构发生变化时触发，如：DOMsubtreeModified
* 同时DOM 3级事件允许使用者自定义一些事件

## 二.DOM事件模型和事件流

**DOM事件模型分为捕获和冒泡**。

* 1.捕获阶段：事件从window对象自上而下向目标节点传播的阶段
* 2.目标阶段：真正的目标节点正在处理事件的阶段
* 3.冒泡阶段：事件从目标节点自下而上向window对象传播的阶段

## 三.事件代理（事件委托）

由于事件会在冒泡阶段向上传播到父节点，因此可以把子节点的监听函数定义在父节点上，由父节点的监听函数统一处理多个子元素的事件。  

### 优点

* 减少内存洗消耗，提高性能
* 动态绑定事件

### 实现

```javascript
// 给父层元素绑定事件
document.getElementById('list').addEventListener('click', function (e) {
  // 兼容性处理
  var event = e || window.event;
  var target = event.target || event.srcElement;
  // 判断是否匹配目标元素
  if (target.nodeName.toLocaleLowerCase === 'li') {
    console.log('the content is: ', target.innerHTML);
  }
});
```

## Event对象常见的应用

* **event.preventDefault()**

**如果调用这个方法，默认的事件行为将不再触发**，例如表单点击提交按钮（submit）跳转页面，a标签默认也哦面跳转或者锚点定位等  
a标签实现一个普通的按钮，不跳转，不锚点定位

```javascript
//方法一：
<a href="javascript:;">链接</a>

//方法二:
<a id="test" href="http://www.cnblogs.com">链接</a>
<script>
test.onclick = function(e){
    e=e||window.event;
    return false
}
</script>

//方法三：
<a id="test" href="http://www.cnblogs.com">链接</a>
<script>
test.onclick = function(e){
    e = e || window.event;
    e.preventDefault()
}
</script>
```

输入框最多只能输入六个字符：

```javascript
<input type="text" id='tempInp'>
<script>
    tempInp.onkeydown = function(ev) {
        ev = ev || window.event;
        let val = this.value.trim() //trim去除字符串首位空格（不兼容）
        // this.value=this.value.replace(/^ +| +$/g,'') 兼容写法
        let len = val.length
        if (len >= 6) {
            this.value = val.substr(0, 6);
            //阻止默认行为去除特殊按键（DELETE\BACK-SPACE\方向键...）
            let code = ev.which || ev.keyCode;
            if (!/^(46|8|37|38|39|40)$/.test(code)) {
                ev.preventDefault()
            }
        }
    }
 </script>
```

* **event.stopPropagation**

**阻止事件冒泡到父元素，防止任何父元素处理程序被执行**。

```javascript
 inner.onclick = function(ev) {
    console.log('inner');
    ev.stopPropagation();
}
```

* **stopImmediatePropagation**

**既能阻止事件向父元素冒泡，也能阻止元素同事件类型的其他监听器被触发**.

* **event.target & event.currentTarget**

```html
<div id="a">
  <div id="b">
    <div id="c"><div id="d"></div></div>
  </div>
</div>
<script>
  document.getElementById('a').addEventListener('click', function(e) {
    console.log(
      'target:' + e.target.id + '&currentTarget:' + e.currentTarget.id
    )
  })
  document.getElementById('b').addEventListener('click', function(e) {
    console.log(
      'target:' + e.target.id + '&currentTarget:' + e.currentTarget.id
    )
  })
  document.getElementById('c').addEventListener('click', function(e) {
    console.log(
      'target:' + e.target.id + '&currentTarget:' + e.currentTarget.id
    )
  })
  document.getElementById('d').addEventListener('click', function(e) {
    console.log(
      'target:' + e.target.id + '&currentTarget:' + e.currentTarget.id
    )
  })

//target:d&currentTarget:d
//target:d&currentTarget:c
//target:d&currentTarget:b
//target:d&currentTarget:a
</script>
```

event.target指引起触发事件的元素，而event.currentTarget则是事件绑定的元素，**event.currentTarget始终是监听事件者,event.target是事件的真正发出者**
