async function handleSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  try {
    const res = await fetch('https://alexannemanaay.pages.dev/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value,
      }),
    });

    btn.textContent = res.ok ? '✓ Message Sent!' : '✗ Failed — try again';
    if (res.ok) document.getElementById('contactForm').reset();
  } catch {
    btn.textContent = '✗ Failed — try again';
  }

  btn.disabled = false;
  setTimeout(() => btn.textContent = 'Send Message →', 3500);
}
