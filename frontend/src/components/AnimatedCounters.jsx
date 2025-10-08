import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";

const CountUp = ({ end, duration = 2000, suffix = "", prefix = "" }) => {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const isInView = useInView(elementRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;

    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / duration;

      if (progress < 1) {
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(easeOutQuart * end));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, end, duration]);

  return (
    <span ref={elementRef} className="tabular-nums">
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

const metrics = [
  {
    number: 500,
    suffix: "+",
    label: "Restaurants Served",
    icon: "🍽️",
    description: "From food trucks to fine dining",
    highlight: "Growing daily",
  },
  {
    number: 50,
    suffix: "K+",
    label: "QR Code Scans",
    icon: "📱",
    description: "Happy customers served",
    highlight: "Zero friction",
  },
  {
    number: 99.9,
    suffix: "%",
    label: "Uptime SLA",
    icon: "⚡",
    description: "Enterprise-grade reliability",
    highlight: "Always available",
  },
  {
    number: 200,
    prefix: "$",
    suffix: "+",
    label: "Monthly Savings",
    icon: "💰",
    description: "Average cost reduction",
    highlight: "ROI from day 1",
  },
];

export default function AnimatedCounters() {
  return (
    <section className="relative py-20 px-8 md:px-16 lg:px-32">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#702632]/5 via-[#F3C77E]/5 to-[#702632]/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(243,199,126,0.1),transparent_70%)]" />

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#FFFFFA] mb-4">
            Trusted by Restaurants Worldwide
          </h2>
          <p className="text-lg text-[#d6d6d6] max-w-2xl mx-auto">
            Join hundreds of restaurants who've made the switch from PDF menus
            to QuickMenu
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group relative text-center"
            >
              {/* Card background */}
              <div className="relative bg-[#0f0e0c]/60 backdrop-blur-sm border border-[#40434E]/40 rounded-2xl p-6 hover:border-[#F3C77E]/30 hover:bg-[#0f0e0c]/80 transition-all duration-300">
                {/* Hover glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#F3C77E]/10 via-[#702632]/10 to-[#F3C77E]/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  {/* Icon */}
                  <div className="text-3xl mb-4 group-hover:animate-bounce">
                    {metric.icon}
                  </div>

                  {/* Animated number */}
                  <div className="text-3xl md:text-4xl font-bold text-[#F3C77E] mb-2">
                    <CountUp
                      end={metric.number}
                      suffix={metric.suffix}
                      prefix={metric.prefix}
                      duration={2000 + idx * 200}
                    />
                  </div>

                  {/* Label */}
                  <h3 className="font-semibold text-[#FFFFFA] mb-2">
                    {metric.label}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-[#a7a7a7] mb-3">
                    {metric.description}
                  </p>

                  {/* Highlight badge */}
                  <div className="inline-block bg-[#F3C77E]/20 text-[#F3C77E] px-3 py-1 rounded-full text-xs font-medium border border-[#F3C77E]/30">
                    {metric.highlight}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Section CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-[#F3C77E]/10 to-[#d6a856]/10 border border-[#F3C77E]/20 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-3">
              Ready to Join the Movement?
            </h3>
            <p className="text-[#d6d6d6] mb-6">
              Be part of the 500+ restaurants saving money and delighting
              customers with digital menus
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-black rounded-xl font-bold hover:scale-105 transition-transform shadow-lg"
              >
                Get Started Today
                <span>🎯</span>
              </Link>
              <Link
                to="/demo"
                className="inline-flex items-center gap-2 px-8 py-4 border border-[#F3C77E] text-[#F3C77E] rounded-xl font-medium hover:bg-[#F3C77E]/10 transition-colors"
              >
                See Live Example
                <span>👀</span>
              </Link>
            </div>
            <p className="text-xs text-[#a7a7a7]">
              Setup takes 5 minutes • Cancel anytime • 30-day money-back guarantee
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
