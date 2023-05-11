import { el, mount, setChildren } from "redom";
import { isValid, isExpirationDateValid, isSecurityCodeValid, getCreditCardNameByNumber } from 'creditcard.js';
import IMask from 'imask';
import '@/styles/style.css';
import visa from '@img/visa.png';
import defaultImg from '@img/default.png';
import masterCard from '@img/mastercard.png';

let cardImg = defaultImg;
const $container = el('.container');
mount(document.body, $container);
const EMAIL_REGEXP = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu;
const $cardContainer = el('.card-container');
const $front = el('.front');
const $cardImg = el('img.cardImg', {src: cardImg});
const $cardFlexbox = el('.flexbox');
const $cardHolderBox = el('.box');
const $cardHolderName = el('.card-holder-name', 'Full Name');
setChildren($cardHolderBox, [el('span', 'Card Holder'), $cardHolderName]);
const $cardExpireBox = el('.box');
const $expire = el('.expiration');
const $expMonth = el('span.exp-month', '00 / 00');
setChildren($expire, [$expMonth]);
setChildren($cardExpireBox, [el('span', 'Expires'), $expire]);
setChildren($cardFlexbox, [$cardHolderBox, $cardExpireBox]);
const $cardNumberBox = el('.card-number-box', '#### #### #### ####');
setChildren($front, [$cardNumberBox, $cardFlexbox, $cardImg]);
const $back = el('.back');
const $backBox = el('.box');
setChildren($backBox, [el('span', 'cvv'), el('.cvv-box')]);
setChildren($back, [el('.stripe'), $backBox]);
setChildren($cardContainer, [$front, $back]);

const $form = el('form');
const $formInputCardNumber= el('.inputBox');
const $cardNumberInput = el('input.card-number-input', { type: 'text', maxlength: 18, required: true});
setChildren($formInputCardNumber, [el('span', 'Card Number'), $cardNumberInput]);
const $formInputCardHolder = el('.inputBox');
const $cardHolderInput = el('input.card-holder-input', { type: 'text'});
setChildren($formInputCardHolder, [el('span', 'Card Holder'), $cardHolderInput]);
const $cardInf = el('.flexbox');

const $expirationDate = el('.inputBox');
const $expirationMonthSelect = el('input.month-input', { type: 'text', maxlength: 5});

setChildren($expirationDate, [
  el('span', 'expiration date'),
  $expirationMonthSelect
]);

const $cvvInput = el('input.cvv-input', {type: 'text', maxlength: 3, required: true});

const $cvv = el('.inputBox');
setChildren($cvv, [
  el('span', 'cvv'),
  $cvvInput
]);

const $emailInputBox = el('.inputBox');
const $emailInput = el('input', {type: 'email', required: true})
setChildren($emailInputBox, [el('span', 'email'), $emailInput]);

setChildren($cardInf, [$expirationDate, $cvv]);
const $formBtn = el('input.submit-btn.disabled', { type: 'submit', value: 'submit', disabled: true});

setChildren($form, [
  $formInputCardNumber,
  $formInputCardHolder,
  $cardInf,
  $emailInputBox,
  $formBtn
])

setChildren($container, [$cardContainer, $form]);

$cardNumberInput.oninput = () => {
  checkPaymentSystem();
  isBtnAvailable();
  inputNoValidStat($cardNumberInput);
  $cardNumberInput.value = validationOnlyNumbers($cardNumberInput.value);
  if (!$cardNumberInput.value.trim()) {
    $cardNumberBox.textContent = '#### #### #### ####';
  } else {
    const result = [];
    for (let i = 0; i < $cardNumberInput.value.length; i++) {
      if (!( (i+1) % 4)){
        result.push($cardNumberInput.value[i]);
        result.push(' ');
      } else {
        result.push($cardNumberInput.value[i]);
      }
    }
    $cardNumberBox.textContent = result.join('');
  }

}

