'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';
import ProtectedRoute from '@/components/ProtectedRoute';
import PermissionGate from '@/components/PermissionGate';
import { Plus, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { Transaction, Product } from '@/lib/types';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    type: 'in' as 'in' | 'out' | 'adjustment',
    quantity: 0,
    reason: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTransactions(storage.get<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []));
    setProducts(storage.get<Product[]>(STORAGE_KEYS.PRODUCTS, []));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTransaction: Transaction = {
      ...formData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      userId: 'admin',
    };
    
    // Update product quantity
    const updatedProducts = products.map(p => {
      if (p.id === formData.productId) {
        let newQuantity = p.quantity;
        if (formData.type === 'in') {
          newQuantity += formData.quantity;
        } else if (formData.type === 'out') {
          newQuantity -= formData.quantity;
        } else {
          newQuantity = formData.quantity;
        }
        return { ...p, quantity: Math.max(0, newQuantity), updatedAt: new Date().toISOString() };
      }
      return p;
    });
    
    const updatedTransactions = [newTransaction, ...transactions];
    
    storage.set(STORAGE_KEYS.TRANSACTIONS, updatedTransactions);
    storage.set(STORAGE_KEYS.PRODUCTS, updatedProducts);
    
    setTransactions(updatedTransactions);
    setProducts(updatedProducts);
    closeModal();
  };

  const openModal = () => {
    setFormData({
      productId: products[0]?.id || '',
      type: 'in',
      quantity: 0,
      reason: '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <TrendingUp className="text-green-600" size={20} />;
      case 'out':
        return <TrendingDown className="text-red-600" size={20} />;
      case 'adjustment':
        return <RefreshCw className="text-blue-600" size={20} />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'in':
        return 'text-green-600 bg-green-50';
      case 'out':
        return 'text-red-600 bg-red-50';
      case 'adjustment':
        return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <ProtectedRoute resource="transactions" action="read">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold">Transactions</h1>
              <PermissionGate resource="transactions" action="create">
                <button onClick={openModal} className="btn btn-primary flex items-center gap-2">
                  <Plus size={20} />
                  New Transaction
                </button>
              </PermissionGate>
            </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-border">
                  {transactions.map((transaction) => {
                    const product = products.find(p => p.id === transaction.productId);
                    return (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div>{new Date(transaction.timestamp).toLocaleDateString()}</div>
                          <div className="text-muted-foreground">
                            {new Date(transaction.timestamp).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium">{product?.name || 'Unknown'}</div>
                          <div className="text-sm text-muted-foreground">{product?.sku}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`flex items-center gap-2 px-2 py-1 text-xs font-medium rounded w-fit ${getTransactionColor(transaction.type)}`}>
                            {getTransactionIcon(transaction.type)}
                            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {transaction.type === 'in' ? '+' : transaction.type === 'out' ? '-' : '±'}
                          {transaction.quantity}
                        </td>
                        <td className="px-6 py-4 text-sm">{transaction.reason}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{transaction.userId}</td>
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
        title="New Transaction"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Product</label>
            <select
              className="input"
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              required
            >
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} (Current: {product.quantity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Transaction Type</label>
            <select
              className="input"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              required
            >
              <option value="in">Stock In (Receive)</option>
              <option value="out">Stock Out (Sale/Use)</option>
              <option value="adjustment">Adjustment (Set Quantity)</option>
            </select>
          </div>

          <div>
            <label className="label">Quantity</label>
            <input
              type="number"
              className="input"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              required
              min="1"
            />
            <p className="text-sm text-muted-foreground mt-1">
              {formData.type === 'adjustment' 
                ? 'Final quantity after adjustment' 
                : `Quantity to ${formData.type === 'in' ? 'add' : 'remove'}`}
            </p>
          </div>

          <div>
            <label className="label">Reason</label>
            <textarea
              className="input"
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="E.g., Purchase order #1234, Sale, Damaged goods, etc."
              required
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button type="button" onClick={closeModal} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Transaction
            </button>
          </div>
        </form>
      </Modal>
    </ProtectedRoute>
  );
}
