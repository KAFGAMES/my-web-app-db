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

// データの初期化
let data = JSON.parse(localStorage.getItem('calendarData')) || {};

let monthlyGoals = JSON.parse(localStorage.getItem('monthlyGoals')) || {};

// カレンダーのデータをローカルストレージに保存する関数
function saveData() {
    localStorage.setItem('calendarData', JSON.stringify(data));
}

// 各カテゴリごとの目標金額を保存
function saveGoalForCategory(category, year, month, goalAmount) {
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    if (!monthlyGoals[category]) {
        monthlyGoals[category] = {};  // カテゴリごとのオブジェクトを初期化
    }
    monthlyGoals[category][monthKey] = goalAmount;
    localStorage.setItem('monthlyGoals', JSON.stringify(monthlyGoals));
}

// カテゴリと月に応じた目標金額を取得
function getGoalForCategory(category, year, month) {
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    return (monthlyGoals[category] && monthlyGoals[category][monthKey]) || 0;
}

// 目標金額を表示する関数
function displayGoalAmount() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const currentGoal = getGoalForCategory(currentCategory, year, month);
    document.getElementById('goal-display').textContent = `現在の目標金額: ${currentGoal}`;
}

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

// 月間損益を計算する関数
function calculateMonthlyBalance(year, month) {
    let totalProfit = 0;
    let totalExpense = 0;

    // 現在のカテゴリーに基づいて計算
    const dataForCurrentCategory = data[currentCategory] || {};

    for (const [key, value] of Object.entries(dataForCurrentCategory)) {
        const [dateYearStr, dateMonthStr, dateDayStr] = key.split('-');
        const dateYear = parseInt(dateYearStr, 10);
        const dateMonth = parseInt(dateMonthStr, 10) - 1; // 月は0始まり

        if (dateYear === year && dateMonth === month) {
            totalProfit += value.profit || 0;
            totalExpense += value.expense || 0;
        }
    }

    const balance = totalProfit - totalExpense;
    monthlyBalanceDiv.textContent = `月間損益: ${balance}`;

    if (balance >= 0) {
        monthlyBalanceDiv.style.color = 'green';
    } else {
        monthlyBalanceDiv.style.color = 'red';
    }

    updateGoalChart(balance, year, month);  // 目標達成率のグラフを更新
}

// 円グラフを更新する関数
function updateGoalChart(balance, year, month) {
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    const goal = getGoalForCategory(currentCategory, year, month);

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
}

// カレンダーを描画する関数
function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const today = new Date();
    const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    calendarBody.innerHTML = '';
    monthYear.textContent = `${date.toLocaleString('default', { month: 'long' })} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let dateCount = 1;
    let rowCount = Math.ceil((firstDay + daysInMonth) / 7);

    for (let row = 0; row < rowCount; row++) {
        let tr = document.createElement('tr');
        for (let col = 0; col < 7; col++) {
            let cell = document.createElement('td');
            if (row === 0 && col < firstDay) {
                // 空白セル
            } else if (dateCount > daysInMonth) {
                // 空白セル
            } else {
                const cellDateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(dateCount).padStart(2, '0')}`;
                cell.setAttribute('data-date', cellDateString);

                // 現在のカテゴリーに基づいたデータを使用
                const dataForCurrentCategory = data[currentCategory] || {};
                const dayData = dataForCurrentCategory[cellDateString] || { profit: 0, expense: 0, memo: "" };

                cell.addEventListener('click', () => {
                    // 既に選択されている日付から .selected クラスを削除
    const previouslySelected = document.querySelector('.selected');
    if (previouslySelected) {
        previouslySelected.classList.remove('selected');
    }

    // 現在選択された日付に .selected クラスを追加
    cell.classList.add('selected');

    // 選択された日付を更新
                    selectedDate = cellDateString;
                    loadDataForSelectedDate();
                });

                const dateDiv = document.createElement('div');
                dateDiv.textContent = dateCount;

