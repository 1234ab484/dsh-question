# dsh-question

给 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）的提问卡片做减法。

DSH 自带的 `ask_user_question` 卡片会把每个选项的完整说明直接铺在选项行里，信息一多就臃肿、难扫读。
这个插件把它改成"先看重点、悬停看细节"的形态：

- **选项行只显示重点** —— 只留简短 label，最多两行，超出省略；
- **悬停显示完整说明** —— 浮层展示提问方给的 `description`；如果 label 被截断，浮层第一行补完整 label；
- **「其他：」是一等公民** —— 自定义答案行以「其他：」开头并直接给输入框，不再需要铅笔图标；
- **单选 26px 圆形单选框**，多选保留原生方框；
- **键盘快捷键** —— `1`–`9` 选择/勾选，`Enter` 触发右下角主按钮（提交/下一题），`Esc` 收起卡片
  （**不会**取消整组问题）。

它是**纯呈现层的客户端插件**：不改模型可见的工具 schema，不替换卡片的 React 组件，也不往 React 树里
插节点。

[English](README.md) | [中文](README.zh.md)

![提问卡片](docs/card.png)

![悬停浮层](docs/hover.png)

| 单选圆钮（8×） | 多选 |
| --- | --- |
| ![圆钮](docs/radio-zoom.png) | ![多选](docs/multi.png) |

## 环境要求

- DSH **0.2.1-rc.x** 的 Web / 桌面客户端（卡片由 `@deepseek-ai/dsh-client-ui-user-questions` 渲染）；
- 只有自己构建 bundle 时才需要 Node.js ≥ 20（发布出来的 bundle 是纯 JavaScript）。

选择器匹配的是 DSH CSS Module 的**类名后缀**（`_optionLabel`、`_description`、`_customRow` 等）和
`data-question-key` 属性，所以 DSH 改变 CSS 哈希不会影响插件；但卡片结构大改时需要跟着调选择器。

## 安装

### 从 GitHub 安装

```powershell
dsh plugin --profile <profile> add github:1234ab484/dsh-question
```

pnpm 会从 `https://github.com/1234ab484/dsh-question` 拉取这个包；启用了客户端 HMR 的 profile 会在线生效。
卸载：`dsh plugin --profile <profile> remove dsh-question`。

### 从本地 checkout 安装

```powershell
git clone https://github.com/1234ab484/dsh-question
dsh plugin --profile <profile> add "link:<path-to-this-repo>"
```

### 手动安装

1. 在 profile 的 `package.json` 依赖里加 `"dsh-question": "link:<path-to-this-repo>"`（或 GitHub spec）；
2. 把 `dsh-question` 追加到 `dsh.profile.bundles`；
3. 在 profile 目录执行 `pnpm install`。

包内声明了 `dsh.bundle.patch`（`cordis.patch.yml`，插入 `question-card` 这条 Loader 条目）和
`dsh.client`（`platform: "web"`，把 `./client` 指向 `lib/client.js`）。

## 键盘快捷键

| 按键 | 行为 |
| --- | --- |
| `1`–`9` | 选中第 N 个选项（单选）/ 勾选或取消（多选） |
| `Enter` | 触发右下角主按钮：最后一题提交，多题时下一题 |
| `Esc` | 收起卡片（等同标题栏收起按钮；**不会**放弃整组问题） |

快捷键只在提问卡片可见时生效；焦点在 `input`、`textarea` 或可编辑区域时不拦截；带 `Ctrl`/`Alt`/`Cmd`
的组合键不处理。

## 实现原理

1. **样式层**（`lib/dsh-question.css`，以 `<style data-plugin="dsh-question">` 注入）—— 作用域限定在
   `[data-question-key]`，隐藏行内 `*_description`、截断 label、画圆形单选框和「其他：」前缀、
   用主题令牌给浮层上色。
2. **交互层**（`lib/client.js`）—— 一个委托的 `mouseover`/`focusin` 监听器加一个 `position: fixed` 浮层；
   直接读 DOM 里仍然存在的 description 文本。不在 React 树里插节点，所以选择、翻页、重渲染都不会
   把增强冲掉。
3. **HMR 安全** —— `apply()` 会先销毁上一代（`window.__DSH_QUESTION_CARD__`），热重载不会叠加监听器。

## 开发

```bash
npm run build   # src/*.js + lib/dsh-question.css -> lib/client.js
npm run check   # node --check
npm test        # node:test 静态契约测试
```

浏览器打开 `dev/preview.html` 可以脱离 DSH 预览卡片 DOM（悬停选项可看浮层）。

```
src/10-helpers.js   DOM 辅助
src/20-tooltip.js   浮层元素、样式注入
src/30-mount.js     apply()：监听器、幂等销毁
src/40-keys.js      键盘快捷键
```

## 已知限制

- 「其他：」前缀写死中文；其它语言改 `lib/dsh-question.css` 里的 `content` 即可。
- 浮层内容来自提问方的 `description`；没有 description 时，只有 label 被截断才会回退到浮层显示完整 label。
- plan-review（`exit_plan_mode`）卡片不在改动范围内，保持原样。
- 依赖 DSH 内部的类名后缀和 `data-question-key`，卡片结构大改时需要更新选择器。

## 许可证

[MIT](LICENSE)
