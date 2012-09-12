/*!
 * loader.js - JavaScriptファイル読み込み
 *
 * Copyright (c) 2010 Skill Partners Inc. All Rights Reserved.
 *
 * JavaScriptファイルを読み込むためのスクリプト。
 * loaderName に設定したファイル（通常はローダー自身）と同階層以下のファイル群を読み込む。
 * loadFiles にカンマ区切りで読み込みたいファイル名を記入する。
 * 記載順に script要素を document.write()するだけ。
 *
 * @version: 1.2
 * @author : http://www.makinokobo.com - kobo@makinokobo.com
 */

(function(window, undefined){

var config = {

//## Config
//==========================================================================
	loaderName: 'loader.js',
	loadFiles: [
		'jquery.js',
		'jquery.effects.core.js',
		'../../jquery.liquid.carousel.js',
		'../../main.js'
	]
//==========================================================================

};

var scripts = document.getElementsByTagName('script');
for(var i=0, n=scripts.length; i<n; i++){
	if(scripts[i].src.match(config.loaderName)){
		var scriptSrc = scripts[i].src;
		var scriptDir = scriptSrc.substring(0,scriptSrc.lastIndexOf('/'+config.loaderName)+1);
		
		var loadScript = '';
		for(var ii=0,nn=config.loadFiles.length; ii<nn; ii++){
			loadScript += '<script src="'+scriptDir+config.loadFiles[ii]+'"></script>'+"\n";
		}
		document.write(loadScript);
	}
};

})(window);



/*
 * Release Notes:
 *
 * 2011-08-06 - oosugi@skillpartners.co.jp
 *              コメント整理
 */
