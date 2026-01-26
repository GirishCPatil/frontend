document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();
const BaseURL = 'https://roulette-struggle-algorithms-electronics.trycloudflare.com';
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await axios.post(`${BaseURL}/users/signup`, {
      name,
      email,
      password
    });

    // Axios automatically parses JSON
    if (res.status === 201) {
      alert('Signup successful!');
    }

  } catch (err) {
    console.error(err);

    if (err.response) {
      // Backend responded with error
      alert(err.response.data.message);
    } else {
      // Network / server issue
      alert('Something went wrong');
    }
  }
});
