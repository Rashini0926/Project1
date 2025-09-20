// services/clothingItemService.js
const API_BASE = 'http://localhost:5000/api/clothing-items';

/**
 * Fetches all clothing items from the API
 * @returns {Promise<Object>} - Object containing clothing items array
 */
export async function getAllClothingItems() {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch clothing items');
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching clothing items:', error);
    throw error;
  }
}

/**
 * Fetches a specific clothing item by ID
 * @param {string} id - The ID of the clothing item
 * @returns {Promise<Object>} - The clothing item data
 */
export async function getClothingItemById(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch clothing item');
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching clothing item:', error);
    throw error;
  }
}

/**
 * Creates a new clothing item
 * @param {Object} clothingItem - The clothing item data
 * @returns {Promise<Object>} - The created clothing item data
 */
export async function createClothingItem(clothingItem) {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clothingItem)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create clothing item');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error creating clothing item:', error);
    throw error;
  }
}

/**
 * Updates an existing clothing item
 * @param {string} id - The ID of the clothing item to update
 * @param {Object} clothingItem - The updated clothing item data
 * @returns {Promise<Object>} - The updated clothing item data
 */
export async function updateClothingItem(id, clothingItem) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clothingItem)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update clothing item');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error updating clothing item:', error);
    throw error;
  }
}

/**
 * Deletes a clothing item
 * @param {string} id - The ID of the clothing item to delete
 * @returns {Promise<Object>} - The response data
 */
export async function deleteClothingItem(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete clothing item');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error deleting clothing item:', error);
    throw error;
  }
}

/**
 * Adds a material to a clothing item
 * @param {string} id - The ID of the clothing item
 * @param {Object} material - The material data
 * @returns {Promise<Object>} - The updated clothing item data
 */
export async function addMaterialToClothingItem(id, material) {
  try {
    const res = await fetch(`${API_BASE}/${id}/materials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(material)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to add material to clothing item');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error adding material to clothing item:', error);
    throw error;
  }
}

/**
 * Updates a material in a clothing item
 * @param {string} id - The ID of the clothing item
 * @param {string} materialId - The ID of the material to update
 * @param {Object} material - The updated material data
 * @returns {Promise<Object>} - The updated clothing item data
 */
export async function updateMaterialInClothingItem(id, materialId, material) {
  try {
    const res = await fetch(`${API_BASE}/${id}/materials/${materialId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(material)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update material in clothing item');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error updating material in clothing item:', error);
    throw error;
  }
}

/**
 * Removes a material from a clothing item
 * @param {string} id - The ID of the clothing item
 * @param {string} materialId - The ID of the material to remove
 * @returns {Promise<Object>} - The updated clothing item data
 */
export async function removeMaterialFromClothingItem(id, materialId) {
  try {
    const res = await fetch(`${API_BASE}/${id}/materials/${materialId}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to remove material from clothing item');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error removing material from clothing item:', error);
    throw error;
  }
}

/**
 * Import initial clothing items from JSON data
 * @param {Array} clothingItems - Array of clothing item objects
 * @returns {Promise<Object>} - The response data
 */
export async function importInitialClothingItems(clothingItems) {
  try {
    const res = await fetch(`${API_BASE}/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clothingItems })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to import clothing items');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error importing clothing items:', error);
    throw error;
  }
}
