# ÉLAN — MEVN Setup Guide

The existing ÉLAN HTML/CSS layout and navigation are retained. **Vue 3** powers the Favorites view, **Express + Node.js** serve the application and JSON API, and **MongoDB Atlas** stores products, sample customers, rental requests, and contact inquiries. Other existing UI behaviors continue using vanilla JavaScript as a gradual migration. This is a **hybrid Vue/legacy frontend**, not a fully Vue-converted single-page app.

## Requirements
- Node.js 20 or newer and npm
- Free MongoDB Atlas account and database cluster

## Setup
1. Extract the ZIP and open the `Elan` folder in VS Code.
2. Open a terminal in that folder and run `npm install`.
3. In MongoDB Atlas, create a free cluster and a database user. In **Network Access**, add your current IP address (do not leave unrestricted access enabled for a production deployment).
4. Copy `.env.example` to `.env`. Replace `MONGODB_URI` with your Atlas connection string, using the database name `elan`. URL-encode special characters in your database password. **Never commit `.env` to GitHub.**
5. Run `npm run seed` to import the existing `products.json` and sample `customers.json` into Atlas. Running seed again updates existing records by name/id.
6. Run `npm start` (or `npm run dev` while developing).
7. Open **http://localhost:3000**. Do not use Live Server: it does not provide the database API.

## Test
- Visit `/api/health`: `database` should say `connected`.
- Visit `/api/products` and `/api/customers`: both should return JSON from Atlas.
- Open **Dresses**, **Product**, **Favorites**, **Cart**, and **Checkout**. Favorites are saved in the current browser; rental requests are stored in MongoDB `orders` after submission.
- Contact form submissions are stored in MongoDB `inquiries`. This version does not send emails.
- Check MongoDB Atlas Collections for `products`, `customers`, `orders`, and `inquiries`.

## Important limitations
- Favorites, shopping bag, and membership discount remain browser-local, as in the original application; no user accounts or cross-device synchronization were added.
- Checkout stores **rental requests**, not actual payments or confirmed reservations. No payment gateway is integrated.
- The sample customers dataset is for course demonstration only; do not expose real customer personal information through the public `/api/customers` endpoint. Remove or protect that endpoint before production deployment.
- The 15% discount flag is supplied by the browser and is **not verified membership eligibility**. Do not use it for real transactions without authentication and server-side membership checks.
- Atlas access is needed to test the backend end-to-end; a working connection cannot be verified without your own credentials.
