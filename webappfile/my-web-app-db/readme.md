git add .

git commit -m "バグ修正"

git push

\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\




git remote -v

git remote set-url origin https://github.com/KAFGAMES/my-web-app.git
git remote set-url origin https://github.com/KAFGAMES/my-web-app-db.git

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

\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
ワークツリーの未コミットの変更をすべて破棄：
git restore .

Google Chromeの場合:
ブラウザのメニューを開く：画面右上の3つの縦ドットをクリックします。
「設定」を選択：メニューから「設定」をクリック。
「プライバシーとセキュリティ」を選択：左側のメニューから「プライバシーとセキュリティ」を選びます。
「閲覧履歴データの削除」をクリック：このオプションを選んでください。
「詳細設定」タブに切り替える：ここで削除するデータの範囲を選択できます。
「Cookies と他のサイトデータ」の項目を選択：これにチェックを入れて、「データを削除」をクリックすると、ローカルストレージもクリアされます。

\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

Railway.appは、Herokuに似たシンプルで柔軟なクラウドホスティングプラットフォームで、無料でMySQLなどのデータベースをセットアップするのに適しています。以下に、Railway.appのセットアップ手順を説明します。

1. Railway.appのアカウント作成
Railway.appの公式サイトにアクセスします。
「Start Deploying」または「Sign in」をクリックして、GitHubアカウントを使ってログインします。RailwayはGitHubアカウントと連携するため、GitHubのアカウントが必要です。
2. 新しいプロジェクトを作成
ログイン後、Railwayのダッシュボードにアクセスします。
「New Project」をクリックして、新しいプロジェクトを作成します。
テンプレートの選択またはGitHubリポジトリからのデプロイを行うことができますが、最も簡単なのは「Empty Project」を選択して、空のプロジェクトから始めることです。
3. MySQLデータベースの追加
プロジェクトが作成されたら、Railwayのダッシュボードで「Add New」をクリックし、データベースの選択画面に進みます。
「Provision Database」のオプションから「MySQL」を選択します。
MySQLデータベースが自動的にプロビジョニングされ、Railwayが接続情報を生成します。
4. 接続情報の取得
MySQLデータベースが追加されると、Railwayは接続情報（ホスト名、ユーザー名、パスワード、データベース名など）を表示します。
これらの接続情報をコピーして、後でVSCODEやMySQL Workbenchなどで使用します。
5. アプリケーションとの連携
RailwayはGitHubと連携しているので、簡単にデプロイが可能です。また、手動でのデプロイもサポートされています。例えば、Node.jsを使っている場合は、以下のようにMySQLデータベースと接続できます。

javascript
コードをコピーする
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'your-hostname',  // Railwayが提供するホスト名
    user: 'your-username',  // Railwayが提供するユーザー名
    password: 'your-password',  // Railwayが提供するパスワード
    database: 'your-database'  // Railwayが提供するデータベース名
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to Railway MySQL!');
});
6. デプロイと管理
GitHubリポジトリと連携している場合、Railwayが自動的にコードをデプロイします。
Railwayのダッシュボードからデータベースの管理や接続情報の変更、ログの確認が可能です。
7. Railwayの無料プラン
Railwayは無料プランを提供しており、毎月一定のリソース（クレジット）を無料で使うことができます。個人プロジェクトや少量のデータベース操作に十分です。

結論
Railway.appは非常にシンプルで、無料でMySQLデータベースをセットアップできます。GitHubとの連携で自動デプロイも可能なので、開発・運用が簡単です。
クエリの実行: 接続が成功したら、データベースに対してクエリを実行し、データを取得・挿入するコードを作成できます。

\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


CREATE TABLE financial_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    income DECIMAL(10, 2) DEFAULT 0,
    expense DECIMAL(10, 2) DEFAULT 0,
    target_amount DECIMAL(10, 2),
    memo TEXT
);
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\