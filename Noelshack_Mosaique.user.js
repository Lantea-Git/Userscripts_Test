// ==UserScript==
// @name         Noelshack_Mosaique
// @namespace    Noelshack_Mosaique
// @version      2.8
// @description  Découpe une image et envoie chaque bloc sur Noelshack.
// @author       Atlantis
// @icon         https://image.jeuxvideo.com/smileys_img/26.gif
// @license      CC0-1.0
// match        *://www.jeuxvideo.com/forums/*
// @match        *://nocturnex.alwaysdata.net/mosajax/
// @downloadURL  https://github.com/Lantea-Git/Userscripts_Test/raw/main/Noelshack_Mosaique.user.js
// @updateURL    https://github.com/Lantea-Git/Userscripts_Test/raw/main/Noelshack_Mosaique.user.js
// @grant        GM_xmlhttpRequest
// @connect      www.noelshack.com
// ==/UserScript==

(function () {
    const LOGICAL_BLOCK_WIDTH = 136;
    const LOGICAL_BLOCK_HEIGHT = 102;
    const BLOCK_WIDTH = LOGICAL_BLOCK_WIDTH * 2;
    const BLOCK_HEIGHT = LOGICAL_BLOCK_HEIGHT * 2;

    // UI flottante
    const ui = document.createElement('div');
    Object.assign(ui.style, {
        color: '#212121',
        position: 'fixed',
        bottom: '30px',
        left: '30px',
        width: '420px',
        background: '#fff',
        border: '1px solid #ccc',
        borderRadius: '6px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
        fontFamily: 'monospace',
        fontSize: '13px',
        padding: '10px',
        zIndex: 10000,
        whiteSpace: 'pre-wrap',
        overflowY: 'auto',
        maxHeight: '50vh',
        display: 'none'
    });


    const title = document.createElement('div');
    title.textContent = '📤 Envoi en cours...';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '6px';

    const output = document.createElement('div');
    output.style.fontSize = '12px';
    output.style.marginBottom = '8px';

    const copyBtn = document.createElement('button');
    copyBtn.textContent = '📋 Copier';
    Object.assign(copyBtn.style, {
        padding: '6px 10px',
        border: 'none',
        background: '#4caf50',
        color: 'white',
        borderRadius: '4px',
        cursor: 'pointer'
    });

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '❌ Fermer';
    Object.assign(closeBtn.style, {
        padding: '6px 10px',
        border: 'none',
        background: '#f44336',
        color: 'white',
        borderRadius: '4px',
        cursor: 'pointer',
        marginLeft: '8px'
    });
    
    closeBtn.onclick = () => {
        ui.style.display = 'none';
    };

    copyBtn.onclick = () => {
        const text = output.textContent.trim();
        navigator.clipboard.writeText(text).then(() => {
            copyBtn.textContent = '✅ Copié !';
            setTimeout(() => copyBtn.textContent = '📋 Copier', 1500);
        });
    };

    ui.appendChild(title);
    ui.appendChild(copyBtn); // bouton au-dessus
    ui.appendChild(closeBtn);
    ui.appendChild(output);  // affichage en dessous
    document.body.appendChild(ui);

    // Bouton principal
    const btn = document.createElement('button');
    btn.textContent = '📤 Fix Upload Mosaïc';
    btn.classList.add('btn', 'btn-primary');
    Object.assign(btn.style, {
        color: 'white',
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        zIndex: 9999,
    });
    document.body.appendChild(btn);

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    document.body.appendChild(input);

    btn.onclick = () => input.click();
    const sessionId = Math.random().toString(36).slice(2, 10);
    input.onchange = () => {
        const file = input.files[0];
        if (!file) return;
        btn.textContent = '🔁 Réactualiser';
        btn.onclick = () => location.reload();


        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = async function () {
                // Calcul intelligent des colonnes/lignes
                const autoCols = Math.min(8, Math.max(1, Math.ceil(img.width / LOGICAL_BLOCK_WIDTH)));
                const autoRows = Math.min(10, Math.max(1, Math.ceil(img.height / LOGICAL_BLOCK_HEIGHT)));

                const cols = Math.min(8, Math.max(1,
                    parseInt(prompt(`Largeur (max 8), (recommandée ${autoCols})`, autoCols)) || 1
                ));
                const rows = Math.min(10, Math.max(1,
                    parseInt(prompt(`Hauteur (max 10), (recommandée ${autoRows})`, autoRows)) || 1
                ));


                const totalW = BLOCK_WIDTH * cols;
                const totalH = BLOCK_HEIGHT * rows;

                const resizedCanvas = document.createElement('canvas');
                resizedCanvas.width = totalW;
                resizedCanvas.height = totalH;
                const ctx = resizedCanvas.getContext('2d');
                ctx.drawImage(img, 0, 0, totalW, totalH);

                const allUrls = [];

                ui.style.display = 'block';
                title.textContent = '📤 Envoi en cours...';
                output.textContent = '';
                copyBtn.style.display = 'none';

                const mosaicId = Math.random().toString(36).slice(2, 8);
                for (let y = 0; y < rows; y++) {
                    const rowUrls = [];
                    for (let x = 0; x < cols; x++) {
                        const blockCanvas = document.createElement('canvas');
                        blockCanvas.width = BLOCK_WIDTH;
                        blockCanvas.height = BLOCK_HEIGHT;
                        const bctx = blockCanvas.getContext('2d');

                        bctx.drawImage(
                            resizedCanvas,
                            x * BLOCK_WIDTH, y * BLOCK_HEIGHT,
                            BLOCK_WIDTH, BLOCK_HEIGHT,
                            0, 0, BLOCK_WIDTH, BLOCK_HEIGHT
                        );

                        const blob = await new Promise(res => blockCanvas.toBlob(res, 'image/png'));
                        const index = y * cols + x + 1;
                        const filename = `${String(index).padStart(2, '0')}-${mosaicId}.png`;

                        const url = await retryUpload(blob, filename);
                        rowUrls.push(url);

                        title.textContent = `⟳ Envoi bloc vers NoelShach : [Ligne : ${y + 1}, Colone : ${x + 1}]`;
                    }

                    allUrls.push(rowUrls.join(' '));
                }

                output.textContent = allUrls.join('\n');
                title.textContent = '📋 Résultat Noëlshack :';
                copyBtn.style.display = 'inline-block';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    function retryUpload(blob, filename, maxRetries = 10, delay = 3000) {
        return new Promise((resolve) => {
            let attempt = 1;

            const tryUpload = () => {
                console.log(`📡Tentative #${attempt} pour "${filename}"`);
                //const boundary = '----WebKitFormBoundary' + Math.random().toString(16).slice(2);
                const boundary = `----WebKitFormBoundary_${sessionId}_${Math.random().toString(16).slice(2)}`;
                const head = `--${boundary}\r\nContent-Disposition: form-data; name="fichier[]"; filename="${filename}"\r\nContent-Type: ${blob.type}\r\n\r\n`;
                const tail = `\r\n--${boundary}--\r\n`;
                const body = new Blob([head, blob, tail]);

                GM_xmlhttpRequest({
                    method: 'POST',
                    url: `https://www.noelshack.com/envoi.json`,
                    data: body,
                    headers: {
                        'Content-Type': `multipart/form-data; boundary=${boundary}`
                    },
                    //binary: true, //pas compatible avec violentmonkey
                    overrideMimeType: 'application/octet-stream',
                    responseType: 'text',
                    onload: function (res) {
                        try {
                            const data = JSON.parse(res.responseText);
                            if (res.status === 200 && data?.url) {
                                resolve(data.url);
                            } else if (res.status !== 200 && attempt < maxRetries) {
                                attempt++;
                                setTimeout(tryUpload, delay);
                            } else {
                                console.warn(`❌ ${filename} → HTTP ${res.status}`);
                                resolve(`[ECHEC]-${filename}`);
                            }
                        } catch (e) {
                            if (attempt < maxRetries) {
                                attempt++;
                                setTimeout(tryUpload, delay);
                            } else {
                                console.warn(`❌ ${filename} → Erreur JSON`);
                                resolve(`[ECHEC]-${filename}`);
                            }
                        }
                    },
                    onerror: () => {
                        if (attempt < maxRetries) {
                            attempt++;
                            setTimeout(tryUpload, delay);
                        } else {
                            console.warn(`❌ ${filename} → Erreur réseau`);
                            resolve(`[ECHEC]-${filename}`);
                            output.innerHTML = `❌ ${filename} → Transfert impossible<br> <u><b>Fermer => réouvrir le navigateur pour corriger le soucis.</b></u>`;
                            btn.textContent = '❌ Redémarrer le navigateur';
                            btn.onclick = () => {
                                alert("Veuillez fermer complètement votre navigateur (pas juste l'onglet) puis le rouvrir pour corriger le problème.");
                            };
                        }
                    }
                });
            };

            tryUpload();
        });
    }
})();
