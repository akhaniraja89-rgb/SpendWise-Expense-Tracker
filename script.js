
/* ==========================================
   SPENDWISE — EXPENSE TRACKER
   Step 7: JavaScript Functionality
========================================== */

// 1. SELECT HTML ELEMENTS

const transactionForm = document.querySelector("#transaction-form");
const descriptionInput = document.querySelector("#description");
const amountInput = document.querySelector("#amount");
const typeInput = document.querySelector("#type");
const categoryInput = document.querySelector("#category");
const dateInput = document.querySelector("#transaction-date");

const totalBalanceElement = document.querySelector("#total-balance");
const totalIncomeElement = document.querySelector("#total-income");
const totalExpensesElement = document.querySelector("#total-expenses");

const transactionList = document.querySelector("#transaction-list");
const transactionCount = document.querySelector("#transaction-count");
const filterType = document.querySelector("#filter-type");
const currentDateElement = document.querySelector("#current-date");
const formMessage = document.querySelector("#form-message");

// 2. LOCAL STORAGE KEY

const STORAGE_KEY = "spendWiseTransactions";

// 3. CURRENCY FORMATTER

const currencyFormatter = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0
});

function formatCurrency(amount) {
  return currencyFormatter.format(amount);
}

// 4. GET TODAY'S DATE

function getLocalDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function displayCurrentDate() {
  const today = new Date();

  currentDateElement.textContent = today.toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  dateInput.value = getLocalDate();
  dateInput.max = getLocalDate();
}

displayCurrentDate();

// 5. LOAD DATA FROM LOCAL STORAGE

function loadTransactions() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (!savedData) {
      return [];
    }

    const parsedData = JSON.parse(savedData);

    if (!Array.isArray(parsedData)) {
      return [];
    }

    // Accept only valid transaction records.
    return parsedData.filter((item) => {
      return (
        item &&
        typeof item.id === "string" &&
        typeof item.description === "string" &&
        item.description.trim().length > 0 &&
        Number.isSafeInteger(item.amount) &&
        item.amount > 0 &&
        (item.type === "income" || item.type === "expense") &&
        typeof item.category === "string" &&
        typeof item.date === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(item.date)
      );
    });
  } catch (error) {
    console.error("Could not load saved transactions:", error);
    return [];
  }
}

let transactions = loadTransactions();

// 6. SAVE DATA

function saveTransactions() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(transactions)
    );

    return true;
  } catch (error) {
    console.error("Could not save transactions:", error);

    showMessage(
      "Data save nahi hua. Browser storage check karo.",
      true
    );

    return false;
  }
}

// 7. SHOW FORM MESSAGE

function showMessage(message, isError = false) {
  formMessage.textContent = message;
  formMessage.style.color = isError ? "#dc4c64" : "#159766";
}

// 8. CALCULATE BALANCE, INCOME AND EXPENSES

function updateSummary() {
  let income = 0;
  let expenses = 0;

  transactions.forEach((transaction) => {
    if (transaction.type === "income") {
      income += transaction.amount;
    } else {
      expenses += transaction.amount;
    }
  });

  const balance = income - expenses;

  totalBalanceElement.textContent = formatCurrency(balance);
  totalIncomeElement.textContent = formatCurrency(income);
  totalExpensesElement.textContent = formatCurrency(expenses);
}

// 9. FORMAT TRANSACTION DATE

function formatTransactionDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);

  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

// 10. GET CATEGORY ICON

function getCategoryIcon(category) {
  const icons = {
    "Food": "🛒",
    "Shopping": "🛍️",
    "Transport": "🚗",
    "Bills": "🧾",
    "Education": "📚",
    "Salary": "💰",
    "Other": "💳"
  };

  return icons[category] || "💳";
}

// 11. DISPLAY TRANSACTIONS

