(function(root) {
    var Utils = root.Utils = {};
    
    //返回 min~max之间的一个数 不包含max 如果需要包含最大值 可在调用的时候max为你需要的最大值+1
    Utils.range_value = function(min, max) {
        return Math.floor(Math.random()*(max-min) + min);
    };

    //返回 0~max之间的一个数 不包含max
    Utils.random_number = function(max) {
        return Utils.range_value(0, max);
    };

    // 分割数字，每3位加个逗号
    Utils.format_by_comma = function(number) {
        var str = String(number);
        var newStr = "";
        
        var format = function(params) {
            var resultStr = "";
            var count = 0;
            for (var index = params.length-1 ; index >= 0 ; index--) {
                if (count % 3 == 0 && count != 0) {
                    resultStr = params.charAt(index) + "," + resultStr;
                }
                else {
                    resultStr = params.charAt(index) + resultStr;
                }
                count++;
            }
            return resultStr;
        };


        if (str.indexOf(".") == -1) {
            newStr = format(str);
        }
        else {
            // 小数点后的数字
            var commaRight = str.slice(str.indexOf("."));

            // 小数点前的数字
            var commaLeft = str.slice(0,str.indexOf("."));

            newStr = format(commaLeft);
            newStr += commaRight;
        }
        
        return newStr;
    };

    /***
     * 字符串转成tableData,公用方法
     * @param data
     * @returns {Array}
     */
    Utils.genTSVTable = function (data) {
        data = data || "";
        // linux和Windows下面的换行不同 Windows下面可能带\r 所以这里要先去掉\r 以保证最后一个字符不会有\r
        data = data.replace(/(^\s*)|(\s*$)|\r/g, "");
        var arr = data.split("\n");
        // 第一行为表头
        var titleLine = arr[0];
        var titleArr = titleLine.replace(/(^\s*)|(\s*$)/g, "").split(/\t|\s+/);
        var result = [];
        var len = arr.length;
        for (var i = 1; i < len; i++) {
            var row = arr[i];
            var rowArr = row.split("\t");
            var json = {};
            for (var j = 0; j < rowArr.length; j++) {
                json[titleArr[j]] = rowArr[j].replace(/(^\s*)|(\s*$)/g, "") || "";
            }
            result.push(json);
        }

        return result;
    };

    Utils.toNumber = function(data) {
        data = data || "0";
        var v = data.replace(/[^0-9.\-]/ig,"");
        v = Number(v);

        return v;
    };

    Utils.pakoZip = function(str) {
        var binaryString = null;
        if (root.isNodeJS) {
            binaryString = root.pako.deflate(str);
        }
        else {
            binaryString = root.pako.deflate(str, { to: 'string' });
        }

        return root.btoa(binaryString);
    };

    Utils.pakoUnzip = function(str) {
        if (str == null || str == "") {
            return null;
        }

        var binaryString = root.atob(str);
        var result = root.pako.inflate(binaryString, { to: 'string' });

        return result;
    };

    /***
     * 得到网店的地址网络地址
     * @param shopName
     * @param asin
     */
    Utils.getUrl = function(shopName, asin){
        shopName = shopName || '';
        var addr = shopName.split('-')[2] || "US";
        var regAddr = {
            "US": "com",
            "UK": "co.uk",
            "JP": "jp",
            "DE": "de"
        };
        return 'http://www.amazon.' + regAddr[addr] + '/dp/' + asin;
    };

    // 检查MD5是否合规 返回false或者转换小写之后的字符串
    Utils.checkMD5 = function(md5) {
        if (!md5) {
            return false;
        }

        if (typeof md5 != "string") {
            return false;
        }

        if (md5.length != 32) {
            return false;
        }

        return md5.toLowerCase();
    };

    // 判断o是否为数组
    Utils.isArray = function (o){
        return Object.prototype.toString.call(o)=='[object Array]';
    }

}(Smartdo));