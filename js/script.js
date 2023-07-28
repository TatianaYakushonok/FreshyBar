// MODAL WINDOUW

const API_URL = 'https://eggplant-surf-pet.glitch.me/';

const price = {
  Клубника: 60,
  Банан: 50,
  Манго: 70,
  Маракуйя: 90,
  Киви: 55,
  Яблоко: 45,
  Мята: 50,
  Лед: 10,
  Биоразлагаемый: 20,
  Пластиковый: 0,
};

const cartDataControl = {
  get() {
    return JSON.parse(localStorage.getItem('freshyBarCart') || '[]');
  },
  add(item) {
    const cartData = this.get();
    item.idls = Math.random().toString(36).substring(2, 8);
    cartData.push(item);
    localStorage.setItem('freshyBarCart', JSON.stringify(cartData));
  },
  remove(idls) {
    const cartData = this.get();
    const index = cartData.findIndex(item => item.idls === idls);
    if (index !== -1) {
      cartData.splice(index, 1);
    }
    localStorage.setItem('freshyBarCart', JSON.stringify(cartData));
  },
  clear() {
    localStorage.removeItem('freshyBarCart');
  }
};

const scrollController = {
  scrollPosition: 0,
  disabledScroll() {
    scrollController.scrollPosition = window.scrollY;
    document.body.style.cssText = `
      overflow: hidden;
      position: fixed;
      top: -${scrollController.scrollPosition}px;
      left: 0;
      width: 100vw;
      height: 100vh;
      padding-right: ${window.innerWidth - document.body.offsetWidth}px
    `;
    document.documentElement.style.scrollBehavior = 'unset';
  },
  enabledScroll() {
    document.body.style.cssText = '';
    window.scroll({ top: scrollController.scrollPosition});
    document.documentElement.style.scrollBehavior = '';
  }
}

const modalController = ({ modalElem, btnOpen, btnClose, time = 300, open, close }) => {
  const btnElems = document.querySelectorAll(btnOpen);
  const modal = document.querySelector(modalElem);

  modal.style.cssText = `
    display: flex;
    visibility: hidden;
    opacity: 0;
    transition: opacity ${time}ms ease-in-out;
  `;

  const closeModal = (e) => {
    const target = e.target;

    if (e === 'close' ||
        target === modal ||
        (btnClose && target.closest(btnClose)) || 
        e.code === 'Escape') {
      modal.style.opacity = 0;

      setTimeout(() => {
        modal.style.visibility = 'hidden';
        scrollController.enabledScroll();

        if (close) {
          close();
        }
      }, time);

      window.removeEventListener('keydown', closeModal);
    }

  }

  const openModal = (e) => {

    if (open) {
      open({ btn: e.target });
    }
    modal.style.visibility = 'visible';
    modal.style.opacity = 1;
    window.addEventListener('keydown', closeModal);
    scrollController.disabledScroll();
  }

  btnElems.forEach(btn => {
    btn.addEventListener('click', openModal);
  })

  modal.addEventListener('click', closeModal);
  modal.closeModal = closeModal;
  modal.openModal = openModal;

  return { openModal, closeModal };
}

// GOODS LIST

const getData = async () => {
  const response = await fetch(`${API_URL}api/goods`);
  const data = await response.json();
  return data;
}

const createCard = (item) => {
  const cocktail = document.createElement('article');
  cocktail.classList.add('goods__card', 'cocktail');

  cocktail.innerHTML =`
    <img src="${API_URL}${item.image}" alt="Коктейл ${item.title}" class="cocktail__img">

    <div class="cocktail__content">
      <div class="cocktail__text">
        <p class="cocktail__title">${item.title}</p>
        <p class="cocktail__price text-red">${item.price} ₽</p>
        <p class="cocktail__size">${item.size}</p>
      </div>

      <button class="btn cocktail__btn cocktail__btn--add" data-id="${item.id}">Добавить</button>
    </div>
  `;

  return cocktail;
}

const getFormData = (form) => {
  const formData = new FormData(form);
  const data = {};
  for (const [ name, value ] of formData.entries()) {
    if (data[name]) {
      if (!Array.isArray(data[name])) {
        data[name] = [data[name]];
      }
      data[name].push(value);
    } else {
      data[name] = value;
    }
  }
  
  return data;
}

const calculateTotalPrice = (form, startPrice) => {
  let totalPrice = startPrice;
  const data = getFormData(form);

  if (Array.isArray(data.ingredients)) {
    data.ingredients.forEach(item => {
      totalPrice += price[item] || 0;
    })
  } else {
    totalPrice += price[data.ingredients] || 0;
  }

  if (Array.isArray(data.topping)) {
    data.topping.forEach(item => {
      totalPrice += price[item] || 0;
    })
  } else {
    totalPrice += price[data.topping] || 0;
  }

  totalPrice += price[data.cup] || 0;

  return totalPrice;
}

