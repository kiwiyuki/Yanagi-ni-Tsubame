Coding Rule
===

##タブ
タブを使用(スペースだめです)  
4スペース

##セミコロン
文末にはセミコロンを使用する

##クォート
ダブルクォートを使用

OK :  

```javascript
var foo = "hoge";
```

NG :  

```javascript
var foo = 'hoge';
```

##中括弧
中括弧は文と同じ行に書く

OK :  

```javaScript
	if(true) {
    	...
	}
```

NG :  

```javascript
	if(true)
	{
    	...
	}
```

##変数宣言
変数宣言は1文に1つ  

OK :  

```javascript
	var x = 0;
	var y = 1;
	var z = 2;
```

NG :  

```javascript
	var x = 0,
		y = 1,
		z = 2;
```

##命名規則
###変数、プロパティ
lowerCamelCase、一文字変数の使用禁止、一般的な略語でない語の使用禁止

OK :  

```javascript
	var playerData = db.query("SELECT * FROM users ...");
```

NG :  

```javascript
	var player_data = d.query("SELECT * FROM users ...");
```

###クラス
UpperCamelCase

OK :  

```javascript
	function EnemyCreate() {
		...
	}
```

NG :  

```javascript
	function enemy_Create() {
		...
	} 
```