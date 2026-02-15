'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';
import ProtectedRoute from '@/components/ProtectedRoute';
import PermissionGate from '@/components/PermissionGate';
import { Plus, Search, Edit, Trash2, AlertCircle } from 'lucide-react';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { Product, Supplier, Category } from '@/lib/types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    quantity: 0,
    reorderLevel: 0,
    unitPrice: 0,
    supplierId: '',
    description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProducts(storage.get<Product[]>(STORAGE_KEYS.PRODUCTS, []));
    setSuppliers(storage.get<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []));
    setCategories(storage.get<Category[]>(STORAGE_KEYS.CATEGORIES, []));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const now = new Date().toISOString();
    
    if (editingProduct) {
      const updatedProducts = products.map(p =>
        p.id === editingProduct.id
          ? { ...formData, id: p.id, createdAt: p.createdAt, updatedAt: now }
          : p
      );
      storage.set(STORAGE_KEYS.PRODUCTS, updatedProducts);
      setProducts(updatedProducts);
    } else {
      const newProduct: Product = {
        ...formData,
        id: Date.now().toString(),
        createdAt: now,
        updatedAt: now,
      };
      const updatedProducts = [...products, newProduct];
      storage.set(STORAGE_KEYS.PRODUCTS, updatedProducts);
      setProducts(updatedProducts);
    }
    
    closeModal();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      quantity: product.quantity,
      reorderLevel: product.reorderLevel,
      unitPrice: product.unitPrice,
      supplierId: product.supplierId,
      description: product.description,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const updatedProducts = products.filter(p => p.id !== id);
      storage.set(STORAGE_KEYS.PRODUCTS, updatedProducts);
      setProducts(updatedProducts);
    }
  };

  const openModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: '',
      category: categories[0]?.name || '',
      quantity: 0,
      reorderLevel: 0,
      unitPrice: 0,
      supplierId: suppliers[0]?.id || '',
      description: '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute resource="products" action="read">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold">Products</h1>
              <PermissionGate resource="products" action="create">
                <button onClick={openModal} className="btn btn-primary flex items-center gap-2">
                  <Plus size={20} />
                  Add Product
                </button>
              </PermissionGate>
            </div>

            <div className="card p-6 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search products by name, SKU, or category..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-border">
                  {filteredProducts.map((product) => {
                    const isLowStock = product.quantity <= product.reorderLevel;
                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">{product.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{product.sku}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{product.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">${product.unitPrice.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isLowStock ? (
                            <span className="flex items-center gap-1 text-red-600 text-sm">
                              <AlertCircle size={16} />
                              Low Stock
                            </span>
                          ) : (
                            <span className="text-green-600 text-sm">In Stock</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <PermissionGate resource="products" action="update">
                              <button
                                onClick={() => handleEdit(product)}
                                className="p-1 hover:bg-blue-50 rounded text-blue-600"
                              >
                                <Edit size={18} />
                              </button>
                            </PermissionGate>
                            <PermissionGate resource="products" action="delete">
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="p-1 hover:bg-red-50 rounded text-red-600"
                              >
                                <Trash2 size={18} />
                              </button>
                            </PermissionGate>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>

    <Modal
      isOpen={isModalOpen}
      onClose={closeModal}
      title={editingProduct ? 'Edit Product' : 'Add New Product'}
    >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Product Name</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">SKU</label>
              <input
                type="text"
                className="input"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Category</label>
              <select
                className="input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Quantity</label>
              <input
                type="number"
                className="input"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                required
                min="0"
              />
            </div>
            <div>
              <label className="label">Reorder Level</label>
              <input
                type="number"
                className="input"
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) })}
                required
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Unit Price ($)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
                required
                min="0"
              />
            </div>
            <div>
              <label className="label">Supplier</label>
              <select
                className="input"
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                required
              >
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button type="button" onClick={closeModal} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingProduct ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </Modal>
    </ProtectedRoute>
  );
}
