import { LANG } from "./language.js";
import { renderUserData } from "./utilities.js";

/**
 * Iterates over each node in the NodeList and executes a callback function.
 * @param {function(Node, number): void} cb - The callback function to execute for each node.
 */
NodeList.prototype.for = function (cb) {
  for (let i = 0; i < this.length; i++) {
    cb(this[i], i);
  }
};

/**
 * Maps each element in the array using a callback function and filters out non-truthy values.
 * @param {function(*, number, Array): *} cb - The callback function to execute for each element.
 * @returns {Array} The new array with mapped and filtered values.
 */
Array.prototype.filteredMap = function (cb) {
  return this.reduce((filteredMap, item, index) => {
    const returnItem = cb(item, index, filteredMap);
    return returnItem?.length ?? returnItem ? [...filteredMap, returnItem] : filteredMap;
  }, []);
};

/**
 * Maps and flattens the array using a callback function.
 * @template T
 * @param {function(T, number, Array<T>): *} cb - The callback function to execute for each element.
 * @param {number} depth - The depth level to flatten the array.
 * @returns {Array} The new array with mapped and flattened values.
 */
Array.prototype.filteredFlatMap = function (cb, depth) {
  return this.filteredMap(cb).flat(depth);
};

/**
 * Reverses the string.
 * @returns {string} The reversed string.
 * @this {String}
 */
String.prototype.reverse = function () {
  return this.split("").reverse().join("");
};

/**
 * Iterates over each element in the array and executes a callback function.
 * @param {function(*, number): void} cb - The callback function to execute for each element.
 */
Array.prototype.for = function (cb) {
  for (let i = 0; i < this.length; i++) {
    cb(this[i], i);
  }
};

/**
 * Iterates over each element in the array and executes an async callback function.
 * @param {function(*, number): Promise<void>} cb - The async callback function to execute for each element.
 * @returns {Promise<void>}
 */
Array.prototype.forAwait = async function (cb) {
  for (let i = 0; i < this.length; i++) {
    await cb(this[i], i);
  }
  return;
};

/**
 * Returns an object where the array values are the values and the keys are provided.
 * @param {string[]} keys - Keys for the object as an array (must be the same length as the array).
 * @returns {Object.<string, *>} The resulting object.
 */
Array.prototype.toObject = function (keys) {
  if (keys.length < this.length) return;
  return this.reduce((total, current, i) => ({ ...total, [keys[i]]: current }), {});
};

/**
 * Removes the specified item(s) from the array.
 * @template T
 * @param {...T} items - The items to remove.
 * @returns {Array<T>} The array with the specified items removed.
 */
Array.prototype.remove = function (...items) {
  items.forEach((item) => {
    if (!this.includes(item)) return false;
    this.splice(this.indexOf(item), 1);
  });
  return this;
};

/**
 * Filters the object properties based on a callback function.
 * @param {function([string, *], number): boolean} cb - The callback function to execute for each property.
 * @returns {Object.<string, *>} The filtered object.
 */
Object.prototype.filter = function (cb) {
  return Object.entries(this).reduce(
    (newObj, [key, value], index) => (cb([key, value], index) ? { ...newObj, [key]: value } : newObj),
    {}
  );
};

/**
 * Iterates over each property value in the object and executes a callback function.
 * @param {function(*, number): void} cb - The callback function to execute for each property value.
 */
Object.prototype.for = function (cb) {
  Object.values(this).for(cb);
};

/**
 * Maps the object properties based on a callback function.
 * @param {function(*, string): *} cb - The callback function to execute for each property.
 * @returns {Object.<string, *>} The mapped object.
 */
Object.prototype.map = function (cb) {
  return Object.entries(this).reduce(
    (newObj, [key, value]) => ({ ...newObj, [key]: cb(value) }),
    {}
  );
};

/**
 * Converts a camelCase string to a kebab-case string.
 * @returns {string} The converted string.
 * @this {String}
 */
String.prototype.convert = function () {
  return this.replaceAll(/[A-Z]/g, (i) => `-${i.toLowerCase()}`);
};

/**
 * Includes an HTML template into the element.
 * @param {Object} [options] - The options for including the template.
 * @param {string} [options.url] - The URL of the template.
 * @param {boolean} [options.replace=true] - Whether to replace the element or not.
 * @returns {Promise<void>}
 */
HTMLElement.prototype.includeTemplate = async function ({
  url = this.getAttribute("include-template") || "",
  replace = true
} = {}) {
  let template = await (await fetch(url)).text();
  if (replace && this.parentElement) this.outerHTML = template;
  else this.innerHTML = template;
};

/**
 * Initializes menus in the element.
 */
HTMLElement.prototype.initMenus = function () {
  this.$$('[type = "menu"]').for((menu) => {
    const allButtons = menu.$$('[type = "option"]');
    allButtons.for((button) => {
      button.addEventListener("click", () =>
        allButtons.for((button) =>
          button.classList.toggle("active", button == event.currentTarget)
        )
      );
    });
  });
};

/**
 * Selects a single element matching the given selector.
 * @param {string} sel - The selector to match.
 * @returns {HTMLElement} The matched element.
 */
HTMLElement.prototype.$ = function (sel) {
  return this.querySelector(sel);
};

/**
 * Selects all elements matching the given selector.
 * @param {string} sel - The selector to match.
 * @returns {NodeList} The matched elements.
 */
HTMLElement.prototype.$$ = function (sel) {
  return this.querySelectorAll(sel);
};

/**
 * Opens the dialog as a modal.
 * @returns {Promise<void>}
 */
