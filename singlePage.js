/**
 * MIT License
 * @author liyu365
 */

//阻止默认事件
function stopDefaultAction(event) {
    if (event.preventDefault) {
        event.preventDefault();  //标准
    } else {
        event.returnValue = false;  //IE6,7,8
    }
}

//防止事件冒泡
function unPropagation(event) {  //这里的event已经确定是事件对象，不为空了
    if (event.stopPropagation) {
        event.stopPropagation();  //标准
    } else {
        //event.cancelBubble不能作为判定这个属性有无的表达式，因为event.cancelBubble的默认值就是false
        event.cancelBubble = true;  //IE6,7,8
    }
}

function SinglePage(option) {
    var _this = this;

    _this.opts = option || {};
    var defOpts = {
        changeHash: false,  //切换锚点
        mode: 'fade',  //楼层切换模式
        duration: 500,  //动画执行时间
        easing: 'swing',  //缓动函数
        headerSelect: '',
        footerSelect: '',
        placeHolderSelect: '#J_singlepage_placeHolder'
    };
    _this.opts = $.extend(defOpts, _this.opts);

    _this.$singlepage = $(".J_singlepage");
    _this.$spSectionWrapper = _this.$singlepage.find(".J_spSection_wrapper");
    _this.$spSection = _this.$spSectionWrapper.find(".J_spSection");
    _this.$spInside = _this.$spSection.find(".J_sp_inside");
    _this.$spBtn = $(".J_sp_btn");
    _this.lastWheelTime = new Date();
    _this.SpNum = _this.$spSection.length;  //楼层总数
    _this.wait = false;  //动画是否在执行中
    _this.cur = null;  //当前楼层（从0开始计数）
    _this.nonsupport_transition = false;  //浏览器不支持transition
    if (typeof document.body.style.transition === 'undefined' && typeof document.body.style.webkitTransition === 'undefined' && typeof document.body.style.msTransition === 'undefined' && typeof document.body.style.OTransition === 'undefined' && typeof document.body.style.MozTransition === 'undefined') {
        _this.nonsupport_transition = true;
        _this.$spSection.addClass('active');
    }

    //对头部和底部的配置
    _this.$placeHolder = $(_this.opts.placeHolderSelect);
    _this.$header = null;
    _this.$footer = null;
    _this.headerH = 0;
    _this.footerH = 0;
    _this.headerShowIng = false;  //头部是否展示中
    _this.footerShowIng = false;  //底部是否展示中
    if (_this.opts.headerSelect !== '') {
        _this.$header = $(_this.opts.headerSelect);
        if (_this.$header.length == 1) {
            _this.headerShowIng = true;
            _this.headerH = parseInt(_this.$header.height());
        } else {
            _this.$header = null;
        }
    }
    if (_this.opts.footerSelect !== '') {
        _this.$footer = $(_this.opts.footerSelect);
        if (_this.$footer.length == 1) {
            _this.footerH = parseInt(_this.$footer.height());
        } else {
            _this.$footer = null;
        }
    }


    //根据初始hash确认当前楼层
    if (_this.opts.changeHash) {
        _this.hide_header();
        _this.$spSection.each(function () {
            if (location.hash == '#' + $.trim($(this).attr("data-hash"))) {
                _this.cur = $(this).index();
            }
        });
    }
    //如果所有的楼层和当前的location.hash都不匹配，则默认定义到第一楼层，并给当前的location.hash赋值为第一楼层的hash
    if (_this.cur === null) {
        _this.cur = 0;
        if (_this.opts.changeHash) {
            location.hash = _this.$spSection.eq(_this.cur).attr("data-hash");
        }
    }
    //判断楼层的切换方式
    if (_this.opts.mode == 'fade') {
        _this.$spSection.css({'position': 'absolute', 'top': 0, 'left': 0, opacity: 0, 'z-index': 1});
    }


    _this.zsy();  //自适应
    _this.locate();  //定位
    $(window).on("resize", function () {
        _this.zsy();   //自适应
        _this.locate();   //定位
    });
    //绑定滚轮事件
    if (window.addEventListener) { //DOMMouseScroll是火狐专用事件
        document.body.addEventListener('DOMMouseScroll', function (e) {
            _this.wheel(e);
        }, false);
    }
    document.body.onmousewheel = function (e) {
        _this.wheel(e);
    };
    //绑定键盘事件
    $(document).on('keyup', function (event) {
        if (!_this.wait) {
            switch (event.keyCode) {
                case 38: // up
                    _this.prevSp();
                    break;
                case 40: // down
                    _this.nextSp();
                    break;
            }
        }
        return false;
    });
    if (_this.opts.changeHash) {
        //高版本浏览器更改location.hash，会增加历史记录。当用户点击"后退""前进"按钮时会触发hashchange事件
        //因此监听hashchange事件，hash是和楼层对应的，因此更改当前楼层
        if (window.addEventListener) {
            window.addEventListener('hashchange', function () {
                _this.hide_header();
                _this.$spSection.each(function () {
                    if (location.hash == '#' + $.trim($(this).attr("data-hash"))) {
                        _this.cur = $(this).index();
                    }
                });
                _this.locate();
            }, false);
        }
    }

    //按钮绑定事件
    _this.$spBtn.on('click', function (e) {
        var hash = $(this).attr("data-hash");
        _this.hide_header();
        _this.headerShowIng = false;
        _this.footerShowIng = false;
        if (_this.opts.changeHash) {
            location.hash = '#' + hash;
            if (!window.onhashchange) {
                _this.$spSection.each(function () {
                    if (hash == $.trim($(this).attr("data-hash"))) {
                        _this.cur = $(this).index();
                    }
                });
                _this.locate();
            }
        } else {
            _this.$spSection.each(function () {
                if (hash == $.trim($(this).attr("data-hash"))) {
                    _this.cur = $(this).index();
                }
            });
            _this.locate();
        }
    });
}

