
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