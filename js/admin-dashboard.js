import { supabase } from "./supabase-config.js";


// =====================================
// CHECK LOGIN SESSION
// =====================================

const {
    data: { session }
} = await supabase.auth.getSession();

if (!session) {
    window.location.href = "admin-login.html";
}


// =====================================
// GALLERY ELEMENTS
// =====================================

const uploadForm =
    document.getElementById("galleryUploadForm");

const titleInput =
    document.getElementById("photoTitle");

const categoryInput =
    document.getElementById("photoCategory");

const fileInput =
    document.getElementById("photoFile");

const uploadMessage =
    document.getElementById("uploadMessage");

const adminGalleryGrid =
    document.getElementById("adminGalleryGrid");

const logoutBtn =
    document.getElementById("logoutBtn");


// =====================================
// LOAD GALLERY
// =====================================

async function loadGallery() {

    const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", {
            ascending: false
        });

    if (error) {
        console.error("Load gallery error:", error);
        return;
    }

    adminGalleryGrid.innerHTML = "";

    data.forEach((photo) => {

        const card = document.createElement("div");

        card.className = "admin-gallery-card";

        card.innerHTML = `
            <img src="${photo.image_url}"
                 alt="${photo.title}">

            <div class="admin-gallery-info">

                <h3>${photo.title}</h3>

                <p>${photo.category}</p>

                <button
                    class="delete-photo-btn"
                    data-id="${photo.id}"
                    data-url="${photo.image_url}">
                    Delete
                </button>

            </div>
        `;

        adminGalleryGrid.appendChild(card);

    });

    addDeleteEvents();
}


// =====================================
// UPLOAD PHOTO
// =====================================

uploadForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        uploadMessage.textContent =
            "Uploading photo...";

        const title =
            titleInput.value.trim();

        const category =
            categoryInput.value;

        const file =
            fileInput.files[0];

        if (!file) {
            uploadMessage.textContent =
                "Please select a photo.";
            return;
        }

        const fileName =
            `${Date.now()}-${file.name}`;

        const {
            error: uploadError
        } = await supabase.storage
            .from("gallery-images")
            .upload(fileName, file);

        if (uploadError) {

            console.error(
                "Upload error:",
                uploadError
            );

            uploadMessage.textContent =
                "Image upload failed.";

            return;
        }

        const {
            data: publicUrlData
        } = supabase.storage
            .from("gallery-images")
            .getPublicUrl(fileName);

        const imageUrl =
            publicUrlData.publicUrl;

        const {
            error: insertError
        } = await supabase
            .from("gallery")
            .insert([
                {
                    title: title,
                    category: category,
                    image_url: imageUrl
                }
            ]);

        if (insertError) {

            console.error(
                "Database insert error:",
                insertError
            );

            uploadMessage.textContent =
                "Photo details could not be saved.";

            return;
        }

        uploadMessage.textContent =
            "Photo uploaded successfully!";

        uploadForm.reset();

        loadGallery();
    }
);


// =====================================
// DELETE PHOTO
// =====================================

function addDeleteEvents() {

    const deleteButtons =
        document.querySelectorAll(
            ".delete-photo-btn"
        );

    deleteButtons.forEach((button) => {

        button.addEventListener(
            "click",
            async function () {

                const id =
                    button.getAttribute("data-id");

                const imageUrl =
                    button.getAttribute("data-url");

                const confirmDelete =
                    confirm(
                        "Are you sure you want to delete this photo?"
                    );

                if (!confirmDelete) {
                    return;
                }

                const {
                    error
                } = await supabase
                    .from("gallery")
                    .delete()
                    .eq("id", id);

                if (error) {

                    console.error(
                        "Delete error:",
                        error
                    );

                    return;
                }

                const fileName =
                    imageUrl.split(
                        "/gallery-images/"
                    )[1];

                if (fileName) {

                    await supabase.storage
                        .from("gallery-images")
                        .remove([fileName]);

                }

                loadGallery();
            }
        );

    });
}


// =====================================
// SERVICES MANAGEMENT ELEMENTS
// =====================================

const serviceForm =
    document.getElementById("serviceForm");

const serviceId =
    document.getElementById("serviceId");

const serviceName =
    document.getElementById("serviceName");

const serviceDescription =
    document.getElementById("serviceDescription");

const serviceIcon =
    document.getElementById("serviceIcon");

const serviceMessage =
    document.getElementById("serviceMessage");

const serviceSubmitBtn =
    document.getElementById("serviceSubmitBtn");

const cancelServiceEdit =
    document.getElementById("cancelServiceEdit");

const adminServicesGrid =
    document.getElementById("adminServicesGrid");


// =====================================
// LOAD SERVICES
// =====================================

