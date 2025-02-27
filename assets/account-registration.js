 // Registration form (Hotel, Multifamily ....)

     const registrationForm = document.querySelector("[js-registration-form]");

      if(registrationForm?.querySelector('#AddressCountryNew') && registrationForm?.querySelector('#AddressProvinceNew')) {
       new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
          hideElement: 'AddressProvinceContainerNew',
        });
      }

    // Get Value
    function fnGetValueBySelector(selector, key) {
      var element = document.querySelector(selector);
      if (element) {
        return element[key];
      } else {
        return null;
      }
    }

    function fnUpdateInputValue(selector, key, value) {
  var element = document.querySelector(selector);
  if (element) {
    element[key] = value;
  }
}

    // Toggle Visiblitity of element
    function fnToggleVisiblity(selector, value) {
      var element = document.querySelector(selector);
      if (element) {
        element.style.display = value;
      }
    }

  function addErrorSpan(element, errorMessage) {
     // console.log(errorMessage);
      if (element) {
        element.insertAdjacentHTML("afterend", '<span class="error">' + errorMessage + "</span>");
      }
    }

   registrationForm?.querySelectorAll('select').forEach((select) => {
     
      select.addEventListener("change", (event) => {
      
           if(select.value == ''){
                select.classList.remove('selected');
           }
           else {
                select.classList.add('selected');
           }
      })
    })



//============Input Validation

let validationRulesRegistration = {
      firstname: "Please enter your first name.",
      lastname: "Please enter your last name.",
      addressone: "Please enter an address.", 
      city: "Please enter a city.",
      zip: "Please specify a valid zip code.",
      telephone: "Please specify a valid phone number.",
      cname: "Please enter company name.",
      taxid: "Please enter your Federal Tax ID Number.",
      email: "Please enter your email address.",
      cemail: "Please enter your confirm email address.",
      password: "Please enter your password.",
      cpassword: "Please enter your confirm password.",
      certificate: "Please enter sales tax exemption certificate number",
      
       
    };

registrationForm?.querySelectorAll("input[required]").forEach((input)=> {
   input.addEventListener("input",  (event) => {
       let inputValue = input.value.trim();
       if (inputValue == "") {
          let field = input.getAttribute('id');
          input.setCustomValidity(validationRulesRegistration[field]);
       }
       else {
          input.setCustomValidity('');
       }
   });
});

//======= Phone class
registrationForm?.querySelectorAll(".phonecls")?.forEach(function (element) {
    Inputmask({
      mask: "(999) 999-9999",
      placeholder: "___-___-____",
    }).mask(element);
  });




