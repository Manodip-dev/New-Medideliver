document.addEventListener('DOMContentLoaded', () => {

    // --- FAQ Accordion Functionality ---
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer'); // Get the answer element

        // Ensure question and answer exist before adding click listener
        if (question && answer) {
            question.addEventListener('click', () => {
                // Toggle the 'active' class on the clicked FAQ item
                item.classList.toggle('active');

                // Toggle the display of the answer
                if (item.classList.contains('active')) {
                    answer.style.display = 'block';
                } else {
                    answer.style.display = 'none';
                }

                // Optional: Close other open FAQ items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                        const otherAnswer = otherItem.querySelector('.faq-answer');
                        if (otherAnswer) {
                            otherAnswer.style.display = 'none';
                        }
                    }
                });
            });
        }
    });

    // --- Location Dropdown Functionality (Desktop Only) ---
    const locationSectionDesktop = document.querySelector('.navbar-desktop-full .navbar-location'); // Desktop full location
    const locationDropdownDesktop = document.querySelector('.navbar-desktop-full .location-dropdown'); // Desktop full location dropdown

    // Add click listener for the desktop dropdown
    if (locationSectionDesktop && locationDropdownDesktop) { // Check if elements exist
        locationSectionDesktop.addEventListener('click', (event) => {
             // Prevent the click inside the dropdown from closing it
            if (!locationDropdownDesktop.contains(event.target)) {
                 locationSectionDesktop.classList.toggle('active');
            }
        });

         // Close dropdown when clicking outside on desktop
        document.addEventListener('click', (event) => {
            if (locationSectionDesktop && locationDropdownDesktop && !locationSectionDesktop.contains(event.target)) {
                locationSectionDesktop.classList.remove('active');
            }
        });

        // Prevent click inside dropdown from propagating to document and closing it
        locationDropdownDesktop.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    }

    // --- Search Bar Click Functionality (Redirect) ---
    const desktopSearchButtonFull = document.querySelector('.navbar-desktop-full .search-box .search-button'); // Desktop full search button
    const desktopSearchInputFull = document.querySelector('.navbar-desktop-full .search-box .search-input'); // Desktop full search input
    const collapsedSearchButton = document.querySelector('.navbar-desktop-collapsed .search-box-collapsed .search-button'); // Collapsed desktop search button
    const collapsedSearchInput = document.querySelector('.navbar-desktop-collapsed .search-box-collapsed .search-input'); // Collapsed desktop search input
    const mobileSearchButton = document.querySelector('.navbar-mobile .search-box-mobile .search-button'); // Mobile search button
    const mobileSearchInput = document.querySelector('.navbar-mobile .search-box-mobile .search-input'); // Mobile search input


    // Function to handle search
    function handleSearch(inputElement) {
        const searchTerm = inputElement.value.trim();
        // Redirect to shopping.html with search query as a URL parameter
        // This is a basic redirect; a real search page would process this parameter
        if (searchTerm) {
             window.location.href = `shopping.html?search=${encodeURIComponent(searchTerm)}`;
        } else {
            // Optional: Handle empty search input
            alert("Please enter a medicine name to search.");
        }
    }

    // Add event listeners for desktop search (full and collapsed)
    if (desktopSearchButtonFull && desktopSearchInputFull) {
        desktopSearchButtonFull.addEventListener('click', (event) => {
            event.preventDefault();
            handleSearch(desktopSearchInputFull);
        });
        desktopSearchInputFull.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleSearch(desktopSearchInputFull);
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
            event.preventDefault(); // Prevent default button behavior
            handleSearch(mobileSearchInput);
        });

         mobileSearchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent default form submission
                handleSearch(mobileSearchInput);
            }
        });
     }


    // --- Theme Toggle Functionality ---
    const themeToggleBtnDesktopFull = document.getElementById('theme-toggle-desktop-full'); // Desktop full navbar
    const themeToggleBtnDesktopCollapsed = document.getElementById('theme-toggle-desktop-collapsed'); // Desktop collapsed navbar
    const themeToggleBtnMobile = document.getElementById('theme-toggle-mobile'); // Mobile navbar
    const body = document.body;

    // Function to update theme and button icons
    function updateTheme(isDark) {
        if (isDark) {
            body.classList.add('dark-theme');
            if (themeToggleBtnDesktopFull) themeToggleBtnDesktopFull.innerHTML = '<i class="fas fa-sun"></i> <span class="btn-text">Light Theme</span>';
            if (themeToggleBtnDesktopCollapsed) themeToggleBtnDesktopCollapsed.innerHTML = '<i class="fas fa-sun"></i>'; // Icon only for collapsed
             if (themeToggleBtnMobile) themeToggleBtnMobile.innerHTML = '<i class="fas fa-sun"></i>'; // Icon only for mobile utility
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-theme');
            if (themeToggleBtnDesktopFull) themeToggleBtnDesktopFull.innerHTML = '<i class="fas fa-moon"></i> <span class="btn-text">Dark Theme</span>';
            if (themeToggleBtnDesktopCollapsed) themeToggleBtnDesktopCollapsed.innerHTML = '<i class="fas fa-moon"></i>'; // Icon only for collapsed
             if (themeToggleBtnMobile) themeToggleBtnMobile.innerHTML = '<i class="fas fa-moon"></i>'; // Icon only for mobile utility
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
    const navbarMobile = document.querySelector('.navbar-mobile'); // Get mobile navbar
    const navbarBottomDesktop = document.querySelector('.navbar-desktop-full .navbar-bottom'); // Get the desktop bottom row
    const scrollThreshold = 50; // Pixels to scroll down before considering collapsing
    const quickScrollThreshold = 150; // Pixels scrolled up quickly to trigger full navbar show
    const desktopBreakpoint = 1024; // Match CSS breakpoint
    let scrollStopTimer; // Timer to detect scroll stop


    // Update navbar display and height on load and resize
    const updateNavbarDisplayAndHeight = () => {
         if (window.innerWidth > desktopBreakpoint) {
             // Desktop view
             if (navbarDesktop) navbarDesktop.style.display = 'block'; // Show desktop container
             if (navbarMobile) navbarMobile.style.display = 'none'; // Hide mobile container
             navbar.style.position = 'fixed'; // Set navbar to fixed on desktop

             // Ensure correct desktop state based on scroll position
             if (window.pageYOffset === 0) {
                 navbar.classList.remove('collapsed');
                 if (navbarDesktopFull) navbarDesktopFull.style.display = 'flex';
                 if (navbarDesktopCollapsed) navbarDesktopCollapsed.style.display = 'none';
                 if (navbarBottomDesktop) {
                     navbarBottomDesktop.style.maxHeight = 'none'; // Ensure full height
                     navbarBottomDesktop.style.overflow = 'visible';
                 }
             } else {
                  // If not at the top, start collapsed on desktop
                  navbar.classList.add('collapsed');
                  if (navbarDesktopFull) navbarDesktopFull.style.display = 'none';
                  if (navbarDesktopCollapsed) navbarDesktopCollapsed.style.display = 'flex';
                   if (navbarBottomDesktop) {
                     navbarBottomDesktop.style.maxHeight = '0'; // Ensure collapsed height
                     navbarBottomDesktop.style.overflow = 'hidden';
                 }
             }
            // Padding is now handled by CSS media queries

         } else {
             // Mobile/Tablet view
             if (navbarDesktop) navbarDesktop.style.display = 'none'; // Hide desktop container
             if (navbarMobile) navbarMobile.style.display = 'flex'; // Show mobile container
             navbar.style.position = 'static'; // Set navbar to static on mobile (scrolls with content)
             // Ensure desktop collapsed navbar is hidden on mobile
             if (navbarDesktopCollapsed) navbarDesktopCollapsed.style.display = 'none';
             // Ensure desktop full navbar is hidden on mobile
             if (navbarDesktopFull) navbarDesktopFull.style.display = 'none';
             // Ensure the mobile navbar is not collapsed by the desktop logic
             navbar.classList.remove('collapsed'); // Mobile collapsing is handled by the toggler
             navbar.style.height = 'auto'; // Allow mobile navbar height to adjust
             navbar.style.padding = '15px 0'; // Reset padding for mobile
             // Padding is now handled by CSS media queries
         }
    };

    // Initial call
    updateNavbarDisplayAndHeight();

    // Update on resize with debounce
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateNavbarDisplayAndHeight, 200);
    });


    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollDelta = scrollTop - lastScrollTop; // How much was scrolled

        // Clear the scroll stop timer on every scroll event
        clearTimeout(scrollStopTimer);

        // Desktop Scroll Behavior
        if (window.innerWidth > desktopBreakpoint) {
            // Show full navbar when at the very top
            if (scrollTop === 0) {
                navbar.classList.remove('collapsed');
                 if (navbarDesktopFull) navbarDesktopFull.style.display = 'flex';
                 if (navbarDesktopCollapsed) navbarDesktopCollapsed.style.display = 'none';
                 if (navbarBottomDesktop) {
                    navbarBottomDesktop.style.maxHeight = 'none'; // Ensure full height
                    navbarBottomDesktop.style.overflow = 'visible';
                }
                 // Padding is now handled by CSS media queries

            } else if (scrollDelta > scrollThreshold && !navbar.classList.contains('collapsed')) {
                // Scrolling down quickly past the threshold - collapse navbar
                 navbar.classList.add('collapsed');
                  if (navbarDesktopFull) navbarDesktopFull.style.display = 'none';
                  if (navbarDesktopCollapsed) navbarDesktopCollapsed.style.display = 'flex';
                  if (navbarBottomDesktop) {
                    navbarBottomDesktop.style.maxHeight = '0'; // Ensure collapsed height
                    navbarBottomDesktop.style.overflow = 'hidden';
                }
                 // Padding is now handled by CSS media queries

            } else if (scrollDelta < -quickScrollThreshold && navbar.classList.contains('collapsed')) {
                // Scrolling up quickly past the threshold - show full navbar
                 navbar.classList.remove('collapsed');
                  if (navbarDesktopFull) navbarDesktopFull.style.display = 'flex';
                  if (navbarDesktopCollapsed) navbarDesktopCollapsed.style.display = 'none';
                  if (navbarBottomDesktop) {
                    navbarBottomDesktop.style.maxHeight = 'none'; // Ensure full height
                    navbarBottomDesktop.style.overflow = 'visible';
                }
                 // Padding is now handled by CSS media queries

            } else if (scrollDelta < -scrollThreshold && scrollDelta >= -quickScrollThreshold) {
                 // Scrolling up smoothly - keep collapsed navbar visible
                 // No action needed, the 'collapsed' class remains
            }

             // Set a timer to detect when scrolling stops
             scrollStopTimer = setTimeout(() => {
                 // If scrolling has stopped and we are not at the top, and the full navbar is visible, collapse it
                 if (window.pageYOffset > 0 && !navbar.classList.contains('collapsed')) {
                     navbar.classList.add('collapsed');
                      if (navbarDesktopFull) navbarDesktopFull.style.display = 'none';
                      if (navbarDesktopCollapsed) navbarDesktopCollapsed.style.display = 'flex';
                      if (navbarBottomDesktop) {
                        navbarBottomDesktop.style.maxHeight = '0';
                        navbarBottomDesktop.style.overflow = 'hidden';
                    }
                     // Padding is now handled by CSS media queries
                 }
             }, 200); // Adjust delay as needed

        } else {
             // Mobile Scroll Behavior (No scroll-based show/hide for mobile navbar itself)
             // Ensure desktop navbars are hidden on mobile
             if (navbarDesktop) navbarDesktop.style.display = 'none';
             if (navbarDesktopFull) navbarDesktopFull.style.display = 'none';
             if (navbarDesktopCollapsed) navbarDesktopCollapsed.style.display = 'none';
             // Ensure mobile navbar is displayed on mobile
             if (navbarMobile) navbarMobile.style.display = 'flex';
             navbar.style.position = 'static'; // Keep mobile navbar static
             navbar.classList.remove('collapsed'); // Mobile collapsing is handled by the toggler
             navbar.style.height = 'auto'; // Allow mobile navbar height to adjust
             navbar.style.padding = '15px 0'; // Reset padding for mobile
             // Padding is now handled by CSS media queries
        }


        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
    });


    // --- Carousel Functionality ---

    // Function to initialize a single carousel
    function initializeCarousel(containerSelector, autoSlideInterval = 7000) { // Increased interval for slower auto-slide
        const carouselContainer = document.querySelector(containerSelector);
        if (!carouselContainer) return; // Exit if container not found

        const track = carouselContainer.querySelector('.carousel-track');
        const items = track.querySelectorAll('.product-card');
        const leftArrow = carouselContainer.querySelector('.carousel-arrow.left');
        const rightArrow = carouselContainer.querySelector('.carousel-arrow.right');
        const dotsContainer = carouselContainer.querySelector('.carousel-dots');

        if (!track || !leftArrow || !rightArrow || !dotsContainer || items.length === 0) {
            // Hide carousel elements if any required element is missing or no items
            carouselContainer.style.display = 'none';
            return;
        }


        let currentIndex = 0;
        let itemsPerView = 4; // Default for desktop
        let slideInterval;
        let touchStartX = 0;
        let touchEndX = 0;
        const minSwipeDistance = 50; // Minimum pixels for a swipe to register

        // Function to update itemsPerView based on screen width
        function updateItemsPerView() {
            if (window.innerWidth <= 768) {
                itemsPerView = 1; // Mobile
            } else if (window.innerWidth <= 1024) {
                itemsPerView = 2; // Tablet
            } else {
                itemsPerView = 4; // Desktop
            }
             // Recalculate dots and reset position on resize
            generateDots();
            moveToSlide(currentIndex, false); // Reset position on resize, without smooth transition
        }

        // Function to generate pagination dots
        function generateDots() {
            dotsContainer.innerHTML = ''; // Clear existing dots
            // Calculate the number of dots needed based on items and itemsPerView
            const numDots = Math.ceil(items.length / itemsPerView);
            for (let i = 0; i < numDots; i++) {
                const dot = document.createElement('span');
                dot.classList.add('dot');
                 // Calculate the start index for this dot's slide
                const slideStartIndex = i * itemsPerView;
                 // Check if the current index is within the range of items shown by this dot
                 // This handles cases where the last slide might show fewer items
                if (currentIndex >= slideStartIndex && currentIndex < slideStartIndex + itemsPerView) {
                     dot.classList.add('active');
                }
                // Use a data attribute to store the index this dot represents
                dot.dataset.slideIndex = slideStartIndex;
                dot.addEventListener('click', (event) => {
                    const indexToMoveTo = parseInt(event.target.dataset.slideIndex);
                    moveToSlide(indexToMoveTo);
                    resetAutoSlide();
                });
                dotsContainer.appendChild(dot);
            }
             updateActiveDot(); // Ensure correct dot is active after generation
        }

        // Function to update active dot
        function updateActiveDot() {
            const dots = dotsContainer.querySelectorAll('.dot');
             // Find the dot whose slideStartIndex is the largest but not greater than currentIndex
            let activeDotIndex = 0;
            dots.forEach((dot, index) => {
                const slideStartIndex = parseInt(dot.dataset.slideIndex);
                if (currentIndex >= slideStartIndex) {
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


            // Calculate the translation amount
            // Need to account for the margin between items
            const item = items[0]; // Use the first item to get dimensions
            const itemWidth = item.offsetWidth; // Get the calculated width including padding/border
            const itemStyle = window.getComputedStyle(item);
            const itemMarginRight = parseInt(itemStyle.marginRight);
            const totalItemWidth = itemWidth + itemMarginRight; // Total space taken by one item including its right margin

             let translation = -currentIndex * totalItemWidth;

             // Ensure translation does not exceed the point where the last item is visible
             const trackWidth = track.scrollWidth; // Total width of the track
             const containerStyle = window.getComputedStyle(carouselContainer);
             const containerWidth = carouselContainer.offsetWidth - parseInt(containerStyle.paddingLeft) - parseInt(containerStyle.paddingRight); // Width of the visible container area

             const maxTranslation = trackWidth > containerWidth ? trackWidth - containerWidth : 0;

             // Ensure translation does not exceed the point where the last item is visible
             translation = Math.max(translation, -maxTranslation);


            if (smooth) {
                 track.style.transition = 'transform 0.5s ease-in-out'; // Apply smooth transition
            } else {
                 track.style.transition = 'none'; // No transition for instant jump
            }

            track.style.transform = `translateX(${translation}px)`;

            updateActiveDot();
        }

        // Event listeners for arrows
        leftArrow.addEventListener('click', () => {
            moveToSlide(currentIndex - itemsPerView); // Move back by itemsPerView
            resetAutoSlide();
        });

        rightArrow.addEventListener('click', () => {
            moveToSlide(currentIndex + itemsPerView); // Move forward by itemsPerView
            resetAutoSlide();
        });

        // Touch event listeners for swiping
        track.addEventListener('touchstart', (event) => {
            touchStartX = event.changedTouches[0].screenX;
        });

        track.addEventListener('touchend', (event) => {
            touchEndX = event.changedTouches[0].screenX;
            handleSwipe();
        });

        function handleSwipe() {
            const swipeDistance = touchEndX - touchStartX;

            if (swipeDistance > minSwipeDistance) {
                // Swipe right (move left)
                moveToSlide(currentIndex - itemsPerView);
                resetAutoSlide();
            } else if (swipeDistance < -minSwipeDistance) {
                // Swipe left (move right)
                moveToSlide(currentIndex + itemsPerView);
                resetAutoSlide();
            }
        }


        // Automatic sliding
        function startAutoSlide() {
            slideInterval = setInterval(() => {
                const nextIndex = currentIndex + itemsPerView;
                 // Check if we are at the last possible slide position
                 const maxIndex = items.length > itemsPerView ? items.length - itemsPerView : 0;
                if (currentIndex >= maxIndex) {
                    moveToSlide(0); // Loop back to the beginning
                } else {
                    moveToSlide(nextIndex);
                }
            }, autoSlideInterval);
        }

        function resetAutoSlide() {
            clearInterval(slideInterval);
            startAutoSlide();
        }

        // Initialize carousel on load
        updateItemsPerView(); // Set initial items per view and generate dots
        startAutoSlide(); // Start automatic sliding

        // Update carousel on window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(updateItemsPerView, 200); // Debounce resize
        });
    }

    // Initialize carousels for both sections
    initializeCarousel('.featured-section .carousel-container', 8000); // Offers section carousel (Increased interval)
    initializeCarousel('.most-selling-section .carousel-container', 9000); // Most Popular section carousel (Increased interval)


    // --- Mobile Navbar Toggle ---
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarMobileMenu = document.querySelector('.navbar-mobile-menu'); // Get the mobile menu container

    if (navbarToggler && navbarMobileMenu) {
        navbarToggler.addEventListener('click', () => {
            navbarMobileMenu.classList.toggle('active'); // Toggle 'active' class for styling
            navbarToggler.classList.toggle('active'); // Toggle 'active' class for icon animation
             // Update body padding when mobile menu is toggled
            // updateBodyPadding(); // No need to update padding here as mobile navbar is static
        });

         // Close mobile menu when a link is clicked (optional)
         const mobileNavLinks = navbarMobileMenu.querySelectorAll('a'); // Use mobile-specific nav links
         mobileNavLinks.forEach(link => {
             link.addEventListener('click', () => {
                 if (navbarMobileMenu.classList.contains('active')) {
                     navbarMobileMenu.classList.remove('active');
                     navbarToggler.classList.remove('active');
                      // Update body padding after closing menu
                     // updateBodyPadding(); // No need to update padding here as mobile navbar is static
                 }
             });
         });
    }


    // --- Footer Accordion Functionality (Mobile) ---
    const footerCols = document.querySelectorAll('.footer-col');

    footerCols.forEach(col => {
        const header = col.querySelector('.footer-col-header');
        const content = col.querySelector('.footer-col-content');
        const toggleIcon = col.querySelector('.footer-toggle-icon');

        // Only add click listener if header and content exist and on mobile screens
        if (header && content) {
             header.addEventListener('click', () => {
                 // Check if current screen width is within mobile range (adjust breakpoint as needed)
                 if (window.innerWidth <= desktopBreakpoint) { // Use desktopBreakpoint for consistency
                     col.classList.toggle('active');

                     // Optional: Close other open footer columns on mobile
                     footerCols.forEach(otherCol => {
                         if (otherCol !== col && otherCol.classList.contains('active')) {
                             otherCol.classList.remove('active');
                             const otherContent = otherCol.querySelector('.footer-col-content');
                             if(otherContent) {
                                 otherContent.style.maxHeight = '0'; // Collapse other content
                             }
                         }
                     });

                     // Toggle max-height for smooth slide effect
                     if (col.classList.contains('active')) {
                         content.style.maxHeight = content.scrollHeight + "px"; // Set max-height to content height
                     } else {
                         content.style.maxHeight = '0';
                     }

                 }
             });
         }
    });

    // Function to handle footer collapse/expand on resize
    function handleFooterResize() {
        footerCols.forEach(col => {
            const content = col.querySelector('.footer-col-content');
            const toggleIcon = col.querySelector('.footer-toggle-icon');

            if (content && toggleIcon) { // Ensure content and toggle icon exist
                if (window.innerWidth > desktopBreakpoint) { // Desktop view
                    content.style.maxHeight = 'none'; // Ensure content is visible
                    content.style.overflow = 'visible';
                    content.style.transition = 'none';
                    col.classList.remove('active'); // Remove active class
                } else { // Mobile/Tablet view
                    // Reset to collapsed state on resize to mobile
                     if (!col.classList.contains('active')) {
                         content.style.maxHeight = '0';
                         content.style.overflow = 'hidden';
                         content.style.transition = 'max-height 0.3s ease-in-out';
                     } else {
                          // If already active, recalculate max-height (optional, for smoother resize when open)
                          content.style.maxHeight = content.scrollHeight + "px";
                     }
                }
            }
        });
    }

    // Initial call and event listener for resize
    handleFooterResize();
    window.addEventListener('resize', handleFooterResize);


    // --- Back to Top Button Functionality ---
    const backToTopBtn = document.getElementById('back-to-top-btn');
    const showButtonThreshold = 300; // Pixels scrolled down to show the button

    window.addEventListener('scroll', () => {
        // Show/hide button based on scroll position and screen width
        if (window.innerWidth <= desktopBreakpoint && (window.pageYOffset || document.documentElement.scrollTop) > showButtonThreshold) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Smooth scrolling effect
        });
    });


});
