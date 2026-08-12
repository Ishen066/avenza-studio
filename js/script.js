document.addEventListener("DOMContentLoaded", function () {

    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    menuToggle.addEventListener("click", function () {
        navLinks.classList.toggle("active");
    });

});
const slides = document.querySelectorAll('.hero-slide');

let currentSlide = 0;

function changeSlide(){

    slides[currentSlide].classList.remove('active');

    currentSlide++;

    if(currentSlide >= slides.length){
        currentSlide = 0;
    }

    slides[currentSlide].classList.add('active');
}

setInterval(changeSlide, 4000);

  // ==============================
        // Gallery Filter
        // ==============================

        const filterButtons = document.querySelectorAll(".filter-btn");
        const galleryPhotos = document.querySelectorAll(".gallery-photo");

        filterButtons.forEach((button) => {
            button.addEventListener("click", () => {

                // Remove active state from all filter buttons
                filterButtons.forEach((btn) => {
                    btn.classList.remove("active");
                });

                // Add active state to clicked button
                button.classList.add("active");

                const selectedFilter = button.getAttribute("data-filter");

                galleryPhotos.forEach((photo) => {
                    const category = photo.getAttribute("data-category");

                    if (selectedFilter === "all" || category === selectedFilter) {
                        photo.style.display = "block";
                        photo.style.animation = "galleryFade 0.4s ease";
                    } else {
                        photo.style.display = "none";
                    }
                });
            });
        });