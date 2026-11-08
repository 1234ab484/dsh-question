
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