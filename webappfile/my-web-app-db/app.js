// app.js

const calendarBody = document.getElementById('calendar-body');
const monthYear = document.getElementById('month-year');
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');
const profitInput = document.getElementById('profit-input');
const expenseInput = document.getElementById('expense-input');
const saveButton = document.getElementById('save-btn');
const memoInput = document.getElementById('memo-input');
const memoSaveButton = document.getElementById('memo-save-btn');
const monthlyBalanceDiv = document.getElementById('monthly-balance');
const goalInput = document.getElementById('goal-input');
const goalSaveButton = document.getElementById('goal-save-btn');
const goalChartCanvas = document.getElementById('goal-chart');
const goalDisplay = document.getElementById('goal-display');

let currentDate = new Date();
let selectedDate = null;
let goalChart = null;

let currentCategory = 'web3'; // デフォルトでweb3収益を選択

// 利益・支出の詳細を保存するための配列
let profitDetails = [];
let expenseDetails = [];

// モーダルの開閉
function openModal(modal) {
    modal.style.display = 'block';
}

function closeModal(modal) {
    modal.style.display = 'none';
}

document.getElementById('add-profit-detail-btn').addEventListener('click', () => {
    openModal(document.getElementById('profit-detail-modal'));
});

document.getElementById('add-expense-detail-btn').addEventListener('click', () => {
    openModal(document.getElementById('expense-detail-modal'));
});

document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        closeModal(closeBtn.parentElement.parentElement);
    });
});

// 既存の変数定義の後に削除ボタンの要素を取得
const deleteProfitButton = document.getElementById('delete-profit-btn');
const deleteExpenseButton = document.getElementById('delete-expense-btn');
const deleteMemoButton = document.getElementById('delete-memo-btn');

// 今日の日付を選択状態にする関数
function selectToday() {
    const today = new Date();
    const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // 今日の日付を選択
    selectedDate = todayDateString;

    // 今日の日付のセルに .selected クラスを追加
    const todayCell = document.querySelector(`[data-date="${todayDateString}"]`);
    if (todayCell) {
        todayCell.classList.add('selected');
    }

    loadDataForSelectedDate();
}

