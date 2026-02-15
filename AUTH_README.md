# Authentication & Role-Based Access Control (RBAC)

This inventory management system now includes a complete authentication system with role-based access control.

## 🔐 Authentication Features

### Login System
- Secure login page at `/login`
- Session management using localStorage
- 24-hour session expiry
- Automatic redirect to login if not authenticated

### User Management
- Admin-only user management interface at `/users`
- Create, edit, and delete users
- Assign roles to users
- Change passwords
- View user creation dates

## 👥 User Roles & Permissions

The system has three distinct roles with different permission levels:

### 1. **Admin** (Full Access)
**Can do everything:**
- ✅ Create, read, update, delete products
- ✅ Create, read, update, delete suppliers
- ✅ Create, read, update, delete categories
- ✅ Create, read, update, delete transactions
- ✅ View analytics
- ✅ **Manage users** (create/edit/delete user accounts)

**Use cases:**
- System administrators
- Business owners
- IT managers

### 2. **Manager** (Edit Access)
**Can manage inventory but not delete or manage users:**
- ✅ Create, read, update products (❌ cannot delete)
- ✅ Create, read, update suppliers (❌ cannot delete)
- ✅ Create, read, update categories (❌ cannot delete)
- ✅ Create and read transactions (❌ cannot update/delete)
- ✅ View analytics
- ❌ Cannot manage users

**Use cases:**
- Warehouse managers
- Inventory coordinators
- Store managers

### 3. **Viewer** (Read-Only Access)
**Can only view data:**
- ✅ Read products
- ✅ Read suppliers
- ✅ Read categories
- ✅ Read transactions
- ✅ View analytics
- ❌ Cannot create, update, or delete anything
- ❌ Cannot manage users

**Use cases:**
- Accountants
- Auditors
- Read-only stakeholders
- Reporting staff

## 🚀 Default Login Credentials

The system comes with three demo accounts:

| Username | Password | Role | Description |
|----------|----------|------|-------------|
| `admin` | `admin123` | Admin | Full system access |
| `manager` | `manager123` | Manager | Can edit but not delete |
| `viewer` | `viewer123` | Viewer | Read-only access |

**⚠️ Important:** Change these passwords in production!

## 📋 How It Works

### Protected Routes
Every page (except login) is wrapped in a `ProtectedRoute` component that:
1. Checks if user is authenticated
2. Redirects to login if not authenticated
3. Checks if user has permission to view the page
4. Shows "Access Denied" message if insufficient permissions

### Permission Gates
Individual UI elements (buttons, forms) use `PermissionGate` components:
- "Add Product" button only shown if user can create products
- "Edit" buttons only shown if user can update
- "Delete" buttons only shown if user can delete

### Permission Matrix

| Feature | Admin | Manager | Viewer |
|---------|-------|---------|--------|
| **Products** |
| View | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ❌ |
| Edit | ✅ | ✅ | ❌ |
| Delete | ✅ | ❌ | ❌ |
| **Suppliers** |
| View | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ❌ |
| Edit | ✅ | ✅ | ❌ |
| Delete | ✅ | ❌ | ❌ |
| **Categories** |
| View | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ❌ |
| Edit | ✅ | ✅ | ❌ |
| Delete | ✅ | ❌ | ❌ |
| **Transactions** |
| View | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ❌ |
| Edit | ✅ | ❌ | ❌ |
| Delete | ✅ | ❌ | ❌ |
| **Analytics** |
| View | ✅ | ✅ | ✅ |
| **Users** |
| View | ✅ | ✅ | ❌ |
| Create | ✅ | ❌ | ❌ |
| Edit | ✅ | ❌ | ❌ |
| Delete | ✅ | ❌ | ❌ |

## 🔧 Technical Implementation

### File Structure
```
lib/
├── auth.ts              # Authentication utilities, roles, permissions
├── AuthContext.tsx      # React Context for auth state

components/
├── ProtectedRoute.tsx   # Page-level authentication guard
├── PermissionGate.tsx   # Component-level permission guard

app/
├── login/
│   └── page.tsx        # Login page
└── users/
    └── page.tsx        # User management (admin only)
```

### Key Components

#### `auth.ts`
- Defines user roles and permissions
- Permission checking functions
- Password hashing (basic, for demo)
- Session management utilities

#### `AuthContext.tsx`
- Manages authentication state
- Login/logout functions
- User registration
- Session persistence

#### `ProtectedRoute.tsx`
- Wraps entire pages
- Redirects to login if not authenticated
- Shows access denied for insufficient permissions

