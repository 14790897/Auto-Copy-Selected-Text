// ==UserScript==
// @name         Auto Copy Selected Text
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Automatically copy selected text to clipboard and keep the selection
// @author       liuweiqing
// @match        *://*/*
// @grant        none
// @license     MIT
// ==/UserScript==

(function () {
  "use strict";

  // 监听鼠标松开的事件
  document.addEventListener("mouseup", () => {
    // 获取用户选择的文本
    const selection = window.getSelection();
    const selectedText = selection.toString();

    // 如果有选中的文本
    if (selectedText) {
      // 保存当前的文本范围
      const range = selection.getRangeAt(0);
      // 检查浏览器是否支持 Clipboard API
      if (navigator.clipboard) {
        // 使用 Clipboard API 复制文本
        navigator.clipboard
          .writeText(selectedText)
          .then(() => {
            console.log("Text copied to clipboard:", selectedText);
          })
          .catch((err) => {
            console.error("Failed to copy text to clipboard", err);
          });
      } else {
        // 创建一个临时元素
        const tempElement = document.createElement("textarea");
        tempElement.value = selectedText;
        document.body.appendChild(tempElement);
        tempElement.select();
        try {
          // 执行复制命令
          document.execCommand("copy");
          console.log("Text copied to clipboard:", selectedText);
        } catch (err) {
          console.error("Failed to copy text to clipboard", err);
        }

        // 移除临时元素
        document.body.removeChild(tempElement);
      }

      // 清除当前的选区
      selection.removeAllRanges();
      // 重新设置原来的选区
      selection.addRange(range);
    }
  });
})();
