class FrameButton extends HTMLElement {
    constructor() {
        super();

        this.rootEl = document.documentElement;
        this.loadingSpinner = this.querySelector("[js-loading-spinner]");
        this.ajaxProductFraming = document.querySelector("ajax-product-framing");
        this.cartDrawer = document.querySelector("cart-drawer")
    }

    connectedCallback() {
        this.init();
    }

    init() {
        this.addEventListener("click", this.handleFraming.bind(this));
    };

    handleFraming({ currentTarget }) {
        const triggerId = currentTarget.getAttribute("data-trigger-id");

        if(currentTarget.getAttribute("data-mode") === "update") {
            localStorage.setItem("frame-mode", "update");
            localStorage.setItem("line-index", currentTarget.getAttribute("data-line-index"));
            localStorage.setItem("frame-trigger-step", currentTarget.getAttribute("data-trigger-step"));
            localStorage.setItem("line-quantity", currentTarget.getAttribute("data-line-quantity"));
            localStorage.setItem("line-oversized", currentTarget.getAttribute("data-has-oversized"));
            localStorage.setItem("line-oversized-quantity", currentTarget.getAttribute("data-oversized-line-item-quantity"));
            localStorage.setItem("line-size-value", currentTarget.getAttribute("data-line-size-value"));

            const currentItem = currentTarget.closest('[js-cart-item]');
            const { _width, _width_fraction, _height, _height_fraction, _clearance_top, _clearance_right, _clearance_bottom, _clearance_left, _clips_channels_top, _clips_channels_right, _clips_channels_bottom, _clips_channels_left, _edges_align } = JSON.parse(currentItem.querySelector("[js-properties-json]").textContent);

            localStorage.setItem("variant-name", currentTarget.getAttribute("data-line-size-value"));
            localStorage.setItem("width-parameter", _width);
            localStorage.setItem("width-fraction-parameter", _width_fraction);
            localStorage.setItem("height-parameter", _height);
            localStorage.setItem("height-fraction-parameter", _height_fraction);
            localStorage.setItem("top-space-parameter", _clearance_top);
            localStorage.setItem("right-space-parameter", _clearance_right);
            localStorage.setItem("bottom-space-parameter", _clearance_bottom);
            localStorage.setItem("left-space-parameter", _clearance_left);
            localStorage.setItem("clip-top", _clips_channels_top);
            localStorage.setItem("clip-right", _clips_channels_right);
            localStorage.setItem("clip-bottom", _clips_channels_bottom);
            localStorage.setItem("clip-left", _clips_channels_left);
            localStorage.setItem("edges-parameter", _edges_align);
        };

        if(this.getAttribute("is") === "product") {
            this.openModel(this.getAttribute("is"), triggerId);
            return;
        };

        const handle = this.getAttribute("data-product-handle");
        this.updateLoading();
        this.renderFraming(handle, this.getAttribute("data-frame-type"), triggerId);
    }

    openModel(type, triggerBy) {
        this.frameModel = type === "product" ? document.querySelector("frame-model") : document.querySelector("ajax-product-framing frame-model");

        type === "product" ? this.frameModel.setAttribute("data-type", "product") : this.frameModel.setAttribute("data-type", "index");

        this.frameModel.setAttribute("data-trigger-by", triggerBy);

        this.initVideo()
        this.frameModel.classList.add("is-open");
        this.cartDrawer.close();
        this.rootEl.classList.add("lock-scroll");
    }

    initVideo() {
        const currentStep = this.frameModel.querySelector("[js-dimension-step][data-step='1']");
        if(!currentStep) return;

        const video = currentStep.querySelector("[js-sample-video]");
        video?.play();
    }

    closeModel() {
        document.querySelector("frame-model.is-open")?.classList.remove("is-open");
        this.rootEl.classList.remove("lock-scroll");
        this.loadingSpinner?.classList.add("hidden");
    }

    updateLoading() {
        this.loadingSpinner?.classList.toggle("hidden");
    }

