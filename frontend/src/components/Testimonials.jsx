import React from "react";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";

const testimonials = [
  {
    name: "Maria Rodriguez",
    business: "Luna's Bistro",
    location: "Austin, TX",
    quote:
      "QuickMenu saved us $300/month on printing costs. Our customers love how easy it is to read the menu on their phones.",
    rating: 5,
    avatar: "👩‍🍳",
    savings: "$300/mo saved",
  },
  {
    name: "David Chen",
    business: "Dragon Garden",
    location: "San Francisco, CA",
    quote:
      "We update our specials daily now. Before QuickMenu, we couldn't afford to print new menus every day.",
    rating: 5,
    avatar: "👨‍🍳",
    savings: "Daily updates",
  },
  {
    name: "Sarah Johnson",
    business: "The Coffee Spot",
    location: "Seattle, WA",
    quote:
      "Setting up took 10 minutes. Our QR code is on every table and customers scan it instantly. Game changer!",
    rating: 5,
    avatar: "☕",
    savings: "10 min setup",
  },
  {
    name: "Carlos Martinez",
    business: "Taco Libre Truck",
    location: "Los Angeles, CA",
    quote:
      "Perfect for food trucks! I update prices from my phone between stops. No more laminated menus falling apart.",
    rating: 5,
    avatar: "🌮",
    savings: "Mobile updates",
  },
  {
    name: "Emily Zhang",
    business: "Sakura Sushi",
    location: "New York, NY",
    quote:
      "Our customers prefer the digital menu over paper. Easier to read, looks professional, and we can add photos now.",
    rating: 5,
    avatar: "🍣",
    savings: "Pro features",
  },
  {
    name: "Tony Romano",
    business: "Romano's Pizza",
    location: "Chicago, IL",
    quote:
      "Been using QuickMenu for 6 months. Zero downtime, instant updates, and our customers love it. Worth every penny.",
    rating: 5,
    avatar: "🍕",
    savings: "6 months strong",
  },
];

export default function Testimonials() {
  return (
    <section className="relative py-24 px-8 md:px-16 lg:px-32 bg-gradient-to-br from-[#080705] via-[#0a0808] to-[#080705]">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(243,199,126,0.1),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(112,38,50,0.08),transparent_50%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#FFFFFA] mb-4">
            Loved by Restaurant Owners
          </h2>
          <p className="text-lg text-[#d6d6d6] max-w-2xl mx-auto">
            Join hundreds of restaurants who've ditched PDF menus for QuickMenu's
            instant updates
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="group relative bg-[#0f0e0c]/80 backdrop-blur-sm border border-[#40434E]/40 rounded-2xl p-6 hover:border-[#F3C77E]/30 hover:bg-[#0f0e0c]/90 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
            >
              {/* Subtle glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#F3C77E]/10 via-[#702632]/10 to-[#F3C77E]/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative">
                {/* Rating stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-[#F3C77E] text-[#F3C77E]"
                    />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-[#d6d6d6] mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author info */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#F3C77E] to-[#d6a856] rounded-full flex items-center justify-center text-xl shadow-lg">
                    {testimonial.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-[#FFFFFA]">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-[#a7a7a7]">
                      {testimonial.business} • {testimonial.location}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs bg-[#F3C77E]/20 text-[#F3C77E] px-2 py-1 rounded-full border border-[#F3C77E]/30">
                      {testimonial.savings}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Case study spotlight */}
        <div className="bg-gradient-to-r from-[#702632]/20 via-[#F3C77E]/20 to-[#702632]/20 rounded-3xl p-8 md:p-12 border border-[#F3C77E]/30">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="text-sm text-[#F3C77E] font-semibold mb-2 uppercase tracking-wide">
                Case Study
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-[#FFFFFA] mb-4">
                How Bella's Italian Cut Menu Costs by 85%
              </h3>
              <p className="text-[#d6d6d6] mb-6 leading-relaxed">
                "We were spending $400/month reprinting menus for seasonal
                changes. QuickMenu cut that to $9/month and our customers get a
                better experience. Best business decision we made this year."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#F3C77E] to-[#d6a856] rounded-full flex items-center justify-center text-2xl shadow-lg">
                  🍝
                </div>
                <div>
                  <div className="font-semibold text-[#FFFFFA]">
                    Giuseppe Bella
                  </div>
                  <div className="text-sm text-[#a7a7a7]">
                    Owner, Bella's Italian • Boston, MA
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center md:text-right">
              <div className="inline-block bg-[#0f0e0c]/80 rounded-2xl p-6 border border-[#40434E]/40">
                <div className="text-4xl font-bold text-[#F3C77E] mb-2">85%</div>
                <div className="text-sm text-[#a7a7a7] mb-4">Cost Reduction</div>

                <div className="space-y-2 text-left">
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-[#a7a7a7]">Before:</span>
                    <span className="text-sm text-[#FFFFFA]">$400/month</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-[#a7a7a7]">After:</span>
                    <span className="text-sm text-[#F3C77E] font-semibold">
                      $9/month
                    </span>
                  </div>
                  <div className="border-t border-[#40434E]/40 pt-2">
                    <div className="flex justify-between gap-4">
                      <span className="text-sm font-semibold text-[#FFFFFA]">
                        Annual Savings:
                      </span>
                      <span className="text-sm font-bold text-[#F3C77E]">
                        $4,692
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section CTA */}
        <div className="text-center">
          <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Join These Success Stories
            </h3>
            <p className="text-[#d6d6d6] mb-6">
              Start saving money and delighting customers like Tony, Sarah, and
              hundreds of other restaurant owners
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-black rounded-xl font-bold hover:scale-105 transition-transform"
              >
                Get Started Now
                <span>✨</span>
              </Link>
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 px-6 py-3 border border-[#F3C77E] text-[#F3C77E] rounded-xl font-medium hover:bg-[#F3C77E]/10 transition-colors"
              >
                View Pricing
                <span>💰</span>
              </a>
            </div>
            <p className="text-xs text-[#a7a7a7] mt-3">
              Setup in 5 minutes • Cancel anytime • 30-day money-back guarantee
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
