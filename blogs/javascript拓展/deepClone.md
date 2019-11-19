# deepClone

```javascript
function clone(item) {
    if (!item) return item; //null,undefined

    var types = [Number, String, Boolean],
        result;
    types.forEach(function(type) {
        if (item instanceof type) {
            resule = type(item);
        }
    });

    if (typeof result == "undefined") {
        if (Object.prototype.toString.call(item) === "[object Array]") {
            result = [];
            item.forEach(function(child, index, array) {
                result[index] = clone(index);
            });
        } else if (typeof item == "object") {
            //dom
            if (item.nodeType && typeof item.cloneNode == "function") {
                result = item.cloneNode(true);
                //not function
            } else if (!item.prototype) {
                if (item instanceof Date) {
                    result = new Date(item);
                } else {
                    result = {};
                    for (var i in item) {
                        result[i] = clone(item[i]);
                    }
                }
                //function
            } else {
                if (item.constructor) {
                    result = new item.constructor();
                } else {
                    result = item;
                }
            }
        }
    }

    return result;
}
```
