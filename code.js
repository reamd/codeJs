/**
 * Created by reamd on 2016/10/11.
 * 原生验证码组件code.js
 */
//UMD通用接口
(function (root, factory) {
    "use strict";
    if (typeof define === 'function' && define.amd) {
        // AMD
        define('code', [], function () {
            return factory;
        });
    } else if (typeof exports === 'object') {
        // Node.js
        module.exports.code = factory;
    } else {
        // Browser globals
        root.code = factory;
    }
}(typeof window !== "undefined" ? window : this, function (ele,opt) {
    var me = this,
        _$ = function(selector){
            return document.querySelector(selector);
        };
    //构造函数的数据结构
    this.on = opt.on || false; //是否开启验证码插件
    this.status = opt.on?null:'correct';
    this.codeUrl = opt.codeUrl; //验证码请求地址
    this.validUrl = opt.validUrl; //验证码验证地址

    this.changeCallback = opt.changeCallback || _changeCallback; //验证码输入框输入改变事件
    this.focusCallback = opt.focusCallback || _focusCallback; //输入框获得焦点事件
    this.blurCallback = opt.blurCallback || _blurCallback; //输入框失去焦点事件
    this.refreshCallback = opt.refreshCallback || _refreshCallback; //验证码刷新事件

    this.show = function(){
        if(me.on){
            return;
        }else {
            me.on = true;
        }
        if(me.status === 'correct'){
            me.status = null;
        }
        _$(ele).setAttribute("style","display:block;");
    };
    this.check = function(cb){
        cb = cb || alert;
        //检测验证码输入框的状态
        if(me.on){
            var len = _$(ele + ' #code').value.length,
                attr =  _$(ele + ' .input-tip').getAttribute('class');
            if(len === 0){
                me.status = null;
            }else if(attr.indexOf('correct') > -1){
                me.status = 'correct';
            }else if(attr.indexOf('error') > -1){
                me.status = 'error';
            }else {
                me.status = 'other';
            }
        }
        switch(me.status){
            case null:
                cb('请输入验证码！');
                return;
            case 'correct':
                return true;
            case 'error':
                cb('验证码输入错误！');
                return;
            default:
                cb('验证码出错！');
                return;
        }
    };
    this.refresh = function(){
        _$(ele + ' .input-tip').setAttribute('class','input-tip');
        _$(ele + ' #code').value = "";
        _$(ele + ' .refreshCode img').setAttribute('src', me.codeUrl + '?' + new Date().getTime());
    };

    //预置功能函数
    var template = function () {
        this.parts = [];
        this._pushAll(arguments);
    };
    template.prototype = {
        _: function () {
            this._pushAll(arguments);
            return this;
        },

        toString: function () {
            return this.parts.join('');
        },

        _pushAll: function (arr) {
            var i, n = arr.length;
            for (i = 0; i < n; i++) {
                this.parts.push(arr[i]);
            }
        }
    };

    //从服务器请求校验验证码
    function _ajax(opt){//opt{url: ,method: ,data:{}, success: function(){}, error: function(){}}
        //创建 - 非IE6 - 第一步
        var xhr;
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else { //IE6及其以下版本浏览器
            xhr = new ActiveXObject('Microsoft.XMLHTTP');
        }

        //接收 - 第三步
        xhr.addEventListener("readystatechange", function () {
            if (xhr.readyState == 4) {
                var status = xhr.status;
                if (status >= 200 && status < 300) {
                    opt.success && opt.success(xhr.responseText);
                } else {
                    opt.error && opt.error(xhr.status);
                }
            }
        });

        //连接 和 发送 - 第二步
        if (opt.type === "GET") {
            xhr.open("GET", opt.url, true);
            xhr.send(null);
        } else if (opt.type === "POST") {
            xhr.open("POST", opt.url, true);
            //设置表单提交时的内容类型
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
            xhr.send(opt.data&&opt.data || null);
        }
    }

    function _reqValid(text, callback){
        _ajax({
            url: me.validUrl[0],
            type: me.validUrl[2],
            data: me.validUrl[1]+ "=" +text,
            success: function(res){
                res = JSON.parse(res);
                if(res[me.validUrl[3]]){
                    callback(null);
                }else {
                    callback(res);
                }
            },
            error: function(err){
                callback(err);
            }
        })
    }

    //默认内置的事件
    function _changeCallback(){
        _$(ele + ' #code').addEventListener('input', function(){
            _$(ele + ' .input-tip').setAttribute('class','input-tip');
            var len = this.value.length;
            if(len === 4){
                _reqValid(this.value, function(err, data){
                    if(err){
                        _$(ele + ' .input-tip').setAttribute('class','input-tip error');
                        _$(ele + ' #code').value = "";
                        _$(ele + ' .text').click();
                    }else {
                        _$(ele + ' .input-tip').setAttribute('class','input-tip correct');
                    }
                });
            }else if(len > 4){
                _$(ele + ' .input-tip').setAttribute('class','input-tip error');
            }
        });
    }
    function _focusCallback(){
        _$(ele + ' #code').addEventListener('focus',function(){
            var len = this.value.length;
            if(len < 4){
                _$(ele + ' .input-tip').setAttribute('class','input-tip');
            }
        });
    }
    function _blurCallback(){
        _$(ele + ' #code').addEventListener('blur', function(){
            var len = this.value.length;
            if(len > 0 && len < 4){
                _$(ele + ' .input-tip').setAttribute('class','input-tip error');
            }
        });
    }
    function _refreshCallback(){
        _$(ele + ' .refreshCode').addEventListener('click', function(){
            me.refresh();
            _$(ele + ' #code').focus();
        });
        _$(ele + ' .text').addEventListener('click', function(){
            me.refresh();
            _$(ele + ' #code').focus();
        });
    }

    //模板组装（样式和元素内联）
    var t = new template();
    t._('<style>.correct{background:url(data:image/png;base64,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) no-repeat}' +
            '.error{background:url(data:image/png;base64,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) no-repeat}' +
            '.input-tip{position:relative;top:5px;left:105px;background-size:contain;width:20px;height:20px;display:inline-block}#code{width:115px;height:30px;padding:5px 0 5px 10px;margin-left:-20px;}#codeErr{display:none;margin-left:18px}.refreshCode{cursor:pointer;color:#ababab;margin-left: 10px;}.refreshCode img{position:relative;top:15px;width:100px;height:38px}</style>')
        ._('<label class="input-tip"></label>')
        ._('<input id="code" type="text" title="验证码"/>')
        ._('<a class="refreshCode"><img alt="加载失败，点击刷新" src="'+ me.codeUrl +'" title="点击刷新图片校验码"/></a>')
        ._('<a class="refreshCode text">看不清，换一张</a>');

    //模板封装渲染
    if(this.on){
        _$(ele).setAttribute("style","display:block;");
    }else {
        _$(ele).setAttribute("style","display:none;");
    }
    _$(ele).innerHTML = t.toString();

    //事件绑定
    me.changeCallback(),me.focusCallback(),me.blurCallback(),me.refreshCallback();
}));