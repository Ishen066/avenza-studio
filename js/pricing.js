import { supabase } from "./supabase-config.js";

const pricingGrid =
    document.getElementById("pricingGrid");

async function loadPricing() {

    pricingGrid.innerHTML =
        "<p>Loading packages...</p>";

    const { data, error } = await supabase
        .from("pricing")
        .select("*")
        .order("created_at", {
            ascending: true
        });

    if (error) {

        console.error(
            "Pricing load error:",
            error
        );

        pricingGrid.innerHTML =
            "<p>Unable to load pricing packages.</p>";

        return;
    }

    pricingGrid.innerHTML = "";

    data.forEach((item) => {

        const card =
            document.createElement("div");

        card.className =
            item.is_popular
                ? "price-card popular"
                : "price-card";

        const features =
            item.features
                ? item.features.split("|")
                : [];

        card.innerHTML = `

            ${
                item.is_popular
                    ? `
                        <span class="popular-badge">
                            Most Popular
                        </span>
                    `
                    : ""
            }

            <div class="price-icon">
                <i class="fas fa-camera"></i>
            </div>

            <h2>
                ${item.name}
            </h2>

            <p class="package-subtitle">
                ${item.description}
            </p>

            <h3>
                ${item.price}
            </h3>

            <ul>

                ${features
                    .map(
                        (feature) => `
                            <li>
                                <i class="fas fa-check"></i>

                                ${feature.trim()}
                            </li>
                        `
                    )
                    .join("")}

            </ul>

            <a
                href="contact.html"
                class="btn">

                Contact Us

            </a>
        `;

        pricingGrid.appendChild(card);
    });
}

loadPricing();