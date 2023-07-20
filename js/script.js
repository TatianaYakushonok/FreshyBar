// MODAL WINDOUW

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

modalController({
  modalElem: '.modal',
  btnOpen: '.header__btn--order'
});