async function loadServices() {

    if (!adminServicesGrid) {
        return;
    }

    const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("created_at", {
            ascending: true
        });

    if (error) {

        console.error(
            "Load services error:",
            error
        );

        return;
    }

    adminServicesGrid.innerHTML = "";

    data.forEach((service) => {

        const card =
            document.createElement("div");

        card.className =
            "admin-service-card";

        card.innerHTML = `
            <i class="${service.icon}"></i>

            <h3>${service.name}</h3>

            <p>${service.description}</p>

            <div class="admin-service-actions">

                <button
                    class="edit-service-btn"
                    data-id="${service.id}">
                    Edit
                </button>

                <button
                    class="delete-service-btn"
                    data-id="${service.id}">
                    Delete
                </button>

            </div>
        `;

        adminServicesGrid.appendChild(card);
    });

    addServiceButtonEvents(data);
}


// =====================================
// ADD / UPDATE SERVICE
// =====================================

if (serviceForm) {

    serviceForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const id =
                serviceId.value;

            const serviceData = {
                name:
                    serviceName.value.trim(),

                description:
                    serviceDescription.value.trim(),

                icon:
                    serviceIcon.value
            };

            let error;

            if (id) {

                const result =
                    await supabase
                        .from("services")
                        .update(serviceData)
                        .eq("id", id);

                error = result.error;

            } else {

                const result =
                    await supabase
                        .from("services")
                        .insert([
                            serviceData
                        ]);

                error = result.error;
            }

            if (error) {

                console.error(
                    "Service save error:",
                    error
                );

                serviceMessage.textContent =
                    "Could not save service.";

                return;
            }

            serviceMessage.textContent =
                id
                    ? "Service updated successfully!"
                    : "Service added successfully!";

            resetServiceForm();

            loadServices();
        }
    );
}


// =====================================
// EDIT / DELETE SERVICE BUTTONS
// =====================================

function addServiceButtonEvents(services) {

    const editButtons =
        document.querySelectorAll(
            ".edit-service-btn"
        );

    const deleteButtons =
        document.querySelectorAll(
            ".delete-service-btn"
        );


    editButtons.forEach((button) => {

        button.addEventListener(
            "click",
            function () {

                const id =
                    button.getAttribute("data-id");

                const service =
                    services.find(
                        (item) =>
                            String(item.id) === id
                    );

                if (!service) {
                    return;
                }

                serviceId.value =
                    service.id;

                serviceName.value =
                    service.name;

                serviceDescription.value =
                    service.description;

                serviceIcon.value =
                    service.icon;

                serviceSubmitBtn.textContent =
                    "Update Service";

                cancelServiceEdit.style.display =
                    "inline-block";

                serviceForm.scrollIntoView({
                    behavior: "smooth"
                });
            }
        );

    });


    deleteButtons.forEach((button) => {

        button.addEventListener(
            "click",
            async function () {

                const id =
                    button.getAttribute("data-id");

                const confirmDelete =
                    confirm(
                        "Are you sure you want to delete this service?"
                    );

                if (!confirmDelete) {
                    return;
                }

                const { error } =
                    await supabase
                        .from("services")
                        .delete()
                        .eq("id", id);

                if (error) {

                    console.error(
                        "Delete service error:",
                        error
                    );

                    return;
                }

                loadServices();
            }
        );

    });
}


// =====================================
// CANCEL SERVICE EDIT
// =====================================

if (cancelServiceEdit) {

    cancelServiceEdit.addEventListener(
        "click",
        function () {

            resetServiceForm();

        }
    );
}


// =====================================
// RESET SERVICE FORM
// =====================================

function resetServiceForm() {

    if (!serviceForm) {
        return;
    }

    serviceForm.reset();

    serviceId.value = "";

    serviceSubmitBtn.textContent =
        "Add Service";

    cancelServiceEdit.style.display =
        "none";
}


// =====================================
// LOGOUT
// =====================================

logoutBtn.addEventListener(
    "click",
    async function () {

        await supabase.auth.signOut();

        window.location.href =
            "admin-login.html";

    }
);


// =====================================
// INITIAL LOAD
// =====================================

loadGallery();
loadServices();
// =====================================
// ADMIN SIDEBAR SECTION SWITCHING
// =====================================

const adminNavLinks =
    document.querySelectorAll(".admin-nav-link");

const adminSections =
    document.querySelectorAll(".admin-section");

