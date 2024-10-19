// server.js

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors()); // 全てのオリジンからのリクエストを許可

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
    const { category, date, profit, expense, memo, profitDetails, expenseDetails } = req.body;
    const query = 'INSERT INTO calendar_data (date, category, profit, expense, memo, profit_details, expense_details) VALUES (?, ?, ?, ?, ?, ?, ?) ' +
                  'ON DUPLICATE KEY UPDATE profit = VALUES(profit), expense = VALUES(expense), memo = VALUES(memo), profit_details = VALUES(profit_details), expense_details = VALUES(expense_details)';
    connection.query(query, [date, category, profit, expense, memo, profitDetails, expenseDetails], (err, results) => {
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

// データの一部を削除するAPIを追加
app.post('/api/deleteData', (req, res) => {
    const { category, date, fields } = req.body;

    if (!fields || fields.length === 0) {
        res.status(400).json({ error: '削除するフィールドが指定されていません' });
        return;
    }

    let setClause = fields.map(field => `${field} = NULL`).join(', ');

    const query = `UPDATE calendar_data SET ${setClause} WHERE category = ? AND date = ?`;

    connection.query(query, [category, date], (err, results) => {
        if (err) {
            console.error('データの削除に失敗しました:', err);
            res.status(500).json({ error: 'データの削除に失敗しました' });
            return;
        }
        res.json({ message: 'データが削除されました' });
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

app.listen(3000, () => {
    console.log('サーバーがポート3000で起動しました');
});
