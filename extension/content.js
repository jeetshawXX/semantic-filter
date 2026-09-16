console.log("=== Semantic Filter Loaded ===");

window.onerror = function(msg, src, line) {

    console.log(
        "JS ERROR:",
        msg,
        line
    );
};

const analyzedVideos = new Set();

const blockedVideos = new Set();

const pendingVideos = new Set();

function getText(element, selector) {

    if (!element) {
        return null;
    }

    const target =
    element.querySelector(selector);

    if (!target) {
        return null;
    }

    return target.innerText?.trim();
}

function hideElement(element, reason) {

    if (!element) {
        return;
    }

    console.log(
        "Blocked:",
        reason
    );

    element.style.opacity = "0";

    element.style.height = "0px";

    element.style.minHeight = "0px";

    element.style.margin = "0";

    element.style.padding = "0";

    element.style.border = "none";

    element.style.pointerEvents = "none";

    element.style.overflow = "hidden";
}

async function analyzeVideo(videoData, element) {

    console.log(
        "Sending to backend:",
        videoData
    );

    try {

        const response = await fetch(
            "http://localhost:5000/analyze",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                    "application/json"
                },

                body: JSON.stringify(
                    videoData
                )
            }
        );

        const result =
        await response.json();

        pendingVideos.delete(
            videoData.url
        );

        console.log(
            "AI Result:"
        );

        console.log(result);

        if (result.blocked) {

            blockedVideos.add(
                videoData.url
            );

            hideElement(
                element,
                result.matched_tag
            );
        }

    } catch (error) {

        pendingVideos.delete(
            videoData.url
        );

        console.error(
            "Backend Error:",
            error
        );
    }
}

function extractHomepageVideos() {

    const titleLinks =
    document.querySelectorAll(
        `
        a[href*="watch?v="],
        a[href*="/shorts/"]
        `
    );

    console.log(
        "Found videos:",
        titleLinks.length
    );

    titleLinks.forEach(
    async linkElement => {

        try {

            const title =
            linkElement.innerText?.trim();

            if (!title) {
                return;
            }

            const url =
            linkElement.href;

            if (!url) {
                return;
            }

            let videoId = null;

            if (
                url.includes(
                    "watch?v="
                )
            ) {

                videoId =
                new URL(url)
                .searchParams
                .get("v");
            }

            else if (
                url.includes(
                    "/shorts/"
                )
            ) {

                videoId =
                url
                .split("/shorts/")[1]
                ?.split("?")[0];
            }

            const container =
            linkElement.closest(
                `
                ytd-rich-item-renderer,
                ytd-video-renderer,
                ytd-compact-video-renderer,
                ytd-reel-item-renderer,
                ytd-rich-grid-media,
                ytd-rich-section-renderer
                `
            )
            ||
            linkElement.parentElement;

            if (!container) {
                return;
            }

            if (
                blockedVideos.has(url)
            ) {

                hideElement(
                    container,
                    "cached"
                );

                return;
            }

            if (
                analyzedVideos.has(url)
            ) {
                return;
            }

            if (
                pendingVideos.has(url)
            ) {
                return;
            }

            pendingVideos.add(url);

            analyzedVideos.add(url);

            console.log(
                "Analyzing:",
                title
            );

            const channel =
            getText(
                container,
                "#channel-name"
            );

            const data =
            await browser.storage.local.get(
                [
                    "tags",
                    "blockedChannels"
                ]
            );

            const selectedTags =
            data.tags || [];

            const blockedChannels =
            data.blockedChannels || [];

            if (

                channel &&

                blockedChannels.includes(
                    channel.toLowerCase()
                )

            ) {

                hideElement(
                    container,
                    "blocked channel"
                );

                return;
            }

            if (
                selectedTags.length === 0
            ) {
                return;
            }

            const videoData = {

                title,

                channel,

                description: "",

                url,

                videoId,

                thumbnail:
                    container
                    .querySelector("img")
                    ?.src || "",

                selectedTags
            };

            console.log(videoData);

            analyzeVideo(
                videoData,
                container
            );

        } catch (error) {

            console.log(
                "Video Parse Error:",
                error
            );
        }
    });
}

let timeout = null;

const observer =
new MutationObserver(() => {

    clearTimeout(timeout);

    timeout = setTimeout(() => {

        extractHomepageVideos();

    }, 1000);
});

observer.observe(
    document.body,
    {
        childList: true,
        subtree: true
    }
);

extractHomepageVideos();