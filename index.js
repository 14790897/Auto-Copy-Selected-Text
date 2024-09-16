// ==UserScript==
// @name         Auto Copy Selected Text
// @namespace    http://tampermonkey.net/
// @version      1.4
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
            console.log("Text copied to clipboard:", selectedText);
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
          console.log("Text copied to clipboard:", selectedText);
        } catch (err) {
          console.error("Failed to copy text to clipboard", err);
        }
        document.body.removeChild(tempElement);
      }
      selection.removeAllRanges();
      selection.addRange(range);
    }
  });

  // 监听鼠标中键点击事件，粘贴剪贴板内容
  document.addEventListener("mousedown", async (event) => {
    if (event.button === 1) {
      // 中键点击
      event.preventDefault();
      event.stopPropagation();

      try {
        const text = await navigator.clipboard.readText();

        // 获取点击位置的元素
        const targetElement = document.elementFromPoint(
          event.clientX,
          event.clientY
        );
        if (targetElement && isEditable(targetElement)) {
          // 设置焦点并模拟正常输入
          forceFocus(targetElement);
          pasteIntoInput(targetElement, text);
        } else {
          // 如果不是输入框，则尝试插入到其他可编辑区域
          document.execCommand("insertText", false, text);
        }
      } catch (err) {
        console.error("Failed to read clipboard contents: ", err);
      }
    }
  });

  // 检查元素是否可编辑
  function isEditable(element) {
    return (
      element.tagName === "INPUT" ||
      element.tagName === "TEXTAREA" ||
      element.isContentEditable
    );
  }

  // 尝试强制获得焦点
  function forceFocus(element) {
    try {
      element.focus(); // 尝试直接聚焦
      // 如果还没有焦点，再尝试更强制的方式
      if (document.activeElement !== element) {
        const focusEvent = new FocusEvent("focus", {
          bubbles: true,
          cancelable: true,
        });
        element.dispatchEvent(focusEvent);
      }
    } catch (e) {
      console.error("Failed to focus on element: ", e);
    }
  }

  // 模拟正常输入
  function pasteIntoInput(element, text) {
    // 如果支持 `execCommand`
    if (document.execCommand) {
      element.focus();
      document.execCommand("insertText", false, text);
    } else {
      // 如果不支持 `execCommand`，直接使用事件
      const inputEvent = new InputEvent("input", {
        bubbles: true,
        cancelable: true,
        data: text,
        inputType: "insertText",
      });
      element.dispatchEvent(inputEvent);
    }
  }
})();
