import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
// import { products, getProductsByCategory } from '../data/products';
import { Filter } from 'lucide-react';
import { Product } from '../types';

const categories = [
  'All',
  'Barbells',
  'Kettlebells',
  'Dumbbells',
  'Sets',
  'Accessories',
  'Balls'
];

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'All');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('MEDUSA URL:', import.meta.env.VITE_MEDUSA_BACKEND_URL);
        const res = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/store/products`, {
          headers: {
            'x-publishable-api-key': import.meta.env.VITE_MEDUSA_PUBLIC_API_KEY
          }
        });
        const data = await res.json();
        // Map Medusa products to local Product type
        const mappedProducts: Product[] = data.products.map((p: any) => ({
          id: p.id,
          name: p.title,
          description: p.description || '',
          price: p.variants && p.variants.length > 0 && p.variants[0].prices && p.variants[0].prices.length > 0 ? p.variants[0].prices[0].amount / 100 : 0,
          images: p.images && p.images.length > 0 ? p.images.map((img: any) => img.url) : [],
          colors: [], // Medusa default products don't have colors; you can enhance this if you use options
          category: p.collection?.title || 'Uncategorized',
          featured: false, // You can set this based on a tag or custom field if needed
          ageRange: '', // Medusa doesn't have this by default
          weight: p.weight ? `${p.weight}g` : undefined,
          dimensions: p.length && p.width && p.height ? `${p.length}x${p.width}x${p.height}` : undefined,
        }));
        setProducts(mappedProducts);
        setFilteredProducts(mappedProducts);
      } catch (err) {
        setError('Failed to load products.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === selectedCategory));
    }
  }, [selectedCategory, products]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Our Products</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Safe, fun, and colorful workout equipment designed specifically for kids.
          </p>
        </div>
        {/* Mobile filter button */}
        <div className="md:hidden mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
          >
            <Filter className="h-5 w-5 mr-2" />
            <span>Filters</span>
          </button>
        </div>
        <div className="flex flex-col md:flex-row">
          {/* Sidebar filters */}
          <div className={`md:w-64 md:block ${showFilters ? 'block' : 'hidden'}`}> 
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h3 className="font-medium text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category} className="flex items-center">
                    <button
                      onClick={() => handleCategoryChange(category)}
                      className={`text-left w-full py-1 px-2 rounded ${
                        selectedCategory === category
                          ? 'bg-sky-100 text-sky-800 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {category}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-medium text-gray-900 mb-4">Age Range</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="age-3-6"
                    name="age-range"
                    type="checkbox"
                    className="h-4 w-4 text-sky-600 border-gray-300 rounded"
                  />
                  <label htmlFor="age-3-6" className="ml-2 text-gray-600">
                    3-6 years
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="age-7-10"
                    name="age-range"
                    type="checkbox"
                    className="h-4 w-4 text-sky-600 border-gray-300 rounded"
                  />
                  <label htmlFor="age-7-10" className="ml-2 text-gray-600">
                    7-10 years
                  </label>
                </div>
              </div>
            </div>
          </div>
          {/* Product grid */}
          <div className="md:flex-1 md:ml-8">
            {loading ? (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <p className="text-gray-600">Loading products...</p>
              </div>
            ) : error ? (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <p className="text-red-600">{error}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <p className="text-gray-600">No products found in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;