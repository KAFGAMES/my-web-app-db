CREATE TABLE calendar_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE,
    category VARCHAR(50),
    profit DECIMAL(10, 2),
    expense DECIMAL(10, 2),
    memo TEXT
);

CREATE TABLE monthly_goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50),
    year INT,
    month INT,
    goal_amount DECIMAL(10, 2)
);