# call,apply,bind,new 模拟实现

## call 的实现

１．将函数设为对象的属性
２．执行该函数

```javascript
Function.prototype.call = function(context) {
    //this 参数可以传null,当为null时，是为指向widnow
    var context = context || window;
    //在context的this作用域内运行fn
    context.fn = this;

    var args = [];
    for (var i = 1, len = arguments.length; i < len; i++) {
        args.push("arguments[" + i + "]");
    }
    //函数是可以有返回值的
    //eval 这里 args 会自动调用 Array.toString() 这个方法
    var result = eval("context.fn(" + args + ")");
    delete context.fn;
    return result;
};
//简易版
Function.prototype.call=(context,...args)=>{
    let context=context||window;
    context.fn=this;
    let result=context.fn(...args)
    delete context.fn;
    return result
}
```

## apply 的实现

```javascript
Function.prototype.apply = function(context, arr) {
    //this 参数可以传null,当为null时，是为指向widnow
    var context = context || window;
    context.fn = this;

    var result;
    if (!arr) {
        result = context.fn();
    } else {
        var args = [];
        for (var i = 1, len = arr.length; i < len; i++) {
            args.push("arr[" + i + "]");
        }
        //函数是可以有返回值的
        result = eval("context.fn(" + args + ")");
    }
    delete context.fn;
    return result;
};
//简易版
Function.prototype.apply=(context,arr)=>{
    const context=context || window;
    context.fn=this;

    const result=context.fn(...arr);
    delete context.fn;
    return result
}

```

## bind 的实现

> bind()方法会创建一个新函数。当这个新函数被调用时，bind()的第一个参数将作为它运行时的 this,之后的序列参数将会在传递的实参前传入作为它的参数。

１．返回一个函数
２．可以传入参数

```javascript
Function.prototype.bind = function(context) {
    if (typeof this !== "function") {
        throw new Error(
            "Function.prototype.bind - what is trying to be bound is not callable!"
        );
    }
    var self = this;
    var args = Array.prototype.slice.call(arguments, 1);

    //如果直接将fBound.prototype=this.prototype，当我们直接修改fBound.prototype的时候，
    //也会直接修改绑定的函数prototype，所以用一个空函数来进行中转
    var fn = function() {};
    var fBound = function() {
        var boundArgs = Array.prototype.slice.call(arguments);
        //当作为构造函数时，this指向实例，此时结果为true，将绑定函数的this指向该实例，
        //可以让该实例获得来自绑定函数的值;
        //作为普通函数时，this指向window，此时结果为false，将绑定的函数的this指向context
        return self.apply(
            this instanceof fn ? this : context,
            args.concat(boundArgs)
        );
    };
    fn.prototype = this.prototype;
    fBound.prototype = new fn();
    return fBound;
};

//简易版
Function.prototype.bind=function(context,...args){
    return (...innerArgs)=>{
        this.apply(context,[...args,...innerArgs])
    }
}

```

## new 的实现

> new 运算符创建一个用户定义的对象类型的实例或具有构造函数的内置对象类型之一

１．返回一个新对象
２．实例可以访问原型链上属性

```javascript
function objectFactory() {
    var obj = new Object();

    //取出第一个参数,即我们要传入的构造函数，此外因为shift会修改原数组，所以arguments会被去除第一个参数
    Constructor = [].shift.call(arguments);

    //将obj的原型指向构造函数，这样obj就可以访问到构造函数原型中的属性
    obj.__proto__ = Constructor.prototype;

    //使用apply,改变构造函数中this的指向到新建的对象，这样obj就可以访问到构造函数中的属性
    const ret = Constructor.apply(obj, arguments);

    //若返回值结果是一个对象，则return一个对象，否则返回当前创建的obj　(返回值可能是一个简单值类型)
    return typeof ret === "object" ? ret : obj;
}

//es6写法
function _new(fn, ...arg) {
    const obj = Object.create(fn.prototype);
    const ret = fn.call(obj, ...arg);
    return ret instanceof Object ? ret : obj;
}
```
