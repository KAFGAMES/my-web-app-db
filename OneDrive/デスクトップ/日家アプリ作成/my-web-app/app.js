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

let currentDate = new Date();
let selectedDate = null;

// データの初期化
let data = JSON.parse(localStorage.getItem('calendarData')) || {
    "2024-10-01": { profit: 7000, expense: 3172, memo: "サンプルメモ" },
    "2024-10-02": { profit: 2263, expense: 0, memo: "" },
    "2024-10-09": { profit: 1255, expense: 0, memo: "" },
    // 他の日付もここに追加可能
};

// カレンダーのデータをローカルストレージに保存する関数
function saveData() {
    localStorage.setItem('calendarData', JSON.stringify(data));
}

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

    // 損益の色を変更
    if (balance >= 0) {
        monthlyBalanceDiv.style.color = 'green';
    } else {
        monthlyBalanceDiv.style.color = 'red';
    }
}

function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();

    calendarBody.innerHTML = '';

    // 月と年を更新
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

        cell.addEventListener('click', () => {
            selectedDate = cellDate;
            profitInput.value = data[cellDate]?.profit || 0;
            expenseInput.value = data[cellDate]?.expense || 0;
            memoInput.value = data[cellDate]?.memo || "";
        });

        const dateDiv = document.createElement('div');
        dateDiv.textContent = day;
        cell.appendChild(dateDiv);

        const profitDiv = document.createElement('div');
        profitDiv.classList.add('profit');
        profitDiv.textContent = data[cellDate]?.profit ? `利益: ${data[cellDate].profit}` : "利益: 0";
        cell.appendChild(profitDiv);

        const expenseDiv = document.createElement('div');
        expenseDiv.classList.add('expense');
        expenseDiv.textContent = data[cellDate]?.expense ? `支出: ${data[cellDate].expense}` : "支出: 0";
        cell.appendChild(expenseDiv);

        // メモがある場合、「●」を表示
        if (data[cellDate]?.memo && data[cellDate].memo.trim() !== "") {
            const memoIndicator = document.createElement('span');
            memoIndicator.textContent = " ●";
            memoIndicator.style.color = "blue";
            dateDiv.appendChild(memoIndicator);
        }

        const today = new Date();
        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            cell.classList.add('today');
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

    // 月間損益を計算して表示
    calculateMonthlyBalance(year, month);
}

// 保存ボタンのイベントリスナー
saveButton.addEventListener('click', () => {
    if (selectedDate) {
        data[selectedDate] = {
            profit: parseInt(profitInput.value, 10) || 0,
            expense: parseInt(expenseInput.value, 10) || 0,
            memo: data[selectedDate]?.memo || ""
        };
        saveData(); // データをローカルストレージに保存
        renderCalendar(currentDate);
    }
});

// メモ保存ボタンのイベントリスナー
memoSaveButton.addEventListener('click', () => {
    if (selectedDate) {
        data[selectedDate].memo = memoInput.value;
        saveData(); // データをローカルストレージに保存
        renderCalendar(currentDate); // カレンダーを再描画して「●」を反映
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
