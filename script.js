document.addEventListener('DOMContentLoaded', () => {
    // Detect page type and apply theme-class
    if (window.location.pathname.includes('diet-coke.html')) {
        document.body.classList.add('diet-coke-page');
    }
    // -------------------------------------------------------------
    // Supabase Backend Integration
    // -------------------------------------------------------------
    const SUPABASE_URL = 'https://jumafcstubsneauwkzcn.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_8z2jdACh8r-kTrfeKVO44w_9w3lZvDN';
    const RAZORPAY_KEY_ID = 'rzp_test_TTk9TTGHpMNKPk'; // Replace with your Razorpay Test Key ID

    async function saveToSupabase(table, data) {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                console.error(`Supabase error saving to ${table}:`, err);
            }
        } catch (error) {
            console.error(`Fetch error saving to ${table}:`, error);
        }
    }

    // -------------------------------------------------------------
    // State Management & Constants
    // -------------------------------------------------------------
    const cokeCanvas = document.getElementById('coke-canvas');
    const dietCanvas = document.getElementById('diet-canvas');
    const cokeCtx = cokeCanvas.getContext('2d');
    const dietCtx = dietCanvas.getContext('2d');

    const preloader = document.getElementById('preloader');
    const loaderBar = document.getElementById('loader-bar');
    const loaderText = document.getElementById('loader-text');
    const preloaderLogoCoke = document.getElementById('preloader-logo-coke');
    const preloaderLogoDiet = document.getElementById('preloader-logo-diet');

    const cokeHeroOverlay = document.getElementById('coke-hero-overlay');
    const dietHeroOverlay = document.getElementById('diet-hero-overlay');
    const cokeContent = document.getElementById('coke-content');
    const dietContent = document.getElementById('diet-content');

    // Total frames configuration
    const totalFramesCoke = 229;
    const totalFramesDiet = 238;

    // Arrays for image preloading
    const imagesCoke = [];
    const imagesDiet = [];

    // Tracks asset loading progress
    let loadedCountCoke = 0;
    let loadedCountDiet = 0;
    let isActivePreloadingComplete = false;

    // LERP animation variables
    let currentFrameCoke = 0;
    let targetFrameCoke = 0;
    let currentFrameDiet = 0;
    let targetFrameDiet = 0;

    let isSiteInitialized = false;
    let lastScrollTop = 0;
    let activeNavbarLinkId = 'link-home';

    // Determine active view based on path name and hash
    let activeView = 'original';
    if (window.location.hash === '#admin') {
        activeView = 'admin';
    } else if (window.location.pathname.includes('diet-coke.html')) {
        activeView = 'diet-coke';
    }

    // -------------------------------------------------------------
    // Page / Canvas Setup
    // -------------------------------------------------------------
    function resizeCanvases() {
        const dpr = window.devicePixelRatio || 1;

        cokeCanvas.width = window.innerWidth * dpr;
        cokeCanvas.height = window.innerHeight * dpr;
        cokeCtx.scale(dpr, dpr);

        dietCanvas.width = window.innerWidth * dpr;
        dietCanvas.height = window.innerHeight * dpr;
        dietCtx.scale(dpr, dpr);

        // Redraw immediately on resize
        if (isSiteInitialized) {
            if (activeView === 'original' && imagesCoke[Math.round(currentFrameCoke)]) {
                renderFrame('original', Math.round(currentFrameCoke));
            } else if (activeView === 'diet-coke' && imagesDiet[Math.round(currentFrameDiet)]) {
                renderFrame('diet-coke', Math.round(currentFrameDiet));
            }
        }
    }

    // Cover-fit image utility
    function drawImageProp(ctx, img, x, y, w, h) {
        const imgRatio = img.width / img.height;
        const canvasRatio = w / h;
        let sWidth, sHeight, sx, sy;

        if (imgRatio > canvasRatio) {
            sHeight = img.height;
            sWidth = img.height * canvasRatio;
            sx = (img.width - sWidth) / 2;
            sy = 0;
        } else {
            sWidth = img.width;
            sHeight = img.width / canvasRatio;
            sx = 0;
            sy = (img.height - sHeight) / 2;
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
    }

    function renderFrame(view, frameIndex) {
        if (view === 'original') {
            const img = imagesCoke[frameIndex];
            if (img && img.complete) {
                cokeCtx.clearRect(0, 0, cokeCanvas.width / window.devicePixelRatio, cokeCanvas.height / window.devicePixelRatio);
                drawImageProp(cokeCtx, img, 0, 0, window.innerWidth, window.innerHeight);
            }
        } else {
            const img = imagesDiet[frameIndex];
            if (img && img.complete) {
                dietCtx.clearRect(0, 0, dietCanvas.width / window.devicePixelRatio, dietCanvas.height / window.devicePixelRatio);
                drawImageProp(dietCtx, img, 0, 0, window.innerWidth, window.innerHeight);
            }
        }
    }

    // -------------------------------------------------------------
    // Preloading Logic
    // -------------------------------------------------------------
    function startPreloading() {
        // Configure preloader depending on initial page load
        if (activeView === 'original') {
            if (preloaderLogoCoke) preloaderLogoCoke.classList.remove('hidden');
            if (preloaderLogoDiet) preloaderLogoDiet.classList.add('hidden');
            preloadCokeAssets(true); // primary
        } else {
            if (preloaderLogoCoke) preloaderLogoCoke.classList.add('hidden');
            if (preloaderLogoDiet) preloaderLogoDiet.classList.remove('diet-span', 'hidden');
            preloadDietAssets(true); // primary
        }

        // Force site initialization and hide preloader after a maximum of 2 seconds
        setTimeout(() => {
            if (!isSiteInitialized) {
                initSite();
            }
        }, 2000);
    }

    function preloadCokeAssets(isPrimary) {
        for (let i = 1; i <= totalFramesCoke; i++) {
            const img = new Image();
            img.src = `frames/ezgif-frame-${i.toString().padStart(3, '0')}.jpg`;
            img.onload = () => onAssetLoaded('original', isPrimary);
            img.onerror = () => onAssetLoaded('original', isPrimary);
            imagesCoke.push(img);
        }
    }

    function preloadDietAssets(isPrimary) {
        for (let i = 1; i <= totalFramesDiet; i++) {
            const img = new Image();
            img.src = `diet_coke_frames/ezgif-frame-${i.toString().padStart(3, '0')}.jpg`;
            img.onload = () => onAssetLoaded('diet-coke', isPrimary);
            img.onerror = () => onAssetLoaded('diet-coke', isPrimary);
            imagesDiet.push(img);
        }
    }

    function onAssetLoaded(view, isPrimary) {
        if (view === 'original') {
            loadedCountCoke++;
        } else {
            loadedCountDiet++;
        }

        const total = (view === 'original') ? totalFramesCoke : totalFramesDiet;
        const current = (view === 'original') ? loadedCountCoke : loadedCountDiet;

        if (isPrimary && !isActivePreloadingComplete) {
            const percentage = Math.round((current / total) * 100);
            if (loaderBar) loaderBar.style.width = percentage + '%';
            if (loaderText) loaderText.innerText = `Loading Assets: ${percentage}%`;

            if (current === total) {
                isActivePreloadingComplete = true;
                setTimeout(() => {
                    initSite();
                }, 300);
            }
        }
    }

    // -------------------------------------------------------------
    // Site Initialization
    // -------------------------------------------------------------
    function initSite() {
        if (isSiteInitialized) return;
        isSiteInitialized = true;

        // Setup initial canvas sizes
        window.addEventListener('resize', resizeCanvases);
        resizeCanvases();

        // Configure initial layout based on URL/Path
        configureInitialView();

        // Hide preloader smoothly
        if (preloader) {
            preloader.classList.add('fade-out');
        }

        // Start background preloading of the inactive page frames silently
        if (activeView === 'original') {
            preloadDietAssets(false);
        } else {
            preloadCokeAssets(false);
        }

        // Initialize single animation loop
        animate();
    }

    function configureInitialView() {
        if (activeView === 'original') {
            cokeCanvas.classList.add('opacity-100');
            cokeCanvas.classList.remove('opacity-0');
            cokeHeroOverlay.classList.add('opacity-100');
            cokeHeroOverlay.classList.remove('opacity-0');
            cokeContent.classList.remove('hidden');
            // Force redraw to ensure DOM updates styles before animating fade-in
            cokeContent.offsetHeight;
            cokeContent.classList.add('opacity-100');
            cokeContent.classList.remove('opacity-0');

            renderFrame('original', 0);
        } else if (activeView === 'admin') {
            const adminContent = document.getElementById('admin-content');
            const canvasContainer = document.querySelector('.canvas-container');
            const scrollSpacer = document.querySelector('.scroll-spacer');
            const mainHeader = document.querySelector('header:not(#checkout-header)');

            if (canvasContainer) canvasContainer.style.display = 'none';
            if (scrollSpacer) scrollSpacer.style.display = 'none';
            if (mainHeader) mainHeader.style.display = 'none';

            cokeCanvas.classList.add('opacity-0');
            dietCanvas.classList.add('opacity-0');

            if (adminContent) {
                adminContent.classList.remove('hidden');
                adminContent.offsetHeight;
                adminContent.classList.add('opacity-100');
                adminContent.classList.remove('opacity-0');
            }
            document.documentElement.style.setProperty('--bg-color', '#0b0c10');
        } else {
            dietCanvas.classList.add('opacity-100');
            dietCanvas.classList.remove('opacity-0');
            dietHeroOverlay.classList.add('opacity-100');
            dietHeroOverlay.classList.remove('opacity-0');
            dietContent.classList.remove('hidden');
            dietContent.offsetHeight;
            dietContent.classList.add('opacity-100');
            dietContent.classList.remove('opacity-0');

            renderFrame('diet-coke', 0);
        }
        updateNavbarStyles(activeView);
    }

    // -------------------------------------------------------------
    // View Switching (Cross-Fade / Dissolve Routing)
    // -------------------------------------------------------------
    let checkoutOriginView = 'original';

    function switchView(targetView, pushToHistory = true, productParam = null) {
        if (targetView === activeView) return;

        const oldView = activeView;
        activeView = targetView;

        // Reset active link state on view switches
        activeNavbarLinkId = 'link-home';

        const mainHeader = document.querySelector('header:not(#checkout-header)');
        const checkoutContent = document.getElementById('checkout-content');
        const adminContent = document.getElementById('admin-content');
        const canvasContainer = document.querySelector('.canvas-container');
        const scrollSpacer = document.querySelector('.scroll-spacer');

        // Show/hide main header dynamically
        if (mainHeader) {
            if (targetView === 'checkout' || targetView === 'admin') {
                mainHeader.style.display = 'none';
            } else {
                mainHeader.style.display = '';
            }
        }

        // 1. Handle Canvases and Overlays cross-fade
        if (targetView === 'diet-coke') {
            if (canvasContainer) canvasContainer.style.display = 'block';
            if (scrollSpacer) scrollSpacer.style.display = 'block';
            if (targetFrameDiet === 0) renderFrame('diet-coke', 0);

            dietCanvas.classList.remove('opacity-0');
            dietCanvas.classList.add('opacity-100');
            cokeCanvas.classList.remove('opacity-100');
            cokeCanvas.classList.add('opacity-0');

            if (dietHeroOverlay) {
                dietHeroOverlay.style.opacity = '1';
                dietHeroOverlay.style.visibility = 'visible';
            }
            if (cokeHeroOverlay) {
                cokeHeroOverlay.style.opacity = '0';
                cokeHeroOverlay.style.visibility = 'hidden';
            }

            document.documentElement.style.setProperty('--bg-color', '#0b0b0f');
        } else if (targetView === 'original') {
            if (canvasContainer) canvasContainer.style.display = 'block';
            if (scrollSpacer) scrollSpacer.style.display = 'block';
            if (targetFrameCoke === 0) renderFrame('original', 0);

            cokeCanvas.classList.remove('opacity-0');
            cokeCanvas.classList.add('opacity-100');
            dietCanvas.classList.remove('opacity-100');
            dietCanvas.classList.add('opacity-0');

            if (cokeHeroOverlay) {
                cokeHeroOverlay.style.opacity = '1';
                cokeHeroOverlay.style.visibility = 'visible';
            }
            if (dietHeroOverlay) {
                dietHeroOverlay.style.opacity = '0';
                dietHeroOverlay.style.visibility = 'hidden';
            }

            document.documentElement.style.setProperty('--bg-color', '#080808');
        } else if (targetView === 'checkout') {
            // Hide canvases, spacer, and canvas-container for checkout view to allow normal scrolling
            if (canvasContainer) canvasContainer.style.display = 'none';
            if (scrollSpacer) scrollSpacer.style.display = 'none';

            cokeCanvas.classList.remove('opacity-100');
            cokeCanvas.classList.add('opacity-0');
            dietCanvas.classList.remove('opacity-100');
            dietCanvas.classList.add('opacity-0');

            if (cokeHeroOverlay) {
                cokeHeroOverlay.style.opacity = '0';
                cokeHeroOverlay.style.visibility = 'hidden';
            }
            if (dietHeroOverlay) {
                dietHeroOverlay.style.opacity = '0';
                dietHeroOverlay.style.visibility = 'hidden';
            }

            // Set checkout background color
            const productTheme = productParam || (oldView === 'diet-coke' ? 'diet-coke' : 'original');
            if (productTheme === 'diet-coke') {
                document.documentElement.style.setProperty('--bg-color', '#F5F5F7');
            } else {
                document.documentElement.style.setProperty('--bg-color', '#070102');
            }

            // Scroll to the top of the viewport when loading checkout
            window.scrollTo({ top: 0, behavior: 'instant' });
        } else if (targetView === 'admin') {
            // Hide canvases, spacer, and canvas-container for admin view
            if (canvasContainer) canvasContainer.style.display = 'none';
            if (scrollSpacer) scrollSpacer.style.display = 'none';

            cokeCanvas.classList.remove('opacity-100');
            cokeCanvas.classList.add('opacity-0');
            dietCanvas.classList.remove('opacity-100');
            dietCanvas.classList.add('opacity-0');

            if (cokeHeroOverlay) {
                cokeHeroOverlay.style.opacity = '0';
                cokeHeroOverlay.style.visibility = 'hidden';
            }
            if (dietHeroOverlay) {
                dietHeroOverlay.style.opacity = '0';
                dietHeroOverlay.style.visibility = 'hidden';
            }

            document.documentElement.style.setProperty('--bg-color', '#0b0c10');
            window.scrollTo({ top: 0, behavior: 'instant' });
        }

        // 2. Cross-fade Content Containers
        let oldContent;
        if (oldView === 'original') oldContent = cokeContent;
        else if (oldView === 'diet-coke') oldContent = dietContent;
        else if (oldView === 'checkout') oldContent = checkoutContent;
        else if (oldView === 'admin') oldContent = adminContent;

        let newContent;
        if (targetView === 'original') newContent = cokeContent;
        else if (targetView === 'diet-coke') newContent = dietContent;
        else if (targetView === 'checkout') newContent = checkoutContent;
        else if (targetView === 'admin') newContent = adminContent;

        if (oldContent) {
            oldContent.classList.remove('opacity-100');
            oldContent.classList.add('opacity-0');
        }

        setTimeout(() => {
            if (oldContent) oldContent.classList.add('hidden');
            if (newContent) {
                newContent.classList.remove('hidden');

                // Force browser repaint to trigger CSS transition
                newContent.offsetHeight;

                newContent.classList.remove('opacity-0');
                newContent.classList.add('opacity-100');
            }
        }, 400); // Wait for content fade-out before swapping layout

        // 3. Update Navbar and document title
        if (targetView !== 'checkout' && targetView !== 'admin') {
            updateNavbarStyles(targetView);
            document.title = (targetView === 'diet-coke') ? 'Diet Coke | Light & Crisp' : 'Coca-Cola | Taste the Feeling';
        } else if (targetView === 'admin') {
            document.title = 'Coca-Cola | Admin Portal';
        } else {
            document.title = 'Checkout | Taste the Magic';
            // Configure checkout theme when switching into it
            const productTheme = productParam || (oldView === 'diet-coke' ? 'diet-coke' : 'original');
            checkoutOriginView = (oldView === 'checkout') ? checkoutOriginView : oldView;
            initCheckoutTheme(productTheme);
        }

        // 4. Update History State
        if (pushToHistory) {
            let url;
            if (targetView === 'diet-coke') url = 'diet-coke.html';
            else if (targetView === 'original') url = 'index.html';
            else if (targetView === 'checkout') {
                const productTheme = productParam || (oldView === 'diet-coke' ? 'diet-coke' : 'original');
                url = 'buy.html?product=' + productTheme;
            }
            history.pushState({ view: targetView, product: productParam }, '', url);
        }
    }

    function updateNavbarStyles(view) {
        const linkHome = document.getElementById('link-home');
        const linkDiet = document.getElementById('link-diet');
        const linkExperience = document.getElementById('link-experience');
        const linkSummer = document.getElementById('link-summer');
        const linkContact = document.getElementById('link-contact');

        const navLogoImg = document.getElementById('nav-logo-img');
        const navActionBtn = document.getElementById('nav-action-btn');
        const navBuyBtn = document.getElementById('nav-buy-btn');

        const allLinks = [linkHome, linkDiet, linkExperience, linkSummer, linkContact];

        if (view === 'diet-coke') {
            // Update link text and target for Diet Coke view
            if (linkDiet) {
                linkDiet.innerText = 'Try Coca~Cola';
                linkDiet.setAttribute('href', 'index.html');
            }

            // Set local section targets for Diet Coke page
            if (linkExperience) {
                linkExperience.setAttribute('href', '#diet-experience-section');
            }
            if (linkContact) {
                linkContact.setAttribute('href', '#contact-diet-section');
            }
            if (navActionBtn) {
                navActionBtn.setAttribute('href', '#contact-diet-section');
            }
            if (navBuyBtn) {
                navBuyBtn.setAttribute('href', 'buy.html?product=diet-coke');
            }

            // Hide the Summer link on Diet Coke page
            if (linkSummer) {
                linkSummer.style.display = 'none';
            }

            // Apply Diet logo filter
            if (navLogoImg) {
                navLogoImg.classList.add('diet-logo-silver');
            }

            // Apply Silver theme to Action and Buy Buttons
            if (navActionBtn) {
                navActionBtn.className = 'border border-black/20 hover:bg-black hover:text-white text-gray-800 px-6 py-2 rounded-lg font-label-bold uppercase tracking-wider text-sm transition-all duration-300';
            }
            if (navBuyBtn) {
                navBuyBtn.className = 'diet-silver-btn px-6 py-2 rounded-lg font-label-bold uppercase tracking-wider text-sm transition-all shadow-md';
            }

            // Style links dynamically for Diet Coke view:
            allLinks.forEach(link => {
                if (!link) return;
                if (link.id === activeNavbarLinkId) {
                    link.className = 'text-white border-b-2 border-white pb-1 font-black transition-all duration-300';
                } else {
                    link.className = 'text-gray-800 hover:text-black font-bold transition-all duration-300';
                }
            });
        } else {
            // Update link text and target for original view
            if (linkDiet) {
                linkDiet.innerText = 'Try Diet Coke';
                linkDiet.setAttribute('href', 'diet-coke.html');
            }

            // Restore original targets for Coca-Cola page
            if (linkExperience) {
                linkExperience.setAttribute('href', '#experience');
            }
            if (linkContact) {
                linkContact.setAttribute('href', '#contact');
            }
            if (navActionBtn) {
                navActionBtn.setAttribute('href', '#contact');
            }
            if (navBuyBtn) {
                navBuyBtn.setAttribute('href', 'buy.html?product=original');
            }

            // Show the Summer link on Coca-Cola page
            if (linkSummer) {
                linkSummer.style.display = '';
            }

            // Remove Diet logo filter
            if (navLogoImg) {
                navLogoImg.classList.remove('diet-logo-silver');
            }

            // Apply Red theme to Action and Buy Buttons
            if (navActionBtn) {
                navActionBtn.className = 'border border-white/40 hover:bg-white hover:text-black text-white px-6 py-2 rounded-lg font-label-bold uppercase tracking-wider text-sm transition-all duration-300';
            }
            if (navBuyBtn) {
                navBuyBtn.className = 'coke-red-btn px-6 py-2 rounded-lg font-label-bold text-white uppercase tracking-wider text-sm transition-all shadow-md';
            }

            // Style links dynamically for original Coke view:
            allLinks.forEach(link => {
                if (!link) return;
                if (link.id === activeNavbarLinkId) {
                    link.className = 'text-white border-b-2 border-white pb-1 font-black transition-all duration-300';
                } else {
                    link.className = 'hover:text-primary transition-colors text-on-surface-variant transition-all duration-300';
                }
            });
        }
    }

    // -------------------------------------------------------------
    // History Events & Navigation Link Interceptor
    // -------------------------------------------------------------
    window.addEventListener('popstate', (event) => {
        const path = window.location.pathname;
        const search = window.location.search;
        const hash = window.location.hash;
        if (hash === '#admin') {
            switchView('admin', false);
        } else if (search.includes('product=')) {
            const urlParams = new URLSearchParams(search);
            const productParam = urlParams.get('product');
            switchView('checkout', false, productParam);
        } else if (path.includes('diet-coke.html')) {
            switchView('diet-coke', false);
        } else {
            switchView('original', false);
        }
    });

    // Recover opacities in case of bfcache back-navigation
    window.addEventListener('pageshow', (event) => {
        const activeContent = activeView === 'diet-coke' ? dietContent : cokeContent;
        if (activeContent) {
            activeContent.style.transition = '';
            activeContent.style.opacity = '';
            activeContent.classList.remove('opacity-0');
            activeContent.classList.add('opacity-100');
        }
        const mainHeader = document.querySelector('header:not(#checkout-header)');
        if (mainHeader) {
            mainHeader.style.transition = '';
            mainHeader.style.opacity = '';
        }
    });

    // Intercept clicks on links pointing between the two pages to do SPA fade transitions
    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;

        // Skip social action buttons (Globe, Share, Like) so their custom handlers run uninterrupted
        const label = link.getAttribute('aria-label');
        if (label === 'Web' || label === 'Share' || label === 'Like') {
            return;
        }

        // Intercept clicks to admin portal for smooth SPA transition
        if (href.includes('admin.html') || href === '#admin') {
            e.preventDefault();
            switchView('admin');
            history.pushState({ view: 'admin' }, '', '#admin');
            return;
        }

        // Intercept clicks to checkout page for smooth SPA transitions
        if (href.includes('buy.html') || link.id === 'nav-buy-btn') {
            e.preventDefault();
            const searchPart = href.split('?')[1] || '';
            const urlParams = new URLSearchParams(searchPart);
            const productParam = urlParams.get('product') || (activeView === 'diet-coke' ? 'diet-coke' : 'original');
            switchView('checkout', true, productParam);
            return;
        }

        // Intercept checkout/admin back home navigation link click
        if (link.id === 'checkout-back-link' || link.id === 'checkout-success-home-btn' || link.id === 'view-site-btn') {
            e.preventDefault();
            const originView = checkoutOriginView === 'diet-coke' ? 'diet-coke' : 'original';
            switchView(originView);
            history.pushState({ view: originView }, '', originView === 'diet-coke' ? 'diet-coke.html' : 'index.html');
            return;
        }

        // Check if it's an anchor to a section
        const isAnchor = href.startsWith('#');
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const targetPath = href.split('#')[0];

        // Track navbar active link when clicked
        const nav = link.closest('#nav-links');
        if (nav && link.id) {
            activeNavbarLinkId = link.id;
            updateNavbarStyles(activeView);
        }

        // Navigation case 1: Clicking "Home" always scrolls smoothly to top of active page
        if (link.id === 'link-home') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // Navigation case 2: clicking Logo link
        if (link.id === 'nav-logo-link') {
            e.preventDefault();
            activeNavbarLinkId = 'link-home';
            if (activeView !== 'original') {
                switchView('original');
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            updateNavbarStyles(activeView);
            return;
        }

        // Navigation case 3: clicking "Try Diet Coke" or "Try Coca~Cola" (link-diet)
        if (link.id === 'link-diet') {
            e.preventDefault();
            activeNavbarLinkId = 'link-home'; // Reset active link when switching pages
            if (activeView === 'original') {
                switchView('diet-coke');
            } else {
                switchView('original');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // Fallback relative link matching for other manual navigation anchors
        if (href === 'index.html' || href === 'index.html#') {
            e.preventDefault();
            activeNavbarLinkId = 'link-home';
            if (activeView !== 'original') {
                switchView('original');
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            updateNavbarStyles(activeView);
            return;
        }

        if (href === 'diet-coke.html' || href === 'diet-coke.html#') {
            e.preventDefault();
            activeNavbarLinkId = 'link-home';
            if (activeView !== 'diet-coke') {
                switchView('diet-coke');
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            updateNavbarStyles(activeView);
            return;
        }

        // Navigation case 4: anchor links when in Diet Coke view
        if (isAnchor && activeView === 'diet-coke') {
            e.preventDefault();

            // If it's a local anchor link on the Diet Coke page, scroll directly to it
            if (href === '#diet-experience-section' || href === '#contact-diet-section') {
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
                return;
            }

            // For contact backward compatibility
            if (href === '#contact') {
                const targetElement = document.getElementById('contact-diet-section');
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
                return;
            }

            // Switch to original home view first for other anchors (like #experience, #banner)
            activeNavbarLinkId = 'link-home'; // Reset on cross-page anchors
            switchView('original');

            // Smooth scroll to anchor target after the layout shows up
            setTimeout(() => {
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }, 450);
            return;
        }

        // Navigation case 5: cross-page sections (e.g. index.html#experience) when in Diet Coke view
        if (href.includes('index.html#') && activeView === 'diet-coke') {
            e.preventDefault();
            const anchor = '#' + href.split('#')[1];
            activeNavbarLinkId = 'link-home';
            switchView('original');

            setTimeout(() => {
                const targetElement = document.querySelector(anchor);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }, 450);
            return;
        }
    });

    // -------------------------------------------------------------
    // Scrolling Animations Control
    // -------------------------------------------------------------
    function updateScrollState() {
        if (activeView === 'checkout') return;
        const scrollTop = window.scrollY;
        const scrollSpacer = document.querySelector('.scroll-spacer');
        if (!scrollSpacer) return;

        const maxScroll = scrollSpacer.offsetHeight - window.innerHeight;
        const scrollProgress = maxScroll > 0 ? Math.max(0, Math.min(1, scrollTop / maxScroll)) : 0;

        if (activeView === 'original') {
            targetFrameCoke = Math.min(totalFramesCoke - 1, Math.floor(scrollProgress * totalFramesCoke));

            if (cokeHeroOverlay) {
                if (scrollProgress < 0.3) {
                    cokeHeroOverlay.style.opacity = 1 - (scrollProgress / 0.3);
                    cokeHeroOverlay.style.visibility = 'visible';
                } else {
                    cokeHeroOverlay.style.opacity = 0;
                    cokeHeroOverlay.style.visibility = 'hidden';
                }
            }
            // Keep inactive overlay strictly hidden and reset its inline styles
            if (dietHeroOverlay) {
                dietHeroOverlay.style.opacity = 0;
                dietHeroOverlay.style.visibility = 'hidden';
            }
        } else {
            targetFrameDiet = Math.min(totalFramesDiet - 1, Math.floor(scrollProgress * totalFramesDiet));

            if (dietHeroOverlay) {
                if (scrollProgress < 0.3) {
                    dietHeroOverlay.style.opacity = 1 - (scrollProgress / 0.3);
                    dietHeroOverlay.style.visibility = 'visible';
                } else {
                    dietHeroOverlay.style.opacity = 0;
                    dietHeroOverlay.style.visibility = 'hidden';
                }
            }
            // Keep inactive overlay strictly hidden and reset its inline styles
            if (cokeHeroOverlay) {
                cokeHeroOverlay.style.opacity = 0;
                cokeHeroOverlay.style.visibility = 'hidden';
            }
        }

        // Hide/Show navigation bar based on scroll direction (shared behavior)
        const header = document.querySelector('header');
        if (header) {
            if (scrollTop <= 50) {
                header.classList.remove('nav-up');
            } else if (Math.abs(scrollTop - lastScrollTop) > 10) {
                if (scrollTop > lastScrollTop) {
                    header.classList.add('nav-up');
                } else {
                    header.classList.remove('nav-up');
                }
                lastScrollTop = scrollTop;
            }
        }
    }

    // LERP Draw Animation Loop
    function animate() {
        if (!isSiteInitialized) return;

        updateScrollState();

        if (activeView === 'original') {
            const diff = targetFrameCoke - currentFrameCoke;
            currentFrameCoke += diff * 0.12;

            if (Math.abs(diff) < 0.05) {
                currentFrameCoke = targetFrameCoke;
            }

            const frameToDraw = Math.round(currentFrameCoke);
            renderFrame('original', frameToDraw);
        } else {
            const diff = targetFrameDiet - currentFrameDiet;
            currentFrameDiet += diff * 0.12;

            if (Math.abs(diff) < 0.05) {
                currentFrameDiet = targetFrameDiet;
            }

            const frameToDraw = Math.round(currentFrameDiet);
            renderFrame('diet-coke', frameToDraw);
        }

        requestAnimationFrame(animate);
    }

    // -------------------------------------------------------------
    // Page-specific Features (Observers, Form handler)
    // -------------------------------------------------------------
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('opacity-100', 'translate-y-0');
                entry.target.classList.remove('opacity-0', 'translate-y-10');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.group').forEach(el => {
        el.classList.add('opacity-0', 'translate-y-10', 'transition-all', 'duration-700');
        observer.observe(el);
    });

    // Original Contact Form Handler
    const contactForm = document.getElementById('contact-form');
    const successMessage = document.getElementById('success-message');

    if (contactForm && successMessage) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameInput = contactForm.querySelector('input[type="text"]');
            const emailInput = contactForm.querySelector('input[type="email"]');
            const subjectSelect = contactForm.querySelector('select');
            const messageTextarea = contactForm.querySelector('textarea');

            const name = nameInput ? nameInput.value : '';
            const email = emailInput ? emailInput.value : '';
            const subject = subjectSelect ? subjectSelect.value : '';
            const message = messageTextarea ? messageTextarea.value : '';

            saveToSupabase('contacts', {
                name: name,
                email: email,
                subject: subject,
                message: message
            });

            contactForm.style.transition = 'opacity 0.3s ease';
            contactForm.style.opacity = '0';

            setTimeout(() => {
                contactForm.classList.add('hidden');
                successMessage.classList.remove('hidden');
                successMessage.style.opacity = '0';
                successMessage.style.transition = 'opacity 0.3s ease';
                successMessage.offsetHeight;
                successMessage.style.opacity = '1';
            }, 300);
        });
    }

    // Diet Coke Contact Form Handler
    const contactFormDiet = document.getElementById('contact-form-diet');
    const successMessageDiet = document.getElementById('success-message-diet');

    if (contactFormDiet && successMessageDiet) {
        contactFormDiet.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameInput = contactFormDiet.querySelector('input[type="text"]');
            const emailInput = contactFormDiet.querySelector('input[type="email"]');
            const subjectSelect = contactFormDiet.querySelector('select');
            const messageTextarea = contactFormDiet.querySelector('textarea');

            const name = nameInput ? nameInput.value : '';
            const email = emailInput ? emailInput.value : '';
            const subject = subjectSelect ? subjectSelect.value : '';
            const message = messageTextarea ? messageTextarea.value : '';

            saveToSupabase('contacts', {
                name: name,
                email: email,
                subject: subject,
                message: message
            });

            contactFormDiet.style.transition = 'opacity 0.3s ease';
            contactFormDiet.style.opacity = '0';

            setTimeout(() => {
                contactFormDiet.classList.add('hidden');
                successMessageDiet.classList.remove('hidden');
                successMessageDiet.style.opacity = '0';
                successMessageDiet.style.transition = 'opacity 0.3s ease';
                successMessageDiet.offsetHeight;
                successMessageDiet.style.opacity = '1';
            }, 300);
        });
    }

    // SPA Checkout Theme & Controls
    let cokeQuantity = 1;
    let dietQuantity = 0;
    const pricePerBottle = 40;

    function initCheckoutTheme(productTheme) {
        const body = document.body;
        const checkoutHeader = document.getElementById('checkout-header');
        const checkoutFooter = document.getElementById('checkout-footer-el');
        const checkoutMainCard = document.getElementById('checkout-main-card');
        const logoBranding = document.getElementById('checkout-logo-branding');
        const submitBtn = document.getElementById('checkout-submit-btn');
        const backHomeLink = document.getElementById('checkout-back-link');

        const successHomeBtn = document.getElementById('checkout-success-home-btn');
        const successSummaryCard = document.getElementById('checkout-success-summary-card');

        const productOriginalCard = document.getElementById('checkout-product-original-card');
        const productDietCard = document.getElementById('checkout-product-diet-card');

        // Reset form views
        document.getElementById('checkout-inner-view').classList.remove('hidden');
        document.getElementById('checkout-success-view').classList.add('hidden');

        // Apply theme styling dynamically
        if (productTheme === 'diet-coke') {
            body.className = 'diet-theme min-h-screen flex flex-col transition-colors duration-500';
            if (checkoutHeader) checkoutHeader.className = 'w-full px-6 py-6 md:px-16 flex items-center justify-between border-b border-black/10 transition-colors duration-500 text-gray-900';
            if (checkoutFooter) checkoutFooter.className = 'w-full py-8 border-t border-black/10 text-center text-xs opacity-40 transition-colors duration-500 text-gray-900';
            if (checkoutMainCard) checkoutMainCard.className = 'bg-white rounded-[2.5rem] border border-black/10 p-8 md:p-12 shadow-2xl transition-all duration-500 text-gray-900';

            if (logoBranding) {
                logoBranding.innerText = 'DIET COKE';
                logoBranding.style.color = '#050505';
                logoBranding.style.textShadow = '0 0 12px rgba(198, 198, 198, 0.4)';
            }

            // Text input borders
            document.querySelectorAll('#checkout-order-form input:not([type="radio"]), #checkout-order-form textarea').forEach(el => {
                el.className = 'w-full bg-white border border-gray-300 focus:ring-2 focus:ring-gray-400 rounded-xl py-3 px-4 text-gray-900 text-sm transition-all duration-300';
            });

            // Label colors
            document.querySelectorAll('#checkout-order-form label:not(.payment-card)').forEach(el => {
                el.className = 'text-xs uppercase tracking-wider font-semibold opacity-70 block text-gray-700';
            });

            if (submitBtn) {
                submitBtn.className = 'w-full py-4 text-center rounded-xl font-bold uppercase tracking-widest text-sm transition-all duration-300 transform hover:-translate-y-0.5 bg-black hover:bg-gray-800 text-white shadow-xl';
            }
            if (backHomeLink) {
                backHomeLink.className = 'flex items-center gap-2 group text-sm font-semibold hover:opacity-80 transition-opacity text-gray-800';
            }

            if (productOriginalCard) productOriginalCard.className = 'flex flex-col gap-4 bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-900';
            if (productDietCard) productDietCard.className = 'flex flex-col gap-4 bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-900';

            // Counter elements
            document.querySelectorAll('#checkout-content .counter-wrapper').forEach(el => {
                el.className = 'counter-wrapper flex items-center gap-3 bg-gray-100 border border-gray-200 rounded-xl p-1 text-gray-900';
            });
            document.querySelectorAll('#checkout-content .counter-btn').forEach(btn => {
                btn.className = 'counter-btn w-8 h-8 rounded-lg flex items-center justify-center font-bold hover:bg-black/5 transition-colors text-sm';
            });

            // Payment method unselected cards
            document.querySelectorAll('#checkout-payment-options .payment-card').forEach(card => {
                card.className = 'payment-card border border-gray-200 bg-white rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer hover:bg-gray-50 transition-all text-center relative text-gray-900';
            });

            if (successSummaryCard) successSummaryCard.className = 'w-full max-w-md bg-gray-50 border border-gray-200 rounded-3xl p-6 space-y-4 text-sm text-gray-900';
            if (successHomeBtn) {
                successHomeBtn.className = 'inline-block px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-sm shadow-xl transition-all duration-300 bg-black hover:bg-gray-800 text-white';
            }
        } else {
            body.className = 'coke-theme min-h-screen flex flex-col transition-colors duration-500';
            if (checkoutHeader) checkoutHeader.className = 'w-full px-6 py-6 md:px-16 flex items-center justify-between border-b border-white/10 transition-colors duration-500 text-white';
            if (checkoutFooter) checkoutFooter.className = 'w-full py-8 border-t border-white/10 text-center text-xs opacity-40 transition-colors duration-500 text-white';
            if (checkoutMainCard) checkoutMainCard.className = 'bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-8 md:p-12 shadow-2xl transition-all duration-500 text-white';

            if (logoBranding) {
                logoBranding.innerText = 'COCA-COLA';
                logoBranding.style.color = '#ffffff';
                logoBranding.style.textShadow = 'none';
            }

            // Text input borders
            document.querySelectorAll('#checkout-order-form input:not([type="radio"]), #checkout-order-form textarea').forEach(el => {
                el.className = 'w-full bg-black/20 border border-white/10 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl py-3 px-4 text-white text-sm transition-all duration-300';
            });

            // Label colors
            document.querySelectorAll('#checkout-order-form label:not(.payment-card)').forEach(el => {
                el.className = 'text-xs uppercase tracking-wider font-semibold opacity-70 block text-white';
            });

            if (submitBtn) {
                submitBtn.className = 'w-full py-4 text-center rounded-xl font-bold uppercase tracking-widest text-sm transition-all duration-300 transform hover:-translate-y-0.5 bg-[#ff5449] hover:bg-[#93000a] text-white shadow-xl';
            }
            if (backHomeLink) {
                backHomeLink.className = 'flex items-center gap-2 group text-sm font-semibold hover:opacity-80 transition-opacity text-white';
            }

            if (productOriginalCard) productOriginalCard.className = 'flex flex-col gap-4 bg-black/10 border border-white/5 rounded-2xl p-4 text-white';
            if (productDietCard) productDietCard.className = 'flex flex-col gap-4 bg-black/10 border border-white/5 rounded-2xl p-4 text-white';

            // Counter elements
            document.querySelectorAll('#checkout-content .counter-wrapper').forEach(el => {
                el.className = 'counter-wrapper flex items-center gap-3 bg-black/15 border border-white/10 rounded-xl p-1 text-white';
            });
            document.querySelectorAll('#checkout-content .counter-btn').forEach(btn => {
                btn.className = 'counter-btn w-8 h-8 rounded-lg flex items-center justify-center font-bold hover:bg-white/10 transition-colors text-sm';
            });

            // Payment method unselected cards
            document.querySelectorAll('#checkout-payment-options .payment-card').forEach(card => {
                card.className = 'payment-card border border-white/10 bg-black/20 rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer hover:bg-black/35 transition-all text-center relative text-white';
            });

            if (successSummaryCard) successSummaryCard.className = 'w-full max-w-md bg-black/10 border border-white/5 rounded-3xl p-6 space-y-4 text-sm text-white';
            if (successHomeBtn) {
                successHomeBtn.className = 'inline-block px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-sm shadow-xl transition-all duration-300 bg-[#ff5449] hover:bg-[#93000a] text-white';
            }
        }

        // Refresh selection dots styling
        updatePaymentCardBorderTracking(productTheme);
    }

    function setupCheckoutEvents() {
        const cokeQtyVal = document.getElementById('checkout-coke-qty-val');
        const dietQtyVal = document.getElementById('checkout-diet-qty-val');
        const summaryCokeTotal = document.getElementById('checkout-summary-coke-total');
        const summaryDietTotal = document.getElementById('checkout-summary-diet-total');
        const totalPrice = document.getElementById('checkout-total-price');
        const submitBtn = document.getElementById('checkout-submit-btn');

        function updateCheckoutTotals() {
            const cokeTotal = cokeQuantity * pricePerBottle;
            const dietTotal = dietQuantity * pricePerBottle;
            const grandTotal = cokeTotal + dietTotal;
            if (cokeQtyVal) cokeQtyVal.innerText = cokeQuantity;
            if (dietQtyVal) dietQtyVal.innerText = dietQuantity;
            if (summaryCokeTotal) summaryCokeTotal.innerText = `INR ${cokeTotal.toFixed(2)}`;
            if (summaryDietTotal) summaryDietTotal.innerText = `INR ${dietTotal.toFixed(2)}`;
            if (totalPrice) totalPrice.innerText = `INR ${grandTotal.toFixed(2)}`;

            if (grandTotal === 0) {
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerText = 'Cart is Empty';
                    submitBtn.style.opacity = '0.5';
                    submitBtn.style.cursor = 'not-allowed';
                }
            } else {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = 'Complete Purchase';
                    submitBtn.style.opacity = '1';
                    submitBtn.style.cursor = 'pointer';
                }
            }
        }

        // Expose update totals globally so it can be called from theme init
        window.updateCheckoutTotals = updateCheckoutTotals;

        // Coke counters
        const cokePlus = document.getElementById('checkout-coke-qty-plus');
        const cokeMinus = document.getElementById('checkout-coke-qty-minus');
        if (cokePlus) {
            cokePlus.addEventListener('click', () => {
                if (cokeQuantity < 100) { cokeQuantity++; updateCheckoutTotals(); }
            });
        }
        if (cokeMinus) {
            cokeMinus.addEventListener('click', () => {
                if (cokeQuantity > 0) { cokeQuantity--; updateCheckoutTotals(); }
            });
        }

        // Diet counters
        const dietPlus = document.getElementById('checkout-diet-qty-plus');
        const dietMinus = document.getElementById('checkout-diet-qty-minus');
        if (dietPlus) {
            dietPlus.addEventListener('click', () => {
                if (dietQuantity < 100) { dietQuantity++; updateCheckoutTotals(); }
            });
        }
        if (dietMinus) {
            dietMinus.addEventListener('click', () => {
                if (dietQuantity > 0) { dietQuantity--; updateCheckoutTotals(); }
            });
        }

        // Payment cards border tracking
        const labels = document.querySelectorAll('#checkout-payment-options .payment-card');
        labels.forEach(lbl => {
            lbl.addEventListener('click', () => {
                const radio = lbl.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
                const params = new URLSearchParams(window.location.search);
                const currentProduct = params.get('product') || 'original';
                updatePaymentCardBorderTracking(currentProduct);
            });
        });

        // Form submit handler
        const checkoutOrderForm = document.getElementById('checkout-order-form');
        const checkoutView = document.getElementById('checkout-inner-view');
        const successView = document.getElementById('checkout-success-view');
        const successOrderNum = document.getElementById('checkout-success-order-num');
        const successTotal = document.getElementById('checkout-success-total');
        const successPayment = document.getElementById('checkout-success-payment');
        const successItemsList = document.getElementById('checkout-success-items-list');
        const checkoutCard = document.getElementById('checkout-main-card');

        if (checkoutOrderForm) {
            checkoutOrderForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const randNum = Math.floor(100000 + Math.random() * 900000);
                const orderPrefix = (cokeQuantity > 0 && dietQuantity > 0) ? 'MX' : (dietQuantity > 0 ? 'DC' : 'CC');
                const finalTotal = (cokeQuantity * pricePerBottle) + (dietQuantity * pricePerBottle);

                const selectedPayment = 'Razorpay';

                const custName = document.getElementById('checkout-cust-name') ? document.getElementById('checkout-cust-name').value : '';
                const custPhone = document.getElementById('checkout-cust-phone') ? document.getElementById('checkout-cust-phone').value : '';
                const custEmail = document.getElementById('checkout-cust-email') ? document.getElementById('checkout-cust-email').value : '';
                const custAddress = document.getElementById('checkout-cust-address') ? document.getElementById('checkout-cust-address').value : '';

                // Prepaid payment: Card / UPI (Always open Razorpay)
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerText = 'Processing Payment...';
                }

                const options = {
                    key: RAZORPAY_KEY_ID,
                    amount: Math.round(finalTotal * 100), // paise
                    currency: 'INR',
                    name: 'Coca-Cola Company',
                    description: 'Order Purchase',
                    prefill: {
                        name: custName,
                        email: custEmail,
                        contact: custPhone
                    },
                    theme: {
                        color: '#ff5449'
                    },
                    handler: function (response) {
                        saveToSupabase('orders', {
                            order_number: `${orderPrefix}-${randNum}`,
                            customer_name: custName,
                            customer_phone: custPhone,
                            customer_email: custEmail,
                            shipping_address: custAddress,
                            payment_method: selectedPayment,
                            coke_quantity: cokeQuantity,
                            diet_quantity: dietQuantity,
                            total_price: finalTotal,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id || '',
                            razorpay_signature: response.razorpay_signature || ''
                        });

                        showSuccessScreen(`${selectedPayment} (Paid)`);

                        if (submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.innerText = 'Complete Purchase';
                        }
                    },
                    modal: {
                        ondismiss: function () {
                            if (submitBtn) {
                                submitBtn.disabled = false;
                                submitBtn.innerText = 'Complete Purchase';
                            }
                        }
                    }
                };

                const rzp = new Razorpay(options);
                rzp.open();

                function showSuccessScreen(paymentLabel) {
                    if (successOrderNum) successOrderNum.innerText = `#${orderPrefix}-${randNum}`;
                    if (successTotal) successTotal.innerText = `INR ${finalTotal.toFixed(2)}`;
                    if (successPayment) successPayment.innerText = paymentLabel;

                    if (successItemsList) {
                        successItemsList.innerHTML = '';
                        if (cokeQuantity > 0) {
                            successItemsList.innerHTML += `<div class="flex justify-between pb-1"><span class="opacity-60">Coca-Cola Original</span><span class="font-bold">${cokeQuantity} Can${cokeQuantity > 1 ? 's' : ''}</span></div>`;
                        }
                        if (dietQuantity > 0) {
                            successItemsList.innerHTML += `<div class="flex justify-between pb-1"><span class="opacity-60">Diet Coke Silver</span><span class="font-bold">${dietQuantity} Can${dietQuantity > 1 ? 's' : ''}</span></div>`;
                        }
                    }

                    if (checkoutView) checkoutView.classList.add('hidden');
                    if (successView) successView.classList.remove('hidden');
                    if (checkoutCard) checkoutCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        }
    }

    function updatePaymentCardBorderTracking(productTheme) {
        const labels = document.querySelectorAll('#checkout-payment-options .payment-card');
        labels.forEach(lbl => {
            const radio = lbl.querySelector('input[type="radio"]');
            const capsule = lbl.querySelector('.payment-capsule');
            const innerDot = lbl.querySelector('.inner-dot');
            if (!radio) return;

            if (productTheme === 'diet-coke') {
                if (radio.checked) {
                    lbl.className = 'payment-card border border-black bg-black/5 rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer scale-[1.02] shadow-md transition-all text-center relative text-gray-900';
                    if (capsule) capsule.className = 'payment-capsule w-16 h-6 rounded-full border border-black bg-black flex items-center justify-center transition-all duration-300';
                    if (innerDot) innerDot.className = 'inner-dot w-2 h-2 rounded-full bg-white transition-all duration-300';
                } else {
                    lbl.className = 'payment-card border border-gray-200 bg-white rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer hover:bg-gray-50 transition-all text-center relative text-gray-900';
                    if (capsule) capsule.className = 'payment-capsule w-16 h-6 rounded-full border border-gray-300 bg-transparent flex items-center justify-center transition-all duration-300';
                    if (innerDot) innerDot.className = 'inner-dot w-2 h-2 rounded-full bg-transparent transition-all duration-300';
                }
            } else {
                if (radio.checked) {
                    lbl.className = 'payment-card border border-[#ff5449] bg-red-500/15 backdrop-blur-md rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer scale-[1.02] shadow-lg transition-all text-center relative text-white';
                    if (capsule) capsule.className = 'payment-capsule w-16 h-6 rounded-full border border-[#ff5449] bg-[#ff5449] flex items-center justify-center transition-all duration-300';
                    if (innerDot) innerDot.className = 'inner-dot w-2 h-2 rounded-full bg-white transition-all duration-300';
                } else {
                    lbl.className = 'payment-card border border-white/10 bg-black/20 rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer hover:bg-black/35 transition-all text-center relative text-white';
                    if (capsule) capsule.className = 'payment-capsule w-16 h-6 rounded-full border border-white/20 bg-transparent flex items-center justify-center transition-all duration-300';
                    if (innerDot) innerDot.className = 'inner-dot w-2 h-2 rounded-full bg-transparent transition-all duration-300';
                }
            }
        });
    }

    // Admin Portal Implementation
    function initAdminPortal() {
        const authPanel = document.getElementById('auth-panel');
        const dashboardPanel = document.getElementById('dashboard-panel');
        const authTitle = document.getElementById('auth-title');
        const authSubtitle = document.getElementById('auth-subtitle');
        const authSubmitBtn = document.getElementById('auth-submit-btn');
        const authForm = document.getElementById('auth-form');
        const authError = document.getElementById('auth-error');

        const tabOrders = document.getElementById('admin-tab-orders');
        const tabContacts = document.getElementById('admin-tab-contacts');
        const tableOrders = document.getElementById('table-orders-el');
        const tableContacts = document.getElementById('table-contacts-el');
        const searchInput = document.getElementById('admin-search');

        const logoutBtn = document.getElementById('admin-logout-btn');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        if (!authPanel) return;

        let cachedOrders = [];
        let cachedContacts = [];
        let currentTab = 'orders';

        async function sha256(str) {
            const encoder = new TextEncoder();
            const data = encoder.encode(str);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }

        async function checkAdminExists() {
            try {
                const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/admin_exists`, {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    return await response.json();
                }
                return true;
            } catch (e) {
                return true;
            }
        }

        async function loadDashboard(username, passHash) {
            try {
                const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_admin_data`, {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        p_username: username,
                        p_password_hash: passHash
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    cachedOrders = data.orders || [];
                    cachedContacts = data.contacts || [];
                    renderData();
                    return true;
                }
                return false;
            } catch (e) {
                return false;
            }
        }

        function renderData() {
            const countOrdersEl = document.getElementById('admin-count-orders');
            const countContactsEl = document.getElementById('admin-count-contacts');
            if (countOrdersEl) countOrdersEl.innerText = cachedOrders.length;
            if (countContactsEl) countContactsEl.innerText = cachedContacts.length;

            const searchVal = searchInput.value.toLowerCase().trim();
            const ordersTbody = document.getElementById('orders-tbody');
            const contactsTbody = document.getElementById('contacts-tbody');
            const emptyState = document.getElementById('admin-empty-state');

            let ordersHtml = '';
            let contactsHtml = '';
            let visibleOrdersCount = 0;
            let visibleContactsCount = 0;

            cachedOrders.forEach(o => {
                const matchName = o.customer_name?.toLowerCase().includes(searchVal);
                const matchEmail = o.customer_email?.toLowerCase().includes(searchVal);
                const matchPhone = o.customer_phone?.toLowerCase().includes(searchVal);
                const matchRef = o.order_number?.toLowerCase().includes(searchVal);
                const matchAddress = o.shipping_address?.toLowerCase().includes(searchVal);

                if (searchVal === '' || matchName || matchEmail || matchPhone || matchRef || matchAddress) {
                    visibleOrdersCount++;
                    const dateStr = new Date(o.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    });

                    let itemsStr = '';
                    if (o.coke_quantity > 0) itemsStr += `<span class="block text-xs font-semibold text-red-400">Original Coke × ${o.coke_quantity}</span>`;
                    if (o.diet_quantity > 0) itemsStr += `<span class="block text-xs font-semibold text-gray-300">Diet Coke × ${o.diet_quantity}</span>`;

                    let badgeColor = 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
                    if (o.payment_method === 'Card') badgeColor = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
                    if (o.payment_method === 'COD') badgeColor = 'bg-purple-500/10 text-purple-400 border border-purple-500/20';

                    ordersHtml += `
                        <tr class="hover:bg-white/5 transition-colors">
                            <td class="py-4 px-4 font-bold text-xs uppercase tracking-wider text-gray-300">
                                ${o.order_number}
                                <span class="block text-[10px] font-normal text-gray-500 mt-1">${dateStr}</span>
                            </td>
                            <td class="py-4 px-4">
                                <span class="block font-bold text-sm text-white">${o.customer_name}</span>
                                <span class="block text-xs text-gray-400 mt-0.5">${o.customer_email}</span>
                                <span class="block text-xs text-gray-400 mt-0.5">${o.customer_phone || '-'}</span>
                            </td>
                            <td class="py-4 px-4 font-medium">${itemsStr}</td>
                            <td class="py-4 px-4 text-xs max-w-[200px] truncate text-gray-400" title="${o.shipping_address}">${o.shipping_address}</td>
                            <td class="py-4 px-4">
                                <span class="px-2.5 py-1 text-[10px] uppercase font-bold tracking-widest rounded-full ${badgeColor}">
                                    ${o.payment_method}
                                </span>
                            </td>
                            <td class="py-4 px-4 text-right font-bold text-white text-sm">INR ${Number(o.total_price).toFixed(2)}</td>
                        </tr>
                    `;
                }
            });

            cachedContacts.forEach(c => {
                const matchName = c.name?.toLowerCase().includes(searchVal);
                const matchEmail = c.email?.toLowerCase().includes(searchVal);
                const matchSubject = c.subject?.toLowerCase().includes(searchVal);
                const matchMsg = c.message?.toLowerCase().includes(searchVal);

                if (searchVal === '' || matchName || matchEmail || matchSubject || matchMsg) {
                    visibleContactsCount++;
                    const dateStr = new Date(c.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    });

                    let subjBadge = 'bg-gray-500/10 text-gray-400 border border-white/10';
                    if (c.subject === 'Business Inquiry') subjBadge = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                    if (c.subject === 'Product Feedback') subjBadge = 'bg-[#ff5449]/10 text-[#ff5449] border border-[#ff5449]/20';

                    contactsHtml += `
                        <tr class="hover:bg-white/5 transition-colors">
                            <td class="py-4 px-4 font-medium text-xs text-gray-400 whitespace-nowrap">${dateStr}</td>
                            <td class="py-4 px-4">
                                <span class="block font-bold text-sm text-white">${c.name}</span>
                                <span class="block text-xs text-gray-400 mt-0.5">${c.email}</span>
                            </td>
                            <td class="py-4 px-4">
                                <span class="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full ${subjBadge}">
                                    ${c.subject}
                                </span>
                            </td>
                            <td class="py-4 px-4 text-xs text-gray-300 max-w-[300px] break-words whitespace-pre-wrap">${c.message}</td>
                        </tr>
                    `;
                }
            });

            ordersTbody.innerHTML = ordersHtml;
            contactsTbody.innerHTML = contactsHtml;

            if (currentTab === 'orders') {
                if (visibleOrdersCount === 0) {
                    tableOrders.classList.add('hidden');
                    emptyState.classList.remove('hidden');
                } else {
                    tableOrders.classList.remove('hidden');
                    emptyState.classList.add('hidden');
                }
            } else {
                if (visibleContactsCount === 0) {
                    tableContacts.classList.add('hidden');
                    emptyState.classList.remove('hidden');
                } else {
                    tableContacts.classList.remove('hidden');
                    emptyState.classList.add('hidden');
                }
            }
        }

        checkAdminExists().then(adminExists => {
            if (adminExists) {
                authTitle.innerText = "Admin Portal";
                authSubtitle.innerText = "Provide credentials to log in";
                authSubmitBtn.innerText = "Sign In";
            } else {
                authTitle.innerText = "Register Administrator";
                authSubtitle.innerText = "Define a new admin account (Single slot)";
                authSubmitBtn.innerText = "Register Account";
            }

            const sessionUsername = sessionStorage.getItem('admin_username');
            const sessionHash = sessionStorage.getItem('admin_password_hash');
            let isAuthed = false;

            if (sessionUsername && sessionHash) {
                loadDashboard(sessionUsername, sessionHash).then(loaded => {
                    if (loaded) {
                        dashboardPanel.classList.remove('hidden');
                        dashboardPanel.classList.add('fade-in-up');
                        document.getElementById('admin-username-display').innerText = sessionUsername;
                        isAuthed = true;
                    } else {
                        sessionStorage.removeItem('admin_username');
                        sessionStorage.removeItem('admin_password_hash');
                        showAuthPanel();
                    }
                });
            } else {
                showAuthPanel();
            }

            function showAuthPanel() {
                authPanel.classList.remove('hidden');
                authPanel.classList.add('fade-in-up');
            }

            authForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                authError.classList.add('hidden');
                authSubmitBtn.disabled = true;
                authSubmitBtn.innerText = "Please wait...";

                const username = usernameInput.value.trim();
                const rawPassword = passwordInput.value;
                const hashedPassword = await sha256(rawPassword);

                if (!adminExists) {
                    try {
                        const response = await fetch(`${SUPABASE_URL}/rest/v1/admins`, {
                            method: 'POST',
                            headers: {
                                'apikey': SUPABASE_KEY,
                                'Authorization': `Bearer ${SUPABASE_KEY}`,
                                'Content-Type': 'application/json',
                                'Prefer': 'return=minimal'
                            },
                            body: JSON.stringify({
                                id: 1,
                                username: username,
                                password_hash: hashedPassword
                            })
                        });

                        if (response.ok) {
                            sessionStorage.setItem('admin_username', username);
                            sessionStorage.setItem('admin_password_hash', hashedPassword);
                            window.location.reload();
                        } else {
                            const err = await response.json();
                            authError.innerText = err.message || "Registration failed.";
                            authError.classList.remove('hidden');
                        }
                    } catch (err) {
                        authError.innerText = "Failed to connect to backend.";
                        authError.classList.remove('hidden');
                    }
                } else {
                    const loaded = await loadDashboard(username, hashedPassword);
                    if (loaded) {
                        sessionStorage.setItem('admin_username', username);
                        sessionStorage.setItem('admin_password_hash', hashedPassword);
                        authPanel.classList.add('hidden');
                        dashboardPanel.classList.remove('hidden');
                        dashboardPanel.classList.add('fade-in-up');
                        document.getElementById('admin-username-display').innerText = username;
                    } else {
                        authError.innerText = "Invalid username or password credentials.";
                        authError.classList.remove('hidden');
                    }
                }
                authSubmitBtn.disabled = false;
                authSubmitBtn.innerText = adminExists ? "Sign In" : "Register Account";
            });

            logoutBtn.addEventListener('click', () => {
                sessionStorage.removeItem('admin_username');
                sessionStorage.removeItem('admin_password_hash');
                window.location.reload();
            });

            tabOrders.addEventListener('click', () => {
                currentTab = 'orders';
                tabOrders.classList.add('active', 'border-b-2', 'border-red-500', 'text-white');
                tabContacts.classList.remove('active', 'border-b-2', 'border-red-500', 'text-white');
                tableOrders.classList.remove('hidden');
                tableContacts.classList.add('hidden');
                renderData();
            });

            tabContacts.addEventListener('click', () => {
                currentTab = 'contacts';
                tabOrders.classList.remove('active', 'border-b-2', 'border-red-500', 'text-white');
                tabContacts.classList.add('active', 'border-b-2', 'border-red-500', 'text-white');
                tableOrders.classList.add('hidden');
                tableContacts.classList.remove('hidden');
                renderData();
            });

            searchInput.addEventListener('input', renderData);
        });
    }

    // Set up SPA checkout events
    setupCheckoutEvents();

    // Start loading assets immediately
    startPreloading();

    // Initialize Admin Portal features
    initAdminPortal();

    // Initialize social action buttons (Globe, Share, Like)
    initSocialButtons();
});

