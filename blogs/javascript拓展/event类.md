# Event类

```javascript
class Event{
    constructor(){
        this.handlers={}
    }

    on(type,handler,once=false){
        if(!this.handlers[type]){
            this.handlers[type]=[]
        }
        if(!this.handlers[type].includes(handler)){
            this.handlers[type].push(handler)
            handler.once=once
        }
    }
    off(type,handler){
        if(this.handlers[type]){
            if(!handler){
                this.handlers[type]=[]
            }else{
                this.handlers[type]=this.handlers[type].filter(h=>h!==handler)
            }
        }
    }

    trigger(trye,eventData={}){
        if(this.handlers[type]){
            this.handlers[type].forEach(handler=>{
                handler.call(this,eventData)
                if(handler.once){
                    this.off(type,handler)
                }
            })
        }
    }

    once(type,handler){
        this.on(type,handler,false)
    }

}
```
