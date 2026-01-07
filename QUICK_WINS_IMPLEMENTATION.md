# 🚀 Quick Wins: Immediate Actions to Boost Revenue

## Priority 1: Pricing Optimization (Week 1)

### Update Pricing in Codebase

#### Files to Update:
1. `frontend/src/components/Pricing.jsx`
2. `frontend/src/components/BillingManager.jsx`
3. `frontend/src/context/PlanContext.jsx`
4. `backend/src/routes/billing.js`

#### New Pricing Structure:
```javascript
const plans = [
  {
    name: "Free",
    price: 0,
    period: "",
    features: [
      "1 Menu",
      "3 Menu Items Max",
      "QR Code Generation",
      "Mobile-Friendly",
      "Scandish Watermark"
    ],
    limitations: ["No photos", "No analytics", "No branding"]
  },
  {
    name: "Starter",
    price: 15,  // WAS $9 - 67% increase
    period: "month",
    annualPrice: 150,  // NEW - 20% discount
    popular: true,
    features: [
      "Up to 5 Menus",
      "Unlimited Menu Items",
      "Remove Watermark",
      "Photo Uploads (5/month)",
      "Basic Analytics",
      "Custom Branding",
      "Email Support"
    ]
  },
  {
    name: "Professional",
    price: 49,  // WAS $29 - 69% increase
    period: "month",
    annualPrice: 490,  // NEW - 20% discount
    features: [
      "Unlimited Menus",
      "Unlimited Photos",
      "Advanced Analytics",
      "AI Insights",
      "Full Custom Branding",
      "Bulk Import",
      "Priority Support"
    ]
  },
  {
    name: "Business",
    price: 99,  // NEW TIER
    period: "month",
    annualPrice: 990,  // NEW - 20% discount
    features: [
      "Everything in Pro",
      "Multi-Location (10 locations)",
      "Team Management (5 seats)",
      "Custom Domain",
      "API Access",
      "White-Label Option",
      "Dedicated Support"
    ]
  },
  {
    name: "Enterprise",
    price: 299,  // NEW TIER (starting point)
    period: "month",
    custom: true,
    features: [
      "Everything in Business",
      "Unlimited Locations",
      "Unlimited Team Seats",
      "Custom Integrations",
      "SLA Guarantees",
      "Account Manager",
      "Custom Development"
    ]
  }
];
```

### Implementation Steps:
1. [ ] Update `PlanContext.jsx` with new pricing
2. [ ] Update `Pricing.jsx` component
3. [ ] Update `BillingManager.jsx` component
4. [ ] Add annual billing option to Stripe
5. [ ] Update backend billing routes
6. [ ] Add pricing comparison tool
7. [ ] Update marketing copy on landing page

---

## Priority 2: Free Trial Implementation (Week 1)

### Add 14-Day Free Trial
- [ ] Create trial subscription status in database
- [ ] Add trial countdown in dashboard
- [ ] Send trial reminder emails (Day 7, Day 12, Day 14)
- [ ] Add trial-to-paid conversion tracking
- [ ] Update Stripe to handle trial periods

### Files to Create/Update:
- `backend/src/routes/billing.js` - Add trial logic
- `frontend/src/components/TrialBanner.jsx` - New component
- `frontend/src/services/emailService.js` - Trial emails

---

## Priority 3: Referral Program (Week 2)

### Build Referral System
- [ ] Create referral code generation
- [ ] Add referral tracking in database
- [ ] Build referral dashboard
- [ ] Create referral landing page
- [ ] Add referral rewards (1 month free for both)
- [ ] Send referral emails

### Database Schema Addition:
```sql
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id uuid REFERENCES users(id),
  referee_id uuid REFERENCES users(id),
  referral_code text UNIQUE NOT NULL,
  status text DEFAULT 'pending', -- pending, completed, rewarded
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  reward_given_at timestamptz
);
```

### Files to Create:
- `backend/src/routes/referrals.js`
- `frontend/src/components/ReferralProgram.jsx`
- `frontend/src/pages/ReferralPage.jsx`

---

## Priority 4: SEO Content Strategy (Week 2-4)

### Create Content Calendar
- [ ] Write 20 blog posts (Week 2-4)
- [ ] Target keywords: "QR code menu", "digital menu", "contactless menu"
- [ ] Create case studies (5 restaurants)
- [ ] Build resource library (guides, templates)

### Blog Post Ideas:
1. "10 Reasons to Switch from PDF Menus to Digital QR Menus"
2. "How to Create a Restaurant Menu That Increases Sales"
3. "QR Code Menu Best Practices: A Complete Guide"
4. "Case Study: How [Restaurant] Increased Revenue 30% with Digital Menus"
5. "The Future of Restaurant Menus: Digital vs. Physical"

### Files to Create:
- `frontend/src/pages/blog/` directory
- Blog post templates
- SEO optimization utilities

---

## Priority 5: Email Marketing Sequences (Week 2)

### Onboarding Sequence (7 emails over 14 days)
- [ ] Email 1: Welcome + Getting Started
- [ ] Email 2: How to Create Your First Menu
- [ ] Email 3: Tips for Great Menu Design
- [ ] Email 4: How to Generate QR Codes
- [ ] Email 5: Analytics Overview
- [ ] Email 6: Upgrade Benefits (if still on free)
- [ ] Email 7: Success Stories

