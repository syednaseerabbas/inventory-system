'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import StatCard from '@/components/StatCard';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Package, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { Product, Transaction } from '@/lib/types';
import { generateSampleData } from '@/lib/sampleData';

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize with sample data if none exists
    let storedProducts = storage.get<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    let storedTransactions = storage.get<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);

    if (storedProducts.length === 0) {
      const sampleData = generateSampleData();
      storage.set(STORAGE_KEYS.PRODUCTS, sampleData.products);
      storage.set(STORAGE_KEYS.SUPPLIERS, sampleData.suppliers);
      storage.set(STORAGE_KEYS.CATEGORIES, sampleData.categories);
      storage.set(STORAGE_KEYS.TRANSACTIONS, sampleData.transactions);
      
      storedProducts = sampleData.products;
      storedTransactions = sampleData.transactions;
    }

    setProducts(storedProducts);
    setTransactions(storedTransactions);
    setIsLoading(false);
  }, []);

  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.quantity <= p.reorderLevel).length;
  const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0);
  const recentTransactions = transactions.filter(t => {
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return new Date(t.timestamp).getTime() > dayAgo;
  }).length;

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex">
          <Sidebar />
          <div className="flex-1 p-8">
            <div className="animate-pulse">Loading...</div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Products"
                value={totalProducts}
                icon={Package}
                change="+12% from last month"
                changeType="positive"
              />
              <StatCard
                title="Low Stock Items"
                value={lowStockProducts}
                icon={AlertTriangle}
                change={lowStockProducts > 0 ? "Needs attention" : "All good"}
                changeType={lowStockProducts > 0 ? "negative" : "positive"}
              />
              <StatCard
                title="Total Inventory Value"
                value={`$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={DollarSign}
                change="+8% from last month"
                changeType="positive"
              />
              <StatCard
                title="Transactions (24h)"
                value={recentTransactions}
                icon={TrendingUp}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-4">Low Stock Alerts</h2>
                {lowStockProducts === 0 ? (
                  <p className="text-muted-foreground">No low stock items at the moment.</p>
                ) : (
                  <div className="space-y-3">
                    {products
                      .filter(p => p.quantity <= p.reorderLevel)
                      .map(product => (
                        <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-red-600">{product.quantity} units</p>
                            <p className="text-xs text-muted-foreground">Reorder at {product.reorderLevel}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
                {transactions.length === 0 ? (
                  <p className="text-muted-foreground">No recent transactions.</p>
                ) : (
                  <div className="space-y-3">
                    {transactions
                      .slice()
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .slice(0, 5)
                      .map(transaction => {
                        const product = products.find(p => p.id === transaction.productId);
                        return (
                          <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{product?.name || 'Unknown Product'}</p>
                              <p className="text-sm text-muted-foreground">{transaction.reason}</p>
                            </div>
                            <div className="text-right">
                              <p className={`font-semibold ${
                                transaction.type === 'in' ? 'text-green-600' : 
                                transaction.type === 'out' ? 'text-red-600' : 
                                'text-blue-600'
                              }`}>
                                {transaction.type === 'in' ? '+' : transaction.type === 'out' ? '-' : '±'}
                                {transaction.quantity}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(transaction.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
