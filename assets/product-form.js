if (!customElements.get('product-form')) {
  customElements.define(
    'product-form',
    class ProductForm extends HTMLElement {
      constructor() {
        super();

        this.form = this.querySelector('form');
        this.getAttribute("is") === "multi-order-form" ? null : this.variantIdInput.disabled = false ;
        this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
        this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        this.submitButton = this.querySelector('[type="submit"]');
        this.submitButtonText = this.submitButton.querySelector('span');

        if (document.querySelector('cart-drawer')) this.submitButton.setAttribute('aria-haspopup', 'dialog');

        this.hideErrors = this.dataset.hideErrors === 'true';
      }

      onSubmitHandler(evt) {
        evt.preventDefault();
        if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

        this.handleErrorMessage();

        this.submitButton.setAttribute('aria-disabled', true);
        this.submitButton.classList.add('loading');
        this.querySelector('.loading__spinner').classList.remove('hidden');

        const config = fetchConfig('javascript');
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        delete config.headers['Content-Type'];

        if(this.classList.contains("is-measurement-later")) {
          const variantId = this.querySelector("[data-name='id']").getAttribute("data-variant-id");
          const shippingAttrValue = localStorage.getItem("variant-name");
          const shippingAttr = `_${shippingAttrValue.toLowerCase().replace(/\s+/g, '_')}`;

          const data = {
            items: [
              {
                id: variantId,
                quantity: 1,
                properties: {
                  _measurements: "required",
                  [shippingAttr]: "1",
                  Measurements: "Pending"
                }
              }
            ],
            sections: this.cart.getSectionsToRender().map((section) => section.id),
            sections_url: window.location.pathname
          };

          fetch(`${routes.cart_add_url}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(data)
          })
          .then((response) => response.json())
          .then((response) => {
            this.cart.renderContents(response);
          })
          .catch((e) => {
            console.error(e);
          })
          .finally(() => {
            this.submitButton.classList.remove('loading');
            if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
            if (!this.error) this.submitButton.removeAttribute('aria-disabled');
            this.querySelector('.loading__spinner').classList.add('hidden');
          });
          return;
        };

        const formData = new FormData(this.form);
        if (this.cart) {
          formData.append(
            'sections',
            this.cart.getSectionsToRender().map((section) => section.id)
          );
          formData.append('sections_url', window.location.pathname);
          this.cart.setActiveElement(document.activeElement);
        }
        config.body = formData;

        const url = this.closest("frame-model")?.getAttribute('data-mode') === "update" ? routes.cart_change_url : routes.cart_add_url;

        fetch(`${url}`, config)
          .then((response) => response.json())
          .then((response) => {
            if (response.status) {
              publish(PUB_SUB_EVENTS.cartError, {
                source: 'product-form',
                productVariantId: formData.get('id'),
                errors: response.errors || response.description,
                message: response.message,
              });
              this.handleErrorMessage(response.description);

              const soldOutMessage = this.submitButton.querySelector('.sold-out-message');
              if (!soldOutMessage) return;
              this.submitButton.setAttribute('aria-disabled', true);
              this.submitButtonText.classList.add('hidden');
              soldOutMessage.classList.remove('hidden');
              this.error = true;
              return;
            } else if (!this.cart) {
              window.location = window.routes.cart_url;
              return;
            }

            if (!this.error)
              publish(PUB_SUB_EVENTS.cartUpdate, {
                source: 'product-form',
                productVariantId: formData.get('id'),
                cartData: response,
              });
            this.error = false;
            const quickAddModal = this.closest('quick-add-modal');
            if (quickAddModal) {
              document.body.addEventListener(
                'modalClosed',
                () => {
                  setTimeout(() => {
                    this.cart.renderContents(response);
                  });
                },
                { once: true }
              );
              quickAddModal.hide(true);
            } else {
              this.width = localStorage.getItem("width-parameter");
              this.width_fraction = localStorage.getItem("width-fraction-parameter");
              this.height = localStorage.getItem("height-parameter");
              this.height_fraction = localStorage.getItem("height-fraction-parameter");
              this.clearance_top = localStorage.getItem("top-space-parameter");
              this.clearance_right = localStorage.getItem("right-space-parameter");
              this.clearance_bottom = localStorage.getItem("bottom-space-parameter");
              this.clearance_left = localStorage.getItem("left-space-parameter");
              this.clips_channels_top = localStorage.getItem("clip-top");
              this.clips_channels_right = localStorage.getItem("clip-right");
              this.clips_channels_bottom = localStorage.getItem("clip-bottom");
              this.clips_channels_left = localStorage.getItem("clip-left");
              this.edges_align = localStorage.getItem("edges-parameter");
              this.lineQuantity = parseInt(localStorage.getItem("line-quantity"));
              const oversizedLineQuantity = parseInt(localStorage.getItem("line-oversized-quantity"));
              this.selectedSizeValue = localStorage.getItem("variant-name");

              
              const frameModel = this.closest("frame-model");
              this.variantId = frameModel?.querySelector("[data-name='id']")?.getAttribute("data-variant-id");
              this.cart.renderContents(response);
              if(!frameModel) return;

              if(!frameModel.getAttribute("data-mode") || !frameModel.getAttribute("data-mode") === "update") return;

              const oversizedVariantId = frameModel.querySelector("[js-oversized-product-field]").value;

              const isOversized = Math.max(this.width, this.height) >= 90;

              const maxDimension = Math.max(this.width, this.height);

              this.shippingAttrValue = "1";
              this.shippingAttr = frameModel.getAttribute("data-user-type") === 'r' ? `_${this.selectedSizeValue.toLowerCase().replace(/\s+/g, '_')}` : this.getRange(maxDimension);

              if((!JSON.parse(frameModel.getAttribute("data-has-oversized")) && !isOversized) && (localStorage.getItem("line-size-value") !== this.selectedSizeValue)) {
                this.cart.classList.add("is-loading");
                const data = {
                  items: [
                    {
                      id: this.variantId,
                      quantity: this.lineQuantity,
                      properties: {
                        _width: this.width,
                        _width_fraction: this.width_fraction,
                        _height: this.height,
                        _height_fraction: this.height_fraction,
                        _clearance_top: this.clearance_top,
                        _clearance_right: this.clearance_right,
                        _clearance_bottom: this.clearance_bottom,
                        _clearance_left: this.clearance_left,
                        _clips_channels_top: this.clips_channels_top,
                        _clips_channels_right: this.clips_channels_right,
                        _clips_channels_bottom: this.clips_channels_bottom,
                        _clips_channels_left: this.clips_channels_left,
                        _edges_align: this.edges_align,
                        [this.shippingAttr]: this.shippingAttrValue
                      }
                    }
                  ]
                };

                this.handleEditLineItem(routes.cart_add_url, data);
              }
              else if((!JSON.parse(frameModel.getAttribute("data-has-oversized")) && isOversized) && (localStorage.getItem("line-size-value") !== this.selectedSizeValue)) {
                this.cart.classList.add("is-loading");
                const data = {
                  items: [
                    {
                      id: oversizedVariantId,
                      quantity: this.lineQuantity
                    },
                    {
                      id: this.variantId,
                      quantity: this.lineQuantity,
                      properties: {
                        _width: this.width,
                        _width_fraction: this.width_fraction,
                        _height: this.height,
                        _height_fraction: this.height_fraction,
                        _clearance_top: this.clearance_top,
                        _clearance_right: this.clearance_right,
                        _clearance_bottom: this.clearance_bottom,
                        _clearance_left: this.clearance_left,
                        _clips_channels_top: this.clips_channels_top,
                        _clips_channels_right: this.clips_channels_right,
                        _clips_channels_bottom: this.clips_channels_bottom,
                        _clips_channels_left: this.clips_channels_left,
                        _edges_align: this.edges_align,
                        [this.shippingAttr]: this.shippingAttrValue
                      }
                    }
                  ]
                };

                this.handleEditLineItem(routes.cart_add_url, data);
              }else if((!JSON.parse(frameModel.getAttribute("data-has-oversized")) && isOversized) && (localStorage.getItem("line-size-value") === this.selectedSizeValue)) {
                this.cart.classList.add("is-loading");
                const data = {
                  items: [
                    {
                      id: oversizedVariantId,
                      quantity: this.lineQuantity
                    }
                  ]
                };

                this.handleEditLineItem(routes.cart_add_url, data);
              }else if(JSON.parse(frameModel.getAttribute("data-has-oversized")) && !isOversized) {
                this.cart.classList.add("is-loading");
                const data = {
                  id: oversizedVariantId,
                  quantity: oversizedLineQuantity - this.lineQuantity
                };

                const nested = localStorage.getItem("line-size-value") !== this.selectedSizeValue ? "nested-fetch" : "simple-fetch";
                this.handleEditLineItem(routes.cart_change_url, data, nested);
              }else if((JSON.parse(frameModel.getAttribute("data-has-oversized")) && isOversized) && (localStorage.getItem("line-size-value") !== this.selectedSizeValue)) {
                this.cart.classList.add("is-loading");
                const data = {
                  items: [
                    {
                      id: this.variantId,
                      quantity: this.lineQuantity,
                      properties: {
                        _width: this.width,
                        _width_fraction: this.width_fraction,
                        _height: this.height,
                        _height_fraction: this.height_fraction,
                        _clearance_top: this.clearance_top,
                        _clearance_right: this.clearance_right,
                        _clearance_bottom: this.clearance_bottom,
                        _clearance_left: this.clearance_left,
                        _clips_channels_top: this.clips_channels_top,
                        _clips_channels_right: this.clips_channels_right,
                        _clips_channels_bottom: this.clips_channels_bottom,
                        _clips_channels_left: this.clips_channels_left,
                        _edges_align: this.edges_align,
                        [this.shippingAttr]: this.shippingAttrValue
                      }
                    }
                  ]
                };

                this.handleEditLineItem(routes.cart_add_url, data);
              }
            }
          })
          .catch((e) => {
            console.error(e);
          })
          .finally(() => {
            this.submitButton.classList.remove('loading');
            if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
            if (!this.error) this.submitButton.removeAttribute('aria-disabled');
            this.querySelector('.loading__spinner').classList.add('hidden');
          });
      }

      handleEditLineItem(url, data, role = "simple-fetch") {
        data["sections"] = this.cart.getSectionsToRender().map((section) => section.id);
        data["sections_url"] = window.location.pathname;

        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
          this.cart.renderContents(data);
          if(role === "simple-fetch") {
            this.cart.classList.remove("is-loading");

            localStorage.removeItem("line-index");
            localStorage.removeItem("frame-trigger-step");
            localStorage.removeItem("line-quantity");
            localStorage.removeItem("line-oversized");
            localStorage.removeItem("line-oversized-quantity");
            localStorage.removeItem("line-size-value");
          }else {
            const addData = {
              items: [
                {
                  id: this.variantId,
                  quantity: this.lineQuantity,
                  properties: {
                    _width: this.width,
                    _width_fraction: this.width_fraction,
                    _height: this.height,
                    _height_fraction: this.height_fraction,
                    _clearance_top: this.clearance_top,
                    _clearance_right: this.clearance_right,
                    _clearance_bottom: this.clearance_bottom,
                    _clearance_left: this.clearance_left,
                    _clips_channels_top: this.clips_channels_top,
                    _clips_channels_right: this.clips_channels_right,
                    _clips_channels_bottom: this.clips_channels_bottom,
                    _clips_channels_left: this.clips_channels_left,
                    _edges_align: this.edges_align,
                    [this.shippingAttr]: this.shippingAttrValue
                  }
                }
              ]
            };
            addData["sections"] = this.cart.getSectionsToRender().map((section) => section.id);
            addData["sections_url"] = window.location.pathname;

            fetch(routes.cart_add_url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify(addData)
            })
            .then(response => response.json())
            .then(data => {
              this.cart.renderContents(data);
              this.cart.classList.remove("is-loading");

              localStorage.removeItem("line-index");
              localStorage.removeItem("frame-trigger-step");
              localStorage.removeItem("line-quantity");
              localStorage.removeItem("line-oversized");
              localStorage.removeItem("line-oversized-quantity");
              localStorage.removeItem("line-size-value");
            })
            .catch(error => {
              console.error(error);
            });
          }
        })
        .catch(error => {
          console.error(error);
        });
      }

      handleErrorMessage(errorMessage = false) {
        if (this.hideErrors) return;

        this.errorMessageWrapper =
          this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
        if (!this.errorMessageWrapper) return;
        this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

        this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage;
        }
      }

      toggleSubmitButton(disable = true, text) {
        if(!this.submitButton) return;

        if (disable) {
          this.submitButton.classList.add("is-soldout");
          this.submitButton.setAttribute('disabled', 'disabled');
          if (text) this.submitButtonText.textContent = text;
        } else {
          this.submitButton.classList.remove("is-soldout");
          this.submitButton.removeAttribute('disabled');
          this.submitButtonText.textContent = window.variantStrings.addToCart;
        }

        const frameModels = document.querySelectorAll("frame-model.is-open");
        if(frameModels.length) {
          frameModels.forEach( frameModel => {
            if(frameModel.closest("ajax-product-framing") && frameModel.getAttribute("data-mode") === "update") frameModel.querySelector("[js-atc-btn-label]").textContent = "update";

            const hasDisabledContinueBtn = this.classList.contains("is-measurement-later") ? false : frameModel.querySelector("[js-continue-btn].disabled") && true;
            const edgesAlignField = this.classList.contains("is-measurement-later") ? true : frameModel.querySelector("[data-name='properties[_edges_align]']:checked");
  
            frameModel.toggleAtcBtn(hasDisabledContinueBtn, edgesAlignField, disable);
          })
        }
      }

      get variantIdInput() {
        return this.form.querySelector('[name=id]') || this.form.querySelector('[name="items[0][id]"]') || this.form.querySelector("[data-name='id']");
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
    }
  );
}