    renderFraming(handle, frameType, triggerId, loadingEl, activeHandles, tabId, filterValue) {
        const url = `/products/${handle}?section_id=product-framing`;
        loadingEl?.classList.add("is-loading");

        fetch(url)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const ajaxProductInfo = doc.querySelector("product-info");

            if(localStorage.getItem("frame-mode") === "update") {
                const frameModel = ajaxProductInfo.querySelector("frame-model");
                frameModel.setAttribute("data-mode", "update");
                frameModel.setAttribute("data-has-oversized", localStorage.getItem("line-oversized"));
                ajaxProductInfo.querySelector("[is='last-step']")?.querySelector("[js-edit-frame-btn]")?.remove();
            };

            triggerId === "build-frame" ? this.updateBuildFrame(ajaxProductInfo, frameType, triggerId, activeHandles, tabId, filterValue) : null; 
            this.ajaxProductFraming.innerHTML = ajaxProductInfo.outerHTML;
            document.dispatchEvent(new CustomEvent("product-assets:init"));

            const sizeFieldset = this.ajaxProductFraming.querySelector("[js-size-fieldset]");
            const selectedSize = sizeFieldset.querySelector(`input[value="${localStorage.getItem("variant-name")}" i]`);
            selectedSize?.click();

            this.updateLoading();
            this.openModel(frameType, triggerId);
        })
    }

    updateBuildFrame(ajaxContent, frameType, triggerId, activeHandles, tabId, filterValues) {
        const frameModel = ajaxContent.querySelector("frame-model");
        const frameSteps = frameModel.querySelectorAll("[js-frame-step]");
        const editSize = frameModel.querySelectorAll("[js-edit-size]");
        const progressMeter = frameModel.querySelector("[js-steps-progress-meter]");
        const stepsCounter = frameModel.querySelector("[js-steps-counter]");
        const ajaxBuildMyFrame = ajaxContent.querySelector("[js-ajax-build-my-frame]");
        const tabItems = ajaxBuildMyFrame.querySelectorAll("[js-frame-tab]");
        const tabPanels = ajaxBuildMyFrame.querySelectorAll("[js-tab-panel]");
        const dynamicSkipBtn = frameModel.querySelector("[js-dynamic-skip-btn]");

        frameModel.setAttribute("data-type", frameType);
        frameModel.setAttribute("data-trigger-by", triggerId);

        if(tabId) {
            tabItems.forEach( tabItem => tabItem.getAttribute("data-tab-id") === tabId ? tabItem.classList.add("is-active") : tabItem.classList.remove("is-active"));
            tabPanels.forEach( tabPanel => tabPanel.getAttribute("id") === tabId ? tabPanel.classList.add("is-active") : tabPanel.classList.remove("is-active"));
        }

        if(filterValues?.length && activeHandles?.length) {
            tabPanels.forEach( (tabPanel, index) => {
                const fitlerItems = tabPanel.querySelectorAll("[js-filter-item]");
                const frameSwatches = tabPanel.querySelectorAll("[js-swatch-item]");
                fitlerItems.forEach( filterItem => {
                    if(filterItem.getAttribute("data-filter-value") === filterValues[index]) {
                        filterItem.classList.add("is-selected");
                    }else {
                        filterItem.classList.remove("is-selected");
                    }
                });
                
                frameSwatches.forEach( swatch => {
                    if(swatch.getAttribute("data-product-handle") === activeHandles[index]) {
                        swatch.classList.add("is-selected");
                    }else {
                        swatch.classList.remove("is-selected");
                    }

                    if(filterValues[index] === "all") {
                        swatch.classList.remove("hidden");
                    }else {
                        if(swatch.getAttribute("data-value") === filterValues[index]) {
                            swatch.classList.remove("hidden");
                        }
                        else {
                            swatch.classList.add("hidden");
                        }
                    }
                })
            })
        }

        frameSteps.forEach( (frameStep, index) => {
            if(index === 0) {
                frameStep.classList.add("is-active");
                frameStep.classList.add("is-init");
                frameStep.innerHTML = ajaxBuildMyFrame.innerHTML;
            }else {
                frameStep.classList.remove("is-active");
            }
            
            frameStep.setAttribute('data-step', parseInt(frameStep.getAttribute('data-step')) + 1)
        });
        editSize.forEach(el => el.setAttribute('data-trigger-step', parseInt(el.getAttribute('data-trigger-step')) + 1));
        frameModel.querySelectorAll("[js-skip-btn]").forEach( el => el.setAttribute("data-trigger-step", 4));

        if(frameModel.getAttribute("data-user-type") === "r") {
            progressMeter.setAttribute("data-default-progress", 12.5);
            stepsCounter.setAttribute("data-total-steps", 8);
            stepsCounter.textContent = "1/8";
            dynamicSkipBtn.setAttribute("data-trigger-step", 2)
        }else {
            progressMeter.setAttribute("data-default-progress", 16.66);
            stepsCounter.setAttribute("data-total-steps", 6);
            stepsCounter.textContent = "1/6";
        }
    }
}

customElements.define('frame-button', FrameButton);