// カレンダーを描画する関数
function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const today = new Date();
    const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    calendarBody.innerHTML = ''; // カレンダーを初期化
    monthYear.textContent = `${year}年${month + 1}月`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let dateCount = 1;
    let rowCount = Math.ceil((firstDay + daysInMonth) / 7);

    // 月間データを取得してからカレンダーを描画
    loadDataForMonth(currentCategory, date, (dataForMonth) => {
        const dataMap = {};
        dataForMonth.forEach((entry) => {
            const dateObj = new Date(entry.date);
            const formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
            dataMap[formattedDate] = entry;
        });

        for (let row = 0; row < rowCount; row++) {
            let tr = document.createElement('tr');
            for (let col = 0; col < 7; col++) {
                let cell = document.createElement('td');
                if (row === 0 && col < firstDay) {
                    cell.textContent = '';
                } else if (dateCount > daysInMonth) {
                    cell.textContent = '';
                } else {
                    const cellDateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(dateCount).padStart(2, '0')}`;
                    cell.setAttribute('data-date', cellDateString);

                    // 日付番号を表示するための <div> を作成
                    const dateNumberDiv = document.createElement('div');
                    dateNumberDiv.classList.add('date-number');
                    dateNumberDiv.textContent = dateCount;
                    cell.appendChild(dateNumberDiv);

                    // 今日の日付を強調表示
                    if (cellDateString === todayDateString) {
                        cell.classList.add('today');
                    }

                    // データがある場合は収益と支出を表示
                    if (dataMap[cellDateString]) {
                        const entry = dataMap[cellDateString];

                        const profitDiv = document.createElement('div');
                        profitDiv.classList.add('profit');
                        profitDiv.textContent = `利益: ${entry.profit}`;

                        const expenseDiv = document.createElement('div');
                        expenseDiv.classList.add('expense');
                        expenseDiv.textContent = `支出: ${entry.expense}`;

                        cell.appendChild(profitDiv);
                        cell.appendChild(expenseDiv);
                    }

                    cell.addEventListener('click', () => {
                        // 既に選択されている日付から .selected クラスを削除
                        const previouslySelected = document.querySelector('.selected');
                        if (previouslySelected) {
                            previouslySelected.classList.remove('selected');
                        }
                        cell.classList.add('selected');
                        selectedDate = cellDateString;
                        loadDataForSelectedDate();
                    });

                    dateCount++;
                }
                tr.appendChild(cell);
            }
            calendarBody.appendChild(tr);
        }

        // カレンダーの描画が完了した後に月間損益を計算
        calculateMonthlyBalance(year, month);
    });
}

// 月間損益を計算する関数
function calculateMonthlyBalance(year, month) {
    if (currentCategory === 'total') {
        // 合計の場合は何もしない（既に他で処理済み）
        return;
    }
    loadDataForMonth(currentCategory, currentDate, (dataForMonth) => {
        let totalProfit = 0;
        let totalExpense = 0;

        dataForMonth.forEach((entry) => {
            totalProfit += parseFloat(entry.profit) || 0;
            totalExpense += parseFloat(entry.expense) || 0;
        });

        const balance = totalProfit - totalExpense;
        monthlyBalanceDiv.textContent = `月間損益: ${balance}`;

        if (balance >= 0) {
            monthlyBalanceDiv.style.color = 'green';
        } else {
            monthlyBalanceDiv.style.color = 'red';
        }

        updateGoalChart(balance, year, month + 1);  // 目標達成率のグラフを更新
    });
}

// 円グラフを更新する関数
function updateGoalChart(balance, year, month) {
    getGoalForCategory(currentCategory, year, month, (goal) => {
        let percentage = 0;

        if (goal !== 0) {
            percentage = Math.min(100, Math.max(0, (balance / goal) * 100));
        }

        const chartData = {
            labels: ['達成率', '未達成率'],
            datasets: [{
                data: [percentage, 100 - percentage],
                backgroundColor: percentage >= 100 ? ['green', 'lightgrey'] : ['red', 'lightgrey']
            }]
        };

        if (goalChart) {
            goalChart.destroy();
        }

        goalChart = new Chart(goalChartCanvas, {
            type: 'doughnut',
            data: chartData,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                    }
                }
            }
        });
    });
}

// 選択された日付のデータをロードする関数
function loadDataForSelectedDate() {
    if (selectedDate) {
        if (currentCategory === 'total') {
            // 「合計」カテゴリでは入力欄をクリアする
            profitInput.value = 0;
            expenseInput.value = 0;
            memoInput.value = "";
            document.getElementById('memo-date').textContent = "";
            profitDetails = [];
            expenseDetails = [];
            updateProfitDetailsList();
            updateExpenseDetailsList();
        } else {
            loadDataFromDatabase(currentCategory, selectedDate, (data) => {
                if (data) {
                    profitInput.value = data.profit || 0;
                    expenseInput.value = data.expense || 0;
                    memoInput.value = data.memo || "";
                    profitDetails = JSON.parse(data.profit_details || '[]');
                    expenseDetails = JSON.parse(data.expense_details || '[]');
                    updateProfitDetailsList();
                    updateExpenseDetailsList();
                } else {
                    profitInput.value = 0;
                    expenseInput.value = 0;
                    memoInput.value = "";
                    profitDetails = [];
                    expenseDetails = [];
                    updateProfitDetailsList();
                    updateExpenseDetailsList();
                }

                const [yearStr, monthStr, dayStr] = selectedDate.split('-');
                const dateObj = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, parseInt(dayStr, 10));

                const selectedDateText = dateObj.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
                document.getElementById('memo-date').textContent = selectedDateText;
            });
        }
    }
}

// 利益・支出の保存
saveButton.addEventListener('click', () => {
    if (selectedDate) {
        const profit = parseInt(profitInput.value, 10) || 0;
        const expense = parseInt(expenseInput.value, 10) || 0;
        const memo = memoInput.value || "";
        // 利益・支出詳細を文字列化
        const profitDetailsStr = JSON.stringify(profitDetails);
        const expenseDetailsStr = JSON.stringify(expenseDetails);
        // データベースに保存
        saveDataToDatabase(currentCategory, selectedDate, profit, expense, memo, profitDetailsStr, expenseDetailsStr, () => {
            // 保存完了後にカレンダーを再描画
            renderCalendar(currentDate);
            // 選択した日付を再度選択状態にする
            const selectedCell = document.querySelector(`[data-date="${selectedDate}"]`);
            if (selectedCell) {
                selectedCell.classList.add('selected');
            }
        });
    }
});

// メモの保存
memoSaveButton.addEventListener('click', () => {
    if (selectedDate) {
        const profit = parseInt(profitInput.value, 10) || 0;
        const expense = parseInt(expenseInput.value, 10) || 0;
        const memo = memoInput.value || "";
        // 利益・支出詳細を文字列化
        const profitDetailsStr = JSON.stringify(profitDetails);
        const expenseDetailsStr = JSON.stringify(expenseDetails);
        // データベースに保存
        saveDataToDatabase(currentCategory, selectedDate, profit, expense, memo, profitDetailsStr, expenseDetailsStr, () => {
            // 保存完了後にカレンダーを再描画
            renderCalendar(currentDate);
            // 選択した日付を再度選択状態にする
            const selectedCell = document.querySelector(`[data-date="${selectedDate}"]`);
            if (selectedCell) {
                selectedCell.classList.add('selected');
            }
        });
    }
});

// 利益の詳細を保存
document.getElementById('save-profit-detail-btn').addEventListener('click', () => {
    const amount = parseInt(document.getElementById('profit-detail-amount').value, 10) || 0;
    const description = document.getElementById('profit-detail-description').value;

    profitDetails.push({ amount, description });
    updateProfitDetailsList();
    updateTotalProfit();
    closeModal(document.getElementById('profit-detail-modal'));
    // 入力欄をクリア
    document.getElementById('profit-detail-amount').value = '';
    document.getElementById('profit-detail-description').value = '';
});

// 支出の詳細を保存
document.getElementById('save-expense-detail-btn').addEventListener('click', () => {
    const amount = parseInt(document.getElementById('expense-detail-amount').value, 10) || 0;
    const description = document.getElementById('expense-detail-description').value;

    expenseDetails.push({ amount, description });
    updateExpenseDetailsList();
    updateTotalExpense();
    closeModal(document.getElementById('expense-detail-modal'));
    // 入力欄をクリア
    document.getElementById('expense-detail-amount').value = '';
    document.getElementById('expense-detail-description').value = '';
});

// 利益の詳細を更新
function updateProfitDetailsList() {
    const list = document.getElementById('profit-details-list');
    list.innerHTML = '';
    profitDetails.forEach((detail, index) => {
        const detailDiv = document.createElement('div');
        detailDiv.textContent = `${detail.description}: ${detail.amount}`;
        // 削除ボタンを追加
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '×';
        deleteBtn.classList.add('delete-detail-btn');
        deleteBtn.addEventListener('click', () => {
            profitDetails.splice(index, 1);
            updateProfitDetailsList();
            updateTotalProfit();
        });
        detailDiv.appendChild(deleteBtn);
        list.appendChild(detailDiv);
    });
}

// 支出の詳細を更新
function updateExpenseDetailsList() {
    const list = document.getElementById('expense-details-list');
    list.innerHTML = '';
    expenseDetails.forEach((detail, index) => {
        const detailDiv = document.createElement('div');
        detailDiv.textContent = `${detail.description}: ${detail.amount}`;
        // 削除ボタンを追加
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '×';
        deleteBtn.classList.add('delete-detail-btn');
        deleteBtn.addEventListener('click', () => {
            expenseDetails.splice(index, 1);
            updateExpenseDetailsList();
            updateTotalExpense();
        });
        detailDiv.appendChild(deleteBtn);
        list.appendChild(detailDiv);
    });
}

// 利益の合計を計算
function updateTotalProfit() {
    const total = profitDetails.reduce((sum, detail) => sum + detail.amount, 0);
    profitInput.value = total;
}

// 支出の合計を計算
function updateTotalExpense() {
    const total = expenseDetails.reduce((sum, detail) => sum + detail.amount, 0);
    expenseInput.value = total;
}

// データ削除用の関数を追加
function deleteDataFromDatabase(category, date, fieldsToDelete, callback) {
    fetch('http://localhost:3000/api/deleteData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, date, fields: fieldsToDelete })
    })
    .then(response => response.json())
    .then(data => {
        console.log('データが削除されました:', data);
        if (callback) callback();
    })
    .catch(error => {
        console.error('データの削除に失敗しました:', error);
    });
}

// 削除ボタンのイベントリスナーを追加
deleteProfitButton.addEventListener('click', () => {
    if (selectedDate && currentCategory !== 'total') {
        deleteDataFromDatabase(currentCategory, selectedDate, ['profit', 'profit_details'], () => {
            profitInput.value = 0;
            profitDetails = [];
            updateProfitDetailsList();
            loadDataForSelectedDate();
            renderCalendar(currentDate);
        });
    }
});

deleteExpenseButton.addEventListener('click', () => {
    if (selectedDate && currentCategory !== 'total') {
        deleteDataFromDatabase(currentCategory, selectedDate, ['expense', 'expense_details'], () => {
            expenseInput.value = 0;
            expenseDetails = [];
            updateExpenseDetailsList();
            loadDataForSelectedDate();
            renderCalendar(currentDate);
        });
    }
});

deleteMemoButton.addEventListener('click', () => {
    if (selectedDate && currentCategory !== 'total') {
        deleteDataFromDatabase(currentCategory, selectedDate, ['memo'], () => {
            memoInput.value = "";
            loadDataForSelectedDate();
            renderCalendar(currentDate);
        });
    }
});

// カテゴリや日付が変更されたときの処理
document.getElementById('category-select').addEventListener('change', function() {
    currentCategory = this.value; // 現在のカテゴリーを更新

    if (currentCategory === 'total') {
        // 「合計」が選択されている場合、入力と保存ボタンを無効化
        profitInput.disabled = true;
        expenseInput.disabled = true;
        saveButton.disabled = true;
        goalInput.disabled = true;
        goalSaveButton.disabled = true;
        memoInput.disabled = true; // メモも無効化
        memoSaveButton.disabled = true;
    } else {
        // 他のカテゴリが選択されている場合、入力と保存を有効化
        profitInput.disabled = false;
        expenseInput.disabled = false;
        saveButton.disabled = false;
        goalInput.disabled = false;
        goalSaveButton.disabled = false;
        memoInput.disabled = false;
        memoSaveButton.disabled = false;
    }
    loadDataForSelectedDate(); // 選択された日付のデータをロード
    if (currentCategory === 'total') {
        renderCalendarWithTotal();
        calculateTotalGoalAndUpdateChart();
    } else {
        renderCalendar(currentDate);
        calculateMonthlyBalance(currentDate.getFullYear(), currentDate.getMonth());
        displayGoalAmount();
    }
});

// カレンダーのデータをデータベースに保存する関数
function saveDataToDatabase(category, date, profit, expense, memo, profitDetails, expenseDetails, callback) {
    fetch('http://localhost:3000/api/saveData', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category, date, profit, expense, memo, profitDetails, expenseDetails })
    })
    .then(response => response.json())
    .then(data => {
        console.log('データが保存されました:', data);
        if (callback) callback(); // コールバックを呼び出す
    })
    .catch(error => {
        console.error('データの保存に失敗しました:', error);
    });
}

function loadDataFromDatabase(category, date, callback) {
    fetch(`http://localhost:3000/api/getData?category=${encodeURIComponent(category)}&date=${encodeURIComponent(date)}`)
        .then(response => response.json())
        .then(data => {
            callback(data);
        })
        .catch(error => {
            console.error('データの取得に失敗しました:', error);
            callback(null);
        });
}

// 月間データを取得する関数
function loadDataForMonth(category, date, callback) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    fetch(`http://localhost:3000/api/getDataForMonth?category=${encodeURIComponent(category)}&year=${year}&month=${month}`)
        .then(response => response.json())
        .then(data => {
            callback(data);
        })
        .catch(error => {
            console.error('データの取得に失敗しました:', error);
            callback([]);
        });
}

// 目標金額を表示する関数
function displayGoalAmount() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // 月は1始まり

    if (currentCategory === 'total') {
        // 合計の目標金額を表示
        const categories = ['web3', 'blog', 'part-time', 'food', 'social', 'taxes', 'business', 'leisure'];
        let totalGoal = 0;
        let promises = categories.map(category => {
            return new Promise((resolve) => {
                getGoalForCategory(category, year, month, (goalAmount) => {
                    totalGoal += goalAmount;
                    resolve();
                });
            });
        });
        Promise.all(promises).then(() => {
            goalDisplay.textContent = `現在の合計目標金額: ${totalGoal}`;
        });
    } else {
        // 単一のカテゴリの目標金額を表示
        getGoalForCategory(currentCategory, year, month, (currentGoal) => {
            goalDisplay.textContent = `現在の目標金額: ${currentGoal}`;
        });
    }
}

// 目標金額を保存
goalSaveButton.addEventListener('click', () => {
    const goalAmount = parseInt(goalInput.value, 10) || 0;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    saveGoalToDatabase(currentCategory, year, month, goalAmount, () => {
        displayGoalAmount(); // 目標金額を更新して表示
        if (currentCategory === 'total') {
            calculateTotalGoalAndUpdateChart();
        } else {
            calculateCurrentBalanceForMonth(year, month, (balance) => {
                updateGoalChart(balance, year, month);  // グラフを再描画
            });
        }
    });
});

// 現在の月の収支（利益 - 支出）を計算する関数
function calculateCurrentBalanceForMonth(year, month, callback) {
    loadDataForMonth(currentCategory, currentDate, (dataForMonth) => {
        let totalProfit = 0;
        let totalExpense = 0;

        dataForMonth.forEach((entry) => {
            totalProfit += parseFloat(entry.profit) || 0;
            totalExpense += parseFloat(entry.expense) || 0;
        });

        const balance = totalProfit - totalExpense;
        callback(balance);
    });
}

// カテゴリと月に応じた目標金額を取得
function getGoalForCategory(category, year, month, callback) {
    fetch(`http://localhost:3000/api/getGoal?category=${encodeURIComponent(category)}&year=${year}&month=${month}`)
        .then(response => response.json())
        .then(goalAmount => {
            const parsedGoal = parseFloat(goalAmount) || 0; // 文字列を数値に変換
            callback(parsedGoal);
        })
        .catch(error => {
            console.error('目標金額の取得に失敗しました:', error);
            callback(0);
        });
}

// 目標金額の保存関数にコールバックを追加
function saveGoalToDatabase(category, year, month, goalAmount, callback) {
    fetch('http://localhost:3000/api/saveGoal', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category, year, month, goalAmount })
    })
    .then(response => response.json())
    .then(data => {
        console.log('目標金額が保存されました:', data);
        if (callback) callback(); // コールバックで目標金額表示を更新
    })
    .catch(error => {
        console.error('目標金額の保存に失敗しました:', error);
    });
}

