"use strict";

const {
  STORAGE_KEY,
  createId,
  createDefaultState
} = window.SeoulTravelData;

let state = loadState();

const elements = {
  countdownNumber:
    document.querySelector("#countdownNumber"),

  departureDateText:
    document.querySelector("#departureDateText"),

  departureDate:
    document.querySelector("#departureDate"),

  tripDays:
    document.querySelector("#tripDays"),

  tripDaysSummary:
    document.querySelector("#tripDaysSummary"),

  todoSummary:
    document.querySelector("#todoSummary"),

  todoProgressBar:
    document.querySelector("#todoProgressBar"),

  remainingBudgetSummary:
    document.querySelector("#remainingBudgetSummary"),

  itineraryDay:
    document.querySelector("#itineraryDay"),

  itineraryTime:
    document.querySelector("#itineraryTime"),

  itineraryTitle:
    document.querySelector("#itineraryTitle"),

  itineraryList:
    document.querySelector("#itineraryList"),

  totalBudgetInput:
    document.querySelector("#totalBudgetInput"),

  totalBudgetValue:
    document.querySelector("#totalBudgetValue"),

  spentBudgetValue:
    document.querySelector("#spentBudgetValue"),

  remainingBudgetValue:
    document.querySelector("#remainingBudgetValue"),

  expenseName:
    document.querySelector("#expenseName"),

  expenseAmount:
    document.querySelector("#expenseAmount"),

  expenseList:
    document.querySelector("#expenseList"),

  todoInput:
    document.querySelector("#todoInput"),

  todoList:
    document.querySelector("#todoList"),

  exchangeRate:
    document.querySelector("#exchangeRate"),

  twdInput:
    document.querySelector("#twdInput"),

  krwOutput:
    document.querySelector("#krwOutput"),

  placeName:
    document.querySelector("#placeName"),

  placeCategory:
    document.querySelector("#placeCategory"),

  placeNote:
    document.querySelector("#placeNote"),

  placeList:
    document.querySelector("#placeList"),

  toast:
    document.querySelector("#toast")
};

function normalizeState(savedState) {
  const defaults = createDefaultState();

  return {
    departureDate:
      typeof savedState?.departureDate === "string"
        ? savedState.departureDate
        : defaults.departureDate,

    tripDays:
      Number.isInteger(Number(savedState?.tripDays)) &&
      Number(savedState.tripDays) > 0
        ? Math.min(Number(savedState.tripDays), 30)
        : defaults.tripDays,

    totalBudget:
      Number.isFinite(Number(savedState?.totalBudget)) &&
      Number(savedState.totalBudget) >= 0
        ? Number(savedState.totalBudget)
        : defaults.totalBudget,

    exchangeRate:
      Number.isFinite(Number(savedState?.exchangeRate)) &&
      Number(savedState.exchangeRate) > 0
        ? Number(savedState.exchangeRate)
        : defaults.exchangeRate,

    todos:
      Array.isArray(savedState?.todos)
        ? savedState.todos
        : defaults.todos,

    itinerary:
      Array.isArray(savedState?.itinerary)
        ? savedState.itinerary
        : defaults.itinerary,

    expenses:
      Array.isArray(savedState?.expenses)
        ? savedState.expenses
        : defaults.expenses,

    places:
      Array.isArray(savedState?.places)
        ? savedState.places
        : defaults.places
  };
}

function loadState() {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);

    if (!savedState) {
      return createDefaultState();
    }

    return normalizeState(JSON.parse(savedState));
  } catch (error) {
    console.error("讀取資料失敗：", error);
    return createDefaultState();
  }
}

function saveState() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );
  } catch (error) {
    console.error("儲存資料失敗：", error);

    showToast(
      "資料儲存失敗，請確認瀏覽器設定。"
    );
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "日期未設定";
  }

  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short"
  }).format(date);
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");

  window.clearTimeout(showToast.timer);

  showToast.timer = window.setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2200);
}

function calculateDaysUntilDeparture() {
  const now = new Date();

  now.setHours(0, 0, 0, 0);

  const departure = new Date(
    `${state.departureDate}T00:00:00`
  );

  if (Number.isNaN(departure.getTime())) {
    return null;
  }

  const difference =
    departure.getTime() - now.getTime();

  return Math.ceil(difference / 86400000);
}

function calculateSpentBudget() {
  return state.expenses.reduce(
    (total, expense) => {
      return total + Number(expense.amount || 0);
    },
    0
  );
}

