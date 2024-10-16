// server.js（サーバーサイド）


const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors()); // 全てのオリジンからのリクエストを許可

//const mysql = require('mysql2');

/*
const connection = mysql.createConnection({
    host: 'mysql.railway.internal',  
    user: 'root',  
    password: 'ippHtauaMpaMXtxUqBAJZPGFdjWgBKBE',  
    database: 'railway',  
    port: '3306'
});
*/

const connection = mysql.createConnection({
    host: 'localhost',  
    user: 'root',  
    password: '0515masa',  
    database: 'KAFGAMES',  
    port: '3306'
});

connection.connect((err) => {
    if (err) {
        console.error('データベースへの接続に失敗しました:', err);
        return;
    }
    console.log('MySQLデータベースに接続しました！');
});

// データを保存するAPI
app.post('/api/saveData', (req, res) => {
    const { category, date, profit, expense, memo } = req.body;
    const query = 'INSERT INTO calendar_data (date, category, profit, expense, memo) VALUES (?, ?, ?, ?, ?) ' +
                  'ON DUPLICATE KEY UPDATE profit = VALUES(profit), expense = VALUES(expense), memo = VALUES(memo)';
    connection.query(query, [date, category, profit, expense, memo], (err, results) => {
        if (err) {
            console.error('データの保存に失敗しました:', err);
            res.status(500).json({ error: 'データの保存に失敗しました' });
            return;
        }
        res.json({ message: 'データが保存されました' });
    });
});

// データを取得するAPI
app.get('/api/getData', (req, res) => {
    const { category, date } = req.query;
    const query = 'SELECT * FROM calendar_data WHERE category = ? AND date = ?';
    connection.query(query, [category, date], (err, results) => {
        if (err) {
            console.error('データの取得に失敗しました:', err);
            res.status(500).json({ error: 'データの取得に失敗しました' });
            return;
        }
        res.json(results[0] || null);
    });
});



// 月間データを取得するAPI
app.get('/api/getDataForMonth', (req, res) => {
    const { category, year, month } = req.query;
    const query = 'SELECT * FROM calendar_data WHERE category = ? AND YEAR(date) = ? AND MONTH(date) = ?';
    connection.query(query, [category, year, month], (err, results) => {
        if (err) {
            console.error('データの取得に失敗しました:', err);
            res.status(500).json({ error: 'データの取得に失敗しました' });
            return;
        }
        res.json(results);
    });
});

// 目標金額を保存するAPI
app.post('/api/saveGoal', (req, res) => {
    const { category, year, month, goalAmount } = req.body;
    const query = 'INSERT INTO monthly_goals (category, year, month, goal_amount) VALUES (?, ?, ?, ?) ' +
                  'ON DUPLICATE KEY UPDATE goal_amount = VALUES(goal_amount)';
    connection.query(query, [category, year, month, goalAmount], (err, results) => {
        if (err) {
            console.error('目標金額の保存に失敗しました:', err);
            res.status(500).json({ error: '目標金額の保存に失敗しました' });
            return;
        }
        res.json({ message: '目標金額が保存されました' });
    });
});

// 目標金額を取得するAPI
app.get('/api/getGoal', (req, res) => {
    const { category, year, month } = req.query;
    const query = 'SELECT goal_amount FROM monthly_goals WHERE category = ? AND year = ? AND month = ?';
    connection.query(query, [category, year, month], (err, results) => {
        if (err) {
            console.error('目標金額の取得に失敗しました:', err);
            res.status(500).json({ error: '目標金額の取得に失敗しました' });
            return;
        }
        res.json(results[0]?.goal_amount || 0);
    });
});

app.listen(3000, () => {
    console.log('サーバーがポート3000で起動しました');
});



/*
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


function saveDataToDatabase(category, date, profit, expense, memo) {
    const query = 'INSERT INTO calendar_data (date, category, profit, expense, memo) VALUES (?, ?, ?, ?, ?) ' +
                  'ON DUPLICATE KEY UPDATE profit = VALUES(profit), expense = VALUES(expense), memo = VALUES(memo)';
    connection.query(query, [date, category, profit, expense, memo], (err, results) => {
        if (err) {
            console.error('データの保存に失敗しました:', err);
            return;
        }
        console.log('データが保存されました:', results);
    });
}

function saveGoalToDatabase(category, year, month, goalAmount) {
    const query = 'INSERT INTO monthly_goals (category, year, month, goal_amount) VALUES (?, ?, ?, ?) ' +
                  'ON DUPLICATE KEY UPDATE goal_amount = VALUES(goal_amount)';
    connection.query(query, [category, year, month, goalAmount], (err, results) => {
        if (err) {
            console.error('目標金額の保存に失敗しました:', err);
            return;
        }
        console.log('目標金額が保存されました:', results);
    });
}

function loadDataFromDatabase(category, date, callback) {
    const query = 'SELECT * FROM calendar_data WHERE category = ? AND date = ?';
    connection.query(query, [category, date], (err, results) => {
        if (err) {
            console.error('データの取得に失敗しました:', err);
            return;
        }
        if (results.length > 0) {
            callback(results[0]);
        } else {
            callback(null);
        }
    });
}

function getGoalFromDatabase(category, year, month, callback) {
    const query = 'SELECT goal_amount FROM monthly_goals WHERE category = ? AND year = ? AND month = ?';
    connection.query(query, [category, year, month], (err, results) => {
        if (err) {
            console.error('目標金額の取得に失敗しました:', err);
            return;
        }
        if (results.length > 0) {
            callback(results[0].goal_amount);
        } else {
            callback(0);
        }
    });
}

// 月ごとのデータをロードする関数
function loadDataForMonth(category, date, callback) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    const query = 'SELECT * FROM calendar_data WHERE category = ? AND YEAR(date) = ? AND MONTH(date) = ?';
    connection.query(query, [category, year, month], (err, results) => {
        if (err) {
            console.error('データの取得に失敗しました:', err);
            callback([]);
            return;
        }
        callback(results);
    });
}
*/