# Digital Khatabook

A modern, digital solution for traditional bookkeeping used by local shopkeepers to manage customer transactions, credits, debits, and payments.

## Features

### 🔐 Authentication
- Firebase Authentication with Google Sign-in
- Secure user management and data isolation

### 👥 Customer Management
- Add, edit, and delete customers
- Store customer information (name, phone, address)
- Auto-generate QR codes for each customer
- Search customers by name or phone number

### 💰 Transaction Management
- Add credit and debit transactions
- Track payment methods (cash, UPI, card, pending)
- Item descriptions and quantities
- Running balance calculation
- Transaction history with filters

### 📊 Dashboard & Analytics
- Overview of total customers, credits, debits
- Pending balance tracking
- Interactive charts (credit vs debit pie chart, daily activity)
- Recent transactions display

### 📈 Reports & Export
- Filter transactions by date, customer, type, payment method
- Export data to PDF and CSV formats
- Generate customer-specific reports
- Transaction receipts with QR codes

### 📱 Modern UI/UX
- Responsive design for mobile and desktop
- Dark/light theme support
- Real-time data synchronization
- Offline-ready architecture

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **UI Components**: Shadcn UI, Radix UI
- **Backend**: Firebase Firestore, Firebase Auth
- **State Management**: Zustand
- **Charts**: Recharts
- **PDF Generation**: jsPDF
- **QR Codes**: qrcode library

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore and Authentication enabled

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd digital-khatabook
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Firestore Database
   - Enable Authentication with Google provider
   - Copy your Firebase config

4. Environment setup:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Firebase Setup

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Customers belong to users
    match /customers/{customerId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Transactions belong to users
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

### Firestore Indexes

Create composite indexes for:
- `customers`: `userId` (Ascending) + `createdAt` (Descending)
- `transactions`: `userId` (Ascending) + `createdAt` (Descending)
- `transactions`: `userId` (Ascending) + `customerId` (Ascending) + `createdAt` (Descending)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── customers/         # Customer management pages
│   ├── reports/           # Reports and analytics
│   ├── settings/          # App settings
│   └── login/             # Authentication
├── components/            # Reusable React components
│   ├── ui/               # Shadcn UI components
│   ├── CustomerCard.tsx
│   ├── TransactionList.tsx
│   └── ...
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts
│   ├── useCustomers.ts
│   └── useTransactions.ts
├── lib/                   # Library configurations
│   ├── firebase.ts
│   └── firestore.ts
├── store/                 # Zustand state management
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## Key Features Implementation

### Real-time Data Sync
- Uses Firestore real-time listeners
- Automatic UI updates when data changes
- Optimistic updates for better UX

### Offline Support
- Service worker for caching
- Local storage fallback
- Queue operations when offline

### Security
- Firebase Authentication
- Firestore security rules
- User data isolation

### Performance
- Next.js App Router for optimal loading
- Component lazy loading
- Efficient state management with Zustand

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@digitalkhatabook.com or create an issue in the repository.