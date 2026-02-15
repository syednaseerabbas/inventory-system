<<<<<<< HEAD
# inventory-system
A comprehensive, full-featured inventory management system built with Next.js 14, TypeScript, and Tailwind CSS. Perfect for businesses to track products, suppliers, transactions, and gain insights through analytics.
=======
# Inventory Management System

A comprehensive, full-featured inventory management system built with Next.js 14, TypeScript, and Tailwind CSS. Perfect for businesses to track products, suppliers, transactions, and gain insights through analytics.

## Features

### 🔐 Authentication & Authorization
- **Secure login system** with session management
- **Three user roles**: Admin, Manager, Viewer
- **Role-based access control (RBAC)** for all features
- **Permission-based UI** - users only see what they can do
- **User management** interface for admins
- **Demo credentials** included for testing

### 📦 Product Management
- Complete CRUD operations for products
- Stock level monitoring with low stock alerts
- SKU tracking and categorization
- Supplier assignment
- Automatic reorder level notifications

### 👥 Supplier Management
- Manage supplier information (contact details, address)
- Track supplier relationships with products
- Easy-to-use contact cards

### 🏷️ Category Management
- Organize products by categories
- Track product count per category
- Prevent deletion of categories with assigned products

### 📊 Transaction Tracking
- Record stock in/out/adjustment transactions
- Complete transaction history with timestamps
- Automatic stock quantity updates
- Reason tracking for audit trails

### 📈 Analytics Dashboard
- Visual charts and graphs using Recharts
- Category distribution (pie chart)
- Stock level monitoring (bar charts)
- Transaction trends over time (line charts)
- Top products by value
- Real-time inventory metrics

### 🎨 Modern UI/UX
- Clean, professional interface
- Responsive design (mobile, tablet, desktop)
- Intuitive navigation
- Modal-based forms
- Search and filter capabilities

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Storage**: Browser localStorage (client-side)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone or download the project**
   ```bash
   cd inventory-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

5. **Login with demo credentials**
   - **Admin**: `admin` / `admin123` (full access)
   - **Manager**: `manager` / `manager123` (edit access)
   - **Viewer**: `viewer` / `viewer123` (read-only)

## Authentication & RBAC

The system includes comprehensive authentication and role-based access control. See [AUTH_README.md](AUTH_README.md) for complete documentation on:
- User roles and permissions
- How to manage users
- Security implementation
- Testing different roles

**Default Login Credentials:**
| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Manager | `manager` | `manager123` |
| Viewer | `viewer` | `viewer123` |

## Deploying to Vercel

Vercel is the easiest way to deploy your Next.js application. Follow these steps:

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Create a Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub, GitLab, or Bitbucket

2. **Push Code to Git Repository**
   ```bash
   # Initialize git (if not already done)
   git init
   git add .
   git commit -m "Initial commit"
   
   # Create a new repository on GitHub/GitLab/Bitbucket
   # Then push your code
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

3. **Import Project to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your Git repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"

4. **Your site is live!**
   - Vercel will provide a URL like `your-app.vercel.app`
   - Every push to your main branch will trigger automatic redeployment

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? (press enter for default)
   - Directory? **./inventory-system**
   - Override settings? **N**

4. **Production Deployment**
   ```bash
   vercel --prod
   ```

## Environment Variables

This application uses browser localStorage, so no environment variables are needed. However, if you want to add backend functionality in the future, you can create a `.env.local` file:

```env
# Example for future backend integration
# NEXT_PUBLIC_API_URL=your-api-url
```

## Project Structure

