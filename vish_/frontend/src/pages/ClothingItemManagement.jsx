import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllClothingItems, deleteClothingItem } from '../services/clothingItemService';
import { migrateClothingData } from '../utils/migrateClothingData';

function ClothingItemManagement() {
  const [clothingItems, setClothingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [migrationStatus, setMigrationStatus] = useState(null);

  // Categories derived from clothing items
  const categories = [...new Set(clothingItems.map(item => item.category).filter(Boolean))];

  useEffect(() => {
    const fetchClothingItems = async () => {
      try {
        setLoading(true);
        const response = await getAllClothingItems();
        
        if (response.data && Array.isArray(response.data)) {
          setClothingItems(response.data);
        } else {
          setError('Received invalid data format');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching clothing items:', err);
        setError('Failed to load clothing items. Please try again.');
        setLoading(false);
      }
    };

    fetchClothingItems();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this clothing item?')) {
      return;
    }

    try {
      await deleteClothingItem(id);
      setClothingItems(clothingItems.filter(item => item._id !== id));
    } catch (err) {
      console.error('Error deleting clothing item:', err);
      alert('Failed to delete clothing item. Please try again.');
    }
  };

  const handleMigrateData = async () => {
    try {
      setLoading(true);
      const result = await migrateClothingData();
      setMigrationStatus({
        success: true,
        message: result.message || 'Data migrated successfully'
      });
      
      // Refresh the clothing items
      const response = await getAllClothingItems();
      if (response.data && Array.isArray(response.data)) {
        setClothingItems(response.data);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error migrating data:', err);
      setMigrationStatus({
        success: false,
        message: 'Failed to migrate data. Please try again.'
      });
      setLoading(false);
    }
  };

  // Filter clothing items based on search query and category
  const filteredClothingItems = clothingItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Clothing Item Management
          </h1>
          <p className="text-gray-600">
            Manage your warehouse clothing inventory
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
          <Link
            to="/clothing-items/create"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Item
          </Link>
          
          {clothingItems.length === 0 && !loading && (
            <button
              onClick={handleMigrateData}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Import Initial Data
            </button>
          )}
        </div>
      </div>

      {migrationStatus && (
        <div className={`mb-6 p-4 rounded-lg ${migrationStatus.success ? 'bg-green-100 border border-green-300 text-green-700' : 'bg-red-100 border border-red-300 text-red-700'}`}>
          <div className="flex items-center">
            {migrationStatus.success ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            <p>{migrationStatus.message}</p>
          </div>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex-grow">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search clothing items..."
              className="pl-10 py-2 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="min-w-[200px]">
          <select
            className="py-2 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{error}</p>
          </div>
        </div>
      ) : filteredClothingItems.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-yellow-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Clothing Items Found</h3>
          <p className="text-gray-600 mb-4">
            {clothingItems.length === 0
              ? "You haven't added any clothing items yet."
              : "No items match your search criteria."}
          </p>
          {clothingItems.length === 0 && (
            <div className="flex justify-center">
              <Link
                to="/clothing-items/create"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                Add Your First Item
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sizes</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Materials</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredClothingItems.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        {item.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    {item.category ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {item.category}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">None</span>
                    )}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${item.price.toFixed(2)}</div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {item.sizes && item.sizes.length > 0 ? (
                        item.sizes.map((size, index) => (
                          <span key={index} className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">
                            {size}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs">None</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {item.inStock ? (
                        <>
                          <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                          <span className="text-sm">{item.stockQuantity || 0}</span>
                        </>
                      ) : (
                        <>
                          <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                          <span className="text-sm">Out of stock</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.materials && item.materials.length > 0 ? (
                        <span>{item.materials.length} materials</span>
                      ) : (
                        <span className="text-gray-400 text-xs">None</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        to={`/clothing-items/${item._id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View
                      </Link>
                      <Link
                        to={`/clothing-items/edit/${item._id}`}
                        className="text-green-600 hover:text-green-800"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ClothingItemManagement;
