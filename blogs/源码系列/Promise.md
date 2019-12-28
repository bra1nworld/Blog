# Promise 源码实现

Promise 是什么？无论是 ES6 的 Promise 也好，JQuery 的 Promise 也好，不同的库有不同的实现，但是大家遵循的都是同一套规范，所以 Promise 并不指特定的某个实现，**它是一种规范，是一套处理 JavaScript 异步的机制**。  
Promise 的规范很多，如 Promise/A,Promise/B,Promise/D 以及 Promise/A 的升级版 Promise/A+，其中 ES6 遵循 Promise/A+规范

* 英文版：[Promise/A+](https://promisesaplus.com/)
* 中文版：[翻译:Promise/A+规范](https://www.ituring.com.cn/article/66566)

几个与内容相关的规范

* Promise 本质是一个状态机，每个 Promise 有三种状态：pending，resoloved 以及 rejected。状态转变只能是 pending->resolves 或者 pending->rejected。状态转变不可逆
* then 方法可以被同一个 promise 调用多次
* then 方法必须返回一个 promise。规范 2.2.7 中规定，then 必须返回一个新的 Promise
* 值穿透

## Promise 实现及源码解读

首先，看一下 Promise 的简单使用

```javascript
var p=new Promise(function(resolve,reject){
    if(/*good condition*/){
        resolve('success')
    }else{
        reject('failture')
    }
})
p.then(function(){
    //do something with the result
}).catch(function(err){
    //err
})
```

通过这种使用构建 Promise 实现的第一个版本

### Promise 构建版本一

```javascript
function MyPromise(callback) {
    var _this = this;
    _this.value = void 0; //promise 的 值
    var onResolvedCallback; //Promise resolve回调函数
    var onRejectedCallbacj; //Promise reject回调函数

    //resolve处理函数
    _this.resolve = function(value) {
        onResolvedCallback();
    };
    //reject处理函数
    _this.reject = function(error) {
        onRejectedCallback();
    };

    //执行callback并传入相应的参数
    callback(_this.resolve, _this.reject);
}
//添加then方法
MyPromise.prototype.then = function(resolve, reject) {};
```

大致框架，但是我们看到 Promise 状态，resolve 函数，reject 函数以及 then 等都没有处理

### Promise 构建之二：链式存储

Promise 一个**常见的需求就是连续执行两个或者多个异步操作**，这种情况下，每个后来的操作都在前面的操作执行成功之后，带着上一步操作所返回的结果开始执行。这里用 setTimeout 来处理

```javascript
function MyPromise(callback) {
    var _this = this;
    _this.value = void 0; //promise 的 值

    //用于保存then的问题，只有当promise状态为pending时，才会被缓存，并且每个实例至多缓存一个
    _this.onResolvedCallbacks = []; //Promise resolve时的回调函数集
    _this.onRejectedCallbacks = []; //Promise reject时的回调函数集

    //resolve处理函数
    _this.resolve = function(value) {
        setTimeout(() => {
            //异步执行
            _this.onResolvedCallbacks.forEach(cb => cb());
        });
    };
    //reject处理函数
    _this.reject = function(error) {
        setTimeout(() => {
            //异步执行
            _this.onRejectedCallbacks.forEach(cb => cb());
        });
    };

    //执行callback并传入相应的参数
    callback(_this.resolve, _this.reject);
}
//添加then方法
MyPromise.prototype.then = function(resolve, reject) {};
```

### Promise 构建之三：状态机制，顺序执行

```javascript
const PENDING = "pending";
const RESOLVED = "resolved";
const REJECTED = "rejected";
function MyPromise(callback) {
    var _this = this;
    _this.currentState = PENDING;
    _this.value = void 0; //promise 的 值

    //用于保存then的问题，只有当promise状态为pending时，才会被缓存，并且每个实例至多缓存一个
    _this.onResolvedCallbacks = []; //Promise resolve时的回调函数集
    _this.onRejectedCallbacks = []; //Promise reject时的回调函数集

    //resolve处理函数
    _this.resolve = function(value) {
        setTimeout(() => {
            //异步执行,保证顺序执行
            if (_this.currentState === PENDING) {
                _this.currentState === RESOLVED; //状态管理
                _this.value = value;
                _this.onResolvedCallbacks.forEach(cb => cb());
            }
        });
    };
    //reject处理函数
    _this.reject = function(error) {
        setTimeout(() => {
            //异步执行,保证顺序执行
            if (_this.currentState === PENDING) {
                _this.currentState === REJECTED; //状态管理
                this.value = error;
                _this.onRejectedCallbacks.forEach(cb => cb());
            }
        });
    };

    //执行callback并传入相应的参数
    callback(_this.resolve, _this.reject);
}
//添加then方法
MyPromise.prototype.then = function(resolve, reject) {};
```

### Promise 构建之四：递归执行

每个 Promise 后面链接一个对象，该对象包含 onresolved,onrejected,子 promise 三个属性  
当父 Promise 状态改变完毕，执行完相应的 onresolved/onrejected。依次循环直到当前 promise 没有子 promise

```javascript
const PENDING = "pending";
const RESOLVED = "resolved";
const REJECTED = "rejected";
function MyPromise(callback) {
    var _this = this;
    _this.currentState = PENDING;
    _this.value = void 0; //promise 的 值

    //用于保存then的问题，只有当promise状态为pending时，才会被缓存，并且每个实例至多缓存一个
    _this.onResolvedCallbacks = []; //Promise resolve时的回调函数集
    _this.onRejectedCallbacks = []; //Promise reject时的回调函数集

    //resolve处理函数
    _this.resolve = function(value) {
        if (value instanceof MyPromise) {
            //如果value是个MyPromise，递归执行
            return value.then(_this.resolve, _this.reject);
        }

        setTimeout(() => {
            //异步执行,保证顺序执行
            if (_this.currentState === PENDING) {
                _this.currentState === RESOLVED; //状态管理
                _this.value = value;
                _this.onResolvedCallbacks.forEach(cb => cb());
            }
        });
    };
    //reject处理函数
    _this.reject = function(error) {
        setTimeout(() => {
            //异步执行,保证顺序执行
            if (_this.currentState === PENDING) {
                _this.currentState === REJECTED; //状态管理
                this.value = error;
                _this.onRejectedCallbacks.forEach(cb => cb());
            }
        });
    };

    //执行callback并传入相应的参数
    callback(_this.resolve, _this.reject);
}
//添加then方法
MyPromise.prototype.then = function(resolve, reject) {};
```

### Promise 构建之五：异常处理

每个 Promise 后面链接一个对象，该对象包含 onresolved,onrejected,子 promise 三个属性  
当父 Promise 状态改变完毕，执行完相应的 onresolved/onrejected。依次循环直到当前 promise 没有子 promise

```javascript
const PENDING = "pending";
const RESOLVED = "resolved";
const REJECTED = "rejected";
function MyPromise(callback) {
    var _this = this;
    _this.currentState = PENDING;
    _this.value = void 0; //promise 的 值

    //用于保存then的问题，只有当promise状态为pending时，才会被缓存，并且每个实例至多缓存一个
    _this.onResolvedCallbacks = []; //Promise resolve时的回调函数集
    _this.onRejectedCallbacks = []; //Promise reject时的回调函数集

    //resolve处理函数
    _this.resolve = function(value) {
        if (value instanceof MyPromise) {
            //如果value是个MyPromise，递归执行
            return value.then(_this.resolve, _this.reject);
        }

        setTimeout(() => {
            //异步执行,保证顺序执行
            if (_this.currentState === PENDING) {
                _this.currentState === RESOLVED; //状态管理
                _this.value = value;
                _this.onResolvedCallbacks.forEach(cb => cb());
            }
        });
    };
    //reject处理函数
    _this.reject = function(error) {
        setTimeout(() => {
            //异步执行,保证顺序执行
            if (_this.currentState === PENDING) {
                _this.currentState === REJECTED; //状态管理
                this.value = error;
                _this.onRejectedCallbacks.forEach(cb => cb());
            }
        });
    };

    //异常处理
    //new Promise(()=>throw Error('error'))
    try {
        //执行callback并传入相应的参数
        callback(_this.resolve, _this.reject);
    } catch (e) {
        _this.reject(e);
    }
}
//添加then方法
MyPromise.prototype.then = function(resolve, reject) {};
```

### Promise 构建之六：then 的实现

then 方法是 Promise 核心方法

```javascript
promise.then(onFulfilled, onRejected);
```

一个 Promise 的 then 接收两个参数：onFulfilled 和 onRejected(都是可选参数，并且为函数，若不是函数将被忽略)

#### onFulfilled 特性

* 当Promise执行结束后必须被调用，其第一个参数为promise的终值，也就是resolve传过来的值  
* 在promise直接结束前不可被调用  
* 其调用次数可不超过一次

#### onRejected特性

* 当Promise被拒绝执行后其必须被调用，第一个参数俄日Promise的拒绝原因，也就是reject传过来的值  
* 在Promise执行结束前不可被调用  
* 其调用次数不可超过一次

#### 调用时机

onFulfilled和onRejected只有在**执行环境**堆栈仅包含**平台代码**时才可被调用(平台代码指引擎，环境以及promise的实施代码)

#### 调用要求

onFulfilled和onRejected必须被作为函数调用(即没有this值，在严格模式终，函数this的值为undefined；在非严格模式下其为全局对象)

#### 多次调用

then方法可以被同一个promise多次调用：当promise成功/失败执行时，所有onFulfilled/onRejected需按照其注册顺序依次回调  

#### 返回

**then方法会返回一个Promise**。

```javascript
promise2=promise1.then(onFulfilled,onRejected);
```

* 如果onFulfilled或者onRejected返回一个值x，则运行下面的**Promise解决过程**：Resolve(promise2,x)
* 如果onFulfilled或者onRejected跑出一个异常e，则promise2必须拒绝执行，并返回原因e
* 如果onFulfilled不是函数且promise1成功执行，promise2必须成功执行并返回相同的值
* 如果onRejected不是函数且promise1拒绝执行，promise2必须拒绝执行并返回相同的原因

**不论promise1被reject还是被resolve，promise2都会被resolve，只有出现异常才会被rejected**。  
每个Promise对象都可以在其上多次调用then方法，而每次调用then返回的Promise的状态取决于那一次调用then传入参数的返回值，所以then不能返回this，因为then每次返回的Promise的结果都有可能不同

```javascript
//then方法接受两个参数，onFulfilled，onRejected，分别是Promise成功或者失败的回调
MyPromise.prototype.then=function(onFulfilled,onRejected){
    var _this=this;
    //规范2.2.7 then必须返回一个新的promise
    var promise2;
    //onFulfilled,onRejected都是可选参数,如果不是函数需要忽略，同时也实现值穿透
    onFulfilled=typeof onFulfilled === 'function'?onFulfilled: value => value
    onRejected=typeof onRejected === 'function'?onRejected : error => {throw error}

    if(_this.currentState === RESOLVED){
        //如果promise1（此处为self/this）的状态已经确定并且为resolved，我们调用onFulfilled
        //如果考虑到有可能throw，所以我们将其包在try/catch块中
        return promise2=new MyPromise(function(resolve,reject){
            //规范2.2.4 保证onFulfilled，onRejected异步执行，所以用setTimeout包裹
            setTimeout(function(){
                try{
                    var x=onFulfilled(_this.value)
                    //如果onFulfilled的返回值是一个Promise对象，直接取它的结果作为promise2的结果
                    if(x instanceof MyPromise){
                        x.then(resolve,reject)
                    }
                    //否则将它的返回值作为promise2的结果
                    resolve(x)
                }catch(err){
                    //如果出错，以捕获到的错误作为promise2的结果
                    reject(err)
                }
            })
        })
    }
    if(_this.currentState===REJECTED){
        return promise2=new MyPromise(function(resolve,reject){
            setTimeout(function(){
                try{
                    var x=onRejected(_this.value)
                    if(x instanceof MyPromise){
                        x.then(resolve,reject)
                    }
                }catch (err){
                    reject(err)
                }
            })
        })
    }

    //如果当前的Promise还处于PENDING状态，我们并不能确定调用onFulfilled还是onRejected
    //只有等待Promise的状态确定后，再做处理
    //所以我们需要把我们的两种情况的处理逻辑换成callback放入promise1的回调数组内
    //逻辑处理和以上相似
    if(_this.currentState===PENDING){
        return promise2=new MyPromise(function(resolve,reject){
            _this.onResolvedCallbacks.push(function(){
                try{
                    var x=onFulfilled(_this.value)
                    if(x instanceof MyPromise){
                        x.then(resolve,reject)
                    }
                    resolve(x)
                }catch(err){
                    reject(err)
                }
            })
            _this.onRejectedCallbacks.push(function(){
                try{
                    var x=onRejected(_this.value)
                    if(x instanceof MyPromise){
                        x.then(resolve,reject)
                    }
                }catch(err){
                    reject(err)
                }
            })
        })
    }
}

```

### Promise 构建之七：catch 的实现

```javascript
MyPromise.prototype.catch=function(onRejected){
    return this.then(null,onRejected)
}
```

## Promise最终代码实现(包括all,race,finally)

```javascript
const PENDING='pending';
const RESOLVED='resolved';
const REJECTED='rejected';
function MyPromise(callback){
    vat _this=this;
    _this.currentState=PENDING;
    _this.value=void 0;
    _this.onResolvedCallbacks=[];
    _this.onRejectedCallbacks=[];
    _this.resolve=function(value){
        if(value instanceof MyPromise){
            return value.then(_this.resolve,_this.reject)
        }
        setTimeout(function(){
            if(_this.currentState === PENDING){
                _this.currrentState = RESOLVED;
                _this.value=value;
                _this.onResolvedCallbacks.forEach(cb=>cb())
            }
        })
    }
    _this.reject=function(value){
        setTimeout(function(){
            if(_this.currentState=== PENDING){
                _this.currentState = REJECTED;
                _this.value=value;
                _this.onRejectedCallbacks.forEach(cb=>cb())
            }
        })
    }

    try {
        callback(_this.resolve,_this.reject)
    } catch(err) {
        _this.reject(err)
    }
}

MyPromise.prototype.then=function(onFulfilled,onRejected){
    var _this=this;
    var promise2;
    onFulfilled= typeof onFulfilled === 'function' ? onFulfilled : value=>value;
    onRejected = typeof onRejected === 'function' ? onRejected : err=> { throw err }

    if(_this.currentState === RESOLVED){
        return promise2=new MyPromise(function(resolve,reject){
            try{
                var x=onFulfilled(_this.value);
                if(x instanceof MyPromise){
                    x.then(resolve,reject)
                }
                resolve(x)
            }catch(err){
                reject(err)
            }
        })
    }
    if(_this.currentState === REJECTED){
        return promise2=new Promise(function(resolve,reject){
            try{
                var x=onRejected(_this.value);
                if(x instanceof MyPromise){
                    x.then(resolve,reject)
                }
                //reject默认不返回value
            }catch(err){
                reject(err)
            }
        })
    }
    if(_this.currentState === PENDING){
        return promise2=new Promise(function(resolve,reject){
            _this.onResolvedCallbacks.push(function(){
                try{
                    var x=onFulfilled(_this.value);
                    if(x instanceof MyPromise){
                        x.then(resolve,reject)
                    }
                    resolve(x)
                }catch(err){
                    reject(err)
                }
            })
            _this.onRejectedCallbacks.push(function(){
                try{
                    var x=onRejected(_this.value);
                    if(x instanceof MyPromise){
                        x.then(resolve,reject)
                    }
                }catch(err){
                    reject(err)
                }
            })
        })
    }
}

MyPromise.prototype.catch=function(onRejected){
    return this.then(null,onRejected)
}

MyPromise.prototype.finally=function(callback){
    return this.then(function(value){
        return MyPromise.resolve(callback()).then(function(){
            return value
        })
    },function(error){
        return MyPromise.resolve(callback()).then(function(){
            throw error
        })
    })
}

MyPromise.race=function(values){
    return new MyPromise(function(resolve,reject){
        values.forEach(function(value){
            MyPromise.resolve(value).then(resolve,reject)
        })
    })
}

MyPromise.all=function(arr){
    var args=Array.prototype.slice.call(arr);
    return new MyPromise(function(resolve,reject){
        if(args.length===0) return resolve([])
        var remaining=args.length;
        for(var i =0;i<args.length;i++){
            res(i,args[i])
        }
        function res(i,val){
            if(val && (typeof val === 'object' || typeof val === 'function')){
                if(val instancof MyPromise && val.then=== MyPromise.prototype.then){
                    if(val.currentState===RESOLVED) return res(i,val.value)
                    if(val.currentState===REJECTED) reject(val.value)
                    val.then(function(val){
                        res(i,val)
                    },reject)
                    return
                }else{
                    var then=val.then;
                    if(typeof then === 'function'){
                        var p=new MyPromise(then.bind(val))
                        p.then(function(val){
                            res(i,val)
                        },reject)
                        return
                    }
                }
            }
            args[i]=val
            if(--remaining === 0){
                resolve(args)
            }
        }
    })
}
```

## 原生Promise race final all

```javascript
Promise.all=function(promises){
    return new Promise((resolve,reject)=>{
        if(promises.length===0) return resolve([])
        let result=[]
        let index=0;
        for(let i=0;i<promises.length;i++){
            Promise.resolve(promises[i]).then(data=>{
                result[i]=data;
                if(++index===promises.length){
                    resolve(result)
                }
            },err=>{
                reject(err)
            })
        }
    })
}

Promise.race=function(values){
    return new Promise((resolve,reject)=>{
        values.forEach(val=>{
            Promise.resolve(val).then(resolve,reject)
        })
    })
}

Promise.finally=function(callback){
    return this.then(value=>{
        return Promise.resolve(callback()).then(value=>value)
    },error=>{
        return Promise.resolve(callback()).then(error=>{throw error})
    })
}
```
