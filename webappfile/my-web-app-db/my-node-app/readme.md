
cd my-node-app    

node app.js

これで、Node.jsでMySQLデータベースに接続し、データの取得などができるはずです。

テーブルの設計例
テーブル名: financial_records（例）

列名	データ型	説明
id	INT (AUTO_INCREMENT)	レコードの一意識別子（主キー）
user	VARCHAR(50)	ユーザー名（例: ゲスト, KAFなど）
category	VARCHAR(50)	プルダウンのカテゴリー（例: web収益、その他）
date	DATE	日付
income	DECIMAL(10, 2)	収益（0または収益金額）
expense	DECIMAL(10, 2)	支出（0または支出金額）
target_amount	DECIMAL(10, 2)	目標金額
memo	TEXT	メモやコメント

USE KAFGAMES;

mysql -u root -p

DROP TABLE IF EXISTS calendar_data;
DROP TABLE IF EXISTS monthly_goals;
DROP TABLE IF EXISTS users;
ALTER TABLE calendar_data ADD COLUMN profit_details TEXT;
ALTER TABLE calendar_data ADD COLUMN expense_details TEXT;
Get-Content -Path "my-node-app/db/create_tables.sql" | mysql -u root -p KAFGAMES

node my-node-app/server.js



http://localhost:3306/
