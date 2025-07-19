// ==UserScript==
// @name         csspatchnotune
// @namespace    csspatchnotune
// @version      0.0.3
// @description  Restore le bouton checkbox.
// @match        *://nocturnex.alwaysdata.net/mosajax/
// @grant        GM_addStyle
// @downloadURL  https://github.com/Lantea-Git/Userscripts_Test/raw/main/fix_cssencarton.user.js
// @updateURL    https://github.com/Lantea-Git/Userscripts_Test/raw/main/fix_cssencarton.user.js
// ==/UserScript==


GM_addStyle(`
    .prev .grille div {
        width: 68px;
        height: 51px;
        display: inline-block;
        box-sizing: border-box;
        margin: 0;
        border: 1px solid black;
    }
`);
