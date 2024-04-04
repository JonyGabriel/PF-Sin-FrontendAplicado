import { cartsService, productsService, ticketsService } from "../services/index.js"
import { PERSISTENCE } from "../config/config.js"
import Mail from "../modules/mail.module.js"
import moment from "moment"
import { MercadoPagoConfig, Preference } from "mercadopago"
const mail = new Mail()

export const getCartById = async (req, res) => {
  try {
    const { cid } = req.params
    const result = await cartsService.getCartById(cid)
    res.status(result ? 200 : 404).json({ status: result ? "success" : "error", payload: result })
  }
  catch (e) {
    req.logger.error("Error: " + e)
    if (e.name == "CastError") return res.status(404).send("Not found")
    res.status(500).send("Server error")
  }
}

export const addCart = async (req, res) => {
  try {
    const result = await cartsService.addCart(req.body)
    res.json({ status: result ? "success" : "error", payload: result })
  }
  catch (e) {
    req.logger.error("Error: " + e)
    res.status(500).send("Server error")
  }
}

export const updateCartProducts = async (req, res) => {
  try {
    if (!req.body) return res.status(400).json({ status: "error", payload: "there aren't products specified" })
    const result = await cartsService.updateCartProducts(req.params?.cid, req.body?.products)
    res.status(result.modifiedCount ? 200 : 404).json({ stauts: result.modifiedCount ? "success" : "error", payload: result })
  }
  catch (e) {
    req.logger.error("Error: " + e)
    if (e.name == "CastError") return res.status(404).send("Not found")
    res.status(500).send("Server error")
  }
}

export const updateProductFromCart = async (req, res) => {
  try {
    const { params: { pid, cid }, body: { quantity }, user: { user } } = req

    if (user.role != "user") {
      const product = await productsService.getProductById(pid)
      if (product.owner == (user?._id || user?.id)) return res.status(400).send("This is your product")
    }


    const result = await cartsService.updateProductFromCart(pid, cid, quantity)
    res.status(result.modifiedCount ? 200 : 404).json({ stauts: result.modifiedCount ? "success" : "error", payload: result })
  }
  catch (e) {
    req.logger.error("Error: " + e)
    if (e.name == "CastError") return res.status(404).send("Not found")
    res.status(500).send("Server error")
  }
}

export const deleteProductFromCart = async (req, res) => {
  try {
    const { cid, pid } = req.params
    const result = await cartsService.deleteProductFromCart(cid, pid)
    res.status(result.modifiedCount ? 200 : 404).json({ stauts: result.modifiedCount ? "success" : "error", payload: result })
  }
  catch (e) {
    req.logger.error("Error: " + e)
    if (e.name == "CastError") return res.status(404).send("Not found")
    res.status(500).send("Server error")
  }
}

export const deleteProducts = async (req, res) => {
  try {
    const result = await cartsService.deleteCartProducts(req.params?.cid)
    res.status(result.modifiedCount ? 200 : 404).json({ stauts: result.modifiedCount ? "success" : "error", payload: result })
  }
  catch (e) {
    req.logger.error("Error: " + e)
    if (e.name == "CastError") return res.status(404).send("Not found")
    res.status(500).send("Server error")
  }
}

export const purchaseCart = async (req, res) => {
  try {
    const { cid } = req.params
    const cart = await cartsService.getCartById(cid)

    const unavailableProducts = []
    const purchasedProducts = []


    await Promise.all(cart.products.map(async p => {
      if (PERSISTENCE == "MONGO") p.product.stock >= p.quantity ? (await productsService.updateProduct(p.product._id, { stock: p.product.stock - p.quantity }), purchasedProducts.push(p)) : unavailableProducts.push(p)
      else {
        const product = await productsService.getProductById(p.id)
        product.stock >= p.quantity ? (await productsService.updateProduct(product.id, { stock: product.stock - p.quantity }), purchasedProducts.push({ ...p, product })) : unavailableProducts.push(p)
      }
    }))


    const ticket = {
      purchase_datetime: moment().format("YYYY-MM-DD hh:mm:ss"),
      amount: purchasedProducts.reduce((acc, p) => {
        return acc + (p?.product?.price) * p.quantity
      }, 0),
      purchaser: req?.user?.user?.email
    }
    const ticketResult = await ticketsService.createTicket(ticket)

    const cartUpdateProducts = await cartsService.updateCartProducts(cid, unavailableProducts)

    mail.send(req?.user?.user?.email, "Compra realizada", "<h1>Relisazte la compra</h1>")

    res.json({ status: "success", payload: unavailableProducts.length ? unavailableProducts : ticketResult })
  }
  catch (e) {
    req.logger.error("Error: " + e)
    if (e.name == "CastError") return res.status(404).send("Not found")
    res.status(500).send("Server error")
  }
}

//MERCADO PAGO 
import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({ accessToken: 'TEST-6769129066925551-032319-cba08c8c83a930e8573509e0629f127d-387993007' });

export const createPreference = async (req, res) => {
  try {
    const body = {
      items: [
        {
          title: req.body.title,
          quantity: Number(req.body.quantity),
          unit_price: Number(req.body.price),
          currency_id: "ARS",
        },
      ],
      back_urls: {
        success: "http://127.0.0.1:8080/products",
        failure: "http://127.0.0.1:8080/products",
        pending: "http://127.0.0.1:8080/products",
      },
      auto_return: "approved",
    };
    const preference = new Preference(client);
    const result = await preference.create({ body });
    res.setHeader('Content-Type', 'application/json');
    res.json({
      id: result.id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Error al crear una preferencia:("
    });
  }
};