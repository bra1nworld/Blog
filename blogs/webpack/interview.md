# Webpack Interview

## webpack与grunt，gulp的不同

* Grunt，Gulp是基于任务运行的工具
他们会自动执行指定的任务，就像流水线，把资源放上去然后通过不同插件进行加工

* webpack是基于模块化打包的工具
自动化处理模块，webpack把一切当成模块，当webpack处理应用程序时，它会递归地构建一个依赖关系图（dependency graph），其中包含应用程序需要的每个模块，然后将所有这些模块打包成一个或多个bundle  
现在主流的方式是用npm script替代Grunt，Gulp。npm script同样可以打造任务流

## Loader和Plugin的不同

不同的作用：

* Loader直译为‘加载器’。webpack将一切文件视为模块，但是webpack原生是只能解析js文件，如果想将其他文件也打包的话，就会用到loader。所以loader的作用是让webpack拥有了加载和解析非javascript问价的能力
* Plugin直译为‘插件’，Plugin可以拓展webpack的功能，让webpack具有更多的灵活性，在webpack运行的生命周期中会广播出许多时间，plugin可以监听这些事件，在合适的时机通过webpack提供的API改变输出结果

不同的用法：

* Loader在module.rules中配置，也就是说它作为模块的解析规则而存在，类型为数组，每一项都是一个object，里面描述了对于什么类型的文件(test)，使用什么加载(loader)和使用的参数(options)
* Plugin在plugins中单独配置，类型为数组，每一项是一个plugin的实例，蚕食都通过构造函数传入

常见的loader：

* file-loader：把文件输出到一个文件夹中，在代码中通过相对URL去引用输出的文件
* url-loader：和file-loader相似，但是能在文件很小的情况下以base64的方式把文件内容注入到代码中去
* source-map-loader:加载额外的Source Map文件，以方便断点调试
* image-loader:加载并压缩图片文件
* babel-loader:把ES6转换成ES5
* css-loader：加载css，支持模块化，压缩，文件导入等特性
* style-loader:把css代码注入到javascript中，通过DOM操作去加载css
* eslint-loader：通过ESLint检查javascript代码

常见的Plugin：

* define-plugin:定义环境变量
* html-webpack-plugin:简化html文件创建
* uglifyjs-webpack-plugin:通过uglifyES压缩ES6代码
* webpack-parallel-uglify-plugin:多核压缩，提高压缩速度
* webpack-bundle-analyzer:可视化webpack输出文件的体积
* mini-css-extract-plugin:CSS提取到单独的文件中，支持按需加载

## Loader和Plugin的思路

Loader像一个‘翻译官’把读到的源文件内容转义成新的文件内容，并且每个loader通过链式操作，将源文件一步步翻译成想要的样子  
编写loader是要遵循单一原则，每个loader只做一种‘转义’工作。每个Loader的拿到的是源文件内容（source），可以通过返回值的方式将处理后的内容输出，也可以调用this.callback()方法，将内容返回给webpack，还可以通过this.async()生成一个callback函数，再用这个callback将处理后的内容输出出去，此外webpack还为开发者准备了开发loader的工具函数集--loader-utils  
相对于loader，Plugin则要灵活的多，webpack在运行的生命周期中会广播出许多事件，Plugin可以监听这些事件，在合适的时机通过webpack提供的API改变输出结果

## bundle,chunk,module是什么

* bundle：是由webpack打包出来的文件
* chunk：代码块，一个chunk由多个模块组合而成，用于代码的合并和分割
* module：是开发中的单个模块，在webpack的世界，一切皆模块，一个模块对应一个文件，webpack会从配置的entry中递归开始查找出所有依赖的模块

## webpack构建流程

webpack的运行流程是一个串行的过程，从启动到结束一次会执行以下流程：

* 1.初始化参数：从配置文件和shell语句中读取和合并参数，得出最终的参数
* 2.开始编译：用上一步得到的参数初始化Compiler对象，加载所有配置的插件，执行对象的run方法开始执行编译
* 3.确定入口：根据配置的entry找出所有的入口文件
* 4.编译模块：从入口文件出发，调用所有配置的loader对模块进行翻译，再找出该模块依赖的模块，递归本步骤直到所有入口依赖的文件都经过了本步骤的处理
* 5.完成模块编译：在经过第四步使用loaser翻译完所有模块后，得到了一个模块被翻译后的最终内容以及他们之间的依赖关系
* 6.输出资源：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的Chunk，再把每个Chunk转换成一个单独的文件加入到输出列表。这步是可以修改输出内容的最后机会
* 7.输出完成：在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统

在以上过程中，webpack会在特定的时间广播出特定的事件，插件在监听到感兴趣的事件后会执行特定的逻辑，并且插件可以调用webpack提供的api改变webpack的运行结果

## 如何用webpack来优化前端性能

* 压缩代码：删除多余的代码，注释，简化代码的写法等方法，可以利用webpack的uglifyJsPlugin和ParalleUglifyPlugin来压缩JS文件，利用cssnano(css-loader?minimize)来压缩css
* 利用CDN加速：在构建过程中，将引用的静态资源路径修改为CDN上对应的路径，可以利用webpack对于output参数和各loader的publicPath参数来修改资源路径
* Tree Shaking：将代码中永远不会走到的片段删除掉，可以通过在启动webpack时对追加参数 --optimize-minimize来实现
* Code Splitting：将代码按路由维度或者组件分块（chunk），这样做到按需加载，同时可以充分浏览器缓存
* 提取公共第三方库：SplitChunkPlugin插件来进行公共模块抽取，利用浏览器缓存可以长期缓存这些无需频繁变动的公共代码

## 如何提高webpack打包速度

* happypack：利用多线程并行编译loader
* 外部拓展：将不怎么需要更新的第三方库脱离webpack打包，不被打入bundle中，从而减少打包时间
* dll：采用webpack的DllPlugin和DllReferencePlugin预编译资源模块，将不会改动的模块打包成静态资源，避免反复编译浪费时间
* 利用缓存：webpacl.cache，babel-loader.chcheDirectory,HappyPack.cache都可以利用缓存来提高rebuild效率

## 如何提高webpack的构建速度

* 1.多入口情况下，使用CommonsChunkPlugin来提取公共代码
* 2.通过externals配置来提取常用库
* 3.利用DllPlugin和DllReferencePlugin预编译资源模块，通过DllPlugin来对那些我们引用但是绝对不会修改的npm包来进行预编译，再通过DllReferencePlugin将预编译的模块加载进来
* 4.使用Happypack实现多线程加速编译
* 5.使用webpack-uglify-parallel 多核并行压缩来提升uglifyPlugin的压缩速度
* 6.使用Tree-shaking和Scope Hosting来删除多余代码

## 如何配置单页应用，多页应用

单页应用可以理解为webpack的标准模式，直接在entry中指定单页应用的入口即可  
多页应用的话，可以使用webpack的AutoWebPlugin来完成简单自动化的构建，多页应用要注意的是：

* 每个页面都有公共的代码，可以将这些代码抽离出来，避免重复的加载
* 随着业务的不断扩展，页面可能会不断的追加，所以一定要让入口的配置足够灵活，避免每次添加新页面还需要修改构建配置
