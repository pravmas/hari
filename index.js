var params = {
    srcDpaId: "88958fe3-f423-4b9a-a2d1-0e013c19ea2d", // required DPA Identifier, generated during registration.
    dpaData: {
        dpaName: "DPA Name"       //required
    },
    dpaTransactionOptions: {
        transactionAmount: { transactionAmount: 50, transactionCurrencyCode: "AUD" }, // optional
        dpaLocale: "en_US",      // required
    },
    cardBrands: ["mastercard"], // required. Array of card brands supported.
    checkoutExperience: "PAYMENT_SETTINGS", // optional
}
var mcCheckoutService = new MastercardCheckoutServices();


async function initializeMastercardCheckoutServices() {
try {
     cardListDiv.style.display = "none";

        var result = await mcCheckoutService.init(params)     
        console.log({ result });
        getCardsHandler(); 
    } 
    catch (error) {  // handle error
        console.log( { error });
    }
}
async function getCardsHandler () {
    try {
    const promiseResolvedPayload = await window.mcCheckoutService.getCards()
     console.log({ promiseResolvedPayload });
    } catch (promiseRejectedPayload) {
        console.log({ promiseRejectedPayload });
    }
}

async function authenticateHandler (formElement) { 
const modal = document.getElementById("otp-modal");
modal.classList.add("open");

// Get values using input names
const email = formElement.email.value;
const mobile = formElement.mobile.value;

  var requestParameters = {
        "windowRef": document.getElementById("otpFrame").contentWindow,
        "accountReference": {
            "consumerIdentity": {
            "identityType": "EMAIL_ADDRESS",
            "identityValue": email
            }
        },
        "requestRecognitionToken": true
    }
    try {
        const promiseResolvedPayload = await window.mcCheckoutService.authenticate(requestParameters);
        console.log({ promiseResolvedPayload });
        modal.classList.remove("open");
        if(promiseResolvedPayload.cards.length > 0) {
            console.log(promiseResolvedPayload.cards[0].srcDigitalCardId);
            initializeCardList(promiseResolvedPayload.cards);
        } else {
            showAlert("myAlert");
        }
       
    } catch (promiseRejectedPayload) {
         console.log({ promiseRejectedPayload });
    }
}

async function initializeCardList(maskedCardData) {
  form.style.display = "none";
  cardListDiv.style.display = "block";

const srcCardList = document.getElementById("srcCardList");
  srcCardList.loadCards(maskedCardData);
  srcCardList.addEventListener('selectSrcDigitalCardId', function (event) {
    console.log('srcDigitalCardId: ', event.detail);
    if(event.detail) {
        checkoutWithCardHandler(event.detail);
    }
  });
};

async function checkoutWithCardHandler (digitalCardId) { 
  try {
    const modal = document.getElementById("c2p-modal");
    modal.classList.add("open");
    const paramsCheckOut = 
    {
        windowRef: document.getElementById("ctpFrame").contentWindow, // required.
        srcDigitalCardId: digitalCardId, // optional.
        dpaTransactionOptions: params.dpaTransactionOptions, // optional.
    }

   const promiseResolvedPayload = await window.mcCheckoutService.checkoutWithCard(paramsCheckOut)

   if(promiseResolvedPayload && promiseResolvedPayload.checkoutActionCode == "COMPLETE") {
    cardListDiv.style.display = "none";
    showAlert("myOrderAlert");
   } else {
    showAlert("errorAlert");
   }
    console.log({ promiseResolvedPayload });
    modal.classList.remove("open");
  } catch (promiseRejectedPayload) {
    console.log({ promiseRejectedPayload });
    showAlert("errorAlert");
  }
}

const form = document.getElementById("checkoutForm");
const cardListDiv = document.getElementById("card-list-div");

  form.addEventListener("submit", function(event) {
    hideAlert("myAlert");
    event.preventDefault(); // Prevents the default page reload
    console.log({ event });
    authenticateHandler(event.target);
  });
initializeMastercardCheckoutServices();

function showAlert(element) {
  document.getElementById(element).classList.remove("d-none");
}

function hideAlert(element) {
  document.getElementById(element).classList.add("d-none");
}

// const modal = document.getElementById("modal");
// modal.addEventListener("click", function (e) {
//   if (e.target === modal) {
//     modal.classList.remove("open");
//   }
// });