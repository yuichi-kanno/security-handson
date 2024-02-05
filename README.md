# フロントエンド開発のためのセキュリティ入門 知らなかったでは済まされない脆弱性対策の必須知識

- ハンズオンの内容のリポジトリ
- https://www.amazon.co.jp/dp/B0BQM1KMBG?tag=hatena-22&linkCode=osi&th=1&psc=1

# HTTP

一旦省略

# オリジンによるWebアプリケーション間のアクセス制限

## Same Origin Policy

異なるアプリケーション間でのアクセス制限が全くない場合、罠サイトとiframe埋め込みによって機密情報を罠サイト側のJavaScriptから取得できてしまう可能性があります。  
そのため、アプリケーション同士でのアクセスは制限する必要があります。  
取得だけでなく、DELETEメソッドを使用したリクエストが行われると、重要なデータが消されてしまう危険もあります。  
そこで必要になるのが**同一オリジンポリシー（Same Origin Policy）**です。

オリジン：「ドメイン+ポート番号」を指します。  

基本的にブラウザが備えているため、異なるオリジン間でのアクセスは制限されます。  
しかし、すべてのアクセスを禁止してしまうとアプリケーション開発に支障をきたすため、オリジンをまたいだアクセスも一定許容する必要があります。  
そこで**オリジン間リソース共有（CORS：Cross-Origin　Resource Sharing）**という仕組みがあります。

## CORS

大きく２つに分けることが出来ます。

- 単純リクエスト(Simple Request)
- プリフライトリクエスト（Prefilight Request）

### 単純リクエスト

CORS-safelisted とみなされたHTTPメソッド、HTTPヘッダのみが送信される場合のリクエスト。
リクエストヘッダに`Access-Control-Allow-Origin` を設定することでアクセスを許可できます。
シンプルリクエストに該当するHTTPメソッド、HTTPヘッダは下記を参照ください。

HTTPメソッド
- GET
- POST
- HEAD


HTTPヘッダ
- Accept
- Accept-Language
- Content-Language
- Content-Type
  - application/x-www-form-urlencoded
  - multipart/form-data
  - text/plain


### プリフライトリクエスト

簡単にいうと一度サーバー側に許可を求めてOKだったら改めてリクエストを送信する ような感じです。

- 許可を求める：OPTIONS リクエスト。下記３つの情報をHTTPヘッダに含める。
   - Access-Control-Request-Method
   - Access-Control-Request-Headers
   - Origin

下記は例 です。

プリフライトリクエスト
```
OPTIONS /resource/foo
Access-Control-Request-Method: DELETE
Access-Control-Request-Headers: origin, x-requested-with
Origin: https://foo.bar.org
```

プリフライトリクエストに対するレスポンス
```
HTTP/1.1 204 No Content
Connection: keep-alive
Access-Control-Allow-Origin: https://foo.bar.org
Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE
Access-Control-Max-Age: 86400
```

  
両者を比較し、今回はDELETEメソッドを使用したい上で許可されているため、送信されます。


参考：
https://developer.mozilla.org/ja/docs/Web/Security/Same-origin_policy  
https://developer.mozilla.org/ja/docs/Web/HTTP/CORS  
https://developer.mozilla.org/ja/docs/Glossary/Preflight_request  



# XSS（クロスサイトスクリプティング）

XSSとは、攻撃者が不正なスクリプトを攻撃対象ページのHTMLに挿入して、ユーザーに不正スクリプトを実行させる攻撃手法です。ユーザーが入力した文字列をそのままHTMLへ挿入することで発生する脆弱性です。  
XSSの脅威には機密情報の漏洩、Webアプリケーションの改ざん、なりすましなどが挙げられます。

## 攻撃手法

以下の3つがあります。

- 反射型XSS（Reflected XSS）
- 蓄積型XSS（Stored XSS）
- DOM-based XSS

### 反射型XSS（Reflected XSS）

攻撃者が用意した罠により不正なスクリプトを含むHTMLをサーバで組み立てることで発生するもの。

### 蓄積型XSS（Stored XSS）

攻撃者が投稿した不正なスクリプトを含むデータがサーバ上に保存され、その保存されたデータ内のスクリプトが利用者がページを表示する際に実行されてしまうもの。

### DOM-based XSS

JavaScriptでDOM操作をする際に不正なスクリプトが実行されて発生するもの。
今回はフロントエンドに関するセキュリティを勉強するので、こちらを主に深ぼっていく。


#### DOM-based XSSの発生例

`https://hogehoge.com/#こんにちは` の「こんにちは」という文字列をDOMへ挿入したい場合、下記のようなコードが実装されたとします。

```
const message = decodeURIComponent(location.hash.slice(1));
document.getElementById('message').innerHTML = message;
```

この場合、下記の要因反映されます。
```
<div id='message'>こんにちは</div>
```

しかし、URLが`https://hogehoge.com/#<img src= x onerror="location.href='https://hogeattack.xxx'" />` の場合、下記のようなHTMLとなります。
```
<div id='message'>
  <img src= x onerror="location.href='https://hogeattack.xxx'" />
</div>
``` 
挿入された文字列が<img>タグとしてブラウザに解釈され、on errorに指定したJavaScriptコードが実行されてしまいます。  
そのため対策が必要なのです。


### XSS の対策

対策としてはいくつか挙げられます。細かく見ると長くなるため、詳細は調べるor著書を読んでください。

- 文字列のエスケープ処理
- 属性値の文字列をクオーテーションで囲む
- リンクのURLスキームをhttp/httpsに限定する
- Cookie にHTTPOnly属性を付与する
- フレームワークの機能に則る
- Content Security Policy(CSP)を導入する



参考：  
https://zenn.dev/oreo2990/articles/d33a264b2d8b4c



# CSRF（クロスサイトリクエストフォージェリ）

CSRFは、攻撃者の用意した罠によってWebアプリケーションがもともと持っている機能がユーザーの意思に関係なく呼び出されてしまう攻撃です。  
例えば、当人になりすまして送金処理やアカウント削除などの不正なリクエストを送信することが出来てしまいます。  

## トークンを利用したCSRF対策

一番有効な対策方法です。  
Webサイト側がセッションごとにユーザーにトークンを発行し、サーバ側で保持します。そして同じトークンをHTMLに埋め込みます。リクエストの際にサーバ側で保持するトークンとリクエストで送信されてきたトークンを照合し、一致した場合のみ正しいリクエストとして受け付けます。  
セッションごとにトークンが変わるため、攻撃者は攻撃に利用できません。  
多くのフレームワークやライブラリがワンタイムトークンの発行を自動で行ってくれるため、それに頼るのもおすすめです。  


## Double Submit Cookie を使ったCSRF対策



## Same Site Cookie を使ったCSRF対策

CSRFはログイン後のセッション情報を利用して不正リクエストを送信する攻撃のため、そのCookieの送信を制限する方法です。  
Cookieの送信を同一サイト（Same Site）に制限します。  
Set-CookieヘッダにSameSite属性を設定します。ただ、全ての送信を制限するとログイン状態の保持などが出来ずユーザーにとって不便になるのため、あくまで保険的対策として捉えておくのが良さそうです。  

## Origin ヘッダ を使ったCSRF対策

HTMLを配信するサーバとAPIを提供するサーバが分かれている場合、APIサーバ側ではHTMLに埋め込んだトークンが分からないため、検証できません。  
しかし、APIサーバ内で許可していないオリジンからのリクエストを弾くことで、CSRF対策になります。  


参考：  
https://www.ipa.go.jp/security/vuln/websecurity/csrf.html