registrationForm?.addEventListener("submit", function (e) {
    e.preventDefault();
    let flag = 1;
   
    registrationForm.querySelector('.form-submit-btn')?.classList.add('loading');
    fnUpdateInputValue(".errorDiv", "innerHTML", "");

     let email = fnGetValueBySelector("#email", "value");
     let cemail = fnGetValueBySelector("#cemail", "value");
     let password = fnGetValueBySelector("#password", "value");
     let cpassword = fnGetValueBySelector("#cpassword", "value");
   
     let hearaboutus = fnGetValueBySelector("#hearaboutus", "value");
     let hearaboutusHotel = fnGetValueBySelector("#hearaboutusHotel", "value");

    let userType = "";
    if (window.location.pathname === "/pages/dealer_trade_registration/multi") {
      userType = "multi";
    }
    if (window.location.pathname === "/pages/dealer_trade_registration/builder") {
      userType = "builder";
    }
    if (window.location.pathname === "/pages/dealer_trade_registration/hotel") {
      userType = "hotel";
    }
    if (window.location.pathname === "/pages/dealer_trade_registration/dealer") {
      userType = "dealer";
    }
    if (window.location.pathname === "/pages/multi-registration/multi") {
      userType = "multi";
    }
    if (window.location.pathname === "/pages/multi-registration/builder") {
      userType = "builder";
    }
    if (window.location.pathname === "/pages/multi-registration/hotel") {
      userType = "hotel";
    }
    if (window.location.pathname === "/pages/multi-registration/dealer") {
      userType = "dealer";
    }
    fnUpdateInputValue("#userType", "value", userType);

    let errorDiv = document.querySelector(".errorDiv");

   

    document.querySelectorAll(".error")?.forEach(function (element) {
      element.remove();
    });

  
   
    if (email != cemail) {
      flag = 0;
      addErrorSpan(
        document.querySelector("#cemail"),
        "Your email addresses did not match, please try again."
      );
    }
  
    if (password != cpassword) {
      flag = 0;
      addErrorSpan(
        document.querySelector("#cpassword"),
        "Your passwords did not match, please try again."
      );
    }

    if (flag == 1) {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "https://script.mirrormate.com/mm/createUser.php", true);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.onload = function () {
        if (xhr.status === 200) {
          if (xhr.responseText === "1") {
            //fnToggleVisiblity("#successDiv", "block");
             fnToggleVisiblity("#errorDiv", "none");
            // fnUpdateInputValue(
            //   "#successDiv",
            //   "innerHTML",
            //   "<p>Thank you for your request. Your application will be approved within 24 hours or one of our staff members will contact you with any questions.</p>"
            // );
            registrationForm.reset();

            window.scrollTo({ top: 0, behavior: 'smooth' });
            if(document.querySelector('[js-success-part]')){
              document.querySelector('[js-success-part]').classList.remove('hidden');
            }

            if(document.querySelector('[js-form-part]')) {
              document.querySelector('[js-form-part]').classList.add('hidden');
            }

            
            // setTimeout(function () {
            //   fnToggleVisiblity("#successDiv", "none");
            // }, 4000);

           // fnToggleVisiblity("#usercreatepop", "block");
            // fnToggleVisiblity(".loader-img", "none");
            // fnToggleVisiblity(".form-submit-btn", "block");
             registrationForm.querySelector('.form-submit-btn')?.classList.remove('loading');
          } else {
           
            fnToggleVisiblity("#errorDiv", "block");
            fnUpdateInputValue(
              "#errorDiv",
              "innerHTML",
              xhr.responseText.replace(
                "Email has already been taken",
                "An account with this email has already been set up. Please log in here or contact Customer Service at 866-304-6283 for assistance."
              )
            );
            
             registrationForm.querySelector('.form-submit-btn')?.classList.remove('loading');
          }
        }
      };

      let formData = new FormData(registrationForm);
      for (const pair of formData.entries()) {
         formData.set(pair[0], pair[1].trim());
      }
      let data = new URLSearchParams(formData);
      xhr.send(data);
    } else {
      fnToggleVisiblity("#errorDiv", "block");
      registrationForm.querySelector('.form-submit-btn')?.classList.remove('loading');
      
      fnUpdateInputValue(
        "#errorDiv",
        "innerHTML",
        "Some error(s) occurred in the form, please check."
      );
    }
  });









//=========================== Request Quote page
 const requestQuoteForm = document.querySelector("[js-request-quote-form]");


//========================== Input Validation

let validationRules = {
      firstname: "Please enter your first name.",
      lastname: "Please enter your last name.",
      hotelname: "Please enter hotel name.",
      email: "Please enter a valid email address.",
      phone: "Please specify a valid phone number.",
      frame_styles: "Please enter frame styles."
    };

requestQuoteForm?.querySelectorAll("input[required]").forEach((input)=> {
   input.addEventListener("input",  (event) => {


       let inputValue = input.value.trim();
       if (inputValue == "") {
          let field = input.getAttribute('id');
          input.setCustomValidity(validationRules[field]);
       }
       else {
          input.setCustomValidity('');
       }
     
   });
});

//======= Phone class
requestQuoteForm?.querySelectorAll(".phonecls")?.forEach(function (element) {
    Inputmask({
      mask: "(999) 999-9999",
      placeholder: "___-___-____",
    }).mask(element);
  });


requestQuoteForm?.addEventListener("submit", function (e) {
    e.preventDefault();
    let flag = 1;
    
    requestQuoteForm.querySelector('.form-submit-btn')?.classList.add('loading');
    fnUpdateInputValue(".errorDiv", "innerHTML", "");
    
    if (flag == 1) {
      let xhr = new XMLHttpRequest();
      xhr.open("POST", "https://script.mirrormate.com/mm/request-quote.php", true);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
      xhr.onload = function () {
        if (xhr.status === 200) {
          fnToggleVisiblity("#errorDiv", "none");
          requestQuoteForm.reset();
           window.scrollTo({ top: 0, behavior: 'smooth' });
          if(document.querySelector('[js-success-part]')){
              document.querySelector('[js-success-part]').classList.remove('hidden');
            }
          if(document.querySelector('[js-form-part]')) {
              document.querySelector('[js-form-part]').classList.add('hidden');
            }
           requestQuoteForm.querySelector('.form-submit-btn')?.classList.remove('loading');
        }
      };
      
      let formData = new FormData(requestQuoteForm);
      for (const pair of formData.entries()) {
         formData.set(pair[0], pair[1].trim());
      }
      let data = new URLSearchParams(formData);
      xhr.send(data);
     
    } else {
      requestQuoteForm.querySelector('.form-submit-btn')?.classList.remove('loading');
      fnToggleVisiblity("#errorDiv", "block");
      fnUpdateInputValue(
        ".errorDiv",
        "innerHTML",
        "Some error(s) occurred in the form, please check."
      );
    }
  });
