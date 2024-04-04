/*const mp = new MercadoPago("TEST-64939da2-3b86-4840-8e2f-6c374693c554", {
  locale: "es-AR",
})

document.getElementById("checkout-btn").addEventListener("click", async () => {
  try{
    const orderData = {
      title: document.querySelector(".name").innerText,
      quantity: 1,
      price: 100,
    };

  const response = await fetch ("http://127.0.0.1:8080/create_preference", {
    method: "POST",
    headers:{
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData)
  });
  const preference = await response.json();
  createCheckoutButton(preference.id);
  } catch (error){
    alert("error :(")
  }
});

const createCheckoutButton = (preferenceId) => {
  const bricksBuilder = mp.bricks();

  const renderComponent = async() => {
    if (window.checkoutButton) window.checkoutButton.unmount();
    await bricksBuilder.create("wallet", "wallet_container",{
      initialization:{
        preferenceId: "<PREFERENCE_ID>",
      },
    });
  };

  renderComponent();
};*/