#### `PermissionGate.tsx`
- Wraps individual UI elements
- Hides/shows based on permissions
- Granular access control

## 🛡️ Security Notes

### Current Implementation (Demo)
The current system uses:
- **localStorage** for session storage
- **Base64 encoding** for passwords (NOT secure)
- **Client-side** validation only

### For Production Use
You should implement:

1. **Backend Authentication**
   - Use a proper backend (Node.js, Python, etc.)
   - Implement JWT tokens
   - Store passwords with bcrypt/argon2
   - Use httpOnly cookies

2. **Database**
   - Store users in a real database
   - PostgreSQL, MongoDB, MySQL, etc.
   - Proper user table schema

3. **Password Security**
   ```javascript
   // Replace simpleHash with:
   import bcrypt from 'bcrypt';
   const hash = await bcrypt.hash(password, 10);
   const isValid = await bcrypt.compare(password, hash);
   ```

4. **Session Management**
   - Use JWT tokens
   - Implement refresh tokens
   - Server-side session validation
   - HTTPS only

5. **Additional Security**
   - Rate limiting on login attempts
   - Password strength requirements
   - Two-factor authentication (2FA)
   - Password reset functionality
   - Email verification
   - Audit logging

## 📝 Usage Examples

### Adding a New User (Admin Only)
1. Login as admin
2. Go to "User Management" in sidebar
3. Click "Add User"
4. Fill in username, email, password, role
5. Click "Create User"

### Checking Permissions in Code
```typescript
import { hasPermission } from '@/lib/auth';

// Check if user can delete products
if (hasPermission(user.role, 'products', 'delete')) {
  // Show delete button
}
```

### Creating a Protected Page
```typescript
import ProtectedRoute from '@/components/ProtectedRoute';

export default function MyPage() {
  return (
    <ProtectedRoute resource="products" action="read">
      {/* Your page content */}
    </ProtectedRoute>
  );
}
```

### Conditionally Showing UI Elements
```typescript
import PermissionGate from '@/components/PermissionGate';

<PermissionGate resource="products" action="create">
  <button onClick={handleCreate}>Add Product</button>
</PermissionGate>
```

## 🎯 User Experience

### For Admins
- Full control over everything
- Can create and manage other users
- See all buttons and features

### For Managers
- Can perform most operations
- Edit buttons visible
- Delete buttons hidden
- Cannot access user management

### For Viewers
- Clean, uncluttered interface
- Only view data and analytics
- No action buttons visible
- Cannot accidentally modify data

## 🔄 Session Management

- **Session Duration:** 24 hours
- **Automatic Logout:** Sessions expire automatically
- **Manual Logout:** Click logout button in sidebar
- **Re-login:** Redirects to login page when session expires

## 📱 UI Features

### Sidebar User Info
- Shows current user's username
- Displays email
- Shows role badge with color coding:
  - Purple: Admin
  - Blue: Manager
  - Gray: Viewer
- Logout button

### User Management Page
- Table view of all users
- Role badges
- Creation dates
- Edit/Delete actions
- Cannot delete your own account
- Role permissions explanation

## 🚨 Access Denied Behavior

When a user tries to access a restricted resource:
1. Page shows "Access Denied" message with lock icon
2. Displays their current role
3. Option to return home (if implemented)

## 💡 Best Practices

1. **Always check permissions** on both frontend and backend
2. **Never trust client-side** validation alone
3. **Log authentication events** for auditing
4. **Implement password policies** for security
5. **Use HTTPS** in production
6. **Regularly review** user accounts and permissions
7. **Implement** session timeout warnings
8. **Add** account lockout after failed attempts

## 🔍 Testing Different Roles

1. **Test as Admin:**
   - Login with `admin` / `admin123`
   - Try all features - everything should work
   - Go to User Management

2. **Test as Manager:**
   - Login with `manager` / `manager123`
   - Try to delete a product - button should be hidden
   - Try to access /users - should see access denied

3. **Test as Viewer:**
   - Login with `viewer` / `viewer123`
   - Browse all pages - should work
   - Look for action buttons - none should be visible

## 📞 Support

For questions about authentication and RBAC:
1. Check the code comments in `lib/auth.ts`
2. Review `lib/AuthContext.tsx`
3. Examine `components/ProtectedRoute.tsx`

---

**Remember:** This is a demo authentication system. For production use, implement proper backend authentication with secure password hashing and server-side validation.
