# 📄 Landing Page Specifications: Face Value

## 1. Project Identity
* **Project Name:** Face Value
* **Domain:** `facevalue.dev`
* **Tagline:** "Trade the Tech Faces, Own the Hype."
* **Core Concept:** A satirical, gamified stock exchange where users trade stocks of famous Tech CEOs using play money.
* **Vibe/Aesthetic:**
    * **Theme:** Dark Mode and exisiting color theme of the UI
    * **Typography:** Sans-serif (Inter/Geist) for headings; Monospace (JetBrains Mono/Fira Code) for all numbers and ticker data.
    * **Visual Style:** "Fintech meets Retro Gaming." Clean lines, subtle glows, pixel-art logo influence.

---

## 2. Logo & Assets
* **Logo Concept:** "The Coin-Head"
    * *Visual:* A gold coin containing a pixel-art face wearing sunglasses.
    * *Text:* "FACE VALUE" in bold lettering below or beside the coin.
* **Dashboard Preview (The "Glory Shot"):**
    * *Content:* A high-quality screenshot of the trading dashboard.
    * *Effect:* Apply a 3D tilt transform (`rotateX(10deg) rotateY(-10deg)`) and a glass-morphism border with a subtle green inner glow to make it "float" off the page.

---

## 3. Page Structure & Content

### A. Navigation Bar
* **Left:** Logo (Face Value).
* **Center Links:** `Market` • `Leaderboard` • `About`
* **Right CTA:** `Start Trading` button (Solid Green pill shape, Black text).

### B. Hero Section (The Hook)
* **Layout:** Centered text, big and bold.
* **Headline:** "Trade the Tech Faces, Own the Hype."
* **Subheading:** "A real-time exchange built by a techie, for the techies. Buy and sell your favorite founders, vote on new listings, and watch the drama unfold on the charts."
* **Primary CTA:** `Start Trading` (Green background, black text, hover effect).
* **Secondary CTA:** `View Source Code` (Transparent background, white outline, GitHub icon).
* **Micro-copy (under buttons):** "100% Virtual Currency. 0% Financial Advice."

### C. The Ticker Tape (Infinite Scroll)
* **Placement:** Immediately below Hero or fixed at the very top.
* **Animation:** CSS Marquee (Infinite horizontal scroll).
* **Data Content:**
    * `SAM $105.20 (+4.2%)` (Green Text)
    * `ELON $420.69 (-1.5%)` (Red Text)
    * `ZUCK $89.00 (+0.8%)` (Green Text)
    * `SUNDAR $110.50 (-0.4%)` (Red Text)
    * `SATYA $250.00 (+2.1%)` (Green Text)
    * `JENSEN $900.00 (+10.5%)` (Green Text)

### D. Stats Bar (Social Proof)
* **Placement:** Below the Dashboard Image.
* **Layout:** Horizontal row of 3 clear metrics.
* **Metric 1:** `15,420` (Label: Orders Executed)
* **Metric 2:** `$50M+` (Label: Virtual Volume Traded)
* **Metric 3:** `20ms` (Label: Matching Engine Latency)

### E. Features Section (The Moat)
* **Heading:** "Under the Hood"
* **Subheading:** "A full-stack simulation running closer to the metal."
* **Card 1: The Engine**
    * *Icon:* Lightning/Zap
    * *Title:* Custom TypeScript Matching Engine
    * *Body:* "We didn't just use a database query. This is a pure TypeScript order matching system with price-time priority, O(1) lookups, and custom logic handling every bid and ask."
* **Card 2: The Democracy**
    * *Icon:* Users/Vote
    * *Title:* Community IPOs
    * *Body:* "You control the market cap. Vote for the next Tech CEO to be listed on the exchange. The community decides who trades, who fades, and who gets the next ticker symbol."
* **Card 3: The Performance**
    * *Icon:* Activity/Chart
    * *Title:* Blazing Fast Execution
    * *Body:* "Experience the rush of instant fills. Our optimized architecture handles high-concurrency order placement, ensuring your market orders hit the book before the price slips."

### F. Sponsors Section ("The Seed Round")
* **Heading:** "Our Sponsers 💖"
* **Subheading:** "Add some relevant subheading"
* **Layout:** Row of profile cards.
* **Card Structure:**
    * [Profile Image placeholder]
    * **Name:** [Friend Name]
    * **Role:** Angel Investor / Chief Hype Officer
    * **Quote:** "I tested the beta and only lost 50% of my fake money. 10/10."

### G. FAQ Section
* **Heading:** "Market Insights"
* **Accordion Items:**
    1.  **Q:** Is this real money?
        **A:** Nope. This is 100% play money. Your wallet is virtual, your gains are virtual, and unfortunately, so is your "crypto-bro" status.
    2.  **Q:** How are prices determined?
        **A:** Pure supply and demand. If the community buys, the price goes up. If they sell (or if our volatility bots wake up), the price goes down.
    3.  **Q:** Can I add a specific CEO?
        **A:** Yes. Head to the "Suggestions" tab and submit a proposal. If the community votes it up, we'll ring the IPO bell.

### H. Footer
* **Text:** "Built by [Your Name] for the love of code and chaos."
* **Links:** GitHub • Twitter/X • LinkedIn
* **Copyright:** © 2025 Face Value.

---

## 4. Technical Implementation Notes
* **Framework:** Next.js 15 (App Router).
* **Styling:** Tailwind CSS.
* **Components:**
    * Use `shadcn/ui` for Buttons and Accordions (FAQ).
    * Use `lucide-react` for feature icons.
* **Fonts:**
    * Headings/Body: `Inter` or `Geist`.
    * Numbers/Prices: `JetBrains Mono` or `Fira Code`.
* **Responsiveness:** Ensure Ticker Tape works on mobile and Grid collapses gracefully.