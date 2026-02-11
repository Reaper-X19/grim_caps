# Grim Caps: Risk Mitigation & 30-Day Action Plan

> **Document Type:** Actionable Strategy  
> **Date:** February 3, 2026  
> **Status:** Pre-Validation Phase  
> **Key Context:** Equipment not yet purchased, Razorpay pending, website build paused

---

## Critical Context Update

Based on your answers, here's the reality check:

| Factor | Status | Implication |
|--------|--------|-------------|
| Equipment | Not purchased | Unit economics unknown |
| Payment Gateway | Not activated | Can't take orders |
| Product Validation | Zero orders done | Everything is theory |
| Dark Keycaps Solution | Creative (color-match sides) | Needs testing |

> [!CAUTION]
> **You're at Stage 0, not Stage 1.** Building a website now would be like designing a restaurant menu before knowing if the oven works. The next 30 days should be 100% validation, 0% website.

---

# Part 1: Risk Mitigation Strategies

## Risk 1: Unit Economics & Hidden Costs

### The Problem Restated
You don't know if you can make money. This isn't a risk—it's a **fatal unknown**.

### Concrete Actions NOW

| Action | Timeline | Cost | Output |
|--------|----------|------|--------|
| **Research equipment costs** | Days 1-3 | Free | Spreadsheet of options |
| **Get 3 supplier quotes** for PBT blanks | Days 1-5 | Free | Cost-per-unit data |
| **Calculate ink/consumable costs** | Days 3-5 | Free | Cost-per-print estimate |
| **Price equipment financing** | Days 5-7 | Free | Monthly payment calculation |
| **Build unit economics calculator** | Day 7 | Free | Break-even analysis |

### Unit Economics Calculator Template

```
Per-Keycap Cost Breakdown:
─────────────────────────────────────────────────────
INPUT COSTS
├── PBT blank (1U Cherry)         : ₹____
├── Dye sublimation ink           : ₹____ (per print)
├── Transfer paper/substrate       : ₹____
├── Electricity per print          : ₹____
├── Failed prints (assume 10%)     : ₹____
└── Subtotal Material Cost         : ₹____

LABOR COSTS (your time = money)
├── Design prep (10 min @ ₹300/hr) : ₹50
├── Printing time (5 min)          : ₹25
├── QC + Packing (5 min)           : ₹25
└── Subtotal Labor                 : ₹100

OVERHEAD (monthly, divided by expected orders)
├── Equipment depreciation         : ₹____
├── Workspace cost                 : ₹____
├── Software subscriptions         : ₹____
└── Subtotal Overhead per unit     : ₹____

TRANSACTION COSTS
├── Payment gateway (2.5%)         : ₹____
├── Packaging materials            : ₹____
├── Shipping (if included)         : ₹____
└── Subtotal Transaction           : ₹____

═════════════════════════════════════════════════════
TOTAL COST PER KEYCAP             : ₹____
YOUR SELLING PRICE                 : ₹____
GROSS MARGIN                       : ₹____ (___%)
═════════════════════════════════════════════════════

VIABILITY CHECK:
✓ Margin > 50% = Healthy
⚠ Margin 30-50% = Tight, need volume
✗ Margin < 30% = Unsustainable, reprice
```

### Early Warning Signs

| Signal | Threshold | Action |
|--------|-----------|--------|
| Failed print rate | >15% | Pause, retrain technique |
| Material cost per key | >₹80 | Find new suppliers |
| Time per order | >30 min | Simplify workflow |
| Customer complaints | >5% | Quality crisis mode |

### Contingency Plan

**If unit economics don't work at ₹399/key:**
1. **Option A:** Raise minimum order to 4 keys at ₹649 (₹162/key)
2. **Option B:** Add ₹99 "custom design fee" per order
3. **Option C:** Position as premium-only at ₹499+/key
4. **Option D:** Pivot to higher-volume, lower-margin (mousepads)

---

