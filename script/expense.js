const token = localStorage.getItem('token');
const premiumBtn = document.getElementById('premiumBtn');
const premiumTitle = document.getElementById('premiumTitle');
const leaderBoardBtn = document.getElementById('leaderBoardBtn');
const leaderBoardList = document.getElementById('LeaderBoard');
const expenseList = document.getElementById('expenseList');
const paginationDiv = document.getElementById('pagination');
const pageSizeSelect = document.getElementById('pageSizeSelect');
const BaseURL = 'https://attacks-consultants-julie-directions.trycloudflare.com';
let allExpenses = [];
let itemsPerPage = parseInt(localStorage.getItem('itemsPerPage')) || 10;
let currentPage = 1;

pageSizeSelect.value = itemsPerPage;

pageSizeSelect.addEventListener('change', () => {
  itemsPerPage = parseInt(pageSizeSelect.value);
  localStorage.setItem('itemsPerPage', itemsPerPage);
  currentPage = 1;
  renderPage(currentPage);
  renderPagination();
});

const isPremium = async () => {
  try {
    const res = await axios.get(`${BaseURL}/premium/premium-status`, { headers: { Authorization: token } });
    if (res.status === 200 && res.data.isPremium) {
      premiumBtn.style.display = 'none';
      document.body.style.backgroundColor = 'lightgoldenrodyellow';
      premiumTitle.style.display = 'block';
    }
  } catch {}
};

leaderBoardBtn.addEventListener('click', async () => {
  try {
    const res = await axios.get(`${BaseURL}/premium/leaderboard`, { headers: { Authorization: token } });
    if (res.status === 200) {
      leaderBoardList.innerHTML = '';
      res.data.users.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `Name: ${entry.name}, Total Expense: ${entry.totalExpense || 0}`;
        leaderBoardList.appendChild(li);
      });
    }
  } catch {}
});

document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const expAmt = document.getElementById('expAmt').value;
  const expDes = document.getElementById('expDes').value;
  const note = document.getElementById('note').value;

  try {
    const geminiRes = await axios.get(`${BaseURL}/gemini/getCategory?prompt=${expDes}`);
    const expCat = geminiRes.data.response.candidates[0].content.parts[0].text.slice(2, -2);

    const res = await axios.post(`${BaseURL}/expenses/addExpense`, {
      expAmt,
      expDes,
      expCat,
      note
    }, { headers: { Authorization: token } });

    if (res.status === 201) {
      document.getElementById('expAmt').value = '';
      document.getElementById('expDes').value = '';
      document.getElementById('note').value = '';
      loadExpenses();
    }
  } catch {}
});

const loadExpenses = async () => {
  try {
    const res = await axios.get(`${BaseURL}/expenses/getExpenses`, { headers: { Authorization: token } });
    if (res.status === 200) {
      allExpenses = res.data;
      const totalPages = Math.max(1, Math.ceil(allExpenses.length / itemsPerPage));
      if (currentPage > totalPages) currentPage = totalPages;
      renderPage(currentPage);
      renderPagination();
    }
  } catch {}
};

function renderPage(page) {
  expenseList.innerHTML = '';
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  allExpenses.slice(start, end).forEach(expense => {
    const li = document.createElement('li');
    li.textContent = `Amount: ${expense.expAmt}, Description: ${expense.expDes}, Category: ${expense.expCat}`;
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => deleteExpense(expense.id, expense.expAmt);
    li.appendChild(deleteBtn);
    expenseList.appendChild(li);
  });
}

function renderPagination() {
  paginationDiv.innerHTML = '';
  const totalPages = Math.max(1, Math.ceil(allExpenses.length / itemsPerPage));
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === currentPage) {
      btn.style.backgroundColor = '#333';
      btn.style.color = '#fff';
    }
    btn.onclick = () => {
      currentPage = i;
      renderPage(currentPage);
      renderPagination();
    };
    paginationDiv.appendChild(btn);
  }
}

const deleteExpense = async (id, expAmt) => {
  try {
    const res = await axios.delete(`${BaseURL}/expenses/deleteExpense/${id}?expAmt=${expAmt}`, { headers: { Authorization: token } });
    if (res.status === 200) {
      allExpenses = allExpenses.filter(e => e.id !== id);
      const totalPages = Math.max(1, Math.ceil(allExpenses.length / itemsPerPage));
      if (currentPage > totalPages) currentPage = totalPages;
      renderPage(currentPage);
      renderPagination();
    }
  } catch {}
};

const downloadBtn = document.getElementById('downloadBtn');

downloadBtn.addEventListener('click', async () => {
  try {
    downloadBtn.disabled = true;
    downloadBtn.innerText = 'Preparing download...';

    const res = await axios.get(`${BaseURL}/expenses/download`, {
      headers: { Authorization: token }
    });

    const fileUrl = res.data.fileUrl;

    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = `expenses-${Date.now()}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

  } catch (err) {
    if (err.response && err.response.status === 401) {
      alert('Only premium users can download expenses');
    } else {
      alert('Download failed');
    }
  } finally {
    downloadBtn.disabled = false;
    downloadBtn.innerText = 'Download Expenses';
  }
});

let logoutBtn = document.getElementById('logoutBtn');

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
});


window.addEventListener("DOMContentLoaded", () => {
  loadExpenses();
  isPremium();
});
