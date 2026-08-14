import { supabase } from "./supabase-config.js";

const servicesGrid =
    document.getElementById("servicesGrid");


// =====================================
// LOAD SERVICES FROM SUPABASE
// =====================================

async function loadServices() {

    servicesGrid.innerHTML =
        "<p>Loading services...</p>";

    const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("created_at", {
            ascending: true
        });

    if (error) {

        console.error(
            "Services load error:",
            error
        );

        servicesGrid.innerHTML =
            "<p>Unable to load services.</p>";

        return;
    }


    servicesGrid.innerHTML = "";


    if (!data || data.length === 0) {

        servicesGrid.innerHTML =
            "<p>No services available at the moment.</p>";

        return;
    }


    data.forEach((service) => {

        const serviceCard =
            document.createElement("div");

        serviceCard.className =
            "service-card";


        serviceCard.innerHTML = `

            <i class="${service.icon}"></i>

            <h3>
                ${service.name}
            </h3>

            <p>
                ${service.description}
            </p>

        `;


        servicesGrid.appendChild(
            serviceCard
        );

    });

}


// =====================================
// INITIAL LOAD
// =====================================

loadServices();