```
inventory-system/
├── app/
│   ├── analytics/          # Analytics dashboard page
│   ├── categories/         # Category management page
│   ├── login/              # Login page
│   ├── products/           # Product management page
│   ├── suppliers/          # Supplier management page
│   ├── transactions/       # Transaction tracking page
│   ├── users/              # User management page (admin only)
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout with AuthProvider
│   └── page.tsx            # Dashboard home page
├── components/
│   ├── Modal.tsx           # Reusable modal component
│   ├── PermissionGate.tsx  # Permission-based UI rendering
│   ├── ProtectedRoute.tsx  # Authentication guard
│   ├── Sidebar.tsx         # Navigation sidebar with user info
│   └── StatCard.tsx        # Dashboard stat cards
├── lib/
│   ├── auth.ts             # Auth utilities, roles, permissions
│   ├── AuthContext.tsx     # Authentication context provider
│   ├── sampleData.ts       # Sample data generator
│   ├── storage.ts          # localStorage wrapper
│   └── types.ts            # TypeScript interfaces
├── public/                 # Static assets
├── AUTH_README.md          # Authentication documentation
├── DEPLOYMENT_GUIDE.md     # Deployment instructions
├── next.config.js          # Next.js configuration
├── package.json            # Dependencies
├── README.md               # This file
├── tailwind.config.js      # Tailwind configuration
└── tsconfig.json           # TypeScript configuration
```

## Features Breakdown

### Dashboard
- Overview statistics (total products, low stock, inventory value, recent transactions)
- Low stock alerts panel
- Recent transactions list
- Real-time data updates

### Products Page
- Product listing table with search
- Add/Edit/Delete operations
- Stock status indicators
- Supplier and category assignment

### Suppliers Page
- Card-based supplier display
- Contact information management
- Add/Edit/Delete operations

### Categories Page
- Category cards with product counts
- Protection against deleting categories with products
- Description management

### Transactions Page
- Complete transaction history
- Stock in/out/adjustment types
- Automatic inventory updates
- Detailed transaction logging

### Analytics Page
- Multiple chart types (pie, bar, line)
- Category distribution
- Stock level visualization
- Transaction trends
- Value analysis

## Data Persistence

The application uses browser localStorage for data persistence. This means:
- Data is stored locally in the user's browser
- No backend server required
- Data persists across page refreshes
- Each user has their own data
- Clearing browser data will reset the application

For production use with multiple users, consider:
- Adding a backend API (Node.js, Express, etc.)
- Database integration (PostgreSQL, MongoDB, etc.)
- User authentication
- Real-time synchronization

## Customization

### Changing Colors
Edit `tailwind.config.js` to customize the color scheme:
```javascript
theme: {
  extend: {
    colors: {
      primary: "hsl(221.2 83.2% 53.3%)", // Change this
      // ...
    }
  }
}
```

### Adding New Features
1. Create new pages in the `app/` directory
2. Add route to `components/Sidebar.tsx`
3. Create necessary components and utilities

### Modifying Storage
To use a different storage mechanism:
1. Update `lib/storage.ts`
2. Implement your storage adapter (API calls, IndexedDB, etc.)

## Browser Compatibility

- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- Mobile browsers: ✅ Responsive design

## Performance

- Client-side rendering for instant interactions
- Optimized bundle size
- Lazy loading of components
- Efficient state management

## Troubleshooting

### Port 3000 already in use
```bash
# Use a different port
npm run dev -- -p 3001
```

### Build errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### TypeScript errors
```bash
# Check for type errors
npx tsc --noEmit
```

## Future Enhancements

Consider adding:
- [ ] User authentication and authorization
- [ ] Backend API with database
- [ ] Multi-user support with role-based access
- [ ] PDF/Excel export functionality
- [ ] Barcode scanning integration
- [ ] Email notifications for low stock
- [ ] Purchase order management
- [ ] Invoice generation
- [ ] Advanced reporting
- [ ] Mobile app (React Native)

## Support

For issues, questions, or contributions:
1. Check existing documentation
2. Review code comments
3. Create detailed issue reports
4. Submit pull requests with improvements

## License

This project is open source and available under the MIT License.

## Credits

Built with:
- Next.js
- TypeScript
- Tailwind CSS
- Recharts
- Lucide React

---

**Made with ❤️ for modern inventory management**
>>>>>>> 20f52b2 (Initial commit)
