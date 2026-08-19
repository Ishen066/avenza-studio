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

const galleryUploadBtn =
    document.getElementById("galleryUploadBtn");


// =====================================
// LOAD GALLERY
// =====================================

async function loadGallery() {

    if (!adminGalleryGrid) return;

    const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", {
            ascending: false
        });

    if (error) {
        console.error(
            "Load gallery error:",
            error
        );
        return;
    }

    adminGalleryGrid.innerHTML = "";

    (data || []).forEach((photo) => {

        const card =
            document.createElement("div");

        card.className =
            "admin-gallery-card";

        card.innerHTML = `
            <img
                src="${photo.image_url}"
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

if (uploadForm) {

    uploadForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            uploadMessage.textContent =
                "Checking image...";

            const title =
                titleInput.value.trim();

            const category =
                categoryInput.value;

            const file =
                fileInput.files[0];

            if (!title) {

                uploadMessage.textContent =
                    "Please enter a photo title.";

                return;
            }

            if (!category) {

                uploadMessage.textContent =
                    "Please select a category.";

                return;
            }

            if (!file) {

                uploadMessage.textContent =
                    "Please select a photo.";

                return;
            }

            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];

            if (!allowedTypes.includes(file.type)) {

                uploadMessage.textContent =
                    "Only JPG, PNG and WEBP images are allowed.";

                fileInput.value = "";

                return;
            }

            const maxFileSize =
                5 * 1024 * 1024;

            if (file.size > maxFileSize) {

                uploadMessage.textContent =
                    "Image must be smaller than 5 MB.";

                fileInput.value = "";

                return;
            }

            setGalleryUploadState(true);

            uploadMessage.textContent =
                "Uploading photo...";

            const cleanFileName =
                file.name
                    .toLowerCase()
                    .replace(
                        /[^a-z0-9.-]/g,
                        "-"
                    )
                    .replace(
                        /-+/g,
                        "-"
                    );

            const fileName =
                `${Date.now()}-${cleanFileName}`;

            try {

                const {
                    error: uploadError
                } = await supabase.storage
                    .from("gallery-images")
                    .upload(
                        fileName,
                        file,
                        {
                            cacheControl:
                                "3600",

                            upsert:
                                false
                        }
                    );

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
                    .getPublicUrl(
                        fileName
                    );

                const imageUrl =
                    publicUrlData.publicUrl;

                const {
                    error: insertError
                } = await supabase
                    .from("gallery")
                    .insert([
                        {
                            title:
                                title,

                            category:
                                category,

                            image_url:
                                imageUrl
                        }
                    ]);

                if (insertError) {

                    console.error(
                        "Database insert error:",
                        insertError
                    );

                    await supabase.storage
                        .from("gallery-images")
                        .remove([
                            fileName
                        ]);

                    uploadMessage.textContent =
                        "Photo details could not be saved.";

                    return;
                }

                uploadMessage.textContent =
                    "Photo uploaded successfully!";

                uploadForm.reset();

                await loadGallery();

            } catch (error) {

                console.error(
                    "Unexpected upload error:",
                    error
                );

                uploadMessage.textContent =
                    "Something went wrong while uploading.";

            } finally {

                setGalleryUploadState(
                    false
                );
            }
        }
    );
}


// =====================================
// GALLERY BUTTON STATE
// =====================================

function setGalleryUploadState(
    isUploading
) {

    if (!galleryUploadBtn) return;

    galleryUploadBtn.disabled =
        isUploading;

    if (isUploading) {

        galleryUploadBtn.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            Uploading...
        `;

    } else {

        galleryUploadBtn.innerHTML = `
            <i class="fas fa-cloud-arrow-up"></i>
            Upload Photo
        `;
    }
}


// =====================================
// DELETE GALLERY PHOTO
// =====================================

function addDeleteEvents() {

    document.querySelectorAll(
        ".delete-photo-btn"
    ).forEach((button) => {

        button.addEventListener(
            "click",
            async function () {

                const id =
                    button.getAttribute(
                        "data-id"
                    );

                const imageUrl =
                    button.getAttribute(
                        "data-url"
                    );

                if (!confirm(
                    "Are you sure you want to delete this photo?"
                )) {
                    return;
                }

                const { error } =
                    await supabase
                        .from("gallery")
                        .delete()
                        .eq(
                            "id",
                            id
                        );

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

                    const {
                        error:
                            storageDeleteError
                    } = await supabase.storage
                        .from(
                            "gallery-images"
                        )
                        .remove([
                            fileName
                        ]);

                    if (
                        storageDeleteError
                    ) {

                        console.error(
                            "Storage delete error:",
                            storageDeleteError
                        );
                    }
                }

                loadGallery();
            }
        );
    });
}


