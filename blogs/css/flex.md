# Flex

## Flex Container

### flex-direction

- row(默认值)：主轴为水平方向，起点在左端

- row-reverse:主轴为水平方向，起点在右端

- column:主轴为垂直方向，起点在上方

- column-reverse：主轴为垂直方向，起点在下沿

### flex-wrap

- nowrap(默认)：不换行

- wrap：换行，第一行在上方

- wrap-reverse:换行，第一行在下方

### flex-flow

是 flex-direction 属性和 flex-wrap 属性的简写形式，默认值为 row nowrap

- flex-flow:<flex-direction> || <flex-wrap>

### justify-content

- flex-start(默认值)：左对齐

- flex-end:右对齐

- center:居中

- space-between:两端对齐，项目之间的间隔都相等

-space-around:每个项目两侧的间隔都相等，所以项目之间的间隔比项目与边框的间隔大一倍

### align-items

- flex-start:交叉轴的起点对齐

- flex-end:交叉轴的终点对齐

- center：交叉轴的中点对齐

- baseline：项目中的第一行文字的基线对齐

-stretch(默认值)：如果项目未设置高度过设为 auto，将占满整个容器的高度

### align-content

- flex-start:与交叉轴的起点对齐

- flex-end:与交叉轴的终点对齐

- center:与交叉轴的中点对齐

- space-between:与交叉轴两端对齐，轴线之间的间隔平均分布

- space-around:每根轴线两侧的间隔都相等。所以，轴线之间的间隔比轴线与边框的间隔大一倍

- stretch(默认值)：轴线占满整个交叉轴

## Flex Item

- order ：属性定义项目的排列顺序。数值越小，排列越靠前，默认为 0

- flex-grow：定义项目的放大比例，默认为 0

- flex-shrink：项目缩小比例，默认为 1

- flex-basis：在分配多余空间之前，项目占据主轴空间，默认为 auto，即项目本来大小

- flex：flex-grow,flex-shrink,flex-basis 的缩写，默认为 0 1 auto；

  - 两个快捷值：auto(1 1 auto)和 none （0 0 auto）
  - 建议优先使用这个属性，而不是单独写三个分离的属性，因为浏览器会推算相关值。

- align-self：允许单个项目与其他项目不一样的对齐方式，可覆盖 align-items 属性，默认为 auto，表示继承父元素 align-items 属性，如没有父元素，则等同于 stretch
