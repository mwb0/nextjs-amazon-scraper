# Amazon Kindle Fire Price Drop Notifier

This project monitors the price of the Kindle Fire on Amazon and sends an automated notification when the price drops by a specified threshold.

## How the Application Works

Here's the workflow:

### 1. Periodic Price Checks
The script runs at configurable intervals using a scheduler. Each cycle:

- Fetches product pages using HTTP requests with proxies of bright data (Have already done with custom headers on the Python project so don't use it here)
- Parses HTML content with Cheerio to extract pricing data
- Gets exact price from Amazon through request retries

### 2. Price Comparison
- Compares current price with historical data (current, average, highest, lowest prices) stored in MongoDB
- Triggers notifications if price drop exceeds the configured threshold

### 3. Notification
- Email and SMS notification

### 4. Clean UI for checking the products

## Tech Stack
- **Next.js** (React Framework)
- **Tailwind CSS** (Styling)
- **MongoDB** (Database)
- **Twilio** (SMS notifications)
- **Nodemailer** (Email notifications)
- **Bright Data** (Web Scraping)

## Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/mwb0/nextjs-amazon-scraper.git
cd nextjs-amazon-scraper
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Set Up Environment Variables
Create a `.env` file in the root directory and add the following:
```env
MONGODB_URI=your_mongodb_connection_string
EMAIL_PASSWORD=your_email_password
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### 4️⃣ Start the Development Server
```bash
npm run dev
```
The project will be available at `http://localhost:3000`

## 📜 Usage
1. **Enter an Amazon product URL** in the search bar.
2. **Provide an email, phone number, price drop mode and value** in the tracking modal.
3. **Receive notifications** when the product price drops.
4. **Cron Job** - Set up a cron job to automatically monitor product prices by sending requests to `/api/cron/`

## 🛠️ Running in Production
To build and run in production mode, use:
```bash
npm run build
npm start
```