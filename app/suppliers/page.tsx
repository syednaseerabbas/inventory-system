'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';
import ProtectedRoute from '@/components/ProtectedRoute';
import PermissionGate from '@/components/PermissionGate';
import { Plus, Edit, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { Supplier } from '@/lib/types';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    setSuppliers(storage.get<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSupplier) {
      const updatedSuppliers = suppliers.map(s =>
        s.id === editingSupplier.id
          ? { ...formData, id: s.id, createdAt: s.createdAt }
          : s
      );
      storage.set(STORAGE_KEYS.SUPPLIERS, updatedSuppliers);
      setSuppliers(updatedSuppliers);
    } else {
      const newSupplier: Supplier = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      const updatedSuppliers = [...suppliers, newSupplier];
      storage.set(STORAGE_KEYS.SUPPLIERS, updatedSuppliers);
      setSuppliers(updatedSuppliers);
    }
    
    closeModal();
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      const updatedSuppliers = suppliers.filter(s => s.id !== id);
      storage.set(STORAGE_KEYS.SUPPLIERS, updatedSuppliers);
      setSuppliers(updatedSuppliers);
    }
  };

  const openModal = () => {
    setEditingSupplier(null);
    setFormData({ name: '', email: '', phone: '', address: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  return (
    <ProtectedRoute resource="suppliers" action="read">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold">Suppliers</h1>
              <PermissionGate resource="suppliers" action="create">
                <button onClick={openModal} className="btn btn-primary flex items-center gap-2">
                  <Plus size={20} />
                  Add Supplier
                </button>
              </PermissionGate>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map((supplier) => (
              <div key={supplier.id} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold">{supplier.name}</h3>
                  <div className="flex gap-2">
                    <PermissionGate resource="suppliers" action="update">
                      <button
                        onClick={() => handleEdit(supplier)}
                        className="p-1 hover:bg-blue-50 rounded text-blue-600"
                      >
                        <Edit size={18} />
                      </button>
                    </PermissionGate>
                    <PermissionGate resource="suppliers" action="delete">
                      <button
                        onClick={() => handleDelete(supplier.id)}
                        className="p-1 hover:bg-red-50 rounded text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </PermissionGate>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <Mail size={16} className="text-muted-foreground mt-0.5" />
                    <span>{supplier.email}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Phone size={16} className="text-muted-foreground mt-0.5" />
                    <span>{supplier.phone}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin size={16} className="text-muted-foreground mt-0.5" />
                    <span>{supplier.address}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>

    <Modal
      isOpen={isModalOpen}
      onClose={closeModal}
      title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
    >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Supplier Name</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Phone</label>
            <input
              type="tel"
              className="input"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Address</label>
            <textarea
              className="input"
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button type="button" onClick={closeModal} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingSupplier ? 'Update Supplier' : 'Add Supplier'}
            </button>
          </div>
        </form>
      </Modal>
    </ProtectedRoute>
  );
}