## Risk 2: Dye Sublimation Limitations (Dark Keycaps)

### Your Solution Evaluated

Your idea: *Print image on top, color-match the sides*

| Aspect | Assessment |
|--------|------------|
| **Feasibility** | Technically works—requires precise color matching |
| **Complexity** | High—need RGB-matched inks for each keycap color |
| **Cost Impact** | Higher—multiple print passes, more failure risk |
| **Customer Perception** | Unknown—need to test if it looks "premium" or "workaround" |

### Concrete Actions NOW

| Action | Timeline | Cost | Output |
|--------|----------|------|--------|
| **Buy 10 black PBT blanks** | Day 1 | ~₹500 | Test material |
| **Test your color-match idea** | Days 5-10 | Ink cost | 5 sample keycaps |
| **photograph results** in good lighting | Day 10 | Free | Marketing assets or pivot data |
| **Show samples to 5 mech keyboard friends** | Days 10-15 | Free | Honest feedback |
| **Compare to standard white-only prints** | Day 15 | Free | Quality benchmark |

### Decision Framework

After testing, ask:
1. Can I consistently match the side color to ±5% accuracy?
2. Does the seam between top image and side color look clean?
3. Would I pay ₹500+ for this if I were a customer?
4. How long does a 5-sided print take vs. top-only?

**If answer is "no" to any:**
→ Launch with white/cream/light gray only. Add dark keycaps in V2.

### Early Warning Signs

| Signal | Threshold | Action |
|--------|-----------|--------|
| Color mismatch complaints | >10% | Pause dark keycap orders |
| Side print peeling/fading | Any | Quality issue, stop dark line |
| Time-to-print for dark | >2x white | Pricing adjustment needed |

---

## Risk 3: Production Bottleneck at Scale

### Concrete Actions NOW

| Action | Timeline | Cost | Output |
|--------|----------|------|--------|
| **Time yourself** printing 1 keycap | Day 5 | Free | Baseline metric |
| **Calculate max daily capacity** | Day 5 | Free | Capacity ceiling |
| **Define "overload" threshold** | Day 5 | Free | When to pause orders |
| **Create simple production tracker** | Day 7 | Free | Google Sheet template |

### Capacity Planning Template

```
PRODUCTION CAPACITY CALCULATOR
─────────────────────────────────────────────────────
Available hours per day           : _____ hrs
Time per keycap (print + QC)      : _____ min
Buffer for setup/cleanup          : 20%

MAX DAILY CAPACITY = (Hours × 60 × 0.8) ÷ Minutes per key
Example: (6 × 60 × 0.8) ÷ 15 = 19 keycaps/day

─────────────────────────────────────────────────────
THRESHOLD ALERTS:
├── Queue > 3 days capacity  → Show "High demand" warning
├── Queue > 5 days capacity  → Pause new orders
├── Queue > 7 days capacity  → Emergency: underpromised badly
─────────────────────────────────────────────────────
```

### Contingency Plan

**If orders explode beyond capacity:**

| Scenario | Response |
|----------|----------|
| 2x capacity | Extend lead times, keep accepting |
| 3x capacity | Pause orders, fulfill backlog, launch waitlist |
| 5x+ capacity | Emergency: refund excess, hire help, or buy second machine |

---

## Risk 4: "Cool Demo, No Conversion"

### Why This Matters Pre-Launch

Even when you do build the website, a beautiful preview doesn't equal sales.

### Concrete Actions NOW

| Action | Timeline | Cost | Output |
|--------|----------|------|--------|
| **Create 5 sample keycaps** | Days 5-10 | ~₹1000 | Physical proof |
| **Take professional photos** | Day 10 | Free (phone + good light) | Marketing assets |
| **Show samples + price to 10 people** | Days 10-15 | Free | Pricing validation |
| **Ask "Would you buy this at ₹X?"** | Days 10-15 | Free | Conversion data |
| **Collect objections in writing** | Days 10-15 | Free | FAQ content |

