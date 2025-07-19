// ==UserScript==
// @name         Deboucledcheckboxtempfix
// @namespace    Deboucledcheckboxtempfix
// @version      0.0.1
// @description  Restore le bouton checkbox.
// @author       Atlantis
// @match        *://www.jeuxvideo.com/*
// @grant        GM_addStyle
// @downloadURL  https://github.com/Lantea-Git/Userscripts_Test/raw/main/debouclfix.user.js
// @updateURL    https://github.com/Lantea-Git/Userscripts_Test/raw/main/debouclfix.user.js
// ==/UserScript==


GM_addStyle(`
    .input-on-off {
      visibility: unset !important;
    }
`);
