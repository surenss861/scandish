// PWA Service - Progressive Web App functionality for Scandish

export class PWAService {
    static isInstalled = false;
    static deferredPrompt = null;

    /**
     * Initialize PWA functionality
     */
    static init() {
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.detectInstallation();
    }

    /**
     * Register the service worker
     */
    static async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/'
                });

                console.log('[PWA] Service Worker registered:', registration.scope);

                // Handle updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('[PWA] New content available - refresh to update');
                            this.showUpdateAvailable();
                        }
                    });
                });

                return registration;
            } catch (error) {
                console.error('[PWA] Service Worker registration failed:', error);
            }
        } else {
            console.log('[PWA] Service Worker not supported');
        }
    }

    /**
     * Setup install prompt handling
     */
    static setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('[PWA] Install prompt available');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        window.addEventListener('appinstalled', () => {
            console.log('[PWA] App installed successfully');
            this.isInstalled = true;
            this.hideInstallButton();
            this.trackInstallation();
        });
    }

    /**
     * Detect if app is already installed
     */
    static detectInstallation() {
        // Check if running in standalone mode (installed)
        if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
            console.log('[PWA] App is running in installed mode');
        }

        // Check for iOS Safari installation
        if (window.navigator && window.navigator.standalone) {
            this.isInstalled = true;
            console.log('[PWA] App installed on iOS');
        }
    }

    /**
     * Show install button
     */
    static showInstallButton() {
        const existingButton = document.getElementById('pwa-install-button');
        if (existingButton) return;

        const installButton = document.createElement('button');
        installButton.id = 'pwa-install-button';
        installButton.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #F3C77E, #d6a856);
        color: black;
        border: none;
        padding: 12px 20px;
        border-radius: 12px;
        font-weight: bold;
        box-shadow: 0 4px 20px rgba(243, 199, 126, 0.3);
        cursor: pointer;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        transition: all 0.3s ease;
      ">
        📱 Install Scandish App
      </div>
    `;

        installButton.addEventListener('click', () => {
            this.promptInstall();
        });

        installButton.addEventListener('mouseenter', () => {
            installButton.style.transform = 'translateY(-2px)';
            installButton.style.boxShadow = '0 6px 25px rgba(243, 199, 126, 0.4)';
        });

        installButton.addEventListener('mouseleave', () => {
            installButton.style.transform = 'translateY(0)';
            installButton.style.boxShadow = '0 4px 20px rgba(243, 199, 126, 0.3)';
        });

        document.body.appendChild(installButton);

        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (installButton && installButton.parentNode) {
                installButton.style.opacity = '0.7';
            }
        }, 10000);
    }

    /**
     * Hide install button
     */
    static hideInstallButton() {
        const button = document.getElementById('pwa-install-button');
        if (button) {
            button.remove();
        }
    }

    /**
     * Prompt user to install the app
     */
    static async promptInstall() {
        if (!this.deferredPrompt) {
            console.log('[PWA] Install prompt not available');
            return false;
        }

        try {
            this.deferredPrompt.prompt();
            const result = await this.deferredPrompt.userChoice;

            console.log('[PWA] Install prompt result:', result.outcome);

            if (result.outcome === 'accepted') {
                this.trackInstallation();
            }

            this.deferredPrompt = null;
            this.hideInstallButton();

            return result.outcome === 'accepted';
        } catch (error) {
            console.error('[PWA] Install prompt error:', error);
            return false;
        }
    }

    /**
     * Show update available notification
     */
    static showUpdateAvailable() {
        const notification = document.createElement('div');
        notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #0f0e0c;
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        border: 1px solid #F3C77E;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 1001;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
      ">
        <span>🚀</span>
        <span>New version available!</span>
        <button onclick="window.location.reload()" style="
          background: #F3C77E;
          color: black;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
        ">Update</button>
      </div>
    `;

        document.body.appendChild(notification);

        // Auto-remove after 30 seconds
        setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.remove();
            }
        }, 30000);
    }

    /**
     * Track installation for analytics
     */
    static trackInstallation() {
        // Track PWA installation
        if (typeof gtag !== 'undefined') {
            gtag('event', 'pwa_install', {
                event_category: 'PWA',
                event_label: 'App Installed'
            });
        }

        // Send to your analytics
        fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event: 'pwa_install',
                timestamp: new Date().toISOString()
            })
        }).catch(() => { });
    }

    /**
     * Cache a menu for offline access
     */
    static async cacheMenu(menuSlug) {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'CACHE_MENU',
                url: `/menu/${menuSlug}`
            });
        }
    }

    /**
     * Check if app is running in standalone mode
     */
    static isStandalone() {
        return this.isInstalled;
    }

    /**
     * Get install status for UI
     */
    static getInstallStatus() {
        return {
            isInstalled: this.isInstalled,
            canInstall: !!this.deferredPrompt,
            isStandalone: this.isStandalone()
        };
    }
}

// Auto-initialize when loaded
if (typeof window !== 'undefined') {
    PWAService.init();
}
