document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();
const BaseURL = 'https://attacks-consultants-julie-directions.trycloudflare.com';
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await axios.post(`${BaseURL}/users/login`, {
      email,
      password
    });
console.log(res);
    if (res.status === 200) {
      alert(res.data.message);
      // Save token to local storage
      localStorage.setItem('token', res.data.token); 
      // Redirect to your expense page
      window.location.href = "../views/expense.html"; 
    }

  } catch (err) {
    console.error(err);
    if (err.response) {
      alert(err.response.data.message);
    } else {
      alert('Server not reachable');
    }
  }
});