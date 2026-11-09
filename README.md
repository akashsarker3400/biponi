# শ্রীমতী বিতান · Srimoti Bitan

A saree shop website. React + TypeScript + Vite, with Motion animations and Lenis smooth scrolling.

## Deploy on Coolify

This repo includes a `Dockerfile` (Node build → nginx) and `nginx.conf`.

1. In Coolify: **+ New Resource → Public/Private Repository**, pick this GitHub repo, branch `main`.
2. **Build Pack: Dockerfile.** Port: **80**.
3. Add your domain (e.g. `https://srimotibitan.com`) and deploy. Coolify issues the SSL certificate.

Every push to `main` can redeploy automatically (enable the webhook / auto-deploy in Coolify).

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Live interactions (the "feel it" layer)
- **Silk curtain intro**: a red-gold paisley silk curtain gathers aside to reveal the site
- **Touch the saree (3D)**: real cloth physics in three.js. Grab and pull the fabric, the fan makes it sway, light moods (daylight / lamplight / Pujo pandal), metallic zari that glints, and **blow into the mic** to make the anchol fly
- **Weave Studio 3D**: the customer's own design shown live as 3D fabric
- **Walk into the shop**: scroll-driven walk through real shop photos; each room opens through a gold arch doorway, with tappable hotspots on sarees. The shop photos are stock images in `src/components/ShopWalk.tsx`: replace them with photos of your real showroom.
- **Weave lens**: in the saree detail, hover to magnify the threads ×3.4
- **Zari cursor**: a gold thread follows the mouse (desktop)
- **Silk ripple**: photos ripple like fabric on hover

The 3D engine (`src/components/Cloth3D.tsx`) is lazy-loaded, so the first page load stays fast.

## Sections
1. **Hero**: full-length models in a gold arch, floating product card, rotating seal, Bangla/English headline
2. **Six seasons (ষড়ঋতু)**: a saree for each Bengali season, in do-chala temple-roof frames
3. **Weave Studio**: the customer designs their own saree (weave, colours, paar, motif, zari) and the price updates live
4. **Pick a saree**: tilting 3D cards; + flies the saree into the bag
5. **Collection rail**: sarees on hangers, filters, and a detail view that lifts the hanger off (jomin/anchol flip)
6. **The looms**: horizontal-scroll story of the weaving villages
7. **Bridal**: arc carousel with discount tags
8. **Lookbook**: slideshow with scrolling photo columns
9. **Visit**: showroom details, delivery/COD, newsletter
10. **Bag & wishlist**: delivery charge (inside/outside Dhaka), free-delivery bar, order on WhatsApp

## Before going live: replace these
- `src/data.ts` → `SHOP`: phone, WhatsApp number, email, address, hours, Facebook/Instagram links (all placeholders now)
- `src/data.ts` → products, prices, names
- `src/components/Looms.tsx` → the counters (120+ weaving families, 18 villages, 4,800+ sarees) are **example numbers**. Use your real figures.
- Photos come from Unsplash (free licence). Replace them with your own product photos when you have them.
- The newsletter form doesn't send anything yet. Connect it to Mailchimp or similar.
- Orders, stock and coupons (`src/ops.tsx`) are saved in each visitor's browser for now. For real shop orders across devices, connect a backend (e.g. Supabase); the rest of the app only talks to `useOps()`.
- `src/catalog.ts`: names, prices, stories and photos of the sarees on models; replace with your own.
- Exchange policy and delivery times in `src/data.ts` (`POLICY`, `deliveryFor`) are examples.

## Not connected yet
`src/ops.tsx` + the extra data in `src/data.ts` hold an order/stock/coupon engine (auto order ID, delivery charge by district, festival coupons, low-stock alerts). It is written but **not wired into the site yet**.

## Checking performance on a phone
Open the site with `?fps` (e.g. `https://your-domain/?fps`) to see the frame rate and the current section in the top-left corner.
