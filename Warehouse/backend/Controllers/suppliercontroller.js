const Supplier = require("../Model/suppliermodel");

//Get all suppliers

const getAllSuppliers = async (req, res, next) => {

    let suppliers;

    try{
        suppliers = await Supplier.find();
    }catch(err){
        console.log(err);
    }
    //not found
    if(!suppliers){
        return res.status(404).json({message:"User not found"});
    }
    //Display
    return res.status(200).json({suppliers});
};

// Add Suppliers
const addSuppliers = async(req,res,next) => {
    const {Name,Person,ContactNumber,Email,Material,Status,Address} = req.body;

    let suppliers;

    try{
        const lastSupplier = await Supplier.findOne().sort({ Id: -1 });
        const nextId = lastSupplier ? lastSupplier.Id + 1 : 1;
        suppliers = new Supplier({Id: nextId,Name,Person,ContactNumber,Email,Material,Status,Address});
        try{
        await suppliers.save();
        }
        catch(err){
            return res.status(500).json({ message: "Failed to add supplier", error: err.message });
        }
    } catch(err){
        console.log(err);
        
    }
    if(!suppliers){
        return res.status(404).json({message:"Unable to add Supplier"});
        
    }
    return res.status(200).json(suppliers);

};
// Get By ID
const getById = async(req,res,next) => {
    const id = req.params.id;
    let suppliers;

    try{
        suppliers = await Supplier.findOne({ Id: id});
    } catch(err){
        console.log(err);
        return res.status(500).json({ message: "Error fetching supplier", error: err });
    }
    if(!suppliers){
        return res.status(404).json({message:"No such Supplier"});
    }
    return res.status(200).json({suppliers});

};

//Update
const updateSupplier = async(req,res,next) => {
    const id = req.params.id;
    const {Id,Name,Person,ContactNumber,Email,Material,Status,Address} = req.body;
    let suppliers;

    try{
        suppliers = await Supplier.findOneAndUpdate({ Id:id },{Id: Id,Name: Name,Person: Person,ContactNumber: ContactNumber,Email: Email,Material: Material,Status: Status,Address: Address}, {new:true});
        
    } catch(err){
        console.log(err);
        return res.status(500).json({ message: "Error updating supplier", error: err });
    }
    if(!suppliers){
        return res.status(404).json({message:"Unable to update Supplier"});
    }
    return res.status(200).json({suppliers});

};

// Update supplier status (any valid state)
const updateSupplierStatus = async (req, res) => {
  try {
    const { status } = req.body; 
    const id = req.params.id;

    if (!["preferred", "active", "inactive", "blacklisted"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Use numeric Id field
    const supplier = await Supplier.findOneAndUpdate(
      { Id: id },  // match custom Id field
      { Status: status },
      { new: true }
    );

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.status(200).json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



//Delete 
const deleteSupplier = async(req,res,next) => {
    const id = req.params.id;

    let suppliers;

    try{
        suppliers = await Supplier.findOneAndDelete({ Id: id });
    }catch(err){
        console.log(err);
    }
    /*if(!suppliers){
        return res.status(404).json({message:"Unable to delete Supplier"});
    }*/
    return res.status(200).json({suppliers});
};


exports.getAllSuppliers = getAllSuppliers;
exports.addSuppliers = addSuppliers;
exports.getById = getById;
exports.updateSupplier = updateSupplier;
exports.deleteSupplier = deleteSupplier;
exports.updateSupplierStatus = updateSupplierStatus;