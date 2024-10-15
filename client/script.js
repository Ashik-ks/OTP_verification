const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

async function signup(event) {
    event.preventDefault(); // Prevent default form submission

    let email = document.getElementById('email').value.trim();
    let name = document.getElementById('name').value.trim();
    let password = document.getElementById('password').value;

    // Validate input
    if (!email || !name || !password) {
        alert("All fields are required.");
        return;
    }

    let data = { email, name, password };
    let str_data = JSON.stringify(data);

    try {
        let response = await fetch('/signup', {
            method: 'POST',
            headers: { 'Content-Type': "application/json" },
            body: str_data,
        });

        console.log("response : ", response);

        // Check if response is successful
        if (response.ok) {
            let parsed_response = await response.json();
            console.log("parsed_response : ", parsed_response);

            // Navigate to verification page if successful
            if (parsed_response.success) {
                const { otptoken } = parsed_response.data;
                const { name, email, password } = parsed_response.data.body;

                // Encode parameters
                const params = new URLSearchParams({ pr: otptoken, name, email, password }).toString();
                window.location.href = `verification.html?${params}`;
            } else {
                alert(parsed_response.message || "User not added.");
            }
        } else {
            let errorResponse = await response.json();
            alert(errorResponse.message || "An error occurred. Please try again.");
        }

    } catch (error) {
        console.error("Error during signup: ", error);
        alert("An error occurred while signing up. Please try again.");
    }
}


// Attach signup to the form's onsubmit
document.querySelector('.form-container.sign-up form').onsubmit = signup;


async function verifyOTP() {
    // Get query parameters from the URL
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const otpToken = urlParams.get("pr");
    console.log("otpToken:", otpToken);

    const name = urlParams.get("name");
    console.log("name:", name);
    const email = urlParams.get("email");
    const password = urlParams.get("password");

    const otp = document.getElementById('otp').value.trim();

    // Prepare the data to send in the request
    const data = { otp, name, email, password };
    const requestBody = JSON.stringify(data);

    try {
        // Send the OTP verification request
        const response = await fetch('/verifyOTP', {
            method: 'POST',
            headers: {
                'Content-Type': "application/json",
                'Authorization': `Bearer ${otpToken}`
            },
            body: requestBody,
        });

        console.log("Response:", response);

        if (response.ok) {
            const parsedResponse = await response.json();
            console.log("Parsed Response:", parsedResponse);

            if (parsedResponse.success) {
                alert("User verified successfully!");

                // Ensure tokenkey is defined from the response
                const tokenkey = parsedResponse.tokenkey; // Change based on actual response structure
                window.location.href = `user.html`;
            } else {
                alert(parsedResponse.message || "Verification failed. Please try again.");
            }
        } else {
            const errorResponse = await response.json();
            alert(errorResponse.message || "An error occurred during verification.");
        }

    } catch (error) {
        console.error("Error during OTP verification:", error);
        alert("An error occurred while verifying OTP. Please try again.");
    }
}

async function getUsers() {
    try {
        let response = await fetch('/users', {
            method: 'GET',
            headers: {
                'Content-Type': "application/json",
            },
        });

        let parsed_response = await response.json();
        console.log("parsed_response : ", parsed_response);
    
        let data = parsed_response.data;
        console.log('data : ', data);
    
        let datacontainer = document.getElementById("datacontainer");
        let rows = ''
    
        for (i = 0; i < data.length; i++) {
            // let id = data[i]._id;
            rows = rows + `
    
         <div class=" bg-white shadow-sm p-3 rounded">
    <div class="row d-flex justify-content-center align-items-center">
        <div class="col text-center text-dark" style="font-size: 18px; font-weight: 700;">
            ${data[i].name}
        </div>
        <div class="col text-center text-dark fs-5 fw-bold" style="font-size: 18px;">
            ${data[i].email}
        </div>
    </div>
</div>

            `
        }
    
        datacontainer.innerHTML = rows;
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while fetching user data. Please try again.");
    }
}



