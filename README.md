# ParcelX Backend API

A comprehensive Node.js Express backend API for the ParcelX courier service management system.

## Features

- **Order Management**: Create, read, update, delete orders
- **Tracking System**: Public tracking by tracking ID
- **MongoDB Integration**: Mongoose ODM for database operations
- **RESTful API**: Clean REST API endpoints
- **Security**: CORS protection

## API Endpoints

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/track/:trackingId` - Track order by ID (Public)
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order
- `PATCH /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete order
- `GET /api/orders/stats/overview` - Get order statistics

### Health Check
- `GET /api/health` - API health status

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the server:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/parcelx
NODE_ENV=development
```

## Database Schema

### Order Model
- **trackingId**: Unique tracking identifier
- **customer**: Customer information (name, email, phone, address)
- **shipping**: Shipping details (from, to, expected delivery)
- **package**: Package information (type, weight, dimensions, value, instructions)
- **status**: Order status (pending, in-transit, delivered, cancelled)
- **timeline**: Array of status updates with timestamps
- **createdAt/updatedAt**: Timestamps

## API Access

All endpoints are publicly accessible without authentication requirements.

## Error Handling

The API returns consistent error responses:

```json
{
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

## Development

- Uses nodemon for auto-restart during development
- MongoDB connection with Mongoose ODM
- CORS enabled for cross-origin requests
- Comprehensive error handling and validation

## Production Considerations

- Set `NODE_ENV=production`
- Configure MongoDB Atlas or production MongoDB instance
- Set up proper logging and monitoring
- Use HTTPS in production
- Implement rate limiting
- Add input validation and sanitization