adminNavLinks.forEach((link) => {

    link.addEventListener("click", function (event) {

        event.preventDefault();

        const sectionId =
            this.getAttribute("data-section");

        adminNavLinks.forEach((nav) => {
            nav.classList.remove("active");
        });

        adminSections.forEach((section) => {
            section.classList.remove("active");
        });

        this.classList.add("active");

        const selectedSection =
            document.getElementById(sectionId);

        if (selectedSection) {
            selectedSection.classList.add("active");
        }

    });
    // =====================================
// PRICING MANAGEMENT ELEMENTS
// =====================================

const pricingForm =
    document.getElementById("pricingForm");

const pricingId =
    document.getElementById("pricingId");

const pricingName =
    document.getElementById("pricingName");

const pricingPrice =
    document.getElementById("pricingPrice");

const pricingDescription =
    document.getElementById("pricingDescription");

const pricingFeatures =
    document.getElementById("pricingFeatures");

const pricingPopular =
    document.getElementById("pricingPopular");

const pricingMessage =
    document.getElementById("pricingMessage");

const pricingSubmitBtn =
    document.getElementById("pricingSubmitBtn");

const cancelPricingEdit =
    document.getElementById("cancelPricingEdit");

const adminPricingGrid =
    document.getElementById("adminPricingGrid");


// =====================================
// LOAD PRICING PACKAGES
// =====================================

async function loadPricing() {

    if (!adminPricingGrid) {
        return;
    }

    const { data, error } = await supabase
        .from("pricing")
        .select("*")
        .order("created_at", {
            ascending: true
        });

    if (error) {

        console.error(
            "Load pricing error:",
            error
        );

        return;
    }

    adminPricingGrid.innerHTML = "";

    data.forEach((item) => {

        const card =
            document.createElement("div");

        card.className =
            "admin-pricing-card";

        const featureList =
            item.features
                ? item.features.split("|")
                : [];

        card.innerHTML = `

            ${
                item.is_popular
                    ? '<span class="popular-badge">Most Popular</span>'
                    : ''
            }

            <h3>
                ${item.name}
            </h3>

            <h4>
                ${item.price}
            </h4>

            <p>
                ${item.description}
            </p>

            <ul>

                ${featureList
                    .map(
                        (feature) =>
                            `<li>
                                <i class="fas fa-check"></i>
                                ${feature.trim()}
                            </li>`
                    )
                    .join("")}

            </ul>

            <div class="admin-service-actions">

                <button
                    class="edit-pricing-btn"
                    data-id="${item.id}">

                    Edit

                </button>

                <button
                    class="delete-pricing-btn"
                    data-id="${item.id}">

                    Delete

                </button>

            </div>
        `;

        adminPricingGrid.appendChild(card);

    });

    addPricingButtonEvents(data);
}


// =====================================
// ADD / UPDATE PRICING
// =====================================

if (pricingForm) {

    pricingForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const id =
                pricingId.value;

            const pricingData = {

                name:
                    pricingName.value.trim(),

                price:
                    pricingPrice.value.trim(),

                description:
                    pricingDescription.value.trim(),

                features:
                    pricingFeatures.value.trim(),

                is_popular:
                    pricingPopular.checked
            };

            let error;

            if (id) {

                const result =
                    await supabase
                        .from("pricing")
                        .update(pricingData)
                        .eq("id", id);

                error = result.error;

            } else {

                const result =
                    await supabase
                        .from("pricing")
                        .insert([
                            pricingData
                        ]);

                error = result.error;
            }

            if (error) {

                console.error(
                    "Pricing save error:",
                    error
                );

                pricingMessage.textContent =
                    "Could not save package.";

                return;
            }

            pricingMessage.textContent =
                id
                    ? "Package updated successfully!"
                    : "Package added successfully!";

            resetPricingForm();

            loadPricing();
        }
    );
}


// =====================================
// EDIT / DELETE PRICING
// =====================================

function addPricingButtonEvents(packages) {

    const editButtons =
        document.querySelectorAll(
            ".edit-pricing-btn"
        );

    const deleteButtons =
        document.querySelectorAll(
            ".delete-pricing-btn"
        );


    editButtons.forEach((button) => {

        button.addEventListener(
            "click",
            function () {

                const id =
                    button.getAttribute(
                        "data-id"
                    );

                const item =
                    packages.find(
                        (packageItem) =>
                            String(packageItem.id) === id
                    );

                if (!item) {
                    return;
                }

                pricingId.value =
                    item.id;

                pricingName.value =
                    item.name;

                pricingPrice.value =
                    item.price;

                pricingDescription.value =
                    item.description;

                pricingFeatures.value =
                    item.features;

                pricingPopular.checked =
                    item.is_popular;

                pricingSubmitBtn.textContent =
                    "Update Package";

                cancelPricingEdit.style.display =
                    "inline-block";

                pricingForm.scrollIntoView({
                    behavior: "smooth"
                });
            }
        );

    });


    deleteButtons.forEach((button) => {

        button.addEventListener(
            "click",
            async function () {

                const id =
                    button.getAttribute(
                        "data-id"
                    );

                const confirmDelete =
                    confirm(
                        "Are you sure you want to delete this package?"
                    );

                if (!confirmDelete) {
                    return;
                }

                const { error } =
                    await supabase
                        .from("pricing")
                        .delete()
                        .eq("id", id);

                if (error) {

                    console.error(
                        "Delete pricing error:",
                        error
                    );

                    return;
                }

                loadPricing();
            }
        );

    });
}


// =====================================
// CANCEL PRICING EDIT
// =====================================

if (cancelPricingEdit) {

    cancelPricingEdit.addEventListener(
        "click",
        function () {

            resetPricingForm();

        }
    );
}


// =====================================
// RESET PRICING FORM
// =====================================

function resetPricingForm() {

    if (!pricingForm) {
        return;
    }

    pricingForm.reset();

    pricingId.value = "";

    pricingSubmitBtn.textContent =
        "Add Package";

    cancelPricingEdit.style.display =
        "none";
}


// =====================================
// INITIAL PRICING LOAD
// =====================================

loadPricing();

});