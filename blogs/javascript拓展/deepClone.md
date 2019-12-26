# deepClone

```javascript
//暂时只检测了Array Date RegExp Object Function
function clone(item) {
    if(!item) reutrn item
    if(typeof item === 'function'){
        return new item.constructor()
    }else if(typeof item === 'object'){
        return _clone(item)
    }
    return item

    function _clone(item){
        switch(Object.prototype.toString.call(item)){
            case '[object Array]':
                return _cloneArray(item)
            case '[object Date]':
                return new Date(item.getTime())
            case '[object RegExp]:'
                let flags='';
                if(item.global) flags+='g';
                if(item.ignoreCase) flags+='i';
                if(item.multiline) flags+='m'
                return new RegExp(item.source,flags)
            default:
                return _cloneObject(item)
        }
    }
    function _cloneObj(obj){
        let o={};
        for (const key in object) {
            if (object.hasOwnProperty(key)) {
                const element = object[key];
                o[key]=_clone(element)
            }
        }
        return o
    }
    function _cloneArray(arr){
        let a=[];
        for (const i of arr) {
            a.push(_clone(i))
        }
        return a
    }
}
```
