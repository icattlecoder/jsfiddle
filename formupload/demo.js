/*
*   本示例演示七牛云存储表单上传
*
*   按照以下的步骤运行示例：
*
*   1. 填写token。如果您不知道如何生成token，可以点击右侧的链接生成，然后将结果复制粘贴至token输入框。
*   2. 填写key。如果您在生成token的过程中指定了key，则将其输入至此。否则留空。
*   3. 姓名是一个自定义的变量，如果生成token的过程中指定了returnUrl和returnBody，
*      并且returnBody中指定了期望返回此字段，则七牛会将其返回给returnUrl对应的业务服务器。
*      此规则同样适用于callbackUrl及callbackBody。
*   4. 选择任意一张小于5MB的照片（实际使用中无此大小限制），然后点击提交即可。
*   
*   实际开发中，您可以通过后端开发语言动态生成这个表单，将token的hidden属性设置为true并对其进行赋值。
*
*	**********************************************************************************
* 	* 贡献代码：
*	* 1. git clone git@github.com:icattlecoder/jsfiddle
*	* 2. push代码到您的github库
*   * 2. 测试效果，访问 http://jsfiddle.net/gh/get/library/pure/<Your GitHub Name>/jsfiddle/tree/master/formupload
*	* 3. 提pr
*   **********************************************************************************
*/