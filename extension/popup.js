const tagInput =
document.getElementById(
    "tagInput"
);

const addBtn =
document.getElementById(
    "addBtn"
);

const tagList =
document.getElementById(
    "tagList"
);

const channelInput =
document.getElementById(
    "channelInput"
);

const addChannelBtn =
document.getElementById(
    "addChannelBtn"
);

const channelList =
document.getElementById(
    "channelList"
);

const keywordInput =
document.getElementById(
    "keywordInput"
);

const addKeywordBtn =
document.getElementById(
    "addKeywordBtn"
);

const keywordList =
document.getElementById(
    "keywordList"
);

function renderTags(tags) {

    tagList.innerHTML = "";

    tags.forEach(tag => {

        const div =
        document.createElement("div");

        div.className = "tag";

        div.innerHTML = `
            <span>${tag}</span>
            <span class="remove">X</span>
        `;

        div.querySelector(".remove")
        .onclick = async () => {

            const updated =
            tags.filter(
                t => t !== tag
            );

            await browser.storage.local.set({
                tags: updated
            });

            renderTags(updated);
        };

        tagList.appendChild(div);
    });
}

function renderChannels(channels) {

    channelList.innerHTML = "";

    channels.forEach(channel => {

        const div =
        document.createElement("div");

        div.className = "channel";

        div.innerHTML = `
            <span>${channel}</span>
            <span class="remove">X</span>
        `;

        div.querySelector(".remove")
        .onclick = async () => {

            const updated =
            channels.filter(
                c => c !== channel
            );

            await browser.storage.local.set({
                blockedChannels:
                updated
            });

            renderChannels(updated);
        };

        channelList.appendChild(div);
    });
}

function renderKeywords(keywords) {

    keywordList.innerHTML = "";

    keywords.forEach(keyword => {

        const div =
        document.createElement("div");

        div.className = "keyword";

        div.innerHTML = `
            <span>${keyword}</span>
            <span class="remove">X</span>
        `;

        div.querySelector(".remove")
        .onclick = async () => {

            const updated =
            keywords.filter(
                k => k !== keyword
            );

            await browser.storage.local.set({
                blockedKeywords:
                updated
            });

            renderKeywords(updated);
        };

        keywordList.appendChild(div);
    });
}

async function loadData() {

    const data =
    await browser.storage.local.get([
        "tags",
        "blockedChannels",
        "blockedKeywords"
    ]);

    renderTags(
        data.tags || []
    );

    renderChannels(
        data.blockedChannels || []
    );

    renderKeywords(
        data.blockedKeywords || []
    );
}

addBtn.onclick = async () => {

    const tag =
    tagInput.value
    .trim()
    .toLowerCase();

    if (!tag) {
        return;
    }

    const data =
    await browser.storage.local.get(
        "tags"
    );

    const tags =
    data.tags || [];

    if (!tags.includes(tag)) {

        tags.push(tag);

        await browser.storage.local.set({
            tags
        });
    }

    tagInput.value = "";

    renderTags(tags);
};

addChannelBtn.onclick = async () => {

    const channel =
    channelInput.value
    .trim()
    .toLowerCase();

    if (!channel) {
        return;
    }

    const data =
    await browser.storage.local.get(
        "blockedChannels"
    );

    const channels =
    data.blockedChannels || [];

    if (
        !channels.includes(channel)
    ) {

        channels.push(channel);

        await browser.storage.local.set({

            blockedChannels:
            channels
        });
    }

    channelInput.value = "";

    renderChannels(channels);
};

addKeywordBtn.onclick = async () => {

    const keyword =
    keywordInput.value
    .trim()
    .toLowerCase();

    if (!keyword) {
        return;
    }

    const data =
    await browser.storage.local.get(
        "blockedKeywords"
    );

    const keywords =
    data.blockedKeywords || [];

    if (
        !keywords.includes(keyword)
    ) {

        keywords.push(keyword);

        await browser.storage.local.set({

            blockedKeywords:
            keywords
        });
    }

    keywordInput.value = "";

    renderKeywords(keywords);
};

loadData();