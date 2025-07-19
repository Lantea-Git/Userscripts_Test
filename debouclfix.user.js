// ==UserScript==
// @name         Deboucledcheckboxtempfix
// @namespace    Deboucledcheckboxtempfix
// @version      0.0.1
// @description  Restore le bouton checkbox.
// @author       Atlantis
// @match        *://www.jeuxvideo.com/*
// @grant        GM_addStyle
// ==/UserScript==


GM_addStyle(`
    .input-on-off {
      visibility: unset !important;
    }
`);
