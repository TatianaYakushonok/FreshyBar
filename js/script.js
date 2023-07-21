// MODAL WINDOUW

const API_URL = 'https://eggplant-surf-pet.glitch.me/';

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

const modalController = ({ modalElem, btnOpen, btnClose, time = 300 }) => {
  const btnOrder = document.querySelector(btnOpen);
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
      }, time);

      window.removeEventListener('keydown', closeModal);
    }

  }

  const openModal = () => {
    modal.style.visibility = 'visible';
    modal.style.opacity = 1;
    window.addEventListener('keydown', closeModal);
    scrollController.disabledScroll();
  }

  btnOrder.addEventListener('click', openModal);
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

      <button class="btn cocktail__btn" data-id="${item.id}">Добавить</button>
    </div>
  `;

  return cocktail;
}

const init = async () => {

  modalController({
    modalElem: '.modal__order',
    btnOpen: '.header__btn--order',
  });

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
}

init();