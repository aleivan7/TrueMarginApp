# TrueMargin - Job Profit Calculator

A production-ready web application for calculating true per-job profit for stretch-ceiling businesses and allocating profits into configurable buckets.

## Features

- **Job Management**: Create and manage stretch-ceiling projects with detailed cost tracking
- **Profit Calculations**: Accurate profit calculations including materials, labor, travel, overhead, and warranty reserves
- **Bucket Allocations**: Configurable profit allocation buckets (taxes, owner pay, marketing, etc.)
- **Inventory Management**: Track materials, costs, and stock levels
- **Change Orders**: Handle project modifications and their impact on profitability
- **Travel & Labor Tracking**: Comprehensive cost tracking for travel and labor expenses
- **Settings Management**: Configure organization-wide defaults and bucket allocations

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **UI Components**: shadcn/ui + Lucide React icons
- **Backend**: tRPC for type-safe API calls
- **Database**: PostgreSQL + Prisma ORM
- **Validation**: Zod schemas
- **Forms**: React Hook Form + ZodResolver
- **Testing**: Vitest + Testing Library
- **Styling**: Tailwind CSS with dark mode support

## Quick Start

### Prerequisites

- Node.js 18+ 
- Docker (for PostgreSQL)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TrueMarginApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   Edit `.env` with your database configuration.

4. **Start the database**
   ```bash
   npm run db:up
   ```

5. **Run database migrations and seed data**
   ```bash
   npm run db:reset
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run db:up` - Start PostgreSQL with Docker
- `npm run db:reset` - Reset database and seed with sample data

## Database Schema

The application uses a comprehensive Prisma schema with the following main entities:

- **Jobs**: Main project records with client info, quotes, and profit calculations
- **Purchases**: Material purchases with line items and shipping costs
- **Labor Entries**: Time tracking for in-house and subcontractor work
- **Travel Entries**: Mileage, per-diem, and lodging costs
- **Change Orders**: Project modifications affecting revenue
- **Payments**: Payment tracking with processing fees
- **Inventory Items**: Material catalog with costs and pricing
- **Bucket Sets**: Configurable profit allocation buckets
- **Org Settings**: Organization-wide defaults and configurations

## Profit Calculation Logic

The application calculates true job profitability using the following formula:

1. **Revenue** = Quote Total + Change Orders (excluding sales tax)
2. **Direct Material Cost** = Sum of purchase line costs + shipping
3. **Direct Labor Cost** = Sum of labor entries (rate × units)
4. **Travel Cost** = Mileage × rate + per-diem × days + lodging + other
5. **Payment Fees** = Sum of processing fees (percentage + flat)
6. **Warranty Reserve** = Revenue × warranty percentage (default 3%)
7. **Overhead Allocation** = Revenue × overhead percentage (default 15%)
8. **Contribution Margin** = Revenue - (Materials + Labor + Travel)
9. **Fully Loaded Profit** = Revenue - (Materials + Labor + Travel + Overhead + Warranty + Fees)
10. **Profit for Allocation** = Fully Loaded Profit (basis for bucket allocations)

## Default Bucket Allocations

The system comes pre-configured with 11 profit allocation buckets:

- **Taxes**: 20%
- **Owner Pay**: 10% (split 50/50 between two owners)
- **Retained Earnings**: 10%
- **Marketing – Growth**: 15%
- **Payroll Growth Fund**: 15%
- **Equipment/Tools/Showroom**: 12%
- **Tech/Software**: 5%
- **Training/Education**: 3%
- **Warranty/Callbacks Reserve**: 3%
- **Partner/Referral Spiffs**: 2%
- **Flex/Opportunity Fund**: 5%

## Testing

The application includes comprehensive unit tests for:

- Profit calculation functions
- Bucket validation logic
- Currency and percentage formatting
- Edge cases (zero revenue, negative change orders, etc.)

Run tests with:
```bash
npm test
```

## Development

### Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   └── navigation.tsx  # Main navigation
├── lib/
│   ├── calc/           # Profit calculation functions
│   ├── trpc/           # tRPC client/server setup
│   └── utils.ts        # Utility functions
├── server/
│   └── api/            # tRPC API routers
└── test/               # Test setup and utilities
```

### Adding New Features

1. **Database Changes**: Update `prisma/schema.prisma` and run migrations
2. **API Endpoints**: Add new tRPC procedures in `src/server/api/routers/`
3. **UI Components**: Create components in `src/components/`
4. **Pages**: Add new pages in `src/app/`
5. **Tests**: Write tests for new functionality

## Deployment

### Environment Variables

Required environment variables:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
TRPC_SECRET="your-trpc-secret"
```

### Production Build

```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For questions or support, please open an issue in the repository.
