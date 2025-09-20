import express from "express";
import orderController from "../Controller/orderControler.js";

const router = express.Router();

router.get("/", orderController.getAllOrders);   // GET all
router.post("/", orderController.addOrder);      // POST new
router.get("/:id", orderController.getById);     // GET by _id
router.put("/:id", orderController.updateorder); // UPDATE by _id
router.delete("/:id", orderController.deleteOrder); // DELETE by _id ✅

export default router;
