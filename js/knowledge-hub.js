/**
 * GNEP Africa - Environmental Research & Policy Knowledge Hub
 * Core Data Engine, Search, Multi-Facet Filtering, Admin Workflow & Publication Router
 */

(function (window, document) {
    'use strict';

    const STORAGE_KEY = 'gnep_knowledge_hub_v11_17_pubs_kelcm';
    try { localStorage.removeItem('gnep_knowledge_hub_custom_pubs'); localStorage.removeItem('gnep_knowledge_hub_v3_webpage_pubs'); localStorage.removeItem('gnep_knowledge_hub_v4_clean_pubs'); localStorage.removeItem('gnep_knowledge_hub_v5_verified_pubs'); localStorage.removeItem('gnep_knowledge_hub_v5_verified_pubs'); localStorage.removeItem('gnep_knowledge_hub_v5_verified_pubs'); localStorage.removeItem('gnep_knowledge_hub_v5_verified_pubs'); localStorage.removeItem('gnep_knowledge_hub_v5_verified_pubs'); } catch(e) {}
    const ADMIN_SESSION_KEY = 'gnep_kh_admin_auth';
    const SUBSCRIBERS_KEY = 'gnep_kh_subscribers';
    const DEFAULT_DATA_PATH = 'data/publications.json?v=20261126-v11';

    const KnowledgeHub = {
        data: {
            categories: [],
            publication_types: [],
            source_categories: [],
            collections: [],
            publications: []
        },
        state: {
            searchQuery: '',
            selectedCategory: 'all',
            selectedType: 'all',
            selectedSource: 'all',
            selectedYear: 'all',
            selectedCollection: 'all',
            sortBy: 'newest',
            viewMode: 'grid', // 'grid' | 'list'
            page: 1,
            pageSize: 20,
            isAdmin: false
        },

        async init() {
            try {
                await this.loadCatalog();
                this.checkAdminAuth();
                
                // If on knowledge-hub.html
                if (document.getElementById('kh-search-input')) {
                    this.initHubPage();
                }

                // If on publication.html
                if (document.getElementById('publication-detail-container')) {
                    this.initPublicationDetailPage();
                }

                this.initGlobalEvents();
            } catch (err) {
                console.error('[GNEP Knowledge Hub] Initialization Error:', err);
            }
        },

        async loadCatalog() {
            let baseData = null;
            try {
                const res = await fetch(DEFAULT_DATA_PATH);
                if (res.ok) {
                    baseData = await res.json();
                }
            } catch (e) {
                console.warn('[GNEP Knowledge Hub] Could not fetch data/publications.json, using fallback data', e);
            }

            if (!baseData) {
                // Inline resilient fallback so catalog works even if fetch fails or running on file:// protocol
                baseData = this.getEmbeddedFallbackData();
            }

            // Merge with local storage overrides/additions
            const localOverrides = this.getLocalPublications();
            const pubMap = new Map();

            // First populate default published items
            (baseData.publications || []).forEach(p => pubMap.set(p.id, p));

            // Then apply local overrides / additions
            localOverrides.forEach(p => {
                if (p._deleted) {
                    pubMap.delete(p.id);
                } else {
                    pubMap.set(p.id, p);
                }
            });

            this.data = {
                categories: baseData.categories || [],
                publication_types: baseData.publication_types || [],
                source_categories: baseData.source_categories || [],
                collections: baseData.collections || [],
                publications: Array.from(pubMap.values())
            };
        },

        getLocalPublications() {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                return raw ? JSON.parse(raw) : [];
            } catch (e) {
                return [];
            }
        },

        saveLocalPublications(pubs) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(pubs));
            } catch (e) {
                console.error('Failed to save to localStorage', e);
            }
        },

        checkAdminAuth() {
            this.state.isAdmin = sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
            this.updateAdminUI();
        },

        setAdminAuth(authenticated) {
            this.state.isAdmin = authenticated;
            if (authenticated) {
                sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
            } else {
                sessionStorage.removeItem(ADMIN_SESSION_KEY);
            }
            this.updateAdminUI();
            if (document.getElementById('kh-search-input')) {
                this.render();
            }
        },

        updateAdminUI() {
            const adminPills = document.querySelectorAll('.kh-admin-toggle-btn');
            adminPills.forEach(btn => {
                if (this.state.isAdmin) {
                    btn.classList.add('btn-success');
                    btn.classList.remove('btn-outline-secondary');
                    btn.innerHTML = '<i class="fas fa-unlock me-1"></i> Admin Mode (Active)';
                } else {
                    btn.classList.remove('btn-success');
                    btn.classList.add('btn-outline-secondary');
                    btn.innerHTML = '<i class="fas fa-lock me-1"></i> Admin Portal';
                }
            });

            const adminBars = document.querySelectorAll('.kh-admin-banner');
            adminBars.forEach(el => {
                el.style.display = this.state.isAdmin ? 'block' : 'none';
            });
        },

        // --- Hub Page Controller ---
        initHubPage() {
            this.parseUrlParams();
            this.bindHubInputs();
            this.render();
            this.renderCuratedCollectionsPills();
            this.renderFeaturedPublication();
            this.renderSidebarFilters();
        },

        parseUrlParams() {
            const params = new URLSearchParams(window.location.search);
            if (params.has('q')) this.state.searchQuery = params.get('q');
            if (params.has('category')) this.state.selectedCategory = params.get('category');
            if (params.has('type')) this.state.selectedType = params.get('type');
            if (params.has('source')) this.state.selectedSource = params.get('source');
            if (params.has('year')) this.state.selectedYear = params.get('year');
            if (params.has('collection')) this.state.selectedCollection = params.get('collection');
            if (params.has('sort')) this.state.sortBy = params.get('sort');

            // Sync input UI
            const searchInput = document.getElementById('kh-search-input');
            if (searchInput && this.state.searchQuery) {
                searchInput.value = this.state.searchQuery;
            }
            const sortSelect = document.getElementById('kh-sort-select');
            if (sortSelect && this.state.sortBy) {
                sortSelect.value = this.state.sortBy;
            }
        },

        syncUrlParams() {
            const params = new URLSearchParams();
            if (this.state.searchQuery) params.set('q', this.state.searchQuery);
            if (this.state.selectedCategory !== 'all') params.set('category', this.state.selectedCategory);
            if (this.state.selectedType !== 'all') params.set('type', this.state.selectedType);
            if (this.state.selectedSource !== 'all') params.set('source', this.state.selectedSource);
            if (this.state.selectedYear !== 'all') params.set('year', this.state.selectedYear);
            if (this.state.selectedCollection !== 'all') params.set('collection', this.state.selectedCollection);
            if (this.state.sortBy !== 'newest') params.set('sort', this.state.sortBy);

            const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
            window.history.replaceState({}, '', newUrl);
        },

        bindHubInputs() {
            const searchInput = document.getElementById('kh-search-input');
            const searchBtn = document.getElementById('kh-search-btn');
            const clearSearchBtn = document.getElementById('kh-clear-search-btn');
            const sortSelect = document.getElementById('kh-sort-select');
            const viewGridBtn = document.getElementById('kh-view-grid-btn');
            const viewListBtn = document.getElementById('kh-view-list-btn');

            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.state.searchQuery = e.target.value.trim();
                    this.state.page = 1;
                    if (clearSearchBtn) {
                        clearSearchBtn.style.display = this.state.searchQuery ? 'inline-block' : 'none';
                    }
                    this.render();
                    this.syncUrlParams();
                });

                searchInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        this.clearSearch();
                    }
                });
            }

            if (searchBtn && searchInput) {
                searchBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.state.searchQuery = searchInput.value.trim();
                    this.state.page = 1;
                    this.render();
                    this.syncUrlParams();
                });
            }

            if (clearSearchBtn) {
                clearSearchBtn.addEventListener('click', () => {
                    this.clearSearch();
                });
            }

            if (sortSelect) {
                sortSelect.addEventListener('change', (e) => {
                    this.state.sortBy = e.target.value;
                    this.render();
                    this.syncUrlParams();
                });
            }

            if (viewGridBtn && viewListBtn) {
                viewGridBtn.addEventListener('click', () => {
                    this.state.viewMode = 'grid';
                    viewGridBtn.classList.add('active');
                    viewListBtn.classList.remove('active');
                    this.render();
                });
                viewListBtn.addEventListener('click', () => {
                    this.state.viewMode = 'list';
                    viewListBtn.classList.add('active');
                    viewGridBtn.classList.remove('active');
                    this.render();
                });
            }
        },

        clearSearch() {
            const searchInput = document.getElementById('kh-search-input');
            const clearSearchBtn = document.getElementById('kh-clear-search-btn');
            if (searchInput) searchInput.value = '';
            if (clearSearchBtn) clearSearchBtn.style.display = 'none';
            this.state.searchQuery = '';
            this.state.page = 1;
            this.render();
            this.syncUrlParams();
        },

        resetAllFilters() {
            this.clearSearch();
            this.state.selectedCategory = 'all';
            this.state.selectedType = 'all';
            this.state.selectedSource = 'all';
            this.state.selectedYear = 'all';
            this.state.selectedCollection = 'all';
            this.state.sortBy = 'newest';
            this.state.page = 1;

            const sortSelect = document.getElementById('kh-sort-select');
            if (sortSelect) sortSelect.value = 'newest';

            this.renderSidebarFilters();
            this.renderCuratedCollectionsPills();
            this.render();
            this.syncUrlParams();
        },

        // --- Filter Calculation ---
        getFilteredPublications() {
            const query = this.state.searchQuery.toLowerCase();
            return this.data.publications.filter(pub => {
                // If not admin, hide drafts
                if (!this.state.isAdmin && pub.status === 'draft') {
                    return false;
                }

                // Search query match
                if (query) {
                    const titleMatch = (pub.title || '').toLowerCase().includes(query);
                    const abstractMatch = (pub.abstract || '').toLowerCase().includes(query);
                    const descMatch = (pub.full_description || '').toLowerCase().includes(query);
                    const authorMatch = (pub.authors || []).some(a => a.toLowerCase().includes(query));
                    const keywordMatch = (pub.keywords || []).some(k => k.toLowerCase().includes(query));
                    const typeMatch = (pub.doc_type || '').toLowerCase().includes(query);
                    const orgMatch = (pub.publishing_org || '').toLowerCase().includes(query);

                    if (!titleMatch && !abstractMatch && !descMatch && !authorMatch && !keywordMatch && !typeMatch && !orgMatch) {
                        return false;
                    }
                }

                // Category filter
                if (this.state.selectedCategory !== 'all') {
                    if (!(pub.categories || []).includes(this.state.selectedCategory)) {
                        return false;
                    }
                }

                // Type filter
                if (this.state.selectedType !== 'all') {
                    if (pub.doc_type !== this.state.selectedType) {
                        return false;
                    }
                }

                // Source filter
                if (this.state.selectedSource !== 'all') {
                    if (pub.source_category !== this.state.selectedSource) {
                        return false;
                    }
                }

                // Year filter
                if (this.state.selectedYear !== 'all') {
                    if (String(pub.year) !== String(this.state.selectedYear)) {
                        return false;
                    }
                }

                // Collection filter
                if (this.state.selectedCollection !== 'all') {
                    const col = this.data.collections.find(c => c.id === this.state.selectedCollection);
                    const colTitle = col ? col.title : this.state.selectedCollection;
                    if (!(pub.collections || []).includes(colTitle) && !(pub.collections || []).includes(this.state.selectedCollection)) {
                        return false;
                    }
                }

                return true;
            }).sort((a, b) => {
                if (this.state.sortBy === 'newest') {
                    return new Date(b.publication_date || 0) - new Date(a.publication_date || 0);
                } else if (this.state.sortBy === 'oldest') {
                    return new Date(a.publication_date || 0) - new Date(b.publication_date || 0);
                } else if (this.state.sortBy === 'title') {
                    return (a.title || '').localeCompare(b.title || '');
                } else if (this.state.sortBy === 'type') {
                    return (a.doc_type || '').localeCompare(b.doc_type || '');
                }
                return 0;
            });
        },

        // --- Render Methods ---
        render() {
            const results = this.getFilteredPublications();
            const container = document.getElementById('kh-results-container');
            const countBadge = document.getElementById('kh-results-count');
            const activeFiltersBox = document.getElementById('kh-active-filters-box');
            const paginationContainer = document.getElementById('kh-pagination-container');
            const collectionHero = document.getElementById('kh-collection-editorial-banner');

            // Render Collection Editorial Banner if collection active
            if (collectionHero) {
                if (this.state.selectedCollection !== 'all') {
                    const col = this.data.collections.find(c => c.id === this.state.selectedCollection);
                    if (col) {
                        collectionHero.style.display = 'block';
                        collectionHero.innerHTML = `
                            <div class="collection-banner-inner p-4 rounded-3 mb-4" style="background: #123321; color: #F4F3EA; border-left: 5px solid #10B981;">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <span class="badge bg-success text-white mb-2 text-uppercase letter-spacing-1"><i class="${col.icon || 'fas fa-bookmark'} me-1"></i> Curated Research Collection</span>
                                        <h3 class="font-serif text-white mb-2" style="font-size: 1.5rem;">${col.title}</h3>
                                        <p class="mb-0 text-white-50" style="max-width: 800px; font-size: 0.95rem; line-height: 1.6;">${col.description}</p>
                                    </div>
                                    <button class="btn btn-sm btn-outline-light" onclick="GNEPKnowledgeHub.setCollectionFilter('all')"><i class="fas fa-times me-1"></i> Clear Collection</button>
                                </div>
                            </div>
                        `;
                    } else {
                        collectionHero.style.display = 'none';
                    }
                } else {
                    collectionHero.style.display = 'none';
                }
            }

            // Results count
            if (countBadge) {
                countBadge.textContent = `${results.length} ${results.length === 1 ? 'publication' : 'publications'} found`;
            }

            // Active filters pills
            if (activeFiltersBox) {
                const pills = [];
                if (this.state.searchQuery) {
                    pills.push(`<span class="filter-pill">Search: "${this.escapeHtml(this.state.searchQuery)}" <i class="fas fa-times ms-1" onclick="GNEPKnowledgeHub.clearSearch()"></i></span>`);
                }
                if (this.state.selectedCategory !== 'all') {
                    pills.push(`<span class="filter-pill">Category: ${this.escapeHtml(this.state.selectedCategory)} <i class="fas fa-times ms-1" onclick="GNEPKnowledgeHub.setCategoryFilter('all')"></i></span>`);
                }
                if (this.state.selectedType !== 'all') {
                    pills.push(`<span class="filter-pill">Type: ${this.escapeHtml(this.state.selectedType)} <i class="fas fa-times ms-1" onclick="GNEPKnowledgeHub.setTypeFilter('all')"></i></span>`);
                }
                if (this.state.selectedSource !== 'all') {
                    pills.push(`<span class="filter-pill">Source: ${this.escapeHtml(this.state.selectedSource)} <i class="fas fa-times ms-1" onclick="GNEPKnowledgeHub.setSourceFilter('all')"></i></span>`);
                }
                if (this.state.selectedYear !== 'all') {
                    pills.push(`<span class="filter-pill">Year: ${this.state.selectedYear} <i class="fas fa-times ms-1" onclick="GNEPKnowledgeHub.setYearFilter('all')"></i></span>`);
                }
                if (this.state.selectedCollection !== 'all') {
                    pills.push(`<span class="filter-pill">Collection: ${this.escapeHtml(this.state.selectedCollection)} <i class="fas fa-times ms-1" onclick="GNEPKnowledgeHub.setCollectionFilter('all')"></i></span>`);
                }

                if (pills.length > 0) {
                    activeFiltersBox.innerHTML = `
                        <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
                            <span class="small text-muted fw-bold">Active filters:</span>
                            ${pills.join('')}
                            <button class="btn btn-link btn-sm text-decoration-none text-danger p-0 ms-2" onclick="GNEPKnowledgeHub.resetAllFilters()">Clear all</button>
                        </div>
                    `;
                    activeFiltersBox.style.display = 'block';
                } else {
                    activeFiltersBox.innerHTML = '';
                    activeFiltersBox.style.display = 'none';
                }
            }

            // Empty state
            if (results.length === 0) {
                if (container) {
                    container.innerHTML = `
                        <div class="col-12 text-center py-5">
                            <div class="p-5 rounded-3" style="background: #F4F3EA; border: 1px dashed #CBD5E1;">
                                <i class="fas fa-search-minus fa-3x text-muted mb-3"></i>
                                <h4 class="font-serif text-dark mb-2">No publications found</h4>
                                <p class="text-muted mx-auto" style="max-width: 500px;">
                                    We couldn't find any resources matching your selected criteria. Try adjusting your search keywords or resetting active filters.
                                </p>
                                <button class="btn btn-outline-success mt-2" onclick="GNEPKnowledgeHub.resetAllFilters()">
                                    <i class="fas fa-redo me-1"></i> Reset All Filters
                                </button>
                            </div>
                        </div>
                    `;
                }
                if (paginationContainer) paginationContainer.innerHTML = '';
                return;
            }

            // Paginated slice
            const totalPages = Math.ceil(results.length / this.state.pageSize);
            const startIndex = (this.state.page - 1) * this.state.pageSize;
            const paginatedItems = results.slice(0, this.state.page * this.state.pageSize);

            if (container) {
                if (this.state.viewMode === 'grid') {
                    container.className = 'row g-4';
                    container.innerHTML = paginatedItems.map(pub => this.renderPublicationCard(pub)).join('');
                } else {
                    container.className = 'row g-3';
                    container.innerHTML = paginatedItems.map(pub => this.renderPublicationListItem(pub)).join('');
                }
            }

            // Pagination / Load More
            if (paginationContainer) {
                if (paginatedItems.length < results.length) {
                    paginationContainer.innerHTML = `
                        <div class="text-center mt-5 mb-3">
                            <button class="btn btn-outline-dark px-4 py-2 rounded-pill fw-bold" onclick="GNEPKnowledgeHub.loadMore()">
                                <i class="fas fa-arrow-down me-2"></i> Load More Publications (${paginatedItems.length} of ${results.length})
                            </button>
                        </div>
                    `;
                } else {
                    paginationContainer.innerHTML = `
                        <div class="text-center mt-4 text-muted small">
                            Showing all ${results.length} resources
                        </div>
                    `;
                }
            }
        },

        renderPublicationCard(pub) {
            const sourceBadgeClass = this.getSourceBadgeClass(pub.source_category);
            const formattedDate = this.formatDate(pub.publication_date);
            const detailUrl = pub.article_url || `publication.html?id=${encodeURIComponent(pub.slug || pub.id)}`;
            const isDraft = pub.status === 'draft';

            let actionButtons = '';
            if (pub.is_external && pub.external_url) {
                actionButtons = `
                    <a href="${this.escapeHtml(pub.external_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline-primary w-100 mt-2">
                        <i class="fas fa-external-link-alt me-1"></i> Visit Official Publisher
                    </a>
                `;
            } else if (pub.file_url) {
                actionButtons = `
                    <div class="d-flex gap-2 mt-3">
                        <a href="${detailUrl}" class="btn btn-sm btn-success flex-grow-1">
                            <i class="fas fa-book-open me-1"></i> Read Article
                        </a>
                        <a href="${this.escapeHtml(pub.file_url)}" download class="btn btn-sm btn-outline-dark" title="Download Official PDF">
                            <i class="fas fa-file-pdf text-danger me-1"></i> PDF
                        </a>
                    </div>
                `;
            } else {
                actionButtons = `
                    <a href="${detailUrl}" class="btn btn-sm btn-success w-100 mt-3">
                        <i class="fas fa-file-alt me-1"></i> Read Publication
                    </a>
                `;
            }

            let adminControls = '';
            if (this.state.isAdmin) {
                adminControls = `
                    <div class="admin-card-controls d-flex gap-1 justify-content-end p-2 bg-light border-bottom">
                        <button class="btn btn-xs btn-outline-primary" onclick="GNEPKnowledgeHub.openEditModal('${pub.id}')" title="Edit Publication">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-xs ${pub.is_featured ? 'btn-warning' : 'btn-outline-secondary'}" onclick="GNEPKnowledgeHub.toggleFeatured('${pub.id}')" title="Toggle Featured">
                            <i class="fas fa-star"></i>
                        </button>
                        <button class="btn btn-xs ${isDraft ? 'btn-info' : 'btn-outline-success'}" onclick="GNEPKnowledgeHub.toggleStatus('${pub.id}')" title="Toggle Draft/Publish">
                            ${isDraft ? 'Draft' : 'Published'}
                        </button>
                        <button class="btn btn-xs btn-outline-danger" onclick="GNEPKnowledgeHub.deletePublication('${pub.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
            }

            return `
                <div class="col-md-6 col-lg-4 d-flex">
                    <div class="publication-card card w-100 shadow-sm border-0 d-flex flex-column rounded-3 overflow-hidden position-relative" style="background: #FFFFFF;">
                        ${adminControls}
                        ${isDraft ? '<div class="badge bg-warning text-dark position-absolute top-0 start-0 m-2 z-index-1">DRAFT</div>' : ''}
                        
                        <div class="card-cover-wrap position-relative" style="height: 180px; background: #0B2516; overflow: hidden;">
                            <img src="${this.escapeHtml(pub.cover_image || 'assets/real/sahel-landscape.webp')}" alt="${this.escapeHtml(pub.title)}" class="w-100 h-100 object-fit-cover opacity-80" loading="lazy">
                            <div class="cover-gradient-overlay position-absolute bottom-0 start-0 w-100 p-3" style="background: linear-gradient(to top, rgba(11,37,22,0.95), transparent);">
                                <span class="badge ${sourceBadgeClass} small text-uppercase letter-spacing-1">${this.escapeHtml(pub.doc_type || 'Publication')}</span>
                            </div>
                        </div>

                        <div class="card-body p-4 d-flex flex-column flex-grow-1">
                            <div class="d-flex align-items-center justify-content-between text-muted small mb-2">
                                <span><i class="far fa-calendar-alt me-1"></i> ${formattedDate}</span>
                                <span class="text-truncate" style="max-width: 130px;"><i class="fas fa-tag me-1 text-success"></i> ${(pub.categories && pub.categories[0]) || 'General'}</span>
                            </div>

                            <h5 class="card-title font-serif text-dark fw-bold mb-2 line-clamp-2" style="font-size: 1.15rem; line-height: 1.35;">
                                <a href="${detailUrl}" class="text-decoration-none text-dark hover-emerald">
                                    ${this.escapeHtml(pub.title)}
                                </a>
                            </h5>

                            <p class="card-text text-muted small line-clamp-3 mb-3 flex-grow-1" style="line-height: 1.6;">
                                ${this.escapeHtml(pub.abstract || '')}
                            </p>

                            <div class="author-spec-line text-muted small mb-3 border-top pt-2">
                                <div class="text-truncate">
                                    <strong class="text-dark">Author:</strong> ${(pub.authors || []).join(', ')}
                                </div>
                                <div class="d-flex justify-content-between text-secondary mt-1">
                                    <span>${pub.file_format || 'PDF'} • ${pub.file_size || 'Available'}</span>
                                    <span>${pub.language || 'English'}</span>
                                </div>
                            </div>

                            ${actionButtons}
                        </div>
                    </div>
                </div>
            `;
        },

        renderPublicationListItem(pub) {
            const formattedDate = this.formatDate(pub.publication_date);
            const detailUrl = pub.article_url || `publication.html?id=${encodeURIComponent(pub.slug || pub.id)}`;
            const isDraft = pub.status === 'draft';

            return `
                <div class="col-12">
                    <div class="publication-list-item card shadow-sm border-0 rounded-3 p-3 p-md-4" style="background: #FFFFFF;">
                        <div class="row align-items-center">
                            <div class="col-md-8 col-lg-9">
                                <div class="d-flex flex-wrap gap-2 align-items-center mb-2">
                                    <span class="badge bg-dark small">${this.escapeHtml(pub.doc_type)}</span>
                                    <span class="badge bg-light text-dark border small">${(pub.categories && pub.categories[0]) || 'General'}</span>
                                    <span class="small text-muted"><i class="far fa-calendar-alt me-1"></i> ${formattedDate}</span>
                                    ${isDraft ? '<span class="badge bg-warning text-dark">DRAFT</span>' : ''}
                                </div>
                                <h5 class="font-serif mb-2">
                                    <a href="${detailUrl}" class="text-decoration-none text-dark hover-emerald">
                                        ${this.escapeHtml(pub.title)}
                                    </a>
                                </h5>
                                <p class="text-muted small mb-2 line-clamp-2">${this.escapeHtml(pub.abstract || '')}</p>
                                <div class="small text-secondary">
                                    <strong>Author:</strong> ${(pub.authors || []).join(', ')} &bull; 
                                    <span>${pub.publishing_org || 'GNEP Africa'}</span> &bull; 
                                    <span>${pub.file_format || 'PDF'} (${pub.file_size || 'N/A'})</span>
                                </div>
                            </div>
                            <div class="col-md-4 col-lg-3 mt-3 mt-md-0 text-md-end d-flex flex-md-column gap-2 justify-content-end">
                                <a href="${detailUrl}" class="btn btn-sm btn-success">
                                    <i class="fas fa-book-open me-1"></i> Read Full Article
                                </a>
                                ${pub.file_url ? `
                                    <a href="${this.escapeHtml(pub.file_url)}" download class="btn btn-sm btn-outline-dark">
                                        <i class="fas fa-file-pdf text-danger me-1"></i> Download PDF
                                    </a>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        renderFeaturedPublication() {
            const container = document.getElementById('kh-featured-publication-container');
            if (!container) return;

            // Find marked featured or default to the primary policy brief
            let featured = this.data.publications.find(p => p.is_featured && p.status !== 'draft');
            if (!featured) {
                featured = this.data.publications.find(p => p.id === 'nigeria-heat-emergency-policy-brief');
            }
            if (!featured && this.data.publications.length > 0) {
                featured = this.data.publications[0];
            }

            if (!featured) {
                container.innerHTML = `
                    <div class="p-4 rounded-3 text-center border" style="background: #F4F3EA;">
                        <span class="text-muted"><i class="fas fa-info-circle me-1"></i> No featured publication set. An administrator can feature a publication in the portal.</span>
                    </div>
                `;
                return;
            }

            const detailUrl = featured.article_url || `publication.html?id=${encodeURIComponent(featured.slug || featured.id)}`;
            const formattedDate = this.formatDate(featured.publication_date);

            container.innerHTML = `
                <div class="featured-card card border-0 rounded-4 shadow overflow-hidden" style="background: #123321; color: #FFFFFF;">
                    <div class="row g-0 align-items-center">
                        <div class="col-lg-5 position-relative" style="min-height: 320px;">
                            <img src="${this.escapeHtml(featured.cover_image || 'assets/real/nigeria-heat-emergency-crisis.webp')}" alt="${this.escapeHtml(featured.title)}" class="w-100 h-100 object-fit-cover" style="position: absolute; inset: 0;">
                            <div class="position-absolute top-0 start-0 m-3">
                                <span class="badge bg-warning text-dark text-uppercase px-3 py-2 fw-bold letter-spacing-1">
                                    <i class="fas fa-star me-1"></i> Featured Publication
                                </span>
                            </div>
                        </div>
                        <div class="col-lg-7 p-4 p-md-5">
                            <div class="d-flex flex-wrap gap-2 align-items-center mb-3">
                                <span class="badge bg-success text-white px-2 py-1 text-uppercase">${this.escapeHtml(featured.doc_type)}</span>
                                <span class="text-white-50 small"><i class="far fa-calendar-alt me-1"></i> ${formattedDate}</span>
                                <span class="text-white-50 small">&bull; ${this.escapeHtml(featured.doc_code || '')}</span>
                            </div>

                            <h2 class="font-serif text-white fw-bold mb-3" style="font-size: 1.85rem; line-height: 1.25;">
                                <a href="${detailUrl}" class="text-white text-decoration-none">
                                    ${this.escapeHtml(featured.title)}
                                </a>
                            </h2>

                            <p class="text-white-50 mb-4" style="font-size: 1.02rem; line-height: 1.65;">
                                ${this.escapeHtml(featured.abstract)}
                            </p>

                            <div class="d-flex flex-wrap align-items-center justify-content-between border-top border-white-10 pt-3 mb-4">
                                <div class="text-white-50 small mb-2 mb-sm-0">
                                    <strong class="text-white">Authors:</strong> ${(featured.authors || []).join(', ')}<br>
                                    <span>${featured.publishing_org || 'GNEP Africa'}</span>
                                </div>
                                <div class="text-white-50 small">
                                    <span>${featured.file_format || 'PDF'} (${featured.file_size || 'N/A'}) &bull; ${featured.language || 'English'}</span>
                                </div>
                            </div>

                            <div class="d-flex flex-wrap gap-3">
                                <a href="${this.escapeHtml(detailUrl)}" class="btn btn-success px-4 py-2 fw-bold rounded-pill">
                                    <i class="fas fa-book-open me-2"></i> Read Full Article Webpage
                                </a>
                                ${featured.file_url ? `
                                    <a href="${this.escapeHtml(featured.file_url)}" download class="btn btn-outline-light px-4 py-2 rounded-pill">
                                        <i class="fas fa-file-pdf me-2"></i> Download PDF Material
                                    </a>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        renderCuratedCollectionsPills() {
            const container = document.getElementById('kh-curated-collections-strip');
            if (!container) return;

            const items = [
                { id: 'all', title: 'All Collections', icon: 'fas fa-layer-group' },
                ...this.data.collections
            ];

            container.innerHTML = items.map(col => {
                const isActive = this.state.selectedCollection === col.id;
                return `
                    <button class="btn btn-sm ${isActive ? 'btn-success' : 'btn-outline-secondary'} rounded-pill text-nowrap px-3 py-1" onclick="GNEPKnowledgeHub.setCollectionFilter('${col.id}')">
                        <i class="${col.icon || 'fas fa-bookmark'} me-1"></i> ${this.escapeHtml(col.title)}
                    </button>
                `;
            }).join('');
        },

        renderSidebarFilters() {
            const catContainer = document.getElementById('kh-category-filter-list');
            const typeContainer = document.getElementById('kh-type-filter-list');
            const sourceContainer = document.getElementById('kh-source-filter-list');
            const yearContainer = document.getElementById('kh-year-filter-list');

            // Categories
            if (catContainer) {
                const allCats = ['all', ...this.data.categories];
                catContainer.innerHTML = allCats.map(cat => {
                    const isAll = cat === 'all';
                    const label = isAll ? 'All Categories' : cat;
                    const isSelected = this.state.selectedCategory === cat;
                    const count = isAll ? this.data.publications.length : this.data.publications.filter(p => (p.categories || []).includes(cat)).length;
                    return `
                        <li class="filter-list-item ${isSelected ? 'active' : ''}" onclick="GNEPKnowledgeHub.setCategoryFilter('${this.escapeHtml(cat)}')">
                            <span class="filter-name">${this.escapeHtml(label)}</span>
                            <span class="filter-count">${count}</span>
                        </li>
                    `;
                }).join('');
            }

            // Types
            if (typeContainer) {
                const allTypes = ['all', ...this.data.publication_types];
                typeContainer.innerHTML = allTypes.map(t => {
                    const isAll = t === 'all';
                    const label = isAll ? 'All Publication Types' : t;
                    const isSelected = this.state.selectedType === t;
                    const count = isAll ? this.data.publications.length : this.data.publications.filter(p => p.doc_type === t).length;
                    return `
                        <li class="filter-list-item ${isSelected ? 'active' : ''}" onclick="GNEPKnowledgeHub.setTypeFilter('${this.escapeHtml(t)}')">
                            <span class="filter-name">${this.escapeHtml(label)}</span>
                            <span class="filter-count">${count}</span>
                        </li>
                    `;
                }).join('');
            }

            // Sources
            if (sourceContainer) {
                const allSources = ['all', ...this.data.source_categories];
                sourceContainer.innerHTML = allSources.map(s => {
                    const isAll = s === 'all';
                    const label = isAll ? 'All Sources' : s;
                    const isSelected = this.state.selectedSource === s;
                    const count = isAll ? this.data.publications.length : this.data.publications.filter(p => p.source_category === s).length;
                    return `
                        <li class="filter-list-item ${isSelected ? 'active' : ''}" onclick="GNEPKnowledgeHub.setSourceFilter('${this.escapeHtml(s)}')">
                            <span class="filter-name">${this.escapeHtml(label)}</span>
                            <span class="filter-count">${count}</span>
                        </li>
                    `;
                }).join('');
            }

            // Years
            if (yearContainer) {
                const years = Array.from(new Set(this.data.publications.map(p => p.year).filter(Boolean))).sort().reverse();
                const allYears = ['all', ...years];
                yearContainer.innerHTML = allYears.map(y => {
                    const isAll = y === 'all';
                    const label = isAll ? 'All Years' : y;
                    const isSelected = String(this.state.selectedYear) === String(y);
                    const count = isAll ? this.data.publications.length : this.data.publications.filter(p => String(p.year) === String(y)).length;
                    return `
                        <li class="filter-list-item ${isSelected ? 'active' : ''}" onclick="GNEPKnowledgeHub.setYearFilter('${y}')">
                            <span class="filter-name">${label}</span>
                            <span class="filter-count">${count}</span>
                        </li>
                    `;
                }).join('');
            }
        },

        // --- Filter Setters ---
        setCategoryFilter(cat) {
            this.state.selectedCategory = cat;
            this.state.page = 1;
            this.renderSidebarFilters();
            this.render();
            this.syncUrlParams();
        },

        setTypeFilter(type) {
            this.state.selectedType = type;
            this.state.page = 1;
            this.renderSidebarFilters();
            this.render();
            this.syncUrlParams();
        },

        setSourceFilter(source) {
            this.state.selectedSource = source;
            this.state.page = 1;
            this.renderSidebarFilters();
            this.render();
            this.syncUrlParams();
        },

        setYearFilter(year) {
            this.state.selectedYear = year;
            this.state.page = 1;
            this.renderSidebarFilters();
            this.render();
            this.syncUrlParams();
        },

        setCollectionFilter(colId) {
            this.state.selectedCollection = colId;
            this.state.page = 1;
            this.renderCuratedCollectionsPills();
            this.render();
            this.syncUrlParams();
        },

        loadMore() {
            this.state.page += 1;
            this.render();
        },

        // --- Publication Detail Page Controller ---
        initPublicationDetailPage() {
            const params = new URLSearchParams(window.location.search);
            const pubId = params.get('id');
            const container = document.getElementById('publication-detail-container');

            if (!container) return;

            const targetId = pubId || 'subsidy-removal-public-accountability-policy-brief';

            const pub = this.data.publications.find(p => p.id === targetId || p.slug === targetId);
            if (!pub) {
                this.renderPublicationNotFound(container, `Publication '${this.escapeHtml(pubId)}' was not found in the Knowledge Hub repository.`);
                return;
            }


            // Set document title
            document.title = `${pub.title} | GNEP Africa Environmental Knowledge Hub`;

            // Canonical link update
            let canonical = document.querySelector('link[rel="canonical"]');
            if (canonical) {
                canonical.href = window.location.href;
            }

            this.renderPublicationDetailPage(container, pub);
        },

        renderPublicationNotFound(container, message) {
            container.innerHTML = `
                <div class="container py-5 text-center">
                    <div class="p-5 rounded-4 shadow-sm mx-auto" style="max-width: 650px; background: #F4F3EA; border: 1px solid #CBD5E1;">
                        <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                        <h2 class="font-serif mb-2">Resource Not Found</h2>
                        <p class="text-muted mb-4">${message}</p>
                        <div class="d-flex justify-content-center gap-3">
                            <a href="knowledge-hub.html" class="btn btn-success px-4 py-2 rounded-pill">
                                <i class="fas fa-arrow-left me-2"></i> Browse Knowledge Hub
                            </a>
                            <a href="index.html" class="btn btn-outline-dark px-4 py-2 rounded-pill">
                                Home
                            </a>
                        </div>
                    </div>
                </div>
            `;
        },

        renderPublicationDetailPage(container, pub) {
            const formattedDate = this.formatDate(pub.publication_date);
            const sourceBadgeClass = this.getSourceBadgeClass(pub.source_category);
            const relatedPubs = this.getRelatedPublications(pub);

            let pdfViewerHtml = '';
            if (pub.article_url || pub.file_url) {
                pdfViewerHtml = `
                    <div class="mt-4 p-4 rounded-3" style="background: #F0FDF4; border: 1px solid #86EFAC;">
                        <h4 class="font-serif text-dark h5 fw-bold mb-2"><i class="fas fa-book-open text-success me-2"></i> Full Article Webpage &amp; Offline PDF Material</h4>
                        <p class="text-muted small mb-3">Read the complete publication with interactive tables and figures directly on our webpage, or download the standalone PDF edition for offline citation.</p>
                        <div class="d-flex flex-wrap gap-2">
                            ${pub.article_url ? `<a href="${this.escapeHtml(pub.article_url)}" class="btn btn-success rounded-pill px-4 fw-bold"><i class="fas fa-book-open me-2"></i>Read Full Article Webpage</a>` : ''}
                            ${pub.file_url ? `<a href="${this.escapeHtml(pub.file_url)}" download class="btn btn-outline-dark rounded-pill px-4"><i class="fas fa-file-pdf text-danger me-2"></i>Download PDF Material (${pub.file_size || 'PDF'})</a>` : ''}
                        </div>
                    </div>
                `;
            } else if (pub.is_external && pub.external_url) {
                pdfViewerHtml = `
                    <div class="external-publisher-box mt-5 p-4 rounded-3" style="background: #F4F3EA; border-left: 5px solid #0284C7;">
                        <div class="d-flex align-items-start gap-3">
                            <i class="fas fa-external-link-alt fa-2x text-primary mt-1"></i>
                            <div>
                                <h4 class="font-serif text-dark mb-1">External Institutional Repository</h4>
                                <p class="text-muted mb-3">
                                    This publication is hosted directly by <strong>${this.escapeHtml(pub.publishing_org || 'an external research institution')}</strong>. In compliance with open academic access, GNEP provides metadata, abstract, and direct institutional attribution rather than redistributing restricted third-party assets.
                                </p>
                                <a href="${this.escapeHtml(pub.external_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary rounded-pill px-4">
                                    <i class="fas fa-external-link-alt me-2"></i> Access at Official Publisher Portal
                                </a>
                            </div>
                        </div>
                    </div>
                `;
            }

            container.innerHTML = `
                <!-- Breadcrumbs -->
                <div class="bg-light py-3 border-bottom mb-4">
                    <div class="container">
                        <nav aria-label="breadcrumb">
                            <ol class="breadcrumb mb-0 small">
                                <li class="breadcrumb-item"><a href="index.html" class="text-decoration-none text-muted">Home</a></li>
                                <li class="breadcrumb-item"><a href="knowledge-hub.html" class="text-decoration-none text-muted">Knowledge Hub</a></li>
                                <li class="breadcrumb-item"><a href="knowledge-hub.html?category=${encodeURIComponent((pub.categories && pub.categories[0]) || '')}" class="text-decoration-none text-muted">${(pub.categories && pub.categories[0]) || 'General'}</a></li>
                                <li class="breadcrumb-item active text-truncate text-dark" style="max-width: 350px;" aria-current="page">${this.escapeHtml(pub.title)}</li>
                            </ol>
                        </nav>
                    </div>
                </div>

                <div class="container py-2">
                    <div class="row g-5">
                        <!-- Main Left Column -->
                        <div class="col-lg-8">
                            <div class="publication-header mb-4">
                                <div class="d-flex flex-wrap gap-2 align-items-center mb-3">
                                    <span class="badge ${sourceBadgeClass} px-3 py-1 text-uppercase">${this.escapeHtml(pub.doc_type)}</span>
                                    <span class="badge bg-light text-dark border small">${this.escapeHtml(pub.source_category)}</span>
                                    ${pub.doc_code ? `<span class="badge bg-secondary text-white small">${pub.doc_code}</span>` : ''}
                                </div>

                                <h1 class="font-serif text-dark fw-bold mb-3" style="font-size: 2.25rem; line-height: 1.25;">
                                    ${this.escapeHtml(pub.title)}
                                </h1>

                                <div class="authors-affiliations mb-3 text-secondary" style="font-size: 1.05rem;">
                                    <strong>Author(s):</strong> ${(pub.authors || []).join(', ')}
                                </div>

                                <div class="d-flex flex-wrap align-items-center gap-3 text-muted small border-top border-bottom py-2">
                                    <span><i class="far fa-calendar-alt me-1 text-success"></i> Published: ${formattedDate}</span>
                                    <span><i class="fas fa-building me-1 text-success"></i> ${this.escapeHtml(pub.publishing_org || 'GNEP Africa')}</span>
                                    <span><i class="fas fa-globe me-1 text-success"></i> Language: ${this.escapeHtml(pub.language || 'English')}</span>
                                    ${pub.doi ? `<span><i class="fas fa-fingerprint me-1 text-success"></i> DOI: ${this.escapeHtml(pub.doi)}</span>` : ''}
                                </div>
                            </div>

                            <!-- Quick Action Bar -->
                            <div class="quick-action-bar p-3 rounded-3 mb-4 d-flex flex-wrap gap-2 justify-content-between align-items-center" style="background: #F4F3EA; border: 1px solid #E2E8F0;">
                                <div class="d-flex gap-2">
                                    ${pub.article_url ? `
                                        <a href="${this.escapeHtml(pub.article_url)}" class="btn btn-success btn-sm rounded-pill px-3 fw-bold">
                                            <i class="fas fa-book-open me-1"></i> Read Full Web Article
                                        </a>
                                    ` : ''}
                                    ${pub.file_url ? `
                                        <a href="${this.escapeHtml(pub.file_url)}" download class="btn btn-outline-success btn-sm rounded-pill px-3">
                                            <i class="fas fa-download me-1"></i> Download PDF (${pub.file_size || 'N/A'})
                                        </a>
                                    ` : ''}
                                    ${pub.external_url && !pub.is_external ? `
                                        <a href="${this.escapeHtml(pub.external_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline-primary btn-sm rounded-pill px-3">
                                            <i class="fab fa-linkedin me-1"></i> LinkedIn Pulse
                                        </a>
                                    ` : ''}
                                    <button class="btn btn-outline-dark btn-sm rounded-pill px-3" onclick="GNEPKnowledgeHub.copyCitation('${pub.id}')">
                                        <i class="fas fa-quote-right me-1"></i> Copy Citation (APA)
                                    </button>
                                </div>
                                <div class="d-flex gap-2">
                                    <button class="btn btn-outline-secondary btn-sm rounded-pill px-3" onclick="GNEPKnowledgeHub.sharePublication('${pub.title}')">
                                        <i class="fas fa-share-alt me-1"></i> Share
                                    </button>
                                </div>
                            </div>

                            <!-- Executive Summary -->
                            <div class="abstract-box p-4 rounded-3 mb-4" style="background: #FFFFFF; border-left: 4px solid #10B981; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                                <h4 class="font-serif text-dark mb-2">Executive Summary / Abstract</h4>
                                <p class="mb-0 text-secondary" style="font-size: 1.05rem; line-height: 1.75;">
                                    ${this.escapeHtml(pub.abstract)}
                                </p>
                            </div>

                            <!-- Full Description & Analysis Body -->
                            <div class="full-content-body my-4" style="font-size: 1.05rem; line-height: 1.85; color: #334155;">
                                <h3 class="font-serif text-dark mb-3">Context &amp; Key Findings</h3>
                                <p>${this.escapeHtml(pub.full_description || pub.abstract)}</p>
                            </div>

                            <!-- Keywords / Subject Tags -->
                            <div class="keywords-wrap my-4">
                                <h5 class="small text-uppercase fw-bold text-muted mb-2">Subject Tags &amp; Classification</h5>
                                <div class="d-flex flex-wrap gap-2">
                                    ${(pub.keywords || []).map(k => `
                                        <a href="knowledge-hub.html?q=${encodeURIComponent(k)}" class="badge bg-light text-dark border text-decoration-none py-2 px-3">
                                            <i class="fas fa-tag me-1 text-success"></i> ${this.escapeHtml(k)}
                                        </a>
                                    `).join('')}
                                </div>
                            </div>

                            <!-- PDF Reader Section -->
                            ${pdfViewerHtml}

                            <!-- Citation Section -->
                            <div class="citation-block mt-5 p-4 rounded-3" style="background: #F8FAFC; border: 1px solid #E2E8F0;">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <h5 class="font-serif text-dark mb-0"><i class="fas fa-graduation-cap text-success me-2"></i> How to Cite This Resource</h5>
                                    <button class="btn btn-sm btn-outline-success" onclick="GNEPKnowledgeHub.copyCitation('${pub.id}')">
                                        <i class="fas fa-copy me-1"></i> Copy APA
                                    </button>
                                </div>
                                <div class="p-3 bg-white rounded border text-secondary font-monospace small mb-2" id="citation-apa-text">
                                    ${this.escapeHtml(pub.citation_apa || '')}
                                </div>
                                <div class="small text-muted">
                                    <strong>Chicago 17th:</strong> ${this.escapeHtml(pub.citation_chicago || pub.citation_apa || '')}
                                </div>
                            </div>
                        </div>

                        <!-- Right Sidebar Column -->
                        <div class="col-lg-4">
                            <div class="sticky-top" style="top: 100px;">
                                <!-- Document Metadata Sheet -->
                                <div class="card border-0 shadow-sm rounded-3 mb-4 overflow-hidden" style="background: #FFFFFF;">
                                    <div class="card-header bg-dark text-white p-3 font-serif fw-bold">
                                        <i class="fas fa-info-circle me-2 text-success"></i> Bibliographic Metadata
                                    </div>
                                    <div class="card-body p-3">
                                        <table class="table table-sm table-borderless mb-0 small">
                                            <tbody>
                                                <tr>
                                                    <td class="text-muted fw-bold" style="width: 40%;">Format:</td>
                                                    <td class="text-dark">${pub.file_format || 'PDF'}</td>
                                                </tr>
                                                <tr>
                                                    <td class="text-muted fw-bold">File Size:</td>
                                                    <td class="text-dark">${pub.file_size || 'N/A'}</td>
                                                </tr>
                                                <tr>
                                                    <td class="text-muted fw-bold">Page Count:</td>
                                                    <td class="text-dark">${pub.page_count ? pub.page_count + ' Pages' : 'Document'}</td>
                                                </tr>
                                                <tr>
                                                    <td class="text-muted fw-bold">Language:</td>
                                                    <td class="text-dark">${pub.language || 'English'}</td>
                                                </tr>
                                                <tr>
                                                    <td class="text-muted fw-bold">Publisher:</td>
                                                    <td class="text-dark">${this.escapeHtml(pub.publishing_org || 'GNEP Africa')}</td>
                                                </tr>
                                                <tr>
                                                    <td class="text-muted fw-bold">Verification:</td>
                                                    <td class="text-success"><i class="fas fa-check-circle me-1"></i> Verified Record</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <!-- Collections Membership -->
                                ${(pub.collections && pub.collections.length > 0) ? `
                                    <div class="card border-0 shadow-sm rounded-3 mb-4 p-3" style="background: #F4F3EA;">
                                        <span class="small text-uppercase fw-bold text-muted mb-2 d-block">Curated Collection</span>
                                        <h6 class="font-serif text-dark mb-1">${pub.collections[0]}</h6>
                                        <p class="small text-muted mb-2">Part of GNEP's thematic knowledge repository.</p>
                                        <a href="knowledge-hub.html?collection=${encodeURIComponent(pub.collections[0])}" class="btn btn-sm btn-outline-success">
                                            View Collection Resources
                                        </a>
                                    </div>
                                ` : ''}

                                <!-- Related Publications -->
                                <div class="card border-0 shadow-sm rounded-3 p-3" style="background: #FFFFFF;">
                                    <h5 class="font-serif text-dark mb-3"><i class="fas fa-layer-group text-success me-2"></i> Related Resources</h5>
                                    ${relatedPubs.length > 0 ? `
                                        <div class="d-flex flex-column gap-3">
                                            ${relatedPubs.map(rel => `
                                                <div class="related-item-card border-bottom pb-2">
                                                    <span class="badge bg-light text-muted small mb-1">${this.escapeHtml(rel.doc_type)}</span>
                                                    <h6 class="font-serif mb-1" style="font-size: 0.95rem; line-height: 1.35;">
                                                        <a href="publication.html?id=${encodeURIComponent(rel.slug || rel.id)}" class="text-decoration-none text-dark hover-emerald">
                                                            ${this.escapeHtml(rel.title)}
                                                        </a>
                                                    </h6>
                                                    <span class="small text-muted">${rel.year} &bull; ${(rel.authors && rel.authors[0]) || 'GNEP Africa'}</span>
                                                </div>
                                            `).join('')}
                                        </div>
                                    ` : `
                                        <p class="text-muted small mb-0">No other publications currently tagged in this immediate cluster.</p>
                                    `}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        getRelatedPublications(currentPub) {
            return this.data.publications
                .filter(p => p.id !== currentPub.id && p.status !== 'draft')
                .filter(p => {
                    // Check manual related_ids
                    if (currentPub.related_ids && currentPub.related_ids.includes(p.id)) return true;
                    // Check shared categories
                    const sharedCat = (p.categories || []).some(c => (currentPub.categories || []).includes(c));
                    if (sharedCat) return true;
                    // Check shared keywords
                    const sharedKw = (p.keywords || []).some(k => (currentPub.keywords || []).includes(k));
                    return sharedKw;
                })
                .slice(0, 3);
        },

        // --- Admin Actions & Content Management System ---
        openAdminModal() {
            if (this.state.isAdmin) {
                this.showAdminDashboardModal();
            } else {
                this.showAdminPasscodePrompt();
            }
        },

        showAdminPasscodePrompt() {
            const pass = prompt('Enter GNEP Knowledge Hub Administrator Passcode:');
            if (!pass) return;

            // Default demo passcode for GNEP administrative management
            if (pass === 'gnep2026admin' || pass === 'gnep-africa') {
                this.setAdminAuth(true);
                this.showToast('Administrator privileges granted.', 'success');
                this.showAdminDashboardModal();
            } else {
                alert('Invalid administrator passcode.');
            }
        },

        showAdminDashboardModal() {
            let modalEl = document.getElementById('kh-admin-modal');
            if (!modalEl) {
                modalEl = document.createElement('div');
                modalEl.id = 'kh-admin-modal';
                modalEl.className = 'modal fade';
                modalEl.setAttribute('tabindex', '-1');
                document.body.appendChild(modalEl);
            }

            modalEl.innerHTML = `
                <div class="modal-dialog modal-xl modal-dialog-scrollable">
                    <div class="modal-content border-0 shadow">
                        <div class="modal-header bg-dark text-white">
                            <h5 class="modal-title font-serif"><i class="fas fa-shield-alt text-success me-2"></i> GNEP Knowledge Hub &bull; Content Management System</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body p-4">
                            <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                                <div>
                                    <h4 class="mb-1 font-serif">Repository Content Management</h4>
                                    <p class="text-muted small mb-0">Add, edit, publish, or export verified African environmental publications without touching source code.</p>
                                </div>
                                <div class="d-flex gap-2">
                                    <button class="btn btn-success btn-sm" onclick="GNEPKnowledgeHub.openCreateModal()"><i class="fas fa-plus me-1"></i> Add New Publication</button>
                                    <button class="btn btn-outline-dark btn-sm" onclick="GNEPKnowledgeHub.exportCatalogJson()"><i class="fas fa-download me-1"></i> Export Master JSON</button>
                                    <button class="btn btn-outline-secondary btn-sm" onclick="GNEPKnowledgeHub.triggerImportCatalog()"><i class="fas fa-upload me-1"></i> Import JSON</button>
                                    <button class="btn btn-outline-danger btn-sm" onclick="GNEPKnowledgeHub.logoutAdmin()"><i class="fas fa-sign-out-alt me-1"></i> Logout</button>
                                </div>
                            </div>

                            <div class="table-responsive">
                                <table class="table table-hover align-middle small">
                                    <thead class="table-light">
                                        <tr>
                                            <th>Status</th>
                                            <th>Doc Code / Type</th>
                                            <th>Title</th>
                                            <th>Author / Org</th>
                                            <th>Date</th>
                                            <th>Featured</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${this.data.publications.map(p => `
                                            <tr>
                                                <td>
                                                    <span class="badge ${p.status === 'draft' ? 'bg-warning text-dark' : 'bg-success text-white'}">
                                                        ${p.status || 'published'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <strong>${p.doc_type}</strong><br>
                                                    <span class="text-muted">${p.doc_code || 'N/A'}</span>
                                                </td>
                                                <td style="max-width: 250px;">
                                                    <a href="publication.html?id=${encodeURIComponent(p.slug || p.id)}" target="_blank" class="text-decoration-none text-dark fw-bold">
                                                        ${this.escapeHtml(p.title)}
                                                    </a>
                                                </td>
                                                <td>${(p.authors || []).join(', ')}</td>
                                                <td>${p.publication_date || p.year}</td>
                                                <td>
                                                    <button class="btn btn-xs ${p.is_featured ? 'btn-warning' : 'btn-outline-secondary'}" onclick="GNEPKnowledgeHub.toggleFeatured('${p.id}')">
                                                        <i class="fas fa-star"></i>
                                                    </button>
                                                </td>
                                                <td>
                                                    <div class="btn-group btn-group-sm">
                                                        <button class="btn btn-outline-primary" onclick="GNEPKnowledgeHub.openEditModal('${p.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                                                        <button class="btn btn-outline-info" onclick="GNEPKnowledgeHub.toggleStatus('${p.id}')" title="Toggle Publish/Draft">${p.status === 'draft' ? 'Publish' : 'Draft'}</button>
                                                        <button class="btn btn-outline-danger" onclick="GNEPKnowledgeHub.deletePublication('${p.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            const modalInstance = new bootstrap.Modal(modalEl);
            modalInstance.show();
        },

        openCreateModal() {
            this.openPublicationFormModal(null);
        },

        openEditModal(pubId) {
            const pub = this.data.publications.find(p => p.id === pubId);
            if (!pub) return;
            this.openPublicationFormModal(pub);
        },

        openPublicationFormModal(existingPub) {
            const isEditing = !!existingPub;
            const p = existingPub || {
                id: 'gnep-pub-' + Date.now(),
                slug: '',
                title: '',
                abstract: '',
                full_description: '',
                authors: ['GNEP Directorate of Climate Policy'],
                publishing_org: 'Global Nature and Environmental Partnership (GNEP Africa)',
                source_category: 'GNEP-authored publications',
                publication_date: new Date().toISOString().split('T')[0],
                year: new Date().getFullYear(),
                doc_type: 'Policy briefs',
                doc_code: 'GNEP-PB-' + new Date().getFullYear() + '-00' + (this.data.publications.length + 1),
                categories: ['Climate Change and Resilience'],
                collections: ['African Climate Policy'],
                keywords: ['Climate Resilience', 'Sahel', 'Africa'],
                cover_image: 'assets/real/sahel-landscape.webp',
                file_url: '',
                file_format: 'PDF',
                file_size: 'N/A',
                page_count: 8,
                language: 'English',
                doi: '',
                citation_apa: '',
                is_featured: false,
                is_external: false,
                external_url: '',
                status: 'published'
            };

            let formModalEl = document.getElementById('kh-pub-form-modal');
            if (!formModalEl) {
                formModalEl = document.createElement('div');
                formModalEl.id = 'kh-pub-form-modal';
                formModalEl.className = 'modal fade';
                formModalEl.setAttribute('tabindex', '-1');
                document.body.appendChild(formModalEl);
            }

            formModalEl.innerHTML = `
                <div class="modal-dialog modal-lg modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title font-serif">${isEditing ? 'Edit Publication Record' : 'Create New Environmental Publication'}</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body p-4">
                            <form id="kh-pub-admin-form">
                                <input type="hidden" id="form-pub-id" value="${this.escapeHtml(p.id)}">
                                
                                <div class="row g-3">
                                    <div class="col-md-8">
                                        <label class="form-label fw-bold small">Publication Title *</label>
                                        <input type="text" class="form-control" id="form-pub-title" required value="${this.escapeHtml(p.title)}">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label fw-bold small">Slug (URL identifier) *</label>
                                        <input type="text" class="form-control" id="form-pub-slug" required value="${this.escapeHtml(p.slug || p.id)}">
                                    </div>

                                    <div class="col-md-6">
                                        <label class="form-label fw-bold small">Document Type *</label>
                                        <select class="form-select" id="form-pub-type">
                                            ${this.data.publication_types.map(t => `<option value="${t}" ${t === p.doc_type ? 'selected' : ''}>${t}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-bold small">Source Classification *</label>
                                        <select class="form-select" id="form-pub-source">
                                            ${this.data.source_categories.map(s => `<option value="${s}" ${s === p.source_category ? 'selected' : ''}>${s}</option>`).join('')}
                                        </select>
                                    </div>

                                    <div class="col-md-6">
                                        <label class="form-label fw-bold small">Author(s) (comma separated) *</label>
                                        <input type="text" class="form-control" id="form-pub-authors" required value="${this.escapeHtml((p.authors || []).join(', '))}">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-bold small">Publishing Organization</label>
                                        <input type="text" class="form-control" id="form-pub-org" value="${this.escapeHtml(p.publishing_org || 'Global Nature and Environmental Partnership')}">
                                    </div>

                                    <div class="col-md-4">
                                        <label class="form-label fw-bold small">Publication Date</label>
                                        <input type="date" class="form-control" id="form-pub-date" value="${p.publication_date || ''}">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label fw-bold small">Document Code</label>
                                        <input type="text" class="form-control" id="form-pub-code" value="${this.escapeHtml(p.doc_code || '')}">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label fw-bold small">Language</label>
                                        <input type="text" class="form-control" id="form-pub-lang" value="${this.escapeHtml(p.language || 'English')}">
                                    </div>

                                    <div class="col-12">
                                        <label class="form-label fw-bold small">Abstract / Executive Summary *</label>
                                        <textarea class="form-control" id="form-pub-abstract" rows="3" required>${this.escapeHtml(p.abstract || '')}</textarea>
                                    </div>

                                    <div class="col-12">
                                        <label class="form-label fw-bold small">Full Description / Policy Context</label>
                                        <textarea class="form-control" id="form-pub-desc" rows="4">${this.escapeHtml(p.full_description || '')}</textarea>
                                    </div>

                                    <div class="col-md-6">
                                        <label class="form-label fw-bold small">Primary Category</label>
                                        <select class="form-select" id="form-pub-category">
                                            ${this.data.categories.map(c => `<option value="${c}" ${(p.categories && p.categories.includes(c)) ? 'selected' : ''}>${c}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-bold small">Curated Collection</label>
                                        <select class="form-select" id="form-pub-collection">
                                            <option value="">None</option>
                                            ${this.data.collections.map(col => `<option value="${col.title}" ${(p.collections && p.collections.includes(col.title)) ? 'selected' : ''}>${col.title}</option>`).join('')}
                                        </select>
                                    </div>

                                    <div class="col-12">
                                        <label class="form-label fw-bold small">Keywords (comma separated)</label>
                                        <input type="text" class="form-control" id="form-pub-keywords" value="${this.escapeHtml((p.keywords || []).join(', '))}">
                                    </div>

                                    <div class="col-md-6">
                                        <label class="form-label fw-bold small">PDF File URL (or local path)</label>
                                        <input type="text" class="form-control" id="form-pub-file" placeholder="assets/publications/..." value="${this.escapeHtml(p.file_url || '')}">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-bold small">External Official URL (if external)</label>
                                        <input type="url" class="form-control" id="form-pub-external" placeholder="https://..." value="${this.escapeHtml(p.external_url || '')}">
                                    </div>

                                    <div class="col-md-4">
                                        <label class="form-label fw-bold small">Cover Image Path</label>
                                        <input type="text" class="form-control" id="form-pub-cover" value="${this.escapeHtml(p.cover_image || 'assets/real/sahel-landscape.webp')}">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label fw-bold small">File Size Label</label>
                                        <input type="text" class="form-control" id="form-pub-size" value="${this.escapeHtml(p.file_size || 'N/A')}">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label fw-bold small">Publication Status</label>
                                        <select class="form-select" id="form-pub-status">
                                            <option value="published" ${p.status !== 'draft' ? 'selected' : ''}>Published</option>
                                            <option value="draft" ${p.status === 'draft' ? 'selected' : ''}>Draft</option>
                                        </select>
                                    </div>

                                    <div class="col-12">
                                        <div class="form-check form-switch mt-2">
                                            <input class="form-check-input" type="checkbox" id="form-pub-featured" ${p.is_featured ? 'checked' : ''}>
                                            <label class="form-check-label fw-bold" for="form-pub-featured">Mark as Featured Resource on Knowledge Hub Homepage</label>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer bg-light">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-success fw-bold px-4" onclick="GNEPKnowledgeHub.savePublicationForm(${isEditing})">
                                <i class="fas fa-save me-1"></i> Save Publication
                            </button>
                        </div>
                    </div>
                </div>
            `;

            const formModalInstance = new bootstrap.Modal(formModalEl);
            formModalInstance.show();
        },

        savePublicationForm(isEditing) {
            const title = document.getElementById('form-pub-title').value.trim();
            const slug = document.getElementById('form-pub-slug').value.trim();
            const abstract = document.getElementById('form-pub-abstract').value.trim();
            if (!title || !slug || !abstract) {
                alert('Please fill out the required fields: Title, Slug, and Abstract.');
                return;
            }

            const id = document.getElementById('form-pub-id').value;
            const authors = document.getElementById('form-pub-authors').value.split(',').map(s => s.trim()).filter(Boolean);
            const pubDate = document.getElementById('form-pub-date').value || new Date().toISOString().split('T')[0];
            const year = parseInt(pubDate.split('-')[0], 10) || new Date().getFullYear();
            const category = document.getElementById('form-pub-category').value;
            const collection = document.getElementById('form-pub-collection').value;
            const keywords = document.getElementById('form-pub-keywords').value.split(',').map(s => s.trim()).filter(Boolean);
            const externalUrl = document.getElementById('form-pub-external').value.trim();
            const fileUrl = document.getElementById('form-pub-file').value.trim();
            const isFeatured = document.getElementById('form-pub-featured').checked;
            const status = document.getElementById('form-pub-status').value;

            // Generate APA citation if empty
            const authorText = authors.length > 0 ? authors.join(', ') : 'GNEP Africa';
            const generatedCitation = `${authorText}. (${year}). ${title}. ${document.getElementById('form-pub-org').value}.`;

            const pubData = {
                id: id,
                slug: slug,
                title: title,
                abstract: abstract,
                full_description: document.getElementById('form-pub-desc').value.trim(),
                authors: authors,
                publishing_org: document.getElementById('form-pub-org').value.trim(),
                source_category: document.getElementById('form-pub-source').value,
                publication_date: pubDate,
                year: year,
                doc_type: document.getElementById('form-pub-type').value,
                doc_code: document.getElementById('form-pub-code').value.trim(),
                categories: [category],
                collections: collection ? [collection] : [],
                keywords: keywords,
                cover_image: document.getElementById('form-pub-cover').value.trim() || 'assets/real/sahel-landscape.webp',
                file_url: fileUrl,
                file_format: externalUrl ? 'External Research Document' : 'PDF',
                file_size: document.getElementById('form-pub-size').value.trim() || 'N/A',
                page_count: 8,
                language: document.getElementById('form-pub-lang').value.trim() || 'English',
                doi: '',
                citation_apa: generatedCitation,
                citation_chicago: generatedCitation,
                is_featured: isFeatured,
                is_external: !!externalUrl,
                external_url: externalUrl,
                status: status,
                related_ids: []
            };

            // Save to local publications
            let local = this.getLocalPublications();
            const existingIndex = local.findIndex(p => p.id === id);
            if (existingIndex >= 0) {
                local[existingIndex] = pubData;
            } else {
                local.push(pubData);
            }
            this.saveLocalPublications(local);

            // If featured, unset others in local memory
            if (isFeatured) {
                this.data.publications.forEach(p => {
                    if (p.id !== id) p.is_featured = false;
                });
            }

            // Update in-memory
            const inMemIndex = this.data.publications.findIndex(p => p.id === id);
            if (inMemIndex >= 0) {
                this.data.publications[inMemIndex] = pubData;
            } else {
                this.data.publications.unshift(pubData);
            }

            // Close form modal
            const formModalEl = document.getElementById('kh-pub-form-modal');
            const instance = bootstrap.Modal.getInstance(formModalEl);
            if (instance) instance.hide();

            this.showToast('Publication successfully saved to repository.', 'success');
            if (document.getElementById('kh-search-input')) {
                this.renderFeaturedPublication();
                this.renderSidebarFilters();
                this.render();
            }
            this.showAdminDashboardModal();
        },

        toggleFeatured(pubId) {
            const pub = this.data.publications.find(p => p.id === pubId);
            if (!pub) return;

            // Unset all others
            this.data.publications.forEach(p => {
                p.is_featured = (p.id === pubId && !pub.is_featured);
            });

            // Save state
            let local = this.getLocalPublications();
            local = local.map(p => {
                p.is_featured = (p.id === pubId ? pub.is_featured : false);
                return p;
            });
            if (!local.some(p => p.id === pubId)) {
                local.push(pub);
            }
            this.saveLocalPublications(local);

            this.showToast(`Featured status toggled for: "${pub.title.substring(0, 30)}..."`, 'info');
            this.showAdminDashboardModal();
            if (document.getElementById('kh-search-input')) {
                this.renderFeaturedPublication();
                this.render();
            }
        },

        toggleStatus(pubId) {
            const pub = this.data.publications.find(p => p.id === pubId);
            if (!pub) return;
            pub.status = pub.status === 'draft' ? 'published' : 'draft';

            let local = this.getLocalPublications();
            const existing = local.find(p => p.id === pubId);
            if (existing) {
                existing.status = pub.status;
            } else {
                local.push(pub);
            }
            this.saveLocalPublications(local);

            this.showToast(`Publication status set to ${pub.status.toUpperCase()}`, 'info');
            this.showAdminDashboardModal();
            if (document.getElementById('kh-search-input')) {
                this.render();
            }
        },

        deletePublication(pubId) {
            if (!confirm('Are you sure you want to delete this publication record?')) return;

            let local = this.getLocalPublications();
            local = local.filter(p => p.id !== pubId);
            // Mark deleted
            local.push({ id: pubId, _deleted: true });
            this.saveLocalPublications(local);

            this.data.publications = this.data.publications.filter(p => p.id !== pubId);

            this.showToast('Publication removed.', 'warning');
            this.showAdminDashboardModal();
            if (document.getElementById('kh-search-input')) {
                this.renderFeaturedPublication();
                this.renderSidebarFilters();
                this.render();
            }
        },

        exportCatalogJson() {
            const exportData = {
                version: "1.0.0",
                updated_at: new Date().toISOString(),
                categories: this.data.categories,
                publication_types: this.data.publication_types,
                source_categories: this.data.source_categories,
                collections: this.data.collections,
                publications: this.data.publications.filter(p => !p._deleted)
            };

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
            const dlAnchor = document.createElement('a');
            dlAnchor.setAttribute("href", dataStr);
            dlAnchor.setAttribute("download", "gnep-publications.json");
            document.body.appendChild(dlAnchor);
            dlAnchor.click();
            dlAnchor.remove();
            this.showToast('Master catalog exported as gnep-publications.json', 'success');
        },

        triggerImportCatalog() {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json';
            fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const parsed = JSON.parse(event.target.result);
                        if (parsed.publications && Array.isArray(parsed.publications)) {
                            this.data.publications = parsed.publications;
                            this.saveLocalPublications(parsed.publications);
                            this.showToast(`Imported ${parsed.publications.length} publications successfully!`, 'success');
                            this.showAdminDashboardModal();
                            if (document.getElementById('kh-search-input')) {
                                this.renderSidebarFilters();
                                this.renderFeaturedPublication();
                                this.render();
                            }
                        } else {
                            alert('Invalid publication catalog format.');
                        }
                    } catch (err) {
                        alert('Could not parse JSON file: ' + err.message);
                    }
                };
                reader.readAsText(file);
            };
            fileInput.click();
        },

        logoutAdmin() {
            this.setAdminAuth(false);
            const modalEl = document.getElementById('kh-admin-modal');
            const instance = bootstrap.Modal.getInstance(modalEl);
            if (instance) instance.hide();
            this.showToast('Administrator session closed.', 'info');
        },

        // --- Newsletter Subscription Engine ---
        initNewsletterForm() {
            const form = document.getElementById('kh-newsletter-form');
            if (!form) return;

            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const emailInput = document.getElementById('kh-newsletter-email');
                const feedbackBox = document.getElementById('kh-newsletter-feedback');
                if (!emailInput) return;

                const email = emailInput.value.trim();
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    if (feedbackBox) {
                        feedbackBox.className = 'text-danger small mt-2';
                        feedbackBox.textContent = 'Please provide a valid email address.';
                    }
                    return;
                }

                // Store in local subscribers registry
                try {
                    let subs = [];
                    const raw = localStorage.getItem(SUBSCRIBERS_KEY);
                    if (raw) subs = JSON.parse(raw);
                    if (!subs.includes(email)) {
                        subs.push(email);
                        localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(subs));
                    }
                } catch (e) {}

                const mailtoUrl = `mailto:gnep.partnership@gmail.com?subject=${encodeURIComponent('GNEP Knowledge Hub Research Alerts Subscription')}&body=${encodeURIComponent('Please add ' + email + ' to the GNEP Africa Environmental Knowledge Hub research and policy brief distribution list.')}`;
                if (feedbackBox) {
                    feedbackBox.className = 'p-3 rounded-3 mt-2 small border';
                    feedbackBox.style.background = '#F0FDF4';
                    feedbackBox.style.color = '#0B2516';
                    feedbackBox.innerHTML = `<i class="fas fa-info-circle text-success me-1"></i> <strong>Direct Email Dispatch Ready:</strong> Automated mailing-list delivery is currently being configured. <a href="${mailtoUrl}" class="fw-bold text-success text-decoration-underline ms-1">Click here to send your subscription request (${this.escapeHtml(email)}) to gnep.partnership@gmail.com</a>.`;
                }
            });
        },

        // --- Helpers & Utilities ---
        copyCitation(pubId) {
            const pub = this.data.publications.find(p => p.id === pubId);
            if (!pub) return;
            const citation = pub.citation_apa || `${(pub.authors || []).join(', ')}. (${pub.year}). ${pub.title}. GNEP Africa.`;
            navigator.clipboard.writeText(citation).then(() => {
                this.showToast('APA Citation copied to clipboard!', 'success');
            }).catch(() => {
                prompt('Copy this APA Citation:', citation);
            });
        },

        sharePublication(title) {
            if (navigator.share) {
                navigator.share({
                    title: title,
                    url: window.location.href
                }).catch(() => {});
            } else {
                navigator.clipboard.writeText(window.location.href).then(() => {
                    this.showToast('Canonical link copied to clipboard!', 'info');
                });
            }
        },

        showToast(message, type = 'info') {
            let toastContainer = document.getElementById('kh-toast-container');
            if (!toastContainer) {
                toastContainer = document.createElement('div');
                toastContainer.id = 'kh-toast-container';
                toastContainer.className = 'position-fixed bottom-0 end-0 p-3 z-index-toast';
                document.body.appendChild(toastContainer);
            }

            const bgClass = type === 'success' ? 'bg-success' : type === 'warning' ? 'bg-warning text-dark' : 'bg-dark';
            const toastEl = document.createElement('div');
            toastEl.className = `toast align-items-center text-white ${bgClass} border-0 show shadow`;
            toastEl.setAttribute('role', 'alert');
            toastEl.innerHTML = `
                <div class="d-flex">
                    <div class="toast-body small fw-bold">
                        <i class="fas fa-info-circle me-2"></i> ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            `;
            toastContainer.appendChild(toastEl);
            setTimeout(() => {
                toastEl.remove();
            }, 3500);
        },

        getSourceBadgeClass(source) {
            if (source === 'GNEP-authored publications') return 'bg-success text-white';
            if (source === 'Collaborative research') return 'bg-info text-dark';
            if (source === 'Official government or institutional documents') return 'bg-primary text-white';
            return 'bg-secondary text-white';
        },

        formatDate(dateStr) {
            if (!dateStr) return '';
            try {
                const parts = dateStr.split('-');
                if (parts.length === 3) {
                    const d = new Date(parts[0], parts[1] - 1, parts[2]);
                    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                }
            } catch (e) {}
            return dateStr;
        },

        escapeHtml(str) {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        },

        initGlobalEvents() {
            this.initNewsletterForm();
        },

        // --- Embedded Fallback Dataset ---
        getEmbeddedFallbackData() {
            return {
                "version": "1.0.0",
                "updated_at": "2026-11-26T19:58:00Z",
                "categories": [
                                "Climate Change and Resilience",
                                "Environmental Governance and Policy",
                                "Nature-Based Solutions and Ecosystem Restoration",
                                "Biodiversity and Conservation",
                                "Water, Food and Energy Nexus",
                                "Renewable Energy and Sustainable Development",
                                "Environmental Education and Youth Leadership",
                                "Climate Finance and Development",
                                "Research Methods and Technical Resources",
                                "African Environmental Case Studies"
                ],
                "publication_types": [
                                "Research papers",
                                "Policy briefs",
                                "Technical reports",
                                "Working papers",
                                "Books and chapters",
                                "Case studies",
                                "Educational resources",
                                "Datasets and technical documents"
                ],
                "source_categories": [
                                "GNEP-authored publications",
                                "Collaborative research",
                                "External publications recommended for learning",
                                "Official government or institutional documents"
                ],
                "collections": [
                                {
                                                "id": "african-climate-policy",
                                                "title": "African Climate Policy",
                                                "description": "Evidence-based policy frameworks, national commitments, and sub-national climate governance models shaping climate action across the African continent.",
                                                "icon": "fas fa-landmark"
                                },
                                {
                                                "id": "environmental-governance-nigeria",
                                                "title": "Environmental Governance in Nigeria",
                                                "description": "Legislative analyses, institutional capacity reviews, and civil society advocacy strategies advancing environmental justice and compliance in Nigeria.",
                                                "icon": "fas fa-balance-scale"
                                },
                                {
                                                "id": "community-led-ecosystem-restoration",
                                                "title": "Community-Led Ecosystem Restoration",
                                                "description": "Grassroots agroforestry models, native species regeneration, and youth custodianship paradigms driving verified Sahelian land reclamation.",
                                                "icon": "fas fa-seedling"
                                },
                                {
                                                "id": "climate-adaptation-arid-regions",
                                                "title": "Climate Adaptation in Arid and Semi-Arid Regions",
                                                "description": "Early warning telemetry, drought risk mitigation, extreme heat adaptation protocols, and desertification containment across dryland frontiers.",
                                                "icon": "fas fa-sun"
                                },
                                {
                                                "id": "biodiversity-forest-governance",
                                                "title": "Biodiversity and Forest Governance",
                                                "description": "Conservation science, indigenous ecological knowledge preservation, community woodland stewardship, and ecological corridor management.",
                                                "icon": "fas fa-tree"
                                },
                                {
                                                "id": "water-food-energy-nexus",
                                                "title": "Water-Food-Energy Nexus",
                                                "description": "Integrated systems solutions connecting clean solar power, groundwater recharge, climate-resilient agriculture, and livelihood security.",
                                                "icon": "fas fa-tint"
                                },
                                {
                                                "id": "youth-leadership-climate-justice",
                                                "title": "Youth Leadership and Climate Justice",
                                                "description": "Empirical studies and toolkits documenting youth-driven environmental advocacy, citizen science, and grassroots institutional transformation.",
                                                "icon": "fas fa-users"
                                }
                ],
                "publications": [
                                {
                                                "id": "katsina-economic-linkage-capability-model",
                                                "slug": "katsina-economic-linkage-capability-model",
                                                "title": "Katsina Economic Linkage & Capability Model (KELCM): Synergizing Resources for Lasting Impact",
                                                "abstract": "Authored by Mohammed Labaran Sani, the Katsina Economic Linkage and Capability Model (KELCM) synthesizes Amartya Sen's Capability Approach, Albert Hirschman's Theory of Economic Linkages, and Jeffrey Sachs' Comprehensive Development Approach into a three-pillar operational model for Katsina State's 34 Local Government Areas (>8 million residents)—connecting human capital (education, healthcare, empowerment) with strategic sectoral investments (agro-processing clusters, sustainable mining, solar/wind energy, and transport/water infrastructure).",
                                                "full_description": "Presents a comprehensive sub-national economic and sustainable development architecture for Katsina State, Nigeria. Anchored in Sen's Capability Approach, Hirschman's backward/forward sectoral linkages, and Sachs' SDG-integrated development strategy, KELCM outlines actionable plans across Pillar I (Human Capital Development: rural school upgrades, vocational training, primary healthcare & mobile clinics, social safety nets, and women/youth microfinance), Pillar II (Strategic Sectoral Investment: modernized irrigation and agro-processing clusters for millet, rice, and groundnuts; environmentally regulated mining; solar and wind power; and transport/water infrastructure), and Pillar III (Integrated & Sustainable Development: multi-sectoral programmes, Public-Private Partnerships, and SDG monitoring).",
                                                "authors": [
                                                                "Mohammed Labaran Sani"
                                                ],
                                                "publishing_org": "Global Nature and Environmental Partnership (GNEP Africa)",
                                                "source_category": "GNEP-authored publications",
                                                "publication_date": "2026-11-26",
                                                "year": 2026,
                                                "doc_type": "Working papers",
                                                "doc_code": "GNEP-WP-2026-017",
                                                "categories": [
                                                                "Renewable Energy and Sustainable Development",
                                                                "Water, Food and Energy Nexus",
                                                                "Environmental Governance and Policy",
                                                                "Environmental Education and Youth Leadership"
                                                ],
                                                "collections": [
                                                                "Water-Food-Energy Nexus",
                                                                "Environmental Governance in Nigeria",
                                                                "Youth Leadership and Climate Justice"
                                                ],
                                                "keywords": [
                                                                "Katsina Economic Linkage & Capability Model (KELCM)",
                                                                "Katsina State",
                                                                "Amartya Sen Capability Approach",
                                                                "Albert Hirschman Economic Linkages",
                                                                "Jeffrey Sachs SDG Strategy",
                                                                "Agro-Processing Clusters",
                                                                "Renewable Energy",
                                                                "Human Capital Development"
                                                ],
                                                "cover_image": "assets/real/kelcm-katsina-lga-map.webp",
                                                "file_url": "assets/publications/katsina-economic-linkage-capability-model.pdf",
                                                "article_url": "katsina-economic-linkage-capability-model.html",
                                                "file_format": "PDF",
                                                "file_size": "1022 KB",
                                                "page_count": 9,
                                                "language": "English",
                                                "doi": "10.5281/zenodo.gnep.wp2026.017",
                                                "citation_apa": "Sani, M. L. (2026). Katsina Economic Linkage & Capability Model (KELCM): Synergizing Resources for Lasting Impact (Working Paper No. GNEP-WP-2026-017). Global Nature and Environmental Partnership (GNEP Africa).",
                                                "citation_chicago": "Sani, Mohammed Labaran. \"Katsina Economic Linkage & Capability Model (KELCM): Synergizing Resources for Lasting Impact.\" Working Paper No. GNEP-WP-2026-017. Katsina: GNEP Africa, November 2026.",
                                                "is_featured": true,
                                                "is_external": false,
                                                "external_url": "",
                                                "status": "published",
                                                "related_ids": [
                                                                "umaru-musa-fellowship-initiative",
                                                                "addressing-structural-gaps-african-climate-education",
                                                                "subsidy-removal-public-accountability-policy-brief"
                                                ]
                                },
                                {
                                                "id": "addressing-structural-gaps-african-climate-education",
                                                "slug": "addressing-structural-gaps-african-climate-education",
                                                "title": "Addressing Five Structural Gaps in African Climate Education Systems: Policy Recommendations for Governments",
                                                "abstract": "Climate shocks already interrupt learning across Africa—disrupting 20 million students in West, Central, Eastern, and Southern Africa in 2024 and causing US$1.3 billion in direct education damage (2005–2024)—yet education systems remain under-equipped. This brief synthesizes UNESCO, UNICEF, IPCC AR6, and NAP Global Network data across five gaps (curricula, teacher readiness, resilient schools, climate finance, and African-led research) and sets out a sequenced government action matrix.",
                                                "full_description": "Examines five binding constraints on climate-resilient education in Africa: (1) 47% of national curriculum frameworks make no reference to climate change; (2) fewer than 30% of teachers feel ready to teach it; (3) floods and heatwaves cost learners 18 school days per year while every US$1 in resilient school construction saves US$2–13 in avoided losses; (4) only 1.5% of climate finance reaches education and only 27% of NAPs cost education actions; and (5) Africa-related topics receive at most 3.8% of global climate research funding (only 14.5% to African institutions). Provides a 0–3 year sequenced reform roadmap for Ministries of Education, Finance, Environment, and Works.",
                                                "authors": [
                                                                "Mohammed Labaran Sani",
                                                                "GNEP Africa Policy Research Unit"
                                                ],
                                                "publishing_org": "Global Nature and Environmental Partnership (GNEP Africa)",
                                                "source_category": "GNEP-authored publications",
                                                "publication_date": "2026-11-26",
                                                "year": 2026,
                                                "doc_type": "Policy briefs",
                                                "doc_code": "GNEP-PB-2026-016",
                                                "categories": [
                                                                "Environmental Education and Youth Leadership",
                                                                "Climate Change and Resilience",
                                                                "Environmental Governance and Policy",
                                                                "Climate Finance and Development"
                                                ],
                                                "collections": [
                                                                "Youth Leadership and Climate Justice",
                                                                "African Climate Policy"
                                                ],
                                                "keywords": [
                                                                "Climate Education",
                                                                "Teacher Preparedness",
                                                                "Climate-Resilient Schools",
                                                                "UNESCO Greening Education Partnership",
                                                                "UNICEF Learning Interrupted",
                                                                "National Adaptation Plans (NAPs)",
                                                                "Education Climate Finance",
                                                                "African-Led Research"
                                                ],
                                                "cover_image": "assets/real/climate-ed-schoolgirls-tree-planting.webp",
                                                "file_url": "assets/publications/addressing-structural-gaps-african-climate-education.pdf",
                                                "article_url": "addressing-structural-gaps-african-climate-education.html",
                                                "file_format": "PDF",
                                                "file_size": "1048 KB",
                                                "page_count": 8,
                                                "language": "English",
                                                "doi": "10.5281/zenodo.gnep.pb2026.016",
                                                "citation_apa": "Sani, M. L., & GNEP Africa. (2026). Addressing Five Structural Gaps in African Climate Education Systems: Policy Recommendations for Governments (Policy Brief No. GNEP-PB-2026-016). Global Nature and Environmental Partnership (GNEP Africa).",
                                                "citation_chicago": "Sani, Mohammed Labaran, and GNEP Africa. \"Addressing Five Structural Gaps in African Climate Education Systems: Policy Recommendations for Governments.\" Policy Brief No. GNEP-PB-2026-016. Katsina: GNEP Africa, November 2026.",
                                                "is_featured": true,
                                                "is_external": false,
                                                "external_url": "",
                                                "status": "published",
                                                "related_ids": [
                                                                "lingua-franca-hausa-into-climate",
                                                                "umaru-musa-fellowship-initiative",
                                                                "rethinking-climate-finance-africa"
                                                ]
                                },
                                {
                                                "id": "umaru-musa-fellowship-initiative",
                                                "slug": "umaru-musa-fellowship-initiative",
                                                "title": "Umaru Musa Fellowship Initiative (UMFI): Project Proposal for Youth Leadership, Education & Decent Jobs",
                                                "abstract": "A flagship future initiative we hope to spearhead in honour of late President Umaru Musa Yar'Adua. UMFI is designed as an intensive 8-week leadership, mentorship, policy research, and civic engagement fellowship for 45 emerging youth leaders (ages 20–35) across Education, Decent Jobs, and Public Service in Katsina State and Nigeria.",
                                                "full_description": "Full project proposal dossier for the Umaru Musa Fellowship Initiative (UMFI) — 'Empower. Innovate. Transform.' Outlines the problem statement, 8-week innovation design, mission and vision, 10 programme objectives, target demographic (youth aged 20–35 across 6 sector profiles), dual benefits to participants and State Government, 16-stage operational lifecycle, 45-fellow residential/field equipment specification, risk mitigation matrix, and 7-part long-term sustainability strategy.",
                                                "authors": [
                                                                "Mohammed Labaran Sani",
                                                                "GNEP Africa Programme Design Team"
                                                ],
                                                "publishing_org": "Global Nature and Environmental Partnership (GNEP Africa)",
                                                "source_category": "GNEP-authored publications",
                                                "publication_date": "2026-11-26",
                                                "year": 2026,
                                                "doc_type": "Technical reports",
                                                "doc_code": "GNEP-PR-2026-015",
                                                "categories": [
                                                                "Environmental Education and Youth Leadership",
                                                                "Environmental Governance and Policy",
                                                                "African Environmental Case Studies"
                                                ],
                                                "collections": [
                                                                "Youth Leadership and Climate Justice",
                                                                "Environmental Governance in Nigeria"
                                                ],
                                                "keywords": [
                                                                "Umaru Musa Fellowship Initiative (UMFI)",
                                                                "Umaru Musa Yar'Adua",
                                                                "Youth Leadership Fellowship",
                                                                "Education and Decent Jobs",
                                                                "Civic Engagement",
                                                                "Public Service Pipeline",
                                                                "Katsina State",
                                                                "Future Initiative Proposal"
                                                ],
                                                "cover_image": "assets/real/umfi-youth-fellows-cohort.webp",
                                                "file_url": "assets/publications/umaru-musa-fellowship-initiative-proposal.pdf",
                                                "article_url": "umaru-musa-fellowship-initiative.html",
                                                "file_format": "PDF",
                                                "file_size": "501 KB",
                                                "page_count": 8,
                                                "language": "English",
                                                "doi": "10.5281/zenodo.gnep.pr2026.015",
                                                "citation_apa": "Sani, M. L., & GNEP Africa. (2026). Umaru Musa Fellowship Initiative (UMFI): Empowering Ethical Youth Leadership, Public Service & Civic Innovation — Project Proposal Dossier (Document No. GNEP-PR-2026-015). Global Nature and Environmental Partnership (GNEP Africa).",
                                                "citation_chicago": "Sani, Mohammed Labaran, and GNEP Africa. \"Umaru Musa Fellowship Initiative (UMFI): Empowering Ethical Youth Leadership, Public Service & Civic Innovation — Project Proposal Dossier.\" Document No. GNEP-PR-2026-015. Katsina: GNEP Africa, November 2026.",
                                                "is_featured": true,
                                                "is_external": false,
                                                "external_url": "",
                                                "status": "published",
                                                "related_ids": [
                                                                "turning-research-into-action",
                                                                "cso-policy-brief-workshop",
                                                                "subsidy-removal-public-accountability-policy-brief"
                                                ]
                                },
                                {
                                                "id": "africa-by-2063-assessing-progress-priorities",
                                                "slug": "africa-by-2063-assessing-progress-priorities",
                                                "title": "Africa by 2063: Assessing Progress and Priorities for the Decade Ahead",
                                                "abstract": "Ten years into Agenda 2063, Africa has built most of the continental scaffolding—AfCFTA (54 signatories, 48 ratifications), SAATM (37 states), the Free Movement Protocol, and the AU G20 seat—yet national ratification and delivery lag behind. Synthesizing IMF, AfDB, UNCTAD, OECD/AUC/ATAF, ITU, and WMO data across five visual charts and seven regional case figures, this brief proposes six targeted priorities for the Second Ten-Year Implementation Plan (2024–2033).",
                                                "full_description": "Co-authored by Mohammed Labaran Sani and Mahamat H. Mahamat (26 November 2026), this flagship policy brief audits the First Ten-Year Implementation Plan (2014–2023) of the African Union's Agenda 2063 and sets out measurable priorities for the Second Ten-Year Implementation Plan (2024–2033). It examines structural transformation (4.4% GDP growth vs. 10.6% manufacturing share), AfCFTA corridors, the Free Movement ratification bottleneck (4 of 15 ratifications), domestic revenue and debt service (16.1% tax-to-GDP vs. 31% revenue absorbed by external debt service), climate adaptation costs ($30–50B/year), and human capital for Africa's 12 million annual youth labor entrants.",
                                                "authors": [
                                                                "Mohammed Labaran Sani",
                                                                "Mahamat H. Mahamat"
                                                ],
                                                "publishing_org": "Global Nature and Environmental Partnership (GNEP Africa)",
                                                "source_category": "GNEP-authored publications",
                                                "publication_date": "2026-11-26",
                                                "year": 2026,
                                                "doc_type": "Policy briefs",
                                                "doc_code": "GNEP-PB-2026-014",
                                                "categories": [
                                                                "Environmental Governance and Policy",
                                                                "Climate Finance and Development",
                                                                "Climate Change and Resilience",
                                                                "Renewable Energy and Sustainable Development"
                                                ],
                                                "collections": [
                                                                "African Climate Policy",
                                                                "Youth Leadership and Climate Justice"
                                                ],
                                                "keywords": [
                                                                "Agenda 2063",
                                                                "African Union",
                                                                "AfCFTA",
                                                                "Second Ten-Year Implementation Plan",
                                                                "Climate Adaptation Finance",
                                                                "Domestic Resource Mobilization",
                                                                "Youth Dividend",
                                                                "Regional Integration"
                                                ],
                                                "cover_image": "assets/real/agenda2063-light-rail-cover.webp",
                                                "file_url": "assets/publications/africa-by-2063-assessing-progress-priorities.pdf",
                                                "article_url": "africa-by-2063-assessing-progress-priorities.html",
                                                "file_format": "PDF",
                                                "file_size": "1353 KB",
                                                "page_count": 10,
                                                "language": "English",
                                                "doi": "10.5281/zenodo.gnep.pb2026.014",
                                                "citation_apa": "Sani, M. L., & Mahamat, M. H. (2026). Africa by 2063: Assessing Progress and Priorities for the Decade Ahead (Policy Brief No. GNEP-PB-2026-014). Global Nature and Environmental Partnership (GNEP Africa).",
                                                "citation_chicago": "Sani, Mohammed Labaran, and Mahamat H. Mahamat. \"Africa by 2063: Assessing Progress and Priorities for the Decade Ahead.\" Policy Brief No. GNEP-PB-2026-014. Katsina: GNEP Africa, November 26, 2026.",
                                                "is_featured": true,
                                                "is_external": false,
                                                "external_url": "",
                                                "status": "published",
                                                "related_ids": [
                                                                "permanent-seat-for-africa-un-security-council",
                                                                "rethinking-climate-finance-africa",
                                                                "alau-dam-flood-maiduguri-nature-based-solutions"
                                                ]
                                },
                                {
                                                "id": "permanent-seat-for-africa-un-security-council",
                                                "slug": "permanent-seat-for-africa-un-security-council",
                                                "title": "A Permanent Seat for Africa: Reforming the UN Security Council",
                                                "abstract": "More than eighty years after the founding of the United Nations, Africa has no permanent seat on the Security Council—despite accounting for 54 of 193 UN member states (28%), roughly 18% of global population, around half of all Council meetings, 70% of Chapters VI/VII resolutions with peace-operation mandates, and over 40% of UN uniformed peacekeepers. This brief evaluates the Ezulwini Consensus, the Sirte Declaration, and five reform steps toward the 2028 UN Charter review horizon.",
                                                "full_description": "Authored by Mohammed Labaran Sani (26 November 2026), this policy brief analyzes the structural exclusion of Africa from permanent representation on the United Nations Security Council. Drawing on Security Council Report datasets, UN Peacekeeping troop statistics, the 2005 Ezulwini Consensus and Sirte Declaration, Action 39 of the September 2024 Pact for the Future, and recent P5 positions, it compares the AU common position against the G4, Uniting for Consensus (UfC), and US-backed proposals, and sets out five concrete policy steps for the AU, Committee of Ten (C-10), and P5 members.",
                                                "authors": [
                                                                "Mohammed Labaran Sani"
                                                ],
                                                "publishing_org": "Global Nature and Environmental Partnership (GNEP Africa)",
                                                "source_category": "GNEP-authored publications",
                                                "publication_date": "2026-11-26",
                                                "year": 2026,
                                                "doc_type": "Policy briefs",
                                                "doc_code": "GNEP-PB-2026-013",
                                                "categories": [
                                                                "Environmental Governance and Policy",
                                                                "African Environmental Case Studies"
                                                ],
                                                "collections": [
                                                                "African Climate Policy"
                                                ],
                                                "keywords": [
                                                                "UN Security Council Reform",
                                                                "Ezulwini Consensus",
                                                                "Sirte Declaration",
                                                                "African Union",
                                                                "Committee of Ten (C-10)",
                                                                "Pact for the Future",
                                                                "Global Governance",
                                                                "Peacekeeping"
                                                ],
                                                "cover_image": "assets/real/unsc-chamber-session-cover.webp",
                                                "file_url": "assets/publications/permanent-seat-for-africa-un-security-council.pdf",
                                                "article_url": "permanent-seat-for-africa-un-security-council.html",
                                                "file_format": "PDF",
                                                "file_size": "687 KB",
                                                "page_count": 7,
                                                "language": "English",
                                                "doi": "10.5281/zenodo.gnep.pb2026.013",
                                                "citation_apa": "Sani, M. L. (2026). A Permanent Seat for Africa: Reforming the UN Security Council (Policy Brief No. GNEP-PB-2026-013). Global Nature and Environmental Partnership (GNEP Africa).",
                                                "citation_chicago": "Sani, Mohammed Labaran. \"A Permanent Seat for Africa: Reforming the UN Security Council.\" Policy Brief No. GNEP-PB-2026-013. Katsina: GNEP Africa, November 26, 2026.",
                                                "is_featured": true,
                                                "is_external": false,
                                                "external_url": "",
                                                "status": "published",
                                                "related_ids": [
                                                                "africa-by-2063-assessing-progress-priorities",
                                                                "rethinking-climate-finance-africa",
                                                                "subsidy-removal-public-accountability-policy-brief"
                                                ]
                                },
                                {
                                                "id": "alau-dam-flood-maiduguri-nature-based-solutions",
                                                "slug": "alau-dam-flood-maiduguri-nature-based-solutions",
                                                "title": "Nature-Based Solutions as a Preventive and Disaster Risk Reduction Strategy for the Alau Dam Flood Disaster in Maiduguri, Nigeria",
                                                "abstract": "Triggered by prolonged heavy rainfall and the collapse of the Alau Dam in September 2024, flooding inundated over 40% of Maiduguri Municipal Council, killing 37 people, injuring 58, and displacing more than 414,000 residents (ACAPS, 2024; IOM, 2024). This policy brief demonstrates how watershed restoration, afforestation, wetland conservation, sustainable land management, and Vetiver grass (Chrysopogon zizanioides) bioengineering can complement dam rehabilitation to build long-term flood resilience.",
                                                "full_description": "Authored by Mohammed Labaran Sani, this policy brief examines the compound drivers of the September 2024 Alau Dam flood disaster in Borno State, Nigeria—where aging dam infrastructure, sediment accumulation, and limited spillway capacity combined with upstream catchment deforestation and wetland encroachment. Drawing on empirical soil-and-water conservation evidence (Oku, Asubonteng & Blege, 2015; IUCN, 2020; World Bank, 2017), it outlines a 6-part integrated green-grey flood risk reduction strategy for Federal and Borno State Ministries, the Chad Basin Development Authority, NEMA, and SEMA.",
                                                "authors": [
                                                                "Mohammed Labaran Sani"
                                                ],
                                                "publishing_org": "Global Nature and Environmental Partnership (GNEP Africa)",
                                                "source_category": "GNEP-authored publications",
                                                "publication_date": "2026-11-26",
                                                "year": 2026,
                                                "doc_type": "Policy briefs",
                                                "doc_code": "GNEP-PB-2026-012",
                                                "categories": [
                                                                "Nature-Based Solutions and Ecosystem Restoration",
                                                                "Climate Change and Resilience",
                                                                "Water, Food and Energy Nexus",
                                                                "African Environmental Case Studies"
                                                ],
                                                "collections": [
                                                                "Climate Adaptation in Arid and Semi-Arid Regions",
                                                                "Community-Led Ecosystem Restoration",
                                                                "Water-Food-Energy Nexus",
                                                                "Environmental Governance in Nigeria"
                                                ],
                                                "keywords": [
                                                                "Alau Dam Flood",
                                                                "Maiduguri",
                                                                "Borno State",
                                                                "Nature-Based Solutions (NbS)",
                                                                "Vetiver Grass",
                                                                "Watershed Restoration",
                                                                "Disaster Risk Reduction",
                                                                "Wetland Conservation"
                                                ],
                                                "cover_image": "assets/real/alau-dam-maiduguri-flood-cover.webp",
                                                "file_url": "assets/publications/alau-dam-flood-maiduguri-nature-based-solutions.pdf",
                                                "article_url": "alau-dam-flood-maiduguri-nature-based-solutions.html",
                                                "file_format": "PDF",
                                                "file_size": "258 KB",
                                                "page_count": 6,
                                                "language": "English",
                                                "doi": "10.5281/zenodo.gnep.pb2026.012",
                                                "citation_apa": "Sani, M. L. (2026). Nature-Based Solutions as a Preventive and Disaster Risk Reduction Strategy for the Alau Dam Flood Disaster in Maiduguri, Nigeria (Policy Brief No. GNEP-PB-2026-012). Global Nature and Environmental Partnership (GNEP Africa).",
                                                "citation_chicago": "Sani, Mohammed Labaran. \"Nature-Based Solutions as a Preventive and Disaster Risk Reduction Strategy for the Alau Dam Flood Disaster in Maiduguri, Nigeria.\" Policy Brief No. GNEP-PB-2026-012. Katsina: GNEP Africa, November 2026.",
                                                "is_featured": true,
                                                "is_external": false,
                                                "external_url": "",
                                                "status": "published",
                                                "related_ids": [
                                                                "Silent-Struggles-Hard-Truths",
                                                                "integrating-nature-based-solutions-nigeria",
                                                                "Beyond-Rising-Waters"
                                                ]
                                },
                                {
                                                "id": "lingua-franca-hausa-into-climate",
                                                "slug": "lingua-franca-hausa-into-climate",
                                                "title": "Lingua Franca—Ing Hausa into Climate: Linguistic Accessibility and Inclusive Climate Governance",
                                                "abstract": "Nearly 90% of global scientific publications are in English, creating a two-tier system in Northern Nigeria between those who can read climate science and those who live with its consequences. Drawing on Afrobarometer awareness data (only 30% awareness in Nigeria; 26% rural; 23% women) and evaluations of Hausa farm radio (In Kidi ya Chanza) and voice advisories reaching 97% farmer trust, this brief proposes six policy actions to institutionalize Hausa climate terminology, translation, and education across 94 million speakers.",
                                                "full_description": "Examines how linguistic exclusion breaks the chain of climate governance at its very first link. Despite ₦200.6 million allocated to federal climate awareness over four years under Nigeria's National Climate Change Policy (2021–2030), rural Hausa-speaking communities remain underserved by uncontextualized English messaging. Sets out a six-part roadmap: establishing a standard Hausa climate glossary panel, translating policies and early warnings, integrating Hausa into school/university curricula, strengthening vernacular media, piloting participatory community communication, and building cross-border West African partnerships.",
                                                "authors": [
                                                                "Global Nature and Environmental Partnership (GNEP Africa)"
                                                ],
                                                "publishing_org": "Global Nature and Environmental Partnership (GNEP Africa)",
                                                "source_category": "GNEP-authored publications",
                                                "publication_date": "2026-11-11",
                                                "year": 2026,
                                                "doc_type": "Policy briefs",
                                                "doc_code": "GNEP-PB-2026-011",
                                                "categories": [
                                                                "Environmental Education and Youth Leadership",
                                                                "Environmental Governance and Policy",
                                                                "Climate Change and Resilience",
                                                                "Research Methods and Technical Resources"
                                                ],
                                                "collections": [
                                                                "Environmental Governance in Nigeria",
                                                                "Youth Leadership and Climate Justice",
                                                                "African Climate Policy"
                                                ],
                                                "keywords": [
                                                                "Hausa Language",
                                                                "Climate Communication",
                                                                "Linguistic Inclusion",
                                                                "Afrobarometer",
                                                                "Northern Nigeria",
                                                                "Farm Radio",
                                                                "Indigenous Knowledge",
                                                                "Climate Governance"
                                                ],
                                                "cover_image": "assets/real/lingua-franca-hausa-cover.webp",
                                                "file_url": "assets/publications/lingua-franca-hausa-into-climate.pdf",
                                                "article_url": "lingua-franca-hausa-into-climate.html",
                                                "file_format": "PDF",
                                                "file_size": "639 KB",
                                                "page_count": 6,
                                                "language": "English",
                                                "doi": "10.5281/zenodo.gnep.pb2026.011",
                                                "citation_apa": "GNEP Africa. (2026). Lingua Franca—Ing Hausa into Climate: Linguistic Accessibility and Inclusive Climate Governance (Policy Brief No. GNEP-PB-2026-011). Global Nature and Environmental Partnership (GNEP Africa).",
                                                "citation_chicago": "Global Nature and Environmental Partnership (GNEP Africa). \"Lingua Franca—Ing Hausa into Climate.\" Policy Brief No. GNEP-PB-2026-011. Katsina: GNEP Africa, 2026.",
                                                "is_featured": false,
                                                "is_external": false,
                                                "external_url": "",
                                                "status": "published",
                                                "related_ids": [
                                                                "el-nino-me-ya-kamata-kowane-dan-najeriya-ya-sani",
                                                                "communicating-environmental-issues",
                                                                "turning-research-into-action"
                                                ]
                                },
                                {
                                                "id": "el-nino-me-ya-kamata-kowane-dan-najeriya-ya-sani",
                                                "slug": "el-nino-me-ya-kamata-kowane-dan-najeriya-ya-sani",
                                                "title": "EL NIÑO: Me Ya Kamata Kowane Ɗan Najeriya Ya Sani? (Hausa Super El Niño Public Advisory)",
                                                "abstract": "Abin da ke faruwa a Tekun Pacific na iya shafar rayuwarmu a Najeriya. Wannan takardar bayani cikin harshen Hausa tana fassara kimiyyar guguwar yanayi ta Super El Niño (+3.3°C Niño 3.4 a Oktoba 2026), hasashen NiMet kan ambaliya a jihohin Arewa da ƙarancin ruwa a Kudu, haɗarin tsananin zafi (31,400), da matakan kariya ga manoma, iyalai, al'umma da hukumomin lafiya.",
                                                "full_description": "Published entirely in Hausa to bridge the climate science communication gap across Northern Nigeria and the Sahel, this public educational brief explains the ocean-atmospheric mechanics of the 2026–2027 Super El Niño. It synthesizes WMO, NOAA, Columbia University CCSR/IRI (+3.3°C anomaly), NiMet state-by-state rainfall projections, and NEMA's October 25, 2026 preparedness directives into actionable guidance for farmers, households, communities, and local governments.",
                                                "authors": [
                                                                "Global Nature and Environmental Partnership (GNEP Africa)"
                                                ],
                                                "publishing_org": "Global Nature and Environmental Partnership (GNEP Africa)",
                                                "source_category": "GNEP-authored publications",
                                                "publication_date": "2026-10-30",
                                                "year": 2026,
                                                "doc_type": "Educational resources",
                                                "doc_code": "GNEP-ER-2026-010",
                                                "categories": [
                                                                "Climate Change and Resilience",
                                                                "Environmental Education and Youth Leadership",
                                                                "African Environmental Case Studies"
                                                ],
                                                "collections": [
                                                                "Climate Adaptation in Arid and Semi-Arid Regions",
                                                                "Youth Leadership and Climate Justice"
                                                ],
                                                "keywords": [
                                                                "El Niño",
                                                                "Hausa Climate Science",
                                                                "NiMet",
                                                                "NEMA",
                                                                "Northern Nigeria",
                                                                "Extreme Heat",
                                                                "Flood Preparedness",
                                                                "Climate Literacy"
                                                ],
                                                "cover_image": "assets/real/el-nino-hausa-cover.webp",
                                                "file_url": "assets/publications/el-nino-me-ya-kamata-kowane-dan-najeriya-ya-sani.pdf",
                                                "article_url": "el-nino-me-ya-kamata-kowane-dan-najeriya-ya-sani.html",
                                                "file_format": "PDF",
                                                "file_size": "1080 KB",
                                                "page_count": 5,
                                                "language": "Hausa",
                                                "doi": "10.5281/zenodo.gnep.er2026.010",
                                                "citation_apa": "GNEP Africa. (2026). EL NIÑO: Me Ya Kamata Kowane Ɗan Najeriya Ya Sani? (Educational Resource No. GNEP-ER-2026-010). Global Nature and Environmental Partnership (GNEP Africa).",
                                                "citation_chicago": "Global Nature and Environmental Partnership (GNEP Africa). \"EL NIÑO: Me Ya Kamata Kowane Ɗan Najeriya Ya Sani?\" Educational Resource No. GNEP-ER-2026-010. Katsina: GNEP Africa, 2026.",
                                                "is_featured": false,
                                                "is_external": false,
                                                "external_url": "",
                                                "status": "published",
                                                "related_ids": [
                                                                "nigeria-heat-emergency-policy-brief",
                                                                "lingua-franca-hausa-into-climate",
                                                                "communicating-environmental-issues"
                                                ]
                                },
                                {
                                                "id": "subsidy-removal-public-accountability-policy-brief",
                                                "slug": "subsidy-removal-public-accountability-policy-brief",
                                                "title": "From Subsidy Removal to Public Accountability: Making Nigeria's Fuel Reform Work for Households by 2030",
                                                "abstract": "Nigeria's May 2023 subsidy removal and FX unification mobilised ₦15.8 trillion for the Federation by December 2025, yet only ₦5.43 trillion reached the Federal Government while new borrowing supplied 58% of incremental resources. By mid-2027, the Ministry of Finance and National Cash Transfer Office should publish quarterly, disaggregated fiscal and social reports reconciled to audited accounts under Section 30 of the Fiscal Responsibility Act 2007.",
                                                "full_description": "Independent policy analysis examining the fiscal, regional price, and household social-protection outcomes of Nigeria's May 2023 petrol subsidy removal and foreign-exchange unification. Drawing on the Federal Ministry of Finance's August 2026 Reform Scorecard, World Bank Nigeria Development Updates, Auditor-General findings, and National Bureau of Statistics PMS Price Watch series through 2026, this brief sets out four statutory accountability milestones and a 2027–2030 minimum reporting standard across federal, state, and local governments.",
                                                "authors": [
                                                                "Muhammad Garba Isah (Department of International Relations, Umaru Musa Yar'Adua University, Katsina)"
                                                ],
                                                "publishing_org": "Global Nature and Environmental Partnership (GNEP Africa) — Independent Policy Analysis",
                                                "source_category": "GNEP-authored publications",
                                                "publication_date": "2026-10-28",
                                                "year": 2026,
                                                "doc_type": "Policy briefs",
                                                "doc_code": "GNEP-PB-2026-008",
                                                "categories": [
                                                                "Environmental Governance and Policy",
                                                                "Climate Finance and Development",
                                                                "Renewable Energy and Sustainable Development",
                                                                "African Environmental Case Studies"
                                                ],
                                                "collections": [
                                                                "Environmental Governance in Nigeria",
                                                                "African Climate Policy"
                                                ],
                                                "keywords": [
                                                                "Fossil-Fuel Subsidy Reform",
                                                                "Public Accountability",
                                                                "Fiscal Responsibility Act 2007",
                                                                "Nigeria",
                                                                "Social Protection",
                                                                "Muhammad Garba Isah",
                                                                "Energy Transition",
                                                                "FAAC"
                                                ],
                                                "cover_image": "assets/real/subsidy-removal-policy-brief-cover.webp",
                                                "file_url": "assets/publications/subsidy-removal-public-accountability-policy-brief.pdf",
                                                "article_url": "subsidy-removal-public-accountability-policy-brief.html",
                                                "file_format": "PDF",
                                                "file_size": "314 KB",
                                                "page_count": 12,
                                                "language": "English",
                                                "doi": "10.5281/zenodo.gnep.pb2026.008",
                                                "citation_apa": "Isah, M. G. (2026). From Subsidy Removal to Public Accountability: Making Nigeria's Fuel Reform Work for Households by 2030 (Policy Brief No. GNEP-PB-2026-008). Global Nature and Environmental Partnership (GNEP Africa).",
                                                "citation_chicago": "Isah, Muhammad Garba. \"From Subsidy Removal to Public Accountability: Making Nigeria's Fuel Reform Work for Households by 2030.\" Policy Brief No. GNEP-PB-2026-008. Katsina: Global Nature and Environmental Partnership, 2026.",
                                                "is_featured": true,
                                                "is_external": false,
                                                "external_url": "",
                                                "status": "published",
                                                "related_ids": [
                                                                "nigeria-heat-emergency-policy-brief",
                                                                "cso-policy-brief-workshop",
                                                                "turning-research-into-action"
                                                ]
                                },
                                {
                                                "id": "rethinking-climate-finance-africa",
                                                "slug": "rethinking-climate-finance-africa",
                                                "title": "Rethinking Climate Finance for Africa",
                                                "abstract": "Co-authored by Mohammed Labaran Sani and Amina Baala (baalaamina@gmail.com). Africa requires approximately USD 2.8 trillion between 2020 and 2030 to implement 51 Nationally Determined Contributions (NDCs), yet climate finance flows reached only $44 billion in 2021/22 (23% of annual need), with more than half arriving as debt. This brief evaluates debt-for-nature swaps, concessional capital guarantees, and the Second Africa Climate Summit's Addis Ababa Declaration to propose seven grant-equivalent delivery reforms.",
                                                "full_description": "Examines why the structure of African climate finance—not just its volume—is the binding constraint on resilience. Against US$865 billion in decadal African external debt service and borrowing costs two to three times higher than in advanced economies, the brief analyzes Gabon's $500M Blue Bond, IEA concessional leverage multipliers, the African Climate Facility, and the Loss and Damage Fund, setting out seven concrete benchmarks for negotiators through 2035.",
                                                "authors": [
                                                                "Mohammed Labaran Sani",
                                                                "Amina Baala (Co-Author — baalaamina@gmail.com)"
                                                ],
                                                "publishing_org": "Global Nature and Environmental Partnership (GNEP Africa)",
                                                "source_category": "GNEP-authored publications",
                                                "publication_date": "2026-10-15",
                                                "year": 2026,
                                                "doc_type": "Policy briefs",
                                                "doc_code": "GNEP-PB-2026-009",
                                                "categories": [
                                                                "Climate Finance and Development",
                                                                "Environmental Governance and Policy",
                                                                "Climate Change and Resilience",
                                                                "Renewable Energy and Sustainable Development"
                                                ],
                                                "collections": [
                                                                "African Climate Policy"
                                                ],
                                                "keywords": [
                                                                "Climate Finance",
                                                                "NDCs",
                                                                "Debt-for-Nature Swaps",
                                                                "Addis Ababa Declaration",
                                                                "COP29",
                                                                "COP30",
                                                                "Adaptation Grants",
                                                                "Mohammed Labaran Sani",
                                                                "Amina Baala"
                                                ],
                                                "cover_image": "assets/real/rethinking-climate-finance-cover.webp",
                                                "file_url": "assets/publications/rethinking-climate-finance-africa.pdf",
                                                "article_url": "rethinking-climate-finance-africa.html",
                                                "file_format": "PDF",
                                                "file_size": "1171 KB",
                                                "page_count": 6,
                                                "language": "English",
                                                "doi": "10.5281/zenodo.gnep.pb2026.009",
                                                "citation_apa": "Sani, M. L., & Baala, A. (2026). Rethinking Climate Finance for Africa (Policy Brief No. GNEP-PB-2026-009). Global Nature and Environmental Partnership (GNEP Africa). Co-author correspondence: baalaamina@gmail.com.",
                                                "citation_chicago": "Sani, Mohammed Labaran, and Amina Baala. \"Rethinking Climate Finance for Africa.\" Policy Brief No. GNEP-PB-2026-009. Katsina: Global Nature and Environmental Partnership, 2026.",
                                                "is_featured": false,
                                                "is_external": false,
                                                "external_url": "",
                                                "status": "published",
                                                "related_ids": [
                                                                "subsidy-removal-public-accountability-policy-brief",
                                                                "turning-research-into-action",
                                                                "wefe-nexus-strategic-framework"
                                                ]
                                },
                                {
                                                "id": "adapting-rotterdam-sponge-city-lagos",
                                                "slug": "adapting-rotterdam-sponge-city-lagos",
                                                "title": "Adapting Rotterdam’s Sponge City Model for Urban Flood Resilience in Lagos",
                                                "abstract": "Following July 2026 flash floods across 15 Lagos communities, state suspension of land reclamation, and tidal locking caused by a one-metre lagoon rise, this brief evaluates which elements of Rotterdam's Sponge City model (such as the 1.7-million-litre Benthemplein water square) can be adapted to Lagos. It recommends permanent statutory wetland protection, desilting maintenance across 1,500 km of channels, flap gates/pumps for tidal locking, and three resident-co-designed mainland pilot water squares in Kosofe, Ikeja, or Agege.",
                                                "full_description": "Satellite analysis from 1984 to 2023 reveals a 38% expansion in Lagos' built-up area alongside a 32% loss of forests and 11% reduction in water bodies, placing over 60% of urban Lagos at risk of extreme flooding by 2050. Comparing Rotterdam's Benthemplein water square and cancelled Bloemhofplein trial against Lagos' land scarcity, informal settlement vulnerability, and tidal locking, this policy brief distinguishes cost-effective grey-green infrastructure and statutory floodplain protection from prestige spending.",
                                                "authors": [
                                                                "Mohammed Labaran Sani (Founder & Lead, GNEP Africa)"
                                                ],
                                                "publishing_org": "Global Nature and Environmental Partnership (GNEP Africa)",
                                                "source_category": "GNEP-authored publications",
                                                "publication_date": "2026-10-13",
                                                "year": 2026,
                                                "doc_type": "Case studies",
                                                "doc_code": "GNEP-CS-2026-012",
                                                "categories": [
                                                                "Nature-Based Solutions and Ecosystem Restoration",
                                                                "Climate Change and Resilience",
                                                                "Environmental Governance and Policy",
                                                                "African Environmental Case Studies"
                                                ],
                                                "collections": [
                                                                "African Climate Policy",
                                                                "Environmental Governance in Nigeria"
                                                ],
                                                "keywords": [
                                                                "Sponge City",
                                                                "Rotterdam",
                                                                "Lagos Flooding",
                                                                "Blue-Green Infrastructure",
                                                                "Water Squares",
                                                                "Tidal Locking",
                                                                "Wetland Protection",
                                                                "Mohammed Labaran Sani"
                                                ],
                                                "cover_image": "assets/real/rotterdam-sponge-city-lagos-cover.webp",
                                                "file_url": "assets/publications/adapting-rotterdam-sponge-city-lagos.pdf",
                                                "article_url": "adapting-rotterdam-sponge-city-lagos.html",
                                                "file_format": "PDF",
                                                "file_size": "854 KB",
                                                "page_count": 5,
                                                "language": "English",
                                                "doi": "10.5281/zenodo.gnep.cs2026.012",
                                                "citation_apa": "Sani, M. L. (2026). Adapting Rotterdam’s Sponge City Model for Urban Flood Resilience in Lagos (Case Study & Policy Brief No. GNEP-CS-2026-012). Global Nature and Environmental Partnership (GNEP Africa).",
                                                "citation_chicago": "Sani, Mohammed Labaran. \"Adapting Rotterdam’s Sponge City Model for Urban Flood Resilience in Lagos.\" Case Study & Policy Brief No. GNEP-CS-2026-012. Katsina: Global Nature and Environmental Partnership, 2026.",
                                                "is_featured": false,
                                                "is_external": false,
                                                "external_url": "",
                                                "status": "published",
                                                "related_ids": [
                                                                "nigeria-heat-emergency-policy-brief",
                                                                "rethinking-climate-finance-africa",
                                                                "turning-research-into-action"
                                                ]
                                },
                                {
                                                "id": "nigeria-heat-emergency-policy-brief",
                                                "slug": "nigeria-heat-emergency-policy-brief",
                                                "title": "URGENT POLICY BRIEF: 31,400 Lives at Risk? Nigeria's Race Against Super El Niño",
                                                "abstract": "Comprehensive heat-health vulnerability assessment and sub-national early warning policy directives ahead of the projected 2026–2027 Super El Niño cycle across Northern Nigeria.",
                                                "full_description": "Between September 2026 and February 2027, predictive ocean-atmospheric telemetry indicates a severe Super El Niño phase coinciding with dry season ambient temperature spikes across the West African Sahel. Without proactive, community-anchored heat-health adaptation protocols, epidemiological models project up to 31,400 excess heat-vulnerability events across Northern Nigeria.",
                                                "authors": [
                                                                "GNEP Directorate of Climate Policy & Risk Analysis"
                                                ],
                                                "publishing_org": "Global Nature and Environmental Partnership (GNEP Africa)",
                                                "source_category": "GNEP-authored publications",
                                                "publication_date": "2026-09-15",
                                                "year": 2026,
                                                "doc_type": "Policy briefs",
                                                "doc_code": "GNEP-PB-2026-001",
                                                "categories": [
                                                                "Climate Change and Resilience",
                                                                "African Environmental Case Studies"
                                                ],
                                                "collections": [
                                                                "African Climate Policy",
                                                                "Climate Adaptation in Arid and Semi-Arid Regions"
                                                ],
                                                "keywords": [
                                                                "Super El Niño",
                                                                "Extreme Heat",
                                                                "Northern Nigeria",
                                                                "Katsina",
                                                                "Early Warning",
                                                                "Public Health",
                                                                "Sahel"
                                                ],
                                                "cover_image": "assets/real/nigeria-heat-emergency-crisis.webp",
                                                "file_url": "assets/publications/nigeria-heat-emergency-policy-brief.pdf",
                                                "article_url": "nigeria-heat-emergency-policy-brief.html",
                                                "file_format": "PDF",
                                                "file_size": "173 KB",
                                                "page_count": 6,
                                                "language": "English",
                                                "doi": "10.5281/zenodo.gnep.pb2026.001",
                                                "citation_apa": "GNEP Climate Policy Directorate. (2026). URGENT POLICY BRIEF: 31,400 Lives at Risk? Nigeria's Race Against Super El Niño (Policy Brief No. GNEP-PB-2026-001). Global Nature and Environmental Partnership.",
                                                "citation_chicago": "GNEP Climate Policy Directorate. \"URGENT POLICY BRIEF: 31,400 Lives at Risk? Nigeria's Race Against Super El Niño.\" Policy Brief No. GNEP-PB-2026-001. Katsina: Global Nature and Environmental Partnership, 2026.",
                                                "is_featured": false,
                                                "is_external": false,
                                                "external_url": "",
                                                "status": "published",
                                                "related_ids": [
                                                                "el-nino-me-ya-kamata-kowane-dan-najeriya-ya-sani",
                                                                "cso-policy-brief-workshop",
                                                                "turning-research-into-action"
                                                ]
                                },
                                {
                                                "id": "cso-policy-brief-workshop",
                                                "slug": "cso-policy-brief-workshop",
                                                "title": "Strengthening Grassroots Climate Advocacy: Proceedings of the Katsina CSO Policy Brief Workshop",
                                                "abstract": "Official proceedings, pedagogical framework, and legislative pitching toolkit deployed during the training of 20 grassroots civil society leaders in Northern Nigeria.",
                                                "full_description": "In 2026, GNEP Africa and The Green Minds Space convened a policy brief drafting, proposal development, elevator pitching, and responsible AI tools workshop for 20 civil society representatives in Katsina State.",
                                                "authors": [
                                                                "Global Nature and Environmental Partnership (GNEP Africa)",
                                                                "The Green Minds Space"
                                                ],
                                                "publishing_org": "GNEP Africa & The Green Minds Space",
                                                "source_category": "Collaborative research",
                                                "publication_date": "2026-08-20",
                                                "year": 2026,
                                                "doc_type": "Technical reports",
                                                "doc_code": "GNEP-TR-2026-002",
                                                "categories": [
                                                                "Environmental Governance and Policy",
                                                                "Environmental Education and Youth Leadership"
                                                ],
                                                "collections": [
                                                                "Environmental Governance in Nigeria",
                                                                "Youth Leadership and Climate Justice"
                                                ],
                                                "keywords": [
                                                                "CSO Capacity",
                                                                "Policy Briefs",
                                                                "Legislative Advocacy",
                                                                "Katsina State",
                                                                "Environmental Governance",
                                                                "Green Minds Space"
                                                ],
                                                "cover_image": "assets/real/gallery/gnep-workshops-01-full.webp",
                                                "file_url": "assets/publications/cso-policy-brief-workshop.pdf",
                                                "article_url": "cso-policy-workshop.html",
                                                "file_format": "PDF",
                                                "file_size": "161 KB",
                                                "page_count": 10,
                                                "language": "English",
                                                "doi": "10.5281/zenodo.gnep.tr2026.002",
                                                "citation_apa": "GNEP Africa, & The Green Minds Space. (2026). Strengthening Grassroots Climate Advocacy: Proceedings of the Katsina CSO Policy Brief Workshop (Technical Report No. GNEP-TR-2026-002). Global Nature and Environmental Partnership.",
                                                "citation_chicago": "Global Nature and Environmental Partnership, and The Green Minds Space. Strengthening Grassroots Climate Advocacy: Proceedings of the Katsina CSO Policy Brief Workshop. Technical Report No. GNEP-TR-2026-002. Katsina, 2026.",
                                                "is_featured": false,
                                                "is_external": false,
                                                "external_url": "",
                                                "status": "published",
                                                "related_ids": [
                                                                "turning-research-into-action",
                                                                "communicating-environmental-issues",
                                                                "subsidy-removal-public-accountability-policy-brief"
                                                ]
                                },
                                {
                                                "id": "sahelian-tree-planting-field-report",
                                                "slug": "sahelian-tree-planting-field-report",
                                                "title": "Economic Tree Cultivation and Community Land Stewardship: A 150-Seedling Drive in Katsina State",
                                                "abstract": "Field documentation and community co-custodianship models from a joint 150 economic tree seedling planting initiative in Katsina State with AYINET.",
                                                "full_description": "Conducted in collaboration with the African Youth Initiative Network (AYINET), this field report documents the planting of 150 economic tree seedlings across community and school tracts in Katsina State as part of GNEP's Nature & Ecosystem Restoration focus area.",
                                                "authors": [
                                                                "GNEP Africa",
                                                                "African Youth Initiative Network (AYINET)"
                                                ],
                                                "publishing_org": "GNEP Africa & AYINET",
                                                "source_category": "Collaborative research",
                                                "publication_date": "2026-07-10",
                                                "year": 2026,
                                                "doc_type": "Case studies",
                                                "doc_code": "GNEP-CS-2026-003",
                                                "categories": [
                                                                "Nature-Based Solutions and Ecosystem Restoration",
                                                                "African Environmental Case Studies"
                                                ],
                                                "collections": [
                                                                "Community-Led Ecosystem Restoration",
                                                                "Climate Adaptation in Arid and Semi-Arid Regions"
                                                ],
                                                "keywords": [
                                                                "Economic Trees",
                                                                "Afforestation",
                                                                "Katsina State",
                                                                "AYINET",
                                                                "Youth Stewards"
                                                ],
                                                "cover_image": "assets/real/tree-planting-action.webp",
                                                "file_url": "assets/publications/sahelian-tree-planting-field-report.pdf",
                                                "article_url": "tree-planting-150-seedlings.html",
                                                "file_format": "PDF",
                                                "file_size": "165 KB",
                                                "page_count": 8,
                                                "language": "English",
                                                "doi": "10.5281/zenodo.gnep.cs2026.003",
                                                "citation_apa": "GNEP Africa, & AYINET. (2026). Economic Tree Cultivation and Community Land Stewardship: A 150-Seedling Drive in Katsina State (Case Study No. GNEP-CS-2026-003). Katsina: GNEP Africa.",
                                                "citation_chicago": "GNEP Africa, and AYINET. Economic Tree Cultivation and Community Land Stewardship: A 150-Seedling Drive in Katsina State. Case Study No. GNEP-CS-2026-003. Katsina: GNEP Africa, 2026.",
                                                "is_featured": false,
                                                "is_external": false,
                                                "external_url": "",
                                                "status": "published",
                                                "related_ids": [
                                                                "youth-led-environmental-action",
                                                                "adapting-rotterdam-sponge-city-lagos"
                                                ]
                                },
                                {
                                                "id": "turning-research-into-action",
                                                "slug": "turning-research-into-action",
                                                "title": "Turning Research into Action: Strengthening Evidence-Based Environmental Policy Engagement",
                                                "abstract": "A practitioner's methodological framework guiding African environmental researchers and youth advocates to translate empirical datasets into legislative and community action.",
                                                "full_description": "Academic environmental findings across Africa frequently remain siloed within institutional libraries. This working paper outlines an operational framework connecting frontline community problem formulation, citizen telemetry, concise legislative policy briefs, and post-enactment monitoring.",
                                                "authors": [
                                                                "GNEP Research & Capacity Development Division"
                                                ],
                                                "publishing_org": "Global Nature and Environmental Partnership (GNEP Africa)",
                                                "source_category": "GNEP-authored publications",
                                                "publication_date": "2026-06-05",
                                                "year": 2026,
                                                "doc_type": "Working papers",
                                                "doc_code": "GNEP-WP-2026-004",
                                                "categories": [
                                                                "Research Methods and Technical Resources",
                                                                "Environmental Governance and Policy"
                                                ],
                                                "collections": [
                                                                "African Climate Policy",
                                                                "Environmental Governance in Nigeria"
                                                ],
                                                "keywords": [
                                                                "Research Methods",
                                                                "Evidence-Based Policy",
                                                                "Policy Translation",
                                                                "Sub-Saharan Africa",
                                                                "Advocacy Framework"
                                                ],
                                                "cover_image": "assets/real/policy-brief-research.webp",
                                                "file_url": "assets/publications/turning-research-into-action.pdf",
                                                "article_url": "turning-research-into-action.html",
                                                "file_format": "PDF",
                                                "file_size": "163 KB",
                                                "page_count": 12,
                                                "language": "English",
                                                "doi": "10.5281/zenodo.gnep.wp2026.004",
                                                "citation_apa": "GNEP Research Division. (2026). Turning Research into Action: Strengthening Evidence-Based Environmental Policy Engagement (Working Paper No. GNEP-WP-2026-004). Global Nature and Environmental Partnership.",
                                                "citation_chicago": "GNEP Research Division. Turning Research into Action: Strengthening Evidence-Based Environmental Policy Engagement. Working Paper No. GNEP-WP-2026-004. Katsina: GNEP Africa, 2026.",
                                                "is_featured": false,
                                                "is_external": false,
                                                "external_url": "",
                                                "status": "published",
                                                "related_ids": [
                                                                "cso-policy-brief-workshop",
                                                                "communicating-environmental-issues"
                                                ]
                                },
                                {
                                                "id": "communicating-environmental-issues",
                                                "slug": "communicating-environmental-issues",
                                                "title": "Communicating Environmental Issues: Why Storytelling Matters for Civil Society",
                                                "abstract": "Strategic communications and community narrative toolkit detailing ethical storytelling, persuasive communication, and grassroots messaging for African civil society.",
                                                "full_description": "Data alone rarely moves hearts or parliaments. Authored by Maryam Dauda following GNEP's one-day Storytelling & Persuasive Communication Workshop for CSOs in Katsina State, this educational resource equips grassroots environmental organisations with concrete narrative methodologies.",
                                                "authors": [
                                                                "Maryam Dauda (GNEP Communications Unit)"
                                                ],
                                                "publishing_org": "Global Nature and Environmental Partnership (GNEP Africa)",
                                                "source_category": "GNEP-authored publications",
                                                "publication_date": "2026-05-18",
                                                "year": 2026,
                                                "doc_type": "Educational resources",
                                                "doc_code": "GNEP-ER-2026-005",
                                                "categories": [
                                                                "Environmental Education and Youth Leadership",
                                                                "Research Methods and Technical Resources"
                                                ],
                                                "collections": [
                                                                "Youth Leadership and Climate Justice"
                                                ],
                                                "keywords": [
                                                                "Storytelling",
                                                                "Communications",
                                                                "Civil Society",
                                                                "Environmental Journalism",
                                                                "Youth Voice",
                                                                "Advocacy"
                                                ],
                                                "cover_image": "assets/real/storytelling-speaker.webp",
                                                "file_url": "assets/publications/communicating-environmental-issues.pdf",
                                                "article_url": "communicating-environmental-issues.html",
                                                "file_format": "PDF",
                                                "file_size": "155 KB",
                                                "page_count": 8,
                                                "language": "English",
                                                "doi": "10.5281/zenodo.gnep.er2026.005",
                                                "citation_apa": "Dauda, M. (2026). Communicating Environmental Issues: Why Storytelling Matters for Civil Society (Educational Resource No. GNEP-ER-2026-005). Global Nature and Environmental Partnership.",
                                                "citation_chicago": "Dauda, Maryam. Communicating Environmental Issues: Why Storytelling Matters for Civil Society. Educational Resource No. GNEP-ER-2026-005. Katsina: Global Nature and Environmental Partnership, 2026.",
                                                "is_featured": false,
                                                "is_external": false,
                                                "external_url": "",
                                                "status": "published",
                                                "related_ids": [
                                                                "lingua-franca-hausa-into-climate",
                                                                "turning-research-into-action",
                                                                "youth-led-environmental-action"
                                                ]
                                },
                                {
                                                "id": "youth-led-environmental-action",
                                                "slug": "youth-led-environmental-action",
                                                "title": "Youth-Led Environmental Action: Building Local Capacity for Sustainable Development",
                                                "abstract": "Participatory action research documenting youth mobilization, school Climate Clubs in Katsina State, and local environmental stewardship.",
                                                "full_description": "Examines the catalytic role of young people in advancing climate literacy and community-led environmental action, including GNEP's ongoing establishment of Climate Clubs in secondary schools across Katsina State.",
                                                "authors": [
                                                                "GNEP Youth Leadership & Policy Directorate"
                                                ],
                                                "publishing_org": "Global Nature and Environmental Partnership (GNEP Africa)",
                                                "source_category": "GNEP-authored publications",
                                                "publication_date": "2026-03-24",
                                                "year": 2026,
                                                "doc_type": "Research papers",
                                                "doc_code": "GNEP-RP-2026-006",
                                                "categories": [
                                                                "Environmental Education and Youth Leadership",
                                                                "African Environmental Case Studies",
                                                                "Climate Change and Resilience"
                                                ],
                                                "collections": [
                                                                "Youth Leadership and Climate Justice",
                                                                "Community-Led Ecosystem Restoration"
                                                ],
                                                "keywords": [
                                                                "Youth Leadership",
                                                                "Climate Clubs",
                                                                "Sahelian Resilience",
                                                                "Katsina State"
                                                ],
                                                "cover_image": "assets/real/schools-tree-planting.webp",
                                                "file_url": "assets/publications/youth-led-environmental-action.pdf",
                                                "article_url": "youth-environmental-action.html",
                                                "file_format": "PDF",
                                                "file_size": "156 KB",
                                                "page_count": 14,
                                                "language": "English",
                                                "doi": "10.5281/zenodo.gnep.rp2026.006",
                                                "citation_apa": "GNEP Youth Directorate. (2026). Youth-Led Environmental Action: Building Local Capacity for Sustainable Development (Research Paper No. GNEP-RP-2026-006). Global Nature and Environmental Partnership.",
                                                "citation_chicago": "GNEP Youth Directorate. Youth-Led Environmental Action: Building Local Capacity for Sustainable Development. Research Paper No. GNEP-RP-2026-006. Katsina: GNEP Africa, 2026.",
                                                "is_featured": false,
                                                "is_external": false,
                                                "external_url": "",
                                                "status": "published",
                                                "related_ids": [
                                                                "sahelian-tree-planting-field-report",
                                                                "communicating-environmental-issues"
                                                ]
                                }
                ]
};
        }
    };

    window.GNEPKnowledgeHub = KnowledgeHub;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => KnowledgeHub.init());
    } else {
        KnowledgeHub.init();
    }

})(window, document);
