## Introduction

This is a stock management project for an electronics business. The application runs on Node.js and uses a local JSON file database, so it can be started and tested without MongoDB.

## Setup

Follow these steps from the project folder.

### Install the Dependencies

    npm install

### Optional: Seed Demo Data

This creates the local data file and fills it with sample products.

    node seed.js

### Start the Server

    node app.js

This launches the application on port 3000 by default. If you need a different port, update the value in config/default.json.

## Run It in the Browser

Open these URLs:

- http://localhost:3000/
- http://localhost:3000/sales
- http://localhost:3000/orders
- http://localhost:3000/reports

The API endpoints are available at:

- http://localhost:3000/api/products
- http://localhost:3000/api/customers
- http://localhost:3000/api/orders

## Authentication

Register a new user with a POST request to:

    http://localhost:3000/api/users/register

Use the returned token in the x-auth-token header when calling protected routes.

## Notes

- The project stores data in data/stock.json.
- No external database service is required for local testing.