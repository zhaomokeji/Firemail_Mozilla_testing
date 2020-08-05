(function() {
  let gAccService = 0;

  function initAccessibility() {
    if (!gAccService) {
      var service = Cc["@mozilla.org/accessibilityService;1"];
      if (service) {
        // fails if build lacks accessibility module
        gAccService = Cc["@mozilla.org/accessibilityService;1"].getService(
          Ci.nsIAccessibilityService
        );
      }
    }
    return !!gAccService;
  }

  function getAccessible(aNode) {
    try {
      return gAccService.getAccessibleFor(aNode);
    } catch (e) {}

    return null;
  }

  function ensureAccessibleTreeForNode(aNode) {
    var acc = getAccessible(aNode);

    ensureAccessibleTreeForAccessible(acc);
  }

  function ensureAccessibleTreeForAccessible(aAccessible) {
    var child = aAccessible.firstChild;
    while (child) {
      ensureAccessibleTreeForAccessible(child);
      try {
        child = child.nextSibling;
      } catch (e) {
        child = null;
      }
    }
  }

  // Walk accessible tree of the given identifier to ensure tree creation
  function ensureAccessibleTreeForId(aID) {
    var node = content.document.getElementById(aID);
    if (!node) {
      return;
    }
    ensureAccessibleTreeForNode(node);
  }

  addEventListener("DOMContentLoaded", e => {
    Cu.exportFunction(initAccessibility, content, {
      defineAs: "initAccessibility",
    });
    Cu.exportFunction(ensureAccessibleTreeForId, content, {
      defineAs: "ensureAccessibleTreeForId",
    });
  });
})();
