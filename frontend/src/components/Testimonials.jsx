import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useBentoReveal } from "../hooks/useBentoReveal.js";

const testimonials = [
  {
    name: "Maria Rodriguez",
    business: "Luna's Bistro",
    city: "Austin, TX",
    quote:
      "QuickMenu saved us $300/month on printing costs. Our customers love how easy it is to read the menu on their phones.",
    result: "+18% taps on specials",
    rating: 5,
  },
  {
    name: "David Chen",
    business: "Dragon Garden",
    city: "San Francisco, CA",
    quote:
      "We update our specials daily now. Before QuickMenu, we couldn't afford to print new menus every day.",
    result: "Daily updates",
    rating: 5,
  },
  {
    name: "Sarah Johnson",
    business: "The Coffee Spot",
    city: "Seattle, WA",
    quote:
      "Setting up took 10 minutes. Our QR code is on every table and customers scan it instantly. Game changer!",
    result: "10 min setup",
    rating: 5,
  },
];

export default function Testimonials() {
  const ref = useBentoReveal();

  return (
    <section ref={ref} className="px-6 md:px-12 lg:px-24 py-20 bg-[#101614]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          data-reveal
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#F3F5F4] mb-4">
            Trusted by restaurants
          </h2>
          <p className="text-xl text-[#A6B0AA]">
            Join 73+ restaurants in Toronto using Scandish
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              data-reveal
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#0B0F0E] border-2 border-[#1B2420] rounded-2xl p-6 hover:border-[#1E7A4A] hover:shadow-lg transition-all"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-[#1E7A4A] text-[#1E7A4A]"
                  />
                ))}
              </div>
              <blockquote className="text-[#A6B0AA] mb-6 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>
              <div className="border-t border-[#1B2420] pt-4">
                <div className="font-semibold text-[#F3F5F4]">
                  {testimonial.name}
                </div>
                <div className="text-sm text-[#A6B0AA]">
                  {testimonial.business} • {testimonial.city}
                </div>
                <div className="mt-2 text-sm font-semibold text-[#1E7A4A]">
                  {testimonial.result}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Metric Tile */}
        <motion.div
          data-reveal
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#0B0F0E] border-2 border-[#1B2420] rounded-2xl p-8 text-center"
        >
          <div className="text-5xl font-bold text-[#F3F5F4] mb-2">73+</div>
          <div className="text-lg text-[#A6B0AA] mb-4">
            Restaurants in Toronto
          </div>
          <div className="text-sm text-[#A6B0AA]">
            Join the growing community of restaurants using Scandish
          </div>
        </motion.div>
      </div>
    </section>
  );
}
