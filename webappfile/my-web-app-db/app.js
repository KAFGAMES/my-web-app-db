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

let currentDate = new Date();
let selectedDate = null;
let goalChart = null;

let currentCategory = 'web3'; // デフォルトでweb3収益を選択

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

                    console.log('cellDateString:', cellDateString);
console.log('dataMap:', dataMap);
console.log('dataMap[cellDateString]:', dataMap[cellDateString]);

                    // データがある場合は収益と支出を表示
                    if (dataMap[cellDateString]) {
                        const entry = dataMap[cellDateString];

                        // デバッグ用のログ出力
            console.log('セルの日付:', cellDateString);
            console.log('対応するデータ:', entry);

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
    loadDataForMonth(currentCategory, currentDate, (dataForMonth) => {
        let totalProfit = 0;
        let totalExpense = 0;

        dataForMonth.forEach((entry) => {
            totalProfit += entry.profit || 0;
            totalExpense += entry.expense || 0;
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
        const percentage = goal > 0 ? Math.min(100, Math.max(0, (balance / goal) * 100)) : 0;

        const chartData = {
            labels: ['達成率', '未達成率'],
            datasets: [{
                data: [percentage, 100 - percentage],
                backgroundColor: ['green', 'lightgrey']
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
        loadDataFromDatabase(currentCategory, selectedDate, (data) => {
            if (data) {
                profitInput.value = data.profit || 0;
                expenseInput.value = data.expense || 0;
                memoInput.value = data.memo || "";
            } else {
                profitInput.value = 0;
                expenseInput.value = 0;
                memoInput.value = "";
            }

            const [yearStr, monthStr, dayStr] = selectedDate.split('-');
            const dateObj = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, parseInt(dayStr, 10));

            const selectedDateText = dateObj.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
            document.getElementById('memo-date').textContent = selectedDateText;
        });
    }
}

// 利益・支出の保存
saveButton.addEventListener('click', () => {
    if (selectedDate) {
        // 既存のメモを取得
        loadDataFromDatabase(currentCategory, selectedDate, (data) => {
            const profit = parseInt(profitInput.value, 10) || 0;
            const expense = parseInt(expenseInput.value, 10) || 0;
            const memo = data?.memo || ""; // 既存のメモを保持
            // データベースに保存
            saveDataToDatabase(currentCategory, selectedDate, profit, expense, memo, () => {
                // 保存完了後にカレンダーを再描画
                renderCalendar(currentDate);
                // 選択した日付を再度選択状態にする
                const selectedCell = document.querySelector(`[data-date="${selectedDate}"]`);
                if (selectedCell) {
                    selectedCell.classList.add('selected');
                }
            });
        });
    }
});


// メモの保存
memoSaveButton.addEventListener('click', () => {
    if (selectedDate) {
        // 既存の利益・支出を取得
        loadDataFromDatabase(currentCategory, selectedDate, (data) => {
            const profit = data?.profit || 0;
            const expense = data?.expense || 0;
            const memo = memoInput.value || "";
            // データベースに保存
            saveDataToDatabase(currentCategory, selectedDate, profit, expense, memo, () => {
                // 保存完了後にカレンダーを再描画
                renderCalendar(currentDate);
                // 選択した日付を再度選択状態にする
                const selectedCell = document.querySelector(`[data-date="${selectedDate}"]`);
                if (selectedCell) {
                    selectedCell.classList.add('selected');
                }
            });
        });
    }
});


// 目標金額を表示する関数
function displayGoalAmount() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // 月は1始まり
    getGoalForCategory(currentCategory, year, month, (currentGoal) => {
        document.getElementById('goal-display').textContent = `現在の目標金額: ${currentGoal}`;
    });
}

// 目標金額の保存
goalSaveButton.addEventListener('click', () => {
    const goalAmount = parseInt(goalInput.value, 10) || 0; // 変数名を goalAmount に修正
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // 月は1始まり
    saveGoalToDatabase(currentCategory, year, month, goalAmount);
    displayGoalAmount();  // 目標金額を更新して表示

    // 目標達成率のグラフを更新するために、現在の収支（balance）を計算
    calculateCurrentBalanceForMonth(year, month, (balance) => {
        updateGoalChart(balance, year, month);  // グラフを再描画
    });
});

// 現在の月の収支（利益 - 支出）を計算する関数
function calculateCurrentBalanceForMonth(year, month, callback) {
    loadDataForMonth(currentCategory, currentDate, (dataForMonth) => {
        let totalProfit = 0;
        let totalExpense = 0;

        dataForMonth.forEach((entry) => {
            totalProfit += entry.profit || 0;
            totalExpense += entry.expense || 0;
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
            callback(goalAmount);
        })
        .catch(error => {
            console.error('目標金額の取得に失敗しました:', error);
            callback(0);
        });
}

// カレンダーのデータをデータベースに保存する関数
function saveDataToDatabase(category, date, profit, expense, memo, callback) {
    fetch('http://localhost:3000/api/saveData', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category, date, profit, expense, memo })
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

function saveGoalToDatabase(category, year, month, goalAmount) {
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

// プルダウンメニューの選択に応じてデータを切り替える
document.getElementById('category-select').addEventListener('change', function() {
    currentCategory = this.value; // 現在のカテゴリーを更新
    loadDataForSelectedDate(); // 選択された日付のデータをロード
    renderCalendar(currentDate); // カレンダーの再描画
    displayGoalAmount();  // カテゴリに応じた目標金額を表示
});

prevMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
    displayGoalAmount(); // 月が変わったら目標金額を更新
});

nextMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
    displayGoalAmount(); // 月が変わったら目標金額を更新
});

//renderCalendar(currentDate);