### Pre-Website Conversion Test

Before building anything, run this manual test:

```
THE ₹0 WEBSITE TEST
─────────────────────────────────────────────────────
1. Create WhatsApp Business account for Grim Caps
2. Post in 3 keyboard Discord servers/subreddits:
   "Hey! Starting a custom keycap printing service in India.
    Dye sub on PBT, ₹399/key or 4-pack for ₹1,299.
    DM for samples or to order. [Photo of your sample keycaps]"
3. Track:
   - # of DMs received = Interest
   - # who ask for pricing = Intent  
   - # who actually pay = Conversion
   - Objections/questions = Website FAQ

If 10% of DMs convert → Product-market fit exists
If <5% convert → Find out why before building website
─────────────────────────────────────────────────────
```

---

## Risk 5: Community Dependency

### Concrete Actions NOW

| Action | Timeline | Cost | Output |
|--------|----------|------|--------|
| **Join r/MechanicalKeyboards Discord** | Day 1 | Free | Community access |
| **Follow 20 keyboard influencers** | Day 1 | Free | Market awareness |
| **Engage genuinely for 2 weeks** (no selling) | Days 1-14 | Time | Reputation building |
| **Post your build** (not business) | Day 14 | Free | Organic intro |
| **Soft mention you're starting a service** | Day 21+ | Free | Test reception |

### Community-First Playbook

```
WEEK 1-2: LURK AND LEARN
├── Read 50 posts on r/MechanicalKeyboards
├── Note what people complain about (topics for content)
├── Identify who the trusted voices are
├── Never mention your business

WEEK 3-4: PARTICIPATE
├── Answer questions you know answers to
├── Share your own keyboard setup
├── Compliment others' builds
├── Mention you're "experimenting with dye sub printing"

WEEK 5+: SOFT LAUNCH
├── Post "Just printed my first custom keycaps, thoughts?"
├── Handle feedback graciously
├── Offer free sample to 1-2 respected community members
├── Let them post about it (organic testimonial)
```

### Early Warning Signs

| Signal | Action |
|--------|--------|
| Downvotes on posts | Stop, read room, adjust |
| "This looks like an ad" comments | Apologize, be more genuine |
| DMs saying "love this!" | Good signal, nurture relationships |
| Influencer engagement | Top priority, respond fast |

---

# Part 2: Risk Prioritization

## Priority Matrix

| Risk | Severity | Likelihood | Must Fix Before Launch? |
|------|----------|------------|-------------------------|
| **Unit Economics** | 🔴 Fatal | High | ✅ YES - Non-negotiable |
| **Dark Keycap Quality** | 🟡 Moderate | Medium | ⚠️ Test, can launch without |
| **Production Bottleneck** | 🟡 Moderate | Low (early) | ❌ Monitor, solve when needed |
| **Conversion** | 🟡 Moderate | Medium | ⚠️ Validate pre-website |
| **Community** | 🟡 Moderate | Medium | ⚠️ Start building now |

## The Only "Fatal" Risk

> [!CAUTION]
> **Unit economics is the only risk that can kill you before you start.**
> 
> All other risks can be managed, pivoted, or fixed with customer feedback. But if your margins are negative, every order makes you poorer. You cannot outrun bad unit economics with volume.

## Resource Allocation

| Risk | % of Next 30 Days | Minimum Viable Solution | Ideal Solution |
|------|-------------------|------------------------|----------------|
| Unit Economics | 40% | Spreadsheet + 3 test prints | Full production run test |
| Dark Keycap Testing | 20% | 5 test prints with feedback | 20 prints across all colors |
| Conversion Validation | 20% | WhatsApp manual sales test | Landing page + waiting list |
| Community Building | 15% | Join + engage 30 mins/day | Content creation + posting |
| Payment Setup | 5% | Register, provide docs | Full integration ready |

---

# Part 3: SMART MOVES (Quick Wins)

## 5 Strategic Decisions to Make RIGHT NOW

