import React from 'react';

/**
 * MenuPreview renders a read‑only view of menu items with Scandish styling.
 * Items are grouped by category and displayed with glassmorphic design.
 */
export default function MenuPreview({ title, items }) {
  // Group items by category
  const grouped = items.reduce((acc, item) => {
    const category = item.category || 'Menu Items';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  const categories = Object.keys(grouped);

  if (categories.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3">🍽️</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No items yet</h3>
        <p className="text-sm text-gray-500">Add your first menu item to see the preview</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {title && (
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{title}</h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-[#F3C77E] to-[#d6a856] mx-auto"></div>
        </div>
      )}

      {categories.map((category) => (
        <div key={category} className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
            {category}
          </h3>
          <div className="space-y-3">
            {grouped[category].map((item, idx) => (
              <div
                key={idx}
                className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {item.image_url || item.image ? (
                        <img
                          src={item.image_url || item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                          loading="lazy"
                        />
                      ) : item.emoji && (
                        <span className="text-lg">{item.emoji}</span>
                      )}
                      <h4 className="font-semibold text-gray-900 leading-snug">
                        {item.name}
                      </h4>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-green-600">
                      {item.price === "" || item.price === null || isNaN(item.price)
                        ? "Market Price"
                        : `$${Number(item.price).toFixed(2)}`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Scandish branding for preview */}
      <div className="text-center py-4 border-t border-gray-200">
        <p className="text-xs text-gray-400">
          Powered by <span className="text-[#F3C77E] font-medium">Scandish</span>
        </p>
      </div>
    </div>
  );
}