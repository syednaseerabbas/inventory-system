'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { Product, Transaction } from '@/lib/types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AnalyticsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    setProducts(storage.get<Product[]>(STORAGE_KEYS.PRODUCTS, []));
    setTransactions(storage.get<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []));
  }, []);

  const categoryData = products.reduce((acc, product) => {
    const existing = acc.find(item => item.name === product.category);

    if (existing) {
      existing.value += 1;
      existing.totalValue += product.quantity * product.unitPrice;
    } else {
      acc.push({
        name: product.category,
        value: 1,
        totalValue: product.quantity * product.unitPrice,
      });
    }

    return acc;
  }, [] as Array<{ name: string; value: number; totalValue: number }>);

  const stockData = [...products] // avoid mutating state
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, 10)
    .map(p => ({
      name: p.name,
      quantity: p.quantity,
      reorderLevel: p.reorderLevel,
    }));

  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const transactionTrends = transactions
    .filter(t => new Date(t.timestamp) >= last30Days)
    .reduce((acc, transaction) => {
      const date = new Date(transaction.timestamp).toLocaleDateString();
      const existing = acc.find(item => item.date === date);

      if (existing) {
        if (transaction.type === 'in') existing.stockIn += transaction.quantity;
        if (transaction.type === 'out') existing.stockOut += transaction.quantity;
      } else {
        acc.push({
          date,
          stockIn: transaction.type === 'in' ? transaction.quantity : 0,
          stockOut: transaction.type === 'out' ? transaction.quantity : 0,
        });
      }

      return acc;
    }, [] as Array<{ date: string; stockIn: number; stockOut: number }>)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const topProductsByValue = products
    .map(p => ({
      name: p.name,
      value: p.quantity * p.unitPrice,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return (
    <ProtectedRoute resource="analytics" action="read">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Analytics</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-4">Inventory by Category</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-4">Category Value Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="totalValue" fill="#3b82f6" name="Total Value ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Stock Levels (Lowest 10 Products)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stockData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantity" fill="#10b981" name="Current Stock" />
                  <Bar dataKey="reorderLevel" fill="#ef4444" name="Reorder Level" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Transaction Trends (Last 30 Days)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={transactionTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="stockIn" stroke="#10b981" strokeWidth={2} name="Stock In" />
                  <Line type="monotone" dataKey="stockOut" stroke="#ef4444" strokeWidth={2} name="Stock Out" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Top Products by Value</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProductsByValue} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                  <Bar dataKey="value" fill="#8b5cf6" name="Inventory Value ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
