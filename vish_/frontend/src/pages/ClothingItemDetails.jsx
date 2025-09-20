import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClothingItemById } from '../services/clothingItemService';

function ClothingItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clothingItem, setClothingItem] = useState(null);
  const [materialTotalCost, setMaterialTotalCost] = useState(0);

  useEffect(() => {
    const fetchClothingItem = async () => {
      try {
        setLoading(true);
        const response = await getClothingItemById(id);
        
        if (response.success && response.data) {
          setClothingItem(response.data);
          
          // Calculate total material cost
          if (response.data.materials && response.data.materials.length > 0) {
            const totalCost = response.data.materials.reduce(
              (sum, material) => sum + (material.quantity * material.cost || 0), 
              0
            );
            setMaterialTotalCost(totalCost);
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
  }, [id]);

  const handleEdit = () => {
    navigate(`/clothing-items/edit/${id}`);
  };

  const handleBack = () => {
    navigate('/clothing-items');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !clothingItem) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{error || 'Item not found'}</p>
          </div>
        </div>
        <button
          onClick={handleBack}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Clothing Items
        </button>
      </div>
    );
  }

  const profit = clothingItem.price - materialTotalCost;
  const profitMargin = clothingItem.price > 0 ? (profit / clothingItem.price) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{clothingItem.name}</h1>
          <p className="text-gray-600 mt-1">
            {clothingItem.category ? clothingItem.category : 'Uncategorized'} · Item ID: {clothingItem._id}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleBack}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </button>
          <button
            onClick={handleEdit}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow-lg rounded-lg border border-gray-100 overflow-hidden">
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
              <h2 className="text-xl font-semibold text-blue-800">Basic Information</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="mt-1 text-gray-900">
                    {clothingItem.description || 'No description available'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Price</h3>
                  <p className="mt-1 text-xl font-semibold text-green-600">${clothingItem.price.toFixed(2)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Stock Status</h3>
                  <div className="mt-1 flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      clothingItem.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {clothingItem.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                    {clothingItem.inStock && (
                      <span className="ml-2 text-gray-700">
                        {clothingItem.stockQuantity} available
                      </span>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Category</h3>
                  <p className="mt-1 text-gray-900">
                    {clothingItem.category || 'Uncategorized'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Attributes */}
          <div className="bg-white shadow-lg rounded-lg border border-gray-100 overflow-hidden">
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
              <h2 className="text-xl font-semibold text-blue-800">Attributes</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Sizes</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {clothingItem.sizes && clothingItem.sizes.length > 0 ? (
                      clothingItem.sizes.map((size, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                          {size}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No sizes specified</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Colors</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {clothingItem.colors && clothingItem.colors.length > 0 ? (
                      clothingItem.colors.map((color, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                          {color}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No colors specified</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Materials */}
          <div className="bg-white shadow-lg rounded-lg border border-gray-100 overflow-hidden">
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-blue-800">Materials</h2>
              <span className="text-sm text-blue-600">
                {clothingItem.materials ? clothingItem.materials.length : 0} materials
              </span>
            </div>
            
            <div className="p-6">
              {clothingItem.materials && clothingItem.materials.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {clothingItem.materials.map((material, index) => {
                        const totalMaterialCost = material.quantity * material.cost || 0;
                        return (
                          <tr key={material._id || index}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{material.name}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{material.quantity}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{material.unit}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">${material.cost.toFixed(2)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">${totalMaterialCost.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                      <tr className="bg-gray-50">
                        <td colSpan="4" className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">Total Materials Cost:</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">${materialTotalCost.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-md text-center text-gray-500">
                  No materials added
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cost Analysis */}
        <div className="space-y-6">
          <div className="bg-white shadow-lg rounded-lg border border-gray-100 overflow-hidden">
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
              <h2 className="text-xl font-semibold text-blue-800">Cost Analysis</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Selling Price</h3>
                <p className="mt-1 text-2xl font-bold text-gray-900">${clothingItem.price.toFixed(2)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Material Cost</h3>
                <p className="mt-1 text-2xl font-bold text-red-600">-${materialTotalCost.toFixed(2)}</p>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500">Profit (Before other expenses)</h3>
                <p className={`mt-1 text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${profit.toFixed(2)}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Profit margin: {profitMargin.toFixed(2)}%
                </p>
              </div>
              
              <div className="pt-4 text-sm text-gray-500">
                <p>Note: This calculation only includes material costs. Labor, overhead, shipping, and other expenses are not included.</p>
              </div>
            </div>
          </div>

          {/* Created/Updated Info */}
          <div className="bg-white shadow-lg rounded-lg border border-gray-100 overflow-hidden">
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
              <h2 className="text-xl font-semibold text-blue-800">Record Information</h2>
            </div>
            
            <div className="p-6 space-y-4">
              {clothingItem.createdAt && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created</h3>
                  <p className="mt-1 text-gray-900">
                    {new Date(clothingItem.createdAt).toLocaleString()}
                  </p>
                </div>
              )}
              
              {clothingItem.updatedAt && clothingItem.updatedAt !== clothingItem.createdAt && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                  <p className="mt-1 text-gray-900">
                    {new Date(clothingItem.updatedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClothingItemDetails;