### 1. Set Minimum Order at 4 Keys (WASD Pack)

**Why:** Single keycap orders are margin-negative and operationally complex.

**Specific action:**
- Your pricing: WASD 4-pack at ₹1,099 (₹275/key)
- Single key available only as ₹299 "sampler" (break-even, proves quality)
- Never advertise single keys as main product

**Effort:** Decision only  
**Impact:** Saves you from thin margins forever

---

### 2. Buy Equipment for Testing, Not Production

**Why:** You need to validate, not scale. Buy the minimum to prove the model.

**Specific action:**
- Research entry-level dye sublimation setup (~₹15,000-30,000)
- Buy 50 blank keycaps in 3 colors (white, cream, black)
- Budget ₹5,000 for test materials
- Don't buy industrial equipment until 50+ orders validated

**Effort:** ₹20,000-35,000 + research  
**Impact:** Validates model without overcommitting

---

### 3. Create a Pricing Calculator Before Buying Anything

**Why:** Prevents expensive mistakes.

**Specific action:**
```
Open Google Sheets. Create these columns:
1. Item Name
2. Cost from Supplier 1
3. Cost from Supplier 2
4. Cost from Supplier 3
5. Your chosen cost
6. Per-unit cost

Items to price:
- Heat press machine
- Sublimation printer
- Sublimation ink (per ml)
- Transfer paper (per sheet)
- PBT blanks (per color, per size)
- Packaging materials
- Shipping materials
```

**Effort:** 2-3 hours  
**Impact:** 10x clarity on viability

---

### 4. Open Bank Account This Week

**Why:** Razorpay requires 2-7 days for verification. This is on your critical path.

**Specific action:**
- Open current account (not savings) for business
- Get PAN ready (personal is fine for sole proprietorship)
- Choose bank with good Razorpay compatibility (HDFC, ICICI, Kotak)
- Start Razorpay registration immediately after account opens

**Effort:** 1 day bank visit + paperwork  
**Impact:** Unblocks entire payment capability

---

### 5. Build Email List Before Website

**Why:** When your website launches, you want an audience ready to buy.

**Specific action:**
1. Create free Carrd landing page (30 min, carrd.co)
2. Content: "Custom keycaps made in India. Launching soon. Join the launch list for 20% off first order."
3. Add Google Form for email collection
4. Share in keyboard communities: "Building something for Indian mech keyboard fans..."

**What to include on landing page:**
- One hero image of sample keycap (or mockup)
- Value prop: "Custom keycaps, made in India, shipped in days"
- Email capture form
- "Launching [Month] 2026"

**Effort:** 2 hours  
**Impact:** Day 1 revenue when you launch

---

## What to Do BEFORE Building the Website

| Priority | Action | Why It Makes Website 10x Better |
|----------|--------|--------------------------------|
| 1 | Validate unit economics | Informs pricing page, margins for discounts |
| 2 | Create 10 real samples | Actual photography beats mockups |
| 3 | Collect 10 customer objections | Builds your FAQ and overcomes objections in copy |
| 4 | Test dark keycap solution | Determines product range |
| 5 | Build email list of 100+ | Launch traffic ready |
| 6 | Document your production process | "How it works" content with real photos |
| 7 | Set up Razorpay | Unblocks checkout functionality |
| 8 | Create 15 template designs | Content for the customizer gallery |

---

# Part 4: Validation Framework

## Campus Phase Testing Protocol

### What Exactly to Test

| Test | How | Success Metric |
|------|-----|----------------|
| **Price Sensitivity** | Offer 3 price points to different groups | Find price where conversion drops |
| **Product Quality** | Deliver orders, collect feedback | <5% complaints |
| **Lead Time Reality** | Track promise vs. actual delivery | >90% on-time |
| **Willingness to Wait** | Test 3-day vs. 7-day lead time messaging | Conversion difference |
| **Bundle Preference** | Track single vs. WASD vs. cluster orders | Which sells most |
| **Design Preferences** | Track which templates/styles sell | Content strategy |
| **Word of Mouth** | Ask "How did you hear about us?" | Referral rate |