// Social Actions (Globe, Share, Like) Initializer
function initSocialButtons() {
    // 1. Globe (Web) Buttons - do nothing
    const webButtons = document.querySelectorAll('a[aria-label="Web"]');
    webButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
        });
    });

    // 2. Share Buttons - copy website link to clipboard and show toast notification
    const shareButtons = document.querySelectorAll('a[aria-label="Share"]');
    shareButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const siteUrl = window.location.href;
            
            navigator.clipboard.writeText(siteUrl).then(() => {
                showToast("Website link copied to clipboard!");
            }).catch(err => {
                console.error("Failed to copy link using Clipboard API, trying fallback: ", err);
                
                // Fallback copy method for older browsers or restricted environments
                const textArea = document.createElement("textarea");
                textArea.value = siteUrl;
                textArea.style.position = "fixed";
                textArea.style.opacity = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                    showToast("Website link copied to clipboard!");
                } catch (copyErr) {
                    console.error("Fallback copy failed: ", copyErr);
                    showToast("Failed to copy link automatically.");
                }
                document.body.removeChild(textArea);
            });
        });
    });

    // 3. Like Buttons - smooth scroll & focus the Full Name input in the contact form
    const likeButtons = document.querySelectorAll('a[aria-label="Like"]');
    likeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Determine if the clicked button is inside the Diet section or the main section
            const isDietSection = btn.closest('#contact-diet-section') !== null || document.getElementById('contact-diet-section') !== null && btn.closest('.bg-chrome-bright') !== null;
            let targetInput;
            
            if (isDietSection) {
                targetInput = document.querySelector('#contact-form-diet input[placeholder="John Doe"]');
            } else {
                targetInput = document.querySelector('#contact-form input[placeholder="John Doe"]');
            }
            
            if (targetInput) {
                // Smooth scroll to the input block
                targetInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Focus the input field after the scroll animation has completed
                setTimeout(() => {
                    targetInput.focus();
                }, 600);
            }
        });
    });
}

// Toast notification helper function
function showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed bottom-8 right-8 z-[9999] flex flex-col gap-2 pointer-events-none';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = 'bg-stone-900 border border-white/10 text-white px-6 py-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-3 transition-all duration-300 transform translate-y-4 opacity-0 pointer-events-auto backdrop-blur-md';
    
    toast.innerHTML = `
        <span class="material-symbols-outlined text-emerald-500 text-xl">check_circle</span>
        <span class="text-sm font-medium tracking-wide font-sans">${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Fade in and slide up
    setTimeout(() => {
        toast.classList.remove('translate-y-4', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');
    }, 10);
    
    // Auto-fade out and remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-4', 'opacity-0');
        setTimeout(() => {
            toast.remove();
            if (container.children.length === 0) {
                container.remove();
            }
        }, 300);
    }, 3000);
}
