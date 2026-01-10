# Alert System Implementation Guide

## Free Implementation Strategy

### 1. Native System Alerts (Browser Notifications)
- **Cost**: Free.
- **Tech**: Standard Web `Notification` API.
- **Implementation**: We request permission on the client side. When the risk level checks return "HIGH" or "CRITICAL", we trigger a browser notification.

### 2. Email Alerts
- **Cost**: Free (Limited).
- **Tech**: `nodemailer` library.
- **Provider**: 
  - **Option A (Recommended for Dev)**: **Gmail** with an "App Password". Limit: 500 emails/day.
  - **Option B (production)**: **Resend** or **SendGrid** Free Tier (approx 100/day).
- **Implementation**: We will create a utility function that sends an email using SMTP.

### 3. SMS / Phone Alerts
- **Cost**: Not free (Real SMS requires carrier fees).
- **Free Workaround**: **Simulation Mode**.
  - We will log the SMS content to the server console.
  - We will store the "Sent" alert in the database to show in the UI.
  - **Upgrade Path**: I will provide commented-out code for **Twilio** (standard provider). 

## Proposed Changes

### Backend
1.  **Create `src/lib/email.ts`**: Setup Nodemailer transporter.
2.  **Create `src/lib/sms.ts`**: Setup Mock SMS sender (and Twilio stub).
3.  **Modify `src/app/api/risk-data/route.ts`**: 
    - When calculating risk, if Level > HIGH, trigger `sendAlert()`.

### Frontend
1.  **Modify `src/app/page.tsx`**: 
    - Ensure `Notification.requestPermission` is handled gracefully.
    - Poll/Check for new alerts to trigger local notification.

## Configuration
You will need to add these to `.env` (I will create a `.env.example`):
- `EMAIL_USER`: Your Gmail address
- `EMAIL_PASS`: Your Gmail App Password
