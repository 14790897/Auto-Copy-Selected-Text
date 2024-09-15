[English](readme_en.md)

### 自动复制选中文本 - 简单说明

由于 chatgpt 网页上大多数自动复制脚本都不能工作，所以自己写了一个

#### 概述

这是一个 Tampermonkey 脚本，可自动将网页上选中的文本复制到剪贴板，并保持选中状态。

#### 功能

- **自动复制**：自动将选中的文本复制到剪贴板。
- **保持选中**：复制后保持文本高亮。
- **支持 Clipboard API**：优先使用现代的 Clipboard API，提高复制效果。

#### 安装

##### 在线安装

https://greasyfork.org/zh-CN/scripts/508566-auto-copy-selected-text

##### 手动安装

1. 安装 [Tampermonkey 插件](https://www.tampermonkey.net/)。
2. 在 Tampermonkey 中创建一个新脚本。
3. 将脚本代码复制并粘贴到编辑器中。
4. 保存脚本。

#### 使用方法

在网页上选中任何文本，脚本会自动将其复制到剪贴板。

#### 兼容性

- 适用于大多数现代浏览器。
- 优先使用 Clipboard API，不支持时使用备用方法。

#### 许可证

MIT 许可证 - 免费使用和修改。
