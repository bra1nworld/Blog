# defineProperty,proxy,数据绑定

## ES5 defineProperty

Object.defineProperty,该方法可以在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回这个对象。

```javascript
//obj: 要在其定义属性的对象
//prop:　要定义或修改的属性的名称
//descripter:将被定义或修改的属性的描述符
Object.defineProperty(obj, prop, descriptor);

Object.defineProperty({}}, "num", {
    value: 1, //该属性对应的值，可以是任何有效的javaScript值(数值，对象，函数等)。默认为undefined
    writable: true, //当且仅当该属性为true时，该属性才能被赋值运算符改变
    enumerable: true, //当且仅当该属性为true时，该属性才能够出现在对象的枚举属性中，默认为false
    configurable: true //当且仅当该属性为true时，该属性描述符才能够被改变，也能被删除，默认为false
});

var value=1;
//属性描述符必须是数据描述符或者存取描述符两种形式之一，不能同时是两者，即value:1和get,set不同同时设置
Object.defineProperty({},'num',{
    get:function(){
        return value
    },
    set:function(newValue){
        value=newValue
    },
    enumerable:true,
    configurable:true
})
```

可通过 getter 和 setter 用来监听属性的变化

```javascript
var obj = {
    value: 1
};

watch(obj, "value", function(newValue) {
    document.getElementById("container").innerHTML = newValue;
});

document.getElementById("button").addEventListener("click", function() {
    obj.value += 1;
});

(function() {
    var root = this;
    function watch(obj, name, func) {
        var value = obj[name];

        Object.defineProperty(obj, name, {
            get: function() {
                return value;
            },
            //如果直接在set中obj.value=newValue，会陷入死循环
            set: function(newValue) {
                value = newValue;
                func(value);
            }
        });

        if (value) obj[name] = value;
    }
    this.watch = watch;
})();
```

## ES6 proxy

Proxy,可以重定义更多的行为，比如 in,delete,函数调用等

```javascript
var proxy = new Proxy(
    {},
    {
        get: function(obj, prop) {
            console.log("设置 get 操作");
        },
        set: function(obj, prop, value) {
            console.log("设置 set 操作");
            obj[prop] = value;
        }
    }
);
```

### watch API 优化

```javascript
(function() {
    var root = this;
    function watch(target, func) {
        var proxy = new Proxy(target, {
            get: function(target, prop) {
                return target[prop];
            },
            set: function(target, prop, value) {
                target[prop] = value;
                func(prop, value);
            }
        });

        return proxy;
    }
    this.watch = watch;
})();

var obj = {
    value１: 1
};

var newObj = watch(obj, function(key, newValue) {
    if (key === "value")
        document.getElementById("container").innerHTML = newValue;
});

document.getElementById("button").addEventListener("click", function() {
    newObj.value += 1;
});
```

使用 defineProperty 和 proxy 的区别：  
使用 defineProperty,我们修改原来的 obj 对象就可以出发拦截　　
使用 proxy，就必须修改代理对象，即 Proxy 的实例才可以出发拦截
