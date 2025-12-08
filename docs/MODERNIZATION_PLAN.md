# Pro Plastics Inc. Website Modernization Plan

## Current Website Assessment

### What's Working
- Clear value proposition (35+ years experience, custom plastic manufacturing)
- Multiple contact methods available
- Logical navigation structure
- Mobile-responsive (built with GoDaddy)
- Good SEO basics (business hours, address, phone)

### Major Issues
1. **Dated Visual Design** - Generic GoDaddy template, lacks modern aesthetics
2. **Weak Visual Storytelling** - Limited photos of actual work, facilities, or team
3. **Poor Product Presentation** - Materials stored as images rather than searchable database
4. **No Social Proof** - Missing testimonials, case studies, certifications display
5. **Limited Interactivity** - No quote request calculator, material selector, or interactive tools
6. **Email Typo** - Inconsistent domain (proplasticinc.com vs proplasticsinc.com)
7. **Dead Links** - Material Comparison Charts have broken anchor links
8. **No Portfolio/Gallery** - Can't see examples of completed work

---

## Modernization Plan

### Phase 1: Foundation & Branding

#### 1.1 Visual Identity Refresh
- Modern logo refinement (keep recognition, update execution)
- Professional color palette:
  - Primary: Deep industrial blue (#1a365d)
  - Accent: Precision orange (#ed8936) or machined silver (#718096)
  - Clean whites and subtle grays for backgrounds
- Custom typography (Inter or similar modern sans-serif)

#### 1.2 Photography Investment
- Professional photos of:
  - CNC machines in action
  - Finished precision parts (macro shots showing tolerances)
  - Facility interior
  - Team members (adds trust for B2B)
  - Raw materials inventory

### Phase 2: Homepage Redesign

#### 2.1 Hero Section
- Full-width video background (machines running) or high-quality image carousel
- Bold headline: "Precision Plastic Manufacturing Since 1968"
- Subheadline emphasizing quick quotes and custom capabilities
- Two CTAs: "Get a Quote" (primary) + "View Capabilities" (secondary)
- Trust badges: years in business, industries served count, parts manufactured

#### 2.2 Services Overview
- Icon-driven grid showing core capabilities:
  - CNC Machining
  - Custom Fabrication
  - Material Distribution
  - Prototyping
- Each links to detailed service page

#### 2.3 Industries Served
- Visual grid of 12 industries with icons
- Clicking each shows relevant case studies/parts

#### 2.4 Social Proof Section
- Customer testimonials with company logos
- "Trusted by companies in aerospace, medical, semiconductor..."
- Certification badges (ISO if applicable, etc.)

#### 2.5 Featured Work Gallery
- 6-8 showcase pieces with hover effects
- Links to full portfolio

#### 2.6 Quick Quote CTA
- Embedded quote request form
- "Upload your drawing, get a quote in 24 hours"

### Phase 3: Key Page Restructuring

#### 3.1 About Us (Expanded)
- Company timeline (1968 → present milestones)
- Team section with photos and roles
- Facility tour section (photos or video)
- Core values with visual treatment
- Certifications and quality commitments

#### 3.2 Capabilities Page (New)
- Replace generic "Machined Parts" with detailed capabilities:
  - CNC Horizontal/Vertical Machining
  - Turning & Milling
  - Vacuum Forming
  - Die Cutting
  - Routing
- Each with: description, tolerances achieved, materials compatible, example parts

#### 3.3 Materials Database (Interactive)
- Searchable/filterable material database replacing static images
- Filter by: property (chemical resistant, FDA compliant, etc.), application, material family
- Each material page includes:
  - Technical specifications
  - Common applications
  - Available forms (sheet, rod, tube)
  - Downloadable spec sheet (PDF)

#### 3.4 Industries Pages
- Dedicated landing page for each major industry:
  - Aerospace
  - Medical
  - Semiconductor
  - Electronics
  - Automotive
- Each includes: specific capabilities, relevant materials, case studies, compliance info

#### 3.5 Portfolio/Gallery
- Categorized project gallery
- Before/after shots where applicable
- Technical details: material used, tolerances, quantity
- Optional case studies with client stories

#### 3.6 Resources Hub
- Material comparison charts (interactive, not image files)
- Chemical resistance guide (searchable)
- Military specifications reference
- Blog section for industry insights (optional)
- Downloadable resources (PDFs, guides)

### Phase 4: Conversion Optimization

#### 4.1 Quote Request System
- Multi-step form wizard:
  1. Part type selection
  2. Material preference (with recommendations)
  3. Quantity & timeline
  4. Drawing/file upload (CAD files, PDFs)
  5. Contact information
- Instant confirmation email with expected response time

#### 4.2 Live Chat Integration
- Business hours chat with sales team
- After-hours chatbot for FAQs and lead capture

#### 4.3 Sticky Contact Bar
- Phone number always visible on mobile
- "Request Quote" button persistent on scroll

### Phase 5: Technical Implementation

#### 5.1 Platform Recommendation
Move from GoDaddy to a more capable platform:
- **Option A: WordPress + Elementor** - Flexible, lots of industrial themes
- **Option B: Webflow** - Modern, designer-friendly, fast
- **Option C: Custom Next.js** - Best performance, full control (CHOSEN)

#### 5.2 Performance
- Target 90+ Lighthouse score
- Image optimization (WebP format)
- Lazy loading for gallery
- CDN for global performance

#### 5.3 SEO Improvements
- Structured data for local business
- Dedicated landing pages for key terms:
  - "custom plastic machining NJ"
  - "CNC plastic parts manufacturer"
  - "PEEK machining services"
  - "medical grade plastic components"
- Blog content strategy for organic traffic

#### 5.4 Analytics & Tracking
- Google Analytics 4 setup
- Conversion tracking on quote requests
- Heatmaps to optimize page layouts
- Call tracking for phone inquiries

---

## Site Structure

```
Home
├── About Us
│   ├── Our Story
│   ├── Our Team
│   ├── Facility Tour
│   └── Quality & Certifications
├── Capabilities
│   ├── CNC Machining
│   ├── Fabrication
│   ├── Vacuum Forming
│   └── Secondary Operations
├── Materials
│   ├── Material Database (searchable)
│   ├── Comparison Charts
│   ├── Chemical Resistance Guide
│   └── Military Specs
├── Industries
│   ├── Aerospace
│   ├── Medical
│   ├── Semiconductor
│   ├── Electronics
│   └── [Other Industries]
├── Portfolio
│   └── Project Gallery
├── Resources
│   ├── Guides & Downloads
│   └── Blog (optional)
├── Request Quote
└── Contact Us
```

---

## Priority Actions (Quick Wins)

1. **Fix the email typo** immediately
2. **Add testimonials** - even 2-3 client quotes adds credibility
3. **Professional photography** - biggest visual impact
4. **Make materials searchable** - replace image-based lists
5. **Add a portfolio section** - showcase actual work

---

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Industrial Blue | #1a365d | Primary brand color, headers |
| Precision Orange | #ed8936 | CTAs, accents, highlights |
| Steel Gray | #718096 | Secondary text, borders |
| Light Gray | #f7fafc | Backgrounds |
| White | #ffffff | Cards, content areas |
| Dark Text | #2d3748 | Body text |

## Typography

- **Headings**: Inter (Bold/Semibold)
- **Body**: Inter (Regular)
- **Fallback**: system-ui, sans-serif
