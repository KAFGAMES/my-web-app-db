git add .

git commit -m "バグ修正"

git push






git remote -v

git remote set-url origin https://github.com/KAFGAMES/my-web-app.git

git push origin main

git status






git rm -r --cached .
git add docs/
git add my-web-app/

git commit -m "Clear cache and add files properly"
git push


mv index.html .
git add index.html
git commit -m "Move index.html to root"
git push origin main


ワークツリーの未コミットの変更をすべて破棄：
git restore .

Google Chromeの場合:
ブラウザのメニューを開く：画面右上の3つの縦ドットをクリックします。
「設定」を選択：メニューから「設定」をクリック。
「プライバシーとセキュリティ」を選択：左側のメニューから「プライバシーとセキュリティ」を選びます。
「閲覧履歴データの削除」をクリック：このオプションを選んでください。
「詳細設定」タブに切り替える：ここで削除するデータの範囲を選択できます。
「Cookies と他のサイトデータ」の項目を選択：これにチェックを入れて、「データを削除」をクリックすると、ローカルストレージもクリアされます。

