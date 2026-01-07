import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Maria Rodriguez",
    business: "Luna's Bistro",
    city: "Austin, TX",
    quote: "QuickMenu saved us $300/month on printing costs. Our customers love how easy it is to read the menu on their phones.",
    result: "+18% taps on specials",
    rating: 5,
  },
  {
    name: "David Chen",
    business: "Dragon Garden",
    city: "San Francisco, CA",
    quote: "We update our specials daily now. Before QuickMenu, we couldn't afford to print new menus every day.",
    result: "Daily updates",
    rating: 5,
  },
  {
    name: "Sarah Johnson",
    business: "The Coffee Spot",
    city: "Seattle, WA",
    quote: "Setting up took 10 minutes. Our QR code is on every table and customers scan it instantly. Game changer!",
    result: "10 min setup",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="px-6 md:px-12 lg:px-24 py-20 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Trusted by restaurants
          </h2>
          <p className="text-xl text-gray-600">
            Join 73+ restaurants in Toronto using Scandish
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-[#F3C77E] text-[#F3C77E]"
                  />
                ))}
              </div>
              <blockquote className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>
              <div className="border-t border-gray-200 pt-4">
                <div className="font-semibold text-gray-900">
                  {testimonial.name}
                </div>
                <div className="text-sm text-gray-600">
                  {testimonial.business} • {testimonial.city}
                </div>
                <div className="mt-2 text-sm font-semibold text-[#F3C77E]">
                  {testimonial.result}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Metric Tile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-8 text-center"
        >
          <div className="text-5xl font-bold text-gray-900 mb-2">73+</div>
          <div className="text-lg text-gray-600 mb-4">Restaurants in Toronto</div>
          <div className="text-sm text-gray-500">
            Join the growing community of restaurants using Scandish
          </div>
        </motion.div>
      </div>
    </section>
  );
}
