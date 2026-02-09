const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const balance = document.getElementById("balance");
const breakdownList = document.getElementById("breakdownList");
const earningsTotal = document.getElementById("earningsTotal");
const goalProgress = document.getElementById("goalProgress");
const goalAmount = document.getElementById("goalAmount");
const goalInput = document.getElementById("goalInput");
const updateGoal = document.getElementById("updateGoal");
const addSample = document.getElementById("addSample");
const resetAll = document.getElementById("resetAll");

const STORAGE_KEY = "earn_money_state";
const defaultGoal = 500;

const state = {
  tasks: [],
  goal: defaultGoal,
};

const typeLabels = {
  gigs: "Gig",
  sales: "Sale",
  investments: "Investment",
  learning: "Learning",
};

const formatCurrency = (value) => `$${value.toLocaleString()}`;

const saveState = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Unable to save state:", error);
  }
};

const loadState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const parsed = JSON.parse(saved);
    state.tasks = parsed.tasks || [];
    state.goal = parsed.goal || defaultGoal;
  } catch (error) {
    console.warn("Unable to load saved state:", error);
  }
};

const generateId = () => {
  if (crypto?.randomUUID) {
    return crypto.randomUUID();
  }
  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const updateBreakdown = () => {
  const totals = state.tasks.reduce(
    (acc, task) => {
      acc[task.type] = (acc[task.type] || 0) + task.amount;
      return acc;
    },
    {
      gigs: 0,
      sales: 0,
      investments: 0,
      learning: 0,
    }
  );

  breakdownList.innerHTML = "";
  Object.entries(totals).forEach(([type, total]) => {
    const item = document.createElement("li");
    item.innerHTML = `${typeLabels[type]} <span>${formatCurrency(total)}</span>`;
    breakdownList.appendChild(item);
  });
};

const updateBalance = () => {
  const total = state.tasks.reduce((sum, task) => sum + task.amount, 0);
  balance.textContent = formatCurrency(total);
  earningsTotal.textContent = formatCurrency(total);
  goalAmount.textContent = formatCurrency(state.goal);
  const progress = state.goal === 0 ? 0 : Math.min((total / state.goal) * 100, 100);
  goalProgress.style.width = `${progress}%`;
};

const renderTasks = () => {
  taskList.innerHTML = "";
  state.tasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = "task";

    const info = document.createElement("div");
    info.className = "task-info";
    info.innerHTML = `<h4>${task.title}</h4><p>${formatCurrency(
      task.amount
    )} · ${task.due}</p>`;

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const tag = document.createElement("span");
    tag.className = "task-tag";
    tag.textContent = typeLabels[task.type];

    const completeBtn = document.createElement("button");
    completeBtn.className = "complete";
    completeBtn.textContent = "Complete";
    completeBtn.addEventListener("click", () => markComplete(task.id));

    actions.append(tag, completeBtn);
    item.append(info, actions);
    taskList.appendChild(item);
  });

  taskCount.textContent = state.tasks.length;
};

const markComplete = (taskId) => {
  state.tasks = state.tasks.filter((task) => task.id !== taskId);
  saveState();
  render();
};

const addTask = (task) => {
  state.tasks.unshift(task);
  saveState();
  render();
};

const render = () => {
  renderTasks();
  updateBalance();
  updateBreakdown();
};

const handleFormSubmit = (event) => {
  event.preventDefault();
  const title = document.getElementById("taskTitle").value.trim();
  const amount = Number(document.getElementById("taskValue").value);
  const type = document.getElementById("taskType").value;

  if (!title || amount <= 0) {
    return;
  }

  addTask({
    id: generateId(),
    title,
    amount,
    type,
    due: "Due today",
  });

  taskForm.reset();
};

const handleGoalUpdate = () => {
  const value = Number(goalInput.value);
  if (Number.isNaN(value) || value < 0) {
    return;
  }
  state.goal = value;
  goalInput.value = "";
  saveState();
  render();
};

const loadSampleTasks = () => {
  const samples = [
    {
      title: "Launch newsletter sponsorship",
      amount: 120,
      type: "sales",
    },
    {
      title: "Complete mobile UI gig",
      amount: 240,
      type: "gigs",
    },
    {
      title: "Dividend payout",
      amount: 80,
      type: "investments",
    },
    {
      title: "Finish pricing strategy course",
      amount: 60,
      type: "learning",
    },
  ];

  state.tasks = samples.map((sample) => ({
    ...sample,
    id: generateId(),
    due: "Due this week",
  }));
  saveState();
  render();
};

const handleReset = () => {
  state.tasks = [];
  state.goal = defaultGoal;
  saveState();
  render();
};

loadState();
render();

taskForm.addEventListener("submit", handleFormSubmit);
updateGoal.addEventListener("click", handleGoalUpdate);
addSample.addEventListener("click", loadSampleTasks);
resetAll.addEventListener("click", handleReset);
