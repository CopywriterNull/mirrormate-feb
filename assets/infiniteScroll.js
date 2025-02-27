"use strict";
var Ajaxinate = function (e) {
    var i = e || {},
        n = { pagination: ".AjaxinatePagination", method: "click", container: ".AjaxinateLoop", offset: 0, loadingText: "Loading", callback: null };
    (this.settings = Object.assign(n, i)),
        (this.addScrollListeners = this.addScrollListeners.bind(this)),
        (this.addClickListener = this.addClickListener.bind(this)),
        (this.checkIfPaginationInView = this.checkIfPaginationInView.bind(this)),
        (this.stopMultipleClicks = this.stopMultipleClicks.bind(this)),
        (this.destroy = this.destroy.bind(this)),
        (this.containerElement = document.querySelector(this.settings.container)),
        (this.paginationElement = document.querySelector(this.settings.pagination)),
        this.initialize();
};
(Ajaxinate.prototype.initialize = function () {
    if (this.containerElement) {
        var e = { click: this.addClickListener, scroll: this.addScrollListeners };
        e[this.settings.method]();
    }
}),
(Ajaxinate.prototype.addScrollListeners = function () {
    this.paginationElement &&
        (document.addEventListener("click", this.checkIfPaginationInView), window.addEventListener("resize", this.checkIfPaginationInView), window.addEventListener("orientationchange", this.checkIfPaginationInView));
}),
(Ajaxinate.prototype.addClickListener = function () {
    
    event.preventDefault(), this.paginationElement &&
        ((this.nextPageLinkElement = this.paginationElement.querySelector("a")), (this.clickActive = !0), this.nextPageLinkElement !== null && this.nextPageLinkElement.addEventListener("click", this.stopMultipleClicks));
}),
(Ajaxinate.prototype.stopMultipleClicks = function (e) {
    e.preventDefault(), this.clickActive && ((this.nextPageLinkElement.innerHTML = this.settings.loadingText), (this.nextPageUrl = this.nextPageLinkElement.href), (this.clickActive = !1), this.loadMore());
}),
(Ajaxinate.prototype.checkIfPaginationInView = function () {
    var e = this.paginationElement.getBoundingClientRect().top - this.settings.offset,
        i = this.paginationElement.getBoundingClientRect().bottom + this.settings.offset;
    e <= window.innerHeight &&
        i >= 0 &&
        ((this.nextPageLinkElement = this.paginationElement.querySelector("a")),
            this.removeScrollListener(),
            this.nextPageLinkElement && ((this.nextPageLinkElement.innerHTML = this.settings.loadingText), (this.nextPageUrl = this.nextPageLinkElement.href), this.loadMore()));
}),
(Ajaxinate.prototype.loadMore = function () {
    (this.request = new XMLHttpRequest()),
        (this.request.onreadystatechange = function () {
            if (this.request.readyState === 4 && this.request.status === 200) {
              const html = new DOMParser().parseFromString(this.request.responseText, 'text/html');
                var i = html.querySelectorAll(this.settings.container)[0],
                    n = html.querySelectorAll(this.settings.pagination)[0];
                this.containerElement.insertAdjacentHTML("beforeend", i.innerHTML),
                    (this.paginationElement.innerHTML = n ? n.innerHTML : ""),
                    this.settings.callback && typeof this.settings.callback == "function" && this.settings.callback(html),
                    this.initialize();
                    document.dispatchEvent(new CustomEvent("masonry:init"))
                    document.dispatchEvent(new CustomEvent('popupOpen:init'))
            }
        }.bind(this)),
        this.request.open("GET", this.nextPageUrl),
        // (this.request.responseType = "document"),s
        this.request.send();
}),
(Ajaxinate.prototype.removeClickListener = function () {
    this.nextPageLinkElement.addEventListener("click", this.stopMultipleClicks);
}),
(Ajaxinate.prototype.removeScrollListener = function () {
    document.removeEventListener("click", this.checkIfPaginationInView), window.removeEventListener("resize", this.checkIfPaginationInView), window.removeEventListener("orientationchange", this.checkIfPaginationInView);
}),
(Ajaxinate.prototype.destroy = function () {
    var e = { click: this.removeClickListener, click: this.removeScrollListener };
    return e[this.settings.method](), this;
});