// =====================================
// SERVICES ELEMENTS
// =====================================

const serviceForm =
    document.getElementById(
        "serviceForm"
    );

const serviceId =
    document.getElementById(
        "serviceId"
    );

const serviceName =
    document.getElementById(
        "serviceName"
    );

const serviceDescription =
    document.getElementById(
        "serviceDescription"
    );

const serviceIcon =
    document.getElementById(
        "serviceIcon"
    );

const serviceMessage =
    document.getElementById(
        "serviceMessage"
    );

const serviceSubmitBtn =
    document.getElementById(
        "serviceSubmitBtn"
    );

const cancelServiceEdit =
    document.getElementById(
        "cancelServiceEdit"
    );

const adminServicesGrid =
    document.getElementById(
        "adminServicesGrid"
    );


// =====================================
// LOAD SERVICES
// =====================================

async function loadServices() {

    if (!adminServicesGrid) return;

    const { data, error } =
        await supabase
            .from("services")
            .select("*")
            .order(
                "created_at",
                {
                    ascending:
                        true
                }
            );

    if (error) {

        console.error(
            "Load services error:",
            error
        );

        return;
    }

    adminServicesGrid.innerHTML =
        "";

    (data || []).forEach(
        (service) => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "admin-service-card";

            card.innerHTML = `

                <i class="${service.icon}"></i>

                <h3>
                    ${service.name}
                </h3>

                <p>
                    ${service.description}
                </p>

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

            adminServicesGrid
                .appendChild(
                    card
                );
        }
    );

    addServiceButtonEvents(
        data || []
    );
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
                    serviceName
                        .value
                        .trim(),

                description:
                    serviceDescription
                        .value
                        .trim(),

                icon:
                    serviceIcon.value
            };

            let error;

            if (id) {

                const result =
                    await supabase
                        .from("services")
                        .update(
                            serviceData
                        )
                        .eq(
                            "id",
                            id
                        );

                error =
                    result.error;

            } else {

                const result =
                    await supabase
                        .from("services")
                        .insert([
                            serviceData
                        ]);

                error =
                    result.error;
            }

            if (error) {

                console.error(
                    "Service save error:",
                    error
                );

                serviceMessage
                    .textContent =
                    "Could not save service.";

                return;
            }

            serviceMessage
                .textContent =
                id
                    ? "Service updated successfully!"
                    : "Service added successfully!";

            resetServiceForm();

            loadServices();
        }
    );
}


// =====================================
// SERVICE EDIT / DELETE
// =====================================

function addServiceButtonEvents(
    services
) {

    document.querySelectorAll(
        ".edit-service-btn"
    ).forEach((button) => {

        button.addEventListener(
            "click",
            function () {

                const id =
                    button.getAttribute(
                        "data-id"
                    );

                const service =
                    services.find(
                        item =>
                            String(
                                item.id
                            ) === id
                    );

                if (!service) return;

                serviceId.value =
                    service.id;

                serviceName.value =
                    service.name;

                serviceDescription
                    .value =
                    service.description;

                serviceIcon.value =
                    service.icon;

                serviceSubmitBtn
                    .textContent =
                    "Update Service";

                cancelServiceEdit
                    .style.display =
                    "inline-block";

                serviceForm
                    .scrollIntoView({
                        behavior:
                            "smooth"
                    });
            }
        );
    });


    document.querySelectorAll(
        ".delete-service-btn"
    ).forEach((button) => {

        button.addEventListener(
            "click",
            async function () {

                const id =
                    button.getAttribute(
                        "data-id"
                    );

                if (!confirm(
                    "Are you sure you want to delete this service?"
                )) {
                    return;
                }

                const { error } =
                    await supabase
                        .from("services")
                        .delete()
                        .eq(
                            "id",
                            id
                        );

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


if (cancelServiceEdit) {

    cancelServiceEdit.addEventListener(
        "click",
        resetServiceForm
    );
}


function resetServiceForm() {

    if (!serviceForm) return;

    serviceForm.reset();

    serviceId.value =
        "";

    serviceSubmitBtn.innerHTML =
        '<i class="fas fa-plus"></i> Add Service';

    cancelServiceEdit
        .style.display =
        "none";
}


// =====================================
// PRICING ELEMENTS
// =====================================

const pricingForm =
    document.getElementById(
        "pricingForm"
    );

const pricingId =
    document.getElementById(
        "pricingId"
    );

const pricingName =
    document.getElementById(
        "pricingName"
    );

const pricingPrice =
    document.getElementById(
        "pricingPrice"
    );

const pricingDescription =
    document.getElementById(
        "pricingDescription"
    );

const pricingFeatures =
    document.getElementById(
        "pricingFeatures"
    );

const pricingPopular =
    document.getElementById(
        "pricingPopular"
    );

const pricingMessage =
    document.getElementById(
        "pricingMessage"
    );

const pricingSubmitBtn =
    document.getElementById(
        "pricingSubmitBtn"
    );

const cancelPricingEdit =
    document.getElementById(
        "cancelPricingEdit"
    );

const adminPricingGrid =
    document.getElementById(
        "adminPricingGrid"
    );


// =====================================
// LOAD PRICING
// =====================================

async function loadPricing() {

    if (!adminPricingGrid) return;

    const { data, error } =
        await supabase
            .from("pricing")
            .select("*")
            .order(
                "created_at",
                {
                    ascending:
                        true
                }
            );

    if (error) {

        console.error(
            "Load pricing error:",
            error
        );

        return;
    }

    adminPricingGrid.innerHTML =
        "";

    (data || []).forEach((item) => {

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "admin-pricing-card";

        const featureList =
            item.features
                ? item.features
                    .split("|")
                : [];

        card.innerHTML = `

            ${
                item.is_popular
                    ? '<span class="popular-badge">Most Popular</span>'
                    : ""
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
                        feature => `
                            <li>
                                <i class="fas fa-check"></i>
                                ${feature.trim()}
                            </li>
                        `
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

        adminPricingGrid
            .appendChild(
                card
            );
    });

    addPricingButtonEvents(
        data || []
    );
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
                    pricingName
                        .value
                        .trim(),

                price:
                    pricingPrice
                        .value
                        .trim(),

                description:
                    pricingDescription
                        .value
                        .trim(),

                features:
                    pricingFeatures
                        .value
                        .trim(),

                is_popular:
                    pricingPopular
                        .checked
            };

            let error;

            if (id) {

                const result =
                    await supabase
                        .from("pricing")
                        .update(
                            pricingData
                        )
                        .eq(
                            "id",
                            id
                        );

                error =
                    result.error;

            } else {

                const result =
                    await supabase
                        .from("pricing")
                        .insert([
                            pricingData
                        ]);

                error =
                    result.error;
            }

            if (error) {

                console.error(
                    "Pricing save error:",
                    error
                );

                pricingMessage
                    .textContent =
                    "Could not save package.";

                return;
            }

            pricingMessage
                .textContent =
                id
                    ? "Package updated successfully!"
                    : "Package added successfully!";

            resetPricingForm();

            loadPricing();
        }
    );
}


