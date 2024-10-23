const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors()); // 全てのオリジンからのリクエストを許可

const connection = mysql.createConnection({
    host: 'localhost',  
    user: 'root',  
    password: '0515masa',  // パスワードはご自身の設定に合わせてください
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

    let setClause = fields.map(field => {
        if (field === 'profit' || field === 'expense') {
            return `${field} = 0`;
        } else {
            return `${field} = NULL`;
        }
    }).join(', ');
    

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

// カテゴリメモを保存するAPI
app.post('/api/saveCategoryMemo', (req, res) => {
    const { category, memo } = req.body;
    const query = 'INSERT INTO category_memos (category, memo) VALUES (?, ?) ON DUPLICATE KEY UPDATE memo = VALUES(memo)';
    connection.query(query, [category, memo], (err, results) => {
        if (err) {
            console.error('カテゴリメモの保存に失敗しました:', err);
            res.status(500).json({ error: 'カテゴリメモの保存に失敗しました' });
            return;
        }
        res.json({ message: 'カテゴリメモが保存されました' });
    });
});

// カテゴリメモを取得するAPI
app.get('/api/getCategoryMemo', (req, res) => {
    const { category } = req.query;
    const query = 'SELECT memo FROM category_memos WHERE category = ?';
    connection.query(query, [category], (err, results) => {
        if (err) {
            console.error('カテゴリメモの取得に失敗しました:', err);
            res.status(500).json({ error: 'カテゴリメモの取得に失敗しました' });
            return;
        }
        res.json({ memo: results[0]?.memo || '' });
    });
});


// カテゴリテーブルの作成（初回のみ実行）
connection.query(`
    CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        position INT NOT NULL
    )
`, (err) => {
    if (err) {
        console.error('カテゴリテーブルの作成に失敗しました:', err);
    } else {
        console.log('カテゴリテーブルが存在します');
    }
});

// カテゴリを取得するAPI
app.get('/api/getCategories', (req, res) => {
    const query = 'SELECT * FROM categories ORDER BY position';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('カテゴリの取得に失敗しました:', err);
            res.status(500).json({ error: 'カテゴリの取得に失敗しました' });
            return;
        }
        res.json(results);
    });
});

// カテゴリ名を更新するAPI
app.post('/api/updateCategoryName', (req, res) => {
    const { id, name } = req.body;

    // 古いカテゴリ名を取得
    const getCategoryQuery = 'SELECT name FROM categories WHERE id = ?';
    connection.query(getCategoryQuery, [id], (err, results) => {
        if (err) {
            console.error('カテゴリ名の取得に失敗しました:', err);
            res.status(500).json({ error: 'カテゴリ名の取得に失敗しました' });
            return;
        }

        const oldName = results[0].name;

        // カテゴリ名を更新
        const updateCategoryQuery = 'UPDATE categories SET name = ? WHERE id = ?';
        connection.query(updateCategoryQuery, [name, id], (err) => {
            if (err) {
                console.error('カテゴリ名の更新に失敗しました:', err);
                res.status(500).json({ error: 'カテゴリ名の更新に失敗しました' });
                return;
            }

            // 関連するデータのカテゴリ名を更新
            const updateDataQuery = 'UPDATE calendar_data SET category = ? WHERE category = ?';
            connection.query(updateDataQuery, [name, oldName], (err) => {
                if (err) {
                    console.error('関連データのカテゴリ名の更新に失敗しました:', err);
                    res.status(500).json({ error: '関連データのカテゴリ名の更新に失敗しました' });
                    return;
                }

                res.json({ message: 'カテゴリ名と関連データが更新されました' });
            });
        });
    });
});

// カテゴリの順番を更新するAPI
app.post('/api/updateCategoryOrder', (req, res) => {
    const categories = req.body.categories; // [{id: 1, position: 1}, ...]
    const queries = categories.map(cat => {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE categories SET position = ? WHERE id = ?';
            connection.query(query, [cat.position, cat.id], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    });

    Promise.all(queries)
        .then(() => {
            res.json({ message: 'カテゴリの順番が更新されました' });
        })
        .catch(err => {
            console.error('カテゴリの順番の更新に失敗しました:', err);
            res.status(500).json({ error: 'カテゴリの順番の更新に失敗しました' });
        });
});

// 新しいカテゴリを追加するAPI
app.post('/api/addCategory', (req, res) => {
    const { name } = req.body;
    // 新しいカテゴリのpositionを最大値+1に設定
    const getMaxPositionQuery = 'SELECT MAX(position) as maxPosition FROM categories';
    connection.query(getMaxPositionQuery, (err, results) => {
        if (err) {
            console.error('最大位置の取得に失敗しました:', err);
            res.status(500).json({ error: 'カテゴリの追加に失敗しました' });
            return;
        }
        const maxPosition = results[0].maxPosition || 0;
        const newPosition = maxPosition + 1;

        const insertQuery = 'INSERT INTO categories (name, position) VALUES (?, ?)';
        connection.query(insertQuery, [name, newPosition], (err) => {
            if (err) {
                console.error('カテゴリの追加に失敗しました:', err);
                res.status(500).json({ error: 'カテゴリの追加に失敗しました' });
                return;
            }
            res.json({ message: '新しいカテゴリが追加されました' });
        });
    });
});

// カテゴリを削除するAPI
app.post('/api/deleteCategory', (req, res) => {
    const { id } = req.body;
    const query = 'DELETE FROM categories WHERE id = ?';
    connection.query(query, [id], (err) => {
        if (err) {
            console.error('カテゴリの削除に失敗しました:', err);
            res.status(500).json({ error: 'カテゴリの削除に失敗しました' });
            return;
        }
        res.json({ message: 'カテゴリが削除されました' });
    });
});



app.listen(3000, () => {
    console.log('サーバーがポート3000で起動しました');
});
