 const tabTitle = document.querySelectorAll('[js-tab-title]');
   tabTitle.forEach((item)=> {
     item.addEventListener('click', (event) => {
         const itemType = item.getAttribute('js-tab-title');
         const pageUrl =  item.getAttribute('js-url');
         if(document.querySelector(`[js-tab-content=${itemType}]`)){
            window.history.pushState('', '', pageUrl);
            document.querySelectorAll('[js-tab-content]').forEach((content)=> {
              content.style.display = 'none';
            });
            document.querySelectorAll('[js-tab-title]').forEach((title)=> {
               title.classList.remove('active');
            });
            item.classList.add('active');
            document.querySelector(`[js-tab-content=${itemType}]`).style.display = 'block';
         } 
     
        });
   });

   const accordionTitle = document.querySelectorAll('[js-accordion-title]');
   accordionTitle.forEach((item)=> {
     item.addEventListener('click', (event) => {
         document.querySelectorAll('[js-accordion]').forEach((content)=> {
          if(content != item.closest('[js-accordion]')) {content.classList.remove('active');}
         });
      
         item.closest('[js-accordion]')?.classList.toggle('active');
     });
   });


   const rowClikable = document.querySelectorAll('[js-row-clickable]');
   rowClikable.forEach((item)=> {
     item.addEventListener('click', (event) => {
        const linkHref = item.getAttribute('data-href');
        window.location = linkHref;
     });
   });



//============= Order details page

 const viewMore = document.querySelectorAll('[js-view-more]');
   viewMore.forEach((item)=> {
     item.addEventListener('click', (event) => {
         const uniqueID = item.getAttribute('js-view-more');
         document.querySelectorAll('[js-view-more]').forEach((view)=> {
          if(view != item) {view.classList.remove('active');}
         });
         document.querySelectorAll('[js-view-content]').forEach((content)=> {
          if(document.querySelector(`[js-view-content="${uniqueID}"]`) && content != document.querySelector(`[js-view-content="${uniqueID}"]`)) {content.classList.remove('active');}
         });
         item.classList.toggle('active');
         document.querySelector(`[js-view-content="${uniqueID}"]`)?.classList.toggle('active');
         
     });
   });


//============= Reorder Form

const reoderBtns = document.querySelectorAll('[js-reorder-btn]');

if(reoderBtns.length > 0) {
   reoderBtns.forEach((reoderBtn)=> {
    reoderBtn.addEventListener('click', (e) => {
      reoderBtn.classList.add('loading');
      const orderID = reoderBtn.getAttribute('js-reorder-btn');
      const reOrderForm = document.querySelector(`[js-reorder-form="${orderID}"]`);
      if(reOrderForm == null) return;
            fetch(window.Shopify.routes.root + 'cart/clear.js', {
              method: 'POST',
            })
            .then(response => response.json())
            .then(data => {
                 
                    const formData = new FormData(reOrderForm);
                    fetch(window.Shopify.routes.root + 'cart/add.js', {
                      method: 'POST',
                      body: formData
                    })
                    .then((response) => response.json())
                    .then((response) => {
                      
                      // console.log('RESPONSE', response, response.status);
                        if (response.status) {
                            reoderBtn.classList.remove('loading');
                            if(document.querySelector('[js-reorder-error]')) {
                              document.querySelector('[js-reorder-error]').classList.remove('hidden');
                              document.querySelector('[js-reorder-error]').innerHTML = response.message;
                            }
                            setTimeout(() => {
                              if(document.querySelector('[js-reorder-error]')) {
                                document.querySelector('[js-reorder-error]').classList.add('hidden');
                                document.querySelector('[js-reorder-error]').innerHTML = '';
                              }
                            }, 5000);
                        }
                        else {
                            window.location = '/checkout';
                        }
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
            });
    });
   });
}