const outputCountInCart = () => {
  const headerBtnCount = document.querySelector('.header__btn--count');
  const orderListData = cartDataControl.get();

  if (orderListData.length > 0) {
    headerBtnCount.style.visibility = 'visible';
    headerBtnCount.textContent = `${orderListData.length}`;
  } else {
    headerBtnCount.style.visibility = 'hidden';
  }
}

const formControl = (form, callback) => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = getFormData(form);
    cartDataControl.add(data);
    outputCountInCart();

    if (callback) {
      callback();
    }
  })
}

const calculateMakeYourOwn = () => {
  const modalMake = document.querySelector('.modal__make');
  const formMakeOwn = modalMake.querySelector('.make__form--own');
  const makeInputPrice = modalMake.querySelector('.make__input--price');
  const makeTotalPrice = modalMake.querySelector('.make__total-price');
  const makeInputTitle = modalMake.querySelector('.make__input--title');
  const makeAddBtn = modalMake.querySelector('.make__add--btn');

  const handlerChange = () => {
    const totalPrice = calculateTotalPrice(formMakeOwn, 150);
    const data = getFormData(formMakeOwn);

    if (data.ingredients) {
      const ingredients = Array.isArray(data.ingredients) 
        ? data.ingredients.join(', ') 
        : data.ingredients;

        makeInputTitle.value = `Конструктор: ${ingredients}`;
        makeAddBtn.disabled = false;
    } else {
      makeAddBtn.disabled = true;
    }
    makeInputPrice.value = totalPrice;
    makeTotalPrice.textContent = `${totalPrice} ₽`;
  }

  formMakeOwn.addEventListener('change', handlerChange);
  formControl(formMakeOwn, () => {
    modalMake.closeModal('close');
  });
  handlerChange();

  const resetForm = () => {
    makeTotalPrice.innerHTML = '';
    makeAddBtn.disabled = true;

    formMakeOwn.reset();
  }

  resetForm();

  return { resetForm, handlerChange };
}

const calculateAdd = () => {
  const modalAdd = document.querySelector('.modal__add');
  const makeFormAdd = document.querySelector('.make__form--add');
  const makeTitle = modalAdd.querySelector('.make__title');
  const makeInputTitle = modalAdd.querySelector('.make__input--title');
  const startPrice = document.querySelector('.make__input--start-price');
  const makeTotalPrice = modalAdd.querySelector('.make__total-price');
  const makeInputPrice = modalAdd.querySelector('.make__input--price');
  const makeTotalSize = modalAdd.querySelector('.make__total-size');
  const makeInputSize = modalAdd.querySelector('.make__input--size');

  const handlerChange = () => {
    const totalPrice = calculateTotalPrice(makeFormAdd, +startPrice.value);

    makeTotalPrice.textContent = `${totalPrice} ₽`;
    makeInputPrice.value = totalPrice;
  }

  makeFormAdd.addEventListener('change', handlerChange);
  formControl(makeFormAdd, () => {
    modalAdd.closeModal('close');
  })

  const fillInForm = data => {
    makeTitle.textContent = data.title;
    makeInputTitle.value = data.title;
    makeTotalPrice.textContent = `${data.price} ₽`;
    startPrice.value = data.price;
    makeInputPrice.value = data.price;
    makeTotalSize.textContent = data.size;
    makeInputSize.value = data.size;
    handlerChange();
  }

  const resetForm = () =>  {
    makeTitle.textContent = '';
    makeTotalPrice.innerHTML = '';
    makeTotalSize.textContent = '';

    makeFormAdd.reset();
  }

  return { fillInForm, resetForm };
}

