
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

    /** Pager buttons in order: [previous, next]; empty when the batch has one question. */
    function pagerButtonsOf(card) {
      var pager = card.querySelector('[class*="_pager"]');
      if (pager === null) return [];
      return pager.querySelectorAll("button");
    }

    /** Move one question backward (-1) or forward (1) through the card's own pager. */
    function stepQuestion(card, delta) {
      var buttons = pagerButtonsOf(card);
      if (buttons.length === 0) return false;
      var button = delta < 0 ? buttons[0] : buttons[buttons.length - 1];
      if (button.disabled) return false;
      button.click();
      return true;
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
        if (key === "ArrowLeft" || key === "PageUp") {
          if (stepQuestion(card, -1)) {
            event.preventDefault();
            event.stopPropagation();
          }
          return;
        }
        if (key === "ArrowRight" || key === "PageDown") {
          if (stepQuestion(card, 1)) {
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
