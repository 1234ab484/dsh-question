/* dsh-question — 浏览器侧 bundle（CJS 工厂，供 DSH Web 客户端 ModuleLoader 注入）。
 *
 * 纯呈现层插件：不改模型可见的工具 schema，也不替换提问卡片的 React 组件，只做两件事：
 *   1. 样式：选项行只显示重点（label），详细说明（description）收进悬停浮窗，「其他：」替掉铅笔图标；
 *   2. 事件委托 + 固定定位浮窗：悬停/聚焦选项时按需读取 DOM 里仍在的 description 文本。
 * 不在 React 树里插节点，所以选择、翻页、重渲染都不会把增强冲掉；
 * apply 幂等（window.__DSH_QUESTION_CARD__ 记录上一代 disposer），HMR 重载不会叠加监听器。
 *
 * ⚠️ 本文件由 scripts/build.cjs 生成，不要手改；改 src/ 下的片段后重新 build。
 */
window.__ModuleLoader__.load({
  id: "dsh-question",
  factory: function (require) {
    var module = { exports: {} };
    var exports = module.exports;

    "use strict";

    var GLOBAL_KEY = "__DSH_QUESTION_CARD__";
    var STYLE_NAME = "dsh-question/dsh-question.css";
    var TIP_CLASS = "dsh-tq-tip";
    var SHOW_DELAY_MS = 160;
    var CSS = "/* dsh-question — 悬停式提问卡片（样式层）\n *\n * 作用域：只命中 ask_user_question 的提问卡片——它的外层 .frame 带 data-question-key，\n * 这是 DSH 客户端的稳定语义钩子；其余界面（如 plan-review 卡片）不受影响。\n *\n * 设计：\n *  1. 选项行里原本内联的 description 收进悬停浮窗，行内只留「重点」（label）；\n *  2. label 最多两行，超出省略——完整内容在浮窗里看；\n *  3. 自定义答案行以「其他：」开头（替掉铅笔图标），让自由输入一眼可见；\n *  4. 带详细说明的选项右上角显示一个 ⓘ 提示可悬停。\n */\n\n/* ① 行内详细说明不再占位：文本仍留在 DOM 里，由 client.js 的浮窗读取。 */\n[data-question-key] button[role=\"radio\"] [class*=\"_description\"],\n[data-question-key] button[role=\"checkbox\"] [class*=\"_description\"] {\n  display: none !important;\n}\n\n/* ② 选项重点最多两行，超出用省略号。 */\n[data-question-key] button[role=\"radio\"] [class*=\"_optionLabel\"],\n[data-question-key] button[role=\"checkbox\"] [class*=\"_optionLabel\"] {\n  display: -webkit-box;\n  -webkit-box-orient: vertical;\n  -webkit-line-clamp: 2;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  overflow-wrap: anywhere;\n}\n\n/* ③ 悬停提示的可视暗示：有详细说明的选项在行尾显示 ⓘ。 */\n[data-question-key] button[role=\"radio\"]:has([class*=\"_description\"])::after,\n[data-question-key] button[role=\"checkbox\"]:has([class*=\"_description\"])::after {\n  content: \"\\24D8\";\n  flex: 0 0 auto;\n  margin-left: auto;\n  padding-left: 8px;\n  color: var(--dsw-alias-label-tertiary, #8a8a8a);\n  font-size: 12px;\n  line-height: 24px;\n  font-weight: 400;\n}\n\n/* ④ 单选：序号圆片改成圆形单选框（未选=空心圆环，选中=实心圆）。 */\n[data-question-key] button[role=\"radio\"] > [class*=\"_number\"] {\n  box-sizing: border-box;\n  width: 26px;\n  height: 26px;\n  flex: 0 0 26px;\n  aspect-ratio: 1 / 1;\n  padding: 0;\n  margin-top: -1px;\n  border-radius: 50%;\n  corner-shape: round;\n  border: 2px solid var(--dsw-alias-border-l4, rgba(255, 255, 255, 0.3));\n  background: transparent;\n  color: var(--dsw-alias-label-secondary, #9a9a9a);\n  font-size: 13px;\n  line-height: 1;\n  font-weight: 500;\n  display: grid;\n  place-items: center;\n}\n\n[data-question-key] button[role=\"radio\"][aria-checked=\"true\"] > [class*=\"_number\"] {\n  border-color: var(--dsw-alias-state-business-primary, #4f8cff);\n  background: var(--dsw-alias-state-business-primary, #4f8cff);\n  color: var(--dsw-alias-label-primary-foreground, #111);\n}\n\n/* ⑤ 「其他：」替掉铅笔/序号图标。 */\n[data-question-key] [class*=\"_customRow\"]::before {\n  content: \"\\5176\\4ED6\\FF1A\";\n  flex: 0 0 auto;\n  color: var(--dsw-alias-label-secondary, #9a9a9a);\n  font-size: 14px;\n  line-height: 24px;\n  font-weight: 500;\n  white-space: nowrap;\n}\n\n[data-question-key] [class*=\"_customRow\"] > [class*=\"_number\"],\n[data-question-key] [class*=\"_customRow\"] > [class*=\"_checkbox\"] {\n  display: none !important;\n}\n\n/* ⑤ 浮窗：由 client.js 定位到选项行旁边。 */\n.dsh-tq-tip {\n  position: fixed;\n  z-index: 2147483000;\n  box-sizing: border-box;\n  max-width: min(392px, calc(100vw - 24px));\n  padding: 10px 12px;\n  border-radius: 12px;\n  border: 1px solid var(--dsw-alias-border-l2-darkmode-thin, var(--dsw-alias-border-l2, rgba(255, 255, 255, 0.12)));\n  background: var(--dsw-alias-bg-module-platform, #353638);\n  color: var(--dsw-alias-label-primary, #ededed);\n  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.42), 0 2px 8px rgba(0, 0, 0, 0.28);\n  font-size: 13px;\n  line-height: 20px;\n  letter-spacing: 0.01em;\n  white-space: pre-wrap;\n  overflow-wrap: anywhere;\n  pointer-events: none;\n  opacity: 0;\n  transform: translateY(3px);\n  transition: opacity 0.12s ease, transform 0.12s ease;\n}\n\n.dsh-tq-tip[data-show=\"1\"] {\n  opacity: 1;\n  transform: translateY(0);\n}\n\n.dsh-tq-tip .dsh-tq-tip__title {\n  margin-bottom: 4px;\n  font-weight: 600;\n  color: var(--dsw-alias-label-primary, #ededed);\n}\n\n.dsh-tq-tip .dsh-tq-tip__body {\n  color: var(--dsw-alias-label-secondary, #b9b9b9);\n}";

    function classNameOf(el) {
      try {
        var value = el && el.className;
        return typeof value === "string" ? value : "";
      } catch (error) {
        return "";
      }
    }

    function hasToken(el, suffix) {
      var classes = classNameOf(el).split(/\s+/);
      for (var i = 0; i < classes.length; i += 1) {
        var token = classes[i];
        if (token === suffix) return true;
        if (token.slice(-(suffix.length + 1)) === "_" + suffix) return true;
      }
      return false;
    }

    function textOf(el) {
      return (el && el.textContent ? String(el.textContent) : "").replace(/\s+/g, " ").trim();
    }

    function closestOption(node) {
      var el = node && node.nodeType === 3 ? node.parentElement : node;
      if (!el || typeof el.closest !== "function") return null;
      if (!el.closest("[data-question-key]")) return null;
      var button = el.closest('button[role="radio"], button[role="checkbox"]');
      return button && hasToken(button, "option") ? button : null;
    }

    function readOption(button) {
      var spans = button.querySelectorAll("span");
      var labelEl = null;
      var descEl = null;
      for (var i = 0; i < spans.length; i += 1) {
        var span = spans[i];
        if (labelEl === null && hasToken(span, "optionLabel")) {
          labelEl = span;
        } else if (descEl === null && hasToken(span, "description")) {
          descEl = span;
        }
      }
      if (labelEl === null) return null;
      var clamped = labelEl.scrollHeight > labelEl.clientHeight + 1;
      var description = descEl === null ? "" : textOf(descEl);
      if (!description && !clamped) return null;
      return { label: textOf(labelEl), description: description, clamped: clamped };
    }

    function createTip() {
      var tip = document.createElement("div");
      tip.className = TIP_CLASS;
      tip.setAttribute("role", "tooltip");
      tip.setAttribute("data-show", "0");
      return tip;
    }

    function renderTip(tip, data) {
      tip.textContent = "";
      if (data.clamped && data.label) {
        var title = document.createElement("div");
        title.className = "dsh-tq-tip__title";
        title.textContent = data.label;
        tip.appendChild(title);
      }
      if (data.description) {
        var body = document.createElement("div");
        body.className = "dsh-tq-tip__body";
        body.textContent = data.description;
        tip.appendChild(body);
      }
    }

    function placeTip(tip, button) {
      tip.style.left = "0px";
      tip.style.top = "0px";
      var rect = button.getBoundingClientRect();
      var tipRect = tip.getBoundingClientRect();
      var gap = 8;
      var viewportWidth = window.innerWidth || document.documentElement.clientWidth;
      var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      var top = rect.top - tipRect.height - gap;
      if (top < 8) top = rect.bottom + gap;
      if (top + tipRect.height > viewportHeight - 8) top = Math.max(8, viewportHeight - tipRect.height - 8);
      var left = Math.min(rect.left, viewportWidth - tipRect.width - 12);
      if (left < 12) left = 12;
      tip.style.left = Math.round(left) + "px";
      tip.style.top = Math.round(top) + "px";
    }

    function injectStyle() {
      var selector = "style[data-plugin-css=" + JSON.stringify(STYLE_NAME) + "]";
      var existing = document.querySelector(selector);
      if (existing !== null) return existing;
      var tag = document.createElement("style");
      tag.dataset.plugin = "dsh-question";
      tag.dataset.pluginCss = STYLE_NAME;
      tag.textContent = CSS;
      document.head.appendChild(tag);
      return tag;
    }

    function apply(ctx) {
      var previous = window[GLOBAL_KEY];
      if (previous && typeof previous.dispose === "function") {
        try {
          previous.dispose();
        } catch (error) {
          /* a previous generation is already gone */
        }
      }

      var disposers = [];
      var disposed = false;
      var tip = createTip();
      var styleTag = injectStyle();
      var currentButton = null;
      var visible = false;
      var showTimer = 0;

      var mountRoot = document.body || document.documentElement;
      mountRoot.appendChild(tip);
      disposers.push(function () {
        if (tip.parentNode !== null) tip.parentNode.removeChild(tip);
      });
      disposers.push(function () {
        if (styleTag.parentNode !== null) styleTag.parentNode.removeChild(styleTag);
      });

      function cancel() {
        if (showTimer !== 0) {
          window.clearTimeout(showTimer);
          showTimer = 0;
        }
        currentButton = null;
        if (visible) {
          visible = false;
          tip.setAttribute("data-show", "0");
        }
      }

      function showFor(button, immediate) {
        if (disposed || button === currentButton) return;
        cancel();
        var data = readOption(button);
        if (data === null) return;
        currentButton = button;
        var fire = function () {
          showTimer = 0;
          if (disposed || currentButton !== button || !button.isConnected) return;
          renderTip(tip, data);
          placeTip(tip, button);
          visible = true;
          tip.setAttribute("data-show", "1");
        };
        if (immediate) fire();
        else showTimer = window.setTimeout(fire, SHOW_DELAY_MS);
      }

      function onMouseOver(event) {
        var button = closestOption(event.target);
        if (button === null) {
          if (currentButton !== null && !(event.relatedTarget && currentButton.contains(event.relatedTarget))) cancel();
          return;
        }
        showFor(button, false);
      }

      function onMouseOut(event) {
        var button = closestOption(event.target);
        if (button === null) return;
        if (event.relatedTarget && button.contains(event.relatedTarget)) return;
        if (button === currentButton) cancel();
      }

      function onFocusIn(event) {
        var button = closestOption(event.target);
        if (button !== null) showFor(button, true);
      }

      function onFocusOut(event) {
        var button = closestOption(event.target);
        if (button !== null && button === currentButton) cancel();
      }

      function onClick(event) {
        if (closestOption(event.target) !== null) cancel();
      }

      function onViewportChange() {
        cancel();
      }

      document.addEventListener("mouseover", onMouseOver, true);
      document.addEventListener("mouseout", onMouseOut, true);
      document.addEventListener("focusin", onFocusIn, true);
      document.addEventListener("focusout", onFocusOut, true);
      document.addEventListener("click", onClick, true);
      document.addEventListener("scroll", onViewportChange, true);
      window.addEventListener("resize", onViewportChange, true);

      disposers.push(installKeyboard());

      disposers.push(function () {
        document.removeEventListener("mouseover", onMouseOver, true);
        document.removeEventListener("mouseout", onMouseOut, true);
        document.removeEventListener("focusin", onFocusIn, true);
        document.removeEventListener("focusout", onFocusOut, true);
        document.removeEventListener("click", onClick, true);
        document.removeEventListener("scroll", onViewportChange, true);
        window.removeEventListener("resize", onViewportChange, true);
      });

      function dispose() {
        if (disposed) return;
        disposed = true;
        cancel();
        for (var i = disposers.length - 1; i >= 0; i -= 1) {
          try {
            disposers[i]();
          } catch (error) {
            /* keep releasing the rest */
          }
        }
        disposers.length = 0;
        if (window[GLOBAL_KEY] && window[GLOBAL_KEY].dispose === dispose) delete window[GLOBAL_KEY];
      }

      if (ctx && typeof ctx.effect === "function") {
        try {
          ctx.effect(function () {
            return dispose;
          }, "dsh-question: hover tooltip");
        } catch (error) {
          /* older client runners: the window guard still keeps HMR idempotent */
        }
      }
      window[GLOBAL_KEY] = { dispose: dispose };
    }

    /** Whether a node is a text-entry surface where plain keys must stay untouched. */
    function isTypingTarget(node) {
      var el = node && node.nodeType === 3 ? node.parentElement : node;
      if (!el || typeof el.closest !== "function") return false;
      return el.closest("input, textarea, select, [contenteditable=\"true\"], [contenteditable=\"\"]") !== null;
    }

    /** The visible question card, or null when none is mounted. */
    function visibleQuestionCard() {
      var cards = document.querySelectorAll("[data-question-key]");
      for (var i = 0; i < cards.length; i += 1) {
        var card = cards[i];
        if (card.isConnected && card.getClientRects().length > 0) return card;
      }
      return null;
    }

    /** Option buttons in display order (single-select radios or multi-select checkboxes). */
    function optionButtonsOf(card) {
      return card.querySelectorAll('button[role="radio"], button[role="checkbox"]');
    }

    /** The primary footer action (submit / next). Last button inside the action group. */
    function primaryActionOf(card) {
      var group = card.querySelector('[class*="_footerActions"]');
      if (group === null) return null;
      var buttons = group.querySelectorAll("button");
      return buttons.length === 0 ? null : buttons[buttons.length - 1];
    }

    /** The collapse control: the header icon button carrying aria-expanded. */
    function collapseControlOf(card) {
      var header = card.querySelector("header");
      if (header === null) return null;
      var buttons = header.querySelectorAll("button");
      for (var i = 0; i < buttons.length; i += 1) {
        if (buttons[i].hasAttribute("aria-expanded")) return buttons[i];
      }
      return null;
    }

    /** Select the nth option by clicking it, so every native side effect stays intact. */
    function clickOption(card, index) {
      var options = optionButtonsOf(card);
      if (index < 0 || index >= options.length) return false;
      var button = options[index];
      if (button.disabled) return false;
      button.click();
      return true;
    }

    /**
     * Keyboard shortcuts for the open question card: 1-9 pick an option, Enter runs
     * the primary footer action, Escape collapses the card (never cancels a question).
     * Text entry surfaces are left completely alone, so typing a digit or Enter into
     * the custom answer behaves natively.
     */
    function installKeyboard() {
      function onKeyDown(event) {
        if (event.defaultPrevented || event.isComposing) return;
        if (event.ctrlKey || event.metaKey || event.altKey) return;
        if (isTypingTarget(event.target)) return;
        var card = visibleQuestionCard();
        if (card === null) return;
        var key = event.key;
        if (key !== null && key.length === 1 && key >= "1" && key <= "9") {
          if (clickOption(card, key.charCodeAt(0) - 49)) {
            event.preventDefault();
            event.stopPropagation();
          }
          return;
        }
        if (key === "Enter") {
          var action = primaryActionOf(card);
          if (action === null || action.disabled) return;
          event.preventDefault();
          event.stopPropagation();
          action.click();
          return;
        }
        if (key === "Escape") {
          var collapse = collapseControlOf(card);
          if (collapse === null || collapse.disabled) return;
          event.preventDefault();
          event.stopPropagation();
          collapse.click();
        }
      }
      document.addEventListener("keydown", onKeyDown, true);
      return function () {
        document.removeEventListener("keydown", onKeyDown, true);
      };
    }

    module.exports = { name: "question", inject: [], apply: apply };
    return module.exports;
  },
});