function renderCountdown() {
  const days = calculateDaysUntilDeparture();

  if (days === null) {
    elements.countdownNumber.textContent = "--";
  } else if (days > 0) {
    elements.countdownNumber.textContent = days;
  } else if (days === 0) {
    elements.countdownNumber.textContent = "今天";
  } else {
    elements.countdownNumber.textContent = "已出發";
  }

  elements.departureDateText.textContent =
    formatDate(state.departureDate);

  elements.departureDate.value =
    state.departureDate;

  elements.tripDays.value =
    state.tripDays;

  elements.tripDaysSummary.textContent =
    `${state.tripDays} 天`;
}

function renderTodoSummary() {
  const completedCount = state.todos.filter(
    (todo) => todo.completed
  ).length;

  const totalCount = state.todos.length;

  const progress =
    totalCount === 0
      ? 0
      : (completedCount / totalCount) * 100;

  elements.todoSummary.textContent =
    `${completedCount} / ${totalCount}`;

  elements.todoProgressBar.style.width =
    `${progress}%`;
}

function renderTodos() {
  elements.todoList.innerHTML = "";

  if (state.todos.length === 0) {
    const emptyItem =
      document.createElement("li");

    emptyItem.className = "empty-state";
    emptyItem.textContent =
      "目前沒有待辦事項。";

    elements.todoList.appendChild(emptyItem);

    renderTodoSummary();
    return;
  }

  state.todos.forEach((todo) => {
    const listItem =
      document.createElement("li");

    listItem.className =
      `list-item ${todo.completed ? "completed" : ""}`;

    const main =
      document.createElement("div");

    main.className = "list-item-main";

    const checkbox =
      document.createElement("input");

    checkbox.className = "checkbox";
    checkbox.type = "checkbox";
    checkbox.checked = Boolean(todo.completed);

    checkbox.setAttribute(
      "aria-label",
      "切換待辦完成狀態"
    );

    const text =
      document.createElement("span");

    text.className = "list-item-text";
    text.textContent = todo.text;

    const deleteButton =
      document.createElement("button");

    deleteButton.className =
      "button button-danger button-small";

    deleteButton.type = "button";
    deleteButton.textContent = "刪除";

    checkbox.addEventListener("change", () => {
      todo.completed = checkbox.checked;

      saveState();
      renderTodos();
    });

    deleteButton.addEventListener("click", () => {
      state.todos = state.todos.filter(
        (item) => item.id !== todo.id
      );

      saveState();
      renderTodos();

      showToast("已刪除待辦事項。");
    });

    main.append(checkbox, text);
    listItem.append(main, deleteButton);

    elements.todoList.appendChild(listItem);
  });

  renderTodoSummary();
}

function renderItineraryDayOptions() {
  const previousValue =
    Number(elements.itineraryDay.value) || 1;

  elements.itineraryDay.innerHTML = "";

  for (
    let day = 1;
    day <= state.tripDays;
    day += 1
  ) {
    const option =
      document.createElement("option");

    option.value = day;
    option.textContent = `Day ${day}`;

    elements.itineraryDay.appendChild(option);
  }

  elements.itineraryDay.value = String(
    Math.min(previousValue, state.tripDays)
  );
}

function renderItinerary() {
  elements.itineraryList.innerHTML = "";

  for (
    let day = 1;
    day <= state.tripDays;
    day += 1
  ) {
    const dayEvents = state.itinerary
      .filter(
        (event) => Number(event.day) === day
      )
      .sort((a, b) =>
        String(a.time).localeCompare(
          String(b.time)
        )
      );

    const dayContainer =
      document.createElement("article");

    dayContainer.className = "timeline-day";

    const dayHeader =
      document.createElement("div");

    dayHeader.className =
      "timeline-day-header";

    const title =
      document.createElement("h3");

    title.textContent = `Day ${day}`;

    const count =
      document.createElement("span");

    count.textContent =
      `${dayEvents.length} 個行程`;

    const eventsContainer =
      document.createElement("div");

    eventsContainer.className =
      "timeline-events";

    dayHeader.append(title, count);

    dayContainer.append(
      dayHeader,
      eventsContainer
    );

    if (dayEvents.length === 0) {
      const emptyState =
        document.createElement("div");

      emptyState.className =
        "empty-state empty-state-compact";

      emptyState.textContent =
        "尚未安排這一天的行程。";

      eventsContainer.appendChild(emptyState);
    }

    dayEvents.forEach((event) => {
      const eventElement =
        document.createElement("div");

      eventElement.className =
        "timeline-event";

      const time =
        document.createElement("div");

      time.className = "timeline-time";
      time.textContent = event.time;

      const eventTitle =
        document.createElement("div");

      eventTitle.className =
        "timeline-event-title";

      eventTitle.textContent = event.title;

      const deleteButton =
        document.createElement("button");

      deleteButton.className =
        "button button-danger button-small";

      deleteButton.type = "button";
      deleteButton.textContent = "刪除";

      deleteButton.addEventListener(
        "click",
        () => {
          state.itinerary =
            state.itinerary.filter(
              (item) => item.id !== event.id
            );

          saveState();
          renderItinerary();

          showToast("已刪除行程。");
        }
      );

      eventElement.append(
        time,
        eventTitle,
        deleteButton
      );

      eventsContainer.appendChild(
        eventElement
      );
    });

    elements.itineraryList.appendChild(
      dayContainer
    );
  }
}

