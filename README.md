# Zia Institutional Merchant Portal

Zia is a high-fidelity institutional treasury, acceptance, and developer surface designed for modern finance desks. It replaces manual ledgers and legacy spreadsheet structures with unified clearing rails and a single audit trail.

---

## 🌟 Key Features

- **Treasury Overview Dashboard (`/home`)**: Real-time volume aggregates, ledger transaction counts, pending payouts, interactive checklists, and currency balances across multiple treasury accounts (USD Operating, USD Reserves, EUR FX Float) with a linear-graded volume area chart.
- **Transactions Log (`/transactions`)**: Fully typed, queryable tabular database representing live and pending ledger transactions, fitted with query searches and status categories.
- **Payouts Clearing Desk (`/payouts`)**: Radical forms to trigger outward wire transfers (ACH, Fedwire) to external bank transit lines. Updates treasury volume indicators instantly.
- **Customers Master-Detail Directory (`/customers`)**: Dual-pane directory containing customer profiles, processed LTV metrics, preferred payment methods, and historical charge ledgers.
- **Access Control & Team Settings (`/team`)**: Stateful invitation modals allowing emails to be invited with access tiers (Admin, Owner, Finance, Developer). Supports dynamic revoking and invitation link resends.
- **Developer Settings (`/developer`)**: Create environment keys (Secret `sk_` and Publishable `pk_`), copy tokens to clipboard with click-toast triggers, and register callback webhook URLs with client validations.
- **Unified Authentication Route (`/login`)**: Combined auth workspace rendering Sign-In and Workspace-Signup inside a single elegant view, highlighted by a custom abstract technology graphic.
- **Mock vs. Live API Request Selector**: Synchronized global state toggle located under the sidebar's workspace menu.
  - **Mock Mode**: Loads static sandboxed files and handles mutations locally.
  - **Live API Mode**: dispatches structured JSON payloads, logging wrapped Request/Response envelopes directly to the browser inspector, with a resilient local sandbox fallback.

---

## 📂 Project Architecture

```
├── openapi.yaml                 # OpenAPI 3.0.3 production endpoint specifications
├── package.json                 # Project dependencies & package scripts
├── src/
│   ├── components/
│   │   ├── app-shell.tsx        # Global navigation, sidebar workspace card, & API toggle
│   │   └── ui/                  # Dialog, toast, and overlay radix layout wrappers
│   ├── hooks/
│   │   └── use-api-mode.ts      # Custom Hook synchronizing mock vs. live API modes
│   ├── lib/
│   │   ├── api.ts               # Wrapped envelope request parser & apiFetch helper
│   │   └── utils.ts             # Tailwind class merging utility
│   ├── routes/
│   │   ├── __root.tsx           # Base document layout & toast provider hook
│   │   ├── index.tsx            # Landing page with interactive cost savings calculator
│   │   ├── home.tsx             # Main dashboard overview metrics
│   │   ├── login.tsx            # Combined authentication panel & hero cover
│   │   ├── signup.tsx           # Redirect wrapper for registration
│   │   ├── forgot-password.tsx  # Stateful reset email flow
│   │   ├── payouts.tsx          # Payout rails & bank transfers
│   │   ├── customers.tsx        # Customer ledger profiles
│   │   ├── team.tsx             # Teammate invitation desk
│   │   └── developer.tsx        # Webhook & API key portal
│   └── styles.css               # Global Tailwind v4 layout styling
```

---

## 📋 OpenAPI Message Envelopes

All Live API requests and responses are strictly wrapped inside message envelopes configured in [openapi.yaml](openapi.yaml) to ensure end-to-end trace correlation.

### Request Envelope
```json
{
  "messageID": "XBYUURE",
  "primaryData": {
    "bank": "Chase Bank",
    "routing": "123456789",
    "account": "9876543210",
    "amount": 128450.00
  },
  "additionalData": [
    { "key": "clientVersion", "value": "1.0.0" }
  ]
}
```

### Response Envelope
```json
{
  "statusCode": "0",
  "statusDescription": "Success",
  "messageCode": "200",
  "messageDescription": "Processed successfully",
  "errorInfo": null,
  "messageID": "XBYUURE",
  "conversationID": "conv_8912A34",
  "additionalData": [],
  "primaryData": {
    "id": "po_8L1A9K",
    "status": "Pending"
  }
}
```

---

## 🛠️ Getting Started

### 1. Installation
Install project dependencies using `npm` (Bun is explicitly avoided per project rules):
```bash
npm install
```

### 2. Launch Local Server
Boot up the TanStack Start SSR dev runtime server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) inside your web browser.

### 3. Check Type Safety
Ensure code validation rules are checked using the TypeScript compiler:
```bash
npx tsc --noEmit
```

### 4. Build Production Bundle
Prepare and package static build assets:
```bash
npm run build
```
