const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'mysql.railway.internal',  
    user: 'root',  
    password: 'ippHtauaMpaMXtxUqBAJZPGFdjWgBKBE',  
    database: 'railway'  
});

connection.connect((err) => {
    if (err) {
        console.error('データベースへの接続に失敗しました:', err);
        return;
    }
    console.log('MySQLデータベースに接続しました！');
    
    // データを取得する例
    connection.query('SELECT * FROM users', (err, results) => {
        if (err) {
            console.error('データの取得に失敗しました:', err);
            return;
        }
        console.log('取得したデータ:', results);
        connection.end();  // 接続を閉じる
    });
});