function renderBudget() {
  const spent = calculateSpentBudget();

  const remaining =
    Number(state.totalBudget) - spent;

  elements.totalBudgetInput.value =
    state.totalBudget;

  elements.totalBudgetValue.textContent =
    formatCurrency(state.totalBudget);

  elements.spentBudgetValue.textContent =
    formatCurrency(spent);

  elements.remainingBudgetValue.textContent =
    formatCurrency(remaining);

  elements.remainingBudgetSummary.textContent =
    formatCurrency(remaining);

  elements.expenseList.innerHTML = "";

  if (state.expenses.length === 0) {
    const emptyState =
      document.createElement("div");

    emptyState.className = "empty-state";

    emptyState.textContent =
      "尚未新增支出項目。";

    elements.expenseList.appendChild(
      emptyState
    );

    return;
  }

  state.expenses.forEach((expense) => {
    const expenseElement =
      document.createElement("div");

    expenseElement.className =
      "expense-item";

    const name =
      document.createElement("div");

    name.className = "expense-name";
    name.textContent = expense.name;

    const amount =
      document.createElement("div");

    amount.className = "expense-amount";

    amount.textContent =
      formatCurrency(expense.amount);

    const deleteButton =
      document.createElement("button");

    deleteButton.className =
      "button button-danger button-small";

    deleteButton.type = "button";
    deleteButton.textContent = "刪除";

    deleteButton.addEventListener(
      "click",
      () => {
        state.expenses =
          state.expenses.filter(
            (item) => item.id !== expense.id
          );

        saveState();
        renderBudget();

        showToast("已刪除支出項目。");
      }
    );

    expenseElement.append(
      name,
      amount,
      deleteButton
    );

    elements.expenseList.appendChild(
      expenseElement
    );
  });
}

function renderCurrency() {
  const rate =
    Number(state.exchangeRate) || 0;

  const twd =
    Number(elements.twdInput.value) || 0;

  const krw = twd * rate;

  elements.exchangeRate.value =
    state.exchangeRate;

  elements.krwOutput.value =
    `${new Intl.NumberFormat("ko-KR", {
      maximumFractionDigits: 0
    }).format(krw)} KRW`;
}

function renderPlaces() {
  elements.placeList.innerHTML = "";

  if (state.places.length === 0) {
    const emptyState =
      document.createElement("div");

    emptyState.className =
      "empty-state empty-state-full";

    emptyState.textContent =
      "尚未收藏任何景點。";

    elements.placeList.appendChild(
      emptyState
    );

    return;
  }

  state.places.forEach((place) => {
    const placeElement =
      document.createElement("article");

    placeElement.className = "place-card";

    const headingGroup =
      document.createElement("div");

    const category =
      document.createElement("span");

    category.className = "place-category";
    category.textContent = place.category;

    const name =
      document.createElement("h3");

    name.textContent = place.name;

    const note =
      document.createElement("p");

    note.textContent =
      place.note || "尚未新增備註。";

    const actions =
      document.createElement("div");

    actions.className =
      "place-card-actions";

    const mapLink =
      document.createElement("a");

    mapLink.className =
      "button button-secondary button-small";

    mapLink.target = "_blank";
    mapLink.rel = "noopener noreferrer";
    mapLink.textContent = "地圖";

    mapLink.href =
      "https://www.google.com/maps/search/" +
      "?api=1&query=" +
      encodeURIComponent(
        `${place.name} Seoul`
      );

    const deleteButton =
      document.createElement("button");

    deleteButton.className =
      "button button-danger button-small";

    deleteButton.type = "button";
    deleteButton.textContent = "刪除";

    deleteButton.addEventListener(
      "click",
      () => {
        state.places =
          state.places.filter(
            (item) => item.id !== place.id
          );

        saveState();
        renderPlaces();

        showToast("已刪除收藏景點。");
      }
    );

    headingGroup.append(category, name);
    actions.append(mapLink, deleteButton);

    placeElement.append(
      headingGroup,
      note,
      actions
    );

    elements.placeList.appendChild(
      placeElement
    );
  });
}