//自适应
SinglePage.prototype.zsy = function () {
    var _this = this;
    _this.spH = $(window).height();
    _this.$singlepage.css("height", _this.spH);
    if (_this.opts.mode == 'fade') {
        _this.$spSectionWrapper.css("height", _this.spH);
    } else {
        _this.$spSectionWrapper.css("height", _this.spH * _this.SpNum);
    }
    _this.$spSection.css("height", _this.spH);
    _this.$spInside.css("height", _this.spH);
};

SinglePage.prototype.show_footer = function () {
    var _this = this;
    if (_this.$footer) {
        _this.wait = true;
        _this.footerShowIng = true;
        _this.changeCurBtn();
        _this.beforeSlideLoad();
        _this.$placeHolder.animate({marginTop: '-' + (_this.headerH + _this.footerH) + 'px'}, {
            easing: _this.opts.easing, queue: false, duration: _this.opts.duration, complete: function () {
                _this.wait = false;
                _this.afterSlideLoad();
            }
        });
    }
};

SinglePage.prototype.hide_footer = function () {
    var _this = this;
    if (_this.$footer) {
        _this.wait = true;
        _this.footerShowIng = false;
        _this.changeCurBtn();
        _this.beforeSlideLoad();
        _this.$placeHolder.animate({marginTop: '-' + _this.headerH + 'px'}, {
            easing: _this.opts.easing, queue: false, duration: _this.opts.duration, complete: function () {
                _this.wait = false;
                _this.afterSlideLoad();
            }
        });
    }
};

SinglePage.prototype.show_header = function () {
    var _this = this;
    if (_this.$header) {
        _this.wait = true;
        _this.headerShowIng = true;
        _this.changeCurBtn();
        _this.beforeSlideLoad();
        _this.$placeHolder.animate({marginTop: 0}, {
            easing: _this.opts.easing, queue: false, duration: _this.opts.duration, complete: function () {
                _this.wait = false;
                _this.afterSlideLoad();
            }
        });
    }
};

SinglePage.prototype.hide_header = function () {
    var _this = this;
    if (_this.$header) {
        _this.wait = true;
        _this.headerShowIng = false;
        _this.changeCurBtn();
        _this.beforeSlideLoad();
        _this.$placeHolder.animate({marginTop: '-' + _this.headerH + 'px'}, {
            easing: _this.opts.easing, queue: false, duration: _this.opts.duration, complete: function () {
                _this.wait = false;
                _this.afterSlideLoad();
            }
        });
    }
};

