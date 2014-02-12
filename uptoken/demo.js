Ext.onReady(function() {

    App = {
        Bucket: "qtestbucket",
        SignUrl: "token.php",
        //qiniu test account
        AK: "iN7NgwM31j4-BZacMjPrOQBs34UG1maYCAQmhdCV",
        SK: "6QTOr2Jg1gcZEWDQXKOGZh5PziC2MCV5KsntT70j"
    }

    /* utf.js - UTF-8 <=> UTF-16 convertion
     *
     * Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
     * Version: 1.0
     * LastModified: Dec 25 1999
     * This library is free. You can redistribute it and/or modify it.
     */
    /*
     * Interfaces:
     * utf8 = utf16to8(utf16);
     * utf16 = utf8to16(utf8);
     */

    function utf16to8(str) {
        var out, i, len, c;
        out = "";
        len = str.length;
        for (i = 0; i < len; i++) {
            c = str.charCodeAt(i);
            if ((c >= 0x0001) && (c <= 0x007F)) {
                out += str.charAt(i);
            } else if (c > 0x07FF) {
                out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
                out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
            } else {
                out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
            }
        }
        return out;
    }

    function utf8to16(str) {
        var out, i, len, c;
        var char2, char3;
        out = "";
        len = str.length;
        i = 0;
        while (i < len) {
            c = str.charCodeAt(i++);
            switch (c >> 4) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                    // 0xxxxxxx
                    out += str.charAt(i - 1);
                    break;
                case 12:
                case 13:
                    // 110x xxxx 10xx xxxx
                    char2 = str.charCodeAt(i++);
                    out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                    break;
                case 14:
                    // 1110 xxxx 10xx xxxx 10xx xxxx
                    char2 = str.charCodeAt(i++);
                    char3 = str.charCodeAt(i++);
                    out += String.fromCharCode(((c & 0x0F) << 12) | ((char2 & 0x3F) << 6) | ((char3 & 0x3F) << 0));
                    break;
            }
        }
        return out;
    }

    /*
     * Interfaces:
     * b64 = base64encode(data);
     * data = base64decode(b64);
     */
    var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    var base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
        52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
        15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
        41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);

    function base64encode(str) {
        var out, i, len;
        var c1, c2, c3;
        len = str.length;
        i = 0;
        out = "";
        while (i < len) {
            c1 = str.charCodeAt(i++) & 0xff;
            if (i == len) {
                out += base64EncodeChars.charAt(c1 >> 2);
                out += base64EncodeChars.charAt((c1 & 0x3) << 4);
                out += "==";
                break;
            }
            c2 = str.charCodeAt(i++);
            if (i == len) {
                out += base64EncodeChars.charAt(c1 >> 2);
                out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
                out += base64EncodeChars.charAt((c2 & 0xF) << 2);
                out += "=";
                break;
            }
            c3 = str.charCodeAt(i++);
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
            out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
            out += base64EncodeChars.charAt(c3 & 0x3F);
        }
        return out;
    }

    function base64decode(str) {
        var c1, c2, c3, c4;
        var i, len, out;
        len = str.length;
        i = 0;
        out = "";
        while (i < len) {
            /* c1 */
            do {
                c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
            } while (i < len && c1 == -1);
            if (c1 == -1) break;
            /* c2 */
            do {
                c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
            } while (i < len && c2 == -1);
            if (c2 == -1) break;
            out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));
            /* c3 */
            do {
                c3 = str.charCodeAt(i++) & 0xff;
                if (c3 == 61) return out;
                c3 = base64DecodeChars[c3];
            } while (i < len && c3 == -1);
            if (c3 == -1) break;
            out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));
            /* c4 */
            do {
                c4 = str.charCodeAt(i++) & 0xff;
                if (c4 == 61) return out;
                c4 = base64DecodeChars[c4];
            } while (i < len && c4 == -1);
            if (c4 == -1) break;
            out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
        }
        return out;
    }
    var safe64 = function(base64) {
        base64 = base64.replace(/\+/g, "-");
        base64 = base64.replace(/\//g, "_");
        return base64;
    };
    var token;
    genToken = function(accessKey, secretKey, putPolicy) {
        var setStep = function(id, val) {
            Ext.getCmp(id).setValue("<div style=\"color:blue;word-break: break-all;font-size:18px;line-height:28px;\"><b>" + val + "</b></div>");
        }
        //SETP 2
        var put_policy = JSON.stringify(putPolicy);
        console.log("put_policy = ", put_policy);

        setStep("disp_step2", put_policy);

        //SETP 3
        var encoded = base64encode(utf16to8(put_policy));
        console.log("encoded = ", encoded);
        setStep("disp_step3", encoded);

        //SETP 4
        var hash = CryptoJS.HmacSHA1(encoded, secretKey);
        var encoded_signed = hash.toString(CryptoJS.enc.Base64);
        setStep("disp_step4", encoded_signed);

        //SETP 5
        var upload_token = accessKey + ":" + safe64(encoded_signed) + ":" + encoded;
        setStep("disp_step5", upload_token);

        return upload_token;
    };

    var tokenPanel_policy = new Ext.form.Panel({
        region: 'center',
        fieldDefaults: {
            labelWidth: 100
        },
        autoScroll: true,
        defaultType: 'textfield',
        bodyPadding: 10,
        items: [{
            id: 'txt_accessKey',
            fieldLabel: 'accessKey',
            width: 500,
            allowBlank: false,
            value: App.AK,
            name: 'accessKey'
        }, {
            id: 'txt_secretKey',
            fieldLabel: 'secretKey',
            width: 500,
            inputType: 'password',
            value: App.SK,
            name: 'secretKey'
        }, {
            id: 'txt_bucketName',
            fieldLabel: 'bucketName',
            width: 500,
            allowBlank: false,
            value: 'qtestbucket',
            name: 'bucketName'
        }, {
            id: 'txt_key',
            fieldLabel: 'key',
            emptyText: '可选',
            width: 500,
            name: 'key'
        }, {
            id: 'adgp_type',
            xtype: 'radiogroup',
            width: 500,
            fieldLabel: 'Back类型',
            columns: 3,
            defaults: {
                name: 'type'
            },
            items: [{
                inputValue: 'none',
                id: 'rdo_nonetype',
                checked: true,
                boxLabel: '不使用'
            }, {
                inputValue: 'return',
                id: 'rdo_backtype',
                boxLabel: '使用returnBack'
            }, {
                inputValue: 'callback',
                boxLabel: '使用CallBackUrl'
            }],
            listeners: {
                change: function(thiz, newv, old, eopts) {
                    switch (newv.type) {
                        case "return":
                            {
                                Ext.getCmp("txt_returnUrl").show();
                                Ext.getCmp("txt_returnBody").show();
                                Ext.getCmp("txt_callbackUrl").hide();
                                Ext.getCmp("txt_callbackBody").hide();
                            }
                            break;
                        case "callback":
                            {
                                Ext.getCmp("txt_returnUrl").hide();
                                Ext.getCmp("txt_returnBody").hide();
                                Ext.getCmp("txt_callbackUrl").show();
                                Ext.getCmp("txt_callbackBody").show();
                            }
                            break;
                        default:
                            {
                                Ext.getCmp("txt_returnUrl").hide();
                                Ext.getCmp("txt_returnBody").hide();
                                Ext.getCmp("txt_callbackUrl").hide();
                                Ext.getCmp("txt_callbackBody").hide();
                            }
                    }
                }
            }
        }, {

            fieldLabel: 'returnUrl',
            id: 'txt_returnUrl',
            width: 500,
            hidden: true,
            vtype: 'url',
            emptyText: "http url",
            name: 'returnUrl'
        }, {
            id: 'txt_returnBody',
            fieldLabel: 'returnBody',
            emptyText: "json格式字符串",
            hidden: true,
            width: 500,
            name: 'returnBody'
        }, {
            fieldLabel: 'callbackUrl',
            id: 'txt_callbackUrl',
            emptyText: "http url",
            width: 500,
            hidden: true,
            vtype: 'url',
            name: 'callbackUrl'
        }, {
            id: 'txt_callbackBody',
            fieldLabel: 'callbackBody',
            emptyText: '格式为a=1&b=2&c=3',
            hidden: true,
            width: 500,
            name: 'callbackBody'
        }, {
            id: 'txt_asyncOpt',
            fieldLabel: 'asyncOps',
            emptyText: '可选',
            width: 500,
            name: 'asyncOps'
        }, {
            id: 'txt_endUser',
            fieldLabel: 'endUser',
            width: 500,
            emptyText: '可选',
            name: 'endUser'
        }, {
            id: 'txt_deadline',
            xtype: 'combobox',
            fieldLabel: 'deadline',
            displayField: 'expiretxt',
            valueField: 'expire',
            emptyText: '下拉选择',
            queryMode: 'local',
            allowBlank: false,
            margins: '0 6 0 0',
            store: new Ext.data.Store({
                fields: ['expiretxt', 'expire'],
                data: (function() {
                    var data = [];
                    for (i = 1; i < 13; i++) {
                        data[i - 1] = {
                            'expiretxt': i + '小时后',
                            'expire': i
                        };
                    }
                    return data;
                })()
            }),
            listeners: {
                afterRender: function(combo) {
                    combo.setValue(1); //同时下拉框会将与name为firstValue值对应的 text显示
                }
            },
            forceSelection: true
        }, {
            text: '生成Uptoken',
            xtype: 'button',
            handler: function(btn) {
                if (!tokenPanel_policy.isValid()) {
                    Ext.Msg.alert("错误", "上传策略填写不完整");
                    return;
                }
                var policy = new Object();
                var bucketName = Ext.getCmp("txt_bucketName").getValue();
                var accessKey = Ext.getCmp("txt_accessKey").getValue();
                var secretKey = Ext.getCmp("txt_secretKey").getValue();
                policy.scope = bucketName;
                var key = Ext.getCmp("txt_key").getValue();
                if (key) {
                    policy.scope += (":" + key);
                }
                var type = Ext.getCmp("adgp_type").getValue();
                switch (type.type) {
                    case "return":
                        {
                            var returnUrl = Ext.getCmp("txt_returnUrl").getValue();
                            var returnBody = Ext.getCmp("txt_returnBody").getValue();
                            if (returnUrl) {
                                policy.returnUrl = returnUrl;
                                policy.returnBody = safe64(returnBody);
                            }
                        }
                        break;
                    case "callback":
                        {
                            var callbackUrl = Ext.getCmp("txt_callbackUrl").getValue();
                            var callbackBody = Ext.getCmp("txt_callbackBody").getValue();
                            if (callbackUrl) {
                                if (!callbackBody) {
                                    Ext.Msg.alert("错误", "callbackBody不能为空，格式为a=1&b=2&c=3")
                                    return
                                }
                                policy.callbackUrl = callbackUrl;
                                policy.callbackBody = callbackBody;
                            }
                        }
                        break;
                }
                var async = Ext.getCmp("txt_asyncOpt").getValue();
                if (async) {
                    policy.async = async;
                }
                var endUser = Ext.getCmp("txt_endUser").getValue();
                if (endUser) {
                    policy.endUser = endUser;
                }
                var expire = Ext.getCmp("txt_deadline").getValue();
                var deadline = Math.round(new Date().getTime() / 1000) + expire * 3600
                policy.deadline = deadline;
                token = genToken(accessKey, secretKey, policy);
                Ext.getCmp("token_res").expand()
                console && console.log("token=", token);
            }
        }]
    });

    var tokenPanel = Ext.create('Ext.panel.Panel', {
        layout: 'border',
        region: 'center',
        items: [tokenPanel_policy, {
            xtype: 'form',
            id: "token_res",
            split: true,
            collapsible: true,
            collapsed: true,
            title: '结果',
            region: "east",
            autoScroll: true,
            width: 600,
            ext: 2,
            defaultType: 'displayfield',
            bodyPadding: 10,
            items: [{
                fieldLabel: "第一步",
                value: '确定上传策略'
            }, {
                fieldLabel: "第二步",
                value: '将上传策略序列化成为json格式:'
            }, {
                id: "disp_step2",
            }, {
                fieldLabel: "第三步",
                value: '对json序列化后的上传策略进行URL安全的Base64编码,得到如下encoded:'
            }, {
                id: "disp_step3",
            }, {
                fieldLabel: "第四步",
                value: '用SecretKey对编码后的上传策略进行HMAC-SHA1加密，并且做URL安全的Base64编码,得到如下的encoded_signed:'
            }, {
                id: "disp_step4",
            }, {
                fieldLabel: "第五步",
                value: '将 AccessKey、encode_signed 和 encoded 用 “:” 连接起来,得到如下的UploadToken:'
            }, {
                id: "disp_step5",
                anchor: "100%"
            }]
        }]
    });

    Ext.define('EP.view.qiniu.Qtoken', {
        extend: 'Ext.panel.Panel',
        alias: 'widget.Qtoken',
        layout: 'border',
        items: [tokenPanel]
    });

    Ext.application({
        requires: ['Ext.container.Viewport'],
        name: 'QN',

        launch: function() {
            Ext.create('Ext.container.Viewport', {
                layout: {
                    type: "border"
                },
                items: [{
                    xtype: "Qtoken",
                    region: "center",
                    id: 'tokenx'
                }]
            });
        }
    });
});
