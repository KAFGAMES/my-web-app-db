const calendarBody = document.getElementById('calendar-body');
const monthYear = document.getElementById('month-year');
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');
const profitInput = document.getElementById('profit-input');
const expenseInput = document.getElementById('expense-input');
const saveButton = document.getElementById('save-btn');
const memoInput = document.getElementById('memo-input');
const memoSaveButton = document.getElementById('memo-save-btn');

let currentDate = new Date();
let selectedDate = null;

// サンプルデータ（利益と支出、メモを保持）
const data = {
    "2024-10-01": { profit: 7000, expense: 3172, memo: "サンプルメモ" },
    "2024-10-02": { profit: 2263, expense: 0, memo: "" },
    "2024-10-09": { profit: 1255, expense: 0, memo: "" },
    // 他の日付もここに追加可能
};

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
}

// 保存ボタンのイベントリスナー
saveButton.addEventListener('click', () => {
    if (selectedDate) {
        data[selectedDate] = {
            profit: parseInt(profitInput.value, 10) || 0,
            expense: parseInt(expenseInput.value, 10) || 0,
            memo: data[selectedDate]?.memo || ""
        };
        renderCalendar(currentDate);
    }
});

// メモ保存ボタンのイベントリスナー
memoSaveButton.addEventListener('click', () => {
    if (selectedDate) {
        data[selectedDate].memo = memoInput.value;
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