// メモがある場合は日付の横に●を追加
if (dayData.memo && dayData.memo.trim() !== "") {
    const memoDot = document.createElement('span');
    memoDot.textContent = "●"; // ●を追加
    memoDot.classList.add('memo-dot');  // memo-dotクラスを追加
    dateDiv.appendChild(memoDot);
}

                cell.appendChild(dateDiv);

                const profitDiv = document.createElement('div');
                profitDiv.classList.add('profit');
                profitDiv.textContent = `${dayData.profit.toLocaleString()}`;
                cell.appendChild(profitDiv);

                const expenseDiv = document.createElement('div');
                expenseDiv.classList.add('expense');
                expenseDiv.textContent = `${dayData.expense.toLocaleString()}`;
                cell.appendChild(expenseDiv);

                // 今日の日付を強調表示
                if (cellDateString === todayDateString) {
                    cell.classList.add('today');
                }

                dateCount++;
            }
            tr.appendChild(cell);
        }
        calendarBody.appendChild(tr);
    }

    calculateMonthlyBalance(year, month);  // 月間損益の計算
}

// 選択された日付のデータをロードする関数
function loadDataForSelectedDate() {
    const dateToLoad = selectedDate || new Date().toISOString().split('T')[0];
    const categoryData = data[currentCategory]?.[dateToLoad] || { profit: 0, expense: 0, memo: "" };

    profitInput.value = categoryData.profit || 0;
    expenseInput.value = categoryData.expense || 0;
    memoInput.value = categoryData.memo || "";

    // 日付文字列を手動でパースしてDateオブジェクトを作成
    const [yearStr, monthStr, dayStr] = dateToLoad.split('-');
    const dateObj = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, parseInt(dayStr, 10));

    const selectedDateText = dateObj.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('memo-date').textContent = selectedDateText;
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

// 目標金額の保存
goalSaveButton.addEventListener('click', () => {
    const goal = parseInt(goalInput.value, 10) || 0;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    saveGoalForCategory(currentCategory, year, month, goal);  // カテゴリごとに目標を保存
    displayGoalAmount();  // 目標金額を更新して表示

    // 目標達成率のグラフを更新するために、現在の収支（balance）を計算
    const balance = calculateCurrentBalanceForMonth(year, month);
    updateGoalChart(balance, year, month);  // グラフを再描画
});

// 現在の月の収支（利益 - 支出）を計算する関数を追加
function calculateCurrentBalanceForMonth(year, month) {
    let totalProfit = 0;
    let totalExpense = 0;

    // 現在のカテゴリーに基づいて計算
    const dataForCurrentCategory = data[currentCategory] || {};

    for (const [key, value] of Object.entries(dataForCurrentCategory)) {
        const [dateYearStr, dateMonthStr] = key.split('-');
        const dateYear = parseInt(dateYearStr, 10);
        const dateMonth = parseInt(dateMonthStr, 10) - 1; // 月は0始まり

        if (dateYear === year && dateMonth === month) {
            totalProfit += value.profit || 0;
            totalExpense += value.expense || 0;
        }
    }

    return totalProfit - totalExpense;  // 収支（利益 - 支出）を返す
}

// 利益・支出の保存
saveButton.addEventListener('click', () => {
    if (selectedDate) {
        data[currentCategory] = data[currentCategory] || {};
        data[currentCategory][selectedDate] = data[currentCategory][selectedDate] || {};

        data[currentCategory][selectedDate].profit = parseInt(profitInput.value, 10) || 0;
        data[currentCategory][selectedDate].expense = parseInt(expenseInput.value, 10) || 0;
        // メモは上書きしない

        saveData();
        renderCalendar(currentDate); // カレンダーの再描画
    }
});

// メモの保存
memoSaveButton.addEventListener('click', () => {
    if (selectedDate) {
        data[currentCategory] = data[currentCategory] || {};
        data[currentCategory][selectedDate] = data[currentCategory][selectedDate] || {};

        // 既存の利益と支出データを保持したままメモを更新
        const currentProfit = data[currentCategory][selectedDate].profit || 0;
        const currentExpense = data[currentCategory][selectedDate].expense || 0;
        const currentMemo = memoInput.value;

        data[currentCategory][selectedDate] = {
            profit: currentProfit,
            expense: currentExpense,
            memo: currentMemo // メモだけを更新
        };

        saveData(); // ローカルストレージに保存
        loadDataForSelectedDate(); // 選択された日付のデータを再読み込み
        renderCalendar(currentDate); // カレンダーを再描画して更新
    }
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

renderCalendar(currentDate);
