import { supabase } from "./supabase-config.js";

async function loadSiteSettings() {

    const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

    if (error) {

        console.error(
            "Site settings load error:",
            error
        );

        return;
    }

    if (!data) {
        return;
    }


    // Contact information

    const sitePhone =
        document.getElementById("sitePhone");

    const siteEmail =
        document.getElementById("siteEmail");

    const siteAddress =
        document.getElementById("siteAddress");

    const siteOpeningHours =
        document.getElementById(
            "siteOpeningHours"
        );


    if (sitePhone) {
        sitePhone.textContent =
            data.phone || "";
    }

    if (siteEmail) {
        siteEmail.textContent =
            data.email || "";
    }

    if (siteAddress) {
        siteAddress.textContent =
            data.address || "";
    }

    if (siteOpeningHours) {
        siteOpeningHours.textContent =
            data.opening_hours || "";
    }


    // Social links

    const siteFacebook =
        document.getElementById(
            "siteFacebook"
        );

    const siteInstagram =
        document.getElementById(
            "siteInstagram"
        );

    const siteYoutube =
        document.getElementById(
            "siteYoutube"
        );

    const siteWhatsapp =
        document.getElementById(
            "siteWhatsapp"
        );


    if (siteFacebook) {
        siteFacebook.href =
            data.facebook_url || "#";
    }

    if (siteInstagram) {
        siteInstagram.href =
            data.instagram_url || "#";
    }

    if (siteYoutube) {
        siteYoutube.href =
            data.youtube_url || "#";
    }


    const whatsappNumber =
        (data.whatsapp_number || "")
        .replace(/\D/g, "");


    if (
        siteWhatsapp &&
        whatsappNumber
    ) {

        siteWhatsapp.href =
            `https://wa.me/${whatsappNumber}`;

    }


    // Floating WhatsApp

    const floatingWhatsapp =
        document.getElementById(
            "floatingWhatsapp"
        );


    if (
        floatingWhatsapp &&
        whatsappNumber
    ) {

        floatingWhatsapp.href =
            `https://wa.me/${whatsappNumber}`;

    }


    // Footer

    const footerEmail =
        document.getElementById(
            "footerEmail"
        );

    const footerPhone =
        document.getElementById(
            "footerPhone"
        );


    if (footerEmail) {
        footerEmail.textContent =
            data.email || "";
    }

    if (footerPhone) {
        footerPhone.textContent =
            data.phone || "";
    }

}

loadSiteSettings();