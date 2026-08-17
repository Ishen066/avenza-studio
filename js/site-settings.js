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


    // =====================================
    // CONTACT INFORMATION
    // =====================================

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


    // =====================================
    // MAIN SOCIAL LINKS
    // =====================================

    const siteFacebook =
        document.getElementById(
            "siteFacebook"
        );

    const siteInstagram =
        document.getElementById(
            "siteInstagram"
        );

    const siteTiktok =
        document.getElementById(
            "siteTiktok"
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

    if (siteTiktok) {
        siteTiktok.href =
            data.tiktok_url || "#";
    }


    // =====================================
    // WHATSAPP
    // =====================================

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


    // =====================================
    // FLOATING WHATSAPP
    // =====================================

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


    // =====================================
    // CALL BUTTON
    // =====================================

    const callNowBtn =
        document.getElementById(
            "callNowBtn"
        );

    if (callNowBtn) {

        const telPhone =
            (data.phone || "")
                .replace(/[^\d+]/g, "");

        if (telPhone) {
            callNowBtn.href =
                `tel:${telPhone}`;
        }
    }


    // =====================================
    // EMAIL BUTTON
    // =====================================

    const emailNowBtn =
        document.getElementById(
            "emailNowBtn"
        );

    if (
        emailNowBtn &&
        data.email
    ) {

        emailNowBtn.href =
            `mailto:${data.email}`;
    }


    // =====================================
    // FOOTER INFORMATION
    // =====================================

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


    // =====================================
    // FOOTER SOCIAL LINKS
    // =====================================

    const footerFacebook =
        document.getElementById(
            "footerFacebook"
        );

    const footerInstagram =
        document.getElementById(
            "footerInstagram"
        );

    const footerTiktok =
        document.getElementById(
            "footerTiktok"
        );

    const footerWhatsapp =
        document.getElementById(
            "footerWhatsapp"
        );


    if (footerFacebook) {
        footerFacebook.href =
            data.facebook_url || "#";
    }

    if (footerInstagram) {
        footerInstagram.href =
            data.instagram_url || "#";
    }

    if (footerTiktok) {
        footerTiktok.href =
            data.tiktok_url || "#";
    }

    if (
        footerWhatsapp &&
        whatsappNumber
    ) {

        footerWhatsapp.href =
            `https://wa.me/${whatsappNumber}`;
    }

}

loadSiteSettings();