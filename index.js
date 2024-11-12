// ==UserScript==
// @name         Auto Copy Selected Text
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Automatically copy selected text to clipboard and keep the selection
// @author       liuweiqing
// @match        *://*/*
// @grant        none
// @license      MIT
// @icon         https://icons.iconarchive.com/icons/gartoon-team/gartoon-places/256/user-desktop-icon.png
// ==/UserScript==

(function () {
  ("use strict");

  // 监听鼠标松开的事件
  document.addEventListener("mouseup", () => {
    const selection = window.getSelection();
    const selectedText = selection.toString();

    if (selectedText) {
      const range = selection.getRangeAt(0);
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(selectedText)
          .then(() => {
            console.log(
              "Text copied to clipboard in navigator clipboard:",
              selectedText
            );
          })
          .catch((err) => {
            console.error("Failed to copy text to clipboard", err);
          });
      } else {
        const tempElement = document.createElement("textarea");
        tempElement.value = selectedText;
        document.body.appendChild(tempElement);
        tempElement.select();
        try {
          document.execCommand("copy");
          console.log("Text copied to clipboard in execCommand:", selectedText);
          selection.addRange(range);
        } catch (err) {
          console.error("Failed to copy text to clipboard", err);
        }
        document.body.removeChild(tempElement);
      }
    }
  });
})();
