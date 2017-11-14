var fs = require("fs");
var moment = require('moment');
var multiparty = require('multiparty');

module.exports = {
	name: "files",

	fileManager: function(req, res) {
		var list = [];
		if(!fs.existsSync('public/mp4')) fs.mkdirSync('public/mp4');
		if(!fs.existsSync('public/pdf')) fs.mkdirSync('public/pdf');
		var mp4 = fs.readdirSync('public/mp4');
		var pdf = fs.readdirSync('public/pdf');
		for(var i = 0; i < mp4.length; i++) {
			var item = mp4[i].split('@');
			list.push({
				time: moment(parseInt(item[0])).format('YYYY-MM-DD HH:mm:ss'),
				name: item[1].substr(0, item[1].lastIndexOf('.')),
				type: item[1].substr(item[1].lastIndexOf('.') + 1),
				href: '/mp4/' + mp4[i]
			})
		};
		for(var i = 0; i < pdf.length; i++) {
			var item = pdf[i].split('@');
			list.push({
				time: moment(parseInt(item[0])).format('YYYY-MM-DD HH:mm:ss'),
				name: item[1].substr(0, item[1].lastIndexOf('.')),
				type: item[1].substr(item[1].lastIndexOf('.') + 1),
				href: '/pdf/' + pdf[i]
			})
		};
		res.json(list)
	},

	fileManagerUpload: function(req, res) {
		var form = new multiparty.Form({
			uploadDir: 'public/'
		});
		form.parse(req, function(err, fields, files) {
			var time = Date.now();
			var f = files['file'][0];
			var name = f['originalFilename'].substr(0, f['originalFilename'].lastIndexOf('.'));
			var type = f['originalFilename'].substr(f['originalFilename'].lastIndexOf('.') + 1);
			var href = '/' + type + '/' + time + '@' + name + '.' + type;
			if(!fs.existsSync('public' + type)) fs.mkdirSync('public' + type);
			fs.rename(f['path'], 'public' + href, function(err) {
				if(!err) {
					res.json({
						time: moment(time).format('YYYY-MM-DD HH:mm:ss'),
						name: name,
						type: type,
						href: href
					})
				}
			})
		})
	},

	fileManagerUpdate: function(req, res) {
		var type = req.body.type;
		var oldname = req.body.name;
		var oldpath = 'public' + req.body.href;
		var path = oldpath.replace(oldname, req.body.newname);
		fs.rename(oldpath, path, function(err) {
			if(!err) {
				res.json({
					time: req.body.time,
					name: req.body.newname,
					type: req.body.type,
					href: req.body.href.substr(0, req.body.href.indexOf('@') + 1) + req.body.newname + '.' + type
				})
			}
		})
	},

	fileManagerRemove: function(req, res) {
		var fileName = 'public' + req.body.href;
		var exists = fs.existsSync(fileName);
		if(exists) fs.unlinkSync(fileName);
		res.json(exists)
	}
}