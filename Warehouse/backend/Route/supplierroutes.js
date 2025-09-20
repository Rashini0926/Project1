const express = require("express");
const router = express.Router();

//Insert Model
const Supplier = require("../Model/suppliermodel");
//Insert controller
const Suppliercontroller = require("../Controllers/suppliercontroller");

router.get("/",Suppliercontroller.getAllSuppliers);

router.post("/",Suppliercontroller.addSuppliers);

router.get("/:id",Suppliercontroller.getById);

router.put("/:id",Suppliercontroller.updateSupplier);

router.delete("/:id",Suppliercontroller.deleteSupplier);

router.patch("/:id/status", Suppliercontroller.updateSupplierStatus);




module.exports = router;