class FrameModelOrder extends HTMLElement {
    constructor() {
        super();

        this.frameButton = document.querySelector("frame-button");
        this.closeModelBtn = this.querySelector("[js-close-btn]");
        this.backBtn = this.querySelector("[js-back-btn]");
        this.stepsProgressMeter = this.querySelector("[js-steps-progress-meter]");
        this.stepsCounter = this.querySelector("[js-steps-counter]");
        this.spaceAround = this.querySelector("[js-space-around]");
        this.clips = this.querySelector("[js-clips]");
        this.edgesAlign = this.querySelector("[js-edges-align]");
        this.sizeTitle = this.querySelector("[js-size-title]");
        this.framePrice = this.querySelector("[js-frame-price]");
        this.productForm = document.querySelector(`#${this.getAttribute("data-form-id")}`);
        this.sizeRangeJson = this.querySelector("#SizeRangeJson");
        this.sizeRange = this.sizeRangeJson ? JSON.parse(this.sizeRangeJson.textContent) : null;
        this.measurementRuleModel = this.querySelector("#Measurement-Rule-Model");
        this.diagonalModel = this.querySelector("#Diagonal-Model");
        this.spaceDimensionModel = this.querySelector("#Space-Dimension-Model");
        this.oversizedProductField = this.querySelector("[js-oversized-product-field]");
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
        this.triggerBtns = this.querySelectorAll("[js-trigger-btn]");
        this.closeTriggerBtns = this.querySelectorAll("[js-trigger-close]");
        this.overlayEls = this.querySelectorAll("[js-overlay]");
        this.resetBtns = this.querySelectorAll("[js-reset-btn]");
        this.closeModel = this.frameButton.closeModel?.bind(this.frameButton);
        this.renderAjaxFraming = this.frameButton.renderFraming?.bind(this.frameButton);
        this.defaultProgress = parseFloat(this.stepsProgressMeter.getAttribute("data-default-progress"));
        this.totalSteps = this.stepsCounter.getAttribute("data-total-steps");
        this.step = 1;
        this.orderForm = this.querySelector("[js-order-form]");
        this.successMessage = this.querySelector("[js-success-message]");
        this.firstContinueBtn = this.querySelector("[js-continue-btn][js-first-continue-btn]");
        this.overSizeField = this.querySelector("[js-oversize-field]");
        this.orderSelectedRange = '';

        this.frameWidthField = this.querySelector("[js-frame-width-field");
        this.frameHeightField = this.querySelector("[js-frame-height-field]");
        this.frameSize = this.querySelector("[js-frame-size]");
       this.edgesStep = this.querySelector("[js-edges-step]");
       
    }
  
    connectedCallback() {
        this.init();
        this.handleCacheData();
    }
  
