# Frontend


## 📦 Technologies

- **Framework:** [Next.js 14](https://nextjs.org/)
- **UI:** [Chakra UI](https://chakra-ui.com/)
- **Date Handling:** [Date-fns](https://date-fns.org/)
- **Payments:** [Stripe.js](https://stripe.com/docs/stripe-js/react)
- **HTTP Requests Handling:** [Axios](https://axios-http.com/)

## 🚀 How to Run the Project

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- [Yarn](https://yarnpkg.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project folder:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   yarn install
   ```

### Running
To start the development server:
```bash
  yarn start
```

To generate a production build:
```bash
    yarn build
```

## 📂 Project Structure

```
/frontend
│── public/            # Static files
│── src/
│   ├── components/    # Reusable components
│   ├── context/       # Application context
│   ├── hooks/         # Custom hooks
│   ├── pages/         # Application pages
│   │   ├── api/                   # API routes
│   │   ├── bookingdetails/        # Booking details page
│   │   ├── create-product/        # Product creation page
│   │   ├── dashboard/             # Dashboard section
│   │   │   ├── blackouts/         # Blackout dates management
│   │   │   ├── categories/        # Category management
│   │   │   ├── choose-a-product/  # Product selection
│   │   │   ├── create-addons/     # Add-ons creation
│   │   │   ├── create-tours/      # Tour creation
│   │   │   ├── edit-tour/         # Edit tour page
│   │   │   ├── guides/            # Guide management
│   │   │   ├── home/              # Dashboard home
│   │   │   ├── list-addons/       # Add-ons listing
│   │   │   ├── list-tours/        # Tours listing
│   │   │   ├── make-a-purchase/   # Purchase process
│   │   │   ├── new-guide/         # New guide page
│   │   │   ├── purchases/         # Purchase history
│   │   │   ├── reservation/       # Reservation handling
│   │   │   ├── reservation-details/ # Reservation details
│   │   │   ├── reservations/      # Reservations list
│   │   │   ├── tenant/            # Tenant management
│   │   │   ├── tenant-list/       # List of tenants
│   │   │   ├── under-construction/ # Under construction page
│   │   ├── email/                 # Email handling
│   │   ├── login/                 # Login page
│   ├── services/      # API and business logic services
│   │   ├── api.ts        # Axios instance for API requests
│   │   ├── queryClient.ts # React Query client configuration
│   ├── styles/        # Global styles
│   ├── utils/         # Helper functions
│── .gitignore
│── package.json
│── tsconfig.json
│── README.md
```

