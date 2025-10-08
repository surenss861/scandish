// src/pages/MenuPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import ThemeToggle from "../components/ThemeToggle";
import { ThemeProvider } from "../context/ThemeContext";
import { usePlan } from "../context/PlanContext";
import SocialShare, { FloatingShareButton } from "../components/SocialShare";
import UnifiedBrandingPreview from "../components/UnifiedBrandingPreview";
import { WatermarkUpgradePrompt } from "../components/PlanUpgradePrompt";

/**
 * Public Menu Page
 * - Theme-aware design (light/dark mode)
 * - Enhanced mobile UX
 * - Structured JSON-LD data for SEO
 * - Analytics tracking
 * - Watermark for free tier
 */
function MenuPageContent() {
  const { slug } = useParams();
  const { hasFeature } = usePlan();
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        // Track page view for analytics
        const viewEvent = {
          event: 'menu_view',
          slug: slug,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer
        };

        const res = await fetch(`/api/menus/${slug}`);
        if (!res.ok) throw new Error("Menu not found");
        const json = await res.json();

        // Track analytics
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(viewEvent)
        }).catch(() => { }); // Silent fail for analytics

        setMenu(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenu();
  }, [slug]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-gray-300 dark:border-gray-600 border-t-blue-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading menu...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
        <div className="text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <h1 className="text-2xl font-bold mb-2">Menu Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
        <p className="text-gray-600 dark:text-gray-400">No menu data available</p>
      </div>
    );
  }

  // Group items by category
  const grouped = (menu.items || []).reduce((acc, item) => {
    const cat = item.category || "Menu";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  // Check if watermark should be shown (free tier users without removeWatermark feature)
  const showWatermark = !hasFeature('removeWatermark');

  // JSON-LD schema.org for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: menu.title,
    description: `Digital menu for ${menu.title}`,
    hasMenuSection: Object.entries(grouped).map(([category, items]) => ({
      "@type": "MenuSection",
      name: category,
      hasMenuItem: items.map((item) => ({
        "@type": "MenuItem",
        name: item.name,
        description: item.description || "",
        image: item.image || undefined,
        offers: {
          "@type": "Offer",
          price: item.price || undefined,
          priceCurrency: "USD",
        },
      })),
    })),
  };

  return (
    <>
      {/* Enhanced SEO */}
      <Helmet>
        <title>{menu.title} - Digital Menu | Scandish</title>
        <meta name="description" content={`View the digital menu for ${menu.title}. Quick, easy, and mobile-friendly.`} />
        <meta property="og:title" content={`${menu.title} - Digital Menu`} />
        <meta property="og:description" content={`View the digital menu for ${menu.title}. Quick, easy, and mobile-friendly.`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${menu.title} - Digital Menu`} />
        <meta name="twitter:description" content={`View the digital menu for ${menu.title}. Quick, easy, and mobile-friendly.`} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors font-sans">
        {/* Theme Toggle & Share - Top Right */}
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
          <SocialShare menuTitle={menu.title} menuUrl={`/menu/${slug}`} />
          <ThemeToggle />
        </div>

        {/* Floating Share Button for Mobile */}
        <FloatingShareButton menuTitle={menu.title} menuUrl={`/menu/${slug}`} />

        {/* Hero */}
        <header className="pt-16 pb-12 text-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-3"
          >
            {menu.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-600 dark:text-gray-400 text-lg"
          >
            Scan • Browse • Enjoy
          </motion.p>
        </header>

        {/* Menu sections */}
        <main className="w-full px-4 sm:px-6 lg:px-8 pb-24">
          <UnifiedBrandingPreview
            title={menu.title}
            items={menu.items}
            branding={menu.content}
          />
        </main>

        {/* Watermark for free tier */}
        {showWatermark && (
          <WatermarkUpgradePrompt>
            <div className="fixed bottom-4 left-4 z-40">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 }}
                className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Scandish</span>
                  <span className="text-gray-500">•</span>
                  <a
                    href="https://scandish.ca"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Get yours
                  </a>
                </div>
              </motion.div>
            </div>
          </WatermarkUpgradePrompt>
        )}
      </div>
    </>
  );
}

// Wrapper with Theme Provider
export default function MenuPage() {
  return (
    <ThemeProvider>
      <MenuPageContent />
    </ThemeProvider>
  );
}
