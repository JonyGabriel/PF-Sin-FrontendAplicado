import { Router } from "express"
import { addCart, deleteProductFromCart, deleteProducts, getCartById, purchaseCart, updateCartProducts, updateProductFromCart } from "../controllers/carts.controller.js"
import { authorization } from "../middlewares/auth.middlewares.js"
import passport from "passport"
import { createPreference } from "../controllers/carts.controller.js"

const router = Router()

router.get("/:cid", getCartById)

router.post("/", addCart)
router.post("/:cid/purchase", passport.authenticate("jwt", { session: false }), purchaseCart)

router.post("/create_preference", createPreference);

router.put("/:cid", passport.authenticate("jwt", { session: false }), authorization(["premium", "user"]), updateCartProducts)

router.put("/:cid/product/:pid", passport.authenticate("jwt", { session: false }), authorization(["premium", "user"]), updateProductFromCart)

router.delete("/:cid", passport.authenticate("jwt", { session: false }), authorization(["premium", "user"]), deleteProducts)

router.delete("/:cid/products/:pid", passport.authenticate("jwt", { session: false }), authorization(["premium", "user"]), deleteProductFromCart)

export default router