// =====================================
// PRICING EDIT / DELETE
// =====================================

function addPricingButtonEvents(
    packages
) {

    document.querySelectorAll(
        ".edit-pricing-btn"
    ).forEach((button) => {

        button.addEventListener(
            "click",
            function () {

                const id =
                    button.getAttribute(
                        "data-id"
                    );

                const item =
                    packages.find(
                        packageItem =>
                            String(
                                packageItem.id
                            ) === id
                    );

                if (!item) return;

                pricingId.value =
                    item.id;

                pricingName.value =
                    item.name;

                pricingPrice.value =
                    item.price;

                pricingDescription
                    .value =
                    item.description;

                pricingFeatures
                    .value =
                    item.features ||
                    "";

                pricingPopular
                    .checked =
                    Boolean(
                        item.is_popular
                    );

                pricingSubmitBtn
                    .textContent =
                    "Update Package";

                cancelPricingEdit
                    .style.display =
                    "inline-block";

                pricingForm
                    .scrollIntoView({
                        behavior:
                            "smooth"
                    });
            }
        );
    });


    document.querySelectorAll(
        ".delete-pricing-btn"
    ).forEach((button) => {

        button.addEventListener(
            "click",
            async function () {

                const id =
                    button.getAttribute(
                        "data-id"
                    );

                if (!confirm(
                    "Are you sure you want to delete this package?"
                )) {
                    return;
                }

                const { error } =
                    await supabase
                        .from("pricing")
                        .delete()
                        .eq(
                            "id",
                            id
                        );

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


if (cancelPricingEdit) {

    cancelPricingEdit.addEventListener(
        "click",
        resetPricingForm
    );
}


function resetPricingForm() {

    if (!pricingForm) return;

    pricingForm.reset();

    pricingId.value =
        "";

    pricingSubmitBtn.innerHTML =
        '<i class="fas fa-plus"></i> Add Package';

    cancelPricingEdit
        .style.display =
        "none";
}


// =====================================
// SITE SETTINGS ELEMENTS
// =====================================

const settingsForm =
    document.getElementById(
        "settingsForm"
    );

const settingsPhone =
    document.getElementById(
        "settingsPhone"
    );

const settingsEmail =
    document.getElementById(
        "settingsEmail"
    );

const settingsAddress =
    document.getElementById(
        "settingsAddress"
    );

const settingsOpeningHours =
    document.getElementById(
        "settingsOpeningHours"
    );

const settingsFacebook =
    document.getElementById(
        "settingsFacebook"
    );

const settingsInstagram =
    document.getElementById(
        "settingsInstagram"
    );

const settingsTiktok =
    document.getElementById(
        "settingsTiktok"
    );

const settingsWhatsapp =
    document.getElementById(
        "settingsWhatsapp"
    );

const settingsMessage =
    document.getElementById(
        "settingsMessage"
    );

let settingsRowId =
    null;


// =====================================
// LOAD SITE SETTINGS
// =====================================

async function loadSiteSettings() {

    if (!settingsForm) return;

    const { data, error } =
        await supabase
            .from("site_settings")
            .select("*")
            .limit(1)
            .maybeSingle();

    if (error) {

        console.error(
            "Load site settings error:",
            error
        );

        settingsMessage
            .textContent =
            "Unable to load site settings.";

        return;
    }

    if (!data) {

        settingsMessage
            .textContent =
            "No site settings row found.";

        return;
    }

    settingsRowId =
        data.id;

    settingsPhone.value =
        data.phone || "";

    settingsEmail.value =
        data.email || "";

    settingsAddress.value =
        data.address || "";

    settingsOpeningHours.value =
        data.opening_hours || "";

    settingsFacebook.value =
        data.facebook_url || "";

    settingsInstagram.value =
        data.instagram_url || "";

    settingsTiktok.value =
        data.tiktok_url || "";

    settingsWhatsapp.value =
        data.whatsapp_number || "";
}


// =====================================
// UPDATE SITE SETTINGS
// =====================================

if (settingsForm) {

    settingsForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            if (!settingsRowId) {

                settingsMessage
                    .textContent =
                    "No settings record found.";

                return;
            }

            settingsMessage
                .textContent =
                "Saving settings...";

            const settingsData = {

                phone:
                    settingsPhone
                        .value
                        .trim(),

                email:
                    settingsEmail
                        .value
                        .trim(),

                address:
                    settingsAddress
                        .value
                        .trim(),

                opening_hours:
                    settingsOpeningHours
                        .value
                        .trim(),

                facebook_url:
                    settingsFacebook
                        .value
                        .trim(),

                instagram_url:
                    settingsInstagram
                        .value
                        .trim(),

                tiktok_url:
                    settingsTiktok
                        .value
                        .trim(),

                whatsapp_number:
                    settingsWhatsapp
                        .value
                        .trim()
            };

            const { error } =
                await supabase
                    .from(
                        "site_settings"
                    )
                    .update(
                        settingsData
                    )
                    .eq(
                        "id",
                        settingsRowId
                    );

            if (error) {

                console.error(
                    "Settings update error:",
                    error
                );

                settingsMessage
                    .textContent =
                    "Could not save settings.";

                return;
            }

            settingsMessage
                .textContent =
                "Settings updated successfully!";
        }
    );
}


// =====================================
// ABOUT MANAGEMENT ELEMENTS
// =====================================

const aboutSettingsForm =
    document.getElementById(
        "aboutSettingsForm"
    );

const aboutStoryTitle =
    document.getElementById(
        "aboutStoryTitle"
    );

const aboutStoryText1 =
    document.getElementById(
        "aboutStoryText1"
    );

const aboutStoryText2 =
    document.getElementById(
        "aboutStoryText2"
    );

const aboutStudioImage =
    document.getElementById(
        "aboutStudioImage"
    );

const aboutStudioPreview =
    document.getElementById(
        "aboutStudioPreview"
    );

const aboutSettingsMessage =
    document.getElementById(
        "aboutSettingsMessage"
    );

const aboutSettingsSaveBtn =
    document.getElementById(
        "aboutSettingsSaveBtn"
    );


// =====================================
// TEAM MEMBER ELEMENTS
// =====================================

const teamMemberForm =
    document.getElementById(
        "teamMemberForm"
    );

const teamMemberId =
    document.getElementById(
        "teamMemberId"
    );

const teamMemberOldImageUrl =
    document.getElementById(
        "teamMemberOldImageUrl"
    );

const teamMemberName =
    document.getElementById(
        "teamMemberName"
    );

const teamMemberRole =
    document.getElementById(
        "teamMemberRole"
    );


// NEW - PHONE
const teamMemberPhone =
    document.getElementById(
        "teamMemberPhone"
    );


// NEW - EMAIL
const teamMemberEmail =
    document.getElementById(
        "teamMemberEmail"
    );


// NEW - WHATSAPP
const teamMemberWhatsapp =
    document.getElementById(
        "teamMemberWhatsapp"
    );


const teamMemberDescription =
    document.getElementById(
        "teamMemberDescription"
    );

const teamMemberOrder =
    document.getElementById(
        "teamMemberOrder"
    );

const teamMemberImage =
    document.getElementById(
        "teamMemberImage"
    );

const teamMemberMessage =
    document.getElementById(
        "teamMemberMessage"
    );

const teamMemberSubmitBtn =
    document.getElementById(
        "teamMemberSubmitBtn"
    );

const cancelTeamMemberEdit =
    document.getElementById(
        "cancelTeamMemberEdit"
    );

const adminTeamGrid =
    document.getElementById(
        "adminTeamGrid"
    );

let aboutSettingsRowId =
    null;

let currentStudioImageUrl =
    "";


// =====================================
// ABOUT IMAGE VALIDATION
// =====================================

function validateAboutImage(file) {

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (
        !allowedTypes.includes(
            file.type
        )
    ) {

        return "Only JPG, PNG and WEBP images are allowed.";
    }

    if (
        file.size >
        5 * 1024 * 1024
    ) {

        return "Image must be smaller than 5 MB.";
    }

    return "";
}


// =====================================
// CREATE SAFE FILE NAME
// =====================================

function createSafeImageFileName(
    file,
    prefix
) {

    const cleanFileName =
        file.name
            .toLowerCase()
            .replace(
                /[^a-z0-9.-]/g,
                "-"
            )
            .replace(
                /-+/g,
                "-"
            );

    return `${prefix}-${Date.now()}-${cleanFileName}`;
}


// =====================================
// UPLOAD ABOUT IMAGE
// =====================================

async function uploadAboutImage(
    file,
    prefix
) {

    const fileName =
        createSafeImageFileName(
            file,
            prefix
        );

    const {
        error: uploadError
    } = await supabase.storage
        .from("about-images")
        .upload(
            fileName,
            file,
            {
                cacheControl:
                    "3600",

                upsert:
                    false
            }
        );

    if (uploadError) {

        throw uploadError;
    }

    const {
        data: publicUrlData
    } = supabase.storage
        .from("about-images")
        .getPublicUrl(
            fileName
        );

    return publicUrlData
        .publicUrl;
}


// =====================================
// GET STORAGE FILE NAME
// =====================================

function getAboutStorageFileName(
    imageUrl
) {

    if (!imageUrl) return "";

    const parts =
        imageUrl.split(
            "/about-images/"
        );

    return parts.length > 1
        ? decodeURIComponent(
            parts[1]
        )
        : "";
}


// =====================================
// REMOVE ABOUT IMAGE
// =====================================

async function removeAboutImageByUrl(
    imageUrl
) {

    const fileName =
        getAboutStorageFileName(
            imageUrl
        );

    if (!fileName) return;

    const { error } =
        await supabase.storage
            .from("about-images")
            .remove([
                fileName
            ]);

    if (error) {

        console.error(
            "About image delete error:",
            error
        );
    }
}


// =====================================
// STUDIO IMAGE PREVIEW
// =====================================

function renderStudioPreview(
    imageUrl
) {

    if (!aboutStudioPreview)
        return;

    if (!imageUrl) {

        aboutStudioPreview
            .innerHTML =
            "<p>No studio image available.</p>";

        return;
    }

    aboutStudioPreview
        .innerHTML = `
        <img
            src="${imageUrl}"
            alt="Current studio photo"
            style="
                width:100%;
                max-width:420px;
                height:240px;
                object-fit:cover;
                border-radius:14px;
                display:block;
            ">
    `;
}


// =====================================
// LOAD ABOUT SETTINGS
// =====================================

async function loadAboutSettings() {

    if (!aboutSettingsForm)
        return;

    const { data, error } =
        await supabase
            .from(
                "about_settings"
            )
            .select("*")
            .limit(1)
            .maybeSingle();

    if (error) {

        console.error(
            "Load about settings error:",
            error
        );

        aboutSettingsMessage
            .textContent =
            "Unable to load about settings.";

        return;
    }

    if (!data) {

        aboutSettingsMessage
            .textContent =
            "No about settings row found.";

        return;
    }

    aboutSettingsRowId =
        data.id;

    currentStudioImageUrl =
        data.studio_image_url ||
        "";

    aboutStoryTitle.value =
        data.story_title ||
        "";

    aboutStoryText1.value =
        data.story_text_1 ||
        "";

    aboutStoryText2.value =
        data.story_text_2 ||
        "";

    renderStudioPreview(
        currentStudioImageUrl
    );
}


// =====================================
// UPDATE ABOUT SETTINGS
// =====================================

if (aboutSettingsForm) {

    aboutSettingsForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            if (
                !aboutSettingsRowId
            ) {

                aboutSettingsMessage
                    .textContent =
                    "No about settings record found.";

                return;
            }

            aboutSettingsSaveBtn
                .disabled =
                true;

            aboutSettingsSaveBtn
                .innerHTML = `
                <i class="fas fa-spinner fa-spin"></i>
                Saving...
            `;

            aboutSettingsMessage
                .textContent =
                "Saving about settings...";

            let newStudioImageUrl =
                currentStudioImageUrl;

            let uploadedNewImage =
                false;

            try {

                const newImage =
                    aboutStudioImage
                        .files[0];

                if (newImage) {

                    const validationError =
                        validateAboutImage(
                            newImage
                        );

                    if (
                        validationError
                    ) {

                        aboutSettingsMessage
                            .textContent =
                            validationError;

                        return;
                    }

                    newStudioImageUrl =
                        await uploadAboutImage(
                            newImage,
                            "studio"
                        );

                    uploadedNewImage =
                        true;
                }

                const { error } =
                    await supabase
                        .from(
                            "about_settings"
                        )
                        .update({

                            studio_image_url:
                                newStudioImageUrl,

                            story_title:
                                aboutStoryTitle
                                    .value
                                    .trim(),

                            story_text_1:
                                aboutStoryText1
                                    .value
                                    .trim(),

                            story_text_2:
                                aboutStoryText2
                                    .value
                                    .trim()

                        })
                        .eq(
                            "id",
                            aboutSettingsRowId
                        );

                if (error) {

                    console.error(
                        "About settings update error:",
                        error
                    );

                    if (
                        uploadedNewImage
                    ) {

                        await removeAboutImageByUrl(
                            newStudioImageUrl
                        );
                    }

                    aboutSettingsMessage
                        .textContent =
                        "Could not save about settings.";

                    return;
                }

                if (
                    uploadedNewImage &&
                    currentStudioImageUrl &&
                    currentStudioImageUrl !==
                        newStudioImageUrl
                ) {

                    await removeAboutImageByUrl(
                        currentStudioImageUrl
                    );
                }

                currentStudioImageUrl =
                    newStudioImageUrl;

                aboutStudioImage
                    .value =
                    "";

                renderStudioPreview(
                    currentStudioImageUrl
                );

                aboutSettingsMessage
                    .textContent =
                    "About settings updated successfully!";

            } catch (error) {

                console.error(
                    "About settings error:",
                    error
                );

                aboutSettingsMessage
                    .textContent =
                    "Something went wrong while saving.";

            } finally {

                aboutSettingsSaveBtn
                    .disabled =
                    false;

                aboutSettingsSaveBtn
                    .innerHTML = `
                    <i class="fas fa-floppy-disk"></i>
                    Save About Settings
                `;
            }
        }
    );
}


// =====================================
// LOAD TEAM MEMBERS
// =====================================

async function loadTeamMembers() {

    if (!adminTeamGrid)
        return;

    const { data, error } =
        await supabase
            .from(
                "team_members"
            )
            .select("*")
            .order(
                "display_order",
                {
                    ascending:
                        true
                }
            );

    if (error) {

        console.error(
            "Load team members error:",
            error
        );

        adminTeamGrid
            .innerHTML =
            "<p>Unable to load team members.</p>";

        return;
    }

    adminTeamGrid.innerHTML =
        "";

    if (
        !data ||
        data.length === 0
    ) {

        adminTeamGrid
            .innerHTML =
            "<p>No team members added yet.</p>";

        return;
    }

    data.forEach(
        (member) => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "admin-team-card";

            card.innerHTML = `

                <img
                    src="${member.image_url || ""}"
                    alt="${member.name}"
                    style="
                        width:100%;
                        height:220px;
                        object-fit:cover;
                        border-radius:14px;
                        margin-bottom:16px;
                        background:#eee;
                    ">


                <h3>
                    ${member.name}
                </h3>


                <p>
                    <strong>
                        ${member.role}
                    </strong>
                </p>


                ${
                    member.phone
                        ? `
                        <p>
                            <i class="fas fa-phone"></i>
                            ${member.phone}
                        </p>
                        `
                        : ""
                }


                ${
                    member.email
                        ? `
                        <p>
                            <i class="fas fa-envelope"></i>
                            ${member.email}
                        </p>
                        `
                        : ""
                }


                ${
                    member.whatsapp_number
                        ? `
                        <p>
                            <i class="fab fa-whatsapp"></i>
                            ${member.whatsapp_number}
                        </p>
                        `
                        : ""
                }


                <p>
                    ${member.description}
                </p>


                <p>
                    Display Order:
                    ${member.display_order}
                </p>


                <div class="admin-service-actions">

                    <button
                        class="edit-team-btn"
                        data-id="${member.id}">
                        Edit
                    </button>

                    <button
                        class="delete-team-btn"
                        data-id="${member.id}">
                        Delete
                    </button>

                </div>
            `;

            adminTeamGrid
                .appendChild(
                    card
                );
        }
    );

    addTeamMemberButtonEvents(
        data
    );
}


