## singlePage

这是一个滑动单页面展示插件，依赖jQuery，支持IE6+。
 
:point_right: [演示](http://liyu365.github.io/viewScroller/demo/)

### 页面结构

```html
<div id="J_singlepage_placeHolder"></div>
<div id="headerW"></div>
<div class="J_singlepage_pagination">
    <a href="javascript:void(0);" data-hash="!/floor1" class="J_sp_btn"></a>
    <a href="javascript:void(0);" data-hash="!/floor2" class="J_sp_btn"></a>
    <a href="javascript:void(0);" data-hash="!/floor3" class="J_sp_btn"></a>
</div>
<div class="J_singlepage">
    <div class="J_spSection_wrapper">
        <div data-hash="!/floor1" class="J_spSection"><div class="J_sp_inside"></div></div>
        <div data-hash="!/floor2" class="J_spSection"><div class="J_sp_inside"></div></div>
        <div data-hash="!/floor3" class="J_spSection"><div class="J_sp_inside"></div></div>
    </div>
</div>
<div id="footerW"></div>
```

- `.J_sp_btn`和`.J_spSection`的`data-hash`值必须一一对应，并且必须设定；
- 当页面有`headerW`元素时，必须在页面的最顶端添加`placeHolder`元素。

### 调用接口

```javascript
new SinglePage({
    changeHash: false,  //切换锚点
    mode: 'scroll',
    duration: 500,
    easing: 'easeInOutCubic',
    headerSelect: '#headerW',
    footerSelect: '#footerW',
    placeHolderSelect: '#J_viewScroller_placeHolder'  //会给这个元素设置负边距，来隐藏或显示header或footer
});
```

- `changeHash`，切换楼层时是否改变URL中的锚点，默认是`fasle`；
- `mode`，提供两种切换楼层的方式可以选择：`scroll`和`fade`，默认是`scroll`；
- `duration`，切换楼层动画的持续时间，默认是`500`毫秒；
- `easing`，动画执行方式，默认是`swing`；
- `headerSelect`，页面头部的选择器，默认是`''`；
- `footerSelect`，页面底部的选择器，默认是`''`；
- `placeHolderSelect`，放置在页面顶部的`placeHolder`元素的选择器，默认是`''`。

### License

**Under MIT license. Copyright by 李昱(liyu365)**