/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const EXPORTED_SYMBOLS = ["MarionetteFrameChild"];

const { XPCOMUtils } = ChromeUtils.import(
  "resource://gre/modules/XPCOMUtils.jsm"
);

const { element } = ChromeUtils.import(
  "chrome://marionette/content/element.js"
);
const { error } = ChromeUtils.import("chrome://marionette/content/error.js");
const { evaluate } = ChromeUtils.import(
  "chrome://marionette/content/evaluate.js"
);
const { Log } = ChromeUtils.import("chrome://marionette/content/log.js");

XPCOMUtils.defineLazyGetter(this, "logger", Log.get);

class MarionetteFrameChild extends JSWindowActorChild {
  constructor() {
    super();

    this.seenEls = new element.Store();
  }

  get content() {
    return this.docShell.domWindow;
  }

  get id() {
    return this.browsingContext.id;
  }

  get innerWindowId() {
    return this.manager.innerWindowId;
  }

  actorCreated() {
    logger.trace(
      `[${this.id}] Child actor created for window id ${this.innerWindowId}`
    );
  }

  handleEvent(event) {
    switch (event.type) {
      case "beforeunload":
      case "pagehide":
      case "DOMContentLoaded":
      case "pageshow":
        this.sendAsyncMessage("MarionetteFrameChild:PageLoadEvent", {
          browsingContext: this.browsingContext,
          innerWindowId: this.innerWindowId,
          type: event.type,
        });
        break;
    }
  }

  async receiveMessage(msg) {
    const { name, data: serializedData } = msg;
    const data = evaluate.fromJSON(serializedData);

    try {
      let result;

      switch (name) {
        case "MarionetteFrameParent:findElement":
          result = await this.findElement(data);
          break;
        case "MarionetteFrameParent:findElements":
          result = await this.findElements(data);
          break;
        case "MarionetteFrameParent:getElementAttribute":
          result = await this.getElementAttribute(data);
          break;
        case "MarionetteFrameParent:getElementProperty":
          result = await this.getElementProperty(data);
          break;
      }

      return { data: evaluate.toJSON(result) };
    } catch (e) {
      // Always wrap errors as WebDriverError
      return { error: error.wrap(e).toJSON() };
    }
  }

  // Implementation of WebDriver commands

  /**
   * Find an element in the current browsing context's document using the
   * given search strategy.
   */
  async findElement(options = {}) {
    const { strategy, selector, opts } = options;

    opts.all = false;

    if (opts.startNode) {
      opts.startNode = this.seenEls.get(opts.startNode);
    }

    const container = { frame: this.content };
    const el = await element.find(container, strategy, selector, opts);
    return this.seenEls.add(el);
  }

  /**
   * Find elements in the current browsing context's document using the
   * given search strategy.
   */
  async findElements(options = {}) {
    const { strategy, selector, opts } = options;

    opts.all = true;

    if (opts.startNode) {
      opts.startNode = this.seenEls.get(opts.startNode);
    }

    const container = { frame: this.content };
    const el = await element.find(container, strategy, selector, opts);
    return this.seenEls.addAll(el);
  }

  /**
   * Get the value of an attribute for the given element.
   */
  async getElementAttribute(options = {}) {
    const { name, webEl } = options;
    const el = this.seenEls.get(webEl);

    if (element.isBooleanAttribute(el, name)) {
      if (el.hasAttribute(name)) {
        return "true";
      }
      return null;
    }
    return el.getAttribute(name);
  }

  /**
   * Get the value of a property for the given element.
   */
  async getElementProperty(options = {}) {
    const { name, webEl } = options;
    const el = this.seenEls.get(webEl);

    return typeof el[name] != "undefined" ? el[name] : null;
  }
}
