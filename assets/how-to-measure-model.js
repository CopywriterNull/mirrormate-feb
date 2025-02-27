class HowToMeasure extends HTMLElement {
  constructor() {
    super();

    this.languageSelector = this.querySelector("[js-language-selector]");
    this.selectValueEl = this.querySelector("[js-select-value]");
    this.videoModel = document.querySelector("[js-measure-video-model]");
    this.iframeVideo = this.videoModel.querySelector("[js-iframe-video]");
    this.optionItems = this.querySelectorAll("[js-option-item]");

    this.init();
  }

  init() {
    this.addEventListener("click", this.handleMeasureBtn.bind(this));
    document.addEventListener("click", (evt) => {
      const isLanguageSelectorClick = evt.target.hasAttribute("js-language-selector") || evt.target.hasAttribute("js-option-item");
      const isCloseModalClick = evt.target.hasAttribute("js-close-model") || evt.target.hasAttribute("js-measure-video-model");
    
      if (!isLanguageSelectorClick) {
        this.languageSelector.classList.remove("is-open");
      }
      if (isCloseModalClick) {
        this.iframeVideo.setAttribute("src", "");
        this.videoModel.classList.remove("is-open");
      }
    })
  }

  handleMeasureBtn({ target }) {
    if(target.hasAttribute("js-language-selector")) {
      this.toggleDropdown();
    }else if(target.hasAttribute("js-option-item")) {
      this.handleSelect(target);
    }else {
      this.openModel();
    }
  }

  toggleDropdown() {
    this.languageSelector.classList.toggle("is-open");
  }

  handleSelect(option) {
    const language = option.getAttribute("data-language");
    const videoUrl = option.getAttribute("data-video-url");

    this.optionItems.forEach( el => el.classList.remove("is-selected"));
    option.classList.add("is-selected");

    this.setAttribute("data-video-url", videoUrl);
    this.selectValueEl.textContent = language;

    this.languageSelector.classList.remove("is-open");
  }

  openModel() {
    this.iframeVideo.setAttribute("src", this.getAttribute("data-video-url"));
    this.videoModel.classList.add("is-open");
  }
}

customElements.define('how-to-measure', HowToMeasure);