### Campus Testing Playbook

```
PHASE 1: FRIENDS & FAMILY (Orders 1-10)
─────────────────────────────────────────────────────
Who: Your 10 closest friends with mechanical keyboards
Goal: Iron out production workflow + collect honest feedback
Pricing: At-cost or small discount ("₹199 for testing feedback")
Data to collect:
├── Time from order to delivery
├── Quality score (1-10)
├── Would they pay full price?
├── What would they change?

PHASE 2: EXTENDED NETWORK (Orders 11-30)
─────────────────────────────────────────────────────
Who: Friends of friends, college groups, tech clubs
Goal: Test real pricing + first "stranger" orders
Pricing: Full price (₹399/key or ₹1,099/4-pack)
Data to collect:
├── Conversion rate from inquiry to order
├── Average order value
├── Objections (why didn't they buy?)
├── Unsolicited shares (did they post online?)

PHASE 3: COMMUNITY LAUNCH (Orders 31-50)
─────────────────────────────────────────────────────
Who: Local Discord, Reddit India keyboards, college subreddit
Goal: Test marketing message + scalability
Pricing: Launch offer (15% off first order)
Data to collect:
├── Acquisition channel effectiveness
├── Repeat purchase rate
├── Net Promoter Score
├── Production capacity stress test
```

### Ready to Scale vs. Need to Pivot

| Signal | You're Ready to Scale | You Need to Pivot |
|--------|----------------------|-------------------|
| **Conversion Rate** | >15% of inquiries order | <5% of inquiries order |
| **Repeat Rate** | >20% reorder in 60 days | <5% reorder |
| **NPS Score** | >50 | <20 |
| **Refund/Complaint Rate** | <3% | >10% |
| **Organic Shares** | Customers post without asking | Zero unsolicited shares |
| **Price Objections** | Rare | Most common objection |
| **Production Time** | Stable, predictable | Constantly delayed |

### Questions to Ask First 10-20 Customers

**Before Purchase:**
1. "What made you interested in custom keycaps?"
2. "Have you bought custom keycaps before? From where?"
3. "What's your budget for this order?"
4. "What's your biggest concern about ordering custom?"
5. "How did you hear about us?"

**After Delivery (24-48 hours later):**
1. "On a scale of 1-10, how happy are you with the keycaps?"
2. "What surprised you (good or bad)?"
3. "Would you order from us again?"
4. "What should we change?"
5. "Would you recommend us to a friend? Why or why not?"

**The Money Question:**
> "If this same keycap cost ₹X more, would you still have bought it?"

Test at ₹50, ₹100, ₹150 increments to find ceiling.

### How to Know If Pricing Is Right

| Test | Your Pricing Is Right If | Your Pricing Is Wrong If |
|------|-------------------------|-------------------------|
| **Conversion rate** | >10% of interested people buy | <5% buy, "too expensive" is top objection |
| **Price objections** | <20% mention price as concern | >50% hesitate on price |
| **Comparison shopping** | Customers value speed/quality over price | Customers ask "Is this cheaper than X?" |
| **Upsell success** | 30%+ add extra items when offered | Nobody adds extras |
| **Margin check** | You're profitable at current volume | You lose money even at full capacity |

---

# Part 5: Competitive Positioning

## Primary Differentiator: Speed + Local

### Why This Wins

| Factor | International Competitors | You (Grim Caps) |
|--------|--------------------------|-----------------|
| Shipping Time | 3-6 weeks | 3-7 days |
| Customs Risk | Real (items get stuck) | None |
| Support | English, US hours | Hindi/English, IST hours |
| Payment | Credit card + conversion fees | UPI, wallets, Pay Later |
| Pricing | ₹400-800 + $15-30 shipping | ₹300-500 all-inclusive |
| Returns | Complex, expensive | Easy |

