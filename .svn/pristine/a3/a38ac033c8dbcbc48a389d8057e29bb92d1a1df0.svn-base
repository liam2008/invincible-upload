
module.exports = {
    genTSVTable: function(data) {
        data = data || "";
        // linux和Windows下面的换行不同 Windows下面可能带\r 所以这里要先去掉\r 以保证最后一个字符不会有\r
        data = data.replace(/\r/g, "");
        var arr = data.split("\n");
        // 第一行为表头
        var titleLine = arr[0];
        titleLine = titleLine.replace(/ /g, "");
        var titleArr = titleLine.split("\t");
        var result = [];
        var len = arr.length;
        for (var i = 1; i < len; i++) {
            var row = arr[i];
            var rowArr = row.split("\t");
            var json = {};
            for (var j = 0; j < rowArr.length; j++) {
                rowArr[j] = rowArr[j].replace(/"/g, "'");
                json[titleArr[j]] = rowArr[j] || "";
            }
            result.push(json);
        }

        return result;
    }
};