function renderTransactions() {
  transactionList.replaceChildren();

  const selectedType = filterType.value;

  const filteredTransactions = transactions
    .filter((transaction) => {
      return selectedType === "all" ||
        transaction.type === selectedType;
    })
    .sort((a, b) => {
      return b.date.localeCompare(a.date) ||
        b.id.localeCompare(a.id);
    });

  transactionCount.textContent =
    `${filteredTransactions.length} ${
      filteredTransactions.length === 1 ? "item" : "items"
    }`;

  // Empty state
  if (filteredTransactions.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";

    const icon = document.createElement("span");
    icon.className = "empty-icon";
    icon.textContent = "↗";

    const heading = document.createElement("h3");
    heading.textContent = selectedType === "all"
      ? "No transactions yet"
      : "No matching transactions";

    const paragraph = document.createElement("p");
    paragraph.textContent = selectedType === "all"
      ? "Add your first transaction to get started."
      : "Try another filter or add a transaction.";

    emptyState.append(icon, heading, paragraph);
    transactionList.appendChild(emptyState);

    return;
  }

  // Create each transaction
  filteredTransactions.forEach((transaction) => {
    const item = document.createElement("div");
    item.className = "transaction-item";

    const info = document.createElement("div");
    info.className = "transaction-info";

    const icon = document.createElement("div");
    icon.className = "transaction-icon";
    icon.textContent = getCategoryIcon(transaction.category);

    const details = document.createElement("div");
    details.className = "transaction-details";

    const title = document.createElement("h3");
    title.textContent = transaction.description;

    const meta = document.createElement("p");
    meta.textContent =
      `${transaction.category} · ${formatTransactionDate(transaction.date)}`;

    details.append(title, meta);
    info.append(icon, details);

    const right = document.createElement("div");
    right.className = "transaction-right";

    const amount = document.createElement("div");
    amount.className =
      `transaction-amount ${transaction.type}`;

    const sign = transaction.type === "income" ? "+" : "−";

    amount.textContent =
      `${sign} ${formatCurrency(transaction.amount)}`;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute(
      "aria-label",
      `Delete transaction: ${transaction.description}`
    );

    // Delete selected transaction
    deleteButton.addEventListener("click", () => {
      deleteTransaction(transaction.id);
    });

    right.append(amount, deleteButton);
    item.append(info, right);
    transactionList.appendChild(item);
  });
}

// 12. ADD NEW TRANSACTION

transactionForm.addEventListener("submit", (event) => {
  // Stop page refresh on form submission
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = Number(amountInput.value);
  const type = typeInput.value;
  const category = categoryInput.value;
  const date = dateInput.value;

  // Validate form values
  if (!description) {
    showMessage("Description enter karo.", true);
    descriptionInput.focus();
    return;
  }

  if (
    !Number.isSafeInteger(amount) ||
    amount <= 0 ||
    amount > 1000000000
  ) {
    showMessage("Valid amount enter karo.", true);
    amountInput.focus();
    return;
  }

  if (type !== "income" && type !== "expense") {
    showMessage("Valid transaction type select karo.", true);
    return;
  }

  if (!category || !date || date > getLocalDate()) {
    showMessage("Valid date aur category select karo.", true);
    return;
  }

  // Create transaction object
  const transaction = {
    id: crypto.randomUUID(),
    description,
    amount,
    type,
    category,
    date
  };

  // Add transaction to array
  transactions.push(transaction);

  // Save and refresh dashboard
  if (!saveTransactions()) {
    transactions.pop();
    return;
  }

  updateSummary();
  renderTransactions();

  // Reset form for next transaction
  transactionForm.reset();
  dateInput.value = getLocalDate();

  showMessage("Transaction successfully add ho gayi!");
});

// 13. DELETE TRANSACTION

function deleteTransaction(id) {
  const previousTransactions = transactions;

  transactions = transactions.filter((transaction) => {
    return transaction.id !== id;
  });

  if (!saveTransactions()) {
    transactions = previousTransactions;
    return;
  }

  updateSummary();
  renderTransactions();

  showMessage("Transaction delete ho gayi!");
}

// 14. FILTER TRANSACTIONS

filterType.addEventListener("change", () => {
  renderTransactions();
});

// 15. INITIALIZE DASHBOARD

updateSummary();
renderTransactions();

console.log("SpendWise Expense Tracker is ready!");
