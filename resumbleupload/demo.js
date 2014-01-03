var progressbar = Ext.create('Ext.ProgressBar', {
    width: 500,
    hidden: true
});
var Bigupform = new Ext.form.Panel({
    title: "断点续上传",
    region: "center",
    fieldDefaults: {
        width: 500
    },
    id: "resumbleUpload",
    defaultType: "textfield",
    bodyPadding: 5,
    items: [{
            xtype: "fieldcontainer",
            fieldLabel: "upToken",
            width: 500,
            layout: "hbox",
            combineErrors: true,
            defaultType: "textfield",
            defaults: {
                hideLabel: "true"
            },
            items: [{
                name: "txt_upload_token",
                id: "txt_upload_token",
                xtype: "textarea",
                emptyText: "如果不知道如何生成token，可以点击右侧的链接生成，然后将结果复制粘贴过来",
                width: 310,
                height: 80,
                allowBlank: false
            }, {
                xtype: 'displayfield',
                fieldLabel: 'Visitor',
                name: 'visitor_score',
                value: '<a href="http://jsfiddle.net/gh/get/extjs/4.2/icattlecoder/jsfiddle/tree/master/uptoken" target="_blank">在线生成</a>'
            }]
        }, {
            id: "txt_upload_key",
            name: "txt_upload_key",
            emptyText: "如果您在生成token的过程中指定了key，则将其输入至此。否则留空",
            fieldLabel: "key"
        }, {
            xtype: "fieldcontainer",
            fieldLabel: "路径",
            width: 500,
            layout: "hbox",
            combineErrors: true,
            defaults: {
                hideLabel: "true"
            },
            items: [{
                xtype: 'filefield',
                name: 'photo',
                msgTarget: 'side',
                width: 345,
                allowBlank: false,
                buttonText: '选择文件',
                id: "fileselect"
            }, {
                xtype: "button",
                margins: '0 0 0 6',
                text: "上传",
                handler: function() {
                    if (!Bigupform.isValid()) {
                        return;
                    }
                    var token = Ext.getCmp("txt_upload_token").getValue().trim();
                    var key = Ext.getCmp("txt_upload_key").getValue().trim();

                    var up_result = Ext.getCmp("up_result");
                    up_result.hide();
                    Q.addEvent("progress", function(p, s) {
                        progressbar.updateProgress(p / 100.0, s, true);
                    });
                    //上传完成回调
                    //fsize:文件大小(MB)
                    //res:上传返回结果，默认为{hash:<hash>,key:<key>}
                    Q.addEvent("putFinished", function(fsize, res, taking) {
                        uploadSpeed = 1024 * fsize / (taking * 1000);
                        if (uploadSpeed > 1024) {
                            formatSpeed = (uploadSpeed / 1024).toFixed(2) + "Mb\/s";
                        } else {
                            formatSpeed = uploadSpeed.toFixed(2) + "Kb\/s";
                        };
                        progressbar.hide();
                        up_result.show();
                        var tpl = new Ext.XTemplate(
                            '<ul>',
                            '<li>文件地址:http://<bucketName>[.u].qiniudn.com/{key}</li>',
                            '<li>hash值 :{hash}</li>',
                            '<li>平均速度:{speed}</li>',
                            '</ul>');
                        var res = {
                            key: res.key,
                            hash: res.hash,
                            speed: formatSpeed
                        };
                        tpl.overwrite(up_result.body, res);
                        up_result.doLayout();
                    });
                    var o = Ext.getCmp("fileselect");
                    Q.SetToken(token);
                    Q.Upload(o.fileInputEl.dom.files[0], key);
                    progressbar.show();
                }
            }]
        },
        progressbar, {
            xtype: 'fieldset',
            title: '上传结果',
            collapsible: true,
            hidden: true,
            bodyPadding: 10,
            width: 500,
            id: "up_result",
        }
    ]
});

Ext.application({
    requires: ['Ext.container.Viewport'],
    name: 'QN',
    launch: function() {
        Ext.create('Ext.container.Viewport', {
            layout: {
                type: "border"
            },
            items: [Bigupform]
        });
    }
});
