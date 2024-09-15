// ==UserScript==
// @name        自动复制选中文本和解除复制限制
// @name:zh     自动复制选中文本和解除复制限制
// @name:en     Auto-Copy Selected Text and Remove Website Copy Restrictions
// @namespace   http://tampermonkey.net/
// @version     3.0
// @description 在任意网站选中任意文本时自动复制,并提供设置选项以启用/禁用解除网站的复制限制和自动复制功能,以及显示/隐藏按钮
// @description:en Automatically copy selected text on any website and provide settings to enable/disable unlocking copy restrictions, auto-copy functionality, and show/hide button
// @author      lbihhe
// @license     MIT
// @icon        https://img.icons8.com/nolan/64/password1.png
// @match       *://*/*
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_registerMenuCommand
// @grant       GM_xmlhttpRequest
// @run-at      document-end
// ==/UserScript==

(function () {
  "use strict";

  let path = "";
  const TEXT_PLAIN = "text/plain";
  const TEXT_HTML = "text/html";
  const COPY = "copy";

  // 定义处理doc88.com的对象
  const website_rule_doc88 = {
    regexp: /.*doc88\.com\/.+/,
    init: () => {
      const style = document.createElement("style");
      style.id = "copy-element-hide";
      style.innerHTML = "#left-menu{display: none !important;}";
      document.head.appendChild(style);

      GM_xmlhttpRequest({
        method: "GET",
        url: "https://res3.doc88.com/resources/js/modules/main-v2.min.js?v=2.56",
        onload: function (response) {
          const result = /\("#cp_textarea"\).val\(([\S]*?)\);/.exec(
            response.responseText
          );
          if (result) {
            path = result[1];
          }
        },
      });

      window.addEventListener("load", () => {
        const cpFn = unsafeWindow.copyText.toString();
        const fnResult = /<textarea[\s\S]*?>'\+([\S]*?)\+"<\/textarea>/.exec(
          cpFn
        );
        if (fnResult) {
          path = fnResult[1];
        }
      });
    },
    getSelectedText: () => {
      let select = unsafeWindow;
      path.split(".").forEach((v) => {
        select = select[v];
      });
      if (!select) {
        unsafeWindow.Config.vip = 1;
        unsafeWindow.Config.logined = 1;
        document.getElementById("copy-element-hide").remove();
      }
      return select;
    },
  };

  // 判断当前页面是否为doc88.com
  if (website_rule_doc88.regexp.test(window.location.href)) {
    website_rule_doc88.init();
  }

  // 语言检测
  var userLanguage = navigator.language || navigator.userLanguage;
  var isChinese = userLanguage.startsWith("zh");

  // 文本定义
  var text = {
    enableCopy: isChinese
      ? "🔓解除复制限制并启用自动复制"
      : "🔓Enable Copy Restrictions and Auto Copy",
    disableCopy: isChinese
      ? "🔒禁用复制功能及复制限制"
      : "🔒Disable Copy Restrictions and Auto Copy",
    copyTextAlert: isChinese
      ? "选中文本已复制到剪贴板"
      : "Selected text copied to clipboard",
    copyHTMLAlert: isChinese
      ? "选中的 HTML 已复制到剪贴板"
      : "Selected HTML copied to clipboard",
    copyFailureAlert: isChinese ? "复制失败" : "Copy failed",
    copyExceptionAlert: isChinese
      ? "复制过程中出现异常: "
      : "Exception during copy: ",
    invalidCopyFormatAlert: isChinese
      ? "无效的复制格式，保留当前设置。"
      : "Invalid copy format, retaining current settings.",
    copyFormatPrompt: isChinese
      ? "请选择复制格式（text: 纯文本, html: HTML, link: 链接和文本）:"
      : "Please select copy format (text: Plain text, html: HTML, link: Link and text):",
  };

  // 读取存储的设置
  var copyState = {
    enabled: GM_getValue("enabled", false),
    showButton: GM_getValue("showButton", true),
    copyFormat: GM_getValue("copyFormat", "text"),
    showAlert: GM_getValue("showAlert", true),
  };

  // 创建按钮
  var button = createButton();
  copyState.button = button;

  // 停止事件传播的处理函数
  function stopPropagation(e) {
    e.stopPropagation();
  }

  // 自动复制选中文本的处理函数
  function autoCopyHandler() {
    var selectedText;
    if (website_rule_doc88.regexp.test(window.location.href)) {
      selectedText = website_rule_doc88.getSelectedText();
    } else {
      selectedText = window.getSelection().toString().trim();
    }

    if (selectedText) {
      if (copyState.copyFormat === "text") {
        copyTextToClipboard(selectedText);
      } else if (copyState.copyFormat === "html") {
        copyHTMLToClipboard(selectedText);
      } else if (copyState.copyFormat === "link") {
        var url = window.location.href;
        copyTextToClipboard(`${selectedText}\n${url}`);
      }
    }
  }

  // 将文本复制到剪贴板
  function copyTextToClipboard(text) {
    var tempTextarea = document.createElement("textarea");
    tempTextarea.style.position = "fixed";
    tempTextarea.style.top = "0";
    tempTextarea.style.left = "0";
    tempTextarea.style.width = "2em";
    tempTextarea.style.height = "2em";
    tempTextarea.style.padding = "0";
    tempTextarea.style.border = "none";
    tempTextarea.style.outline = "none";
    tempTextarea.style.boxShadow = "none";
    tempTextarea.style.background = "transparent";
    tempTextarea.value = text;
    document.body.appendChild(tempTextarea);
    tempTextarea.select();
    try {
      var successful = document.execCommand("copy");
      if (successful) {
        showAlert(text.copyTextAlert);
      } else {
        showAlert(text.copyFailureAlert);
      }
    } catch (err) {
      showAlert(text.copyExceptionAlert + err);
    }
    document.body.removeChild(tempTextarea);
  }

  // 将 HTML 复制到剪贴板
  function copyHTMLToClipboard(html) {
    var tempDiv = document.createElement("div");
    tempDiv.style.position = "fixed";
    tempDiv.style.top = "0";
    tempDiv.style.left = "0";
    tempDiv.style.width = "2em";
    tempDiv.style.height = "2em";
    tempDiv.style.padding = "0";
    tempDiv.style.border = "none";
    tempDiv.style.outline = "none";
    tempDiv.style.boxShadow = "none";
    tempDiv.style.background = "transparent";
    tempDiv.innerHTML = html;
    document.body.appendChild(tempDiv);
    var range = document.createRange();
    range.selectNodeContents(tempDiv);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    try {
      var successful = document.execCommand("copy");
      if (successful) {
        showAlert(text.copyHTMLAlert);
      } else {
        showAlert(text.copyFailureAlert);
      }
    } catch (err) {
      showAlert(text.copyExceptionAlert + err);
    }
    document.body.removeChild(tempDiv);
  }

  // 显示提示信息
  function showAlert(message) {
    if (copyState.showAlert) {
      var alertBox = document.createElement("div");
      alertBox.innerText = message;
      alertBox.style.position = "fixed";
      alertBox.style.bottom = "70px";
      alertBox.style.right = "20px";
      alertBox.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
      alertBox.style.color = "#fff";
      alertBox.style.padding = "10px 15px";
      alertBox.style.borderRadius = "10px";
      alertBox.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
      alertBox.style.fontFamily = "微软雅黑, Arial, sans-serif";
      alertBox.style.fontSize = "14px";
      alertBox.style.zIndex = "9999";
      document.body.appendChild(alertBox);
      setTimeout(function () {
        document.body.removeChild(alertBox);
      }, 3000);
    }
  }

  // 解除复制限制的函数
  function enableCopy() {
    // 移除常见的禁止复制的事件监听器
    [
      "copy",
      "cut",
      "contextmenu",
      "selectstart",
      "mousedown",
      "mouseup",
      "keydown",
      "keyup",
      "keypress",
      "oncopy",
      "oncut",
      "onpaste",
    ].forEach((event) => {
      document.addEventListener(event, stopPropagation, true);
    });

    // 解除 CSS 样式限制
    var css = `
            * {
                -webkit-user-select: auto !important;
                -moz-user-select: auto !important;
                -ms-user-select: auto !important;
                user-select: auto !important;
                pointer-events: auto !important;
                -webkit-touch-callout: default !important;
            }
        `;
    var style = document.createElement("style");
    style.type = "text/css";
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);

    // 处理 body 标签的 oncontextmenu 属性
    if (document.body) {
      document.body.oncontextmenu = null;
    }

    // 处理常见的框架
    var frames = [
      ...document.getElementsByTagName("iframe"),
      ...document.getElementsByTagName("object"),
      ...document.getElementsByTagName("embed"),
    ];
    frames.forEach((frame) => {
      try {
        var frameDoc = frame.contentWindow.document;
        [
          "copy",
          "cut",
          "contextmenu",
          "selectstart",
          "mousedown",
          "mouseup",
          "keydown",
          "keyup",
          "keypress",
        ].forEach((event) => {
          frameDoc.addEventListener(event, stopPropagation, true);
        });
      } catch (e) {
        console.error("无法访问框架内容:", e);
      }
    });

    // 添加鼠标抬起事件监听器
    document.addEventListener("mouseup", autoCopyHandler, true);
  }

  // 禁用复制功能的函数
  function disableCopy() {
    // 恢复默认事件
    [
      "copy",
      "cut",
      "contextmenu",
      "selectstart",
      "mousedown",
      "mouseup",
      "keydown",
      "keyup",
      "keypress",
      "oncopy",
      "oncut",
      "onpaste",
    ].forEach((event) => {
      document.removeEventListener(event, stopPropagation, true);
    });

    // 移除 CSS 样式限制
    var styles = document.getElementsByTagName("style");
    for (var i = 0; i < styles.length; i++) {
      if (
        styles[i].innerHTML.includes("-webkit-user-select: auto !important")
      ) {
        styles[i].parentNode.removeChild(styles[i]);
      }
    }

    // 移除鼠标抬起事件监听器
    document.removeEventListener("mouseup", autoCopyHandler, true);
  }

  // 创建按钮的函数
  function createButton() {
    var button = document.createElement("button");
    button.innerHTML = text.enableCopy;
    button.style.position = "fixed";
    button.style.bottom = "20px";
    button.style.right = "20px";
    button.style.zIndex = "9999";
    button.style.padding = "10px 15px";
    button.style.backgroundColor = "rgba(173, 216, 230, 0.9)";
    button.style.color = "#000";
    button.style.border = "none";
    button.style.borderRadius = "10px";
    button.style.cursor = "pointer";
    button.style.fontFamily = "微软雅黑, Arial, sans-serif";
    button.style.fontSize = "14px";
    button.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    button.style.transition = "background-color 0.3s, transform 0.3s";
    button.onmouseover = function () {
      button.style.backgroundColor = "rgba(135, 206, 235, 0.9)";
      button.style.transform = "scale(1.05)";
    };
    button.onmouseout = function () {
      button.style.backgroundColor = "rgba(173, 216, 230, 0.9)";
      button.style.transform = "scale(1)";
    };
    button.addEventListener("click", function () {
      toggleCopyState();
    });
    if (copyState.showButton) {
      document.body.appendChild(button);
    }
    return button;
  }

  // 切换复制状态的函数
  function toggleCopyState() {
    if (copyState.enabled) {
      disableCopy();
      copyState.button.innerHTML = text.enableCopy;
    } else {
      enableCopy();
      copyState.button.innerHTML = text.disableCopy;
    }
    copyState.enabled = !copyState.enabled;
    GM_setValue("enabled", copyState.enabled);
  }

  // 设置自动复制功能开关
  GM_registerMenuCommand(text.enableCopy, function () {
    toggleCopyState();
  });

  // 设置按钮显示开关
  GM_registerMenuCommand(
    isChinese
      ? "设置显示解除复制限制按钮"
      : "Toggle Show Copy Restrictions Button",
    function () {
      copyState.showButton = !copyState.showButton;
      GM_setValue("showButton", copyState.showButton);
      if (copyState.showButton) {
        document.body.appendChild(button);
      } else {
        if (button.parentNode) {
          button.parentNode.removeChild(button);
        }
      }
    }
  );

  // 设置复制格式
  GM_registerMenuCommand(
    isChinese ? "设置复制格式" : "Set Copy Format",
    function () {
      var copyFormatOptions = ["text", "html", "link"];
      var copyFormat = prompt(text.copyFormatPrompt, copyState.copyFormat);

      if (copyFormatOptions.includes(copyFormat)) {
        copyState.copyFormat = copyFormat;
        GM_setValue("copyFormat", copyState.copyFormat);
      } else {
        alert(text.invalidCopyFormatAlert);
      }
    }
  );

  // 初始状态禁用自动复制功能
  disableCopy();
})();
