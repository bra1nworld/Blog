# 常用 util

## uuid

```javascript
function uuid() {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return `${S4()S4()-S4()-S4()-S4()-S4()S4()S4()}`
}
```

## 金额小写转大写

```javascript
function changeMoneyToChinese(num) {
    if (num == 0) {
        return "零";
    }
    let numString = num.toString();
    if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(numString)) return "数据非法";
    let unit = "仟佰拾亿仟佰拾万仟佰拾元角分",
        str = "";
    numString += "00";
    let pointIndex = numString.indexOf(".");
    if (pointIndex >= 0)
        numString =
            numString.substring(0, pointIndex) +
            numString.substr(pointIndex + 1, 2);
    unit = unit.substr(unit.length - numString.length);
    for (var i = 0; i < numString.length; i++) {
        str +=
            "零壹贰叁肆伍陆柒捌玖".charAt(Number(numString.charAt(i))) +
            unit.charAt(i);
    }
    return str
        .replace(/零(仟|佰|拾|角)/g, "零")
        .replace(/(零)+/g, "零")
        .replace(/零(万|亿|元)/g, "$1")
        .replace(/(亿)万|壹(拾)/g, "$1$2")
        .replace(/^元零?|零分/g, "")
        .replace(/元$/g, "元整");
}
```

## 随机生成 16 位颜色

```javascript
function createRandomColor(){
    let color=Math.floor(Math.random()*256*256*256).toString(16);
    //随机生成的可能是3-6位字符串
    while(color.length<6){
        color+=Math.floor(Math.random()*16).toString(16)
    })
    return color
}
```
