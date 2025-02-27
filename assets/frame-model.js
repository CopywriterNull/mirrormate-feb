class FrameModel extends HTMLElement {
    constructor() {
        super();

        this.frameButton = document.querySelector("frame-button");
        this.closeModelBtn = this.querySelector("[js-close-btn]");
        this.backBtn = this.querySelector("[js-back-btn]");
        this.stepsProgressMeter = this.querySelector("[js-steps-progress-meter]");
        this.stepsCounter = this.querySelector("[js-steps-counter]");
        this.manualMeasurement = this.querySelector("[js-manual-measurement]");
        this.measurementLater = this.querySelector("[js-measurement-later]");
        this.spaceAround = this.querySelector("[js-space-around]");
        this.clips = this.querySelector("[js-clips]");
        this.frameSize = this.querySelector("[js-frame-size]");
        this.edgesAlign = this.querySelector("[js-edges-align]");
        this.sizeTitle = this.querySelector("[js-size-title]");
        this.productForm = document.querySelector(`#${this.getAttribute("data-form-id")}`);
        this.sizeRangeJson = this.querySelector("#SizeRangeJson");
        this.sizeRange = this.sizeRangeJson ? JSON.parse(this.sizeRangeJson.textContent) : null;
        this.mediaGallery = this.querySelector("[js-media-gallery]");
        this.selectedOptionEl = this.querySelector("[js-selected-option]");
        this.measurementRuleModel = this.querySelector("#Measurement-Rule-Model");
        this.diagonalModel = this.querySelector("#Diagonal-Model");
        this.spaceDimensionModel = this.querySelector("#Space-Dimension-Model");
        this.buildMyFrameStep = this.querySelector("[js-build-my-frame-step]");
        this.oversizedProductField = this.querySelector("[js-oversized-product-field]");
        this.shippingDimensionsField = this.querySelector("[js-shipping-dimensions-field]");
        this.shippingDimensionsFieldB2B = this.querySelector("[js-shipping-dimensions-b2b-field]");
        this.locationTopField = this.querySelector("[js-location-top-field");
        this.locationBottomField = this.querySelector("[js-location-bottom-field");
        this.locationLeftField = this.querySelector("[js-location-left-field");
        this.locationRightField = this.querySelector("[js-location-right-field");
        this.edgesNilField = this.querySelector("[js-edges-nil-field");
        this.dimensionParameterReview = this.querySelector("[js-dimension-parameter-review]");
        this.measurementLaterReview = this.querySelector("[js-measurement-later-review]");
        this.clipsStep = this.querySelector("[js-channels-step]");
        this.edgesStep = this.querySelector("[js-edges-step]");
        this.frameWidthField = this.querySelector("[js-frame-width-field");
        this.frameWidthFractionField = this.querySelector("[js-frame-width-fraction-field");
        this.frameHeightField = this.querySelector("[js-frame-height-field]");
        this.frameHeightFractionField = this.querySelector("[js-frame-height-fraction-field");
        this.variantsJson = JSON.parse(this.querySelector("#VariantsJSON").textContent);
        this.ajaxProductFraming = document.querySelector("ajax-product-framing");

        this.editFrameBtn = this.querySelectorAll("[js-edit-frame-btn]");
        this.frameSteps = this.querySelectorAll("[js-frame-step]");
        this.sampleVideos = this.querySelectorAll("[js-sample-video]");
        this.parameters = this.querySelectorAll("[js-parameter]");
        this.parameterSelects = this.querySelectorAll("[js-parameter-option]");
        this.clipParameters = this.querySelectorAll("[js-clip-field]");
        this.clipFields = this.querySelectorAll("[js-clip-input-field]");
        this.continueBtns = this.querySelectorAll("[js-continue-btn]");
        this.muteBtns = this.querySelectorAll("[js-mute-btn]");
        this.edgeParameters = this.querySelectorAll("[js-edge-parameter]");
        this.accordionHeaders = this.querySelectorAll("[js-accordion-header]");
        this.mirrorSize = this.querySelectorAll("[js-mirror-size]");
        this.editSizeEls = this.querySelectorAll("[js-edit-size]");
        this.skipBtns = this.querySelectorAll("[js-skip-btn]");
        this.triggerBtns = this.querySelectorAll("[js-trigger-btn]");
        this.closeTriggerBtns = this.querySelectorAll("[js-trigger-close]");
        this.overlayEls = this.querySelectorAll("[js-overlay]");
        this.resetBtns = this.querySelectorAll("[js-reset-btn]");
        this.swatchItems = this.querySelectorAll("[js-swatch-item]");
        this.frameTabs = this.querySelectorAll("[js-frame-tab]");
        this.frameTabPanels = this.querySelectorAll("[js-tab-panel]");
        this.fitlerItems = this.querySelectorAll("[js-filter-item]");
        this.optionItems = this.querySelectorAll("[js-option-item]");
        this.oversizedPrice = this.querySelectorAll("[js-oversized-price]");
        this.skipMeasurmentBtns = this.querySelectorAll("[js-skip-measurement-btn]");

        this.closeModel = this.frameButton.closeModel.bind(this.frameButton);
        this.renderAjaxFraming = this.frameButton.renderFraming.bind(this.frameButton);
        this.defaultProgress = parseFloat(this.stepsProgressMeter.getAttribute("data-default-progress"));
        this.totalSteps = this.stepsCounter.getAttribute("data-total-steps");

        this.step = 1;
    }

    connectedCallback() {
        this.init();
        this.initMediaGallery();
        this.handleCacheData();
        document.dispatchEvent(new CustomEvent("accordion:init"));
        document.dispatchEvent(new CustomEvent("shipping-date:init"));
    }

    init() {
        this.closeModelBtn.addEventListener("click", this.handleCloseModel.bind(this));
        this.backBtn.addEventListener("click", () => {
            let step = this.isLastStep && this.edgesStep.classList.contains("hidden") ? this.step - 2 : this.step - 1;
            step = this.isLastStep && this.clipsStep.classList.contains("hidden") ? this.step - 3 : step;

            this.frameSteps.forEach( frameStep => frameStep.classList.remove("is-edit"));
            this.isLastStep ? this.updateStep('downgrading', step) : this.updateStep('downgrading');
        });
        this.manualMeasurement?.addEventListener("click", () => this.updateStep('upgrading'));
        this.measurementLater?.addEventListener("click", () => this.handleMeasurementLater());
        
        this.editFrameBtn.forEach( editBtn => editBtn.addEventListener('click', this.handleEditFrame.bind(this)));
        this.parameterSelects.forEach( parameterSelect => parameterSelect.addEventListener('change', this.handleDimension.bind(this)));
        this.clipFields.forEach( clipField => clipField.addEventListener('change', this.handleClips.bind(this)));
        this.continueBtns.forEach( continueBtn => continueBtn.addEventListener('click', () => this.updateStep('upgrading')));
        this.muteBtns.forEach( muteBtn => muteBtn.addEventListener('click', this.handleMute.bind(this)));
        this.edgeParameters.forEach( edgeParameter => edgeParameter.addEventListener('click', ({ currentTarget }) => {
            const field = currentTarget.querySelector("input");
            field.checked = true;
            localStorage.setItem("edges-parameter", field.value);

            this.edgeParameters.forEach( el => el.classList.remove("is-checked"));
            currentTarget.classList.add("is-checked");

            this.removeMeasurementLater();
            this.updateStep('upgrading');
        }));
        this.editSizeEls.forEach( editSizeEl => editSizeEl.addEventListener('click', ({ currentTarget }) => {
            const step = parseInt(currentTarget.getAttribute("data-trigger-step"));
            const status = currentTarget.classList.contains("is-edit-measurement-btn") ? "upgrading" : "edit";

            this.updateStep('upgrading', step, status);
        }));
        this.accordionHeaders.forEach( accordionHeader => accordionHeader.addEventListener('click', this.handleAccordion.bind(this)));
        this.skipBtns.forEach( skipBtn => skipBtn.addEventListener('click', ({ currentTarget }) =>  this.updateStep('upgrading', parseInt(currentTarget.getAttribute("data-trigger-step")), "skip")));
        this.triggerBtns.forEach( triggerBtn => triggerBtn.addEventListener('click', this.open.bind(this)));
        this.closeTriggerBtns.forEach( closeTriggerBtn => closeTriggerBtn.addEventListener('click', this.close.bind(this)));
        this.overlayEls.forEach( overlayEl => overlayEl.addEventListener('click', this.close.bind(this)));
        this.resetBtns.forEach( resetBtn =>  resetBtn.addEventListener("click", this.resetFrame.bind(this)));
        this.swatchItems.forEach( swatchItem => swatchItem.addEventListener("click", this.handleAjaxFraming.bind(this)));
        this.frameTabs.forEach( swatchItem => swatchItem.addEventListener("click", this.handleFrameTab.bind(this)));
        this.fitlerItems.forEach( filterItem => filterItem.addEventListener("click", this.handleFilters.bind(this)));
        this.optionItems?.forEach( optionItem => optionItem.addEventListener("click", this.handleOption.bind(this)));
        this.skipMeasurmentBtns?.forEach( skipMeasurmentBtn => skipMeasurmentBtn.addEventListener("click", this.handleSkipMeasurement.bind(this)));

        this.currentStep = this.querySelector("[js-frame-step][data-step='1']");
        this.activeTabPanel = this.currentStep.querySelector("[js-tab-panel].is-active");
        this.frameTriggerBy = this.getAttribute("data-trigger-by");
        this.LFArray = [10, 15, 20, 25, 30, 35, 40, 45];
        
        this.initSizeOptions();
        this.handleUserType();
        this.handleVariantByUser();
        document.addEventListener('size-options:init', this.initSizeOptions.bind(this));
    }

    handleUserType() {
        const userTypes = {
            'r': 'Retail',
            'b': 'Base',
            'v': 'Value',
            'g': 'Gold',
            's': 'Silver'
        };

        this.userType = this.getAttribute("data-user-type");
        if (this.userType == '' || this.userType == '-' || this.userType == 'none') {
            this.userType = "r";
        }
        this.userType = userTypes[this.userType] || this.userType;
    }

    handleVariantByUser() {
        this.productInfo = this.getAttribute("data-type") === "product" ? document.querySelector("product-info") : document.querySelector("ajax-product-framing product-info");

        const width = localStorage.getItem("width-parameter") ? parseInt(localStorage.getItem("width-parameter")) : 0;
        const height = localStorage.getItem("height-parameter") ? parseInt(localStorage.getItem("height-parameter")) : 0;

        const sizeFieldset = this.productInfo.querySelector("[js-size-fieldset]");
        const priceFieldset = this.productInfo.querySelector("[js-price-fieldset]");
        if(!sizeFieldset) return;

        let size;
        if(this.userType === "Retail") {
            size = localStorage.getItem("variant-name") || "Powder Room";
            if(localStorage.getItem("width-parameter") || localStorage.getItem("height-parameter")) {
                const value = Math.max(width, height);
                const relevantSize = this.getSizeOnRange(width) || this.sizeRange.at(-1);
                size = relevantSize?.name;

                if(!this.getSizeOnRange(width)) {
                    if(parseInt(localStorage.getItem("width-parameter")) === value) {
                        const widthField = this.querySelector("[data-name='properties[_width]']");
                        const maxValue = widthField.options[widthField.options.length - 1].value;
                        widthField.value = maxValue;

                        localStorage.setItem("width-parameter", maxValue);
                    }else {
                        const heightField = this.querySelector("[data-name='properties[_height]']");
                        const maxValue = heightField.options[heightField.options.length - 1].value;
                        heightField.value = maxValue;

                        localStorage.setItem("height-parameter", maxValue);
                    }
                }
            };
        }else {
            size = "10LF";
            if(localStorage.getItem("width-parameter") || localStorage.getItem("height-parameter")) {
                size = `${this.getLF(width, height)}LF`;
            };
        };

        const isOversized = Math.max(width, height) >= 90;

        const shippingAttrValue = this.userType === "Retail" ? size : Math.max(width, height);

        this.handleShippingDimensionsField(shippingAttrValue, size);
        this.handleOverSized(isOversized);

        const selectedSize = sizeFieldset.querySelector(`input[value='${size}' i]`);
        const priceOption = priceFieldset?.querySelector(`input[value='${this.userType}' i]`);

        priceOption?.checked ? priceOption?.dispatchEvent(new Event('change', { bubbles: true })) : priceOption?.click();
        setTimeout(function() {
            selectedSize?.checked ? selectedSize?.dispatchEvent(new Event('change', { bubbles: true })) : selectedSize?.click();
        }, 3000);

        localStorage.setItem("variant-name", size);
    }

    handleShippingDimensionsField(value = "", size = "") {
        this.shippingDimensionsField.value = "1";

        if(this.userType == "Retail") {
            this.shippingDimensionsField.name = `properties[_${size.toLowerCase().replace(/\s+/g, '_')}]`;
            this.shippingDimensionsField.setAttribute("data-name", `properties[_${size.toLowerCase().replace(/\s+/g, '_')}]`);
            this.shippingDimensionsField.setAttribute("data-oversize-name", `items[0][properties][_${size.toLowerCase().replace(/\s+/g, '_')}]`);
        }else {
            const key = this.getRange(value);

            this.shippingDimensionsField.name = `properties[${key}]`;
            this.shippingDimensionsField.setAttribute("data-name", `properties[${key}]`);
            this.shippingDimensionsField.setAttribute("data-oversize-name", `items[0][properties][${key}]`);

            this.shippingDimensionsFieldB2B.value = value;
        }
    }

    getRange(dimension) {
        if (dimension >= 0 && dimension <= 48) {
            return "_0_48";
        } else if (dimension >= 49 && dimension <= 60) {
            return "_49_60";
        } else if (dimension >= 61 && dimension <= 90) {
            return "_61_90";
        } else if (dimension >= 91) {
            return "_91+";
        }
    }

    handleEditFrame({ currentTarget }) {
        const isEditCard = currentTarget.getAttribute("is") === "edit-card";
        this.enableBuildMyFrameStep(isEditCard);
    }

    initSizeOptions() {
        this.sizeOptions = this.querySelectorAll("[js-size-option]");
        if(!this.sizeOptions.length) return;

        if(!this.querySelector("[js-size-option]").classList.contains("event-init")) {
            this.sizeOptions.forEach( sizeOption => sizeOption.addEventListener("click", this.handleSizeOption.bind(this)));
            this.querySelector("[js-size-option]").classList.add("event-init");
        }
    }

    handleSizeOption({ currentTarget }) {
        this.productInfo = this.getAttribute("data-type") === "product" ? document.querySelector("product-info") : document.querySelector("ajax-product-framing product-info");

        const sizeFieldset = this.productInfo.querySelector("[js-size-fieldset]");
        if(!sizeFieldset) return;

        this.classList.remove("is-initial");
        const valueId = currentTarget.getAttribute("data-option-value-id");
        const selectedSizeField = sizeFieldset.querySelector(`[data-option-value-id="${valueId}"]`);
        this.sizeOptions.forEach( el => el.classList.remove("is-checked"));
        currentTarget.classList.add("is-checked");
        localStorage.setItem("variant-name", currentTarget.getAttribute("data-option-value-name"));
        
        selectedSizeField?.checked ? selectedSizeField?.dispatchEvent(new Event('change', { bubbles: true })) : selectedSizeField?.click();

        this.updateStep("upgrading");
        this.userType === "Retail" ? this.handleSkinBtn() : null;

        const dimensionStep = this.querySelector("[js-dimension-step]");
        dimensionStep?.querySelectorAll("[js-parameter]")?.forEach( parameter => {
            parameter.classList.add("is-unselected");
            parameter.querySelector('[js-parameter-option]').options[0].selected = true;
        });
        dimensionStep?.querySelector("[js-continue-btn]")?.classList.add("disabled");
    }

    updateStep(behaviour, step, status, editCard = false) {
        const previousStep = this.querySelector("[js-frame-step].is-active");
        let currentStepIndex = parseInt(previousStep?.getAttribute("data-step"));

        if(localStorage.getItem("top-space-parameter") === "5/8" && localStorage.getItem("bottom-space-parameter") === "5/8" && localStorage.getItem("left-space-parameter") === "5/8" && localStorage.getItem("right-space-parameter") === "5/8") {
            this.clipsStep.classList.add("hidden");

            if(behaviour === "upgrading") currentStepIndex = this.totalSteps - 1;
        }else {
            this.clipsStep.classList.remove("hidden");
        };

        if(previousStep?.hasAttribute("js-channels-step") && this.edgesStep.classList.contains("hidden") && behaviour === "upgrading") currentStepIndex = this.totalSteps - 1;

        this.step = this.isLastStep ? step : previousStep?.classList.contains("is-edit") ? parseInt(this.totalSteps) : behaviour === "upgrading" ? currentStepIndex + 1 : currentStepIndex - 1;
        status === "reset" || status === "edit-frame" ? this.step = 1 : null;
        status === "line-item-edit" || status === "skip" || status === "later" ? this.step = step : null;

        if(status === "skip" && this.step >= 7) {
            this.handleMeasurementLater(false);
        }

        this.frameSteps.forEach( frameStep => frameStep.classList.remove("is-active"));
        this.currentStep = this.querySelector(`[js-frame-step][data-step="${this.step}"]`);
        this.currentStep.classList.add("is-active");
        (status === 'edit' || status === "edit-frame" || status === "line-item-edit") && !editCard ? this.currentStep.classList.add("is-edit") : null;
        this.isLastStep = this.currentStep.getAttribute("is") === "last-step";

        this.step === 1 ? this.backBtn.classList.add("disabled") : this.backBtn.classList.remove("disabled");

        if(this.currentStep.classList.contains("has-video")) {
            const video = this.currentStep.querySelector("[js-sample-video]");
            video?.play();
        }else {
            this.sampleVideos?.forEach( video => video.pause());
        }

        this.productInfo = this.getAttribute("data-type") === "product" ? document.querySelector("product-info") : document.querySelector("ajax-product-framing product-info");
        this.atcBtn = this.productInfo?.querySelector("[js-atc-btn]");

        this.updateScroll();
        this.updateStepProgressBar();
        this.updateStepMeter();
        this.isLastStep ? this.handleFrameDetails() : null;
        if(parseInt(this.querySelector("[data-parameter-name='bottom-space']").value)) {
            this.handleAlignedWithVanity();
        }
        if(localStorage.getItem("top-space-parameter") === "5/8" && localStorage.getItem("bottom-space-parameter") === "5/8" && localStorage.getItem("left-space-parameter") === "5/8" && localStorage.getItem("right-space-parameter") === "5/8") {
            this.handleClipsParameter();
        }

        if(this.userType === "Retail") {
            if(this.querySelector("[js-build-my-frame-step]")?.classList.contains("is-init") && parseInt(previousStep?.getAttribute("data-step")) === 2 && this.step === 3) {
                localStorage.setItem("retail-size",`${this.querySelector("[js-size-option].is-checked")?.getAttribute("data-option-value-name")}`);
            }else if(parseInt(previousStep?.getAttribute("data-step")) === 1 && this.step === 2) {
                localStorage.setItem("retail-size",`${this.querySelector("[js-size-option].is-checked")?.getAttribute("data-option-value-name")}`);
            }
        }
        this.stricklyCheckedVariant();
    }

    updateStepProgressBar() {
        this.stepsProgressMeter.style.width = this.isLastStep ? "100%" : `${this.defaultProgress * this.step}%`;
    }

    updateStepMeter() {
        this.stepsCounter.textContent = `${this.step}/${this.totalSteps}`;
    }

    updateScroll() {
        if(document.documentElement.clientWidth > 990) {
            const scrollEl = this.currentStep.querySelector("[data-scrollable]");
            scrollEl.scrollTo({
                top: 0,
                behaviour: "smooth"
            })
        }else {
            const scrollEl = this.querySelector("[data-scrollable]");
            scrollEl.scrollTo({
                top: 0,
                behaviour: "smooth"
            })
        }
    }

    checkSelection() {
        const parameterSelectEls = this.currentStep.querySelectorAll("[js-parameter-option]");
        const continueBtn = this.currentStep.querySelector("[js-continue-btn]");

        let unSelectedCount = 0;
        parameterSelectEls.forEach( option => {
            if(option.closest(".is-unselected")) {
                unSelectedCount += 1;
            }
        });

        unSelectedCount === 0 ? continueBtn?.classList.remove('disabled') : null;
        return unSelectedCount === 0 ? true : false;
    }

    handleDimension({ currentTarget }) {
        const parameter = currentTarget.closest("[js-parameter]");
        const isUnavailableSize = this.currentStep.querySelector("[js-unavailable-size]");

        parameter.classList.remove("is-unselected");
        this.classList.remove("is-initial");
        localStorage.setItem(`${currentTarget.getAttribute("data-parameter-name")}-parameter`, currentTarget.value);
        localStorage.setItem("is-measurement-later", false);

        isUnavailableSize ? null : this.checkSelection();

        const width = parseInt(this.querySelector("[data-name='properties[_width]']").value);
        const height = parseInt(this.querySelector("[data-name='properties[_height]']").value);

        let size;
        this.productInfo = this.closest("product-info");
        if(this.userType === "Retail") {
            const value = Math.max(width, height);
            const relevantSize = this.getSizeOnRange(width) || this.sizeRange.at(-1);
            size = relevantSize?.name;
            currentTarget.getAttribute("is") === "width-parameter" || currentTarget.getAttribute("is") === "height-parameter" ? this.matchSize(width) : null;
        }else {
            const LF = `${this.getLF(width, height)}LF`;
            const sizeFieldset = this.productInfo.querySelector("[js-size-fieldset]");
            const priceFieldset = this.productInfo.querySelector("[js-price-fieldset]");
            const selectedSizeField = sizeFieldset.querySelector(`input[value="${LF}" i]`);
            const priceOption = priceFieldset?.querySelector(`input[value='${this.userType}' i]`);

            localStorage.setItem("variant-name", selectedSizeField?.value);

            selectedSizeField?.checked ? selectedSizeField?.dispatchEvent(new Event('change', { bubbles: true })) : selectedSizeField?.click();
            setTimeout(() => {
                priceOption?.checked ? priceOption?.dispatchEvent(new Event('change', { bubbles: true })) : priceOption?.click();
            }, 3000)
        }

        const isOversized = Math.max(width, height) >= 90;
        const shippingAttrValue = this.userType === "Retail" ? size : Math.max(width, height);

        this.dimensionParameterReview.classList.remove("hidden");
        this.measurementLaterReview.classList.add("hidden");

        this.userType === "Retail" ? this.handleSkinBtn() : null;
        this.handleShippingDimensionsField(shippingAttrValue, size);
        this.handleOverSized(isOversized);
        this.checkDimension(width, height);
        if(this.currentStep.getAttribute("is") === "space-dimension-step") {
            let verticalFractionCount = 0;
            let horizontalFractionCount = 0;

            this.currentStep.querySelectorAll("[js-parameter-option]").forEach( select => {
                if((select.getAttribute("data-parameter-name").includes("top") || select.getAttribute("data-parameter-name").includes("bottom")) && eval(select.value) <= 0.5) {
                    verticalFractionCount += 1;
                }
                if((select.getAttribute("data-parameter-name").includes("left") || select.getAttribute("data-parameter-name").includes("right")) && eval(select.value) <= 0.5) {
                    horizontalFractionCount += 1;
                }
            });

            if(verticalFractionCount == 2 || horizontalFractionCount == 2) {
                this.triggerPrompt()
            }

            if(parseInt(this.querySelector("[data-parameter-name='bottom-space']").value) === 0) {
                this.edgesStep.classList.remove("hidden");
            }else {
                this.edgesStep.classList.add("hidden");
            }
        };
        this.removeMeasurementLater();
    }

    getLF(width, height) {
        const value = Number((((width * 2) + (height * 2)) / 12).toFixed(2));
        const LF = (value > 45) ? 45 : this.getNextHighestLF(value);
        return LF;
    }

    getNextHighestLF(value) {
        if (this.LFArray.indexOf(value) !== -1) {
            return value;
        } else {
            var i = this.LFArray.length;
            while (this.LFArray[--i] > value);
            return this.LFArray[++i];
        }
    }

    checkDimension(width, height) {
        if(this.currentStep.querySelector(".is-unselected")) return;

        if(height > width && !this.measurementRuleModel?.classList.contains("is-init")) {
            this.open({}, "Measurement-Rule-Model");
            this.measurementRuleModel?.classList.add("is-init");
        }

        if((width >= 100 || height >= 100) && !this.diagonalModel?.classList.contains("is-init")) {
            this.open({}, "Diagonal-Model");
            this.diagonalModel?.classList.add("is-init");
        }
    }

    triggerPrompt() {
        if(this.currentStep.querySelector(".is-unselected")) return;

        if(!this.spaceDimensionModel?.classList.contains("is-init")) {
            this.open({}, "Space-Dimension-Model");
            this.spaceDimensionModel?.classList.add("is-init");
        }
    }

    handleClips({ currentTarget }) {
        const field = currentTarget.closest("[js-clip-field]");
        const clipField = field.querySelector("input[type='hidden']");

        clipField.value = currentTarget.checked ? "Yes" : "No";
        localStorage.setItem(`clip-${currentTarget.getAttribute("data-clip")}`, currentTarget.checked ? "Yes" : "No");
        this.removeMeasurementLater();
    }

    handleOverSized(isOversized) {
        if(this.getAttribute("data-mode") === "update") {
            if(isOversized) {
                this.oversizedPrice.forEach( el => el.textContent = `+ ${this.oversizedProductField.getAttribute("data-oversized-price")} oversized fee`);
            }else {
                this.oversizedPrice.forEach( el => el.textContent = "");
            }
        }else {
            const formAttributeEls = this.querySelectorAll("[form]"); 
            const variantIdInput = this.querySelector("[name='id']") || this.querySelector("[name='items[0][id]']");

            if(isOversized) {
                this.oversizedProductField.removeAttribute("disabled");
                formAttributeEls.forEach( attributeEl => {
                    if(!attributeEl.hasAttribute("data-oversized-price")) {
                        attributeEl.setAttribute("name", attributeEl.getAttribute("data-oversize-name"))
                    }
                });
                variantIdInput.setAttribute("name", variantIdInput.getAttribute("data-oversize-name"));
    
                this.oversizedPrice.forEach( el => el.textContent = `+ ${this.oversizedProductField.getAttribute("data-oversized-price")} oversized fee`);
            }else {
                this.oversizedProductField.setAttribute("disabled", "disabled");
                formAttributeEls.forEach( attributeEl => {
                    if(!attributeEl.hasAttribute("data-oversized-price")) {
                        attributeEl.setAttribute("name", attributeEl.getAttribute("data-name"))
                    }
                });
                variantIdInput.setAttribute("name", variantIdInput.getAttribute("data-name"));
    
                this.oversizedPrice.forEach( el => el.textContent = "");
            }
        }
    }

    matchSize(value) {
        if(!value) return;

        const relevantSize = this.getSizeOnRange(value);
        
        const sizeFieldset = this.productInfo.querySelector("[js-size-fieldset]");
        const priceFieldset = this.productInfo.querySelector("[js-price-fieldset]");
        const selectedSizeField = sizeFieldset.querySelector(`[data-option-value-id="${relevantSize.id}"]`);
        const priceOption = priceFieldset?.querySelector(`input[value='${this.userType}' i]`);
        localStorage.setItem("variant-name", selectedSizeField?.value);
        
        selectedSizeField?.checked ? selectedSizeField?.dispatchEvent(new Event('change', { bubbles: true })) : selectedSizeField?.click();
        setTimeout(() => {
            priceOption?.checked ? priceOption?.dispatchEvent(new Event('change', { bubbles: true })) : priceOption?.click();
        }, 3000)
    }

    getSizeOnRange(value) {
        this.sizeRange = this.sizeRange.filter(item => item.range !== '');
        return this.sizeRange.find(size => {
            const range = size.range.split("-");
            const min = parseInt(range[0].trim());
            const max = parseInt(range[1].trim());

            if(value >= min && value <= max) {
                return size;
            }
        });
    }

    handleContinueBtn() {
        if(!this.currentStep) return;
        const isUnavailableSize = this.currentStep.querySelector("[js-unavailable-size]");
        const continueBtn = this.currentStep.querySelector("[js-continue-btn]");

        isUnavailableSize || this.checkSelection() === false ? continueBtn?.classList.add("disabled") : continueBtn?.classList.remove("disabled");
    }

    handleMute({ currentTarget }) {
        const video = this.currentStep.querySelector("[js-sample-video]");
        if(!video) return;

        currentTarget.classList.toggle("is-muted");
        currentTarget.classList.contains("is-muted") ? video.muted = true : video.muted = false;
    }

    handleAtcPrice() {
        const atcPrice = this.querySelector("[js-atc-price]");
        const width = parseInt(this.querySelector("[data-name='properties[_width]']").value);
        const height = parseInt(this.querySelector("[data-name='properties[_height]']").value);
        if(Math.max(width, height) < 90) return;

        const price = parseInt(atcPrice.getAttribute("data-product-price").match(/\d+/)[0]);
        const oversizedPrice = parseInt(this.oversizedProductField.getAttribute('data-oversized-price').match(/\d+/)[0]);
        const updatedPrice = price + oversizedPrice;
        atcPrice.textContent = `- ${this.getAttribute("data-currency-symbol")}${updatedPrice}`;
    }

    handleFrameDetails() {
        const sizeFieldset = this.productInfo.querySelector("[js-size-fieldset]");
        const selectedSizeField = sizeFieldset?.querySelector("input:checked");

        const widthField = this.querySelector("[data-name='properties[_width]']");
        const widthParameter = widthField.closest("[js-parameter]");
        const widthFraction = this.querySelector("[data-name='properties[_width_fraction]']").value;
        const width = widthParameter.classList.contains("is-unselected") ? "" : parseInt(widthField.value);

        const heightField = this.querySelector("[data-name='properties[_height]']");
        const heightParameter = heightField.closest("[js-parameter]");
        const heightFraction = this.querySelector("[data-name='properties[_height_fraction]']").value;
        const height = heightParameter.classList.contains("is-unselected") ? "" : parseInt(heightField.value);

        const clearanceTopField = this.querySelector("[data-name='properties[_clearance_top]']");
        const clearanceTop = clearanceTopField.closest(".is-unselected") ? "" : clearanceTopField.value;
        const clearanceRightField = this.querySelector("[data-name='properties[_clearance_right]']");
        const clearanceRight = clearanceRightField.closest(".is-unselected") ? "" : clearanceRightField.value;
        const clearanceBottomField = this.querySelector("[data-name='properties[_clearance_bottom]']");
        const clearanceBottom = clearanceBottomField.closest(".is-unselected") ? "" : clearanceBottomField.value;
        const clearanceLeftField = this.querySelector("[data-name='properties[_clearance_left]']");
        const clearanceLeft = clearanceLeftField.closest(".is-unselected") ? "" : clearanceLeftField.value;

        const clipTop = this.querySelector("[data-name='properties[_clips_channels_top]']").value;
        const clipRight = this.querySelector("[data-name='properties[_clips_channels_right]']").value;
        const clipBottom = this.querySelector("[data-name='properties[_clips_channels_bottom]']").value;
        const clipLeft = this.querySelector("[data-name='properties[_clips_channels_left]']").value;

        const frameWidth = width + this.evalFraction(widthFraction) + this.evalFraction(clearanceLeft) + this.evalFraction(clearanceRight);
        const frameHeight = height + this.evalFraction(heightFraction) + this.evalFraction(clearanceTop) + this.evalFraction(clearanceBottom);

        const productForm = this.currentStep.querySelector("product-form");

        const edgesAlignField = productForm?.classList.contains("is-measurement-later") ? true : this.querySelector("[data-name='properties[_edges_align]']:checked");
        const edgesAlign = edgesAlignField?.value || "";
        
        const mainDimensionStep = this.querySelector("[js-frame-step][js-dimension-step]");
        if(!mainDimensionStep.querySelector(".is-unselected") && !mainDimensionStep.querySelector("[js-unavailable-size]")) {
            mainDimensionStep.querySelector("[js-continue-btn]").classList.remove("disabled");
        };
        const hasDisabledContinueBtn = productForm?.classList.contains("is-measurement-later") ? false : this.querySelector("[js-continue-btn].disabled") && true;

        this.sizeTitle.textContent = localStorage.getItem("variant-name") || selectedSizeField?.value;
        this.mirrorSize.forEach( el => {
            if(width || height) {
                el.textContent = `${widthField.value} ${widthFraction}" x ${heightField.value} ${heightFraction}"`
            }else {
                el.textContent = ""
            }
        });

        const frameSizeObj = this.handleFrameSize(frameWidth, frameHeight);

        this.frameSize.textContent = Object.keys(frameSizeObj).length ? `Width: ${frameSizeObj.frame_width_value} ${frameSizeObj.frame_width_fraction_value ? frameSizeObj.frame_width_fraction_value : ""}", Height: ${frameSizeObj.frame_height_value} ${frameSizeObj.frame_height_fraction_value ? frameSizeObj.frame_height_fraction_value : ""}"` : "";
        const spaceDimensions = `${ clearanceTop ? `Top: ${clearanceTop}",` : "" } ${ clearanceBottom ? `Bottom: ${clearanceBottom}",` : "" } ${ clearanceRight ? `Right: ${clearanceRight}",` : "" } ${ clearanceLeft ? `Left: ${clearanceLeft}",` : "" }`;
        this.spaceAround.textContent = spaceDimensions.trim().length ? spaceDimensions.trim().replace(/,$/, '') : "";

        const clips = `${clipTop === "Yes" ? "Top," : ""} ${clipBottom === "Yes" ? "Bottom," : ""} ${clipRight === "Yes" ? "Right," : ""} ${clipLeft === "Yes" ? "Left," : ""}`;

        this.clips.textContent = clips.trim().length ? clips.trim().replace(/,$/, '') : "N/A";
        this.edgesAlign.textContent = edgesAlign;
        const disable = this.atcBtn?.classList.contains("is-soldout") ? true : false;

        this.getAttribute("data-mode") === "update" ? this.updateProductForm() : null;
        this.handleAtcPrice();

        this.toggleAtcBtn(hasDisabledContinueBtn, edgesAlignField, disable);
        this.updateVariantInputs();

        this.handleFrameSize(frameWidth, frameHeight);
        this.handleLocationField(clearanceTop, clipTop, clearanceBottom, clipBottom, clearanceLeft, clipLeft, clearanceRight, clipRight);
    }

    evalFraction(value) {
        if (!value || value.trim() === "") return 0;
        const fractionParts = value.split("/");
        if (fractionParts.length === 2) {
            return parseFloat(fractionParts[0]) / parseFloat(fractionParts[1]);
        }
        return parseFloat(value) || 0;
    }

    handleFrameSize(frameWidth, frameHeight) {
        const frame_width = String(frameWidth);
        const frame_height = String(frameHeight);

        const mirrorSizeArr = ["1/8", "1/4", "3/8", "1/2", "5/8", "3/4", "7/8"];
        const mirrorValueArr = ["125", "25", "375", "5", "625", "75", "875"];

        const frame_width_array = frame_width.split(".");
        const frame_width_value = frame_width_array[0];
        const frame_width_fraction_value =
            frame_width_array[1] && mirrorValueArr.includes(frame_width_array[1])
            ? mirrorSizeArr[mirrorValueArr.indexOf(frame_width_array[1])]
            : 0;

        const frame_height_array = frame_height.split(".");
        const frame_height_value = frame_height_array[0];
        const frame_height_fraction_value =
            frame_height_array[1] && mirrorValueArr.includes(frame_height_array[1])
            ? mirrorSizeArr[mirrorValueArr.indexOf(frame_height_array[1])]
            : 0;

        this.frameWidthField.value = frame_width_value;
        this.frameHeightField.value = frame_height_value;

        this.frameWidthFractionField.value = frame_width_fraction_value;
        this.frameHeightFractionField.value = frame_height_fraction_value;

        return {
            frame_width_value,
            frame_width_fraction_value,
            frame_height_value,
            frame_height_fraction_value
        }
    }
    
    toggleAtcBtn(hasDisabledContinueBtn, edgesAlignField, disable) {
        if(hasDisabledContinueBtn || edgesAlignField === null || disable) {
            this.atcBtn?.setAttribute("disabled", "disabled")
        }else {
            this.atcBtn?.removeAttribute("disabled");
        }
    }

    handleAccordion({ currentTarget }) {
        const hasMainAccordion = currentTarget.closest("[js-main-accordion-item]");

        if(!hasMainAccordion) {
            this.accordionHeaders.forEach(item => {
                if (item !== currentTarget) {
                    item.classList.remove("is-open");
                }
            });
        }
    
        currentTarget.classList.toggle("is-open");
    }

    open({ currentTarget }, modelId) {
        const id = currentTarget?.getAttribute("data-trigger-id") || modelId;
        this.model = this.querySelector(`#${id}`);
        id === "Need-Help" || id === "Option-Dropdown" ? this.model.classList.toggle('is-open') : this.model.classList.add('is-open');
    }

    close(evt) {
        if(evt) {
            const model = evt.currentTarget.closest(".is-open");
            model.tagName !== "FRAME-MODEL" && model?.classList.remove('is-open');
        }else {
            this.model?.classList.remove('is-open');
        }
    }

    handleCloseModel(evt) {
        this.open(evt);
    }

    resetFrame() {
        this.resetProductForm();
        this.clearLocalStorage();
        this.closeModel();
        this.close();

        const mainFrameModel = document.querySelector("frame-model");
        if(parseInt(this.buildMyFrameStep.getAttribute("data-step")) === 1) {
            mainFrameModel.resetProductForm();

            if(!parseInt(mainFrameModel.buildMyFrameStep.getAttribute("data-step"))) return;

            mainFrameModel.frameSteps.forEach( frameStep => frameStep.setAttribute('data-step', parseInt(frameStep.getAttribute('data-step')) - 1));
            mainFrameModel.editSizeEls.forEach(el => el.setAttribute('data-trigger-step', parseInt(el.getAttribute('data-trigger-step')) - 1));

            if(this.userType === "Retail") {
                mainFrameModel.stepsProgressMeter.setAttribute("data-default-progress", 14.28);
                mainFrameModel.stepsCounter.setAttribute("data-total-steps", 7);
                mainFrameModel.totalSteps = 7;
            }else {
                mainFrameModel.stepsProgressMeter.setAttribute("data-default-progress", 20);
                mainFrameModel.stepsCounter.setAttribute("data-total-steps", 5);
                mainFrameModel.totalSteps = 5;
            }
            this.skipBtns.forEach( el => el.setAttribute("data-trigger-step", 3));

            mainFrameModel.buildMyFrameStep.classList.remove("is-init","is-active","is-edit","is-loading");
        };
        
        mainFrameModel.ajaxProductFraming.innerHTML = "";
        mainFrameModel.updateStep("downgrading", 1, "reset");
        mainFrameModel.frameSteps.forEach( frameStep => frameStep.classList.remove("is-edit"));
    }

    resetProductForm(isCloseMainModel = true) {
        this.parameters.forEach( el => el.classList.add("is-unselected"));
        this.clipParameters.forEach( el => {
            el.querySelector("input[type='checkbox']").checked = false;
            el.querySelector("input[type='hidden']").value = 'No';
        });
        this.edgeParameters.forEach(el => el.classList.remove("is-checked"));
        this.mirrorSize.textContent = "";
        this.spaceAround.textContent = "";
        this.clips.textContent = "N/A";
        this.edgesAlign.textContent = "N/A";
        this.atcBtn?.setAttribute("disabled", "disabled");
        this.shippingDimensionsField.value = "1";

        this.continueBtns.forEach( continueBtn => continueBtn.hasAttribute("is") ? null : continueBtn.classList.add("disabled"));
        this.querySelector("[js-frame-step].is-edit")?.classList.remove("is-edit");
        this.measurementRuleModel?.classList.remove("is-init");
        this.diagonalModel?.classList.remove("is-init");
        this.spaceDimensionModel?.classList.remove("is-init");
        this.oversizedPrice?.forEach( el => el.textContent = "");
        this.productForm.reset();

        if(isCloseMainModel) {
            this.classList.add("is-initial");
            this.querySelector("product-form").classList.remove("is-measurement-later");

            const mainDimensionStep = this.querySelector("[js-frame-step][js-dimension-step]");
            const skipBtn = mainDimensionStep.querySelector("[js-skip-btn]");
            skipBtn?.setAttribute("data-trigger-step", 1);
        }
    }

    handleSkinBtn() {
        const mainDimensionStep = this.querySelector("[js-frame-step][js-dimension-step]");
        const isSelected = mainDimensionStep.querySelector("[js-parameter]:not(.is-unselected)");
        const skipBtn = mainDimensionStep.querySelector("[js-skip-btn]");
        const triggerBtn = mainDimensionStep.querySelector("[data-trigger-id='Skip-Measurement-Model']");
        const selectedSizeOption = this.querySelector("[js-size-option].is-checked");
        
        if(this.classList.contains("is-initial")) return;

        if(selectedSizeOption) {
            if(this.buildMyFrameStep.classList.contains("is-init")) {
                this.skipBtns.forEach( btn => btn.setAttribute("data-trigger-step", 4))
                skipBtn?.setAttribute("data-trigger-step", 8);
            }else {
                this.skipBtns.forEach( btn => btn.setAttribute("data-trigger-step", 3));
                skipBtn?.setAttribute("data-trigger-step", 7);
            }
        };

        if(isSelected) {
            skipBtn.classList.add("hidden");
            triggerBtn.classList.remove("hidden");
        }else {
            skipBtn.classList.remove("hidden");
            triggerBtn.classList.add("hidden");
        }
    }

    clearLocalStorage(isCloseMainModel = true) {
        localStorage.removeItem("frame-mode");
        isCloseMainModel ? localStorage.removeItem("variant-name") : null;
        localStorage.removeItem("width-parameter");
        localStorage.removeItem("width-fraction-parameter");
        localStorage.removeItem("height-parameter");
        localStorage.removeItem("height-fraction-parameter");
        localStorage.removeItem("top-space-parameter");
        localStorage.removeItem("right-space-parameter");
        localStorage.removeItem("bottom-space-parameter");
        localStorage.removeItem("left-space-parameter");
        localStorage.removeItem("clip-top");
        localStorage.removeItem("clip-right");
        localStorage.removeItem("clip-bottom");
        localStorage.removeItem("clip-left");
        localStorage.removeItem("edges-parameter");
        localStorage.removeItem("is-measurement-later");
        localStorage.removeItem("retail-size");
    }

    initMediaGallery() {
        new Swiper(this.mediaGallery, {
            slidesPerView: 1,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: {
                0: {
                    slidesPerView: 1.1,
                    spaceBetween: 12
                },
                767: {
                    slidesPerView: 1,
                    spaceBetween: 0
                }
            }
        })
    }

    updateState(list, target, cls) {
        list.forEach(item => item.classList.remove(cls));
        target.classList.add(cls)
    }

    getTabPanelData() {
        this.activeFilterValues = [];
        this.activeHandles = [];
        this.frameTabPanels.forEach( (tabPanel,index) => {
            const filterValue = tabPanel.querySelector("[js-filter-item].is-selected").getAttribute("data-filter-value");
            const handle = tabPanel.querySelector("[js-swatch-item].is-selected")?.getAttribute("data-product-handle");
            this.activeFilterValues.push(filterValue);
            this.activeHandles.push(handle);
        });
    }

    handleAjaxFraming({ currentTarget }) {
        this.selectedSwatch = currentTarget;
        this.selectedProductHandle = currentTarget.getAttribute('data-product-handle');
        const swatchList = this.activeTabPanel.querySelectorAll("[js-swatch-item]");
        this.activetabId = this.querySelector("[js-frame-tab].is-active").getAttribute("data-tab-id");

        this.updateState(swatchList, currentTarget, "is-selected");
        this.getTabPanelData();

        this.renderAjaxFraming(this.selectedProductHandle, this.frameTriggerBy, "build-frame", this.currentStep, this.activeHandles, this.activetabId, this.activeFilterValues);
    }

    handleFrameTab({ currentTarget }) {
        this.activetabId = currentTarget.getAttribute("data-tab-id");
        const currentTabPanel = this.currentStep.querySelector(`#${this.activetabId}`);

        this.updateState(this.frameTabs, currentTarget, "is-active");
        this.updateState(this.frameTabPanels, currentTabPanel, "is-active");

        this.activeTabPanel = currentTabPanel;
        const selectedProduct = this.activeTabPanel.querySelector("[js-swatch-item].is-selected");
        this.selectedProductHandle = selectedProduct?.getAttribute('data-product-handle');
        if(!this.selectedProductHandle) return;

        this.getTabPanelData();

        this.renderAjaxFraming(this.selectedProductHandle, this.frameTriggerBy, "build-frame", this.currentStep, this.activeHandles, this.activetabId, this.activeFilterValues);
    }

    handleFilters({ currentTarget }) {
        this.filterValue = currentTarget.getAttribute('data-filter-value');
        const filtersList = this.activeTabPanel.querySelectorAll("[js-filter-item]");

        this.updateState(filtersList, currentTarget, "is-selected");
        this.activetabId = this.querySelector("[js-frame-tab].is-active").getAttribute("data-tab-id");
        
        const frameSwatches = this.activeTabPanel.querySelectorAll("[js-swatch-item]");
        frameSwatches.forEach(swatch => {
            if(this.filterValue === "all") {
                swatch.classList.remove("hidden");
            }else {
                swatch.classList.add("hidden");
            }

            swatch.classList.remove("is-selected")
        });

        const filterSwatches = this.activeTabPanel.querySelectorAll(`[js-swatch-item][data-value="${this.filterValue}"]`);
        filterSwatches?.forEach( el => el.classList.remove("hidden"));

        const targetSwatch = this.activeTabPanel.querySelector("[js-swatch-item]:not(.hidden)");
        targetSwatch.classList.add("is-selected");
        this.selectedProductHandle = targetSwatch.getAttribute('data-product-handle');

        this.getTabPanelData();

        this.renderAjaxFraming(this.selectedProductHandle, this.frameTriggerBy, "build-frame", this.currentStep, this.activeHandles, this.activetabId, this.activeFilterValues);
    }

    updateOptionLabel(value) {
        this.selectedOptionEl.textContent = value
    }

    handleOption({ currentTarget }) {
        const valueId = currentTarget.getAttribute("data-option-value-id");
        const value = currentTarget.getAttribute("data-option-value");
        this.productInfo = this.getAttribute("data-type") === "product" ? document.querySelector("product-info") : document.querySelector("ajax-product-framing product-info");
        const selectedOption = this.productInfo.querySelector(`[data-option-value-id="${valueId}"]`);

        selectedOption.click();

        this.optionItems.length ? this.updateState(this.optionItems, currentTarget, "is-selected") : null;
        this.updateOptionLabel(value);
        this.close();
    }

    handleCacheData() {
        const params = {
            sizeName: localStorage.getItem("variant-name"),
            width: localStorage.getItem("width-parameter"),
            widthFraction: localStorage.getItem("width-fraction-parameter"),
            height: localStorage.getItem("height-parameter"),
            heightFraction: localStorage.getItem("height-fraction-parameter"),
            topSpace: localStorage.getItem("top-space-parameter"),
            rightSpace: localStorage.getItem("right-space-parameter"),
            bottomSpace: localStorage.getItem("bottom-space-parameter"),
            leftSpace: localStorage.getItem("left-space-parameter"),
            clipTop: localStorage.getItem("clip-top"),
            clipRight: localStorage.getItem("clip-right"),
            clipBottom: localStorage.getItem("clip-bottom"),
            clipLeft: localStorage.getItem("clip-left"),
            edges: localStorage.getItem("edges-parameter")
        };

        this.parameterSelects.forEach(el => {
            const paramName = el.getAttribute("data-parameter-name");
            const paramValue = params[this.toCamelCase(paramName)];
    
            if (paramValue) {
                const parameterElement = el.closest("[js-parameter]");
                parameterElement.classList.remove("is-unselected");

                const option = el.querySelector(`option[value="${paramValue}"]`);
                option ? option.selected = true : null;
            }
        });

        const mainDimensionStep = this.querySelector("[js-frame-step][js-dimension-step]");
        const spaceDimensionStep = this.querySelector("[js-frame-step][is='space-dimension-step']");

        if(!mainDimensionStep.querySelector(".is-unselected")) {
            mainDimensionStep.querySelector("[js-continue-btn]").classList.remove("disabled");
        };

        if(!spaceDimensionStep.querySelector(".is-unselected")) {
            spaceDimensionStep.querySelector("[js-continue-btn]").classList.remove("disabled");
        }

        this.clipFields.forEach(el => {
            const paramName = `clip-${el.getAttribute("data-clip")}`;
            const paramValue = params[this.toCamelCase(paramName)];
    
            if (paramValue) {
                const field = el.closest("[js-clip-field]");
                const clipField = field.querySelector("input[type='hidden']");
        
                el.checked = paramValue === "Yes" && true;
                clipField.value = paramValue === "Yes" ? "Yes" : "No";
            }
        });

        if(params.edges) {
            this.edgeParameters.forEach( el => {
                const field = el.querySelector("input");
                if(field.value === params.edges) {
                    el.classList.add("is-checked");
                    field.checked = true;
                }
            })
        };

        if(this.getAttribute("data-mode") === "update") {
            const step = parseInt(localStorage.getItem("frame-trigger-step"));
            this.updateStep('upgrading', step, "line-item-edit");
        }else {
            if(params.sizeName && (params.width || params.widthFraction || params.height || params.heightFraction || params.clearanceTop || params.clearanceBottom || params.clearanceLeft || params.clearanceRight || params.clipTop || params.clipBottom || params.clipLeft || params.clipRight || params.edges)) {
                this.currentStep.classList.add("is-edit");
                this.updateStep('downgrading', this.totalSteps, "edit");
            }

            if(localStorage.getItem("is-measurement-later") === "true") {
                this.currentStep.classList.add("is-edit");
                this.updateStep('downgrading', this.totalSteps, "edit");
                this.querySelector("product-form").classList.add("is-measurement-later");

                this.dimensionParameterReview.classList.add("hidden");
                this.measurementLaterReview.classList.remove("hidden");
            }

            if(parseInt(this.querySelector("[data-parameter-name='bottom-space']").value) === 0) {
                this.edgesStep.classList.remove("hidden");
            }
        }

        this.shippingDimensionsField.value = "1";
    }

    updateProductForm() {
        const productForm = this.querySelector("product-form form");
        const variantIdInput = productForm.querySelector("[data-name='id']");
        const atcBtnLabel = productForm.querySelector("[js-atc-btn-label]");

        productForm.setAttribute('action', "/cart/change");
        variantIdInput.setAttribute("name", "line");
        variantIdInput.setAttribute("value", localStorage.getItem("line-index"));
        atcBtnLabel.textContent = this.atcBtn?.classList.contains("is-soldout") ? "sold out" : "Update";

        const quantity = localStorage.getItem("line-size-value") !== localStorage.getItem("variant-name") ? 0 : localStorage.getItem("line-quantity");

        const quantityField = `<input type="hidden" name="quantity" value="${quantity}">`;
        productForm.insertAdjacentHTML("beforeend", quantityField);
    }

    toCamelCase(str) {
        return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
    }

    enableBuildMyFrameStep(isEditCard) {
        if(!this.buildMyFrameStep.classList.contains("is-init")) {
            this.frameSteps.forEach( frameStep => frameStep.setAttribute('data-step', parseInt(frameStep.getAttribute('data-step')) + 1));
            this.editSizeEls.forEach(el => el.setAttribute('data-trigger-step', parseInt(el.getAttribute('data-trigger-step')) + 1));

            this.stepsProgressMeter.setAttribute("data-default-progress", 12.5);
            this.stepsCounter.setAttribute("data-total-steps", 8);
            this.stepsCounter.textContent = "1/8";
            this.skipBtns.forEach( btn => {
                if(btn.hasAttribute("js-dynamic-skip-btn")) {
                    btn.setAttribute("data-trigger-step", 2);
                }else {
                    btn.setAttribute("data-trigger-step", 4);
                }
            })
        };
        this.buildMyFrameStep.classList.add("is-init");

        this.step = 1;
        this.totalSteps = this.userType === "Retail" ? 8 : 6;
        this.updateStep('downgrading', this.step, "edit-frame", isEditCard);
        this.activeTabPanel = this.currentStep.querySelector("[js-tab-panel].is-active");
    }

    updateVariantInputs() {
        const variantIdInput = this.productInfo.querySelector("[data-name='id']");
        const selectedOptions = this.productInfo.querySelector("variant-selects")?.querySelectorAll("input:checked");
        if(!selectedOptions?.length) return;

        const selectedVariantTitle = Array.from(selectedOptions).map(el => el.value).join(" / ");

        const variant = this.variantsJson.find( variant => variant.title === selectedVariantTitle);
        if(!variant) return;

        this.getAttribute("data-mode") === "update" ? variantIdInput.setAttribute('data-variant-id', variant.id) : variantIdInput.value = variant.id;
    }

    removeMeasurementLater() {
        this.querySelector("product-form").classList.remove("is-measurement-later");
        const reviewParameters = this.querySelectorAll("[js-review-parameter]");
        reviewParameters.forEach( el => el.classList.remove("disabled"));
    }

    handleMeasurementLater(isChangeStep = true) {
        const productForm = this.querySelector("product-form");
        productForm.classList.add("is-measurement-later");
        this.oversizedPrice.forEach( el => el.textContent = "");

        isChangeStep ? this.updateStep("upgrading", parseInt(this.totalSteps), "later") : null;

        const mirrorSize = this.currentStep.querySelector("[js-mirror-size]");
        const accordion = this.currentStep.querySelector('[js-accordion-header].is-open');
        const atcPrice = this.querySelector("[js-atc-price]");

        atcPrice.textContent = `- ${this.querySelector("[js-product-price]")?.getAttribute("data-product-price")}`;
        accordion?.classList.remove("is-open");
        mirrorSize ? mirrorSize.textContent = "" : null;

        localStorage.setItem("is-measurement-later", true);

        this.dimensionParameterReview.classList.add("hidden");
        this.measurementLaterReview.classList.remove("hidden");
    }

    handleSkipMeasurement() {
        this.resetProductForm(false);
        this.clearLocalStorage(false);
        this.close();
        this.handleMeasurementLater();
        this.userType === "Retail" ? this.handleSkinBtn() : null;
    }

    handleClipsParameter() {
        this.clipFields.forEach( input => {
            input.checked = false;
            input.dispatchEvent(new Event("change"));
        });

        this.handleFrameDetails();
    }

    handleAlignedWithVanity() {
        // const edgeParameter = this.querySelector("[js-edge-parameter]:last-child");
        // const field = edgeParameter.querySelector("[data-name='properties[_edges_align]']");

        // this.edgeParameters.forEach( el => el.classList.remove("is-checked"));
        // edgeParameter.classList.add("is-checked")
        this.edgesNilField.checked = true;

        this.handleFrameDetails();
    }

    handleLocationField(clearanceTop, clipTop, clearanceBottom, clipBottom, clearanceLeft, clipLeft, clearanceRight, clipRight) {
        this.locationTopField.value = clearanceTop !== "5/8" && clipTop === "Yes" ? "Special" : "Normal";
        this.locationBottomField.value = clearanceBottom !== "5/8" && clipBottom === "Yes" ? "Special" : "Normal";
        this.locationLeftField.value = clearanceLeft !== "5/8" && clipLeft === "Yes" ? "Special" : "Normal";
        this.locationRightField.value = clearanceRight !== "5/8" && clipRight === "Yes" ? "Special" : "Normal";
    }

    stricklyCheckedVariant() {
        const variantsJsonEl = this.querySelector("#VariantsJson");
        if(variantsJsonEl) {
            const variantsJson = JSON.parse(variantsJsonEl.textContent);
            const priceVariant = this.userType.toLowerCase();
            let sizeVariant;
            let currentVariant;

            const width = parseInt(this.querySelector("[data-name='properties[_width]']").value);
            const height = parseInt(this.querySelector("[data-name='properties[_height]']").value);
            const widthFieldset = document.querySelector("[js-width-fieldset]");
            const widthVariant = widthFieldset?.querySelector("input:checked").value.toLowerCase();

            if(priceVariant === 'retail') {
                sizeVariant = this.getSizeOnRange(width).name;
            }else {
                sizeVariant = `${this.getLF(width, height)}LF`;
            };

            if(this.querySelector("product-form")?.classList.contains("is-measurement-later") && this.querySelector("[js-size-option].is-checked")) {
                sizeVariant = localStorage.getItem("retail-size").toLowerCase();
            }else {
                sizeVariant = sizeVariant.toLowerCase();
            }

            if(variantsJson[0].title.split("/").length === 3) {
                currentVariant = variantsJson.find( variant => variant.title.toLowerCase().includes(priceVariant) && variant.title.toLowerCase().includes(sizeVariant) && variant.title.toLowerCase().includes(widthVariant));
            }else {
                currentVariant = variantsJson.find( variant => variant.title.toLowerCase().includes(priceVariant) && variant.title.toLowerCase().includes(sizeVariant));
            }

            if(currentVariant) {
                const variantField = this.querySelector("[data-name='id']");
                if(this.getAttribute("data-mode") !== "update") {
                    variantField.value = currentVariant.id;
                }
    
                variantField.setAttribute("data-variant-id", currentVariant.id);
            }
        }
    }
}

customElements.define('frame-model', FrameModel);