// ページが読み込まれたら今日の日付を選択する
document.addEventListener('DOMContentLoaded', function () {
    renderCalendar(currentDate);  // カレンダーを現在の月で表示
    selectToday();  // 今日の日付を選択
    displayGoalAmount(); // 目標金額を表示
});

// 前月・翌月ボタンのイベントリスナー
prevMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    if (currentCategory === 'total') {
        renderCalendarWithTotal();
        calculateTotalGoalAndUpdateChart();
    } else {
        renderCalendar(currentDate);
        calculateMonthlyBalance(currentDate.getFullYear(), currentDate.getMonth());
    }
    displayGoalAmount(); // 月が変わったら目標金額を更新
});

nextMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    if (currentCategory === 'total') {
        renderCalendarWithTotal();
        calculateTotalGoalAndUpdateChart();
    } else {
        renderCalendar(currentDate);
        calculateMonthlyBalance(currentDate.getFullYear(), currentDate.getMonth());
    }
    displayGoalAmount(); // 月が変わったら目標金額を更新
});

// 合計カテゴリの場合のカレンダーを描画する関数
function renderCalendarWithTotal() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    calendarBody.innerHTML = ''; // カレンダーを初期化
    monthYear.textContent = `${year}年${month + 1}月`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let dateCount = 1;
    let rowCount = Math.ceil((firstDay + daysInMonth) / 7);

    // 全てのカテゴリのデータを取得してからカレンダーを描画
    const categories = ['web3', 'blog', 'part-time', 'food', 'social', 'taxes', 'business', 'leisure'];
    let promises = [];

    for (let category of categories) {
        promises.push(new Promise((resolve) => {
            loadDataForMonth(category, currentDate, (data) => {
                resolve({ category, data });
            });
        }));
    }

    Promise.all(promises).then((results) => {
        const dataMap = {};

        results.forEach(({ category, data }) => {
            data.forEach((entry) => {
                const dateObj = new Date(entry.date);
                const formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

                if (!dataMap[formattedDate]) {
                    dataMap[formattedDate] = { profit: 0, expense: 0 };
                }

                dataMap[formattedDate].profit += parseFloat(entry.profit) || 0;
                dataMap[formattedDate].expense += parseFloat(entry.expense) || 0;
            });
        });

        for (let row = 0; row < rowCount; row++) {
            let tr = document.createElement('tr');
            for (let col = 0; col < 7; col++) {
                let cell = document.createElement('td');
                if (row === 0 && col < firstDay) {
                    cell.textContent = '';
                } else if (dateCount > daysInMonth) {
                    cell.textContent = '';
                } else {
                    const cellDateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(dateCount).padStart(2, '0')}`;
                    cell.setAttribute('data-date', cellDateString);

                    // 日付番号を表示するための <div> を作成
                    const dateNumberDiv = document.createElement('div');
                    dateNumberDiv.classList.add('date-number');
                    dateNumberDiv.textContent = dateCount;
                    cell.appendChild(dateNumberDiv);

                    // 今日の日付を強調表示
                    if (cellDateString === todayDateString) {
                        cell.classList.add('today');
                    }

                    // データがある場合は収益と支出を表示
                    if (dataMap[cellDateString]) {
                        const entry = dataMap[cellDateString];

                        const profitDiv = document.createElement('div');
                        profitDiv.classList.add('profit');
                        profitDiv.textContent = `利益: ${entry.profit}`;

                        const expenseDiv = document.createElement('div');
                        expenseDiv.classList.add('expense');
                        expenseDiv.textContent = `支出: ${entry.expense}`;

                        cell.appendChild(profitDiv);
                        cell.appendChild(expenseDiv);
                    }

                    dateCount++;
                }
                tr.appendChild(cell);
            }
            calendarBody.appendChild(tr);
        }

        // 月間損益を計算
        calculateTotalMonthlyBalance(dataMap);
    });
}

// 合計カテゴリの場合の月間損益を計算する関数
function calculateTotalMonthlyBalance(dataMap) {
    let totalProfit = 0;
    let totalExpense = 0;

    for (let date in dataMap) {
        totalProfit += dataMap[date].profit;
        totalExpense += dataMap[date].expense;
    }

    const balance = totalProfit - totalExpense;
    monthlyBalanceDiv.textContent = `月間損益: ${balance}`;

    if (balance >= 0) {
        monthlyBalanceDiv.style.color = 'green';
    } else {
        monthlyBalanceDiv.style.color = 'red';
    }
}

// 合計カテゴリの場合の目標金額と達成率を計算してグラフを更新する関数
function calculateTotalGoalAndUpdateChart() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // 月は1始まり

    const categories = ['web3', 'blog', 'part-time', 'food', 'social', 'taxes', 'business', 'leisure'];
    let totalGoal = 0;
    let totalBalance = 0;
    let goalPromises = [];
    let balancePromises = [];

    // 目標金額を取得
    categories.forEach(category => {
        goalPromises.push(new Promise((resolve) => {
            getGoalForCategory(category, year, month, (goalAmount) => {
                totalGoal += goalAmount;
                resolve();
            });
        }));
    });

    // 各カテゴリの収支を取得
    categories.forEach(category => {
        balancePromises.push(new Promise((resolve) => {
            loadDataForMonth(category, currentDate, (dataForMonth) => {
                let categoryProfit = 0;
                let categoryExpense = 0;
                dataForMonth.forEach((entry) => {
                    categoryProfit += parseFloat(entry.profit) || 0;
                    categoryExpense += parseFloat(entry.expense) || 0;
                });
                totalBalance += (categoryProfit - categoryExpense);
                resolve();
            });
        }));
    });

    Promise.all(goalPromises.concat(balancePromises)).then(() => {
        let percentage = 0;

        if (totalGoal !== 0) {
            percentage = Math.min(100, Math.max(0, (totalBalance / totalGoal) * 100));
        }

        const chartData = {
            labels: ['達成率', '未達成率'],
            datasets: [{
                data: [percentage, 100 - percentage],
                backgroundColor: percentage >= 100 ? ['green', 'lightgrey'] : ['red', 'lightgrey']
            }]
        };

        if (goalChart) {
            goalChart.destroy();
        }

        goalChart = new Chart(goalChartCanvas, {
            type: 'doughnut',
            data: chartData,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                    }
                }
            }
        });

        // 合計の目標金額を表示
        goalDisplay.textContent = `現在の合計目標金額: ${totalGoal}`;
    });
}