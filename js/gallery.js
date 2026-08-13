import { supabase } from "./supabase-config.js";

const galleryGrid =
    document.getElementById("galleryGrid");

const filterButtons =
    document.querySelectorAll(".filter-btn");

const lightbox =
    document.getElementById("lightbox");

const lightboxImage =
    document.getElementById("lightboxImage");

const lightboxClose =
    document.getElementById("lightboxClose");

let galleryData = [];
let activeFilter = "all";


// =====================================
// LOAD GALLERY FROM SUPABASE
// =====================================

async function loadGallery() {

    galleryGrid.innerHTML =
        "<p>Loading gallery...</p>";

    const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", {
            ascending: false
        });

    if (error) {

        console.error(
            "Gallery load error:",
            error
        );

        galleryGrid.innerHTML =
            "<p>Unable to load gallery.</p>";

        return;
    }

    galleryData = data || [];

    renderGallery();
}


// =====================================
// RENDER GALLERY
// =====================================

function renderGallery() {

    galleryGrid.innerHTML = "";

    const filteredPhotos =
        activeFilter === "all"
            ? galleryData
            : galleryData.filter(
                (photo) =>
                    photo.category === activeFilter
            );

    if (filteredPhotos.length === 0) {

        galleryGrid.innerHTML =
            "<p>No photos available in this category.</p>";

        return;
    }

    filteredPhotos.forEach((photo) => {

        const photoCard =
            document.createElement("div");

        photoCard.className =
            "gallery-photo gallery-show";

        photoCard.setAttribute(
            "data-category",
            photo.category
        );

        photoCard.innerHTML = `
            <img
                src="${photo.image_url}"
                alt="${photo.title}"
                loading="lazy">

            <div class="gallery-overlay">

                <div>

                    <span>
                        ${photo.category}
                    </span>

                    <h3>
                        ${photo.title}
                    </h3>

                </div>

                <i class="fas fa-magnifying-glass-plus"></i>

            </div>
        `;

        photoCard.addEventListener(
            "click",
            function () {

                openLightbox(
                    photo.image_url,
                    photo.title
                );

            }
        );

        galleryGrid.appendChild(photoCard);

    });
}


// =====================================
// FILTER BUTTONS
// =====================================

filterButtons.forEach((button) => {

    button.addEventListener(
        "click",
        function () {

            filterButtons.forEach((btn) => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            activeFilter =
                button.getAttribute("data-filter");

            renderGallery();

        }
    );

});


// =====================================
// LIGHTBOX OPEN
// =====================================

function openLightbox(imageUrl, title) {

    if (!lightbox || !lightboxImage) {
        return;
    }

    lightboxImage.src = imageUrl;
    lightboxImage.alt = title;

    lightbox.classList.add("active");

    document.body.style.overflow = "hidden";
}


// =====================================
// LIGHTBOX CLOSE
// =====================================

function closeLightbox() {

    if (!lightbox || !lightboxImage) {
        return;
    }

    lightbox.classList.remove("active");

    lightboxImage.src = "";

    document.body.style.overflow = "";
}


// Close button

if (lightboxClose) {

    lightboxClose.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            closeLightbox();

        }
    );

}


// Click outside image

if (lightbox) {

    lightbox.addEventListener(
        "click",
        function (event) {

            if (event.target === lightbox) {

                closeLightbox();

            }

        }
    );

}


// Prevent image click closing lightbox

if (lightboxImage) {

    lightboxImage.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

        }
    );

}


// ESC key close

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            lightbox &&
            lightbox.classList.contains("active")
        ) {

            closeLightbox();

        }

    }
);


// =====================================
// INITIAL LOAD
// =====================================

loadGallery();