class PortfolioEngine {
  constructor() {
    this.data = null;
    this.init();
  }

  async init() {
    try {
      this.data = await fetch('./portfolio.json').then(r => r.json());
      this.hideLoading();
      this.updateMeta();
      this.renderAllSections();
      this.bindEvents();
      document.body.classList.add('loaded');
    } catch (error) {
      console.error('Portfolio load failed:', error);
      document.getElementById('loading').textContent = 'Load Failed';
    }
  }

  hideLoading() {
    const loader = document.getElementById('loading');
    if (loader) loader.style.display = 'none';
  }

  updateMeta() {
    document.title = this.data.metadata.title;
    document.querySelector('meta[name="description"]').setAttribute(
      'content',
      this.data.metadata.description
    );
  }

  renderAllSections() {
    Object.keys(this.data).forEach(key => {
      if (key !== 'metadata') this.renderSection(key);
    });

    this.renderFooter();
  }

  renderSection(section) {
    const container = document.querySelector(`[data-section="${section}"]`);
    if (!container) return;

    container.querySelectorAll('[data-content]').forEach(el => {
      const path = el.dataset.content.split('.');
      const value = this.getNestedValue(path);

      if (Array.isArray(value)) {
        el.innerHTML = this.renderList(el.dataset.content, value);
      } else if (value) {
        this.setContent(el, value);
      }
    });
  }

  renderList(path, items) {
    const templates = {
      'navigation.links': items.map(link =>
        `<li><a href="${link.href}">${link.text}</a></li>`
      ).join(''),

      'hero.badges': items.map(b =>
        `<span class="badge">${b}</span>`
      ).join(''),

      'hero.buttons': items.map(btn =>
        `<a href="${btn.href}" 
           class="btn ${btn.primary ? '' : 'btn-ghost'}"
           ${btn.target ? 'target="_blank" rel="noopener"' : ''}>
           ${btn.text}
         </a>`
      ).join(''),

      // ✅ FIXED: use "tech" not "stack"
      'projects.items': items.map(project => `
        <div class="project">
          <img src="${project.image}" class="project-img" />
          <p class="project-title">${project.title}</p>
          <p class="project-desc">${project.description}</p>

          <div class="project-stack">
            ${project.tech.map(t => `<span class="tag">${t}</span>`).join('')}
          </div>

          <div class="project-links">
            <a href="${project.live}" target="_blank">Live</a>
            <a href="${project.repo}" target="_blank">Code</a>
          </div>
        </div>
      `).join(''),

      'resume.skills': items.map(skill => `
        <div class="skill-group">
          <p class="skill-group-name">${skill.category}</p>
          <div class="skill-list">
            ${skill.items.map(s => `<span class="skill">${s}</span>`).join('')}
          </div>
        </div>
      `).join(''),

      // ✅ FIXED: use "duration"
      'resume.experience': items.map(exp => `
        <div class="exp">
          <div class="exp-top">
            <span class="exp-role">${exp.role}</span>
            <span class="exp-date">${exp.duration}</span>
          </div>
          <p class="exp-company">${exp.company}</p>
          <p class="exp-desc">${exp.description}</p>
        </div>
      `).join(''),

      'contact.methods': items.map(method => `
        <div class="c-method">
          <div>
            <div class="c-label">${method.type}</div>
            <div class="c-val">${method.value}</div>
          </div>
        </div>
      `).join(''),

      // ✅ NEW: Contact form fields
      'contact.form.fields': items.map(field => {
        if (field.type === 'textarea') {
          return `<textarea name="${field.name}" placeholder="${field.placeholder}" required></textarea>`;
        }
        return `<input type="${field.type}" name="${field.name}" placeholder="${field.placeholder}" required />`;
      }).join(''),

      // ✅ NEW: Architecture tree
      'architecture.tree': items.map(file =>
        `<div class="tree-item">${file}</div>`
      ).join(''),

      // ✅ NEW: Lighthouse scores
      'architecture.lighthouse': items.map(score =>
        `<div class="lh-item">${score}</div>`
      ).join('')
    };

    return templates[path] || items.map(i => `<span>${i}</span>`).join('');
  }

  renderFooter() {
    const footer = document.querySelector('footer');
    if (!footer) return;

    footer.innerHTML = `<p>${this.data.footer.copyright}</p>`;
  }

  setContent(el, value) {
    if (typeof value === 'string') {
      el.innerHTML = value; // allows <em> in headline
    }
  }

  getNestedValue(path) {
    return path.reduce((obj, key) => obj?.[key], this.data);
  }

  bindEvents() {
    const form = document.getElementById('contactForm');
    if (form) {
      form.addEventListener('submit', this.handleContact.bind(this));
    }
  }

  async handleContact(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;

    btn.textContent = 'Sending…';
    btn.disabled = true;

    try {
      const formData = Object.fromEntries(new FormData(form));

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      btn.textContent = res.ok ? '✓ Sent!' : '✗ Error';
      if (res.ok) form.reset();
    } catch {
      btn.textContent = '✗ Error';
    }

    setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = false;
    }, 3000);
  }
}

// INIT
document.addEventListener('DOMContentLoaded', () => new PortfolioEngine());