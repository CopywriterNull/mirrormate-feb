class BundleBuilder extends HTMLElement {
    constructor() {
        super();
        this.productWrapperSelector = '[js-product-wrapper]';
        this.selectProductBtnSelector = '[js-select-product-btn]';
        this.selectProductQuantitySelector = '[js-select-product-quantity]';
        this.quantityInputSelector = '[js-quantity-input]';
        this.incrementBtnSelector = '[js-quantity-increment]';
        this.decrementBtnSelector = '[js-quantity-decrement]';
        this.selectionBoxSelector = '[js-selection-box]';
        this.selectionBoxListSelector = '[js-selection-box-list]';
        this.removeProductSelector = '[js-bundle-product-cross-icon]';
        this.progressCompleteBar = '[js-complete-progress-bar]';
        

        this.selectionCountWrappers = this.querySelectorAll('[js-selection-count-wrapper]');
        this.selectionCounts = this.querySelectorAll('[js-selection-count]'); 
        this.addToCartBtns = this.querySelectorAll('[js-bundle-addToCart-btn]');
        this.selectionRemainingCounts = this.querySelectorAll('[js-remaining-count]');
        this.bundleCompletedMsgs = this.querySelectorAll('[js-bundle-completed-msg]');
        this.bundleProcessMsgs = this.querySelectorAll('[js-bundle-processing-msg]');
        this.comparePriceWrappers = this.querySelectorAll('[js-product-compare-price]');
        this.priceWrappers = this.querySelectorAll('[js-product-price]');

        this.selectionCountButton = this.querySelectorAll('[js-selection-count-btn-wrapper]');

        this.totalBox = 5;
        this.products = [];

        this.addEventListener('click',(event)=>{
          this.querySelectorAll(this.selectProductBtnSelector).forEach(selectProductBtn=>{
            if(selectProductBtn.contains(event.target)) {

              const parent = selectProductBtn.closest(this.productWrapperSelector);
              const quantityField = parent.querySelector(this.quantityInputSelector);

              quantityField.stepUp();
         
              parent.classList.add('selected');
    
              this.addProductToBox(parent);
    
            }
          })
          this.querySelectorAll(this.incrementBtnSelector).forEach(incrementBtn => {
            if(incrementBtn.contains(event.target)) {
              const parent = incrementBtn.closest(this.productWrapperSelector);
              const quantityField = parent.querySelector(this.quantityInputSelector);
              quantityField.stepUp();
              this.addProductToBox(parent);
            }
          })

          this.querySelectorAll(this.decrementBtnSelector).forEach(decrementBtn => {
            if(decrementBtn.contains(event.target)) {
              const parent = decrementBtn.closest(this.productWrapperSelector);
              const currentProductId = Number(parent.dataset.productId);
              const quantityField = parent.querySelector(this.quantityInputSelector);
              quantityField.stepDown();
    
              this.removeProductFromBox(currentProductId, parent);
            }
          })
          this.querySelectorAll(this.removeProductSelector).forEach(removeItem => {
            if(removeItem.contains(event.target)) {
              // pass id, parent
              const selectedProductLine= removeItem.closest(`${this.selectionBoxSelector}[data-product-id]`)
              const pId = Number(selectedProductLine.dataset.productId)
              const parent = this.querySelector(`${this.productWrapperSelector}[data-product-id="${pId}"]`)
              const quantityField = parent.querySelector(this.quantityInputSelector);
              if(Number(quantityField.value) > 0) {
                quantityField.stepDown();
              }
              this.removeProductFromBox(pId, parent)
              if(this.totalBox > 5) {
                this.totalBox -= 1
              }
            }
          })

        }) 
        
        this.addToCartBtns.forEach(addToCartBtn => {

          addToCartBtn.addEventListener('click', (e) => {

            this.addToCartBtns.forEach(addToCartBtn => {
              addToCartBtn.querySelector('button').classList.add('loading');
              addToCartBtn.querySelector('.loading__spinner').classList.remove('hidden');
            })

            const productsId = [];
            const products = [];

            this.products.forEach(item => {
              // if(item.id != hbGiftProduct.id) {
                if(productsId.indexOf(item.id) === -1) {
                  productsId.push(item.id)
                  products.push({
                    id: item.id,
                    quantity: 1,
                  })
                } else { 
                  products[productsId.length - 1].quantity += 1;
                }
              // }
            })

            this.addToCart(products);
          })
        })

      this.createBox(this.totalBox);
      this.createStatus(this.totalBox);
  } 

  createBox(number) {
    this.querySelectorAll(this.selectionBoxListSelector).forEach((selectonBox)=>{
      selectonBox.innerHTML = ''
    });
    let productbox = '';
    for (let i = 0; i < number; i++) {
      productbox += `
      <div class="adding-card_container">
          <div class="hb_bundle--adding-card" data-index="${i}" js-selection-box="">
            <div class="hb_bundle--card-image selected-product-media">
                <img src="https://cdn.shopify.com/s/files/1/0090/5183/2386/files/Chelsea_BrushedBronze_Corner_2.png?v=1728636625" >
            </div>
            <div class="empty-selection">
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="56" height="56" fill="white"></rect>
                    <rect x="0.5" y="0.5" width="55" height="55" stroke="#2D4256" stroke-opacity="0.5" stroke-dasharray="4 4"></rect>
                </svg>  
            </div>
            <div class="hb_bundle--product-card">
                <div class="product-card__title">Choose a style</div>
                ${number - 1 === i? '<div class="hb_free-product">FREE</div>' : '<div class="product-card__price">$2</div>'}
            </div>
            <div class="card-icon" > 
                <div class="cross-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g opacity="0.5" clip-path="url(#clip0_6839_7362)">
                    <path d="M12.7148 3.28613L3.28675 12.7142" stroke="#2D4256" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                    <path d="M12.7132 12.7142L3.28516 3.28613" stroke="#2D4256" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                    </g>
                    <defs>
                    <clipPath id="clip0_6839_7362">
                    <rect width="16" height="16" fill="white"></rect>
                    </clipPath>
                    </defs>
                    </svg>
                    
                </div>
            </div>
          </div>
      </div>
    `
    }
    this.querySelectorAll(this.selectionBoxListSelector).forEach((selectionBox)=>{
      selectionBox.insertAdjacentHTML('beforeend', productbox);
    })
  }
  createStatus(number) {
    this.querySelectorAll(this.progressCompleteBar).forEach((progressBar)=>{
      progressBar.innerHTML = ''
    });
    let completProgressBar = '';
    for (let i = 0; i < number; i++) {
      completProgressBar += `
      <div js-hb-progress-bar-line class="hb_bundle--message-bar-wrap" data-index="${i}"><div class="hb_bundle--message-bar"></div></div>
    `
    }
    this.querySelectorAll(this.progressCompleteBar).forEach((progressBar)=>{
      progressBar.insertAdjacentHTML('beforeend', completProgressBar);
    })
  }

  addProductToBox(parent) {
    const imageUrl = parent.dataset.productImageUrl;
    const productId = Number(parent.dataset.productId);
    const title = parent.dataset.productTitle;
    const price = Number(parent.dataset.productPrice);
    const comparePrice = Number(parent.dataset.productComparePrice);

    this.products.push({
      id: productId,
      imageUrl,
      title,
      price,
      quantity: 1,
      comparePrice,
    })

    // this.giftProduct();
    this.fillProductInSelectionBox(this.products);
    this.fillStatusBar(this.products);

  }

  removeProductFromBox(id, parent) {
    const otherProducts = this.products.filter(product => product.id !== id);
    const currentProducts = this.products.filter(product => product.id == id);
    currentProducts.splice(0, 1)
    if(currentProducts.length === 0) {
      parent.classList.remove('selected');
    }
    this.products = [...currentProducts, ...otherProducts];
    // this.giftProduct();
    this.fillProductInSelectionBox(this.products);
    this.fillStatusBar(this.products);
  }

  fillProductInSelectionBox(products) {
    this.createBox(this.totalBox);
    products.forEach((item, index) => {

      this.querySelectorAll(`${this.selectionBoxSelector}[data-index="${index}"]`).forEach((selectionBox)=>{
        selectionBox.innerHTML = '';
        selectionBox.classList.add('filled');
        selectionBox.setAttribute('data-product-id', item.id);
        selectionBox.insertAdjacentHTML('beforeend', `<div class="selected-product-media ${index === this.totalBox - 1? 'hb_free-gift': ''}">
          <img src="${item.imageUrl}">
      </div>
      <div class="empty-selection">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="56" height="56" fill="white"></rect>
              <rect x="0.5" y="0.5" width="55" height="55" stroke="#2D4256" stroke-opacity="0.5" stroke-dasharray="4 4"></rect>
          </svg> 
      </div>
      <div class="hb_bundle--product-card">
          <div class="product-card__title">${item.title}</div>
          ${index === this.totalBox - 1 ? '<div class="hb_free-product">FREE</div>': `<div class="product-card__price">$${item.price / 100}</div>`}
      </div>
      <div class="card-icon" js-bundle-product-cross-icon> 
            <div class="cross-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g opacity="0.5" clip-path="url(#clip0_6839_7362)">
                <path d="M12.7148 3.28613L3.28675 12.7142" stroke="#2D4256" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M12.7132 12.7142L3.28516 3.28613" stroke="#2D4256" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                </g>
                <defs>
                <clipPath id="clip0_6839_7362">
                <rect width="16" height="16" fill="white"></rect>
                </clipPath>
                </defs>
                </svg>
                
            </div>
        </div>
      `)
      })
    })
    this.updateStatus();
    this.updatePrice();
  }
  fillStatusBar(products) {
    this.createStatus(this.totalBox);
    products.forEach((item, index) => {
      this.querySelectorAll(`[js-hb-progress-bar-line][data-index="${index}"] .hb_bundle--message-bar`).forEach(line => {
        line.classList.add('active');
      })
    })
    this.updateStatus();
    this.updatePrice();
  }


  updatePrice() {
    let totalComparePrice = 0;
    this.products.forEach(product => {
      totalComparePrice += product.price;
    }) 

    let totalPrice = 0;
    this.products.forEach((product, index) => {
      // if(product.price && hbGiftProduct.id != product.id) {
      if(product.price && index != this.totalBox - 1) {
        totalPrice += product.price;
      }
    })

     this.comparePriceWrappers.forEach(comparePriceWrapper => {
       comparePriceWrapper.innerHTML = `$${totalComparePrice / 100}`
     })

     this.priceWrappers.forEach(priceWrapper => {
       priceWrapper.innerHTML = `$${totalPrice / 100}`
     })
  }

  giftProduct() {
    if(this.products.length === 4 && !this.products.some(product => product.id == hbGiftProduct.id)) {
    this.products = [...this.products, hbGiftProduct]
    } else {
      this.products = this.products.filter(product => product.id != hbGiftProduct.id)
    }
  }

  updateStatus() {
    this.querySelectorAll(this.incrementBtnSelector).forEach(item => {
      item.classList.remove('disabled')
    })
    this.querySelectorAll(this.selectProductBtnSelector).forEach(item => {
      item.classList.remove('disabled')
    })

    this.selectionCountWrappers.forEach(selectionCountWrapper => {
      selectionCountWrapper.classList.remove('hidden');
    })
   
    this.addToCartBtns.forEach(addToCartBtn => {
      addToCartBtn.classList.add('hidden');
    })
  
    this.selectionCountButton.forEach((selectionButton)=>{
      selectionButton.classList.add('hidden')
    })
    
    this.selectionCounts.forEach((selectionCount) => {
      selectionCount.innerHTML = `${this.products.length}/${this.totalBox}`;
    })

    this.selectionRemainingCounts.forEach((selectionRemainingCount) => {
      selectionRemainingCount.innerHTML = this.totalBox - this.products.length;
    })

    this.bundleCompletedMsgs.forEach(bundleCompletedMsg => {
      bundleCompletedMsg.classList.add('hidden');
    })
    this.bundleProcessMsgs.forEach(bundleProcessMsg => {
      bundleProcessMsg.classList.remove('hidden');
    })

    if(this.products.length === this.totalBox) {
      this.querySelectorAll(this.incrementBtnSelector).forEach(item => {
        item.classList.add('disabled')
      })
      this.querySelectorAll(this.selectProductBtnSelector).forEach(item => {
        item.classList.add('disabled')
      })

      this.addToCartBtns.forEach(addToCartBtn => {
        addToCartBtn.classList.remove('hidden');
      })
     
      this.selectionCountWrappers.forEach(selectionCountWrapper => {
        selectionCountWrapper.classList.add('hidden');
      })
      this.bundleCompletedMsgs.forEach(bundleCompletedMsg => {
        bundleCompletedMsg.classList.remove('hidden');
      })
      this.bundleProcessMsgs.forEach(bundleProcessMsg => {
        bundleProcessMsg.classList.add('hidden');
      })

      this.querySelectorAll(this.incrementBtnSelector).forEach(item => {
        item.classList.add('disabled')
      })
      this.selectionCountButton.forEach((selectionButton)=>{
        selectionButton.classList.remove('hidden')
      })
    }
  }

  async addToCart(products) {

    const requestBody = {
      items: products
    }

    const cartDrawer = document.querySelector('cart-drawer');
    if(cartDrawer){
      requestBody.sections = cartDrawer.getSectionsToRender().map((section) => section.id);
      try {
        const resp = await fetch(`${window.Shopify.routes.root}cart/add.js`, {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await resp.json();

        this.addToCartBtns.forEach(addToCartBtn => {
          addToCartBtn.querySelector('button').classList.remove('loading');
          addToCartBtn.querySelector('.loading__spinner').classList.add('hidden');
        })

        cartDrawer.renderContents(data);
        // document.querySelector('cart-drawer').open();
    
      } catch(err){
        console.log({ err })
      }
    }
  }

}

customElements.define('bundle-builder', BundleBuilder)

const collectionLinkTabs = document.querySelectorAll('[js-collection-links]')
const collectionLinkContents = document.querySelectorAll('[js-collection-contents]')

collectionLinkTabs.forEach((collectionLinkTab,index)=>{
    collectionLinkTab.addEventListener('click',()=>{
        collectionLinkTabs.forEach(collectiontab=>collectiontab.classList.remove('active'))
        collectionLinkTab.classList.add('active')
        collectionLinkContents.forEach(collectionContent=>collectionContent.classList.remove('active'))
        collectionLinkContents[index].classList.add('active')
    })
})

window.addEventListener('scroll', function() {
    let cardWrapper = document.querySelector('.hb_bundle--title-wrap');
    let body = document.querySelector('body');
  
    var cardWrapperPosition = cardWrapper.getBoundingClientRect();
  
    if (cardWrapperPosition.top < window.innerHeight && cardWrapperPosition.bottom >= 0) {
      body.classList.remove('fix-bundle-footer')
    } else {
      body.classList.add('fix-bundle-footer')
    }
  });

 let selectionCounts = document.querySelectorAll('[js-selection-count-btn]')
 let selectionBoxCloseIcon = document.querySelector('[js-selection-box-closs-icon]')
  if(selectionCounts){
    selectionCounts.forEach((selectionCount)=>{
      selectionCount.addEventListener('click',()=>{
        document.querySelector('.hb_bundle--beta').classList.add('active')
      })
    })
  }
  if(selectionBoxCloseIcon){
    selectionBoxCloseIcon.addEventListener('click',()=>{
      document.querySelector('.hb_bundle--beta').classList.remove('active')
    })
  }


