# 🛡️ Developer Integration Guide: Auth Provider

This guide outlines the step-by-step procedure to integrate custom desktop or client applications with the centralized **Auth Provider** system.

---

## 🔑 Step 1: Provisioning Your Application & Credentials

Before writing code, you must register your application in the administration dashboard.

1. Navigate to the Dashboard URL: 
   👉 **[http://13.234.77.157/auth/dashboard](http://13.234.77.157/auth/dashboard)** (Port 3005 is no longer required due to Nginx/Negx routing)
2. Click **Create New App** and give it a descriptive name.
3. Once created, copy your secure credentials from the grid:
   - **`App ID`**: Public UUID identifying your application.
   - **`API Key`**: Secret hexadecimal string validating backend authenticity.
4. Ensure you register allowed users (by **email**) under your specific App ID in the **Users** tab.

---

## 🔐 The Two-Step OTP Authentication & Integration Flow

To ensure session exclusivity (preventing unauthorized individuals from using a single authorized license), the integration process and user flow must adhere to the following steps:

### 🖥️ 1. User Interface & Login Phase
- **Login Screen:** Create a login page that requests the user's **Email address**. 
- **Application Configuration:** Keep the **App ID** and **API Key** credentials configured behind the scenes (e.g., in environment variables or configuration files).
- **Submission:** When the user clicks the login button, call the authorization API.

### 📧 2. Verification Code Delivery & Hidden OTP Retrieval
- **API Call:** Send a POST request to `/auth/api/authorize`.
- **Response Payload:** The API will return an JSON response indicating authorization status and including the 6-digit session `otp`.
- **Keep Behind the Scenes (Crucial):** **DO NOT** display this returned `otp` value to the user or print it in public logs. Store it privately in your application's memory/state variables ("behind the scenes").
- **Email Delivery:** Meanwhile, the authentication server will email the exact same OTP directly to the user's email inbox.

### 🔑 3. OTP Match Check & Application Access
- **OTP Dialog:** Immediately display an input box asking the user to enter the verification code received in their email.
- **Comparison Logic:** Compare the code entered by the user with the stored `otp` value:
  ```javascript
  if (enteredCode === storedOtpFromApiResponse) {
      // Let the user continue to the application
      grantAccess();
  } else {
      // Reject and request the user to try again
      showError("Invalid verification code.");
  }
  ```

### 🚪 4. Automatic Session Logout
- **Process Termination:** To prevent session reuse and track usage metrics correctly, your application **MUST** automatically call the logout tracking endpoint (`/auth/api/track-logout`) every time the application is closed.
- **Implementation triggers:** Listen to application exit events (e.g., window closing, process terminating, page unload, or electron's `will-quit` / `before-unload` events) to trigger this request synchronously before exit.

---

## 📡 Step 2: API Endpoint Implementation

Applications perform user authentication by executing standard JSON POST requests against the Auth Provider APIs.

### 🚀 1. User Authorization Endpoint
Verifies that an email is active, authorized to use your app, dispatches an automated Email verification code, and returns the session OTP.

- **Method:** `POST`
- **URL:** `http://13.234.77.157/auth/api/authorize`
- **Headers:** `Content-Type: application/json`

#### 📤 Request Body
```json
{
  "app_id": "YOUR-APP-UUID-HERE",
  "api_key": "YOUR-SECRET-API-KEY-HERE",
  "email": "user@example.com"
}
```

#### 📥 Success Response (`200 OK`)
Returns true, registers a `LOGIN_INIT` event, triggers Nodemailer to send verification mail, and returns the reference OTP code.
```json
{
  "authorized": true,
  "message": "Verification code sent. Please check your email inbox.",
  "otp": "382109",
  "app_name": "Delta Exchange Utility"
}
```

#### ❌ Failure Responses
- **`401 Unauthorized`**: The `api_key` is incorrect.
- **`403 Forbidden`**: The `email` is not registered, or has been set to **Blocked**.
- **`404 Not Found`**: The `app_id` does not match any application in the database.
- **`500 Internal Server Error`**: Mailer service initialization failed or could not deliver email to the SMTP node.
```json
{
  "authorized": false,
  "message": "Authentication initialization failed: Unable to dispatch verification email."
}
```

---

### 🚪 2. Track Logout Event
Updates the activity logs inside the main dashboard to track exact user durations.

- **Method:** `POST`
- **URL:** `http://13.234.77.157/auth/api/track-logout`
- **Headers:** `Content-Type: application/json`

#### 📤 Request Body
```json
{
  "app_id": "YOUR-APP-UUID-HERE",
  "api_key": "YOUR-SECRET-API-KEY-HERE",
  "email": "user@example.com"
}
```

#### 📥 Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Logged out tracked"
}
```

---

## 🛠️ Best Practices for Developers
1. **Double-Check Flow (OTP Comparison):** Display a secondary input dialogue strictly after an authorized response is received. Locally cross-reference the 6-digit code entered by the user with the returned `otp` field from the API. Do not let the user proceed unless a character-perfect match occurs.
2. **Error Handling:** If the API returns an `authorized: false` boolean, prompt the user to contact their administrator immediately and prevent application entry.
3. **Secure Storage:** Never hardcode your `API Key` inside client-side source code that can be easily decompiled. Inject it through secure runtime environment configurations.