### Win-Back Sequence (for inactive users)
- [ ] Email 1: "We Miss You" (30 days inactive)
- [ ] Email 2: "Here's What's New" (45 days inactive)
- [ ] Email 3: "Special Offer" (60 days inactive)

### Files to Create:
- `backend/src/services/emailSequences.js`
- Email templates in `backend/src/templates/emails/`

---

## Priority 6: Paid Advertising Setup (Week 3)

### Google Ads
- [ ] Create Google Ads account
- [ ] Set up conversion tracking
- [ ] Create 5 ad groups:
  - "QR code menu"
  - "digital restaurant menu"
  - "contactless menu"
  - "menu QR code generator"
  - "restaurant menu software"
- [ ] Set budget: $10,000/month initially
- [ ] Create landing pages for each ad group

### Facebook/Instagram Ads
- [ ] Create Facebook Business account
- [ ] Set up Facebook Pixel
- [ ] Create lookalike audiences
- [ ] Create 3 ad sets:
  - Restaurant owners (demographics)
  - Food truck operators
  - Restaurant managers
- [ ] Set budget: $5,000/month initially

### Files to Create:
- Landing page templates
- Conversion tracking scripts

---

## Priority 7: Partnership Outreach (Week 3-4)

### POS System Partnerships
- [ ] Research top 10 POS systems
- [ ] Create partnership pitch deck
- [ ] Reach out to:
  - Toast
  - Square
  - Clover
  - Resy
  - OpenTable
- [ ] Offer integration development
- [ ] Propose revenue share model

### Restaurant Associations
- [ ] Identify 20 state/regional associations
- [ ] Create member discount offer (20% off)
- [ ] Reach out for partnership/sponsorship
- [ ] Offer to speak at events

---

## Priority 8: Analytics & Tracking (Week 1)

### Set Up Analytics Dashboard
- [ ] Implement conversion tracking
- [ ] Set up cohort analysis
- [ ] Track CAC by channel
- [ ] Monitor LTV trends
- [ ] Set up churn alerts

### Key Metrics Dashboard:
- [ ] New signups (daily/weekly/monthly)
- [ ] Free-to-paid conversion rate
- [ ] Trial-to-paid conversion rate
- [ ] Monthly churn rate
- [ ] CAC by channel
- [ ] LTV by plan
- [ ] MRR growth

### Files to Create:
- `frontend/src/pages/AnalyticsDashboard.jsx` (internal)
- `backend/src/routes/analytics/internal.js`

---

## Priority 9: Customer Success (Week 2)

### Improve Onboarding
- [ ] Create interactive tutorial
- [ ] Add tooltips to key features
- [ ] Build "Getting Started" checklist
- [ ] Create video walkthroughs
- [ ] Add sample menu templates

### Proactive Support
- [ ] Set up usage alerts
- [ ] Create help center/knowledge base
- [ ] Add in-app chat support
- [ ] Build FAQ section
- [ ] Create support ticket system

### Files to Create:
- `frontend/src/components/OnboardingWizard.jsx` (enhance existing)
- `frontend/src/pages/HelpCenter.jsx`
- `frontend/src/components/InAppChat.jsx`

---

## Priority 10: Social Proof (Week 2-3)

### Collect Testimonials
- [ ] Reach out to 20 existing customers
- [ ] Request video testimonials
- [ ] Get case study data (ROI numbers)
- [ ] Create testimonial carousel on landing page

### Build Social Media Presence
- [ ] Post daily on TikTok (before/after demos)
- [ ] Post 3x/week on Instagram
- [ ] Create YouTube channel (tutorials)
- [ ] Engage in restaurant Facebook groups
- [ ] Share on Reddit (r/smallbusiness, r/restaurateur)

---

## Quick Revenue Wins (First 30 Days)

### Week 1:
- ✅ Update pricing (+67-69% increase)
- ✅ Add annual billing option
- ✅ Set up conversion tracking

**Expected Impact:** +20-30% revenue from existing customers upgrading

### Week 2:
- ✅ Launch referral program
- ✅ Start SEO content (5 blog posts)
- ✅ Set up email sequences

**Expected Impact:** +10-15% new customers from referrals

### Week 3:
- ✅ Launch Google Ads ($10K/month)
- ✅ Launch Facebook Ads ($5K/month)
- ✅ Reach out to 5 POS companies

**Expected Impact:** +50-100 new customers/month

### Week 4:
- ✅ Analyze results, optimize
- ✅ Scale successful channels
- ✅ Close first partnership

**Expected Impact:** +20-30% overall growth

---

## 30-Day Revenue Projection

### Current State (Assumptions):
- 1,000 paying customers
- Average $15/month (mix of $9 and $29)
- $15,000 MRR

### After Quick Wins:
- **Pricing increase:** +30% = $19,500 MRR
- **New customers (ads):** +100 = +$1,500 MRR
- **Referrals:** +20 = +$300 MRR
- **Upsells:** +50 customers upgrade = +$1,000 MRR

### **Total: $22,300 MRR (+49% growth)**

---

## Next Steps

1. **Review this document** with team
2. **Prioritize** based on resources
3. **Assign owners** to each task
4. **Set deadlines** for each priority
5. **Track progress** weekly
6. **Adjust strategy** based on results

---

*Remember: Consistency beats perfection. Execute quickly, measure results, iterate.*

