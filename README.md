# BOLT12 Payment Receiver

⚠️ **IMPORTANT**: This application is for demonstration purposes only.

A web application that demonstrates how to create and receive BOLT12 offers using the Breez SDK.

## Prerequisites

Before running this application, you'll need:

1. [Node.js](https://nodejs.org/) (v22 or higher)
2. A Breez SDK API key (get one from [Breez SDK](https://breez.technology/request-api-key/#contact-us-form-sdk))
3. A BIP39 mnemonic phrase

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/dangeross/dhd-2025-web-receive-bolt12.git
   cd dhd-2025-web-receive-bolt12
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the example environment file and fill in your values:
   ```bash
   cp example.env .env
   ```

4. Edit the `.env` file with your Breez API key and wallet mnemonic:
   ```
   VITE_BREEZ_API_KEY=your_breez_api_key_here
   VITE_MNEMONIC="your twelve word mnemonic phrase here separated by spaces"
   ```

## Running the Application

Start the development server:
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).