function renderAll() {
  renderCountdown();
  renderItineraryDayOptions();
  renderItinerary();
  renderTodos();
  renderBudget();
  renderCurrency();
  renderPlaces();
}

function addTodo() {
  const text =
    elements.todoInput.value.trim();

  if (!text) {
    showToast("請輸入待辦事項。");
    return;
  }

  state.todos.push({
    id: createId(),
    text,
    completed: false
  });

  elements.todoInput.value = "";

  saveState();
  renderTodos();

  showToast("已新增待辦事項。");
}

function addItinerary() {
  const day =
    Number(elements.itineraryDay.value);

  const time =
    elements.itineraryTime.value;

  const title =
    elements.itineraryTitle.value.trim();

  if (!title) {
    showToast("請輸入行程內容。");
    return;
  }

  if (!time) {
    showToast("請選擇行程時間。");
    return;
  }

  state.itinerary.push({
    id: createId(),
    day,
    time,
    title
  });

  elements.itineraryTitle.value = "";

  saveState();
  renderItinerary();

  showToast("已新增行程。");
}

function addExpense() {
  const name =
    elements.expenseName.value.trim();

  const amount =
    Number(elements.expenseAmount.value);

  if (!name) {
    showToast("請輸入支出項目。");
    return;
  }

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    showToast("請輸入正確的支出金額。");
    return;
  }

  state.expenses.push({
    id: createId(),
    name,
    amount
  });

  elements.expenseName.value = "";
  elements.expenseAmount.value = "";

  saveState();
  renderBudget();

  showToast("已新增支出項目。");
}

function addPlace() {
  const name =
    elements.placeName.value.trim();

  const category =
    elements.placeCategory.value;

  const note =
    elements.placeNote.value.trim();

  if (!name) {
    showToast("請輸入景點名稱。");
    return;
  }

  state.places.push({
    id: createId(),
    name,
    category,
    note
  });

  elements.placeName.value = "";
  elements.placeNote.value = "";

  saveState();
  renderPlaces();

  showToast("已新增收藏景點。");
}

function bindEvents() {
  document
    .querySelector("#saveSettingsButton")
    .addEventListener("click", () => {
      const departureDate =
        elements.departureDate.value;

      const tripDays =
        Number(elements.tripDays.value);

      if (!departureDate) {
        showToast("請選擇出發日期。");
        return;
      }

      if (
        !Number.isInteger(tripDays) ||
        tripDays < 1
      ) {
        showToast(
          "旅行天數至少需要 1 天。"
        );

        return;
      }

      state.departureDate = departureDate;

      state.tripDays =
        Math.min(tripDays, 30);

      state.itinerary =
        state.itinerary.filter(
          (event) =>
            Number(event.day) <=
            state.tripDays
        );

      saveState();
      renderAll();

      showToast("旅行設定已儲存。");
    });

  document
    .querySelector("#addTodoButton")
    .addEventListener("click", addTodo);

  elements.todoInput.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Enter") {
        addTodo();
      }
    }
  );

  document
    .querySelector("#addItineraryButton")
    .addEventListener(
      "click",
      addItinerary
    );

  elements.itineraryTitle.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Enter") {
        addItinerary();
      }
    }
  );

  document
    .querySelector("#saveBudgetButton")
    .addEventListener("click", () => {
      const totalBudget =
        Number(
          elements.totalBudgetInput.value
        );

      if (
        !Number.isFinite(totalBudget) ||
        totalBudget < 0
      ) {
        showToast(
          "請輸入正確的預算金額。"
        );

        return;
      }

      state.totalBudget = totalBudget;

      saveState();
      renderBudget();

      showToast("總預算已儲存。");
    });

  document
    .querySelector("#addExpenseButton")
    .addEventListener(
      "click",
      addExpense
    );

  elements.expenseAmount.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Enter") {
        addExpense();
      }
    }
  );

  elements.exchangeRate.addEventListener(
    "input",
    () => {
      const rate =
        Number(
          elements.exchangeRate.value
        );

      if (
        Number.isFinite(rate) &&
        rate > 0
      ) {
        state.exchangeRate = rate;
        saveState();
      }

      renderCurrency();
    }
  );

  elements.twdInput.addEventListener(
    "input",
    renderCurrency
  );

  document
    .querySelector("#addPlaceButton")
    .addEventListener("click", addPlace);

  elements.placeName.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Enter") {
        addPlace();
      }
    }
  );

  document
    .querySelectorAll(".nav-button")
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const target =
            document.querySelector(
              `#${button.dataset.target}`
            );

          target?.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      );
    });
}

bindEvents();
renderAll();
