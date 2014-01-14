# jquery.liquidCarousel.js


## 設定
### 基本使用方法 main.js に下記を記載する
```
$(window).load(function(){
	$('対象のclassやid').liquidCarousel();
});
```

### ゆっくりと連続して動く設定
```
$(window).load(function(){
	$('.mod-mainVisual').liquidCarousel({
	    listSelector: '.mod-mainVisual-list'
	  , itemSelector: '.mod-mainVisual-item'
	  , x_position: 'center'
	  , x_position_fix: -111
	  , loop: true
	  , animation: 'linear'
	  , speed: 20000
	  , autoPlay: true
	  , autoPlayInterval: 0
	  , autoPlayStartDelay: 1000
	});
});
```

### いち画像単位で動いて5秒止まる設定
```
$(window).load(function(){
	$('.mod-mainVisual').liquidCarousel({
	    listSelector: '.mod-mainVisual-list'
	  , itemSelector: '.mod-mainVisual-item'
	  , x_position: 'center'
	  , x_position_fix: -111
	  , loop: true
	  , animation: 'easeInOutQuad'
	  , speed: 500
	  , autoPlay: true
	  , autoPlayInterval: 5000
	  , autoPlayStartDelay: 1000
	});
});
```


### options

listSelector        | 対象内のアイテムがあるセレクタ (e.g. ul.carousel-list)                                       
------------------- | ------------------------------------------------------------------------------
itemSelector        | listSelectorの中にあるアイテムのセレクタ (e.g. li.carousel-item)                            
controlListSelector | 「○●○○○」のようなコントロールリストのセレクタ                                                     
controlItemSelector | controlListSelectorの中にあるアイテムのセレクタ                                             
x_position          | 1つ目のアイテムの位置(e.g. left, center, right, 10, 100)                                
x_position_fix      | x_position微調整用。x_positionをcenterにしx_position_fixを100 にすれば、真ん中から右に100pxずれて表示できる
animation           | アニメーションエフェクト(e.g. linear, easeInOutQuad)                                      
speed               | いちアイテムが動き終わるまでの時間(e.g. 1000, 20000)                                           
autoPlay            | trueにすると一定時間で自動でアイテムが動く。初期値はtrue。                                             
autoPlayInterval    | autoPlayで自動でアイテムが動くまでの間隔(e.g. 0,5000)                                         
autoPlayStartDelay  | ページが表示されてからautoPlayが始まるまでの時間                                                  
autoPlayHoverStop   | autoPlay中、アイテムにマウスオーバした時に動きを止めるか。trueで止める。初期値はfalse。                          
cloneClass          | loopが有効の時、左右に作られる要素のclass                                                     
currentClass        | カレントアイテムのclass                                                                
currentHighlight    | controlItemで指定された要素をカレントの時にハイライトするか。初期設定はfalse                                
currentNumber       | 最初に表示されるアイテム要素の番号。初期設定は1                                                      
loop                | trueにすると右に無限にループする。初期設定はfalse                                                 
prevSelector        | 「前へ」ボタンのセレクタ。初期設定はfalse                                                       
nextSelector        | 「次へ」ボタンのセレクタ。初期設定はfalse                                                       