// =====================================
// ADD / UPDATE TEAM MEMBER
// =====================================

if (teamMemberForm) {

    teamMemberForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const id =
                teamMemberId.value;

            const selectedImage =
                teamMemberImage
                    .files[0];

            const oldImageUrl =
                teamMemberOldImageUrl
                    .value;

            if (
                !id &&
                !selectedImage
            ) {

                teamMemberMessage
                    .textContent =
                    "Please select a team member photo.";

                return;
            }

            if (selectedImage) {

                const validationError =
                    validateAboutImage(
                        selectedImage
                    );

                if (
                    validationError
                ) {

                    teamMemberMessage
                        .textContent =
                        validationError;

                    return;
                }
            }

            teamMemberSubmitBtn
                .disabled =
                true;

            teamMemberSubmitBtn
                .innerHTML = `
                <i class="fas fa-spinner fa-spin"></i>
                Saving...
            `;

            teamMemberMessage
                .textContent =
                "Saving team member...";

            let imageUrl =
                oldImageUrl ||
                "";

            let uploadedNewImage =
                false;

            try {

                if (selectedImage) {

                    imageUrl =
                        await uploadAboutImage(
                            selectedImage,
                            "team"
                        );

                    uploadedNewImage =
                        true;
                }


                // =====================================
                // TEAM MEMBER DATA
                // =====================================

                const memberData = {

                    name:
                        teamMemberName
                            .value
                            .trim(),

                    role:
                        teamMemberRole
                            .value
                            .trim(),

                    phone:
                        teamMemberPhone
                            ? teamMemberPhone
                                .value
                                .trim()
                            : "",

                    email:
                        teamMemberEmail
                            ? teamMemberEmail
                                .value
                                .trim()
                            : "",

                    whatsapp_number:
                        teamMemberWhatsapp
                            ? teamMemberWhatsapp
                                .value
                                .trim()
                            : "",

                    description:
                        teamMemberDescription
                            .value
                            .trim(),

                    image_url:
                        imageUrl,

                    display_order:
                        Number(
                            teamMemberOrder
                                .value
                        )
                };


                let error;


                if (id) {

                    ({
                        error
                    } = await supabase

                        .from(
                            "team_members"
                        )

                        .update(
                            memberData
                        )

                        .eq(
                            "id",
                            id
                        )
                    );

                } else {

                    ({
                        error
                    } = await supabase

                        .from(
                            "team_members"
                        )

                        .insert([
                            memberData
                        ])
                    );
                }


                if (error) {

                    console.error(
                        "Team member save error:",
                        error
                    );

                    if (
                        uploadedNewImage
                    ) {

                        await removeAboutImageByUrl(
                            imageUrl
                        );
                    }

                    teamMemberMessage
                        .textContent =
                        "Could not save team member.";

                    return;
                }


                if (
                    id &&
                    uploadedNewImage &&
                    oldImageUrl &&
                    oldImageUrl !==
                        imageUrl
                ) {

                    await removeAboutImageByUrl(
                        oldImageUrl
                    );
                }


                teamMemberMessage
                    .textContent =
                    id
                        ? "Team member updated successfully!"
                        : "Team member added successfully!";


                resetTeamMemberForm();


                await loadTeamMembers();


            } catch (error) {

                console.error(
                    "Team member error:",
                    error
                );

                teamMemberMessage
                    .textContent =
                    "Something went wrong while saving.";

            } finally {

                teamMemberSubmitBtn
                    .disabled =
                    false;

                if (
                    teamMemberId.value
                ) {

                    teamMemberSubmitBtn
                        .textContent =
                        "Update Team Member";

                } else {

                    teamMemberSubmitBtn
                        .innerHTML = `
                        <i class="fas fa-plus"></i>
                        Add Team Member
                    `;
                }
            }
        }
    );
}