    init() {
        this.closeModelBtn.addEventListener("click", this.handleCloseModel.bind(this));
        this.backBtn.addEventListener("click", () => {
         

            let step = this.isLastStep && this.edgesStep.classList.contains("hidden") ? this.step - 2 : this.step - 1;
            step = this.isLastStep && this.clipsStep.classList.contains("hidden") ? this.step - 3 : step;
            this.frameSteps.forEach( frameStep => frameStep.classList.remove("is-edit"));
            this.isLastStep ? this.updateStep('downgrading', step) : this.updateStep('downgrading');
        });
      
        
      
        this.parameterSelects.forEach( parameterSelect => parameterSelect.addEventListener('change', this.handleDimension.bind(this)));
        this.clipFields.forEach( clipField => clipField.addEventListener('change', this.handleClips.bind(this)));
        this.continueBtns.forEach( continueBtn => continueBtn.addEventListener('click', () => this.updateStep('upgrading')));
        this.muteBtns.forEach( muteBtn => muteBtn.addEventListener('click', this.handleMute.bind(this)));
        this.edgeParameters.forEach( edgeParameter => edgeParameter.addEventListener('click', ({ currentTarget }) => {
            const field = currentTarget.querySelector("input");
            field.checked = true;
            localStorage.setItem(currentTarget.getAttribute('data-parameter-name'), field.value);

            this.edgeParameters.forEach( el => el.classList.remove("is-checked"));
            currentTarget.classList.add("is-checked");

            this.updateStep('upgrading');


          let elementId = currentTarget.getAttribute('data-parameter-name');
          let formElement = this.orderForm?.querySelector(`#${elementId}`);
          formElement.value = field.value;
          
        }));
        this.editSizeEls.forEach( editSizeEl => editSizeEl.addEventListener('click', ({ currentTarget }) => {
            const step = parseInt(currentTarget.getAttribute("data-trigger-step"));
            this.updateStep('upgrading', step, "edit");
        }));
        this.accordionHeaders.forEach( accordionHeader => accordionHeader.addEventListener('click', this.handleAccordion.bind(this)));
        this.triggerBtns.forEach( triggerBtn => triggerBtn.addEventListener('click', this.open.bind(this)));
        this.closeTriggerBtns.forEach( closeTriggerBtn => closeTriggerBtn.addEventListener('click', this.close.bind(this)));
        this.overlayEls.forEach( overlayEl => overlayEl.addEventListener('click', this.close.bind(this)));
        this.resetBtns.forEach( resetBtn =>  resetBtn.addEventListener("click", this.resetFrame.bind(this)));


        this.overSizeField.querySelector('input').addEventListener('change', this.changeOverSize.bind(this));

       this.firstContinueBtn.addEventListener('click', this.handleWidthHeightDimension.bind(this));
      
        this.currentStep = this.querySelector("[js-frame-step][data-step='1']");
      
        const orderVariant = this.getAttribute('data-size-variant');
        const orderVariantRange = this.sizeRange.find(size => {
            if(size.name.toLowerCase() == orderVariant) {
                return size;
            }
        });
  
        const range = orderVariantRange.range.split("-");
        const max = parseInt(range[1].trim());
        const min = parseInt(range[0].trim());
        if(document.querySelector('[js-current-size-value]')) document.querySelector('[js-current-size-value]').innerHTML = max;

        if(document.querySelector('[js-current-lower-size-value]')) document.querySelector('[js-current-lower-size-value]').innerHTML = `${min} - ${max}`;
      
       if(document.querySelector('html')) document.querySelector('html').classList.add('lock-scroll');
      
       if(this.currentStep.classList.contains("has-video")) {
            const video = this.currentStep.querySelector("[js-sample-video]");
            video?.play();
        }else {
            this.sampleVideos?.forEach( video => video.pause());
        }


          //=============== Submit form
          this.orderForm.addEventListener("submit", (event) => {
            
               event.preventDefault();
               this.orderForm.querySelector('[js-order-form-btn]')?.classList.add('loading');
                const formData = new FormData(this.orderForm);
                fetch("https://usebasin.com/f/d22f14d8ed94", {
                method: "POST",
                headers: {
                  "Accept": "application/json",
                },
                body: formData,
                })
                .then((response) => {
                      if (response.status === 200) {
                      console.log("success");
                      this.orderForm.querySelector('[js-order-form-btn]')?.classList.remove('loading');
                      this.orderForm.classList.add('hidden');
                      this.successMessage.classList.remove('hidden');
                      this.successMessage.innerText = 'Thank you for submitting measurements!';

                       this.classList.add('disabled');
                      //  this.orderForm.querySelector('[js-shipment-date-order]')?.classList.remove('hidden');

                      let $this = this;
                       setTimeout(function(){ 
                         $this.resetFrame();
                       }, 2000);
                       
                        
                      } else {
                        this.orderForm.querySelector('[js-order-form-btn]')?.classList.remove('loading');
                        this.successMessage.classList.remove('hidden');
                        this.successMessage.innerText = 'Something went wrong!';
                        console.log("fail");

                         this.classList.remove('disabled');
                         //this.orderForm.querySelector('[js-shipment-date-order]')?.classList.add('hidden');
                      }
                })
                .catch((error) => console.log(error));
       });

           //============== Get data from Basin

            // const $this = this;
            // const itemKey = this.getAttribute('data-key');
            // const url = `https://usebasin.com/api/v1/submissions?filter_by=all&form_id=667197967fdf1ee7a22e549b21e6b2af&page=1&query=${itemKey}&api_token=667197967fdf1ee7a22e549b21e6b2af`;
            // fetch(url, {
            //     method: "GET",
            // })
            // .then(resp => resp.json())
            // .then(function(data) {
            //     console.log('data', data.submissions.length);
            //     if(data.submissions.length > 0) {
            //       console.log('this.orderForm', $this.orderForm);
            //         if($this.orderForm) $this.orderForm.classList.add('hidden');
            //         if($this.successMessage) $this.successMessage.classList.remove('hidden');
                  
            //         // this.orderForm.querySelector('[js-shipment-date-order]')?.classList.remove('hidden');
            //     }
            //     else {
            //         if($this.orderForm) $this.orderForm.classList.remove('hidden');
            //        if($this.successMessage) $this.successMessage.classList.add('hidden');

            //        //this.orderForm.querySelector('[js-shipment-date-order]')?.classList.add('hidden');
            //     }
            // })
            // .catch(function(error) {
            //     console.log(error);
            // });

      
        
    }
  
