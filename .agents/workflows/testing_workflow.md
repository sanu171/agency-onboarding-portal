---
description: How to test the Agency Onboarding Portal end-to-end
---
# Agency Client Onboarding Workflow

Welcome to your completed project! Here is the step-by-step workflow for how an Agency Owner uses the system to automatically onboard a new client.

### 1. Login to the Agency Dashboard
Open your browser and navigate to `http://localhost:5173`. We have seeded the database with a powerful test agency ready to go!
- **Email:** `admin@acme.com`
- **Password:** `123`

### 2. View your Onboarding Templates
Click on the **"Templates"** tab on the left sidebar.
You will see a pre-built template called `"Standard Web Build Onboarding"`. Take a look at the settings—it requires all 5 steps (Intake, Files, Contract, $1500 Payment, and Booking).

### 3. Generate a Client Magic Link
1. Go back to the **"Overview"** tab.
2. Click the blue **"New Client"** button in the top right.
3. Select the `"Standard Web Build Onboarding"` template you viewed.
4. Enter test client details (for example, Name: `Jane Doe`).
5. Click **"Generate Link"**.
6. The system will give you a unique, encrypted magic link url (e.g., `http://localhost:5173/onboard/uuid...`). **Copy this link!**

> In a production system, you would automatically email or Slack this link to your client. For this test, you'll act as the client yourself.

### 4. Act as the Client (The Onboarding Experience)
Open an **Incognito Window** (so you don't share cookies) and paste the magic link.
You will immediately notice the UI is custom-branded to the Agency's colors and logo without requiring the client to create a password or log in manually!

Go through the robust 5-step flow:
1. **Intake Form:** Provide some sample text outlining project requirements.
2. **File Uploads:** Drag and drop a dummy image or PDF into the dropzone. Click 'Save & Continue'.
3. **Contract Signing:** Read the pre-filled Master Service Agreement and physically type your name into the Electronic Signature box. 
4. **Payment Checkout:** Since we are using a mock Stripe endpoint, simply type in a random 16-digit number (e.g. `4242...`) and click Pay.
5. **Call Booking:** Select an available calendar time slot for tomorrow and hit 'Confirm'.

### 5. Verify the Results
Once the celebration screen appears in the client portal, close the incognito window. 

Return to your main browser where you are logged in as the Agency Owner. **Refresh your Overview page.**
You will proudly see `Jane Doe` listed in your dashboard with their status automatically synced to **"complete"**! You'd now be fully ready to begin their project!
