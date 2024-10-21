if ("serviceWorker" in navigator) {
    const scope = location.pathname.replace(/\/[^\/]+$/, "/");

    navigator
        .serviceWorker
        .register("/sw.js", { scope, type: "module" })
        .then((reg) => {
            reg.addEventListener("updatefound", () => {
                const installingWorker = reg.installing;

                installingWorker.addEventListener("statechange", (e) => {
                    const { state } = e.target;

                    if(state === "installed") location.reload();
                });

                console.info("[SW Loader] A new service worker is being installed:", installingWorker);
            });

            // registration worked
            console.info("[SW Loader] Registration succeeded. Scope is " + reg.scope);
        }).catch((error) => {
            // registration failed
            console.error("[SW Loader] Registration failed with " + error);
        });

        populateVersionPicker();
}

async function populateVersionPicker() {
    const releases = await fetch("https://api.github.com/repos/jindrapetrik/jpexs-decompiler/releases?per_page=15")
        .then(res => res.json());
    const versionInfo = releases.map(release => {
            const { name, tag_name } = release;
            const downloadUrl = release.assets
                .filter(asset => /(?<!(lib|mac).*)\.zip/.test(asset.name))
                .map(asset => asset.browser_download_url)
                .at(0);
        
            return [name, {
                url: downloadUrl,
                slug: tag_name,
            }];
        });
    window.versionInfoMap = new Map(versionInfo);


    const versionSelect = document.querySelector("select");

    versionSelect.append(...versionInfo.map(release => {
        const [name] = release;
        const elem = document.createElement("option");

        elem.innerText = name;

        return elem;
    }));
}
