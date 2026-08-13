import { supabase } from "./supabase-config.js";

const servicesGrid = document.getElementById("servicesGrid");

async function loadServices() {

    const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("created_at", {
            ascending: true
        });

    if (error) {
        console.error("Services load error:", error);
        return;
    }

    servicesGrid.innerHTML = "";

    data.forEach((service) => {

        const serviceCard = document.createElement("div");

        serviceCard.className = "service-card";

        serviceCard.innerHTML = `
            <i class="${service.icon}"></i>

            <h3>${service.name}</h3>

            <p>${service.description}</p>
        `;

        servicesGrid.appendChild(serviceCard);

    });

}

loadServices();