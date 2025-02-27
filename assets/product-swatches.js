class ProductSwatches extends HTMLElement {
    constructor() {
        super();

        this.swatchItems = this.querySelectorAll("[js-swatch-item]");

        this.init();
    }

    init() {
        this.swatchItems.forEach( swatchItem => swatchItem.addEventListener('click', this.handleProductSwap.bind(this)));
    }

    handleProductSwap({ currentTarget }) {
        const cardProductEl = currentTarget.closest("[js-card-product]");

        this.updateState(currentTarget);
        this.updateMedia(currentTarget, cardProductEl);
        this.updateLink(currentTarget, cardProductEl);
        this.updateTitle(currentTarget, cardProductEl);
        this.updatePrice(currentTarget, cardProductEl);
        this.updateHandle(currentTarget, cardProductEl);
        this.updateButtonLabel(currentTarget, cardProductEl)
    }

    updateState(target) {
        this.swatchItems.forEach( swatchItem => swatchItem.classList.remove("is-selected"));
        target.classList.add("is-selected")
    }

    updateMedia(target, cardProduct) {
        const featuredImageEl = cardProduct.querySelector("[js-featured-image]");
        const secondaryImageEl = cardProduct.querySelector("[js-secondary-image]");

        const featuredImageSrc = target.getAttribute("data-featured-image-src");
        const featuredImageSrcset = target.getAttribute("data-featured-image-srcset");
        const secondaryImageSrc = target.getAttribute("data-secondary-image-src");
        const secondaryImageSrcset = target.getAttribute("data-secondary-image-srcset");

        featuredImageEl.setAttribute("src",featuredImageSrc);
        featuredImageEl.setAttribute("srcset",featuredImageSrcset);
        secondaryImageEl?.setAttribute("src",secondaryImageSrc);
        secondaryImageEl?.setAttribute("srcset",secondaryImageSrcset);
    }

     updateLink(target, cardProduct) {
        const productLinkEls = cardProduct.querySelectorAll("[js-product-link]");
        const productSampleBtn = cardProduct.querySelector("[ js-add_sample_button_new]");
        const productLink = cardProduct.classList.contains("is-multi-order-form") ? `/pages/multi-order-form?product_handle=${target.getAttribute("data-product-handle")}` : target.getAttribute("data-product-url");
        const productSampleBtnUrl = target.getAttribute("data-product-sample-btn-url");
        const productSampleBtnText = target.getAttribute("data-product-sample-btn-text");

        productLinkEls.forEach( el => el.setAttribute("href", productLink))
        if(productSampleBtn) {
            productSampleBtn.setAttribute('href', productSampleBtnUrl)
            productSampleBtn.innerText = productSampleBtnText
        }

        const inputIdField = cardProduct.querySelector('[js-hb-sample-input-id-field]')
        if(inputIdField) {
            const selectedSampleVariantId = target.getAttribute('data-sample-product-variant-id');
            inputIdField.value = selectedSampleVariantId;
        }
    }

    updateTitle(target, cardProduct) {
        const productTitleEls = cardProduct.querySelectorAll("[js-product-title]");
        const productTitle = target.getAttribute("data-product-title");

        productTitleEls.forEach( el => el.innerText = productTitle)
    }

    updatePrice(target, cardProduct) {
        const regularPriceEls = cardProduct.querySelectorAll("[js-regular-price]");
        const comparePriceEls = cardProduct.querySelectorAll("[js-compare-price]");

        const regularPrice = target.getAttribute("data-regular-price");
        const comparePrice = target.getAttribute("data-compare-price");

        regularPriceEls.forEach(regularPriceEl => regularPriceEl.innerText = regularPrice);
        comparePriceEls.forEach(comparePriceEl => comparePriceEl ? comparePriceEl.innerText = comparePrice : null);
    }

    updateHandle(target, cardProduct) {
        const frameButtons = cardProduct.querySelectorAll("frame-button");
        const handle = target.getAttribute("data-product-handle");

        frameButtons.forEach( el => el.setAttribute("data-product-handle", handle));
    }

    updateButtonLabel(target, cardProduct) {
        const productBtns = cardProduct.querySelectorAll("[js-product-btn]");
        const sampleAtcBtns = cardProduct.querySelectorAll("[js-sample-atc-btn]");
        const selectFrameBtns = cardProduct.querySelectorAll("[js-select-frame-btn]");
        const sampleBtnLabel = target.getAttribute("data-product-sample-btn-text");
        const doneBtn = document.querySelector("[js-done-btn]");

        const available = target.getAttribute("data-product-available") === "true";
        const sampleProductavailable = target.getAttribute("data-sample-product-available") === "true";

        productBtns?.forEach( btn => {
            if(available) {
                btn.textContent = "shop now";
                btn.classList.remove("disabled");
            }else {
                btn.textContent = "sold out";
                btn.classList.add("disabled");
            }
        });

        sampleAtcBtns?.forEach( btn => {
            if(sampleProductavailable) {
                btn.removeAttribute('disabled');
                btn.querySelector("span").textContent = sampleBtnLabel;
            }else {
                btn.setAttribute('disabled', 'disabled');
                btn.querySelector("span").textContent = "Sample - Sold out";
            }
        });

        selectFrameBtns?.forEach( btn => {
            if(available) {
                btn.classList.remove("disabled");
                btn.textContent = "Select frame";
            }else {
                btn.classList.add("disabled");
                btn.textContent = "Sold out";
            }
        });

        if(cardProduct.querySelector("[js-select-frame-btn].is-selected")) {
            available && doneBtn ? doneBtn.classList.remove("disabled") : doneBtn.classList.add("disabled")
        }
    }
}

customElements.define('product-swatches', ProductSwatches);