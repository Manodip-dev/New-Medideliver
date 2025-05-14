document.addEventListener('DOMContentLoaded', () => {

    // --- Utility Functions ---

    // Function to get cart from localStorage
    function getCart() {
        const cart = localStorage.getItem('cart');
        try {
            // Attempt to parse, return empty array if parsing fails
            return cart ? JSON.parse(cart) : [];
        } catch (e) {
            console.error("Could not parse cart from localStorage", e);
            return [];
        }
    }

    // Function to save cart to localStorage
    function saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Function to update the cart count display in the navbar
    function updateCartCount() {
        const cart = getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountSpans = document.querySelectorAll('.cart-count'); // Get all cart count elements
        cartCountSpans.forEach(span => {
             span.textContent = totalItems;
        });
    }

     // Function to get product details from a product card element
    function getProductDetails(productCardElement) {
        return {
            id: productCardElement.dataset.productId,
            name: productCardElement.dataset.productName,
            price: parseFloat(productCardElement.dataset.productPrice),
            image: productCardElement.dataset.productImage // Assuming you added a data-product-image attribute in HTML
        };
    }


    // --- Cart Interaction (Add to Cart Button & Quantity Control on Product Card) ---
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

    // Handle click on "Add to Cart" button on product cards (initial state)
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const productCard = event.target.closest('.product-card');
            if (productCard) {
                const product = getProductDetails(productCard);
                addItemToCart(product); // Add item to the main cart data

                // Update the UI on the product card
                const quantityControl = productCard.querySelector('.quantity-control');
                const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
                const quantitySpan = productCard.querySelector('.quantity');

                 // Find the item in the updated cart to get the correct quantity
                 const cart = getCart();
                 const itemInCart = cart.find(item => item.id === product.id);

                if (itemInCart) {
                    if (addToCartBtn) addToCartBtn.classList.add('hidden'); // Hide Add to Cart
                    if (quantityControl) quantityControl.classList.remove('hidden'); // Show Quantity Control
                    if (quantitySpan) quantitySpan.textContent = itemInCart.quantity; // Update quantity display
                }

                // Open the cart sidebar/popup
                showCartUI();
            }
        });
    });

     // Handle clicks on quantity control buttons (- and +) on product cards
    document.querySelectorAll('.product-card .quantity-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const productCard = event.target.closest('.product-card');
            if (!productCard) return;

            const product = getProductDetails(productCard);
            const quantitySpan = productCard.querySelector('.quantity');
            const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
            const quantityControl = productCard.querySelector('.quantity-control');

            let cart = getCart();
            const itemIndex = cart.findIndex(item => item.id === product.id);

            if (itemIndex === -1) return; // Should not happen if quantity control is visible

            if (event.target.classList.contains('increase')) {
                cart[itemIndex].quantity += 1;
            } else if (event.target.classList.contains('decrease')) {
                cart[itemIndex].quantity -= 1;
            }

            // Remove item if quantity drops to 0 or less
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1); // Remove the item
                 if (quantityControl) quantityControl.classList.add('hidden'); // Hide Quantity Control
                 if (addToCartBtn) addToCartBtn.classList.remove('hidden'); // Show Add to Cart button
            } else {
                if (quantitySpan) quantitySpan.textContent = cart[itemIndex].quantity; // Update quantity display
            }

            saveCart(cart);
            updateCartCount();
             renderCartItems(); // Re-render items in the sidebar/popup
             updateCartTotal(); // Update total price in sidebar/popup
        });
    });


    // Function to add item to cart (used by product cards and sidebar/popup)
    function addItemToCart(product) {
        let cart = getCart();
        const existingItemIndex = cart.findIndex(item => item.id === product.id);

        if (existingItemIndex > -1) {
            // Item already in cart, increase quantity
            cart[existingItemIndex].quantity += 1;
        } else {
            // Item not in cart, add it
            cart.push({ ...product, quantity: 1 });
        }

        saveCart(cart);
        updateCartCount();
        renderCartItems(); // Re-render items in the sidebar/popup
        updateCartTotal(); // Update total price in sidebar/popup
    }

    // Function to remove item from cart (used by sidebar/popup)
    function removeItemFromCart(productId) {
        let cart = getCart();
        const initialLength = cart.length;
        cart = cart.filter(item => item.id !== productId);

        // If an item was actually removed, update UI
        if (cart.length < initialLength) {
             saveCart(cart);
             updateCartCount();
             renderCartItems(); // Re-render items in the sidebar/popup
             updateCartTotal(); // Update total price in sidebar/popup

            // Find the corresponding product card on the index page and update its UI
            const productCard = document.querySelector(`.product-card[data-product-id="${productId}"]`);
            if (productCard) {
                 const quantityControl = productCard.querySelector('.quantity-control');
                 const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
                 if (quantityControl) quantityControl.classList.add('hidden');
                 if (addToCartBtn) addToCartBtn.classList.remove('hidden');
            }
        }
    }

    // Function to update item quantity in cart (used by sidebar/popup)
    function updateItemQuantity(productId, newQuantity) {
        let cart = getCart();
        const itemIndex = cart.findIndex(item => item.id === productId);

        if (itemIndex === -1) return; // Item not found

        const quantity = parseInt(newQuantity);

        if (!isNaN(quantity) && quantity >= 0) {
            if (quantity === 0) {
                removeItemFromCart(productId); // Use remove function if quantity is 0
            } else {
                cart[itemIndex].quantity = quantity;
                saveCart(cart);
                updateCartCount();
                renderCartItems(); // Re-render items in the sidebar/popup
                updateCartTotal(); // Update total price in sidebar/popup

                // Find the corresponding product card on the index page and update its quantity display
                 const productCard = document.querySelector(`.product-card[data-product-id="${productId}"]`);
                 if (productCard) {
                    const quantitySpan = productCard.querySelector('.quantity');
                     if (quantitySpan) quantitySpan.textContent = quantity;
                 }
            }
        }
    }


    // --- Cart Sidebar/Popup UI ---
    const cartOverlay = document.querySelector('.cart-overlay');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartPopup = document.querySelector('.cart-popup');
    const closeCartButtons = document.querySelectorAll('.close-cart-btn'); // Get all close buttons (sidebar/popup)
    // Select ALL cart icon buttons in the navbar (covers full, collapsed desktop, and mobile)
    const allCartNavButtons = document.querySelectorAll('.navbar .cart-btn');


    // Select both lists for rendering items
    const cartItemsListSidebar = cartSidebar ? cartSidebar.querySelector('.cart-items-list') : null;
    const cartItemsListPopup = cartPopup ? cartPopup.querySelector('.cart-items-list') : null;

    const cartEmptyMessageSidebar = cartSidebar ? cartSidebar.querySelector('.cart-empty-message') : null;
    const cartEmptyMessagePopup = cartPopup ? cartPopup.querySelector('.cart-empty-message') : null;

    const cartSummaryTotalSidebar = cartSidebar ? cartSidebar.querySelector('.cart-total-price') : null;
    const cartSummaryTotalPopup = cartPopup ? cartPopup.querySelector('.cart-total-price') : null;


    const addMoreItemsButtons = document.querySelectorAll('.add-more-items-btn'); // Get all add more buttons
    const goToCartButtons = document.querySelectorAll('.go-to-cart-btn'); // Get all go to cart buttons
    const checkoutButtons = document.querySelectorAll('.checkout-btn'); // Get all checkout buttons

    // Function to show the cart UI (sidebar or popup)
    function showCartUI() {
        const isDesktop = window.innerWidth > 1024; // Use desktop breakpoint for logic
        cartOverlay.classList.add('show'); // Show overlay

        if (isDesktop) {
            if (cartSidebar) cartSidebar.classList.add('show'); // Show sidebar
             // Hide popup if it was somehow visible
            if (cartPopup) cartPopup.classList.remove('show');
        } else {
            if (cartPopup) cartPopup.classList.add('show'); // Show popup
            // Hide sidebar if it was somehow visible
            if (cartSidebar) cartSidebar.classList.remove('show');
        }
        renderCartItems(); // Render items when showing UI
        updateCartTotal(); // Update total when showing UI
    }

    // Function to hide the cart UI (sidebar or popup)
    function hideCartUI() {
        const isDesktop = window.innerWidth > 1024; // Use desktop breakpoint for logic
        cartOverlay.classList.remove('show'); // Hide overlay

        if (isDesktop) {
            if (cartSidebar) cartSidebar.classList.remove('show'); // Hide sidebar
        } else {
            if (cartPopup) cartPopup.classList.remove('show'); // Hide popup
        }
    }

    // Render cart items in the sidebar/popup
    function renderCartItems() {
        const cart = getCart();
        const isDesktop = window.innerWidth > 1024;

        // Determine which list and empty message element to use
        const currentCartItemsList = isDesktop ? cartItemsListSidebar : cartItemsListPopup;
        const currentCartEmptyMessage = isDesktop ? cartEmptyMessageSidebar : cartEmptyMessagePopup;

        if (!currentCartItemsList) return; // Exit if container not found

        currentCartItemsList.innerHTML = ''; // Clear current list

        if (cart.length === 0) {
            if (currentCartEmptyMessage) currentCartEmptyMessage.style.display = 'block';
            currentCartItemsList.style.display = 'none';
        } else {
            if (currentCartEmptyMessage) currentCartEmptyMessage.style.display = 'none';
            currentCartItemsList.style.display = 'block';

            cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('cart-item');
                itemElement.dataset.productId = item.id; // Add product ID for easy lookup

                itemElement.innerHTML = `
                    <img src="${item.image || './images/placeholder.jpg'}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>₹${item.price.toFixed(2)}</p>
                         <div class="cart-item-price">₹${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                    <div class="cart-item-actions">
                         <button class="cart-item-remove"><i class="fas fa-trash-alt"></i></button>
                         <div class="cart-item-quantity-control quantity-control">
                            <button class="quantity-btn decrease">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn increase">+</button>
                        </div>
                    </div>
                `;
                currentCartItemsList.appendChild(itemElement);
            });
             // Add listeners to the newly created quantity control buttons and remove buttons
            addCartItemEventListeners();
        }
    }

    // Add event listeners to quantity control and remove buttons within the rendered cart items
    function addCartItemEventListeners() {
         // Select buttons within both sidebar and popup
        document.querySelectorAll('.cart-sidebar .cart-item-quantity-control .quantity-btn, .cart-popup .cart-item-quantity-control .quantity-btn').forEach(button => {
            button.removeEventListener('click', handleCartItemQuantityChange); // Prevent duplicate listeners
            button.addEventListener('click', handleCartItemQuantityChange);
        });

        document.querySelectorAll('.cart-sidebar .cart-item-remove, .cart-popup .cart-item-remove').forEach(button => {
            button.removeEventListener('click', handleCartItemRemove); // Prevent duplicate listeners
            button.addEventListener('click', handleCartItemRemove);
        });
    }

    // Handler for quantity changes within the cart UI
    function handleCartItemQuantityChange(event) {
        const cartItemElement = event.target.closest('.cart-item');
        if (!cartItemElement) return;

        const productId = cartItemElement.dataset.productId;
        const quantitySpan = cartItemElement.querySelector('.quantity');
        let currentQuantity = parseInt(quantitySpan.textContent);

        if (event.target.classList.contains('increase')) {
            currentQuantity += 1;
        } else if (event.target.classList.contains('decrease')) {
            currentQuantity -= 1;
        }

        updateItemQuantity(productId, currentQuantity);
    }

     // Handler for item removal within the cart UI
    function handleCartItemRemove(event) {
        const cartItemElement = event.target.closest('.cart-item');
        if (!cartItemElement) return;

        const productId = cartItemElement.dataset.productId;
        removeItemFromCart(productId);
    }


    // Update the total price displayed in the sidebar/popup footer
    function updateCartTotal() {
        const cart = getCart();
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

         // Update total in both sidebar and popup
        if (cartSummaryTotalSidebar) {
            cartSummaryTotalSidebar.textContent = `₹${total.toFixed(2)}`;
        }
         if (cartSummaryTotalPopup) {
             cartSummaryTotalPopup.textContent = `₹${total.toFixed(2)}`;
         }
    }


    // Add event listeners to show/hide cart UI for ALL navbar cart buttons
    // This fixes the issue where clicking the cart icon might cause scrolling
    allCartNavButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior (crucial to stop scrolling)
            showCartUI(); // Show the appropriate cart UI (sidebar or popup)
        });
    });


    // Add event listeners to close buttons
    closeCartButtons.forEach(button => {
        button.addEventListener('click', hideCartUI);
    });

    // Close cart UI when clicking outside the sidebar/popup (on the overlay)
    if (cartOverlay) {
        cartOverlay.addEventListener('click', (event) => {
             // Check if the click target is the overlay itself, not the sidebar or popup
            if (event.target === cartOverlay) {
                hideCartUI();
            }
        });
    }

     // Add event listeners for footer buttons in sidebar/popup
    addMoreItemsButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            // This button just closes the UI for now, will link to shopping.html later
            hideCartUI();
            // Optional: Add a slight delay before potentially redirecting later
            // window.location.href = 'shopping.html'; // Uncomment and adjust later
        });
    });

    // "Go to cart" button already has href="cart.html" in HTML
    // "Checkout Directly" button already has href="checkout.html" in HTML
    // No extra JS needed for navigation if href is set directly


    // --- Initialize Product Card UI on Load ---
    // This function checks the cart on load and updates product card UI (button vs quantity control)
    function initializeProductCardUI() {
        const cart = getCart();
        document.querySelectorAll('.product-card').forEach(productCard => {
            const product = getProductDetails(productCard);
            const itemInCart = cart.find(item => item.id === product.id);
            const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
            const quantityControl = productCard.querySelector('.quantity-control');
            const quantitySpan = productCard.querySelector('.quantity');

            if (itemInCart) {
                // Item is in cart, show quantity control
                if (addToCartBtn) addToCartBtn.classList.add('hidden');
                if (quantityControl) quantityControl.classList.remove('hidden');
                if (quantitySpan) quantitySpan.textContent = itemInCart.quantity;
            } else {
                // Item is not in cart, show add to cart button
                 if (addToCartBtn) addToCartBtn.classList.remove('hidden');
                 if (quantityControl) quantityControl.classList.add('hidden');
            }
        });
    }

    // Call this on initial page load
    initializeProductCardUI();


    // --- FAQ Accordion Functionality ---
    const faqItems = document.querySelectorAll('.faq-item');
    // Removed desktopBreakpointFAQ - accordion now works on all screen sizes

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        if (question && answer) {
            // Set initial state for CSS transition
            answer.style.maxHeight = '0';
            answer.style.overflow = 'hidden';
            answer.style.transition = 'max-height 0.3s ease-in-out';
            answer.style.display = 'none'; // Start hidden


            question.addEventListener('click', () => {
                 const isActive = item.classList.contains('active');

                 // Close all other open FAQ items
                 faqItems.forEach(otherItem => {
                     if (otherItem !== item && otherItem.classList.contains('active')) {
                         otherItem.classList.remove('active');
                         const otherAnswer = otherItem.querySelector('.faq-answer');
                         if (otherAnswer) {
                             otherAnswer.style.maxHeight = '0';
                              setTimeout(() => {
                                 if (!otherItem.classList.contains('active')) {
                                      otherAnswer.style.display = 'none';
                                 }
                             }, 300); // Match CSS transition duration
                          }
                     }
                 });

                 // Toggle the clicked item
                 if (!isActive) {
                      item.classList.add('active');
                      answer.style.display = 'block'; // Show display before transition
                      // Use setTimeout to allow display: block to apply before calculating scrollHeight
                      setTimeout(() => {
                          answer.style.maxHeight = answer.scrollHeight + "px";
                      }, 10); // Small delay
                 } else {
                     item.classList.remove('active');
                     answer.style.maxHeight = '0';
                     // Add a small delay before setting display to none
                      setTimeout(() => {
                          if (!item.classList.contains('active')) { // Double check in case user quickly re-opens
                              answer.style.display = 'none';
                          }
                      }, 300); // Match CSS transition duration
                 }
            });

             // Handle resize for FAQ - recalculate max-height if item is open
             const handleFAQResize = () => {
                 if (item.classList.contains('active')) {
                      // If already active, recalculate max-height for smoother resize when open
                      answer.style.display = 'block'; // Ensure display is block
                       setTimeout(() => {
                          answer.style.maxHeight = answer.scrollHeight + "px";
                       }, 10);
                 } else {
                      // Ensure closed items remain hidden and have transition properties
                      answer.style.maxHeight = '0';
                      answer.style.overflow = 'hidden';
                      answer.style.transition = 'max-height 0.3s ease-in-out';
                       // Keep display block for transition to work, but height is 0
                        // Or set display none after transition if desired, but might cause flicker
                 }
             };

             // Initial call and event listener for resize
             handleFAQResize();
             window.addEventListener('resize', handleFAQResize);
        }
    });


    // --- Location Modal Functionality ---
    const locationOverlay = document.querySelector('.location-overlay');
    const locationModal = document.querySelector('.location-modal');
    const desktopLocationTrigger = document.getElementById('desktop-location-trigger');
    const mobileLocationTrigger = document.querySelector('.mobile-location-trigger');
    const closeLocationBtn = document.querySelector('.close-location-btn');
    const selectCurrentLocationOption = document.getElementById('select-current-location');
    const enterManualLocationOption = document.getElementById('enter-manual-location');
    const manualLocationInput = document.querySelector('.manual-location-input');
    const manualLocationInputField = manualLocationInput ? manualLocationInput.querySelector('input') : null;
    const confirmManualLocationButton = manualLocationInput ? manualLocationInput.querySelector('.confirm-manual-location') : null;
    const currentLocationSpan = document.getElementById('current-location');


    // Function to show the location modal
    function showLocationModal() {
        if (locationOverlay) locationOverlay.classList.add('show');
        if (locationModal) locationModal.classList.add('show');
         // Hide manual input when modal opens
         if (manualLocationInput) manualLocationInput.classList.add('hidden');
         // Clear input field when modal opens
         if (manualLocationInputField) manualLocationInputField.value = '';
    }

    // Function to hide the location modal
    function hideLocationModal() {
        if (locationOverlay) locationOverlay.classList.remove('show');
        if (locationModal) locationModal.classList.remove('show');
    }

    // Event listeners to show the modal
    if (desktopLocationTrigger) {
        desktopLocationTrigger.addEventListener('click', showLocationModal);
    }
    if (mobileLocationTrigger) {
        mobileLocationTrigger.addEventListener('click', showLocationModal);
    }

    // Event listeners to hide the modal
    if (closeLocationBtn) {
        closeLocationBtn.addEventListener('click', hideLocationModal);
    }
    if (locationOverlay) {
        locationOverlay.addEventListener('click', (event) => {
             // Close only if clicking directly on the overlay
            if (event.target === locationOverlay) {
                hideLocationModal();
            }
        });
    }

    // Event listener for "Select your current location" option
    if (selectCurrentLocationOption) {
        selectCurrentLocationOption.addEventListener('click', () => {
            // Placeholder for Geolocation API or other logic
            console.log("Attempting to select current location...");
            if (currentLocationSpan) {
                 currentLocationSpan.textContent = 'Fetching Location...';
            }
             // Simulate fetching or use Geolocation API here
             if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    console.log("Latitude:", position.coords.latitude);
                    console.log("Longitude:", position.coords.longitude);
                    // You would typically reverse geocode these coordinates to get a city/pincode
                    if (currentLocationSpan) {
                        currentLocationSpan.textContent = 'Location Found!'; // Or update with actual city/pincode
                    }
                    hideLocationModal(); // Close modal after attempting to get location
                }, error => {
                    console.error("Geolocation error:", error);
                     if (currentLocationSpan) {
                        currentLocationSpan.textContent = 'Location Error'; // Indicate failure
                    }
                     // Keep modal open or show an error message
                });
             } else {
                 console.log("Geolocation is not supported by this browser.");
                 if (currentLocationSpan) {
                    currentLocationSpan.textContent = 'Geolocation Not Supported';
                 }
                 // Keep modal open or show an error message
             }
        });
    }

    // Event listener for "Enter location/pincode manually" option
    if (enterManualLocationOption) {
        enterManualLocationOption.addEventListener('click', () => {
            if (manualLocationInput) {
                manualLocationInput.classList.remove('hidden'); // Show the input field
                 if (manualLocationInputField) manualLocationInputField.focus(); // Focus the input field
            }
        });
    }

    // Event listener for the "Confirm" button in manual input
    if (confirmManualLocationButton && manualLocationInputField) {
        confirmManualLocationButton.addEventListener('click', () => {
            const manualLocation = manualLocationInputField.value.trim();
            if (manualLocation) {
                console.log("Manual Location Entered:", manualLocation);
                // Update the displayed location (you might want to validate this first)
                if (currentLocationSpan) {
                    currentLocationSpan.textContent = manualLocation;
                }
                hideLocationModal(); // Close modal after confirmation
            } else {
                // Provide feedback if the input is empty
                 manualLocationInputField.placeholder = "Please enter Pincode or City";
                 manualLocationInputField.classList.add('input-error'); // Optional: add error styling
                 setTimeout(() => {
                     manualLocationInputField.placeholder = "Enter Pincode or City";
                     manualLocationInputField.classList.remove('input-error');
                 }, 2000); // Remove error styling and reset placeholder
            }
        });

         // Allow pressing Enter in the input field to confirm
        manualLocationInputField.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent default form submission
                 confirmManualLocationButton.click(); // Trigger the confirm button click
            }
        });
    }


    // --- Search Bar Click Functionality (Redirect) ---
    const desktopSearchButton = document.querySelector('.navbar-desktop-full .search-button');
    const desktopSearchInput = document.querySelector('.navbar-desktop-full .search-input');
    const collapsedSearchButton = document.querySelector('.navbar-desktop-collapsed .search-button-collapsed');
    const collapsedSearchInput = document.querySelector('.navbar-desktop-collapsed .search-input-collapsed');
    const mobileSearchButton = document.querySelector('.navbar-mobile .search-button');
    const mobileSearchInput = document.querySelector('.navbar-mobile .search-input');


    // Function to show a simple message box
    function showMessage(message) {
        let messageBox = document.querySelector('.message-box');
        if (!messageBox) {
            messageBox = document.createElement('div');
            messageBox.classList.add('message-box'); // Style this class in CSS
            document.body.appendChild(messageBox);
        }
        messageBox.textContent = message;
        messageBox.classList.add('show');

        // Automatically remove the message box after a few seconds
        setTimeout(() => {
            messageBox.classList.remove('show');
        }, 3000); // Remove after 3 seconds
    }

    // Function to handle search
    function handleSearch(inputElement) {
        const searchTerm = inputElement.value.trim();
        if (searchTerm) {
             window.location.href = `shopping.html?search=${encodeURIComponent(searchTerm)}`;
        } else {
            showMessage("Please enter a medicine name to search."); // Use custom message box
        }
    }

    // Add event listeners for desktop search (both full and collapsed inputs)
    if (desktopSearchButton && desktopSearchInput) {
        desktopSearchButton.addEventListener('click', (event) => {
            event.preventDefault();
            handleSearch(desktopSearchInput);
        });
        desktopSearchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleSearch(desktopSearchInput);
            }
        });
    }

     if (collapsedSearchButton && collapsedSearchInput) {
         collapsedSearchButton.addEventListener('click', (event) => {
            event.preventDefault();
            handleSearch(collapsedSearchInput);
        });
         collapsedSearchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleSearch(collapsedSearchInput);
            }
        });
     }

     // Add event listeners for mobile search
     if (mobileSearchButton && mobileSearchInput) {
         mobileSearchButton.addEventListener('click', (event) => {
            event.preventDefault();
            handleSearch(mobileSearchInput);
        });

         mobileSearchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleSearch(mobileSearchInput);
            }
        });
     }


    // --- Theme Toggle Functionality ---
    const themeToggleBtnDesktopFull = document.getElementById('theme-toggle-desktop-full');
    const themeToggleBtnDesktopCollapsed = document.getElementById('theme-toggle-desktop-collapsed');
    const themeToggleBtnMobile = document.getElementById('theme-toggle-mobile');
    const body = document.body;

    // Function to update theme and button icons
    function updateTheme(isDark) {
        if (isDark) {
            body.classList.add('dark-theme');
            if (themeToggleBtnDesktopFull) themeToggleBtnDesktopFull.innerHTML = '<i class="fas fa-sun"></i> <span class="btn-text">Light Theme</span>';
            if (themeToggleBtnDesktopCollapsed) themeToggleBtnDesktopCollapsed.innerHTML = '<i class="fas fa-sun"></i>';
             if (themeToggleBtnMobile) themeToggleBtnMobile.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-theme');
            if (themeToggleBtnDesktopFull) themeToggleBtnDesktopFull.innerHTML = '<i class="fas fa-moon"></i> <span class="btn-text">Dark Theme</span>';
            if (themeToggleBtnDesktopCollapsed) themeToggleBtnDesktopCollapsed.innerHTML = '<i class="fas fa-moon"></i>';
             if (themeToggleBtnMobile) themeToggleBtnMobile.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        }
    }

    // Set initial theme on load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        updateTheme(true);
    } else {
        updateTheme(false);
    }

    // Add click listeners to all theme toggle buttons
    if (themeToggleBtnDesktopFull) {
        themeToggleBtnDesktopFull.addEventListener('click', () => {
            updateTheme(!body.classList.contains('dark-theme'));
        });
    }
    if (themeToggleBtnDesktopCollapsed) {
        themeToggleBtnDesktopCollapsed.addEventListener('click', () => {
            updateTheme(!body.classList.contains('dark-theme'));
        });
    }
     if (themeToggleBtnMobile) {
        themeToggleBtnMobile.addEventListener('click', () => {
            updateTheme(!body.classList.contains('dark-theme'));
        });
    }


    // --- Desktop Navbar Show/Hide on Scroll ---
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    const navbarDesktop = document.querySelector('.navbar-desktop');
    const navbarDesktopFull = document.querySelector('.navbar-desktop-full');
    const navbarDesktopCollapsed = document.querySelector('.navbar-desktop-collapsed');
    const navbarMobile = document.querySelector('.navbar-mobile');
    const heroSection = document.querySelector('.hero-section'); // Get hero section to determine scroll point
    const desktopBreakpointWidth = 1024; // Match CSS breakpoint


    // Update navbar display and height on load and resize
    const updateNavbarDisplay = () => {
         if (window.innerWidth > desktopBreakpointWidth) {
             // Desktop view
             if (navbarDesktop) navbarDesktop.style.display = 'block';
             if (navbarMobile) navbarMobile.style.display = 'none';
             navbar.style.position = 'fixed';

             // Determine initial state based on scroll position
              const heroBottom = heroSection ? heroSection.offsetHeight + heroSection.offsetTop : 0;
             if (window.pageYOffset >= heroBottom && window.pageYOffset > 0) { // Check both scroll past hero and not at very top
                 navbar.classList.add('collapsed');
                 if (navbarDesktopFull) navbarDesktopFull.style.display = 'none';
                 if (navbarDesktopCollapsed) navbarDesktopCollapsed.style.display = 'flex';
             } else {
                 navbar.classList.remove('collapsed');
                 if (navbarDesktopFull) navbarDesktopFull.style.display = 'flex';
                 if (navbarDesktopCollapsed) navbarDesktopCollapsed.style.display = 'none';
             }

         } else {
             // Mobile/Tablet view
             if (navbarDesktop) navbarDesktop.style.display = 'none';
             if (navbarMobile) navbarMobile.style.display = 'flex';
             navbar.style.position = 'static'; // Static on mobile
             // Ensure desktop navbars are hidden and mobile navbar is displayed
             if (navbarDesktopCollapsed) navbarDesktopCollapsed.style.display = 'none';
             if (navbarDesktopFull) navbarDesktopFull.style.display = 'none';
             if (navbarMobile) navbarMobile.style.display = 'flex';
             navbar.classList.remove('collapsed'); // Mobile doesn't use this class for scroll behavior
         }
    };

    // Initial call
    updateNavbarDisplay();

    // Update on resize with debounce
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
             updateNavbarDisplay();
              // Also re-initialize product card UI and footers on resize in case layout changes affect visibility
             initializeProductCardUI(); // Ensure product card buttons are set correctly on resize
             // Trigger resize handlers for accordions to recalculate heights
             faqItems.forEach(item => {
                 const question = item.querySelector('.faq-question');
                 const answer = item.querySelector('.faq-answer');
                 if (item.classList.contains('active') && answer) {
                     answer.style.display = 'block'; // Ensure display is block for calculation
                      setTimeout(() => {
                         answer.style.maxHeight = answer.scrollHeight + "px";
                      }, 10);
                 } else if (answer) {
                      answer.style.maxHeight = '0';
                     answer.style.overflow = 'hidden';
                     answer.style.transition = 'max-height 0.3s ease-in-out';
                     answer.style.display = 'none';
                 }
             });
             footerCols.forEach(col => {
                  const header = col.querySelector('.footer-col-header');
                 const content = col.querySelector('.footer-col-content');
                  // Check if it's an accordion column that should collapse/expand on mobile
                 const isAccordionColumn = Array.from(footerCols).indexOf(col) >= 1 && Array.from(footerCols).indexOf(col) <= 3;
                  if (content && isAccordionColumn && window.innerWidth <= desktopBreakpointWidth) {
                     // Mobile view, handle accordion collapse/expand state on resize
                      if (!col.classList.contains('active')) {
                         content.style.maxHeight = '0';
                         content.style.overflow = 'hidden';
                         content.style.transition = 'max-height 0.3s ease-in-out';
                         content.style.display = 'none';
                      } else {
                          content.style.display = 'block'; // Ensure display is block for calculation
                           setTimeout(() => {
                              content.style.maxHeight = content.scrollHeight + "px";
                           }, 10);
                      }
                  } else if (content) {
                      // Desktop view or non-accordion column, ensure content is visible
                      content.style.maxHeight = 'none';
                      content.style.overflow = 'visible';
                      content.style.transition = 'none';
                      content.style.display = 'block';
                  }
             });
         }, 200);
    });


    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Desktop Scroll Behavior
        if (window.innerWidth > desktopBreakpointWidth) {
             const heroBottom = heroSection ? heroSection.offsetHeight + heroSection.offsetTop : 0;

            if (scrollTop === 0) {
                 // At the very top, always show full navbar
                navbar.classList.remove('collapsed');
                 if (navbarDesktopFull) navbarDesktopFull.style.display = 'flex';
                 if (navbarDesktopCollapsed) navbarDesktopCollapsed.style.display = 'none';
            } else if (scrollTop >= heroBottom && !navbar.classList.contains('collapsed')) {
                 // Scrolling down past the hero section, collapse navbar
                navbar.classList.add('collapsed');
                 if (navbarDesktopFull) navbarDesktopFull.style.display = 'none';
                 if (navbarDesktopCollapsed) navbarDesktopCollapsed.style.display = 'flex';
            } else if (scrollTop < heroBottom && navbar.classList.contains('collapsed')) {
                // Scrolling up into the hero section, show full navbar
                 navbar.classList.remove('collapsed');
                 if (navbarDesktopFull) navbarDesktopFull.style.display = 'flex';
                 if (navbarDesktopCollapsed) navbarDesktopCollapsed.style.display = 'none';
            }
             // If scrolling below hero but still collapsed, do nothing (already handled by CSS fixed position)

        }
        // Mobile Scroll Behavior: Navbar is static, no show/hide based on scroll position
        // Ensure desktop navbars are hidden if somehow visible on mobile during scroll
         if (window.innerWidth <= desktopBreakpointWidth) {
              if (navbarDesktopCollapsed) navbarDesktopCollapsed.style.display = 'none';
              if (navbarDesktopFull) navbarDesktopFull.style.display = 'none';
              if (navbarMobile) navbarMobile.style.display = 'flex'; // Ensure mobile is shown
         }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });


    // --- Carousel Functionality ---

    // Function to initialize a single carousel
    function initializeCarousel(containerSelector, autoSlideInterval = 8000) { // Adjusted default interval
        const carouselContainer = document.querySelector(containerSelector);
        if (!carouselContainer) {
            console.warn(`Carousel container not found for selector: ${containerSelector}`);
            return;
        }

        const track = carouselContainer.querySelector('.carousel-track');
        const items = track ? track.querySelectorAll('.product-card') : [];
        const leftArrow = carouselContainer.querySelector('.carousel-arrow.left');
        const rightArrow = carouselContainer.querySelector('.carousel-arrow.right');
        const dotsContainer = carouselContainer.querySelector('.carousel-dots');

         // Hide carousel elements if needed or log if essential parts are missing
        if (!track || !leftArrow || !rightArrow || !dotsContainer || items.length === 0) {
             console.warn(`Missing essential elements for carousel: ${containerSelector}. Hiding container.`);
            carouselContainer.style.display = 'none';
            return;
        }


        let currentIndex = 0;
        let itemsPerView = 4;
        let slideInterval;
        let touchStartX = 0;
        let touchEndX = 0;
        const minSwipeDistance = 50;

        // Function to update itemsPerView based on screen width
        function updateItemsPerView() {
            if (window.innerWidth <= 768) {
                itemsPerView = 1;
            } else if (window.innerWidth <= 1024) {
                itemsPerView = 2;
            } else {
                itemsPerView = 4;
            }
            // Recalculate dots and reset position on resize
            generateDots();
             // Adjust current index to be a valid starting point for the new itemsPerView
             // Ensure currentIndex is a multiple of itemsPerView and within bounds
            currentIndex = Math.floor(currentIndex / itemsPerView) * itemsPerView;
             const maxIndex = items.length > itemsPerView ? items.length - itemsPerView : 0;
             if (currentIndex < 0) currentIndex = 0;
             if (currentIndex > maxIndex) currentIndex = maxIndex;


            moveToSlide(currentIndex, false); // Reset position on resize instantly
             // Auto-slide is disabled per user request
        }

        // Function to generate pagination dots
        function generateDots() {
             if (!dotsContainer) return;
            dotsContainer.innerHTML = '';
            // Calculate the number of dots needed based on items and itemsPerView
            // A dot is needed for each "page" of items
            const numDots = items.length > itemsPerView ? Math.ceil(items.length / itemsPerView) : 1; // At least 1 dot if items exist
            for (let i = 0; i < numDots; i++) {
                const dot = document.createElement('span');
                dot.classList.add('dot');
                 // Calculate the start index for this dot's slide
                const slideStartIndex = i * itemsPerView;

                dot.dataset.slideIndex = slideStartIndex;
                dot.addEventListener('click', (event) => {
                    const indexToMoveTo = parseInt(event.target.dataset.slideIndex);
                    moveToSlide(indexToMoveTo);
                    // No auto-slide reset here as auto-slide is removed
                });
                dotsContainer.appendChild(dot);
            }
             updateActiveDot();
        }

        // Function to update active dot
        function updateActiveDot() {
             if (!dotsContainer) return;
            const dots = dotsContainer.querySelectorAll('.dot');
             if (dots.length === 0) return;

             // Find the dot whose slideStartIndex is the largest but not greater than the current displayed index
            let activeDotIndex = 0;
            let maxSlideStartIndex = -1; // Use -1 to ensure the first dot (index 0) is selected if currentIndex is 0
            dots.forEach((dot, index) => {
                const slideStartIndex = parseInt(dot.dataset.slideIndex);
                // Consider the current position relative to the start index of the slides
                 if (currentIndex >= slideStartIndex && slideStartIndex >= maxSlideStartIndex) {
                    maxSlideStartIndex = slideStartIndex;
                    activeDotIndex = index;
                }
            });

            dots.forEach((dot, index) => {
                dot.classList.remove('active');
                if (index === activeDotIndex) {
                    dot.classList.add('active');
                }
            });
        }


        // Function to move the carousel to a specific index
        function moveToSlide(index, smooth = true) {
             const item = items[0];
            if (!item || !track) return; // Prevent error if no items or track

            const itemWidth = item.offsetWidth;
            const itemStyle = window.getComputedStyle(item);
            const itemMarginRight = parseInt(itemStyle.marginRight) || 0; // Use 0 if margin is not set
            const totalItemWidth = itemWidth + itemMarginRight;

             // Calculate the maximum possible index to prevent showing empty space
             const maxIndex = items.length > itemsPerView ? items.length - itemsPerView : 0;

             // Calculate the target index, handling looping
             let targetIndex = index;

             // Implement looping
             if (targetIndex < 0) {
                 // If moving left from the first slide, go to the last possible slide
                 targetIndex = maxIndex;
             } else if (targetIndex > maxIndex) {
                 // If moving right from the last slide, go to the first slide
                 targetIndex = 0;
             }

             currentIndex = targetIndex;


            let translation = -currentIndex * totalItemWidth;

             // Ensure translation does not go beyond the valid range
            const trackWidth = track.scrollWidth;
            const containerStyle = window.getComputedStyle(carouselContainer);
            const containerWidth = carouselContainer.offsetWidth - parseInt(containerStyle.paddingLeft) - parseInt(containerStyle.paddingRight);
            const maxTranslation = trackWidth > containerWidth ? trackWidth - containerWidth : 0;

             // The translation should not exceed the point where the last visible item is aligned to the right edge
             // And cannot be positive
             translation = Math.max(translation, -maxTranslation);
             translation = Math.min(translation, 0);


            if (smooth) {
                 track.style.transition = 'transform 0.5s ease-in-out';
            } else {
                 track.style.transition = 'none';
            }

            track.style.transform = `translateX(${translation}px)`;

            updateActiveDot();
        }

        // Event listeners for arrows
        if (leftArrow) {
            leftArrow.addEventListener('click', () => {
                moveToSlide(currentIndex - itemsPerView);
                // No auto-slide reset here
            });
        }

        if (rightArrow) {
            rightArrow.addEventListener('click', () => {
                moveToSlide(currentIndex + itemsPerView);
                 // No auto-slide reset here
            });
        }


        // Touch event listeners for swiping
        if (track) {
            track.addEventListener('touchstart', (event) => {
                touchStartX = event.changedTouches[0].screenX;
                 track.style.transition = 'none'; // Disable transition during swipe
            });

             track.addEventListener('touchmove', (event) => {
                 // Optional: Live dragging - more complex but possible
                 // const touchMoveX = event.changedTouches[0].screenX;
                 // const dragDistance = touchMoveX - touchStartX;
                 // const currentTranslateX = getTranslateX(track); // Need a helper function for this
                 // track.style.transform = `translateX(${currentTranslateX + dragDistance}px)`;
                 // touchStartX = touchMoveX; // Update start for continuous drag
             });


            track.addEventListener('touchend', (event) => {
                touchEndX = event.changedTouches[0].screenX;
                handleSwipe();
                 // Re-enable transition after swipe is done
                track.style.transition = 'transform 0.5s ease-in-out';
            });
        }


        function handleSwipe() {
            const swipeDistance = touchEndX - touchStartX;

            if (swipeDistance > minSwipeDistance) {
                // Swipe right (move left)
                moveToSlide(currentIndex - itemsPerView);
            } else if (swipeDistance < -minSwipeDistance) {
                // Swipe left (move right)
                moveToSlide(currentIndex + itemsPerView);
            } else {
                 // If swipe distance is too small, snap back to the current slide
                 moveToSlide(currentIndex, true); // Use smooth transition to snap back
            }
             // No auto-slide reset here
        }

        // Helper to get current transform X value (useful for live dragging)
         function getTranslateX(element) {
             const style = window.getComputedStyle(element);
             const transform = style.transform;
             if (transform === 'none') return 0;
             const matrix = transform.match(/^matrix\((.+)\)$/);
             if (matrix) {
                 // matrix(a, b, c, d, tx, ty)
                 return parseFloat(matrix[1].split(', ')[4]);
             }
             const matrix3d = transform.match(/^matrix3d\((.+)\)$/);
             if (matrix3d) {
                 // matrix3d(m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44)
                 return parseFloat(matrix3d[1].split(', ')[12]);
             }
             return 0;
         }


        // Remove automatic sliding start and reset functions
        // Auto-sliding is disabled per user request
        // function startAutoSlide() { /* Removed */ }
        // function resetAutoSlide() { /* Removed */ }


        // Initialize carousel on load
        updateItemsPerView(); // Set initial items per view and generate dots
        // Removed startAutoSlide();

        // Update carousel on window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            // Use a slight delay to allow CSS layout to update before recalculating sizes
            resizeTimeout = setTimeout(updateItemsPerView, 200);
        });

         // Re-initialize product card button states within this specific carousel on load
         const cart = getCart();
         items.forEach(productCard => {
            const product = getProductDetails(productCard);
            const itemInCart = cart.find(item => item.id === product.id);
            const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
            const quantityControl = productCard.querySelector('.quantity-control');
            const quantitySpan = productCard.querySelector('.quantity');

            if (itemInCart) {
                if (addToCartBtn) addToCartBtn.classList.add('hidden');
                if (quantityControl) quantityControl.classList.remove('hidden');
                if (quantitySpan) quantitySpan.textContent = itemInCart.quantity;
            } else {
                 if (addToCartBtn) addToCartBtn.classList.remove('hidden');
                 if (quantityControl) quantityControl.classList.add('hidden');
            }
        });

    }

    // Initialize carousels for both sections
    initializeCarousel('.featured-section .carousel-container'); // Auto-slide interval parameter removed
    initializeCarousel('.most-selling-section .carousel-container'); // Auto-slide interval parameter removed


    // --- Mobile Navbar Toggle ---
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarMobileMenu = document.querySelector('.navbar-mobile-menu');

    if (navbarToggler && navbarMobileMenu) {
        navbarToggler.addEventListener('click', () => {
            navbarMobileMenu.classList.toggle('active'); // Toggle 'active' class for styling
            navbarToggler.classList.toggle('active'); // Toggle 'active' class for icon animation
        });

         // Close mobile menu when a link is clicked (optional)
         const mobileNavLinks = navbarMobileMenu.querySelectorAll('a');
         mobileNavLinks.forEach(link => {
             link.addEventListener('click', () => {
                 if (navbarMobileMenu.classList.contains('active')) {
                     navbarMobileMenu.classList.remove('active');
                     navbarToggler.classList.remove('active');
                 }
             });
         });
    }


    // --- Footer Accordion Functionality (Mobile) ---
    const footerCols = document.querySelectorAll('.footer-col');
    const desktopBreakpointFooter = 1024; // Use breakpoint for footer logic

    footerCols.forEach((col, index) => {
        const header = col.querySelector('.footer-col-header');
        const content = col.querySelector('.footer-col-content');
        const toggleIcon = col.querySelector('.footer-toggle-icon');

        // Apply accordion behavior only to the first 4 columns (0-indexed) that have the content wrapper
        // These are "MediDeliver", "About", "Information", "Product Categories"
        // Based on the new HTML structure, columns 1, 2, and 3 should have the toggle
        const isAccordionColumn = index >= 1 && index <= 3; // Indices for About, Information, Product Categories

        if (header && content && isAccordionColumn) { // Check for header, content, and if it's an accordion column
             header.addEventListener('click', () => {
                 // Only activate accordion on mobile screens
                 if (window.innerWidth <= desktopBreakpointFooter) {
                     const isActive = col.classList.contains('active');

                     // Close all other open footer columns that are accordions on mobile
                     footerCols.forEach((otherCol, otherIndex) => {
                          const isOtherAccordionColumn = otherIndex >= 1 && otherIndex <= 3;
                         if (otherCol !== col && otherCol.classList.contains('active') && isOtherAccordionColumn) {
                             otherCol.classList.remove('active');
                             const otherContent = otherCol.querySelector('.footer-col-content');
                             if(otherContent) {
                                 otherContent.style.maxHeight = '0';
                                  setTimeout(() => {
                                     if (!otherCol.classList.contains('active')) {
                                          otherContent.style.display = 'none';
                                     }
                                 }, 300); // Match CSS transition duration
                              }
                         }
                     });

                     // Toggle the clicked item
                     if (!isActive) {
                          col.classList.add('active');
                          content.style.display = 'block'; // Show display before transition
                          // Use setTimeout to allow display: block to apply before calculating scrollHeight
                          setTimeout(() => {
                              content.style.maxHeight = content.scrollHeight + "px";
                          }, 10); // Small delay
                     } else {
                         col.classList.remove('active');
                         content.style.maxHeight = '0';
                         // Add a small delay before setting display to none
                          setTimeout(() => {
                              if (!col.classList.contains('active')) { // Double check in case user quickly re-opens
                                  content.style.display = 'none';
                              }
                          }, 300); // Match CSS transition duration
                     }
                 }
            });

             // Handle resize for footer accordion columns - ensure open on desktop, collapsed on mobile
             const handleFooterAccordionResize = () => {
                 if (window.innerWidth > desktopBreakpointFooter) { // Desktop view
                     content.style.maxHeight = 'none'; // Ensure content is visible
                     content.style.overflow = 'visible';
                     content.style.transition = 'none';
                     content.style.display = 'block'; // Ensure display is block
                     col.classList.remove('active'); // Remove active class
                 } else { // Mobile/Tablet view
                     // Reset to collapsed state on resize to mobile if not active
                     if (!col.classList.contains('active')) {
                         content.style.maxHeight = '0';
                         content.style.overflow = 'hidden';
                         content.style.transition = 'max-height 0.3s ease-in-out';
                         content.style.display = 'none'; // Start hidden
                     } else {
                          // If already active, recalculate max-height (optional, for smoother resize when open)
                          content.style.display = 'block'; // Ensure display is block
                           setTimeout(() => {
                              content.style.maxHeight = content.scrollHeight + "px";
                           }, 10);
                     }
                 }
             };

             // Initial call and event listener for resize for accordion columns
             handleFooterAccordionResize();
             window.addEventListener('resize', handleFooterAccordionResize);

         } else if (content) {
             // For non-accordion columns ("MediDeliver", "Become a Partner", "Join With Us")
             // Ensure they are always visible on mobile and desktop
              const handleFooterNonAccordionResize = () => {
                 content.style.maxHeight = 'none'; // Ensure content is visible
                 content.style.overflow = 'visible';
                 content.style.transition = 'none';
                 content.style.display = 'block'; // Ensure display is block
              };

              // Initial call and event listener for resize for non-accordion columns
              handleFooterNonAccordionResize();
              window.addEventListener('resize', handleFooterNonAccordionResize);
         }
    });


    // --- Back to Top Button Functionality ---
    const backToTopBtn = document.getElementById('back-to-top-btn');
    const showButtonThreshold = 300;

    window.addEventListener('scroll', () => {
        // Show/hide button based on scroll position
        if ((window.pageYOffset || document.documentElement.scrollTop) > showButtonThreshold) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    backToTopBtn.addEventListener('click', () => {
         // Add a temporary class for animation feedback
         backToTopBtn.classList.add('clicked');
         // Remove the class after the animation duration
         setTimeout(() => {
             backToTopBtn.classList.remove('clicked');
         }, 200); // Match CSS animation duration

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Initial calls on page load
    updateCartCount();
    renderCartItems(); // Render cart items in the sidebar/popup on load
    initializeProductCardUI(); // Ensure product card buttons are set correctly on load

});

// Add a simple message box for search validation
const style = document.createElement('style');
style.textContent = `
.message-box {
    position: fixed;
    bottom: 80px; /* Above the back-to-top button */
    left: 50%;
    transform: translateX(-50%);
    background-color: #333;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
    font-family: 'Lexend', sans-serif;
    font-size: 1rem;
    text-align: center;
}
.message-box.show {
    opacity: 1;
    visibility: visible;
}

/* Optional: add error styling for location input */
.manual-location-input input.input-error {
    border-color: #e53e3e !important;
}
`;
document.head.appendChild(style);