**Your tagline candidates:**
- "Custom keycaps, made in India, shipped in days—not weeks"
- "Finally, custom keycaps without the customs headache"
- "Designed by you, printed in India, delivered before the weekend"

### What You Can Do That Others Can't/Won't

| Advantage | Why Competitors Can't Match |
|-----------|----------------------------|
| **Same-week delivery** | They're overseas, physics applies |
| **UPI/Pay Later** | They don't support Indian payments |
| **Hindi support** | Not worth their setup for India market |
| **Campus pop-ups** | They can't do physical presence |
| **Small batch responsiveness** | They're optimized for volume |
| **Community integration** | You can be in Indian Discord/Reddit servers |

### Positioning Decision: Premium Boutique vs. Accessible

**Recommendation: Accessible with Premium Option**

```
POSITIONING MATRIX
─────────────────────────────────────────────────────
                    LOW PRICE          HIGH PRICE
                    ↓                  ↓
HIGH QUALITY  →    [SWEET SPOT]       Premium Boutique
                    Grim Caps          (Future V2)
                    
LOW QUALITY   →    AliExpress         Avoid
                    Don't compete      Never be here
─────────────────────────────────────────────────────
```

**Your position:** Quality comparable to international (maybe 90%), price at 60%, speed at 300%

**Messaging:** "Premium custom keycaps at prices that make sense for India"

---

# Part 6: Website Strategy Alignment

## Features That Become MORE Critical

Given the risks identified, these website elements are now higher priority:

| Feature | Why It's Critical | Implementation Priority |
|---------|-------------------|------------------------|
| **Clear production timeline** | Prevents overpromising | MVP Must-Have |
| **Design validation warnings** | Reduces "didn't look like preview" complaints | MVP Must-Have |
| **Real product photography** | Builds trust without 3D gimmicks | MVP Must-Have |
| **FAQ addressing objections** | Pre-empts complaints | MVP Must-Have |
| **Email capture for abandoned carts** | Saves conversion | Week 2 Post-Launch |
| **Order capacity indicator** | Prevents overwhelm | MVP Should-Have |

## Features That Become LESS Important

| Feature | Why It Can Wait | Delay Until |
|---------|----------------|-------------|
| **Full 3D preview** | Doesn't fix conversion problem | Month 2+ |
| **User accounts** | Friction for first purchase | Month 2+ |
| **Complex multi-key designer** | Start with WASD packs | Month 3+ |
| **Dark keycap options** | If testing shows issues | After validation |
| **Referral system** | Need baseline customers first | Month 2+ |
| **Bulk order workflow** | B2B is Phase 2 | Month 4+ |

## Revised MVP Scope

### New MVP Definition (Post-Risk Analysis)

**Absolute Minimum (Week 1-4):**
```
CORE PAGES:
├── Landing page (hero, value prop, email capture)
├── How it works (with REAL production photos)
├── Gallery (15-20 real keycap photos)
├── Products page (WASD pack primary, single key secondary)
├── FAQ (addressing top 10 objections)
└── Contact

CORE FUNCTIONALITY:
├── Template library (10 templates)
├── Simple image upload (no complex designer)
├── 2D preview only (no Three.js MVP)
├── Cart + Razorpay checkout
├── Order confirmation email
├── Order status page (simple: Received → Making → Shipped)
```

**NOT in MVP:**
- 3D preview
- User accounts
- Complex design tool
- Dark keycap options
- Multi-key designer
- Referral system
- Admin dashboard (use Supabase directly)

---

# Part 7: Decision Framework

For any major decision you face, use this framework:

## The 5-Question Decision Filter

