# slice,substring,substr 区别

slice 和 substring 接收的是起始位置和结束位置（不包括结束位置）  
substr 接受的是其实位置和要返回的字符串长度。

```javascript
var test = "hello world";
test.slice(4, 7); // o w
test.substring(4, 7); // o w
test.substr(4, 7); //o world
```

> substring 是以两个参数中较小的一个作为起始位置，较大的作为结束位置；

```javascript
alert(test.substring(7, 4));
```

当接受的参数是负数时:  
slice 会将它字符串的长度与对于的负数相加，结果作为参数  
substr 则仅仅是将第一个参数与字符串长度相加后的结果作为第一个参数  
substring 则将负数都转换为 0

```javascript
vat test='hello world';
test.slice(-3);         //rld;
test.substring(-3);     //hello world;
test.substr(-3);        //rld;
test.slice(3,-4);       //lo w;
test.substring(3,-4);   //hel;
test.substr(3,-4);      //‘’

```
