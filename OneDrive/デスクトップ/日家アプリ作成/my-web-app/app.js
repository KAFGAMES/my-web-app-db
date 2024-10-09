const calendarBody = document.getElementById('calendar-body');
const monthYear = document.getElementById('month-year');
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');

let currentDate = new Date();

// サンプルデータ（利益と支出の値を保持）
const sampleData = {
    "2024-10-01": { profit: 7000, expense: 3172 },
    "2024-10-02": { profit: 2263, expense: 0 },
    "2024-10-09": { profit: 1255, expense: 0 },
    // 他の日付もここに追加可能
};

function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();

    // カレンダーをクリア
    calendarBody.innerHTML = '';

    // 月と年を更新
    monthYear.textContent = `${date.toLocaleString('default', { month: 'long' })} ${year}`;

    // 月の初日と最終日の情報
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // カレンダーの行を作成
    let row = document.createElement('tr');
    for (let i = 0; i < firstDay; i++) {
        row.appendChild(document.createElement('td'));
    }

    // 日付を埋める
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('td');
        const cellDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // 日付を表示
        const dateDiv = document.createElement('div');
        dateDiv.textContent = day;
        cell.appendChild(dateDiv);

        // 利益と支出の表示スペースを作成
        const profitDiv = document.createElement('div');
        profitDiv.classList.add('profit');
        profitDiv.textContent = sampleData[cellDate]?.profit ? `利益: ${sampleData[cellDate].profit}` : "利益: 0";
        cell.appendChild(profitDiv);

        const expenseDiv = document.createElement('div');
        expenseDiv.classList.add('expense');
        expenseDiv.textContent = sampleData[cellDate]?.expense ? `支出: ${sampleData[cellDate].expense}` : "支出: 0";
        cell.appendChild(expenseDiv);

        // 今日の日付を強調表示
        const today = new Date();
        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            cell.classList.add('today');
        }

        row.appendChild(cell);

        // 1週間ごとに新しい行を追加
        if ((firstDay + day) % 7 === 0) {
            calendarBody.appendChild(row);
            row = document.createElement('tr');
        }
    }

    // 最後の行を追加
    if (row.children.length > 0) {
        calendarBody.appendChild(row);
    }
}

// 月を変更するイベントリスナー
prevMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
});

nextMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
});

// 初回のカレンダー描画
renderCalendar(currentDate);
