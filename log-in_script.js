document.addEventListener('DOMContentLoaded', () => {

    // --- Elements ---
    const loginSection = document.getElementById('login-section');
    const signupSection = document.getElementById('signup-section');
    const showSignupLink = document.getElementById('show-signup-link');
    const signupForm = document.getElementById('signup-form');
    const stepIndicator = document.getElementById('step-indicator');
    const steps = stepIndicator ? stepIndicator.querySelectorAll('.step') : [];
    const signupSteps = signupForm ? signupForm.querySelectorAll('.signup-step') : [];
    const nextStepButtons = signupForm ? signupForm.querySelectorAll('.next-step-btn') : [];
    const prevStepButtons = signupForm ? signupForm.querySelectorAll('.prev-step-btn') : [];
    const goToLoginButton = signupSection ? signupSection.querySelector('.go-to-login-btn') : null;
    const loginForm = document.getElementById('login-form');
    const mainBackBtn = document.getElementById('main-back-btn');
    const backBtnText = document.getElementById('back-btn-text');
    const otpInput = document.getElementById('otp'); // Get the OTP input
    const otpVerificationStatus = document.getElementById('otp-verification-status'); // Get the status div

    let currentStep = 1; // Start at step 1 for sign up

    // Track visited steps to allow clicking back
    const visitedSteps = new Set();
    visitedSteps.add(1); // Step 1 is visited initially


    // --- Functions ---

    // Function to show a specific sign-up step
    function showStep(stepNumber) {
        // Ensure the requested step is within bounds
        if (stepNumber < 1 || stepNumber > signupSteps.length) {
            console.error("Invalid step number:", stepNumber);
            return;
        }

        // Hide all signup steps and deactivate step indicators
        signupSteps.forEach(step => {
            step.classList.remove('active');
            step.style.display = 'none'; // Explicitly hide non-active steps
        });
        steps.forEach(step => {
            step.classList.remove('active');
        });

        // Show the requested step and activate its indicator
        const targetStep = signupSection.querySelector(`.signup-step[data-step="${stepNumber}"]`);
        const targetIndicator = stepIndicator.querySelector(`.step[data-step="${stepNumber}"]`);

        if (targetStep) {
            targetStep.classList.add('active');
            targetStep.style.display = 'flex'; // Use flex display for the step content
        }
        if (targetIndicator) {
            targetIndicator.classList.add('active');
        }

        currentStep = stepNumber; // Update current step
        visitedSteps.add(stepNumber); // Mark this step as visited

        // Manage button visibility (optional, based on design preference)
        // For this implementation, Prev/Next buttons handle navigation
    }

    // Function to transition from Login to Sign Up
    function showSignup() {
        if (loginSection && signupSection) {
            loginSection.classList.remove('active');
            loginSection.classList.add('hidden');

            // Use a slight delay for the transition
            setTimeout(() => {
                 signupSection.classList.remove('hidden');
                 signupSection.classList.add('active');
                 showStep(currentStep); // Show the current step (starts at 1)
                 updateBackButton('login'); // Update back button for signup section
            }, 50);
        }
    }

     // Function to transition from Sign Up back to Login
     function showLogin() {
         if (loginSection && signupSection) {
             signupSection.classList.remove('active');
             signupSection.classList.add('hidden');

             // Use a slight delay for the transition
             setTimeout(() => {
                 loginSection.classList.remove('hidden');
                 loginSection.classList.add('active');
                 updateBackButton('home'); // Update back button for login section
             }, 50);
         }
     }

     // Function to update the back button text and link
     function updateBackButton(state) {
         if (mainBackBtn && backBtnText) {
             if (state === 'home') {
                 mainBackBtn.href = 'index.html';
                 backBtnText.textContent = 'Back to Homepage';
             } else if (state === 'login') {
                 mainBackBtn.href = '#'; // Prevent default navigation
                 backBtnText.textContent = 'Back to Login';
             }
         }
     }

     // Function to show a temporary message (similar to the one in script.js)
    function showMessage(message, type = 'info') {
        let messageBox = document.querySelector('.message-box');
        if (!messageBox) {
            messageBox = document.createElement('div');
            messageBox.classList.add('message-box'); // Style this class in CSS
            document.body.appendChild(messageBox);
        }
        messageBox.textContent = message;
        messageBox.className = 'message-box show ' + type; // Add type class for styling

        // Automatically remove the message box after a few seconds
        setTimeout(() => {
            messageBox.classList.remove('show');
        }, 3000); // Remove after 3 seconds
    }


    // --- Event Listeners ---

    // Handle click on "Create now" link
    if (showSignupLink) {
        showSignupLink.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior
            showSignup();
        });
    }

    // Handle clicks on step indicator numbers
    steps.forEach(step => {
        step.addEventListener('click', () => {
            const stepNumber = parseInt(step.getAttribute('data-step'));
            // Only allow navigating to visited steps
            if (visitedSteps.has(stepNumber)) {
                showStep(stepNumber);
            } else {
                // Optionally provide feedback that this step hasn't been reached yet
                showMessage(`Please complete Step ${currentStep} first.`, 'warning');
            }
        });
    });


    // Handle clicks on "Next" buttons in sign-up steps
    nextStepButtons.forEach(button => {
        button.addEventListener('click', () => {
            const currentStepElement = signupSection.querySelector(`.signup-step[data-step="${currentStep}"]`);
            let inputs = currentStepElement.querySelectorAll('input[required]');
            let isValid = true;

            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('input-error');
                } else {
                    input.classList.remove('input-error');
                }
            });

            // Special check for gender radio buttons in Step 1
             if (currentStep === 1) {
                 const genderRadios = currentStepElement.querySelectorAll('input[name="gender"]');
                 let genderSelected = false;
                 genderRadios.forEach(radio => {
                     if (radio.checked) {
                         genderSelected = true;
                     }
                 });
                 if (!genderSelected) {
                     isValid = false;
                     showMessage("Please select a gender.", 'warning');
                 }
             }

             // Special check for OTP method radio buttons in Step 3 (before OTP input appears)
             if (currentStep === 3) {
                 const otpMethodRadios = currentStepElement.querySelectorAll('input[name="otp_method"]');
                 let otpMethodSelected = false;
                 otpMethodRadios.forEach(radio => {
                     if (radio.checked) {
                         otpMethodSelected = true;
                     }
                 });
                 if (!otpMethodSelected) {
                      isValid = false;
                      showMessage("Please choose where to receive the OTP.", 'warning');
                 } else {
                     // If method is selected, allow moving forward to OTP input
                     // This next button is technically for selecting the method, not submitting OTP
                     // We'll handle OTP input verification separately below
                 }
             }


            if (isValid) {
                 // In Step 3, the "Next" button is just for selecting the method, not submitting the OTP.
                 // We proceed to the next logical state within Step 3 (entering OTP) or the next step (4)
                 if (currentStep === 3) {
                     // After selecting OTP method, we might visually indicate where OTP is sent
                     // For this simplified flow, we'll just wait for OTP input
                     showMessage("OTP sent to your selected method (simulated).", 'info');
                     // No automatic step progression here, the user needs to enter OTP
                 } else if (currentStep < 4) { // Ensure we don't go past step 4
                     showStep(currentStep + 1);
                 }
            } else {
                 showMessage("Please fill in all required fields or make selections.", 'warning');
            }
        });
    });

    // Handle clicks on "Previous" buttons in sign-up steps
    prevStepButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (currentStep > 1) { // Ensure we don't go before step 1
                showStep(currentStep - 1);
            }
        });
    });

    // Handle click on the main back button (behaves differently in login vs signup)
    if (mainBackBtn) {
        mainBackBtn.addEventListener('click', (event) => {
            // If the button text is "Back to Login", override default behavior
            if (backBtnText.textContent === 'Back to Login') {
                event.preventDefault(); // Prevent navigation to '#'
                showLogin(); // Call the function to show the login section
            }
            // If text is "Back to Homepage", default link behavior takes over
        });
    }


    // Handle click on "Go to Login" button in confirmation step
    if (goToLoginButton) {
        goToLoginButton.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior
            showLogin();
        });
    }

    // Handle Login Form Submission (Placeholder)
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default form submission
            console.log("Login form submitted!");
            showMessage("Login button clicked (Placeholder)", 'info');
            // window.location.href = 'dashboard.html'; // Example redirect
        });
    }

    // Handle OTP input in Step 3
    if (otpInput) {
        otpInput.addEventListener('input', () => {
            if (otpInput.value.length === 4) {
                // Simulate successful verification after 4 digits
                otpVerificationStatus.textContent = 'Verification Complete!';
                otpVerificationStatus.classList.remove('error');
                otpVerificationStatus.classList.add('success');

                // Automatically move to the next step (Confirmation) after a short delay
                setTimeout(() => {
                     showStep(4);
                }, 500); // Wait for 0.5 seconds
            } else {
                otpVerificationStatus.textContent = ''; // Clear status if less than 4 digits
                 otpVerificationStatus.classList.remove('success', 'error');
            }
        });

         // Optional: Clear verification status when user focuses on the input again
         otpInput.addEventListener('focus', () => {
             otpVerificationStatus.textContent = '';
             otpVerificationStatus.classList.remove('success', 'error');
             otpInput.classList.remove('input-error');
         });
    }


    // --- Initial Setup ---
    // Set initial back button text and link
    updateBackButton('home');

    // Ensure only the login section is visible on page load
    // The login section has the 'active' class in HTML initially
    // The signup section has the 'hidden' class in HTML initially
    // showStep(1) is called within showSignup() when the user clicks "Create now"
});