//下一楼
SinglePage.prototype.nextSp = function () {
    var _this = this;
    if (_this.headerShowIng) {
        _this.hide_header();
    } else if (!_this.footerShowIng) {
        _this.cur = _this.cur + 1;
        if (_this.cur > (_this.SpNum - 1)) {
            _this.cur = _this.SpNum - 1;
            _this.show_footer();
        }
        if (_this.opts.changeHash) {
            //如果浏览器支持onhashchange事件，就没必要在这里再执行一边"定位"函数了，因为用js改变location.hash会触发onhashchange事件。下面同理！
            if (!window.onhashchange) {
                _this.locate();
            }
            location.hash = _this.$spSection.eq(_this.cur).attr('data-hash');
        } else {
            _this.locate();
        }
    }
};

//上一楼
SinglePage.prototype.prevSp = function () {
    var _this = this;
    if (_this.footerShowIng) {
        _this.hide_footer();
    } else if (!_this.headerShowIng) {
        _this.cur = _this.cur - 1;
        if (_this.cur < 0) {
            _this.cur = 0;
            _this.show_header();
        }
        if (_this.opts.changeHash) {
            if (!window.onhashchange) {
                _this.locate();
            }
            location.hash = _this.$spSection.eq(_this.cur).attr('data-hash');
        } else {
            _this.locate();
        }
    }
};

//定位
SinglePage.prototype.locate = function () {
    var _this = this;
    _this.changeCurBtn();
    _this.beforeSlideLoad();
    if (_this.opts.mode == 'scroll') {
        if (_this.opts.duration) {
            _this.wait = true;
            _this.$spSectionWrapper.animate({top: (-_this.cur * _this.spH)}, {
                easing: _this.opts.easing, queue: false, duration: _this.opts.duration, complete: function () {
                    _this.wait = false;
                    _this.afterSlideLoad();
                }
            });
        } else {
            _this.$spSectionWrapper.css("top", (-_this.cur * _this.spH));
            _this.afterSlideLoad();
        }
    } else if (_this.opts.mode == 'fade') {
        if (_this.opts.duration) {
            _this.wait = true;
            _this.$spSection.eq(_this.cur).siblings().animate({opacity: 0}, {
                queue: false, duration: _this.opts.duration, complete: function () {
                    _this.wait = false;
                    _this.afterSlideLoad();
                }
            }).css('z-index', 1);
            _this.$spSection.eq(_this.cur).animate({opacity: 1}, {
                queue: false, duration: _this.opts.duration, complete: function () {
                    _this.wait = false;
                }
            }).css('z-index', 2);
        } else {
            _this.$spSection.css({'z-index': 1, 'opacity': 0});
            _this.$spSection.eq(_this.cur).css({'z-index': 2, 'opacity': 1});
            _this.afterSlideLoad();
        }
    } else {
        alert("参数错误");
    }
};

//改变选中按钮
SinglePage.prototype.changeCurBtn = function () {
    var _this = this;
    if (_this.$spBtn.length > 0) {
        _this.$spBtn.removeClass('cur');
        if (!_this.headerShowIng && !_this.footerShowIng) {
            _this.$spBtn.eq(_this.cur).addClass('cur');
        }
    }
};

//滚轮事件
SinglePage.prototype.wheel = function (e) {
    var _this = this;
    if (!_this.wait && ((new Date() - _this.lastWheelTime) >= _this.opts.duration)) {
        _this.lastWheelTime = new Date();
        var e = window.event || e;
        unPropagation(e);
        stopDefaultAction(e);
        var wheelDelta = e.wheelDelta || e.detail;  //detail是firefox的属性
        if (wheelDelta == -120 || wheelDelta == 3) {
            //向下滚动滑轮
            _this.nextSp();
        } else if (wheelDelta == 120 || wheelDelta == -3) {
            //向上滚动滑轮
            _this.prevSp();
        }
    }
    return false;
};

//根据cur和headerShowIng设置$spSection的active和headerShowIng的状态
SinglePage.prototype.beforeSlideLoad = function () {
    var _this = this;
    if (!_this.nonsupport_transition) {
        _this.$spSection.removeClass('active');
        _this.$spSection.removeClass('headerShowIng');
        _this.$spSection.removeClass('footerShowIng');
        if (_this.headerShowIng) {
            _this.$spSection.eq(_this.cur).addClass('headerShowIng');
            return;
        }
        if (_this.footerShowIng) {
            _this.$spSection.eq(_this.cur).addClass('footerShowIng');
            return;
        }
        _this.$spSection.eq(_this.cur).addClass('active');
    }
};

SinglePage.prototype.afterSlideLoad = function () {
    var _this = this;
};