    updateStep(behaviour, step, status, editCard = false) {

     
        const previousStep = this.querySelector("[js-frame-step].is-active");
        const currentStepIndex = parseInt(previousStep?.getAttribute("data-step"));
        this.step = this.isLastStep ? step : previousStep?.classList.contains("is-edit") ? parseInt(this.totalSteps) : behaviour === "upgrading" ? currentStepIndex + 1 : currentStepIndex - 1;
        status === "reset" || status === "edit-frame" ? this.step = 1 : null;



        if(this.querySelector(`[js-frame-step][data-step="${this.step}"]`).classList.contains('hidden') && behaviour == 'upgrading') {
          this.step = this.step+1;
        }
        if(this.querySelector(`[js-frame-step][data-step="${this.step}"]`).classList.contains('hidden') && behaviour == 'downgrading') {
          this.step = this.step-1;
        }
      
      
        this.frameSteps.forEach( frameStep => frameStep.classList.remove("is-active"));
        this.currentStep = this.querySelector(`[js-frame-step][data-step="${this.step}"]`);

        
      
        this.currentStep.classList.add("is-active");
        (status === 'edit' || status === "edit-frame") && !editCard ? this.currentStep.classList.add("is-edit") : null;
        this.isLastStep = this.currentStep.getAttribute("is") === "last-step";

        this.step === 1 ? this.backBtn.classList.add("disabled") : this.backBtn.classList.remove("disabled");

        if(this.currentStep.classList.contains("has-video")) {
            const video = this.currentStep.querySelector("[js-sample-video]");
            video?.play();
        }else {
            this.sampleVideos?.forEach( video => video.pause());
        }

      //  this.productInfo = this.getAttribute("data-type") === "product" ? document.querySelector("product-info") : document.querySelector("ajax-product-framing product-info");
        //this.atcBtn = this.productInfo?.querySelector("[js-atc-btn]");

        this.updateScroll();
        this.updateStepProgressBar();
        this.updateStepMeter();
        this.isLastStep ? this.handleFrameDetails() : null;
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

       

        isUnavailableSize ? null : this.checkSelection();

        const width = parseInt(this.querySelector("[name='properties[width]']").value);
        const height = parseInt(this.querySelector("[name='properties[height]']").value);


       if(currentTarget.getAttribute("is") != "width-parameter" && currentTarget.getAttribute("is") != "_height") {
            localStorage.setItem(`${currentTarget.getAttribute("data-parameter-name")}-parameter`, currentTarget.value);
        }
      else {
        if(width && height) {
          
          const relevantSize = this.getSizeOnRange(Math.max(width, height));
          const orderVariant = this.getAttribute('data-size-variant');
          const orderVariantRange = this.sizeRange.find(size => {
            if(size.name.toLowerCase() == orderVariant) {
                return size;
            }
          });
         
          
          if(relevantSize != undefined && orderVariantRange != undefined) {
            this.orderSelectedRange = relevantSize;
            if(relevantSize.name.toLowerCase() == this.getAttribute('data-size-variant')) {
                 //============ Same
                 this.updateOversizeMeaturements('same');
            }
            else {
                 //=============== Upper / lower
                const range = orderVariantRange.range.split("-");
                const min = parseInt(range[0].trim());
                const isBiggest = this.checkSizeRange(relevantSize, min);
                
                this.updateOversizeMeaturements(isBiggest?'oversize':'lowersize');
            }
          } 
        }
      }
      
     
        const isOversized = Math.max(width, height) >= 90;
       
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

            if(parseInt(this.querySelector("[data-name='clearance_bottom']").value) === 0) {
                this.edgesStep.classList.remove("hidden");
              
            }else {
                this.edgesStep.classList.add("hidden");
                
                const uniqueKey = this.getAttribute('data-key');
                localStorage.setItem(`_edges_align_${uniqueKey}`, 'N/A'); 
                let edgeAlignElement = this.orderForm?.querySelector(`#_edges_align_${uniqueKey}`);
                edgeAlignElement.value = 'N/A';

               // this.edgeParameters[1].querySelector('input').checked = true;
                this.edgeParameters.forEach( el => el.classList.remove("is-checked"));
                //this.edgeParameters[1].classList.add("is-checked");
              
            }
        };

      
       currentTarget.querySelector('option[js-select-hide-option]')?.classList.add('hidden');

      
        let elementId = currentTarget.getAttribute('data-parameter-name');
        let formElement = this.orderForm?.querySelector(`#${elementId}`);
        formElement.value = currentTarget.value;
        
    }

    handleWidthHeightDimension() {

        const uniqueKey = this.getAttribute('data-key');
        localStorage.setItem(`${this.querySelector("[name='properties[width]']").getAttribute("data-parameter-name")}-parameter`, this.querySelector("[name='properties[width]']").value);
        localStorage.setItem(`${this.querySelector("[name='properties[height]']").getAttribute("data-parameter-name")}-parameter`, this.querySelector("[name='properties[height]']").value);
        
        let elementId = this.overSizeField.querySelector('input').getAttribute('data-parameter-name');
        let formElement = this.orderForm?.querySelector(`#${elementId}`);
        let formPriceElement = this.orderForm?.querySelector(`#_payment_${uniqueKey}`);
        if(this.overSizeField.querySelector('input').checked) {  
          localStorage.setItem(this.overSizeField.querySelector('input').getAttribute('data-parameter-name'), this.orderSelectedRange.name);
          localStorage.setItem(`_frame_price_${uniqueKey}`, this.orderSelectedRange.price);
          formElement.value = this.orderSelectedRange.name;
          formElement.setAttribute('name', '_measurements_size');

          formPriceElement.setAttribute('name', '_price');
          
        }
        else {
           localStorage.removeItem(this.overSizeField.querySelector('input').getAttribute('data-parameter-name'));
           formElement.value = '';
           formElement.removeAttribute('name');
           formPriceElement.removeAttribute('name');
        }
    }
    
  
    changeOverSize(event) {
      if(event.target.checked) {
         this.firstContinueBtn.classList.remove('btn-disabled');
      }
      else {
         this.firstContinueBtn.classList.add('btn-disabled');
      }
    }

    checkFrameSize(width, height) {

          let tempValue = '';
          const relevantSize = this.getSizeOnRange(Math.max(width, height));
          const orderVariant = this.getAttribute('data-size-variant');
          const orderVariantRange = this.sizeRange.find(size => {
            if(size.name.toLowerCase() == orderVariant) {
                return size;
            }
          });
         
          
          if(relevantSize != undefined && orderVariantRange != undefined) {
            this.orderSelectedRange = relevantSize;
            if(relevantSize.name.toLowerCase() == this.getAttribute('data-size-variant')) {
                 //============ Same
                 tempValue = 'same';
            }
            else {
                 //=============== Upper / lower
                const range = orderVariantRange.range.split("-");
                const min = parseInt(range[0].trim());
                const isBiggest = this.checkSizeRange(relevantSize, min);

                if(isBiggest) {
                   tempValue = 'oversize';
                }
                else {
                  tempValue = 'lowersize';
                }
            }
          } 
       return tempValue;
    }
  
    updateOversizeMeaturements(meaturementSize) {
         this.overSizeField.querySelector('input').checked = false;
         if(meaturementSize == 'same') {
            this.overSizeField.classList.add('hidden');
            this.firstContinueBtn.classList.remove('btn-disabled');
         }
         else {
            this.overSizeField.classList.remove('hidden');
            this.firstContinueBtn.classList.add('btn-disabled');
            this.overSizeField.querySelector('input').focus();
            if(meaturementSize == 'oversize') {
                this.overSizeField.querySelector('[js-oversize-field-text]')?.classList.remove('hidden');
                this.overSizeField.querySelector('[js-lowersize-field-text]')?.classList.add('hidden');
            }
            else {
                this.overSizeField.querySelector('[js-oversize-field-text]')?.classList.add('hidden');
                this.overSizeField.querySelector('[js-lowersize-field-text]')?.classList.remove('hidden');
            } 
         }
     }
  
    checkSizeRange(relevantSize, value) {
        let tempValue = false;
        const range = relevantSize.range.split("-");
        if(relevantSize.range != '') {
            const max = parseInt(range[1].trim());
            if(value < max) {
              tempValue = true;
            }
        }
        return tempValue;
    }
  
    getSizeOnRange(value) {
        return this.sizeRange.find(size => {
            const range = size.range.split("-");
            if(size.range != '') {
            const min = parseInt(range[0].trim());
            const max = parseInt(range[1].trim());

            if(value >= min && value <= max) {
                return size;
            }
           }
        });
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
      
        localStorage.setItem(`${currentTarget.getAttribute("data-parameter-name")}`, currentTarget.checked ? "Yes" : "No");


        let elementId = currentTarget.getAttribute('data-parameter-name');
        let formElement = this.orderForm?.querySelector(`#${elementId}`);
        formElement.value = currentTarget.checked ? "Yes" : "No";
      
    }

    handleMute({ currentTarget }) {
        const video = this.currentStep.querySelector("[js-sample-video]");
        if(!video) return;

        currentTarget.classList.toggle("is-muted");
        currentTarget.classList.contains("is-muted") ? video.muted = true : video.muted = false;
    }

    handleFrameDetails() {

     
       // const sizeFieldset = this.productInfo?.querySelector("[js-size-fieldset]");
        //const selectedSizeField = sizeFieldset?.querySelector("input:checked");

        const widthField = this.querySelector("[name='properties[width]']");
        const widthParameter = widthField.closest("[js-parameter]");
        const widthFraction = this.querySelector("[name='properties[width_fraction]']").value;
        const width = widthParameter.classList.contains("is-unselected") ? "" : parseInt(widthField.value);

        const heightField = this.querySelector("[name='properties[height]']");
        const heightParameter = heightField.closest("[js-parameter]");
        const heightFraction = this.querySelector("[name='properties[height_fraction]']").value;
        const height = heightParameter.classList.contains("is-unselected") ? "" : parseInt(heightField.value);

        const clearanceTopField = this.querySelector("[name='properties[clearance_top]']");
        const clearanceTop = clearanceTopField.closest(".is-unselected") ? "" : clearanceTopField.value;
        const clearanceRightField = this.querySelector("[name='properties[clearance_right]']");
        const clearanceRight = clearanceRightField.closest(".is-unselected") ? "" : clearanceRightField.value;
        const clearanceBottomField = this.querySelector("[name='properties[clearance_bottom]']");
        const clearanceBottom = clearanceBottomField.closest(".is-unselected") ? "" : clearanceBottomField.value;
        const clearanceLeftField = this.querySelector("[name='properties[clearance_left]']");
        const clearanceLeft = clearanceLeftField.closest(".is-unselected") ? "" : clearanceLeftField.value;

        const clipTop = this.querySelector("[data-name='properties[clips_channels_top]']").value;
        const clipRight = this.querySelector("[data-name='properties[clips_channels_right]']").value;
        const clipBottom = this.querySelector("[data-name='properties[clips_channels_bottom]']").value;
        const clipLeft = this.querySelector("[data-name='properties[clips_channels_left]']").value;

        const edgesAlignField = this.querySelector("[data-name='properties[edges_align]']:checked");
       
        const edgesAlign = edgesAlignField?.value || "N/A";
        
        const mainDimensionStep = this.querySelector("[js-frame-step][js-dimension-step]");
        if(!mainDimensionStep.querySelector(".is-unselected") && !mainDimensionStep.querySelector("[js-unavailable-size]")) {
            mainDimensionStep.querySelector("[js-continue-btn]").classList.remove("disabled");
        };
        const hasDisabledContinueBtn = this.querySelector("[js-continue-btn].disabled") && true;

       

       this.mirrorSize.forEach( el => {
            if(width || height) {
                el.textContent = `${widthField.value} ${widthFraction}" x ${heightField.value} ${heightFraction}"`
            }else {
                el.textContent = ""
            }
        });

        const frameWidth = width + eval(widthFraction) + eval(clearanceLeft) + eval(clearanceRight);
        const frameHeight = height + eval(heightFraction) + eval(clearanceTop) + eval(clearanceBottom);

        const frameSizeObj = this.handleFrameSize(frameWidth, frameHeight);

        this.frameSize.textContent = Object.keys(frameSizeObj).length ? `Width: ${frameSizeObj.frame_width_value} ${frameSizeObj.frame_width_fraction_value ? frameSizeObj.frame_width_fraction_value : ""}", Height: ${frameSizeObj.frame_height_value} ${frameSizeObj.frame_height_fraction_value ? frameSizeObj.frame_height_fraction_value : ""}"` : "";
       
      
        const spaceDimensions = `${ clearanceTop ? `Top: ${clearanceTop}",` : "" } ${ clearanceBottom ? `Bottom: ${clearanceBottom}",` : "" } ${ clearanceRight ? `Right: ${clearanceRight}",` : "" } ${ clearanceLeft ? `Left: ${clearanceLeft}",` : "" }`;
        this.spaceAround.textContent = spaceDimensions.trim().length ? spaceDimensions.trim().replace(/,$/, '') : "";

        const clips = `${clipTop === "Yes" ? "Top," : ""} ${clipBottom === "Yes" ? "Bottom," : ""} ${clipRight === "Yes" ? "Right," : ""} ${clipLeft === "Yes" ? "Left," : ""}`;

     
        this.clips.textContent = clips.trim().length ? clips.trim().replace(/,$/, '') : "N/A";
        this.edgesAlign.textContent = edgesAlign;
      
       // const disable = this.atcBtn?.classList.contains("is-soldout") ? true : false;

       
       // this.toggleAtcBtn(hasDisabledContinueBtn, edgesAlignField, disable);


         
           const uniqueKey = this.getAttribute('data-key');
           let overSizeValue = '';
           let frameSize = '';
           if(this.orderSelectedRange == '') {
              overSizeValue = localStorage.getItem(`_measurements_size_${uniqueKey}`);
              frameSize = localStorage.getItem(`_frame_price_${uniqueKey}`);
           } 
           else {
             overSizeValue = this.orderSelectedRange.name;
             frameSize = this.orderSelectedRange.price;
           }

         
           if(this.sizeTitle) this.sizeTitle.innerHTML = overSizeValue; 
           if(this.framePrice) this.framePrice.innerHTML = frameSize; 
       
         
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

      
         const uniqueKey = this.getAttribute('data-key');
         let frameWidthField = this.orderForm?.querySelector(`#_frame_width_${uniqueKey}`);
         frameWidthField.value = frame_width_value;
        
         let frameHeightField = this.orderForm?.querySelector(`#_frame_height_${uniqueKey}`);
         frameHeightField.value = frame_height_value;

         let frameWidthFractionField = this.orderForm?.querySelector(`#_frame_WidthFraction_${uniqueKey}`);
         frameWidthFractionField.value = frame_width_fraction_value;
        
         let frameHeightFractionField = this.orderForm?.querySelector(`#_frame_HeightFraction_${uniqueKey}`);
         frameHeightFractionField.value = frame_height_fraction_value;

        return {
            frame_width_value,
            frame_width_fraction_value,
            frame_height_value,
            frame_height_fraction_value
        }

    }
  
    // toggleAtcBtn(hasDisabledContinueBtn, edgesAlignField, disable) {
    //     if(hasDisabledContinueBtn || edgesAlignField === null || disable) {
    //         this.atcBtn?.setAttribute("disabled", "disabled")
    //     }else {
    //         this.atcBtn?.removeAttribute("disabled");
    //     }
    // }

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
            const model = evt.currentTarget.closest(".is-open")
            model?.classList.remove('is-open');
        }else {
            this.model?.classList.remove('is-open');
        }
    }

    handleCloseModel(evt) {
        this.open(evt);
    }

    resetFrame(event) {
       
        this.clearLocalStorage();
         window.location.href = this.getAttribute('href');
    }

    clearLocalStorage() {
      
        const uniqueKey = this.getAttribute('data-key');
        localStorage.removeItem("variant-name");
      
        localStorage.removeItem(`_width_${uniqueKey}-parameter`);
        localStorage.removeItem(`_width_fraction_${uniqueKey}-parameter`);
        localStorage.removeItem(`_height_${uniqueKey}-parameter`);
        localStorage.removeItem(`_height_fraction_${uniqueKey}-parameter`);
        localStorage.removeItem(`_clearance_top_${uniqueKey}-parameter`);
        localStorage.removeItem(`_clearance_right_${uniqueKey}-parameter`);
        localStorage.removeItem(`_clearance_bottom_${uniqueKey}-parameter`);
        localStorage.removeItem(`_clearance_left_${uniqueKey}-parameter`);
        localStorage.removeItem(`_clips_channels_top_${uniqueKey}`);
        localStorage.removeItem(`_clips_channels_right_${uniqueKey}`);
        localStorage.removeItem(`_clips_channels_bottom_${uniqueKey}`);
        localStorage.removeItem(`_clips_channels_left_${uniqueKey}`);
        localStorage.removeItem(`_edges_align_${uniqueKey}`);
        localStorage.removeItem(`_measurements_size_${uniqueKey}`);
        localStorage.removeItem(`_frame_price_${uniqueKey}`);

    }

    updateState(list, target, cls) {
        list.forEach(item => item.classList.remove(cls));
        target.classList.add(cls)
    }

    handleCacheData() {
     
        const uniqueKey = this.getAttribute('data-key');
        const params = {
            //sizeName: localStorage.getItem("variant-name"),
            width: localStorage.getItem(`_width_${uniqueKey}-parameter`),
            width_fraction: localStorage.getItem(`_width_fraction_${uniqueKey}-parameter`),
            height: localStorage.getItem(`_height_${uniqueKey}-parameter`),
            height_fraction: localStorage.getItem(`_height_fraction_${uniqueKey}-parameter`),
            clearance_top: localStorage.getItem(`_clearance_top_${uniqueKey}-parameter`),
            clearance_right: localStorage.getItem(`_clearance_right_${uniqueKey}-parameter`),
            clearance_bottom: localStorage.getItem(`_clearance_bottom_${uniqueKey}-parameter`),
            clearance_left: localStorage.getItem(`_clearance_left_${uniqueKey}-parameter`),
            clipTop: localStorage.getItem(`_clips_channels_top_${uniqueKey}`),
            clipRight: localStorage.getItem(`_clips_channels_right_${uniqueKey}`),
            clipBottom: localStorage.getItem(`_clips_channels_bottom_${uniqueKey}`),
            clipLeft: localStorage.getItem(`_clips_channels_left_${uniqueKey}`),
            edges: localStorage.getItem(`_edges_align_${uniqueKey}`),
            oversize: localStorage.getItem(`_measurements_size_${uniqueKey}`),
            framePrice: localStorage.getItem(`_frame_price_${uniqueKey}`)
        };

     
        this.parameterSelects.forEach(el => {
            const paramName = el.getAttribute("data-name");
            const paramValue = params[this.toCamelCase(paramName)];
            if (paramValue) {
                const parameterElement = el.closest("[js-parameter]");
                parameterElement.classList.remove("is-unselected");
                const option = el.querySelector(`option[value="${paramValue}"]`);
                option ? option.selected = true : null;

                el.querySelector('option[js-select-hide-option]')?.classList.add('hidden');
                let elementId = el.getAttribute('data-parameter-name');
                let formElement = this.orderForm?.querySelector(`#${elementId}`);
                formElement.value = paramValue;
            }
        });


      //======for Hide steps
          if(parseInt(this.querySelector("[data-name='clearance_bottom']").value) === 0) {
            this.edgesStep.classList.remove("hidden");
          } else if(this.querySelector("[data-name='clearance_bottom']").value != '') {
           
            this.edgesStep.classList.add("hidden");
            localStorage.setItem(`_edges_align_${uniqueKey}`, 'N/A'); 
            let edgeAlignElement = this.orderForm?.querySelector(`#_edges_align_${uniqueKey}`);
            edgeAlignElement.value = 'N/A';
            
            this.edgeParameters.forEach( el => el.classList.remove("is-checked"));
            //this.edgeParameters[1].classList.add("is-checked");
          }
      
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
                  if(paramValue == 'Yes') {  
                      el.checked = true;
                      clipField.checked = true;
                  }
                  else {
                     el.checked = false;
                      clipField.checked = false;
                  }
                clipField.value = paramValue === "Yes" ? "Yes" : "No";


                let elementId = el.getAttribute('data-parameter-name');
                let formElement = this.orderForm?.querySelector(`#${elementId}`);
                formElement.value = paramValue;
            }
            else {
                const field = el.closest("[js-clip-field]");
                const clipField = field.querySelector("input[type='hidden']");
                let elementId = el.getAttribute('data-parameter-name');
                let formElement = this.orderForm?.querySelector(`#${elementId}`);
                formElement.value = clipField.value;
            }
        });

    
        if(params.edges) {
            this.edgeParameters.forEach( el => {
                const field = el.querySelector("input");
                if(field.value === params.edges) {
                    el.classList.add("is-checked");
                    field.checked = true;
                  
                    let elementId = el.getAttribute('data-parameter-name');
                    let formElement = this.orderForm?.querySelector(`#${elementId}`);
                    formElement.value = params.edges;
                  
                }

                
            })
        };


       if(params.oversize) {
            this.overSizeField.querySelector('input').checked = true;
            let elementId = this.overSizeField.querySelector('input').getAttribute('data-parameter-name');
            let formElement = this.orderForm?.querySelector(`#${elementId}`);
            let formPriceElement = this.orderForm?.querySelector(`#_payment_${uniqueKey}`);
            formElement.value = params.oversize;
            formElement.setAttribute('name', '_measurements_size');
            this.overSizeField.classList.remove('hidden');
            formPriceElement.setAttribute('name', '_price');
            let meaturementSize = this.checkFrameSize(params.width, params.height);
            //console.log('meaturementSize', meaturementSize);
            if(meaturementSize == 'oversize') {
                this.overSizeField.querySelector('[js-oversize-field-text]')?.classList.remove('hidden');
                this.overSizeField.querySelector('[js-lowersize-field-text]')?.classList.add('hidden');
            }
            else {
                this.overSizeField.querySelector('[js-oversize-field-text]')?.classList.add('hidden');
                this.overSizeField.querySelector('[js-lowersize-field-text]')?.classList.remove('hidden');
            } 
       }
       else {
            let elementId = this.overSizeField.querySelector('input').getAttribute('data-parameter-name');
            let formElement = this.orderForm?.querySelector(`#${elementId}`);
            let formPriceElement = this.orderForm?.querySelector(`#_payment_${uniqueKey}`);
            formElement.removeAttribute('name');
            formPriceElement.removeAttribute('name');
            formElement.value = '';
       }
      
        

         if(params.edges) {
             this.updateStepNew(5);
         }
         else if(params.clipTop && params.clipRight && params.clipLeft && params.clipBottom) {
            this.updateStepNew(4);
         }
         else if(params.clearance_top && params.clearance_right && params.clearance_bottom && params.clearance_left) {
            this.updateStepNew(3);
         }
         else if(params.width && params.width_fraction && params.height && params.height_fraction) {
           this.updateStepNew(2);
         }
         
        
      
    }

    updateStepNew(step) {
      
       this.step = step;

       if(this.edgesStep.classList.contains("hidden") && this.step == 4) {
          this.step = this.step+1;
       }
       
       
        this.frameSteps.forEach( frameStep => frameStep.classList.remove("is-active"));
        this.currentStep = this.querySelector(`[js-frame-step][data-step="${this.step}"]`);
        this.currentStep.classList.add("is-active");
      
       
        this.isLastStep = this.currentStep.getAttribute("is") === "last-step";

        this.step === 1 ? this.backBtn.classList.add("disabled") : this.backBtn.classList.remove("disabled");

        if(this.currentStep.classList.contains("has-video")) {
            const video = this.currentStep.querySelector("[js-sample-video]");
            video?.play();
        }else {
            this.sampleVideos?.forEach( video => video.pause());
        }

       
        this.updateScroll();
        this.updateStepProgressBar();
        this.updateStepMeter();
        this.isLastStep ? this.handleFrameDetails() : null;
      
    }
  
    toCamelCase(str) {
        return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
    }
}

customElements.define('frame-model-order', FrameModelOrder);



