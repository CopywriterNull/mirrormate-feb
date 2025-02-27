class MultiOrderFrame extends HTMLElement {
    constructor() {
        super();

        this.rootEl = document.documentElement;
        this.formTemplate = this.querySelector("[js-form-template]");
        this.reviewFormTemplate = this.querySelector("[js-review-form-template]");
        this.mainForm = this.querySelector("[js-main-form]");
        this.addBtn = this.querySelector("[js-add-btn]");
        this.reviewOrderBtn = this.querySelector("[js-review-order-btn]");
        this.mainFramingEl = this.querySelector("[js-main-framing]");
        this.reviewOrderEl = this.querySelector("[js-review-order]");
        this.mainReviewForm = this.querySelector("[js-main-review-form]");
        this.productForm = this.querySelector("[js-product-form]");
        this.oversizedEl = this.querySelector("[js-oversized]");
        this.atcBtn = this.querySelector("[js-atc-btn]");
        this.atcPriceEl = this.atcBtn.querySelector("[js-atc-btn-price]");
        
        this.dimensions = this.querySelectorAll("[js-dimension]");
        this.clipFields = this.querySelectorAll("[js-clip-field]");
        this.selectFrameBtns = this.querySelectorAll("[js-select-frame-btn]");
        this.saveLaterBtns = this.querySelectorAll("[js-save-later-btn]");

        this.formId = this.getAttribute("data-form-id");
        this.oversizedVariantId = this.getAttribute("data-oversized-variant-id");
        this.oversizedVariantPrice = parseFloat(this.getAttribute("data-oversized-variant-price"));
        this.currencySymbol = this.getAttribute("data-currency-symbol");
        this.LFArray = [10, 15, 20, 25, 30, 35, 40, 45];

        this.count = 1;

        this.init();
    }

    init() {
        this.initProduct();

        this.addEventListener("click", ({ target }) => {
            if(target.hasAttribute("js-add-btn")) this.addAnotherForm(target);
            if(target.hasAttribute("js-delete-btn")) this.deleteblockForm(target);
            if(target.hasAttribute("js-duplicate-btn")) this.handleDuplicate(target);
            if(target.hasAttribute("js-clear-form-btn")) this.clearForm();
            if(target.hasAttribute("js-select-frame-btn")) this.updateBtnSate(target);
            if(target.hasAttribute("js-done-btn")) this.updateLineProduct(target);
            if(target.hasAttribute("js-review-order-btn") || target.hasAttribute("js-back-btn")) this.toggleForms(target);
            if(target.hasAttribute("js-model-overlay") || target.hasAttribute("js-close-btn")) this.close();
            if(this.querySelector("[js-toolkit-box].is-open") && !target.hasAttribute("js-tookit")) this.close();
            if(target.hasAttribute("js-edit-style-btn") || target.hasAttribute("js-tookit")) this.open(target);
            if(target.hasAttribute("js-btn-grid")) this.handleRequiredFields();
            if(target.hasAttribute("js-dropdown-item")) this.handleWidthVariant(target);
            
            this.handleFormsFilled();
            if(target.hasAttribute("js-delete-btn") && !this.mainForm.children.length) this.handleClear(target);
        })

        this.addEventListener("change", ({ target }) => {
            if(target.hasAttribute("js-dimension-parameter")) this.handleDimension(target);
            if(target.hasAttribute("js-clip-input-field")) this.handleClip(target);

            this.handleFormsFilled();
        });

        this.addEventListener("input", ({ target }) => {
            if(target.hasAttribute("js-search-field")) this.handleFrameSearch(target)
            else this.handleFormsFilled()
        });
    }

    initProduct() {
        const urlObj = new URL(location.href);
        const productHandle = urlObj.searchParams.get('product_handle');
        const sectionId = 'order-form'; 

        fetch(`/products/${productHandle}?section_id=${sectionId}`)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const blockForm = doc.querySelector("[js-form-block]");
            const orderFormTemplate = doc.querySelector("[js-order-form-template]");

            this.mainForm.innerHTML = blockForm.outerHTML;
            this.formTemplate.innerHTML = orderFormTemplate.innerHTML;
            this.classList.remove("is-initial");

            const productTitle = blockForm.querySelector("[js-product-title]").textContent;
            const productSwatch = blockForm.querySelector("[js-swatch-img]").getAttribute('src');
            
            this.querySelectorAll("[js-select-frame-btn]").forEach( selectFrameBtn => {
                selectFrameBtn.classList.remove("is-selected");
                selectFrameBtn.textContent = "Select frame";
            });
            const currentProduct = this.querySelector(`[js-select-frame-btn][data-product-title="${productTitle}"]`);
            currentProduct.classList.add("is-selected");
            currentProduct.textContent = "Selected";


            this.querySelector("[js-selected-product-title]").textContent = productTitle;
            this.querySelector("[js-selected-product-swatch]").setAttribute("src", productSwatch);
        })
        .catch(error => console.error('Error fetching section:', error));
    }

    addAnotherForm(btn) {
        let count = parseInt(btn.getAttribute("data-count"));
        const template = this.formTemplate.content.cloneNode(true);
        let blockForm = template.firstElementChild.outerHTML.replace(/{{\s*line\s*}}/g, count);
        
        this.updateCount("add");
        this.mainForm.insertAdjacentHTML("beforeend", blockForm); 
        this.handleLine();
        this.updateScroll(this.mainForm, "end");
        this.updateWidthOption(this.querySelector("[js-form-block]:last-child"));
    }

    handleDimension(select) {
        const blockForm = select.closest("[js-form-block]");
        const parameter = select.closest("[js-dimension]");

        if(select.options[0].selected) {
            parameter.classList.add("is-unselected");
        }else {
            parameter.classList.remove("is-unselected");
        }

        this.updateMasterId(blockForm);
    }

    updateMasterId(blockForm) {
        let productPrice = parseFloat(blockForm.getAttribute("data-product-price"));
        const variantIdInput = blockForm.querySelector("[js-variant-id-field]");
        let variantId = variantIdInput.value;

        const width = parseInt(blockForm.querySelector("[name$='[_width]']").value);
        const height = parseInt(blockForm.querySelector("[name$='[_height]']").value);
        const product = JSON.parse(blockForm.querySelector("[js-product-json]").textContent);
        const variants = product.variants;
        const LF = this.getLF(width, height);

        let currrent_variant;
        if(blockForm.querySelector("[js-width-option]")) {
            const widthValue = blockForm.querySelector("[js-width-select]").value;
            currrent_variant = variants.find( variant => variant.title.includes(this.getAttribute("data-user-type")) && variant.title.includes(widthValue) && variant.title.includes(LF));
        }else {
            currrent_variant = variants.find( variant => variant.title.includes(this.getAttribute("data-user-type")) && variant.title.includes(LF));
        }

        variantId = currrent_variant?.id || variantId;
        productPrice = (currrent_variant && currrent_variant.price / 100) || productPrice;
        variantIdInput.value = variantId;

        blockForm.setAttribute("data-product-price", productPrice);
    }

    handleFormsFilled() {
        const blockForms = this.querySelectorAll("[js-form-block]");
        const allFormsFilled = blockForms.length ? Array.from(blockForms).every(blockForm => this.areFieldsFilled(blockForm)) : false;

        if(allFormsFilled) {
            this.reviewOrderBtn.classList.remove("disabled");
            this.atcBtn.removeAttribute("disabled");
            this.saveLaterBtns.forEach( btn => btn.classList.remove("disabled"));
        }else {
            this.reviewOrderBtn.classList.add("disabled");
            this.atcBtn.setAttribute("disabled", "disabled");
            this.saveLaterBtns.forEach( btn => btn.classList.add("disabled"));
        }

        blockForms.forEach( blockForm => {
            const unit = blockForm.querySelector("[name$='[_unit]']");
            const dimensionParameters = blockForm.querySelectorAll("[js-dimension]");

            // if(unit.value) {
            //     unit.classList.remove("is-required")
            // }

            dimensionParameters.forEach( parameter => {
                if(!parameter.classList.contains("is-unselected")) {
                    parameter.classList.remove("is-required");
                }
            })
        });
    }

    areFieldsFilled(blockForm) {
        const quantityInput = blockForm.querySelector('input[type="number"]');
        const minValue = quantityInput.min;
        const textInputs = blockForm.querySelectorAll('input[type="text"]:not(.is-optional)');
        const selects = blockForm.querySelectorAll('select');
    
        const allTextInputsFilled = Array.from(textInputs).every(input => input.value.trim() !== '');
        const allSelectsFilled = Array.from(selects).every(select => !select.closest("[js-dimension]").classList.contains("is-unselected"));

        return allTextInputsFilled && allSelectsFilled && quantityInput.value >= minValue;
    }

    isOversized(blockForm) {
        const width = parseInt(blockForm.querySelector("[name$='[_width]']").value);
        const height = parseInt(blockForm.querySelector("[name$='[_height]']").value);

        return Math.max(width, height) >= 90;
    }

    handleOversized(blockForm) {
        if(this.isOversized(blockForm)) {
            blockForm.classList.add("has-oversized");
            this.oversizedCount += parseInt(blockForm.querySelector("[name$='[quantity]']").value);
        }else {
            if(blockForm.classList.contains("has-oversized") && this.oversizedCount) this.oversizedCount -= parseInt(blockForm.querySelector("[name$='[quantity]']").value);
            blockForm.classList.remove("has-oversized");
        }
    }

    handleClip(input) {
        const field = input.closest("[js-clip-field]");
        const clipField = field.querySelector("input[type='hidden']");
        
        clipField.value = input.checked ? "Yes" : "No";
    }

    deleteblockForm(tool) {
        const blockNumber = tool.closest("[js-review-form]")?.getAttribute("data-block-number");
        const blockForm = tool.closest("[js-form-block]") || this.querySelector(`[data-form-order="${blockNumber}"]`);
        blockForm.remove();

        this.updateCount("remove");
        this.handleLine();

        this.mainReviewForm.innerHTML = "";
        const blockForms = this.querySelectorAll("[js-form-block]");
        this.totalPrice = 0;
        this.oversizedCount = 0;
        blockForms.forEach( (blockForm, index) => this.handleReviewForms(blockForm, index));
        this.updateScroll(blockNumber ? this.mainReviewForm : this.mainForm, "end");
    }

    handleClear(target) {
        this.saveLaterBtns.forEach( btn => btn.classList.add("disabled"));
        this.reviewOrderBtn.classList.add("disabled");
        this.atcBtn.setAttribute("disabled", "disabled");

        this.mainFramingEl.classList.contains("hidden") ? this.toggleForms(target) : null;
        this.updateScroll(this.mainForm, "start");
    }

    updateCount(status) {
        this.count = status === "add" ? this.count + 1 : this.count - 1;
        this.addBtn.setAttribute("data-count", this.count);
    }

    handleLine() {
        const blockForms = this.querySelectorAll("[js-form-block]");
        blockForms.forEach( (blockForm, index) => {
            blockForm.setAttribute("data-form-order", index + 1);
            blockForm.querySelector("[js-block-count]").textContent = index + 1;
            blockForm.querySelectorAll("[name^='items[']").forEach(el => {
                const name = el.getAttribute("name");
    
                const newName = name.replace(/items\[(\d+)\]/, `items[${index}]`);
                el.setAttribute("name", newName);
                el.hasAttribute("js-shipping-dimensions-field") ? el.setAttribute("data-name", newName) : null;
            })
        })
    }

    handleDuplicate(tool) {
        const blockNumber = tool.closest("[js-review-form]")?.getAttribute("data-block-number");
        const blockForm = tool.closest("[js-form-block]") || this.querySelector(`[data-form-order="${blockNumber}"]`);
        const cloneblockForm = blockForm.cloneNode(true);
        const selectEls = blockForm.querySelectorAll("select");
        const cloneSelectEls = cloneblockForm.querySelectorAll("select");

        selectEls.forEach( (el, index) => {
            const clonedEl = cloneSelectEls[index];
            const originalValue = el.value;

            Array.from(clonedEl.options).forEach(option => {
                option.selected = option.value === originalValue;
            });
        })

        this.updateCount("add");
        this.mainForm.appendChild(cloneblockForm);
        this.handleLine();
        
        this.mainReviewForm.innerHTML = "";
        const blockForms = this.querySelectorAll("[js-form-block]");
        this.totalPrice = 0;
        this.oversizedCount = 0;
        blockForms.forEach( (blockForm, index) => this.handleReviewForms(blockForm, index));
        this.updateScroll(blockNumber ? this.mainReviewForm : this.mainForm, "end");
    }

    clearForm() {
        const textParameters = this.querySelectorAll("[type='text']");
        const parameters = this.querySelectorAll("[js-dimension]");
        const clipParameters = this.querySelectorAll("[js-clip-field]");

        textParameters.forEach( el => el.value = "");
        parameters.forEach( el => el.classList.add("is-unselected"));
        clipParameters.forEach( el => {
            el.querySelector("input[type='checkbox']").checked = false;
            el.querySelector("input[type='hidden']").value = 'No';
        });

        this.oversizedEl.innerHTML = "";
        this.productForm.reset();
    }

    updateBtnSate(btn) {
        if(btn.classList.contains("disabled")) return;
        this.selectFrameBtns.forEach( el => {
            el.classList.remove("is-selected");
            el.textContent = "Select frame";
        });
        btn.classList.add("is-selected");
        btn.textContent = "Selected";
        this.querySelector("[js-done-btn]").classList.remove("disabled");
    }

    updateLineProduct() {
        const selectedFrame = this.querySelector("[js-select-frame-btn].is-selected");
        const cardProduct = selectedFrame.closest("[js-card-product]");
        const selectedSwatch = cardProduct.querySelector("[js-swatch-item].is-selected");
        let variantId = selectedSwatch?.getAttribute("data-variant-id") || selectedFrame.getAttribute("data-variant-id");
        const swatchImage = selectedSwatch?.getAttribute("data-swatch-img") || selectedFrame.getAttribute("data-swatch-img")
        const productTitle = selectedSwatch?.getAttribute("data-product-title") || selectedFrame.getAttribute("data-product-title");
        let productPrice = selectedSwatch?.getAttribute("data-product-price-without-currency") || selectedFrame.getAttribute("data-product-price-without-currency");
        const productJson = selectedSwatch?.querySelector("[js-product-json]").textContent || cardProduct.querySelector("[js-product-json]").textContent;
        const product = JSON.parse(productJson);
        const variants = product.variants;

        this.activeForm.querySelector("[js-product-json]").textContent = productJson;
        const variantIdInput = this.activeForm.querySelector("[js-variant-id-field]");
        const swatchImgEl = this.activeForm.querySelector("[js-swatch-img]");
        const productTitleEl = this.activeForm.querySelector("[js-product-title]");
        const width = parseInt(this.activeForm.querySelector("[name$='[_width]']").value);
        const height = parseInt(this.activeForm.querySelector("[name$='[_height]']").value);

        const LF = this.getLF(width, height);
        const currrent_variant = variants.find( variant => variant.title.includes(this.getAttribute("data-user-type")) && variant.title.includes(LF));
        productPrice = (currrent_variant && currrent_variant.price / 100) || productPrice;
        variantId = currrent_variant?.id || variantId;

        variantIdInput.value = variantId;
        this.activeForm.setAttribute("data-product-price", productPrice);
        swatchImgEl?.setAttribute("src", swatchImage);
        productTitleEl.textContent = productTitle;

        const fragment = this.formTemplate.content;
        fragment.querySelector("[js-variant-id-field]").value = variantId;
        fragment.querySelector("[js-swatch-img]").setAttribute("src", swatchImage);
        fragment.querySelector("[js-product-json]").textContent = productJson;

        this.querySelector("[js-selected-product-title]").textContent = productTitle;
        this.querySelector("[js-selected-product-swatch]").setAttribute("src", swatchImage);

        const blockForms = this.querySelectorAll("[js-form-block]");

        this.mainReviewForm.innerHTML = "";
        this.totalPrice = 0;
        this.oversizedCount = 0;
        blockForms.forEach( (blockForm, index) => {
            this.updateWidthOption(blockForm);
            this.handleReviewForms(blockForm, index);
        });
        this.close();
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

    handleFrameSearch(searchField) {
        const value = searchField.value.toLowerCase();
        const productElements = this.querySelectorAll('[data-product-title]');
      
        productElements.forEach((element) => {
          const productTitle = element.getAttribute('data-product-title').toLowerCase();
      
          if (productTitle.includes(value)) {
            element.classList.remove('hidden');
          } else {
            element.classList.add('hidden');
          }
        });
    }

    open(btn) {
        const blockNumber = btn.closest("[js-review-form]")?.getAttribute("data-block-number");
        this.activeForm = btn.closest("[js-form-block]") || this.querySelector(`[data-form-order="${blockNumber}"]`);
        const id = btn.getAttribute("data-trigger-id");
        
        if(id === "ToolModel") {
            btn.parentElement.classList.add("is-open");
        }else {
            const model = this.querySelector(`#${id}`);
            model.classList.add('is-open');
            this.rootEl.classList.add("lock-scroll");
        }
    }

    close() {
        const models = this.querySelectorAll(".is-open");
        models.forEach( model => model.classList.remove('is-open'));
        this.rootEl.classList.remove("lock-scroll");
    }

    toggleForms(target) {
        this.mainFramingEl.classList.toggle("hidden");
        this.reviewOrderEl.classList.toggle("hidden");

        if(target.hasAttribute("js-review-order-btn")) {
            const blockForms = this.querySelectorAll("[js-form-block]");

            this.mainReviewForm.innerHTML = "";
            this.totalPrice = 0;
            this.oversizedCount = 0;
            blockForms.forEach( (blockForm, index) => this.handleReviewForms(blockForm, index));
            this.updateScroll(this.reviewOrderEl, "start");
        }
    }

    addOversizedProduct() {
        const oversizedLine = `
            <input type="hidden" name="items[${this.count}][id]" value="${this.oversizedVariantId}" form="${this.formId}">
            <input type="hidden" name="items[${this.count}][quantity]" value="${this.oversizedCount}" form="${this.formId}">
        `;

        this.oversizedEl.innerHTML = "";
        this.oversizedEl.insertAdjacentHTML("beforeend", oversizedLine);
    }

    handleReviewForms(blockForm, index) {
        const template = this.reviewFormTemplate.content.cloneNode(true);
        const swatchImage = blockForm.querySelector("[js-swatch-img]")?.getAttribute("src");
        const productTitle = blockForm.querySelector("[js-product-title]").textContent;
        const frameSize = blockForm.querySelector("[js-width-select]").value;
        const quantity = parseInt(blockForm.querySelector("[name$='[quantity]']").value);
        const unit = blockForm.querySelector("[name$='[_unit]']").value;
        const PO = blockForm.querySelector("[name$='[_PO]']").value;
        const width = parseInt(blockForm.querySelector("[name$='[_width]']").value);
        const widthFraction = blockForm.querySelector("[name$='[_width_fraction]']").value;
        const height = parseInt(blockForm.querySelector("[name$='[_height]']").value);
        const heightFraction = blockForm.querySelector("[name$='[_height_fraction]']").value;
        const clearanceTop = blockForm.querySelector("[name$='[_clearance_top]']").value;
        const clearanceBottom = blockForm.querySelector("[name$='[_clearance_bottom]']").value;
        const clearanceLeft = blockForm.querySelector("[name$='[_clearance_left]']").value;
        const clearanceRight = blockForm.querySelector("[name$='[_clearance_right]']").value;
        const clipTop = blockForm.querySelector("[name$='[_clips_channels_top]']").value;
        const clipBottom = blockForm.querySelector("[name$='[_clips_channels_bottom]']").value;
        const clipLeft = blockForm.querySelector("[name$='[_clips_channels_left]']").value;
        const clipRight = blockForm.querySelector("[name$='[_clips_channels_right]']").value;
        const clips = `${clipTop === "Yes" ? "Top," : ""} ${clipBottom === "Yes" ? "Bottom," : ""} ${clipRight === "Yes" ? "Right," : ""} ${clipLeft === "Yes" ? "Left," : ""}`;
        const clipLargerThanOne = blockForm.querySelector("[name$='[_clips-larger-than-1-inch]']").value;

        template.querySelector("[js-review-form").setAttribute("data-block-number", index + 1);
        template.querySelector("[js-swatch-img]").setAttribute("src", swatchImage);
        template.querySelector("[js-block-count]").textContent = index + 1;
        template.querySelectorAll("[js-product-title]").forEach( el => el.innerHTML = `${productTitle} - <strong>${frameSize}<strong>`);
        template.querySelectorAll("[js-quantity-field]").forEach( el => el.textContent = quantity);
        template.querySelectorAll("[js-unit-field]").forEach( el => el.textContent = unit);
        template.querySelectorAll("[js-po-field]").forEach( el => el.textContent = PO);
        template.querySelectorAll("[js-width-field]").forEach( el => el.textContent = `${width} ${widthFraction}”`);
        template.querySelectorAll("[js-height-field]").forEach( el => el.textContent = `${height} ${heightFraction}”`);
        template.querySelectorAll("[js-clearance-top-field]").forEach( el => el.textContent = `${clearanceTop}”`);
        template.querySelectorAll("[js-clearance-bottom-field").forEach( el => el.textContent = `${clearanceBottom}”`);
        template.querySelectorAll("[js-clearance-left-field]").forEach( el => el.textContent = `${clearanceLeft}”`);
        template.querySelectorAll("[js-clearance-right-field]").forEach( el => el.textContent = `${clearanceRight}”`);
        template.querySelectorAll("[js-clips-field]").forEach( el => el.textContent = clips.trim().length ? clips.trim().replace(/,$/, '') : "None");
        template.querySelectorAll("[js-clip-size-field]").forEach( el => el.textContent = clipLargerThanOne);

        const framWidth = (width + this.evalFraction(widthFraction)) + (this.evalFraction(clearanceLeft) + this.evalFraction(clearanceRight));
        const frameHeight = (height + this.evalFraction(heightFraction)) + (this.evalFraction(clearanceTop) + this.evalFraction(clearanceBottom));
        const maxDimension = Math.max(width, height);

        this.updateFrameSize(blockForm, framWidth, frameHeight);
        this.handleShippingDimensionsField(blockForm, maxDimension, quantity);
        this.handleLocationField(blockForm, clearanceTop, clipTop, clearanceBottom, clipBottom, clearanceLeft, clipLeft, clearanceRight, clipRight);
        this.handleOversized(blockForm);
        this.updateMasterId(blockForm);
        this.updatePrice(blockForm);

        const price = blockForm.getAttribute("data-product-price");
        template.querySelectorAll("[js-price-field]").forEach( el => el.textContent = `${this.currencySymbol}${price * quantity}`);
        this.mainReviewForm.insertAdjacentHTML("beforeend", template.firstElementChild.outerHTML);

        this.oversizedCount 
        ? this.addOversizedProduct() 
        : this.oversizedEl.innerHTML = "";
    }

    evalFraction(value) {
        if (!value || value.trim() === "") return 0;
        const fractionParts = value.split("/");
        if (fractionParts.length === 2) {
            return parseFloat(fractionParts[0]) / parseFloat(fractionParts[1]);
        }
        return parseFloat(value) || 0;
    }

    updateWidthOption(blockForm) {
        const product = JSON.parse(blockForm.querySelector("[js-product-json]").textContent);

        if(!blockForm.querySelector("[js-width-option]")) return;
        if (product.options.indexOf("Width") !== -1 || product.options.indexOf("width") !== -1) {
            const index = product.options.indexOf("Width");
        
            const widthValues = [...new Set(product.variants.map(variant => {
                return variant.title.split(' / ')[index]
            }))];
            const hasSlim = widthValues.some(value => value.toLowerCase().includes("slim"));
        
            const widthOptionHtml = `
              <select name="width-option" js-width-select>
                    ${widthValues.map((value, i) => {
                    const valueLower = value.toLowerCase();
                    const isSelected = hasSlim
                        ? valueLower.includes("slim")
                        : i === 0

                    return `
                        <option value="${value}" ${isSelected ? "selected" : ""}>${value}</option>
                    `;
                    }).join('')}
                </select>
            `;

            blockForm.querySelector("[js-width-option]").innerHTML = widthOptionHtml;
        
        } else {
            blockForm.querySelector("[js-width-option]").innerHTML = "";
        }
    }

    updatePrice(blockForm) {
        const quantity = parseInt(blockForm.querySelector("[name$='[quantity]']").value);
        const price = parseInt(blockForm.getAttribute("data-product-price"));
        this.totalPrice += price * quantity;

        if(this.isOversized(blockForm)) {
            const oversizedPrice = this.oversizedVariantPrice * parseInt(blockForm.querySelector("[name$='[quantity]']").value); 
            this.totalPrice += oversizedPrice;
        };
        
        this.atcPriceEl.textContent = `- ${this.currencySymbol}${this.totalPrice}`;
    }

    updateScroll(scrollElement, block) {
        scrollElement.scrollIntoView({
            behavior: 'smooth',
            block
        });
    }

    updateFrameSize(blockForm, width, height) {
        const frameWidth = blockForm.querySelector("[js-frame-width-field]");
        const frameWidthFraction = blockForm.querySelector("[js-frame-width-fraction-field]");
        const frameHeight = blockForm.querySelector("[js-frame-height-field]");
        const frameHeightFraction = blockForm.querySelector("[js-frame-height-fraction-field]");

        const frame_width = String(width);
        const frame_height = String(height);

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

        frameWidth.value = frame_width_value;
        frameHeight.value = frame_height_value;

        frameWidthFraction.value = frame_width_fraction_value;
        frameHeightFraction.value = frame_height_fraction_value;
    }

    handleShippingDimensionsField(blockForm, value, quantity) {
        const shippingDimensionsField = blockForm.querySelector("[js-shipping-dimensions-field]");
        const shippingDimensionsB2BField = blockForm.querySelector("[js-shipping-dimensions-b2b-field]");

        shippingDimensionsField.value = `${quantity}`;
        shippingDimensionsB2BField.value = value;

        const key = this.getRange(value);
        shippingDimensionsField.name = `${shippingDimensionsField.getAttribute("data-name")}[${key}]`;
    }

    handleLocationField(blockForm, clearanceTop, clipTop, clearanceBottom, clipBottom, clearanceLeft, clipLeft, clearanceRight, clipRight) {
        const locationTopField = blockForm.querySelector("[js-location-top-field]");
        const locationBottomField = blockForm.querySelector("[js-location-bottom-field]");
        const locationLeftField = blockForm.querySelector("[js-location-left-field]");
        const locationRightField = blockForm.querySelector("[js-location-right-field]");

        locationTopField.value = clearanceTop !== "5/8" && clipTop === "Yes"  ? "Special" : "Normal";
        locationBottomField.value = clearanceBottom !== "5/8" && clipBottom === "Yes"  ? "Special" : "Normal";
        locationLeftField.value = clearanceLeft !== "5/8" && clipLeft === "Yes"  ? "Special" : "Normal";
        locationRightField.value = clearanceRight !== "5/8" && clipRight === "Yes"  ? "Special" : "Normal";
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

    handleWidthVariant(target) {
        const widthSelector = target.closest("[js-width-selector]");
        const selectedValueEl = widthSelector.querySelector("[js-selected-value]");

        widthSelector.querySelectorAll("[js-dropdown-item]").forEach( el => el.classList.remove("is-selected"));
        target.classList.add("is-selected");

        selectedValueEl.textContent = target.getAttribute("data-value");
        
        const blockForm = target.closest("[js-form-block]");
        this.updateMasterId(blockForm);
    }

    handleRequiredFields() {
        const blockForms = this.querySelectorAll("[js-form-block]");
        blockForms.forEach( blockForm => {
            const unit = blockForm.querySelector("[name$='[_unit]']");
            const dimensionParameters = blockForm.querySelectorAll("[js-dimension]");

            // if(!unit.value) {
            //     unit.classList.add("is-required")
            // }

            dimensionParameters.forEach( parameter => {
                if(parameter.classList.contains("is-unselected")) {
                    parameter.classList.add("is-required");
                }
            })
        });
    }
}

customElements.define('multi-order-form', MultiOrderFrame);