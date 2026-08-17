import { supabase } from "./supabase-config.js";


// =====================================
// ELEMENTS
// =====================================

const aboutStudioImage =
    document.getElementById(
        "aboutStudioImage"
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

const teamGrid =
    document.getElementById(
        "teamGrid"
    );


// =====================================
// LOAD ABOUT SETTINGS
// =====================================

async function loadAboutSettings() {

    const { data, error } =
        await supabase
            .from("about_settings")
            .select("*")
            .limit(1)
            .maybeSingle();


    if (error) {

        console.error(
            "About settings load error:",
            error
        );

        return;
    }


    if (!data) {

        console.warn(
            "No about settings found."
        );

        return;
    }


    if (
        aboutStudioImage &&
        data.studio_image_url
    ) {

        aboutStudioImage.src =
            data.studio_image_url;
    }


    if (aboutStoryTitle) {

        aboutStoryTitle.textContent =
            data.story_title ||
            "Our Story";
    }


    if (aboutStoryText1) {

        aboutStoryText1.textContent =
            data.story_text_1 || "";
    }


    if (aboutStoryText2) {

        aboutStoryText2.textContent =
            data.story_text_2 || "";
    }
}


// =====================================
// LOAD TEAM MEMBERS
// =====================================

async function loadTeamMembers() {

    if (!teamGrid) {
        return;
    }


    teamGrid.innerHTML =
        "<p>Loading team members...</p>";


    const { data, error } =
        await supabase
            .from("team_members")
            .select("*")
            .order(
                "display_order",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "Team members load error:",
            error
        );


        teamGrid.innerHTML =
            "<p>Unable to load team members.</p>";

        return;
    }


    teamGrid.innerHTML = "";


    if (!data || data.length === 0) {

        teamGrid.innerHTML =
            "<p>No team members available at the moment.</p>";

        return;
    }


    data.forEach((member) => {

        const card =
            document.createElement("div");

        card.className =
            "team-card";


        card.innerHTML = `

            <img
                src="${member.image_url || ""}"
                alt="${member.name}"
                loading="lazy">

            <h3>
                ${member.name}
            </h3>

            <h4 class="team-role">
                ${member.role}
            </h4>

            <p>
                ${member.description}
            </p>

        `;


        teamGrid.appendChild(
            card
        );
    });
}


// =====================================
// INITIAL LOAD
// =====================================

loadAboutSettings();

loadTeamMembers();