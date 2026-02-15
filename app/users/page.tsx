'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Plus, Edit, Trash2, Shield, Mail, Calendar } from 'lucide-react';
import { storage } from '@/lib/storage';
import { User, USERS_STORAGE_KEY, StoredCredentials, simpleHash } from '@/lib/auth';
import { useAuth } from '@/lib/AuthContext';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'viewer' as User['role'],
  });
  const { user: currentUser } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers(storage.get<User[]>(USERS_STORAGE_KEY, []));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      // Update existing user
      const updatedUsers = users.map(u =>
        u.id === editingUser.id
          ? { ...u, username: formData.username, email: formData.email, role: formData.role }
          : u
      );
      storage.set(USERS_STORAGE_KEY, updatedUsers);
      
      // Update credentials if password changed
      if (formData.password) {
        const credentials = storage.get<StoredCredentials>('inventory_credentials', {});
        credentials[formData.username] = {
          passwordHash: simpleHash(formData.password),
          userId: editingUser.id,
        };
        storage.set('inventory_credentials', credentials);
      }
      
      setUsers(updatedUsers);
    } else {
      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        username: formData.username,
        email: formData.email,
        role: formData.role,
        createdAt: new Date().toISOString(),
      };
      
      const updatedUsers = [...users, newUser];
      storage.set(USERS_STORAGE_KEY, updatedUsers);
      
      // Store credentials
      const credentials = storage.get<StoredCredentials>('inventory_credentials', {});
      credentials[formData.username] = {
        passwordHash: simpleHash(formData.password),
        userId: newUser.id,
      };
      storage.set('inventory_credentials', credentials);
      
      setUsers(updatedUsers);
    }
    
    closeModal();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const userToDelete = users.find(u => u.id === id);
    if (!userToDelete) return;
    
    // Prevent deleting yourself
    if (userToDelete.id === currentUser?.id) {
      alert('You cannot delete your own account');
      return;
    }
    
    if (confirm(`Are you sure you want to delete user "${userToDelete.username}"?`)) {
      const updatedUsers = users.filter(u => u.id !== id);
      storage.set(USERS_STORAGE_KEY, updatedUsers);
      
      // Remove credentials
      const credentials = storage.get<StoredCredentials>('inventory_credentials', {});
      delete credentials[userToDelete.username];
      storage.set('inventory_credentials', credentials);
      
      setUsers(updatedUsers);
    }
  };

  const openModal = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'viewer',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute resource="users" action="read">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">User Management</h1>
                <p className="text-muted-foreground mt-1">Manage user accounts and permissions</p>
              </div>
              <button onClick={openModal} className="btn btn-primary flex items-center gap-2">
                <Plus size={20} />
                Add User
              </button>
            </div>

            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-border">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-full">
                              <Shield className="text-primary" size={20} />
                            </div>
                            <div>
                              <div className="font-medium">{user.username}</div>
                              {user.id === currentUser?.id && (
                                <span className="text-xs text-green-600">(You)</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail size={16} className="text-muted-foreground" />
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar size={16} />
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(user)}
                              className="p-1 hover:bg-blue-50 rounded text-blue-600"
                            >
                              <Edit size={18} />
                            </button>
                            {user.id !== currentUser?.id && (
                              <button
                                onClick={() => handleDelete(user.id)}
                                className="p-1 hover:bg-red-50 rounded text-red-600"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 card p-6">
              <h3 className="text-lg font-semibold mb-3">Role Permissions</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">Admin</span>
                  <p className="text-sm text-muted-foreground">Full access to all features including user management</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Manager</span>
                  <p className="text-sm text-muted-foreground">Can create and edit products, suppliers, categories, and transactions</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Viewer</span>
                  <p className="text-sm text-muted-foreground">Read-only access to view inventory data and analytics</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingUser ? 'Edit User' : 'Add New User'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Username</label>
              <input
                type="text"
                className="input"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                disabled={!!editingUser}
              />
              {editingUser && (
                <p className="text-xs text-muted-foreground mt-1">Username cannot be changed</p>
              )}
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
              <label className="label">Password {editingUser && '(leave blank to keep current)'}</label>
              <input
                type="password"
                className="input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser}
                placeholder={editingUser ? 'Leave blank to keep current password' : ''}
              />
            </div>

            <div>
              <label className="label">Role</label>
              <select
                className="input"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                required
              >
                <option value="viewer">Viewer (Read-only)</option>
                <option value="manager">Manager (Edit access)</option>
                <option value="admin">Admin (Full access)</option>
              </select>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button type="button" onClick={closeModal} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingUser ? 'Update User' : 'Create User'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