HTMLDialogElement.prototype.openModal = function () {
  this.showModal();
  let shouldBeAbleToBeClosed = false;
  if (this.classList.contains("big-modal")) {
    this.classList.add("active");
    this.addEventListener("transitionend", () => (shouldBeAbleToBeClosed = true));
  } else {
    shouldBeAbleToBeClosed = true;
  }
  this.inert = false;

  const handlerId = Date.now();

  this.addEventListener(
    "pointerdown",
    (window[handlerId] = () => {
      if (!shouldBeAbleToBeClosed) return;
      if (event.which == 3) return;
      if (this.getAttribute("static") == "true") return;
      if (![...this.$$(":scope > div")].every((container) => !container.contains(event.target))) return;

      this.$(".notification")?.classList.remove("anim-notification");
      this.closeModal(handlerId);
      this.inert = true;
    })
  );

  if (this.classList.contains("dlg-notification")) {
    this.showNotification();
  }
  this.initMenus();
  return this.LANG_load();
};

/**
 * Closes the dialog modal.
 * @param {number} handlerId - The ID of the event handler.
 */
HTMLDialogElement.prototype.closeModal = function (handlerId) {
  if (this.classList.contains("big-modal")) {
    this.addEventListener("transitionend", () => this.close(), { once: true });
    this.classList.remove("active");
  } else {
    this.close();
  }
  this.removeEventListener("pointerdown", window[handlerId]);
};

/**
 * Shows a notification within the dialog.
 */
HTMLDialogElement.prototype.showNotification = function () {
  let abortHandler, completionHandler;
  this.$(".notification").classList.add("anim-notification");
  this.$(".notification").addEventListener(
    "animationcancel",
    (abortHandler = () => {
      event.currentTarget.removeEventListener("animationend", completionHandler);
    }),
    { once: true }
  );
  this.$(".notification").addEventListener(
    "animationend",
    (completionHandler = () => {
      event.currentTarget.removeEventListener("animationcancel", abortHandler);
      event.currentTarget.classList.remove("anim-notification");
      this.closeModal();
    }),
    { once: true }
  );
};

/**
 * Loads the language content for the element.
 * @returns {Promise<void>}
 */
HTMLElement.prototype.LANG_load = function () {
  return LANG.render(this);
};

/**
 * Renders user data within the element.
 */
HTMLElement.prototype.renderUserData = function () {
  renderUserData.apply(this);
};

/**
 * Toggles the dropdown menu state.
 */
HTMLElement.prototype.toggleDropDown = function () {
  if (!this.closest(".drp-wrapper")) return;
  this.closest(".drp-wrapper").toggleActive();
  const functionName = Date.now();
  document.addEventListener(
    "click",
    (window[functionName] = () => {
      if (this.closest(".drp-wrapper").contains(event.target)) return;
      this.closest(".drp-wrapper").toggleActive();
      document.removeEventListener("click", window[functionName]);
      delete window[functionName];
    })
  );
};

/**
 * Toggles the active state of the element.
 */
HTMLElement.prototype.toggleActive = function () {
  this.classList.toggle("active");
};

/**
 * Updates the position of the element.
 * @param {number} [x=0] - The X position.
 * @param {number} [y=0] - The Y position.
 */
HTMLElement.prototype.updatePosition = function (x = 0, y = 0) {
  if (!this.style.getPropertyValue("--x")) return;
  this.style.setProperty("--x", `${x}`);
  this.style.setProperty("--y", `${y}`);
};

/**
 * Sets the transition speed of the element.
 * @param {string} [x=""] - The X transition speed.
 * @param {string} [y=""] - The Y transition speed.
 */
HTMLElement.prototype.setTransitionSpeed = function (x = "", y = "") {
  const transitionSpeed = x && y ? `${parseInt(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) / 2)}ms` : "";
  this.style.transitionDuration = transitionSpeed;
};

/**
 * Triggers a CSS animation on the element.
 * @param {string} className - The CSS class to apply for the animation.
 */
HTMLElement.prototype.triggerAnimation = function (className) {
  this.classList.add(className);
  this.addEventListener(
    "animationend",
    (endHandler = () => {
      this.classList.remove(className);
      this.removeEventListener("animationend", endHandler);
      this.removeEventListener("animationcancel", endHandler);
    })
  );
  this.addEventListener("animationcancel", endHandler);
};

/**
 * Hides the element by adding the "d-none" class.
 */
HTMLElement.prototype.hide = function () {
  this.classList.add("d-none");
};

/**
 * Shows the element by removing the "d-none" class.
 */
HTMLElement.prototype.show = function () {
  this.classList.remove("d-none");
};

/**
 * Rounds a number to the specified number of decimal places.
 * @param {number} nbr - The number to round.
 * @param {number} decimals - The number of decimal places.
 * @returns {number} The rounded number.
 */
Math.roundTo = function (nbr, decimals) {
  return Math.round(nbr * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

/**
 * Renders a list of items using a template function.
 * @param {Array} items - The items to render.
 * @param {function(*): string} templateFunction - The template function to generate HTML for each item.
 */
HTMLElement.prototype.renderItems = function (items, templateFunction) {
  const docFrag = document.createDocumentFragment();
  items.for((item) => {
    const newItem = document.createElement("div");
    newItem.innerHTML = templateFunction(item);
    docFrag.append(...newItem.childNodes);
  });
  this.appendChild(docFrag);
};

/**
 * Animates the text content of the element character by character.
 * @param {string} text - The text to animate.
 * @param {number} [speed=10] - The speed of the animation.
 * @returns {Promise<void>}
 */
HTMLElement.prototype.textAnimation = async function (text, speed = 10) {
  this.innerText = "";
  let i = 0;
  const int = setInterval(() => {
    if (i + 1 == text.length) clearInterval(int);
    this.textContent += text[i];
    i++;
  }, speed);
};