```
┌─────────────────────────────────────────────────────────────┐
│  DECISION: ________________________________                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Q1: Does this protect my margins?                          │
│      YES → Continue | NO → Reconsider                       │
│                                                             │
│  Q2: Does this make customers happier without making        │
│      operations harder?                                     │
│      YES → Continue | NO → Weigh carefully                  │
│                                                             │
│  Q3: Can I reverse this decision in 30 days if wrong?       │
│      YES → Safe to try | NO → Need more data                │
│                                                             │
│  Q4: What's the cost of being wrong?                        │
│      LOW → Decide fast | HIGH → Get validation              │
│                                                             │
│  Q5: What would I advise a friend to do?                    │
│      [Your gut knows the answer]                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Decision-Specific Frameworks

### Feature Prioritization

**When deciding whether to build a feature:**

| Question | If YES | If NO |
|----------|--------|-------|
| Does it directly enable revenue? | Build now | Consider deferring |
| Have customers asked for it? | Strong signal | Nice-to-have |
| Do competitors have it? | Table stakes | Potential differentiator |
| Can I build it in <1 week? | Low risk to try | Careful scoping |
| Does it address a validated objection? | High priority | Test first |

**Data to look for:**
- Feature requests from test customers
- Competitor feature analysis
- Time-to-build estimates
- Direct revenue impact

### Pricing Changes

**When deciding to change prices:**

| Question | Action |
|----------|--------|
| Is "too expensive" the #1 objection? | Test lower price with subset |
| Are margins below 40%? | Raise price or raise minimum order |
| Are competitors significantly cheaper? | Find differentiation, not price match |
| Are you selling out capacity? | You're underpriced, raise carefully |

**Data to look for:**
- Conversion rate at different price points
- Customer feedback on value perception
- Competitor pricing analysis
- Your unit economics at each price

### Marketing Channels

**When deciding where to spend marketing effort:**

| Question | If YES | If NO |
|----------|--------|-------|
| Is my target customer here? | Worth testing | Skip |
| Can I track conversion? | Measure and optimize | Harder to justify |
| Is it free/low-cost to try? | Test for 2 weeks | Need strong hypothesis |
| Have similar products succeeded here? | Higher confidence | First-mover risk |

**Recommended priority:**
1. Keyboard Discord servers (free, targeted, measurable)
2. r/MechanicalKeyboards + r/mkindia (free, need credibility first)
3. Instagram keyboard community (visual, good for gallery)
4. College WhatsApp groups (free, local, fast)
5. Paid ads (LAST—only after organic validated)

---

# Part 8: 30-Day Action Plan

## Weekly Breakdown

### Week 1: Foundation (Feb 3-9)

| Day | Focus | Specific Tasks | Outcome |
|-----|-------|----------------|---------|
| Mon | Research | Research 5 dye sublimation equipment options | Equipment shortlist |
| Tue | Suppliers | Contact 3 PBT blank suppliers for quotes | Cost-per-unit data |
| Wed | Bank | Visit bank, open current account | Account number |
| Thu | Financial | Build unit economics calculator | Break-even analysis |
| Fri | Community | Join 3 keyboard Discords, follow 20 influencers | Community access |
| Sat | Learning | Watch 5 dye sublimation tutorial videos | Process understanding |
| Sun | Planning | Review week, plan equipment purchase | Ready to buy |

**Week 1 Deliverable:** Unit economics calculator completed, bank account open

### Week 2: Equipment & Setup (Feb 10-16)

| Day | Focus | Specific Tasks | Outcome |
|-----|-------|----------------|---------|
| Mon | Purchase | Order equipment (budget: ₹25,000-35,000) | Equipment ordered |
| Tue | Purchase | Order 50 PBT blanks (white, cream, black) | Materials ordered |
| Wed | Razorpay | Start Razorpay registration with new account | Application started |
| Thu | Design | Create 10 template designs for testing | Design assets |
| Fri | Landing | Build Carrd landing page + email form | Email capture live |
| Sat | Community | First engagement in Discord (not selling) | Relationship building |
| Sun | Prep | Prepare workspace for equipment arrival | Ready to start |

**Week 2 Deliverable:** Equipment ordered, landing page live, Razorpay applied

### Week 3: First Prints (Feb 17-23)

| Day | Focus | Specific Tasks | Outcome |
|-----|-------|----------------|---------|
| Mon | Setup | Unbox equipment, set up workspace | Production ready |
| Tue | Learning | First test prints (expect failures) | Learning what works |
| Wed | Learning | Iterate on settings, colors, timing | Better quality |
| Thu | Testing | Print 5 sample keycaps (your templates) | Sample products |
| Fri | Dark Test | Test dark keycap color-match technique | Validate/invalidate idea |
| Sat | Photo | Take professional photos of samples | Marketing assets |
| Sun | Feedback | Show samples to 5 friends, get feedback | Validation data |

**Week 3 Deliverable:** 5-10 sample keycaps printed, photographed, feedback collected

### Week 4: Validation (Feb 24 - Mar 2)

| Day | Focus | Specific Tasks | Outcome |
|-----|-------|----------------|---------|
| Mon | Pricing | Calculate real unit economics from test prints | True margins known |
| Tue | Testing | Offer samples to 10 people at test price | Conversion data |
| Wed | Feedback | Collect objections, questions, concerns | FAQ content |
| Thu | Community | Post first build photo in Discord | Community introduction |
| Fri | Orders | Take first 3-5 paid orders (friends/family) | First revenue |
| Sat | Fulfill | Fulfill orders, document entire process | Process documentation |
| Sun | Review | Month-end review: what worked, what didn't | Pivot/proceed decision |

**Week 4 Deliverable:** First paid orders completed, real unit economics validated, go/no-go decision

---

## 30-Day Success Criteria

| Metric | Target | Assessment |
|--------|--------|------------|
| Unit economics validated | Margin >40% at ₹299/key | Green light for website |
| Sample quality acceptable | 8/10 average rating from testers | Product is ready |
| Dark keycap technique | Works or clear "no" | Product range defined |
| First orders completed | 5+ paid orders fulfilled | Process validated |
| Email list | 50+ subscribers | Launch audience exists |
| Razorpay status | Approved or docs submitted | Payment unblocked |
| Community presence | Active in 2+ servers | No longer a stranger |

---

## End-of-Month Decision Tree

```
                    Did it work?
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    MARGINS OK      MARGINS TIGHT     MARGINS BAD
    QUALITY OK      QUALITY OK        OR QUALITY BAD
         │               │               │
         ▼               ▼               ▼
    PROCEED TO      REPRICE OR        PIVOT OR
    WEBSITE BUILD   RESTRUCTURE       PAUSE PROJECT
         │               │               │
         ▼               ▼               ▼
    • MVP in 6-8    • Raise minimum    • Consider:
      weeks           to 4-pack only     - Different product
    • Full launch   • Reduce scope       - Different tech
      by April      • Validate again     - Partner with
                                           existing printer
```

---

## Daily Habits for Success

```
DAILY (15-30 min):
├── Check Discord/Reddit for conversations to join
├── Respond to any inquiries within 2 hours
├── Track one metric (orders, engagement, signups)

WEEKLY (1-2 hours):
├── Update unit economics tracker
├── Post one piece of content (build photo, process video)
├── Review what's working, what's not

BEFORE ANY MAJOR DECISION:
├── Sleep on it for 24 hours
├── Ask "What would I tell a friend to do?"
├── Consider: "What's the cost of being wrong?"
```

---

## Your Next 48 Hours

| Priority | Action | Time Needed |
|----------|--------|-------------|
| 1 | Open Google Sheet, create unit economics calculator | 30 min |
| 2 | Research 3 dye sublimation equipment options | 2 hours |
| 3 | Call bank to schedule current account opening | 15 min |
| 4 | Join r/MechanicalKeyboards Discord | 10 min |
| 5 | Follow 10 keyboard YouTubers/Instagram accounts | 20 min |

---

*This plan prioritizes validation over building. Every week moves you closer to knowing—with real data, not assumptions—whether Grim Caps will work. The website comes after you've proven the model with real orders.*
