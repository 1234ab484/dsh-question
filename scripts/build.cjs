// 把 src/*.js 片段 + lib/dsh-question.css 拼成宿主可直接 serve 的 CJS 工厂 bundle。
// 运行：node scripts/build.cjs
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

const css = read("lib/dsh-question.css");
const helpers = read("src/10-helpers.js").replace("__CSS_PLACEHOLDER__", JSON.stringify(css));
const tooltip = read("src/20-tooltip.js");
const mount = read("src/30-mount.js");
const keys = read("src/40-keys.js");

const header = [
  "/* dsh-question — 浏览器侧 bundle（CJS 工厂，供 DSH Web 客户端 ModuleLoader 注入）。",
  " *",
  " * 纯呈现层插件：不改模型可见的工具 schema，也不替换提问卡片的 React 组件，只做两件事：",
  " *   1. 样式：选项行只显示重点（label），详细说明（description）收进悬停浮窗，「其他：」替掉铅笔图标；",
  " *   2. 事件委托 + 固定定位浮窗：悬停/聚焦选项时按需读取 DOM 里仍在的 description 文本。",
  " * 不在 React 树里插节点，所以选择、翻页、重渲染都不会把增强冲掉；",
  " * apply 幂等（window.__DSH_QUESTION_CARD__ 记录上一代 disposer），HMR 重载不会叠加监听器。",
  " *",
  " * ⚠️ 本文件由 scripts/build.cjs 生成，不要手改；改 src/ 下的片段后重新 build。",
  " */",
  "window.__ModuleLoader__.load({",
  '  id: "dsh-question",',
  "  factory: function (require) {",
  "    var module = { exports: {} };",
  "    var exports = module.exports;",
].join("\n");

const footer = [
  '    module.exports = { name: "question", inject: [], apply: apply };',
  "    return module.exports;",
  "  },",
  "});",
  "",
].join("\n");

const bundle = [header, helpers, tooltip, mount, keys, footer].join("\n");
const target = path.join(root, "lib/client.js");
fs.writeFileSync(target, bundle);
console.log("built", target, bundle.length, "bytes");