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
}

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

    if (target === modal ||
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
        <p class="cocktail__size">${item.size}ml</p>
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

const calculateMakeYourOwn = () => {
  const formMakeOwn = document.querySelector('.make__form--own');
  const makeInputPrice = formMakeOwn.querySelector('.make__input--price');
  const makeTotalPrice = formMakeOwn.querySelector('.make__total-price');

  const handlerChange = () => {
    const totalPrice = calculateTotalPrice(formMakeOwn, 150);
    makeInputPrice.value = totalPrice;
    makeTotalPrice.textContent = `${totalPrice} ₽`;
  }

  formMakeOwn.addEventListener('change', handlerChange);
  handlerChange();
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

const init = async () => {

  modalController({
    modalElem: '.modal__order',
    btnOpen: '.header__btn--order',
  });

  calculateMakeYourOwn();

  modalController({
    modalElem: '.modal__make',
    btnOpen: '.cocktail__btn--make',
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

  const { fillInForm, resetForm } = calculateAdd();

  modalController({
    modalElem: '.modal__add',
    btnOpen: '.cocktail__btn--add',
    open({ btn }) {
      const id = btn.dataset.id;
      const item = data.find(item => item.id.toString() === id);
      fillInForm(item);
    },
    close: resetForm,
  });
}

init();