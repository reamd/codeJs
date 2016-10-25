# 原生验证码组件code.js
[TOC]

## 组件使用demo
1. 首先需要在body元素末尾引入code.js这个组件库，如下
```js
<script src="code.js"></script>
```
2. html代码如下：
```js
<form>
    <br/>
    登录名:<input type="text" name="username"/><br/><br/>
    密&nbsp;码:<input type="password" name="pwd"/>
    <div id="codeContainer"></div>
    <br>
    <input type="button" name="login" value="登录" style="width: 80px;height:30px;line-height: 30px;"/>
</form>
```
3. 实例化调用：
```js
var cd = new code('#codeContainer',{                    //需要绑定的元素，符合xpath语法
        on: true,                                          //是否显示验证码组件，默认为false
        codeUrl: 'http://localhost:8080/login/getCode',    //验证码请求地址
        validUrl: ['http://localhost:8080/login/validCode','verifyCode','POST','flag'],  //[用户输入验证码验证地址，验证码上传到服务器提交的接口参数名，ajax提交方式，验证成功的判断字段]
        changeCallback: function(){...}                    //验证码输入框输入改变事件
        focusCallback: function(){...}                     //输入框获得焦点事件
        blurCallback: function(){...}                      //输入框失去焦点事件
        refreshCallback: function(){...}                   //验证码刷新事件
    });
```
*注：changeCallback，focusCallback，blurCallback，refreshCallback四个参数默认内置，除非有特殊需求的时候重写这四个方法，否则省略这四个参数即可。*
4. 表现效果
 - **输入正确**
	![正确输入效果](https://github.com/reamd/material/blob/master/codeJs/correct.gif)
    
 - **输入错误**
	![错误输入效果](https://github.com/reamd/material/blob/master/codeJs/error.gif)  
    
## 组件代码解析
1. 组件库代码头部采用了UMD规范，兼容前端AMD规范，后端CommonJS规范，原生js全局变量。
相关代码如下：
```js
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
...
}));
```

2. 组件库构造函数的数据结构如下：
```js
	this.on = opt.on || false; //是否开启验证码
    this.codeUrl = opt.codeUrl; //验证码请求地址
    this.validUrl = opt.validUrl; //验证码验证地址

    this.changeCallback = opt.changeCallback || _changeCallback; //验证码输入框输入改变事件
    this.focusCallback = opt.focusCallback || _focusCallback; //输入框获得焦点事件
    this.blurCallback = opt.blurCallback || _blurCallback; //输入框失去焦点事件
    this.refreshCallback = opt.refreshCallback || _refreshCallback; //验证码刷新事件
	this.show = function(){
        _$(ele).setAttribute("style","display:block;");
    }; //验证码显示方法
```

3. 预置功能函数和默认内置事件
 - 预置功能方法有
	- html模板拼接方法
```js
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
```
	- ajax原生请求应用封装 
```js
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
```

 -  默认内置事件
	- 验证码输入框输入改变事件
	- 输入框获得焦点事件
	- 输入框失去焦点事件
	- 验证码刷新事件
*注：由于篇幅有限，故不一一展示代码，感兴趣者可自行参考code.js的相关函数，`_changeCallback`,`_focusCallback`,`_blurCallback`,`_refreshCallback`。*

4. 模板组装和事件绑定
 - 模板组装中使用了image base64图片编码技术进行显示提示相关图片
 - 当模板渲染完毕后，进行事件调用以进行上述默认内置事件的绑定