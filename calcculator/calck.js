// Wait for the DOM to fully load before running our JavaScript
document.addEventListener('DOMContentLoaded', function () {
    // Get elements we'll work with
    const screen = document.querySelector('.calc-screen');
    const keys = document.querySelectorAll('.calc-key');
    const backBtn = document.getElementById('backBtn');

    // Variables to store our calculation state
    let currentCalculation = '0';
    let resetScreenOnNextInput = false;

    // Initialize the calculator
    initializeCalculator();

    // Setup event listeners for all buttons
    setupEventListeners();

    // Function to initialize the calculator
    function initializeCalculator() {
        updateScreen();
    }

    // Function to set up all event listeners
    function setupEventListeners() {
        // Add click events to all calculator keys
        keys.forEach(key => {
            key.addEventListener('click', function () {
                handleKeyPress(this.textContent);
            });
        });

        // Handle the back button click
        backBtn.addEventListener('click', function () {
            // In a real application, this would go back to the main page
            alert('Return to main page clicked');
            // Example: window.location.href = 'index.html';
        });
    }

    // Function to update the calculator screen
    function updateScreen() {
        screen.textContent = currentCalculation;
    }

    // Main function to handle when a key is pressed
    function handleKeyPress(keyValue) {
        // Use switch statement to handle different key types
        switch (keyValue) {
            case 'C':
                clearCalculator();
                break;

            case '=':
                calculateResult();
                break;

            case 'sin':
            case 'cos':
            case 'tan':
                calculateTrigFunction(keyValue);
                break;

            default:
                handleInput(keyValue);
                break;
        }

        // Update the display after any key press
        updateScreen();
    }

    // Function to handle regular input (numbers, operators, etc.)
    function handleInput(keyValue) {
        // If we need to reset the screen (after calculation)
        if (resetScreenOnNextInput) {
            // Use switch to handle different input types after a calculation
            switch (true) {
                // If it's a number or decimal point
                case (!isNaN(keyValue) || keyValue === '.'):
                    currentCalculation = keyValue === '.' ? '0.' : keyValue;
                    break;

                // If it's an operator
                default:
                    currentCalculation = currentCalculation + keyValue;
                    break;
            }
            resetScreenOnNextInput = false;
        }
        else {
            // Regular input handling
            switch (currentCalculation) {
                // If the screen currently shows just 0
                case '0':
                    currentCalculation = keyValue === '.' ? '0.' : keyValue;
                    break;

                // For all other cases, append the new input
                default:
                    currentCalculation += keyValue;
                    break;
            }
        }
    }

    // Function to clear the calculator
    function clearCalculator() {
        currentCalculation = '0';
        resetScreenOnNextInput = false;
    }

    // Function to calculate the result
    function calculateResult() {
        try {
            // Replace × with * and ÷ with / for JavaScript's eval function
            let calculation = currentCalculation.replace(/×/g, '*').replace(/÷/g, '/');

            // Evaluate the calculation
            const result = eval(calculation);

            // Format the result, handle special cases
            if (isNaN(result) || !isFinite(result)) {
                currentCalculation = 'Error';
            } else {
                currentCalculation = formatResult(result);
            }
            resetScreenOnNextInput = true;
        } catch (error) {
            // Handle any errors in the calculation
            currentCalculation = 'Error';
            resetScreenOnNextInput = true;
        }
    }

    // Function to calculate trigonometric functions
    function calculateTrigFunction(trigFunction) {
        try {
            // First evaluate what's on the screen
            let currentValue = getCurrentValue();

            // Convert degrees to radians (Math functions use radians)
            const valueInRadians = parseFloat(currentValue) * (Math.PI / 180);

            // Calculate the appropriate trig function using switch
            let result;
            switch (trigFunction) {
                case 'sin':
                    result = Math.sin(valueInRadians);
                    break;

                case 'cos':
                    result = Math.cos(valueInRadians);
                    break;

                case 'tan':
                    result = Math.tan(valueInRadians);
                    break;

                default:
                    throw new Error('Unknown trig function');
            }

            // Format and display the result
            currentCalculation = formatResult(result);
            resetScreenOnNextInput = true;
        } catch (error) {
            currentCalculation = 'Error';
            resetScreenOnNextInput = true;
        }
    }

    // Helper function to get the current value (evaluates expressions if needed)
    function getCurrentValue() {
        let currentValue = currentCalculation;

        // If it's a valid expression, evaluate it first
        if (currentValue !== '0' && currentValue !== 'Error') {
            try {
                const calculation = currentValue.replace(/×/g, '*').replace(/÷/g, '/');
                return eval(calculation);
            } catch (e) {
                // If we can't evaluate, return as is
                return currentValue;
            }
        }

        return currentValue;
    }

    // Helper function to format results for display
    function formatResult(result) {
        // Convert to string and limit to reasonable precision
        let formattedResult = parseFloat(result.toFixed(8)).toString();

        // Use scientific notation for very large/small numbers
        if (formattedResult.length > 12) {
            formattedResult = parseFloat(result).toExponential(4);
        }

        return formattedResult;
    }
});