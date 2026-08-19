document.addEventListener("DOMContentLoaded", function () {

    // =====================================
    // MOBILE SIDE DRAWER MENU
    // =====================================

    const menuToggle =
        document.getElementById("menu-toggle");

    const navLinks =
        document.querySelector(".nav-links");

    const overlay =
        document.getElementById("mobileNavOverlay");


    function openMenu() {

        if (!navLinks) return;

        navLinks.classList.add("active");

        if (overlay) {
            overlay.classList.add("active");
        }

        document.body.classList.add("menu-open");

        if (menuToggle) {

            const icon =
                menuToggle.querySelector("i");

            if (icon) {
                icon.className = "fas fa-xmark";
            }
        }
    }


    function closeMenu() {

        if (!navLinks) return;

        navLinks.classList.remove("active");

        if (overlay) {
            overlay.classList.remove("active");
        }

        document.body.classList.remove("menu-open");

        if (menuToggle) {

            const icon =
                menuToggle.querySelector("i");

            if (icon) {
                icon.className = "fas fa-bars";
            }
        }
    }


    if (menuToggle && navLinks) {

        menuToggle.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                if (
                    navLinks.classList.contains("active")
                ) {

                    closeMenu();

                } else {

                    openMenu();
                }
            }
        );


        // Overlay click -> close menu
        if (overlay) {

            overlay.addEventListener(
                "click",
                function () {

                    closeMenu();
                }
            );
        }


        // Escape key -> close menu
        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Escape" &&
                    navLinks.classList.contains("active")
                ) {

                    closeMenu();
                }
            }
        );


        // Desktop size ekata awama reset
        window.addEventListener(
            "resize",
            function () {

                if (
                    window.innerWidth > 768
                ) {

                    closeMenu();
                }
            }
        );
    }


    // =====================================
    // HOME HERO SLIDER
    // =====================================

    const slides =
        document.querySelectorAll(
            ".hero-slide"
        );

    if (slides.length > 0) {

        let currentSlide = 0;

        function changeSlide() {

            slides[currentSlide]
                .classList
                .remove("active");

            currentSlide++;

            if (
                currentSlide >=
                slides.length
            ) {

                currentSlide = 0;
            }

            slides[currentSlide]
                .classList
                .add("active");
        }

        setInterval(
            changeSlide,
            4000
        );
    }


    // =====================================
    // GALLERY FILTER
    // =====================================

    const filterButtons =
        document.querySelectorAll(
            ".filter-btn"
        );

    const galleryPhotos =
        document.querySelectorAll(
            ".gallery-photo"
        );

    if (
        filterButtons.length > 0 &&
        galleryPhotos.length > 0
    ) {

        filterButtons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        filterButtons.forEach(
                            function (btn) {

                                btn.classList.remove(
                                    "active"
                                );
                            }
                        );

                        button.classList.add(
                            "active"
                        );

                        const selectedFilter =
                            button.getAttribute(
                                "data-filter"
                            );

                        galleryPhotos.forEach(
                            function (photo) {

                                const category =
                                    photo.getAttribute(
                                        "data-category"
                                    );

                                if (
                                    selectedFilter === "all" ||
                                    selectedFilter === category
                                ) {

                                    photo.style.display =
                                        "block";

                                    photo.style.animation =
                                        "galleryFade 0.4s ease";

                                } else {

                                    photo.style.display =
                                        "none";
                                }
                            }
                        );
                    }
                );
            }
        );
    }


    // =====================================
    // GALLERY LIGHTBOX
    // =====================================

    const lightbox =
        document.getElementById(
            "lightbox"
        );

    const lightboxImage =
        document.getElementById(
            "lightboxImage"
        );

    const lightboxClose =
        document.getElementById(
            "lightboxClose"
        );


    function closeLightbox() {

        if (!lightbox) return;

        lightbox.classList.remove(
            "active"
        );

        if (lightboxImage) {
            lightboxImage.src = "";
        }

        document.body.style.overflow =
            "";
    }


    if (
        lightbox &&
        lightboxImage &&
        lightboxClose &&
        galleryPhotos.length > 0
    ) {

        galleryPhotos.forEach(
            function (photo) {

                photo.addEventListener(
                    "click",
                    function () {

                        const image =
                            photo.querySelector(
                                "img"
                            );

                        if (!image) {
                            return;
                        }

                        lightboxImage.src =
                            image.src;

                        lightboxImage.alt =
                            image.alt || "";

                        lightbox.classList.add(
                            "active"
                        );

                        document.body.style.overflow =
                            "hidden";
                    }
                );
            }
        );


        // Close using X button
        lightboxClose.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                closeLightbox();
            }
        );


        // Close when clicking outside image
        lightbox.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === lightbox
                ) {

                    closeLightbox();
                }
            }
        );


        // Prevent image click from closing
        lightboxImage.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();
            }
        );


        // ESC key close
        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Escape" &&
                    lightbox.classList.contains("active")
                ) {

                    closeLightbox();
                }
            }
        );
    }


    // =====================================
    // FAQ ACCORDION
    // =====================================

    const faqItems =
        document.querySelectorAll(
            ".faq-item"
        );

    faqItems.forEach(
        function (item) {

            const question =
                item.querySelector(
                    ".faq-question"
                );

            if (!question) {
                return;
            }

            question.addEventListener(
                "click",
                function () {

                    faqItems.forEach(
                        function (otherItem) {

                            if (
                                otherItem !== item
                            ) {

                                otherItem.classList.remove(
                                    "active"
                                );
                            }
                        }
                    );

                    item.classList.toggle(
                        "active"
                    );
                }
            );
        }
    );

});