// =====================================
// TEAM MEMBER EDIT / DELETE
// =====================================

function addTeamMemberButtonEvents(
    members
) {

    document.querySelectorAll(
        ".edit-team-btn"
    ).forEach((button) => {

        button.addEventListener(
            "click",
            function () {

                const id =
                    button.getAttribute(
                        "data-id"
                    );

                const member =
                    members.find(
                        item =>
                            String(
                                item.id
                            ) === id
                    );

                if (!member)
                    return;


                teamMemberId.value =
                    member.id;


                teamMemberOldImageUrl
                    .value =
                    member.image_url ||
                    "";


                teamMemberName.value =
                    member.name ||
                    "";


                teamMemberRole.value =
                    member.role ||
                    "";


                // PHONE

                if (
                    teamMemberPhone
                ) {

                    teamMemberPhone
                        .value =
                        member.phone ||
                        "";
                }


                // EMAIL

                if (
                    teamMemberEmail
                ) {

                    teamMemberEmail
                        .value =
                        member.email ||
                        "";
                }


                // WHATSAPP

                if (
                    teamMemberWhatsapp
                ) {

                    teamMemberWhatsapp
                        .value =
                        member.whatsapp_number ||
                        "";
                }


                teamMemberDescription
                    .value =
                    member.description ||
                    "";


                teamMemberOrder.value =
                    member.display_order ||
                    1;


                teamMemberImage.value =
                    "";


                teamMemberSubmitBtn
                    .textContent =
                    "Update Team Member";


                cancelTeamMemberEdit
                    .style.display =
                    "inline-block";


                teamMemberForm
                    .scrollIntoView({
                        behavior:
                            "smooth"
                    });
            }
        );
    });


    document.querySelectorAll(
        ".delete-team-btn"
    ).forEach((button) => {

        button.addEventListener(
            "click",
            async function () {

                const id =
                    button.getAttribute(
                        "data-id"
                    );

                const member =
                    members.find(
                        item =>
                            String(
                                item.id
                            ) === id
                    );

                if (!member)
                    return;

                if (!confirm(
                    "Are you sure you want to delete this team member?"
                )) {
                    return;
                }

                const { error } =
                    await supabase
                        .from(
                            "team_members"
                        )
                        .delete()
                        .eq(
                            "id",
                            id
                        );

                if (error) {

                    console.error(
                        "Delete team member error:",
                        error
                    );

                    return;
                }

                if (
                    member.image_url
                ) {

                    await removeAboutImageByUrl(
                        member.image_url
                    );
                }

                resetTeamMemberForm();

                await loadTeamMembers();
            }
        );
    });
}


