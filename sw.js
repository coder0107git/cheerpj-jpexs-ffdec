import { Wayne, FileSystem } from "https://esm.sh/@jcubic/wayne@0.18.3";
import mime from "https://esm.sh/mime@4.0.4";
import path from "https://esm.sh/path-browserify@1.0.1";
import { configure, fs, resolveMountConfig, InMemory } from "https://esm.sh/@zenfs/core@1.0.10";
import { Zip } from "https://esm.sh/@zenfs/zip@0.5.1";

self.addEventListener("install", () => {
    // Automatically start service worker
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(async () => {
        // Delete old caches
        const date = new Date().toDateString();

        const keyList = await caches.keys();
        const cachesToDelete = keyList.filter((key) => key !== date);

        await Promise.all(cachesToDelete.map(async (key) => {
            await caches.delete(key);
        })).catch(err => console.error(err));
    });
});

const app = new Wayne();
const getCache = () => caches.open(new Date().toDateString());

const fsConfigured = configure({
    mounts: {
        "/tmp": InMemory,
    },
}).then(() => {
    fs.mkdirSync("/mnt");
    app.use((req, res, next) => {
        const url = new URL(req.url);
        const extension = path.extname(url.pathname);
        const fileName = path.basename(url.pathname);

        if (url.origin === location.origin) {
            const range = req.headers.get("Range");
            const contentRange = req.headers.get("Content-Range");

            if(url.pathname.startsWith("/__fs__/") !== true || !range) {
                next();
                return;
            }
            console.log(url.pathname, range, contentRange);

            
            const path = url.pathname.split("/__fs__")[1];
            const [start, end, ...all] = range.split("=")[1].split("-");
            console.log(path, [start, end, ...all]);

            const { size } = fs.statSync(path, { bigint: false });
            const stream = fs.createReadStream(path, { start, end });

            res.send(stream, {
                status: 206,
                statusText: "Partial Content",
                type: mime.getType(extension),
                headers: new Headers({
                    "Accept-Ranges": "bytes",
                    "Content-Disposition": `inline; filename="${fileName}"`,
                    "Content-Length": end - start + 1,
                    "Content-Range": `bytes ${start}-${end}/${size}`,
                    "Date": new Date().toUTCString(),
                }),
            });

            //next();
        } else {
            //res.fetch(req);
            next();
        }
        
        // const extension = path.extname(url.pathname);
        // const accept = req.headers.get("Range");
    
        // console.log(url, extension, accept, [...req.headers.entries()]);
    
        // // if (extension === '.js' && accept.match(/text\/html/)) {
        // //     res.text('// Sorry no source code for you');
        // // } else {
        // //     res.fetch(req);
        // // }
    
        // return next();
    });
    app.use(
        FileSystem({ 
            path, 
            fs: fs.promises, 
            mime, 
            prefix: "__fs__",
        })
    );
})


app.post("/loadFs", async (req, res) => {
    const { slug, url } = await req.json();

    const mountedFile = await fs.promises
        .access(`/mnt/${slug}/ffdec.sh`, fs.constants.R_OK)
        .then(() => true)
        .catch(() => false);
    if (!mountedFile) {
        await fsConfigured;


        const cache = await getCache();
        const cacheResponse = await cache.match(url);
        let zipFile = cacheResponse;

        // If not in cache, cache it. If not online, tough luck.
        if (!cacheResponse && navigator.onLine) {
            zipFile = await fetch("https://api.codetabs.com/v1/proxy?quest=" + encodeURIComponent(url));

            cache.put(url, zipFile.clone());
        }


        const zipFs = await resolveMountConfig(
            { backend: Zip, data: await zipFile.arrayBuffer() }
        );
        fs.mount(`/mnt/${slug}`, zipFs);
    }

    return res.text(`__fs__/mnt/${slug}/`);
});


app.get("/tankz2.swf", async (req, res) => {
    const cache = await caches.open("example-swf");
    const cacheResponse = await cache.match("tankz2.swf");
    let exampleSwf = cacheResponse;

    // If not in cache, cache it. If not online, tough luck.
    if (!cacheResponse && navigator.onLine) {
        exampleSwf = await fetch(
            // CORS Proxy
            "https://api.codetabs.com/v1/proxy?quest=" + encodeURIComponent(
                "http://web.archive.org/web/20200730061016oe_/https://media.scouting.org/boyslife/onlinegames/tankz2/tankz2.swf"
            )
        );

        cache.put("tankz2.swf", exampleSwf.clone());
    }

    res.respond(exampleSwf);
});

// const res = await fetch(
//     "https://api.codetabs.com/v1/proxy?quest=" + encodeURIComponent(
//         "https://github.com/jindrapetrik/jpexs-decompiler/releases/download/nightly2955/ffdec_21.1.1_nightly2955.zip"
//     )
// );

// await configure({
//     mounts: {
//         "/mnt/zip": { backend: Zip, data: await res.arrayBuffer() },
//     },
// });

// app.use(FileSystem({ path, fs: fs.promises, mime, prefix: "__fs__" }));
