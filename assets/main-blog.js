class MainBlog extends HTMLElement {
    constructor() {
        super();

        this.tagItems = this.querySelectorAll("[js-tag-item]");
        this.mainBlog = this.querySelector("[js-main-blog]");

        this.tagItems.forEach( tag => tag.addEventListener("click", this.renderBlog.bind(this)));
        this.init();
    }

    init() {
        this.paginationItems = this.querySelectorAll("[js-pagination-item]");
        this.paginationItems.forEach( pagination => pagination.addEventListener("click", this.renderBlog.bind(this)));
    }

    renderBlog(evt) {
        evt.preventDefault();

        const { currentTarget } = evt;
        const isTag = currentTarget.classList.contains("blog__tag");

        const href = currentTarget.getAttribute("href");
        const url = isTag ? `${href}?section_id=${this.mainBlog.getAttribute('data-section-id')}` : `${href}&section_id=${this.mainBlog.getAttribute('data-section-id')}`;

        this.updateLoading(true);
        isTag ? this.updateStatus(currentTarget) : "";
        this.updateScroll();
        this.updateURLHash(href);
        this.renderSectionFromFetch(url);
    }

    updateLoading(isLoading) {
        isLoading ? this.mainBlog.classList.add("loading") : this.mainBlog.classList.remove("loading");
    }

    updateStatus(target) {
        this.tagItems.forEach( tag => tag.classList.remove('active'));
        target.classList.add("active");
    }

    updateScroll() {
        const scrollTo = this.offsetTop;
        window.scrollTo({top: scrollTo, behavior: 'smooth'});
    }

    updateURLHash(url) {
        history.pushState({ url }, '', url);
    }

    renderSectionFromFetch(url) {
        fetch(url)
        .then((response) => response.text())
        .then((html) => {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            this.mainBlog.innerHTML = doc.querySelector("[js-main-blog]").innerHTML;

            this.init()
        })
        .finally(() => {
            this.updateLoading(false);
        })
    }
}
  
customElements.define('main-blog', MainBlog);