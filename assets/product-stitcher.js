class ProductStitcher extends HTMLElement {
    constructor() {
        super();

        this.selectors = {
            productInfo: "product-info",
            productDetailsAccordions: "[js-product-details-accordions-section]",
            productTabsStudio: "[js-product-tabs-studio]",
            productFaqsAccordionList: "[js-faqs-accordion-list]",
            productReviews: "[js-product-reviews]",
            metaCompare: "[js-product-meta-compare]",
            relatedProducts: "[js-related-products]",
            stitcherItem: "[js-stitcher-item]"
        };

        this.sections = {
            mainProduct: { 
                element: document.querySelector(this.selectors.productInfo), 
                selector: this.selectors.productInfo, 
                initEvents: ["product-page-script:init", "accordion:init"] 
            },
            productDetailsAccordions: { 
                element: document.querySelector(this.selectors.productDetailsAccordions), 
                selector: this.selectors.productDetailsAccordions, 
            },
            productTabsStudio: { 
                element: document.querySelector(this.selectors.productTabsStudio), 
                selector: this.selectors.productTabsStudio,
                initEvents: ["tabs:init", "product-tabs-studio-slider", "twenty-twenty:init"]  
            },
            productFaqsAccordionList: { 
                element: document.querySelector(this.selectors.productFaqsAccordionList), 
                selector: this.selectors.productFaqsAccordionList
            },
            productReviews: { 
                element: document.querySelector(this.selectors.productReviews), 
                selector: this.selectors.productReviews 
            },
            metaCompare: { 
                element: document.querySelector(this.selectors.metaCompare), 
                selector: this.selectors.metaCompare,
                initEvents: ["product-meta-compare-slider:init"] 
            },
            relatedProducts: { 
                element: document.querySelector(this.selectors.relatedProducts), 
                selector: this.selectors.relatedProducts 
            }
        };

        this.stitcherItems = this.querySelectorAll(this.selectors.stitcherItem);

        this.init();
    }

    init() {
        this.stitcherItems.forEach(stitcherItem =>
            stitcherItem.addEventListener("click", this.renderSectionFromFetch.bind(this))
        );
    }

    renderSectionFromFetch(evt) {
        evt.preventDefault();
        const { currentTarget } = evt;
        const handle = currentTarget.getAttribute("data-product-handle");

        this.updateLoading();

        const fetchPromises = Object.values(this.sections).map(({ element, selector, initEvents = [] }) => {
            return element ? this.renderSection(handle, element, selector, ...initEvents) : Promise.resolve();
        });

        Promise.all(fetchPromises).then(() => {
            setTimeout(() => {
                AOS.refreshHard();
            }, 100);
        });
    }

    updateURLHash(handle) {
        const url = `/products/${handle}`;
        window.history.replaceState({}, '', url);
    }

    updateLoading() {
        this.sections.mainProduct.element.classList.add("section--loading");
    }

    renderSection(handle, container, selector, ...initEvents) {
        const url = `/products/${handle}?section_id=${container.getAttribute("data-section")}`;
        return this.ajaxSection(url, handle, container, selector, initEvents);
    }

    ajaxSection(url, handle, container, selector, initEvents = []) {
        return fetch(url)
            .then(response => response.text())
            .then(html => {
                const ajaxContainer = new DOMParser()
                    .parseFromString(html, 'text/html')
                    .querySelector(selector);

                if (ajaxContainer) {
                    if (selector === this.selectors.productInfo) {
                        container.outerHTML = ajaxContainer.outerHTML;
                    } else {
                        container.innerHTML = ajaxContainer.innerHTML;
                    }
                }

                initEvents.forEach(eventName => document.dispatchEvent(new CustomEvent(eventName)));

                if (selector === this.selectors.productInfo && ajaxContainer.querySelector("#esc-oos-form")) {
                    initEscOosApp();
                }
                if (selector === this.selectors.productReviews) {
                    okeWidgetApi.initAllWidgets();
                }

                this.updateURLHash(handle);
            })
            .catch(err => {
                console.log(err);
            });
    }
}

customElements.define('product-stitcher', ProductStitcher);