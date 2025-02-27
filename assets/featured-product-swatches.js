class FeaturedProductStitcher extends HTMLElement {
    constructor() {
        super();

        this.featureProductEl = document.querySelector("[js-featured-product]");
        this.sectionId = this.featureProductEl.getAttribute("data-section-id");

        this.tabItems = this.querySelectorAll("[js-tab-item]");
        this.tabPanels = this.querySelectorAll("[js-tab-panel]");
        this.filterItems = this.querySelectorAll("[js-filter-item]");
        this.swatchItems = this.querySelectorAll("[js-swatch-item]");
        this.seeMoreBtns = this.querySelectorAll("[js-see-more-btn]");

        this.swatchesToShow = 16;

        this.init();
    }

    init() {
        this.tabItems.forEach( swatchItem => swatchItem.addEventListener("click", this.toggleTab.bind(this)));
        this.filterItems.forEach( filterItem => filterItem.addEventListener("click", this.handleFilters.bind(this)));
        this.swatchItems.forEach( swatchItem => swatchItem.addEventListener("click", this.handleAjaxFraming.bind(this)));
        this.seeMoreBtns.forEach( btn => btn.addEventListener("click", this.handleSeeMore.bind(this)));

        this.activeTabPanel = this.querySelector("[js-tab-panel].is-active");

        this.initFilterSlider();
    }

    initFilterSlider() {
        new Swiper('[js-filters-slider]', {
            spaceBetween: 4,
            slidesPerView: 'auto',
            watchSlidesProgress: true,
            freeMode: true,
            draggable:!0,
            autoHeight:!1,
            watchOverflow:!0,
            threshold:10,
            mousewheel:{
              forceToAxis:!0
            },
            freeMode:!0,
        })
    }

    updateState(list, target, cls) {
        list.forEach(item => item.classList.remove(cls));
        target.classList.add(cls)
    }

    toggleTab({ currentTarget }) {
        this.activetabId = currentTarget.getAttribute("data-tab-id");
        const currentTabPanel = this.querySelector(`#${this.activetabId}`);

        this.updateState(this.tabItems, currentTarget, "is-active");
        this.updateState(this.tabPanels, currentTabPanel, "is-active");

        this.activeTabPanel = currentTabPanel;
        const seeMoreBtn = this.activeTabPanel.querySelector("[js-see-more-btn]");

        const filterValue = this.activeTabPanel.querySelector("[js-filter-item].is-selected").getAttribute('data-filter-value')
        filterValue === "all" ? seeMoreBtn.classList.remove("hidden") : seeMoreBtn.classList.add("hidden");

        const targetSwatch = this.activeTabPanel.querySelector("[js-swatch-item].is-selected");
        const handle = targetSwatch.getAttribute("data-product-handle");

        this.renderAjaxProduct(handle);
    }

    
    handleFilters({ currentTarget }) {
        const filterValue = currentTarget.getAttribute('data-filter-value');
        const filtersList = this.activeTabPanel.querySelectorAll("[js-filter-item]");
        const seeMoreBtn = this.activeTabPanel.querySelector("[js-see-more-btn]");

        this.updateState(filtersList, currentTarget, "is-selected");
        
        const frameSwatches = this.activeTabPanel.querySelectorAll("[js-swatch-item]");
        frameSwatches.forEach((swatch, index) => {
            if( filterValue === "all") {
                index < this.swatchesToShow ? swatch.classList.remove("hidden") : swatch.classList.add("hidden");
            }else {
                swatch.classList.add("hidden");
            }

            swatch.classList.remove("is-selected")
        });

        const filterSwatches = this.activeTabPanel.querySelectorAll(`[js-swatch-item][data-value="${ filterValue}"]`);
        filterSwatches?.forEach( el => el.classList.remove("hidden"));

         filterValue === "all" ? seeMoreBtn.classList.remove("hidden") : seeMoreBtn.classList.add("hidden");

        const targetSwatch = this.activeTabPanel.querySelector("[js-swatch-item]:not(.hidden)");
        targetSwatch.classList.add("is-selected");
        
        const handle = targetSwatch.getAttribute("data-product-handle");

        this.renderAjaxProduct(handle);
    }

    handleAjaxFraming({ currentTarget }) {
        this.selectedSwatch = currentTarget;
        this.selectedProductHandle = currentTarget.getAttribute('data-product-handle');
        const swatchList = this.activeTabPanel.querySelectorAll("[js-swatch-item]");
        const handle = currentTarget.getAttribute("data-product-handle");

        this.updateState(swatchList, currentTarget, "is-selected");
        this.renderAjaxProduct(handle);
    }

    handleSeeMore({ currentTarget }) {
        const swatches = this.activeTabPanel.querySelectorAll("[js-swatch-item]");
        currentTarget.classList.toggle("has-visibility");

        if (currentTarget.classList.contains("has-visibility")) {
            swatches.forEach(swatch => swatch.classList.remove("hidden"));
            currentTarget.textContent = "See less";
        } else {
            this.updateSwatchVisibility(swatches);
            currentTarget.textContent = "See more";
        }
    }

    updateSwatchVisibility(swatches) {
        swatches.forEach((swatch, index) => {
            if (index < this.swatchesToShow) {
                swatch.classList.remove("hidden");
            } else {
                swatch.classList.add("hidden");
            }
        });
    }

    updateLoading() {
        this.featureProductEl.classList.toggle("is-loading");
    }

    renderAjaxProduct(handle) {
        const url = `/products/${handle}?section_id=${this.sectionId}`;

        this.updateLoading();
        fetch(url)
        .then(response => response.text())
        .then(html => {
            const ajaxContainer = new DOMParser()
                .parseFromString(html, 'text/html')
                .querySelector("[js-featured-product]");

            if (ajaxContainer) {
                this.handleCurrentData(ajaxContainer);
                this.featureProductEl.outerHTML = ajaxContainer.outerHTML;
                AOS.init()
            }

            this.updateLoading();
        })
        .catch(err => {
            console.log(err)
        })
    }

    handleCurrentData(ajaxContainer) {
        const activeTabId = this.querySelector("[js-tab-item].is-active").getAttribute("data-tab-id");
        let activeValueForColors;
        let activeValueForStyles;
        let activeProductForColors;
        let activeProductForStyles;

        this.tabPanels.forEach( panel => {
            if (panel.id === "Tab-Colors") {
                activeValueForColors = panel.querySelector("[js-filter-item].is-selected").getAttribute("data-filter-value");
                activeProductForColors = panel.querySelector("[js-swatch-item].is-selected").getAttribute("data-product-handle");
            }else if(panel.id === "Tab-Styles") {
                activeValueForStyles = panel.querySelector("[js-filter-item].is-selected").getAttribute("data-filter-value");
                activeProductForStyles = panel.querySelector("[js-swatch-item].is-selected").getAttribute("data-product-handle");
            }
        })

        ajaxContainer.querySelectorAll("[js-tab-item]").forEach( tabItem => tabItem.getAttribute("data-tab-id") === activeTabId ? tabItem.classList.add("is-active") : tabItem.classList.remove("is-active"));

        ajaxContainer.querySelectorAll("[js-tab-panel]").forEach( tabPanel => tabPanel.id === activeTabId ? tabPanel.classList.add("is-active") : tabPanel.classList.remove("is-active"));

        ajaxContainer.querySelectorAll("[js-tab-panel]").forEach( panel => {
            if (panel.id === "Tab-Colors") {
                const filterItems = panel.querySelectorAll("[js-filter-item]");
                const swatchItems = panel.querySelectorAll("[js-swatch-item]");
                const seeMoreBtn = panel.querySelector("[js-see-more-btn]");

                filterItems.forEach( item => item.classList.remove("is-selected"));
                swatchItems.forEach((swatch, index) => {
                    if(activeValueForColors === "all") {
                        index < this.swatchesToShow ? swatch.classList.remove("hidden") : swatch.classList.add("hidden");
                    }else {
                        swatch.classList.add("hidden");
                    }
        
                    swatch.classList.remove("is-selected")
                });

                const filterSwatches = panel.querySelectorAll(`[js-swatch-item][data-value="${activeValueForColors}"]`);
                filterSwatches?.forEach( el => el.classList.remove("hidden"));

                panel.querySelector(`[js-filter-item][data-filter-value="${activeValueForColors}"]`).classList.add("is-selected");
                panel.querySelector(`[js-swatch-item][data-product-handle="${activeProductForColors}"]`).classList.add("is-selected");

                activeValueForColors === "all" ? seeMoreBtn.classList.remove("hidden") : seeMoreBtn.classList.add("hidden")
            }else if(panel.id === "Tab-Styles") {
                const filterItems = panel.querySelectorAll("[js-filter-item]");
                const swatchItems = panel.querySelectorAll("[js-swatch-item]");
                const seeMoreBtn = panel.querySelector("[js-see-more-btn]");

                filterItems.forEach( item => item.classList.remove("is-selected"));
                swatchItems.forEach((swatch,index) => {
                    if(activeValueForStyles === "all") {
                        index < this.swatchesToShow ? swatch.classList.remove("hidden") : swatch.classList.add("hidden");
                    }else {
                        swatch.classList.add("hidden");
                    }
        
                    swatch.classList.remove("is-selected")
                });

                const filterSwatches = panel.querySelectorAll(`[js-swatch-item][data-value="${activeValueForStyles}"]`);
                filterSwatches?.forEach( el => el.classList.remove("hidden"));

                panel.querySelector(`[js-filter-item][data-filter-value="${activeValueForStyles}"]`).classList.add("is-selected");
                panel.querySelector(`[js-swatch-item][data-product-handle="${activeProductForStyles}"]`).classList.add("is-selected");

                activeValueForStyles === "all" ? seeMoreBtn.classList.remove("hidden") : seeMoreBtn.classList.add("hidden")
            }
        });
    }
}

customElements.define('featured-product-stitcher', FeaturedProductStitcher);