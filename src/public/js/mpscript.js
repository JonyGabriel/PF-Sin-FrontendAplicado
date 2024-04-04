const mp = new MercadoPago('TEST-64939da2-3b86-4840-8e2f-6c374693c554', {
  locale: 'es-AR'
});

document.getElementById('checkout-btn').addEventListener('click', async () => {
  try {
    const orderData = {
      title: document.querySelector('.name').innerText,
      quantity: 1,
      price: 100,
    };

    const response = await fetch('http://localhost:8080/create_preference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    if (response.ok) {
      const { id } = await response.json();
      createCheckoutButton(id);
    } else {
      throw new Error('Response is not OK');
    }
  } catch (error) {
    alert('Error al crear la preferencia: ' + error.message);
  }
});

const createCheckoutButton = (preferenceId) => {
  const bricksBuilder = mp.bricks();

  const renderComponent = async () => {
    if (window.checkoutButton) window.checkoutButton.unmount();
    await bricksBuilder.create('wallet', 'wallet_container', {
      initialization: {
        preferenceId: preferenceId,
      },
    });
  };

  renderComponent();
};