const createCardItem = (item) => {

  const li = document.createElement('li');
  li.classList.add('modal__item');
  li.innerHTML = `
    
    <div class="modal__item--cocktail">
      <h3 class="modal__item--title">${item.title}</h3>
      <p class="modal__item--size">${item.size}</p>
      <p class="modal__item--ingredient">${item.cup}</p>
      ${item.topping 
      ? 
        (Array.isArray(item.topping) 
        ? item.topping.map(topping => `<p class="modal__item--ingredient">${topping}</p>`).join('')
        : `<p class="modal__item--ingredient">${item.topping}</p>`)
      : ''}
    </div>

    <div class="modal__item--content">
      <button class="modal__item--btn-del" data-idls=${item.idls}>
        <svg width="14" height="14" viewbox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.94006 6.98212L13.4667 1.47024C13.5759 1.34304 13.633 1.17943 13.6265 1.0121C13.6201 0.844762 13.5505 0.686029 13.4318 0.567617C13.313 0.449204 13.1539 0.379835 12.9861 0.373372C12.8183 0.366908 12.6543 0.423827 12.5267 0.532752L7.00006 6.04464L1.4734 0.526103C1.34786 0.400903 1.1776 0.330566 1.00006 0.330566C0.822529 0.330566 0.652266 0.400903 0.52673 0.526103C0.401194 0.651303 0.330669 0.821111 0.330669 0.998171C0.330669 1.17523 0.401194 1.34504 0.52673 1.47024L6.06006 6.98212L0.52673 12.494C0.456942 12.5536 0.400262 12.627 0.360247 12.7095C0.320231 12.7919 0.297744 12.8818 0.294198 12.9734C0.290652 13.0649 0.306122 13.1562 0.339638 13.2416C0.373155 13.3269 0.423994 13.4044 0.488963 13.4692C0.553933 13.534 0.631631 13.5847 0.717181 13.6181C0.802731 13.6515 0.894286 13.6669 0.986099 13.6634C1.07791 13.6599 1.168 13.6374 1.25071 13.5975C1.33342 13.5576 1.40697 13.5011 1.46673 13.4315L7.00006 7.91961L12.5267 13.4315C12.6543 13.5404 12.8183 13.5973 12.9861 13.5909C13.1539 13.5844 13.313 13.515 13.4318 13.3966C13.5505 13.2782 13.6201 13.1195 13.6265 12.9521C13.633 12.7848 13.5759 12.6212 13.4667 12.494L7.94006 6.98212Z" fill="#D5B4A8"/>
        </svg>
      </button>
      <p class="modal__item--price">${item.price} ₽</p>
    </div>
  `;

  const addImg = async () => {

    const data = await getData();
    const dataImg = data.find(dataItem => dataItem.title === item.title);
    const img = document.createElement('img');
    img.classList.add('modal__img');
    img.src = dataImg?.image ? `${API_URL}${dataImg.image}` : '../img/cup-1.jpg';
    img.alt = dataImg?.title;
    li.prepend(img);
  
    return img;
  }

  addImg();

  return li;
}

const renderCart = () => {
  const modalOrder = document.querySelector('.modal__order');
  const modalCount = modalOrder.querySelector('.modal__count');
  const modalList = modalOrder.querySelector('.modal__list');
  const modalTotalPrice = modalOrder.querySelector('.modal__total-price');
  const modalForm = modalOrder.querySelector('.modal__form');

  const orderListData = cartDataControl.get();

  modalList.textContent = '';
  modalCount.textContent = `(${orderListData.length})`;

  orderListData.forEach(item => {
    modalList.append(createCardItem(item));
    removeFromCart();
  })

  modalTotalPrice.textContent = `${orderListData.reduce((acc, item) => acc + +item.price, 0)} ₽`;
  
  modalForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!orderListData.length) {
      alert('Корзина пуста');
      modalForm.reset();
      modalOrder.closeModal('close');
      return;
    };

    const data = getFormData(modalForm);
    const response = await fetch(`${API_URL}api/order`, {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        products: orderListData,
      }),
      headers: {
        'Content-type': 'application/json',
      },
    })

    const { message } = await response.json();
    alert(message);
    cartDataControl.clear();
    modalForm.reset();
    modalOrder.closeModal('close');
  })
}

const removeFromCart = () => {
  const btnsDel = document.querySelectorAll('.modal__item--btn-del');

  btnsDel.forEach(btnDel => {
    btnDel.addEventListener('click', () => {
      const id = btnDel.dataset.idls;
      cartDataControl.remove(id);
      renderCart();
    })
  })
}

const init = async () => {

  modalController({
    modalElem: '.modal__order',
    btnOpen: '.header__btn--order',
    open: renderCart,
    close: outputCountInCart,
  });

  const { resetForm: resetFormMakeYourOwn, 
          handlerChange: handlerChangeMakeYourOwn } = calculateMakeYourOwn();

  modalController({
    modalElem: '.modal__make',
    btnOpen: '.cocktail__btn--make',
    open: handlerChangeMakeYourOwn,
    close: resetFormMakeYourOwn
  });

  const goodsListElem = document.querySelector('.goods__list');
  const data = await getData();

  const cardsCocktail = data.map((item) => {
    const li = document.createElement('li');
    li.classList.add('.goods__item');
    li.append(createCard(item));
    return li;
  });

  goodsListElem.append(...cardsCocktail);

  const { fillInForm: fillInFormAdd, resetForm: resetFormAdd } = calculateAdd();

  modalController({
    modalElem: '.modal__add',
    btnOpen: '.cocktail__btn--add',
    open({ btn }) {
      const id = btn.dataset.id;
      const item = data.find(item => item.id.toString() === id);
      fillInFormAdd(item);
    },
    close: resetFormAdd,
  });

  outputCountInCart();
}

init();