// =====================================
// CANCEL TEAM EDIT
// =====================================

if (cancelTeamMemberEdit) {

    cancelTeamMemberEdit
        .addEventListener(
            "click",
            resetTeamMemberForm
        );
}


// =====================================
// RESET TEAM FORM
// =====================================

function resetTeamMemberForm() {

    if (!teamMemberForm)
        return;

    teamMemberForm.reset();

    teamMemberId.value =
        "";

    teamMemberOldImageUrl
        .value =
        "";

    teamMemberOrder.value =
        "1";

    teamMemberSubmitBtn
        .innerHTML = `
        <i class="fas fa-plus"></i>
        Add Team Member
    `;

    cancelTeamMemberEdit
        .style.display =
        "none";
}


// =====================================
// ADMIN SIDEBAR SECTION SWITCHING
// =====================================

const adminNavLinks =
    document.querySelectorAll(
        ".admin-nav-link"
    );

const adminSections =
    document.querySelectorAll(
        ".admin-section"
    );

adminNavLinks.forEach(
    (link) => {

        link.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                const sectionId =
                    this.getAttribute(
                        "data-section"
                    );

                adminNavLinks
                    .forEach(
                        nav => {

                            nav.classList
                                .remove(
                                    "active"
                                );
                        }
                    );

                adminSections
                    .forEach(
                        section => {

                            section.classList
                                .remove(
                                    "active"
                                );
                        }
                    );

                this.classList
                    .add(
                        "active"
                    );

                const selectedSection =
                    document
                        .getElementById(
                            sectionId
                        );

                if (
                    selectedSection
                ) {

                    selectedSection
                        .classList
                        .add(
                            "active"
                        );
                }
            }
        );
    }
);


// =====================================
// LOGOUT
// =====================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async function () {

            await supabase.auth
                .signOut();

            window.location.href =
                "admin-login.html";
        }
    );
}


// =====================================
// INITIAL LOAD
// =====================================

loadGallery();

loadServices();

loadPricing();

loadSiteSettings();

loadAboutSettings();

loadTeamMembers();