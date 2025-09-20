import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getClothingItemById, 
  createClothingItem, 
  updateClothingItem, 
  addMaterialToClothingItem, 
  updateMaterialInClothingItem,
  removeMaterialFromClothingItem
} from '../services/clothingItemService';

const initialMaterial = {
  name: '',
  quantity: 0,
  unit: 'kg',
  cost: 0
};

function ClothingItemForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(!!id);
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState(null);
  const [newMaterial, setNewMaterial] = useState({ ...initialMaterial });
  
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    description: '',
    category: '',
    sizes: [],
    colors: [],
    materials: [],
    inStock: true,
    stockQuantity: 0
  });
  
  // State for tracking the raw color input string
  const [colorInputValue, setColorInputValue] = useState('');

  // Available sizes and default categories
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  const availableCategories = ['Tops', 'Bottoms', 'Outerwear', 'Full Body', 'Accessories', 'Footwear'];

  // Fetch clothing item data when editing
  useEffect(() => {
    if (isEditing) {
      const fetchClothingItem = async () => {
        try {
          setLoading(true);
          const response = await getClothingItemById(id);
          
          if (response.success && response.data) {
            // Make sure sizes and colors are always arrays
            const data = {
              ...response.data,
              sizes: response.data.sizes || [],
              colors: response.data.colors || [],
              materials: response.data.materials || []
            };
            setFormData(data);
            
            // Set the color input value for editing
            if (data.colors && data.colors.length > 0) {
              setColorInputValue(data.colors.join(', '));
            }
          } else {
            setError('Failed to load clothing item data');
          }
        } catch (err) {
          console.error('Error fetching clothing item:', err);
          setError('Failed to load clothing item. Please try again.');
        } finally {
          setLoading(false);
        }
      };

      fetchClothingItem();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (name === 'price' || name === 'stockQuantity') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSizeToggle = (size) => {
    const sizes = [...formData.sizes];
    
    if (sizes.includes(size)) {
      // Remove size if already selected
      setFormData({
        ...formData,
        sizes: sizes.filter(s => s !== size)
      });
    } else {
      // Add size if not selected
      setFormData({
        ...formData,
        sizes: [...sizes, size]
      });
    }
  };

  const handleColorChange = (e) => {
    const colorInput = e.target.value;
    
    // First, update the raw input state
    setColorInputValue(colorInput);
    
    // Then update the parsed colors array
    if (colorInput) {
      const colorArray = colorInput.split(',').map(color => color.trim()).filter(Boolean);
      setFormData({
        ...formData,
        colors: colorArray
      });
    } else {
      setFormData({
        ...formData,
        colors: []
      });
    }
  };

  const handleMaterialChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'quantity' || name === 'cost') {
      setNewMaterial({
        ...newMaterial,
        [name]: parseFloat(value) || 0
      });
    } else {
      setNewMaterial({
        ...newMaterial,
        [name]: value
      });
    }
  };

  const handleAddMaterial = async () => {
    // Validate material input
    if (!newMaterial.name || newMaterial.quantity <= 0 || !newMaterial.unit || newMaterial.cost < 0) {
      alert('Please fill in all material fields correctly');
      return;
    }

    if (isEditing) {
      try {
        const response = await addMaterialToClothingItem(id, newMaterial);
        if (response.success && response.data) {
          setFormData({
            ...formData,
            materials: response.data.materials
          });
          setNewMaterial({ ...initialMaterial });
        }
      } catch (err) {
        console.error('Error adding material:', err);
        alert('Failed to add material. Please try again.');
      }
    } else {
      // For new items, just update the local state
      setFormData({
        ...formData,
        materials: [...formData.materials, newMaterial]
      });
      setNewMaterial({ ...initialMaterial });
    }
  };

  const handleRemoveMaterial = async (index, materialId) => {
    if (isEditing && materialId) {
      try {
        const response = await removeMaterialFromClothingItem(id, materialId);
        if (response.success && response.data) {
          setFormData({
            ...formData,
            materials: response.data.materials
          });
        }
      } catch (err) {
        console.error('Error removing material:', err);
        alert('Failed to remove material. Please try again.');
      }
    } else {
      // For new items, just update the local state
      const updatedMaterials = [...formData.materials];
      updatedMaterials.splice(index, 1);
      setFormData({
        ...formData,
        materials: updatedMaterials
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Do one final parse of colors to ensure we have the latest
      const finalColors = colorInputValue
        ? colorInputValue.split(',').map(color => color.trim()).filter(Boolean)
        : formData.colors;
      
      // Prepare the data
      const clothingItemData = {
        ...formData,
        colors: finalColors
      };
      
      let response;
      if (isEditing) {
        // Update existing clothing item
        response = await updateClothingItem(id, clothingItemData);
      } else {
        // Create new clothing item
        response = await createClothingItem(clothingItemData);
      }
      
      if (response.success) {
        navigate('/clothing-items');
      } else {
        setError(response.message || 'An error occurred');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error saving clothing item:', err);
      setError('Failed to save clothing item. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {isEditing ? 'Edit' : 'Add'} Clothing Item
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? 'Update the details of this clothing item' : 'Add a new clothing item to your inventory'}
          </p>
        </div>
        <button
          onClick={() => navigate('/clothing-items')}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Clothing Items
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="bg-white shadow-lg rounded-lg border border-gray-100 overflow-hidden mb-6">
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
              <h2 className="text-xl font-semibold text-blue-800">Basic Information</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="name">
                    Name *
                  </label>
                  <input
                    className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., T-Shirt"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="price">
                    Price *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      className="pl-8 shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="description">
                    Description
                  </label>
                  <textarea
                    className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                    id="description"
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the clothing item..."
                  ></textarea>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="category">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="">Select a category</option>
                      {availableCategories.map((category, index) => (
                        <option key={index} value={category}>{category}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Stock Information */}
                <div>
                  <div className="flex items-center mb-2">
                    <label className="text-gray-700 text-sm font-medium mr-4" htmlFor="inStock">
                      In Stock
                    </label>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input
                        type="checkbox"
                        id="inStock"
                        name="inStock"
                        checked={formData.inStock}
                        onChange={handleChange}
                        className="checked:bg-blue-500 outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      />
                      <label htmlFor="inStock" className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                    </div>
                  </div>

                  <div className={formData.inStock ? '' : 'opacity-50'}>
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="stockQuantity">
                      Stock Quantity
                    </label>
                    <input
                      className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                      id="stockQuantity"
                      name="stockQuantity"
                      type="number"
                      min="0"
                      value={formData.stockQuantity}
                      onChange={handleChange}
                      disabled={!formData.inStock}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg border border-gray-100 overflow-hidden mb-6">
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
              <h2 className="text-xl font-semibold text-blue-800">Attributes</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sizes */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Sizes
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => (
                      <button
                        type="button"
                        key={size}
                        className={`px-3 py-2 text-sm rounded-md transition-colors ${
                          formData.sizes.includes(size)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => handleSizeToggle(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Click to select multiple sizes</p>
                </div>

                {/* Colors */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="colors">
                    Colors
                  </label>
                  <input
                    className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                    id="colors"
                    type="text"
                    value={colorInputValue}
                    onChange={handleColorChange}
                    placeholder="Red, Blue, Black (comma separated)"
                  />
                  {formData.colors.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.colors.map((color, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {color}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg border border-gray-100 overflow-hidden mb-6">
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-blue-800">Materials</h2>
              <span className="text-sm text-blue-600">{formData.materials.length} materials</span>
            </div>
            
            <div className="p-6">
              {/* Existing Materials */}
              {formData.materials.length > 0 ? (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-2">Current Materials:</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost ($)</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formData.materials.map((material, index) => (
                          <tr key={material._id || index}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{material.name}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{material.quantity}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{material.unit}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">${material.cost.toFixed(2)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              <button
                                type="button"
                                onClick={() => handleRemoveMaterial(index, material._id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="mb-6 bg-gray-50 p-4 rounded-md text-center text-gray-500">
                  No materials added yet
                </div>
              )}

              {/* Add New Material */}
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-700 mb-3">Add Material:</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="materialName">
                      Material Name
                    </label>
                    <input
                      className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                      id="materialName"
                      name="name"
                      type="text"
                      value={newMaterial.name}
                      onChange={handleMaterialChange}
                      placeholder="e.g., Cotton"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="materialQuantity">
                      Quantity
                    </label>
                    <input
                      className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                      id="materialQuantity"
                      name="quantity"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={newMaterial.quantity}
                      onChange={handleMaterialChange}
                      placeholder="0.5"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="materialUnit">
                      Unit
                    </label>
                    <select
                      className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                      id="materialUnit"
                      name="unit"
                      value={newMaterial.unit}
                      onChange={handleMaterialChange}
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="m">m</option>
                      <option value="cm">cm</option>
                      <option value="piece">piece</option>
                      <option value="pieces">pieces</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="materialCost">
                      Cost ($)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        className="pl-8 shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                        id="materialCost"
                        name="cost"
                        type="number"
                        min="0"
                        step="0.01"
                        value={newMaterial.cost}
                        onChange={handleMaterialChange}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddMaterial}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Material
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate('/clothing-items')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition duration-200 flex items-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {isEditing ? 'Update' : 'Create'} Clothing Item
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default ClothingItemForm;