$cardNumberInput.onblur = () => {
  isBtnAvailable();
  if (!isValid($cardNumberInput.value)){
    inputInvalid($cardNumberInput);
  } else {
    inputValid($cardNumberInput);
  }
}

$cardHolderInput.oninput = () => {
  isBtnAvailable();
  inputNoValidStat($cardHolderInput);
  if($cardHolderInput.value.trim()) {
    inputValid($cardHolderInput);
  }
  $cardHolderName.textContent = $cardHolderInput.value;
}

$cardHolderInput.onblur = () => {
  isBtnAvailable();
  if(!$cardHolderInput.value.trim()){
    inputInvalid($cardHolderInput);
  } else {
    inputValid($cardHolderInput);
  }
}

$expirationMonthSelect.oninput = () => {
  isBtnAvailable();
  inputNoValidStat($expirationMonthSelect);
  $expMonth.textContent = $expirationMonthSelect.value;
}

function expDateValidation(inputValue){
  let isValid = false;
  const expDate = inputValue.split('/');
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear()%1000;

  if((Number(expDate[1]) > currentYear)
    || (Number(expDate[1]) >= currentYear && Number(expDate[0]) >= currentMonth)) {
    isValid = true;
  } else {
    isValid = false;
  }
  return isValid;
}

$expirationMonthSelect.onblur = () => {
  isBtnAvailable();
  if(expDateValidation($expirationMonthSelect.value)){
    inputValid($expirationMonthSelect);
  } else {
    inputInvalid($expirationMonthSelect);
  }
};

let mask = IMask($expirationMonthSelect, { mask: '00/00'});

$cvvInput.onfocus = () => {
  $front.style.transform = 'perspective(1000px) rotateY(-180deg)';
  $back.style.transform = 'perspective(1000px) rotateY(0deg)';
}

$cvvInput.onblur = () => {
  isBtnAvailable();
  $front.style.transform = 'perspective(1000px) rotateY(0deg)';
  $back.style.transform = 'perspective(1000px) rotateY(180deg)';

  if($cvvInput.value.length === 3) {
    $cvvInput.classList.remove('invalid');
    $cvvInput.classList.add('valid');
  } else {
    $cvvInput.classList.remove('valid');
    $cvvInput.classList.add('invalid');
  }
}

$cvvInput.oninput = () => {
  isBtnAvailable();
  inputNoValidStat($cvvInput);
  $cvvInput.value = validationOnlyNumbers($cvvInput.value);
  document.querySelector('.cvv-box').textContent = $cvvInput.value;
}

$emailInput.oninput = () => {
  isBtnAvailable();
  inputNoValidStat($emailInput);
}

$emailInput.onblur = () => {
  isBtnAvailable();
  if (EMAIL_REGEXP.test($emailInput.value)){
    inputValid($emailInput)
  } else {
    inputInvalid($emailInput);
  }
}

function validationOnlyNumbers (string) {
  return string.replace(/[^0-9]/g, '');
}

function inputValid(input) {
  input.classList.remove('invalid');
  input.classList.add('valid');
}
function inputInvalid(input) {
  input.classList.remove('valid');
  input.classList.add('invalid');
}
function inputNoValidStat(input){
  input.classList.remove('invalid');
  input.classList.remove('valid');
}

function isBtnAvailable() {
  if(
      isValid($cardNumberInput.value) &&
      $cardHolderInput.value.trim() &&
      expDateValidation($expirationMonthSelect.value) &&
      $cvvInput.value.length === 3 &&
      EMAIL_REGEXP.test($emailInput.value)
    ) {
    $formBtn.classList.remove('disabled');
    $formBtn.removeAttribute('disabled');
  } else {
    $formBtn.classList.add('disabled');
    $formBtn.setAttribute('disabled', 'true');
  }
}

function checkPaymentSystem() {
  switch (getCreditCardNameByNumber($cardNumberInput.value)){
    case 'Visa':
      $cardImg.src = visa;
      break;
    case 'Mastercard':
      $cardImg.src = masterCard;
      break;
    default:
      $cardImg.src = defaultImg;
      break;
  }
}
