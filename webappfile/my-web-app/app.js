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

// データの初期化
let data = JSON.parse(localStorage.getItem('calendarData')) || {
    "2024-10-01": { profit: 7000, expense: 3172, memo: "サンプルメモ" },
    "2024-10-02": { profit: 2263, expense: 0, memo: "" },
    "2024-10-09": { profit: 1255, expense: 0, memo: "" },
};

let monthlyGoals = JSON.parse(localStorage.getItem('monthlyGoals')) || {};

// カレンダーのデータをローカルストレージに保存する関数
function saveData() {
    localStorage.setItem('calendarData', JSON.stringify(data));
}

// 今日の日付を選択状態にする関数
function selectToday() {
    const today = new Date();
    const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // 今日の日付を選択
    selectedDate = todayDateString;
    profitInput.value = data[todayDateString]?.profit || 0;
    expenseInput.value = data[todayDateString]?.expense || 0;
    memoInput.value = data[todayDateString]?.memo || "";

    const selectedDateText = today.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('memo-date').textContent = selectedDateText;
}

// 月間損益を計算する関数
function calculateMonthlyBalance(year, month) {
    let totalProfit = 0;
    let totalExpense = 0;

    for (const [key, value] of Object.entries(data)) {
        const date = new Date(key);
        if (date.getFullYear() === year && date.getMonth() === month) {
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

    updateGoalChart(balance, year, month);
}

// 円グラフを更新する関数
function updateGoalChart(balance, year, month) {
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    const goal = monthlyGoals[monthKey] || 0;

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

    // 今日の日付を取得
    const today = new Date();
    const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    calendarBody.innerHTML = '';
    monthYear.textContent = `${date.toLocaleString('default', { month: 'long' })} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let row = document.createElement('tr');
    for (let i = 0; i < firstDay; i++) {
        row.appendChild(document.createElement('td'));
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('td');
        const cellDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // メモがあるか確認
        const memoExists = data[cellDate]?.memo && data[cellDate].memo.trim() !== "";

        cell.addEventListener('click', () => {
            selectedDate = cellDate;
            profitInput.value = data[cellDate]?.profit || 0;
            expenseInput.value = data[cellDate]?.expense || 0;
            memoInput.value = data[cellDate]?.memo || "";

            const selectedDateText = new Date(cellDate).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
            document.getElementById('memo-date').textContent = selectedDateText;
        });

        const dateDiv = document.createElement('div');
        dateDiv.textContent = day;
        cell.appendChild(dateDiv);

        const profitDiv = document.createElement('div');
        profitDiv.classList.add('profit');
        profitDiv.textContent = data[cellDate]?.profit ? `${data[cellDate].profit.toLocaleString()}` : "0";
        cell.appendChild(profitDiv);

        const expenseDiv = document.createElement('div');
        expenseDiv.classList.add('expense');
        expenseDiv.textContent = data[cellDate]?.expense ? `${data[cellDate].expense.toLocaleString()}` : "0";
        cell.appendChild(expenseDiv);

        // 今日の日付を強調表示し、初期選択する
        if (cellDate === todayDateString) {
            cell.classList.add('today');
        }

        // メモが存在する場合にクラスを追加して背景色を変更
        // ただし、今日の日付はオレンジ色のまま
        if (memoExists && cellDate !== todayDateString) {
            cell.classList.add('memo-exists');
        }

        row.appendChild(cell);

        if ((firstDay + day) % 7 === 0) {
            calendarBody.appendChild(row);
            row = document.createElement('tr');
        }
    }

    if (row.children.length > 0) {
        calendarBody.appendChild(row);
    }

    calculateMonthlyBalance(year, month);
}



// ページが読み込まれたら今日の日付を選択する
document.addEventListener('DOMContentLoaded', function () {
    renderCalendar(currentDate);  // カレンダーを現在の月で表示
    selectToday();  // 今日の日付を選択
});


// 目標金額の保存
goalSaveButton.addEventListener('click', () => {
    const goal = parseInt(goalInput.value, 10) || 0;
    const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    monthlyGoals[monthKey] = goal;
    localStorage.setItem('monthlyGoals', JSON.stringify(monthlyGoals));
    calculateMonthlyBalance(currentDate.getFullYear(), currentDate.getMonth());
});

// 利益・支出やメモの保存
saveButton.addEventListener('click', () => {
    if (selectedDate) {
        data[selectedDate] = {
            profit: parseInt(profitInput.value, 10) || 0,
            expense: parseInt(expenseInput.value, 10) || 0,
            memo: data[selectedDate]?.memo || ""
        };
        saveData();
        renderCalendar(currentDate);
    }
});

// メモ保存のイベントリスナーを修正
memoSaveButton.addEventListener('click', () => {
    if (selectedDate) {
        // メモをデータに保存
        data[selectedDate] = data[selectedDate] || {}; // 日付が未定義の場合、新しいオブジェクトを作成
        data[selectedDate].memo = memoInput.value;

        // ローカルストレージに保存
        saveData();

        // カレンダーを再描画
        renderCalendar(currentDate); // 現在の月を再描画

        // メモが保存された状態で選択日付が維持されるようにする
        const selectedDateText = new Date(selectedDate).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
        document.getElementById('memo-date').textContent = selectedDateText;
        profitInput.value = data[selectedDate]?.profit || 0;
        expenseInput.value = data[selectedDate]?.expense || 0;
        memoInput.value = data[selectedDate]?.memo || "";
    }
});


prevMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
});

nextMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
});

renderCalendar(currentDate);
