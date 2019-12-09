# label标签有哪些作用

1.利用 label 模拟'button'来解决不同浏览器原生 button 样式不同的问题

```html
<input type="button" id="btn" />
<label for="btn">Button</label>
<style>
    input[type="button"] {
        display: none;
    }
    label {
        display: inline-block;
        padding: 10px 20px;
        background: #456;
        color: #fff;
        cursor: pointer;
        box-shadow: 2px 2px 4px 0 rgba(0, 0, 0, 0.3);
        border-radius: 2px;
    }
</style>
```


2.input 的 forcs 事件会触发锚地定位。可以利用 label 当触发器实现选项卡切换效果[实例地址](https://demo.cssworld.cn/6/4-3.php)  
> 纯 CSS 实现点击切换效果  

```html
<div class="box">
    <div class="list"><input id="one" readonly />1</div>
    <div class="list"><input id="two" readonly />2</div>
    <div class="list"><input id="three" readonly />3</div>
    <div class="list"><input id="four" readonly />4</div>
</div>
<div class="link">
    <label class="click" for="one">1</label>
    <label class="click" for="two">2</label>
    <label class="click" for="three">3</label>
    <label class="click" for="four">4</label>
</div>
<style>
    .box {
        width: 20em;
        height: 10em;
        border: 1px solid #ddd;
        overflow: hidden;
    }
    .list {
        height: 100%;
        background: #ddd;
        text-align: center;
        position: relative;
    }
    .list > input {
        position: absolute;
        top: 0;
        height: 100%;
        width: 1px;
        border: 0;
        padding: 0;
        margin: 0;
        clip: rect(0 0 0 0);
    }
</style>
```
