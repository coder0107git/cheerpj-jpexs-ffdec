export async function loadEruda() {
    await new Promise(async (resolve, reject) => {
        try {
            const { default: eruda } = await import("eruda");

            eruda.init();

            resolve(await waitForEruda());
        } catch (e) {
            reject(e);
        }
    });

    fixNetworkTabScroll();
}

function waitForEruda() {
    const { promise, resolve } = Promise.withResolvers();

    function poll() {
        const eruda = document.querySelector("#eruda")?.shadowRoot;
    
        if(eruda instanceof ShadowRoot) {
            return resolve(undefined);
        }
    
        // No Eruda, poll again later
        setTimeout(poll, 100);
    }

    poll();

    return promise;
}

function $(element: Element | Document | ShadowRoot, selector: string) {
    return element.querySelector(selector);
} 

// By default when any new requests are added it dumps you back to the top of 
// the requests. This mostly fixes that.
function fixNetworkTabScroll() {
    const eruda = $(document, "#eruda")!.shadowRoot!;
    const networkTab = $(eruda, "#eruda-network")!;
    
    const requestTable = $(networkTab, "div.luna-data-grid-data-container table")!;
    const scrollContainer = requestTable.parentElement!;
    

    // This is an array mostly to make debugging this easier.
    let scrolledAmount = [requestTable.scrollTop];
    let recentlyForcedScroll = false;

    scrollContainer.addEventListener("scroll", () => {
        const scrollAmount = scrollContainer.scrollTop;
        
        // Discard new scroll value if it has been reset or forced scrolled
        if((scrollAmount >= 1 || scrollAmount <= 0.5) && recentlyForcedScroll !== true) {
            scrolledAmount.push(scrollAmount);
        }

        if(recentlyForcedScroll) {
            recentlyForcedScroll = false;
        }

        // Limit length to 5
        scrolledAmount = scrolledAmount.slice(-5);
    });


    const observer = new MutationObserver(() => {
        // requestTable.scrollIntoView({
        //     behavior: "instant",
        //     block: "end",
        //     // inline: "nearest",
        // });
        scrollContainer.scrollTop = scrolledAmount.at(-1) ?? 0;
        
        // Changing the `scrollTop` only fires the scroll listener if there 
        // is a scroll bar. Check if there is a scroll bar first.
        if(scrollContainer.scrollHeight > scrollContainer.clientHeight) {
            recentlyForcedScroll = true;
        }
    });

    observer.observe($(requestTable, "tbody")!, {
        childList: true,
    });
}
