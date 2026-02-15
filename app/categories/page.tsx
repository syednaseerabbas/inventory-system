'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';
import ProtectedRoute from '@/components/ProtectedRoute';
import PermissionGate from '@/components/PermissionGate';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { Category, Product } from '@/lib/types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    setCategories(storage.get<Category[]>(STORAGE_KEYS.CATEGORIES, []));
    setProducts(storage.get<Product[]>(STORAGE_KEYS.PRODUCTS, []));
  }, []);

  const getCategoryProductCount = (categoryName: string) => {
    return products.filter(p => p.category === categoryName).length;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCategory) {
      const updatedCategories = categories.map(c =>
        c.id === editingCategory.id
          ? { ...c, ...formData }
          : c
      );
      storage.set(STORAGE_KEYS.CATEGORIES, updatedCategories);
      setCategories(updatedCategories);
    } else {
      const newCategory: Category = {
        ...formData,
        id: Date.now().toString(),
      };
      const updatedCategories = [...categories, newCategory];
      storage.set(STORAGE_KEYS.CATEGORIES, updatedCategories);
      setCategories(updatedCategories);
    }

    closeModal();
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    const productCount = getCategoryProductCount(name);

    if (productCount > 0) {
      alert(`Cannot delete category "${name}" because it has ${productCount} product(s) assigned to it.`);
      return;
    }

    if (confirm('Are you sure you want to delete this category?')) {
      const updatedCategories = categories.filter(c => c.id !== id);
      storage.set(STORAGE_KEYS.CATEGORIES, updatedCategories);
      setCategories(updatedCategories);
    }
  };

  const openModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  return (
    <ProtectedRoute resource="categories" action="read">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold">Categories</h1>

              <PermissionGate resource="categories" action="create">
                <button onClick={openModal} className="btn btn-primary flex items-center gap-2">
                  <Plus size={20} />
                  Add Category
                </button>
              </PermissionGate>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => {
                const productCount = getCategoryProductCount(category.name);

                return (
                  <div key={category.id} className="card p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Tag className="text-primary" size={24} />
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {productCount} products
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <PermissionGate resource="categories" action="update">
                          <button
                            onClick={() => handleEdit(category)}
                            className="p-1 hover:bg-blue-50 rounded text-blue-600"
                          >
                            <Edit size={18} />
                          </button>
                        </PermissionGate>

                        <PermissionGate resource="categories" action="delete">
                          <button
                            onClick={() => handleDelete(category.id, category.name)}
                            className="p-1 hover:bg-red-50 rounded text-red-600"
                            disabled={productCount > 0}
                          >
                            <Trash2 size={18} />
                          </button>
                        </PermissionGate>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Category Name</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button type="button" onClick={closeModal} className="btn btn-secondary">
              Cancel
            </button>

            <button type="submit" className="btn btn-primary">
              {editingCategory ? 'Update Category' : 'Add Category'}
            </button>
          </div>
        </form>
      </Modal>
    </ProtectedRoute>
  );
}
