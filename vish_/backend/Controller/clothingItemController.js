// Controller/clothingItemController.js
import ClothingItem from "../Model/clothingItemModel.js";

// Get all clothing items
export const getAllClothingItems = async (req, res) => {
  try {
    const clothingItems = await ClothingItem.find();
    res.status(200).json({
      success: true,
      count: clothingItems.length,
      data: clothingItems
    });
  } catch (error) {
    console.error("Error fetching clothing items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch clothing items",
      error: error.message
    });
  }
};

// Get a single clothing item by ID
export const getClothingItemById = async (req, res) => {
  try {
    const clothingItem = await ClothingItem.findById(req.params.id);
    if (!clothingItem) {
      return res.status(404).json({
        success: false,
        message: "Clothing item not found"
      });
    }
    res.status(200).json({
      success: true,
      data: clothingItem
    });
  } catch (error) {
    console.error("Error fetching clothing item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch clothing item",
      error: error.message
    });
  }
};

// Create a new clothing item
export const createClothingItem = async (req, res) => {
  try {
    const newClothingItem = new ClothingItem(req.body);
    await newClothingItem.save();
    res.status(201).json({
      success: true,
      message: "Clothing item created successfully",
      data: newClothingItem
    });
  } catch (error) {
    console.error("Error creating clothing item:", error);
    res.status(400).json({
      success: false,
      message: "Failed to create clothing item",
      error: error.message
    });
  }
};

// Update a clothing item
export const updateClothingItem = async (req, res) => {
  try {
    const clothingItem = await ClothingItem.findById(req.params.id);
    if (!clothingItem) {
      return res.status(404).json({
        success: false,
        message: "Clothing item not found"
      });
    }

    const updatedClothingItem = await ClothingItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Clothing item updated successfully",
      data: updatedClothingItem
    });
  } catch (error) {
    console.error("Error updating clothing item:", error);
    res.status(400).json({
      success: false,
      message: "Failed to update clothing item",
      error: error.message
    });
  }
};

// Delete a clothing item
export const deleteClothingItem = async (req, res) => {
  try {
    const clothingItem = await ClothingItem.findById(req.params.id);
    if (!clothingItem) {
      return res.status(404).json({
        success: false,
        message: "Clothing item not found"
      });
    }

    await ClothingItem.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Clothing item deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting clothing item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete clothing item",
      error: error.message
    });
  }
};

// Add material to clothing item
export const addMaterialToClothingItem = async (req, res) => {
  try {
    const clothingItem = await ClothingItem.findById(req.params.id);
    if (!clothingItem) {
      return res.status(404).json({
        success: false,
        message: "Clothing item not found"
      });
    }

    clothingItem.materials.push(req.body);
    await clothingItem.save();

    res.status(200).json({
      success: true,
      message: "Material added to clothing item",
      data: clothingItem
    });
  } catch (error) {
    console.error("Error adding material:", error);
    res.status(400).json({
      success: false,
      message: "Failed to add material",
      error: error.message
    });
  }
};

// Update material in clothing item
export const updateMaterialInClothingItem = async (req, res) => {
  try {
    const clothingItem = await ClothingItem.findById(req.params.id);
    if (!clothingItem) {
      return res.status(404).json({
        success: false,
        message: "Clothing item not found"
      });
    }

    const materialIndex = clothingItem.materials.findIndex(
      material => material._id.toString() === req.params.materialId
    );

    if (materialIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Material not found in clothing item"
      });
    }

    clothingItem.materials[materialIndex] = {
      ...clothingItem.materials[materialIndex].toObject(),
      ...req.body
    };

    await clothingItem.save();

    res.status(200).json({
      success: true,
      message: "Material updated in clothing item",
      data: clothingItem
    });
  } catch (error) {
    console.error("Error updating material:", error);
    res.status(400).json({
      success: false,
      message: "Failed to update material",
      error: error.message
    });
  }
};

// Remove material from clothing item
export const removeMaterialFromClothingItem = async (req, res) => {
  try {
    const clothingItem = await ClothingItem.findById(req.params.id);
    if (!clothingItem) {
      return res.status(404).json({
        success: false,
        message: "Clothing item not found"
      });
    }

    clothingItem.materials = clothingItem.materials.filter(
      material => material._id.toString() !== req.params.materialId
    );

    await clothingItem.save();

    res.status(200).json({
      success: true,
      message: "Material removed from clothing item",
      data: clothingItem
    });
  } catch (error) {
    console.error("Error removing material:", error);
    res.status(400).json({
      success: false,
      message: "Failed to remove material",
      error: error.message
    });
  }
};

// Import initial clothing items from JSON
export const importInitialClothingItems = async (req, res) => {
  try {
    // This function will check if the clothing items already exist before importing
    const { clothingItems } = req.body;
    
    if (!clothingItems || !Array.isArray(clothingItems)) {
      return res.status(400).json({
        success: false,
        message: "Invalid clothing items data"
      });
    }
    
    let importedCount = 0;
    let existingCount = 0;
    
    for (const item of clothingItems) {
      // Check if the item already exists
      const existingItem = await ClothingItem.findOne({ name: item.name });
      
      if (existingItem) {
        existingCount++;
        continue;
      }
      
      // Create the new clothing item
      const newClothingItem = new ClothingItem(item);
      await newClothingItem.save();
      importedCount++;
    }
    
    res.status(200).json({
      success: true,
      message: `Imported ${importedCount} clothing items. ${existingCount} items already existed.`
    });
  } catch (error) {
    console.error("Error importing clothing items:", error);
    res.status(400).json({
      success: false,
      message: "Failed to import clothing items",
      error: error.message
    });
  }
};
