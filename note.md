# client.on()の意味
- 書式
```js
on<Event extends keyof ClientEvents>(event: Event, listener: (...args: ClientEvents[Event]) => void) : this
```
- <>内は注意点を書いているだけ
- 第一引数のEventに指定する部分はClientEventsで定義されたもののみが使用できる。
- 第二引数のlistenerは第一引数で指定したClientEventsで指定されている引数の個数だけ(?)指定する。
- 多分voidが個の引数を受け取った後にする処理で、thisがこのonメソッドが終わった後に行う処理を記述する。client.on().on()...のようにできるらしい

# 変数(定数)
- 変数や定数は参照であるため、ある変数の値を他の変数に代入した後に値を書き換えると、元の変数の値も変化する。

# partials
- clientの作成時にpartialsを設定すると(多分)設定したデータだけとりあえず取得して発火するらしい。軽量化のために用いられるらしい。