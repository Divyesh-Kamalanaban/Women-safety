
const BASE_URL = 'http://localhost:3000';

async function run() {
    try {
        // 1. Register/Login
        console.log("1. Registering/Logging in...");
        const email = `test${Date.now()}@example.com`;
        const password = 'password123';

        // Attempt register with ALL required fields
        let res = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password,
                name: 'Test User',
                phoneNumber: '+919000000001',
                emergencyContactName: 'Test Guardian',
                emergencyContactNumber: '+919000000002'
            })
        });

        if (!res.ok) {
            const txt = await res.text();
            console.log("Register failed. Reason:", txt);
            throw new Error("Registration failed");
        }

        // Login to get cookie (Register auto-logs in, but let's be explicit if needed, 
        // actually register returns session cookie usually? checking route: yes setSession called)
        // So we can extract cookie from register response headers?
        // Node fetch might format headers differently.

        // Let's explicitly login to be safe.
        res = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) throw new Error("Login failed");

        const cookies = res.headers.get('set-cookie');
        const token = cookies.split(';')[0];
        console.log("Logged in. Token retrieved.");

        // 2. Get Profile (Check for ID)
        console.log("2. Fetching /api/auth/me...");
        res = await fetch(`${BASE_URL}/api/auth/me`, {
            headers: { 'Cookie': token }
        });
        const meData = await res.json();
        console.log("Profile data ID:", meData.user?.id);

        if (!meData.user || !meData.user.id) {
            throw new Error("FAIL: User ID missing in /api/auth/me response");
        }
        console.log("SUCCESS: User ID present.");

        // 3. Update Profile (Check for Validation)
        console.log("3. Updating Profile...");
        const updatePayload = {
            id: meData.user.id,
            phoneNumber: "+919999999999",
            emergencyContactName: "Guardian Updated",
            emergencyContactNumber: "+918888888888"
        };

        res = await fetch(`${BASE_URL}/api/users/update`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': token
            },
            body: JSON.stringify(updatePayload)
        });

        const updateData = await res.json();
        if (!res.ok) {
            console.error("Update Failed:", updateData);
            throw new Error("Update failed with status " + res.status);
        }

        console.log("SUCCESS: Profile updated.", updateData);

    } catch (e) {
        console.error("Test Failed:", e.message);
        process.exit(1);
    }
}

run();
