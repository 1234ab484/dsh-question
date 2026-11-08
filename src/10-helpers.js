
    "use strict";

    var GLOBAL_KEY = "__DSH_QUESTION_CARD__";
    var STYLE_NAME = "dsh-question/dsh-question.css";
    var TIP_CLASS = "dsh-tq-tip";
    var SHOW_DELAY_MS = 160;
    var CSS = __CSS_PLACEHOLDER__;

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