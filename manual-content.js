class ManualContentPage {
    constructor() {
        this.content = null;
        this.lastUpdate = new Date();
        this.refreshInterval = 5 * 60 * 1000; // 5 minutes
        
        this.init();
    }
    
    init() {
        this.setupClock();
        this.loadContent();
        this.setupDHLLogo();
        this.startAutoRefresh();
    }
    
    setupClock() {
        const updateClock = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('de-DE', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            const dateString = now.toLocaleDateString('de-DE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            document.getElementById('currentTime').textContent = timeString;
            document.getElementById('currentDate').textContent = dateString;
        };
        
        updateClock();
        setInterval(updateClock, 1000);
    }
    
    async loadContent() {
        const loading = document.getElementById('loading');
        const contentGrid = document.getElementById('contentGrid');
        const noContent = document.getElementById('noContent');
        
        try {
            loading.style.display = 'block';
            contentGrid.style.display = 'none';
            noContent.style.display = 'none';
            
            const response = await fetch('/content/manual-content.json');
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            this.content = data;
            this.lastUpdate = new Date();
            
            this.renderContent();
            this.updateLastUpdateTime();
            
        } catch (error) {
            console.error('Error fetching manual content:', error);
            this.loadFallbackContent();
        } finally {
            loading.style.display = 'none';
        }
    }
    
    loadFallbackContent() {
        this.content = {
            title: "Aktuelle Hinweise",
            lastUpdated: new Date().toISOString(),
            content: [
                {
                    id: 1,
                    type: 'info',
                    title: 'Willkommen bei DHL',
                    message: 'Die Informationstafel wird gerade geladen. Bitte haben Sie einen Moment Geduld.',
                    priority: 'medium'
                }
            ]
        };
        this.renderContent();
    }
    
    renderContent() {
        const contentGrid = document.getElementById('contentGrid');
        const noContent = document.getElementById('noContent');
        const pageTitle = document.getElementById('pageTitle');
        
        // Update page title
        pageTitle.textContent = this.content.title;
        
        if (!this.content.content || this.content.content.length === 0) {
            contentGrid.style.display = 'none';
            noContent.style.display = 'block';
            return;
        }
        
        contentGrid.innerHTML = '';
        contentGrid.style.display = 'grid';
        noContent.style.display = 'none';
        
        this.content.content.forEach(item => {
            const contentItem = this.createContentItem(item);
            contentGrid.appendChild(contentItem);
        });
    }
    
    createContentItem(item) {
        const itemDiv = document.createElement('div');
        itemDiv.className = `content-item ${item.type}`;
        
        const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        iconSvg.classList.add('icon', 'item-icon', item.type);
        this.setTypeIcon(iconSvg, item.type);
        
        const priorityBadge = this.createPriorityBadge(item.priority);
        
        itemDiv.innerHTML = `
            <div class="item-header">
                <div class="header-row">
                    <div class="icon-title">
                        <h3 class="item-title">${item.title}</h3>
                    </div>
                </div>
            </div>
            <div class="item-content">
                <p class="item-message">${item.message}</p>
            </div>
        `;
        
        // Insert icon and priority badge
        const iconTitle = itemDiv.querySelector('.icon-title');
        iconTitle.insertBefore(iconSvg, iconTitle.firstChild);
        
        const headerRow = itemDiv.querySelector('.header-row');
        headerRow.appendChild(priorityBadge);
        
        return itemDiv;
    }
    
    setTypeIcon(svgElement, type) {
        const useElement = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        let iconId;
        
        switch (type) {
            case 'warning':
                iconId = '#alert-triangle-icon';
                break;
            case 'success':
                iconId = '#check-circle-icon';
                break;
            default:
                iconId = '#info-icon';
        }
        
        useElement.setAttribute('href', iconId);
        svgElement.innerHTML = '';
        svgElement.appendChild(useElement);
    }
    
    createPriorityBadge(priority) {
        const badge = document.createElement('span');
        badge.className = `badge priority-badge ${priority}`;
        
        const priorityText = {
            'high': 'Hoch',
            'medium': 'Mittel',
            'low': 'Niedrig'
        };
        
        badge.textContent = priorityText[priority] || 'Unbekannt';
        return badge;
    }
    
    updateLastUpdateTime() {
        const lastUpdateElement = document.getElementById('lastUpdate');
        const timeString = this.lastUpdate.toLocaleString('de-DE');
        lastUpdateElement.textContent = timeString;
    }
    
    startAutoRefresh() {
        setInterval(() => {
            this.loadContent();
        }, this.refreshInterval);
    }
    
    setupDHLLogo() {
        const logo = document.getElementById('dhlLogo');
        if (logo && !logo.src.includes('data:') && !logo.complete) {
            // Fallback if logo doesn't load
            logo.onerror = () => {
                logo.style.display = 'none';
                const logoSection = document.querySelector('.logo-section');
                const textLogo = document.createElement('div');
                textLogo.innerHTML = '<strong style="color: var(--dhl-yellow); font-size: 24px;">DHL</strong>';
                logoSection.insertBefore(textLogo, logoSection.firstChild);
            };
        }
    }
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ManualContentPage();
});