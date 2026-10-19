import "server-only";

// The catalogue itself, plus every accessor that reads it.
//
// `server-only` makes an accidental import from a "use client" component a
// BUILD ERROR rather than a silent leak of the whole catalogue (and, once this
// is a database, of connection details and private columns) into the browser
// bundle. Types and pure helpers live in ./products.ts, which is safe for
// client components to import.

import {
  defaultVariant,
  isInStock,
  type Category,
  type CategorySlug,
  type ListProductsOptions,
  type NutritionRow,
  type Product,
} from "./products";
import { MAX_PER_LINE, type CartCatalogue } from "./cart";

export const categories: Category[] = [
  {
    slug: "jaggery-blocks",
    name: "Jaggery Blocks",
    note: "Traditional & Pure",
    description:
      "Solid blocks set in traditional moulds, exactly the way jaggery has been made in Indian villages for generations. Chip off what you need for chai, sweets or everyday cooking.",
    image: "/images/cat-blocks.jpg",
  },
  {
    slug: "jaggery-powder",
    name: "Jaggery Powder",
    note: "Easy to use",
    description:
      "Finely ground jaggery that measures and blends just like sugar. The simplest way to swap refined sugar out of your kitchen without changing a single recipe.",
    image: "/images/cat-powder.jpg",
  },
  {
    slug: "jaggery-granules",
    name: "Jaggery Granules",
    note: "Quick dissolving",
    description:
      "Free-flowing granules that dissolve in seconds in hot or cold liquids. Ideal for tea, coffee, milkshakes and anything you stir rather than bake.",
    image: "/images/cat-granules.jpg",
  },
  {
    slug: "liquid-jaggery",
    name: "Liquid Jaggery",
    note: "Natural sweetener",
    description:
      "Thick golden syrup drawn off before the jaggery sets. Pour it over pancakes and porridge, or use it anywhere a recipe calls for honey or syrup.",
    image: "/images/cat-liquid.jpg",
  },
  {
    slug: "flavoured-jaggery",
    name: "Flavoured Jaggery",
    note: "Unique & healthy",
    description:
      "Jaggery blended with ginger, cardamom, dry fruits and immunity herbs. A sweetener and a wellness ritual in the same spoon.",
    image: "/images/cat-flavoured.jpg",
  },
];

const BLOCK_IMAGES: [string, ...string[]] = [
  "/images/prod-block.png",
  "/images/cat-blocks.jpg",
];
const POWDER_IMAGES: [string, ...string[]] = [
  "/images/prod-powder.png",
  "/images/cat-powder.jpg",
];
const GRANULE_IMAGES: [string, ...string[]] = [
  "/images/prod-granules.png",
  "/images/cat-granules.jpg",
];
const LIQUID_IMAGES: [string, ...string[]] = [
  "/images/prod-liquid.png",
  "/images/cat-liquid.jpg",
];
const FLAVOURED_IMAGES: [string, ...string[]] = [
  "/images/prod-immunity.png",
  "/images/cat-flavoured.jpg",
];

const STANDARD_NUTRITION: NutritionRow[] = [
  { label: "Energy", value: "383 kcal" },
  { label: "Carbohydrates", value: "95 g" },
  { label: "Total Sugars", value: "92 g" },
  { label: "Protein", value: "0.4 g" },
  { label: "Total Fat", value: "0.1 g" },
  { label: "Iron", value: "11 mg" },
  { label: "Calcium", value: "85 mg" },
  { label: "Potassium", value: "1050 mg" },
];

export const products: Product[] = [
  // ---------------------------------------------------------------- blocks
  {
    id: "p-001",
    slug: "organic-jaggery-block",
    name: "Organic Jaggery Block",
    category: "jaggery-blocks",
    shortDescription:
      "Our signature sugarcane jaggery, set in traditional moulds with nothing added.",
    description:
      "Pressed from freshly harvested sugarcane within hours of cutting, boiled slowly in open iron pans and set by hand into solid blocks. No sulphur, no bleaching agents, no chemical clarifiers — only cane juice and the patience of the people who make it. The colour varies from golden to deep amber between batches, which is exactly what unrefined jaggery should do.",
    images: BLOCK_IMAGES,
    variants: [
      {
        sku: "MM-BLK-500",
        label: "500 g",
        priceInPaise: 12000,
        mrpInPaise: 15000,
        stock: 140,
      },
      {
        sku: "MM-BLK-1000",
        label: "1 kg",
        priceInPaise: 22000,
        mrpInPaise: 28000,
        stock: 96,
      },
      {
        sku: "MM-BLK-5000",
        label: "5 kg",
        priceInPaise: 99000,
        mrpInPaise: 130000,
        stock: 18,
      },
    ],
    rating: 4.8,
    reviewCount: 412,
    badges: ["Best Seller", "Chemical Free"],
    nutrition: STANDARD_NUTRITION,
    ingredients: "100% sugarcane jaggery.",
    bestSeller: true,
    createdAt: "2024-01-12",
  },
  {
    id: "p-002",
    slug: "palm-jaggery-block",
    name: "Palm Jaggery Block",
    category: "jaggery-blocks",
    shortDescription:
      "Dark, smoky karupatti from South Indian palmyra sap. Lower on the glycemic index.",
    description:
      "Tapped from palmyra palms along the Tamil Nadu coast and reduced over wood fire until it sets almost black. Palm jaggery carries a deep, slightly smoky caramel note that sugarcane jaggery does not, and it sits lower on the glycemic index. Traditionally eaten after meals as a digestive.",
    images: BLOCK_IMAGES,
    variants: [
      {
        sku: "MM-PLM-250",
        label: "250 g",
        priceInPaise: 14000,
        mrpInPaise: 17000,
        stock: 72,
      },
      {
        sku: "MM-PLM-500",
        label: "500 g",
        priceInPaise: 26000,
        mrpInPaise: 32000,
        stock: 44,
      },
    ],
    rating: 4.7,
    reviewCount: 168,
    badges: ["Low GI"],
    nutrition: [
      { label: "Energy", value: "370 kcal" },
      { label: "Carbohydrates", value: "90 g" },
      { label: "Total Sugars", value: "86 g" },
      { label: "Protein", value: "1.0 g" },
      { label: "Iron", value: "13 mg" },
      { label: "Calcium", value: "95 mg" },
      { label: "Potassium", value: "1200 mg" },
    ],
    ingredients: "100% palmyra palm jaggery.",
    bestSeller: false,
    createdAt: "2024-04-02",
  },
  {
    id: "p-003",
    slug: "jaggery-cubes",
    name: "Jaggery Cubes",
    category: "jaggery-blocks",
    shortDescription:
      "Pre-portioned cubes, roughly one teaspoon each. No chopping, no mess.",
    description:
      "The same block jaggery, cut into even cubes of about five grams so you can drop one straight into a cup without a knife. Keeps its shape in the jar and makes it easy to actually track how much sweetener you are using.",
    images: BLOCK_IMAGES,
    variants: [
      {
        sku: "MM-CUB-400",
        label: "400 g",
        priceInPaise: 13500,
        mrpInPaise: 16000,
        stock: 110,
      },
      {
        sku: "MM-CUB-800",
        label: "800 g",
        priceInPaise: 25000,
        mrpInPaise: 30000,
        stock: 60,
      },
    ],
    rating: 4.6,
    reviewCount: 205,
    badges: ["Handy Pack"],
    nutrition: STANDARD_NUTRITION,
    ingredients: "100% sugarcane jaggery.",
    bestSeller: false,
    createdAt: "2024-06-18",
  },
  {
    id: "p-004",
    slug: "kolhapuri-jaggery-block",
    name: "Kolhapuri Jaggery Block",
    category: "jaggery-blocks",
    shortDescription:
      "GI-tagged jaggery from Kolhapur, prized for its pale gold colour and clean finish.",
    description:
      "Kolhapur's jaggery carries a Geographical Indication tag for good reason: the soil and cane variety of the region produce a noticeably lighter, cleaner-tasting block with almost no bitterness in the finish. This is the jaggery Maharashtrian households reach for when it goes into sweets rather than tea.",
    images: BLOCK_IMAGES,
    variants: [
      {
        sku: "MM-KOL-500",
        label: "500 g",
        priceInPaise: 15000,
        mrpInPaise: 18000,
        stock: 0,
      },
      {
        sku: "MM-KOL-1000",
        label: "1 kg",
        priceInPaise: 28000,
        mrpInPaise: 34000,
        stock: 26,
      },
    ],
    rating: 4.9,
    reviewCount: 97,
    badges: ["GI Tagged", "Limited Batch"],
    nutrition: STANDARD_NUTRITION,
    ingredients: "100% Kolhapuri sugarcane jaggery.",
    bestSeller: false,
    createdAt: "2024-09-05",
  },

  // ---------------------------------------------------------------- powder
  {
    id: "p-005",
    slug: "jaggery-powder",
    name: "Jaggery Powder",
    category: "jaggery-powder",
    shortDescription:
      "Fine, free-flowing powder that swaps for sugar one spoon for one spoon.",
    description:
      "Block jaggery, dried and milled to a fine powder that measures exactly like refined sugar. This is the easiest place to start if you are trying to get sugar out of the house — no recipe needs rewriting, nothing needs to be chopped or melted first. Works in batter, dough, chai and coffee alike.",
    images: POWDER_IMAGES,
    variants: [
      {
        sku: "MM-PWD-500",
        label: "500 g",
        priceInPaise: 11000,
        mrpInPaise: 14000,
        stock: 230,
      },
      {
        sku: "MM-PWD-1000",
        label: "1 kg",
        priceInPaise: 20000,
        mrpInPaise: 26000,
        stock: 155,
      },
      {
        sku: "MM-PWD-5000",
        label: "5 kg",
        priceInPaise: 92000,
        mrpInPaise: 120000,
        stock: 22,
      },
    ],
    rating: 4.8,
    reviewCount: 538,
    badges: ["Best Seller", "1:1 Sugar Swap"],
    nutrition: STANDARD_NUTRITION,
    ingredients: "100% sugarcane jaggery powder.",
    bestSeller: true,
    createdAt: "2024-01-12",
  },
  {
    id: "p-006",
    slug: "organic-jaggery-powder",
    name: "Organic Jaggery Powder",
    category: "jaggery-powder",
    shortDescription:
      "Certified organic cane, grown without synthetic pesticides or fertilisers.",
    description:
      "Milled from cane grown on certified organic farms in Maharashtra, with full traceability from field to pack. Identical in use to our standard powder — the difference is entirely in how the cane was grown and what it was never sprayed with.",
    images: POWDER_IMAGES,
    variants: [
      {
        sku: "MM-OPW-500",
        label: "500 g",
        priceInPaise: 15500,
        mrpInPaise: 19000,
        stock: 88,
      },
      {
        sku: "MM-OPW-1000",
        label: "1 kg",
        priceInPaise: 29000,
        mrpInPaise: 36000,
        stock: 51,
      },
    ],
    rating: 4.7,
    reviewCount: 143,
    badges: ["Certified Organic"],
    nutrition: STANDARD_NUTRITION,
    ingredients: "100% certified organic sugarcane jaggery powder.",
    bestSeller: false,
    createdAt: "2024-03-21",
  },
  {
    id: "p-007",
    slug: "coconut-jaggery-powder",
    name: "Coconut Jaggery Powder",
    category: "jaggery-powder",
    shortDescription:
      "Made from coconut palm nectar. Soft caramel flavour, low glycemic index.",
    description:
      "Collected as nectar from coconut palm blossoms in coastal Kerala, then reduced and powdered. Rounder and more buttery than cane jaggery, with a glycemic index low enough that it is a common recommendation for people watching their blood sugar. Excellent in baking and in filter coffee.",
    images: POWDER_IMAGES,
    variants: [
      {
        sku: "MM-CCP-250",
        label: "250 g",
        priceInPaise: 18000,
        mrpInPaise: 22000,
        stock: 64,
      },
      {
        sku: "MM-CCP-500",
        label: "500 g",
        priceInPaise: 34000,
        mrpInPaise: 42000,
        stock: 37,
      },
    ],
    rating: 4.6,
    reviewCount: 89,
    badges: ["Low GI", "Vegan"],
    nutrition: [
      { label: "Energy", value: "375 kcal" },
      { label: "Carbohydrates", value: "92 g" },
      { label: "Total Sugars", value: "88 g" },
      { label: "Protein", value: "1.1 g" },
      { label: "Iron", value: "2 mg" },
      { label: "Zinc", value: "2 mg" },
      { label: "Potassium", value: "1030 mg" },
    ],
    ingredients: "100% coconut palm jaggery powder.",
    bestSeller: false,
    createdAt: "2024-07-30",
  },

  // -------------------------------------------------------------- granules
  {
    id: "p-008",
    slug: "jaggery-granules",
    name: "Jaggery Granules",
    category: "jaggery-granules",
    shortDescription:
      "Coarse granules that dissolve in seconds. Built for tea and coffee.",
    description:
      "Granulated a little coarser than our powder so it pours cleanly from a jar and dissolves almost instantly when stirred. If the only thing standing between you and giving up sugar is how long jaggery takes to melt in your morning chai, this is the format to buy.",
    images: GRANULE_IMAGES,
    variants: [
      {
        sku: "MM-GRN-500",
        label: "500 g",
        priceInPaise: 11500,
        mrpInPaise: 14500,
        stock: 190,
      },
      {
        sku: "MM-GRN-1000",
        label: "1 kg",
        priceInPaise: 21000,
        mrpInPaise: 27000,
        stock: 112,
      },
    ],
    rating: 4.7,
    reviewCount: 361,
    badges: ["Best Seller", "Quick Dissolve"],
    nutrition: STANDARD_NUTRITION,
    ingredients: "100% sugarcane jaggery granules.",
    bestSeller: true,
    createdAt: "2024-01-12",
  },
  {
    id: "p-009",
    slug: "date-jaggery-granules",
    name: "Date Jaggery Granules",
    category: "jaggery-granules",
    shortDescription:
      "Winter-season nolen gur from Bengal date palms, granulated for year-round use.",
    description:
      "Date palm sap is only tapped in the cold Bengal winter, which is why nolen gur has always been a seasonal treat. We granulate and seal it at harvest so the flavour — floral, almost toffee-like — is available in July as well as January.",
    images: GRANULE_IMAGES,
    variants: [
      {
        sku: "MM-DTG-250",
        label: "250 g",
        priceInPaise: 19000,
        mrpInPaise: 24000,
        stock: 0,
      },
      {
        sku: "MM-DTG-500",
        label: "500 g",
        priceInPaise: 36000,
        mrpInPaise: 45000,
        stock: 0,
      },
    ],
    rating: 4.9,
    reviewCount: 76,
    badges: ["Seasonal Harvest"],
    nutrition: STANDARD_NUTRITION,
    ingredients: "100% date palm jaggery granules.",
    bestSeller: false,
    createdAt: "2024-11-14",
  },
  {
    id: "p-010",
    slug: "ginger-jaggery-granules",
    name: "Ginger Jaggery Granules",
    category: "jaggery-granules",
    shortDescription:
      "Granules blended with dried ginger. Chai, sore throats, cold mornings.",
    description:
      "Our standard granules blended with stone-ground dried ginger in the proportion most Indian households would add by hand anyway. Sweetens and spices chai in one step, and a spoon stirred into hot water is the oldest cold remedy in the book.",
    images: GRANULE_IMAGES,
    variants: [
      {
        sku: "MM-GNG-300",
        label: "300 g",
        priceInPaise: 15000,
        mrpInPaise: 18500,
        stock: 78,
      },
      {
        sku: "MM-GNG-600",
        label: "600 g",
        priceInPaise: 28000,
        mrpInPaise: 35000,
        stock: 39,
      },
    ],
    rating: 4.8,
    reviewCount: 212,
    badges: ["Winter Favourite"],
    nutrition: STANDARD_NUTRITION,
    ingredients: "Sugarcane jaggery granules (92%), dried ginger powder (8%).",
    bestSeller: false,
    createdAt: "2024-10-09",
  },

  // ---------------------------------------------------------------- liquid
  {
    id: "p-011",
    slug: "liquid-jaggery",
    name: "Liquid Jaggery",
    category: "liquid-jaggery",
    shortDescription:
      "Golden cane syrup, drawn off before the jaggery sets. Pours straight from the bottle.",
    description:
      "Also called kakvi. We stop the boil early and bottle the syrup while it is still pourable, so it keeps a brighter, fresher cane flavour than set jaggery does. Use it the way you would honey or maple syrup: over pancakes, stirred into yoghurt, brushed on roti.",
    images: LIQUID_IMAGES,
    variants: [
      {
        sku: "MM-LIQ-500",
        label: "500 ml",
        priceInPaise: 18000,
        mrpInPaise: 22000,
        stock: 85,
      },
      {
        sku: "MM-LIQ-1000",
        label: "1 L",
        priceInPaise: 33000,
        mrpInPaise: 42000,
        stock: 47,
      },
    ],
    rating: 4.7,
    reviewCount: 294,
    badges: ["Best Seller", "Pourable"],
    nutrition: [
      { label: "Energy", value: "310 kcal" },
      { label: "Carbohydrates", value: "77 g" },
      { label: "Total Sugars", value: "74 g" },
      { label: "Protein", value: "0.3 g" },
      { label: "Iron", value: "9 mg" },
      { label: "Calcium", value: "70 mg" },
      { label: "Potassium", value: "890 mg" },
    ],
    ingredients: "100% sugarcane jaggery syrup.",
    bestSeller: true,
    createdAt: "2024-01-12",
  },
  {
    id: "p-012",
    slug: "nolen-gur-syrup",
    name: "Nolen Gur Syrup",
    category: "liquid-jaggery",
    shortDescription:
      "The date palm syrup Bengali sweet shops queue for every winter.",
    description:
      "Fresh date palm sap reduced just enough to pour. If you have had a good rosogolla in Kolkata in January, this is what was in it. Spoon it over mishti doi, ice cream or plain steamed rice — it does not need any help.",
    images: LIQUID_IMAGES,
    variants: [
      {
        sku: "MM-NLN-250",
        label: "250 ml",
        priceInPaise: 24000,
        mrpInPaise: 30000,
        stock: 33,
      },
      {
        sku: "MM-NLN-500",
        label: "500 ml",
        priceInPaise: 45000,
        mrpInPaise: 56000,
        stock: 0,
      },
    ],
    rating: 4.9,
    reviewCount: 118,
    badges: ["Seasonal Harvest", "Limited Batch"],
    nutrition: [
      { label: "Energy", value: "318 kcal" },
      { label: "Carbohydrates", value: "78 g" },
      { label: "Total Sugars", value: "75 g" },
      { label: "Protein", value: "0.5 g" },
      { label: "Iron", value: "10 mg" },
      { label: "Calcium", value: "78 mg" },
      { label: "Potassium", value: "940 mg" },
    ],
    ingredients: "100% date palm jaggery syrup.",
    bestSeller: false,
    createdAt: "2024-12-01",
  },
  {
    id: "p-013",
    slug: "jaggery-honey-blend",
    name: "Jaggery & Honey Blend",
    category: "liquid-jaggery",
    shortDescription:
      "Liquid jaggery cut with raw forest honey. Thinner pour, floral finish.",
    description:
      "Two parts liquid jaggery to one part unheated forest honey from the Nilgiris. The honey thins the syrup and adds a floral top note; the jaggery keeps the iron and the depth. Our most popular bottle for morning porridge.",
    images: LIQUID_IMAGES,
    variants: [
      {
        sku: "MM-JHB-350",
        label: "350 ml",
        priceInPaise: 27000,
        mrpInPaise: 33000,
        stock: 58,
      },
    ],
    rating: 4.5,
    reviewCount: 64,
    badges: ["Raw Honey"],
    nutrition: [
      { label: "Energy", value: "322 kcal" },
      { label: "Carbohydrates", value: "80 g" },
      { label: "Total Sugars", value: "78 g" },
      { label: "Protein", value: "0.4 g" },
      { label: "Iron", value: "7 mg" },
      { label: "Calcium", value: "60 mg" },
      { label: "Potassium", value: "760 mg" },
    ],
    ingredients: "Sugarcane jaggery syrup (67%), raw forest honey (33%).",
    bestSeller: false,
    createdAt: "2025-02-11",
  },

  // ------------------------------------------------------------- flavoured
  {
    id: "p-014",
    slug: "immunity-jaggery-mix",
    name: "Immunity Jaggery Mix",
    category: "flavoured-jaggery",
    shortDescription:
      "Jaggery with tulsi, ginger, black pepper and turmeric. A kadha in one spoon.",
    description:
      "The herbs an Indian grandmother would put in a kadha, already blended into jaggery in the right proportions. One spoon in hot water makes the drink; one spoon in chai makes it taste like winter. Nothing synthetic, no added vitamins — just the plants themselves.",
    images: FLAVOURED_IMAGES,
    variants: [
      {
        sku: "MM-IMM-300",
        label: "300 g",
        priceInPaise: 16000,
        mrpInPaise: 20000,
        stock: 124,
      },
      {
        sku: "MM-IMM-600",
        label: "600 g",
        priceInPaise: 30000,
        mrpInPaise: 38000,
        stock: 67,
      },
    ],
    rating: 4.8,
    reviewCount: 387,
    badges: ["Best Seller", "Ayurvedic Herbs"],
    nutrition: STANDARD_NUTRITION,
    ingredients:
      "Sugarcane jaggery (85%), dried ginger, tulsi, turmeric, black pepper, cardamom.",
    bestSeller: true,
    createdAt: "2024-01-12",
  },
  {
    id: "p-015",
    slug: "cardamom-jaggery",
    name: "Cardamom Jaggery",
    category: "flavoured-jaggery",
    shortDescription:
      "Hand-pounded green cardamom folded through warm jaggery.",
    description:
      "Idukki green cardamom, pounded fresh and folded into the jaggery while it is still warm so the oils carry all the way through. Made for kheer, halwa and anything where you would otherwise add cardamom separately at the end.",
    images: FLAVOURED_IMAGES,
    variants: [
      {
        sku: "MM-CRD-250",
        label: "250 g",
        priceInPaise: 17000,
        mrpInPaise: 21000,
        stock: 71,
      },
      {
        sku: "MM-CRD-500",
        label: "500 g",
        priceInPaise: 32000,
        mrpInPaise: 40000,
        stock: 35,
      },
    ],
    rating: 4.7,
    reviewCount: 131,
    badges: ["Hand Pounded"],
    nutrition: STANDARD_NUTRITION,
    ingredients: "Sugarcane jaggery (94%), green cardamom (6%).",
    bestSeller: false,
    createdAt: "2024-05-16",
  },
  {
    id: "p-016",
    slug: "dry-fruit-jaggery-bites",
    name: "Dry Fruit Jaggery Bites",
    category: "flavoured-jaggery",
    shortDescription:
      "Almond, cashew and sesame set in jaggery. Lunchbox-sized pieces.",
    description:
      "Roasted almonds, cashews and white sesame set into jaggery and cut into bite-sized squares — closer to a chikki than a sweetener. Goes in school lunchboxes, gym bags and the four-o-clock drawer at work. Ten pieces per pack.",
    images: FLAVOURED_IMAGES,
    variants: [
      {
        sku: "MM-DFB-200",
        label: "200 g",
        priceInPaise: 19000,
        mrpInPaise: 24000,
        stock: 93,
      },
      {
        sku: "MM-DFB-400",
        label: "400 g",
        priceInPaise: 36000,
        mrpInPaise: 45000,
        stock: 48,
      },
    ],
    rating: 4.6,
    reviewCount: 256,
    badges: ["Kid Friendly"],
    nutrition: [
      { label: "Energy", value: "452 kcal" },
      { label: "Carbohydrates", value: "66 g" },
      { label: "Total Sugars", value: "58 g" },
      { label: "Protein", value: "7 g" },
      { label: "Total Fat", value: "17 g" },
      { label: "Iron", value: "8 mg" },
      { label: "Calcium", value: "180 mg" },
    ],
    ingredients:
      "Sugarcane jaggery (62%), almonds, cashews, white sesame, ghee.",
    bestSeller: false,
    createdAt: "2024-08-23",
  },
  {
    id: "p-017",
    slug: "jaggery-sampler-box",
    name: "Jaggery Sampler Box",
    category: "flavoured-jaggery",
    shortDescription:
      "Six formats, 200 g each. The easiest way to work out what you actually use.",
    description:
      "Block, powder, granules, liquid, immunity mix and cardamom jaggery, 200 g of each in a single box. We built it for people switching away from sugar who have no idea which format will suit their kitchen — and it makes a genuinely good gift at Diwali.",
    images: FLAVOURED_IMAGES,
    variants: [
      {
        sku: "MM-SMP-1200",
        label: "6 × 200 g",
        priceInPaise: 89000,
        mrpInPaise: 115000,
        stock: 29,
      },
    ],
    rating: 4.9,
    reviewCount: 143,
    badges: ["Gift Ready", "Six Formats"],
    nutrition: STANDARD_NUTRITION,
    ingredients:
      "Assorted sugarcane jaggery products. See individual product pages for detail.",
    bestSeller: false,
    createdAt: "2025-01-08",
  },
];

// ---------------------------------------------------------------------------
// Async accessors — the seam a database slots into later.
// ---------------------------------------------------------------------------

export async function getAllProducts(): Promise<Product[]> {
  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getProductsByCategory(
  category: CategorySlug,
): Promise<Product[]> {
  return products.filter((p) => p.category === category);
}

export async function getBestSellers(limit = 5): Promise<Product[]> {
  return products.filter((p) => p.bestSeller).slice(0, limit);
}

export async function getRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  const sameCategory = products.filter(
    (p) => p.category === product.category && p.id !== product.id,
  );
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);
  const filler = products.filter(
    (p) => p.category !== product.category && p.id !== product.id,
  );
  return [...sameCategory, ...filler].slice(0, limit);
}

export async function getAllCategories(): Promise<Category[]> {
  return categories;
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  return categories.find((c) => c.slug === slug) ?? null;
}

/** Number of products in each category, for the shop filter sidebar. */
export async function getCategoryCounts(): Promise<
  Record<CategorySlug, number>
> {
  const counts = {
    "jaggery-blocks": 0,
    "jaggery-powder": 0,
    "jaggery-granules": 0,
    "liquid-jaggery": 0,
    "flavoured-jaggery": 0,
  } satisfies Record<CategorySlug, number>;
  for (const p of products) counts[p.category] += 1;
  return counts;
}

export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);
  const scored = products
    .map((p) => {
      const haystack = [
        p.name,
        p.shortDescription,
        p.description,
        p.category.replace(/-/g, " "),
        p.badges.join(" "),
        p.ingredients,
      ]
        .join(" ")
        .toLowerCase();
      // Every term must appear somewhere; name matches rank highest.
      if (!terms.every((t) => haystack.includes(t))) return null;
      const name = p.name.toLowerCase();
      const score =
        terms.filter((t) => name.startsWith(t)).length * 4 +
        terms.filter((t) => name.includes(t)).length * 2 +
        (p.bestSeller ? 1 : 0);
      return { product: p, score };
    })
    .filter((x): x is { product: Product; score: number } => x !== null)
    .sort((a, b) => b.score - a.score || b.product.rating - a.product.rating);
  return scored.map((x) => x.product);
}

/** The shop page's single entry point: filter + sort in one call. */
export async function listProducts({
  category,
  sort = "featured",
  inStockOnly = false,
  maxPriceInPaise,
}: ListProductsOptions = {}): Promise<Product[]> {
  let list = [...products];

  if (category) list = list.filter((p) => p.category === category);
  if (inStockOnly) list = list.filter(isInStock);
  if (maxPriceInPaise !== undefined) {
    list = list.filter(
      (p) => defaultVariant(p).priceInPaise <= maxPriceInPaise,
    );
  }

  switch (sort) {
    case "price-asc":
      list.sort(
        (a, b) =>
          defaultVariant(a).priceInPaise - defaultVariant(b).priceInPaise,
      );
      break;
    case "price-desc":
      list.sort(
        (a, b) =>
          defaultVariant(b).priceInPaise - defaultVariant(a).priceInPaise,
      );
      break;
    case "rating":
      list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
      break;
    case "newest":
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case "featured":
    default:
      list.sort(
        (a, b) =>
          Number(b.bestSeller) - Number(a.bestSeller) || b.rating - a.rating,
      );
      break;
  }

  return list;
}

/** The highest cheapest-variant price in the catalogue, for the price slider bound. */
export async function getMaxProductPriceInPaise(): Promise<number> {
  return products.reduce(
    (max, p) => Math.max(max, defaultVariant(p).priceInPaise),
    0,
  );
}

/**
 * Flat SKU -> display/price map for the cart.
 *
 * This IS serialised to the browser on every route (the provider lives in the
 * root layout), so it carries the minimum the cart needs: no raw stock counts,
 * no internal fields. Keep it that way — anything added here is published.
 *
 * Freshness: every route is prerendered, so these values are fixed at BUILD
 * time, not per request. A price or stock change reaches customers on the next
 * build/deploy. Once this is database-backed it needs `revalidate` or cache
 * tags, and checkout must re-read price and stock server-side regardless —
 * see docs/CHECKOUT-SECURITY.md.
 */
export async function getCartCatalogue(): Promise<CartCatalogue> {
  // Accumulated in a Map and converted with Object.fromEntries rather than
  // assigned into an object literal.
  //
  // `obj[sku] = v` with a SKU of "__proto__" reassigns the prototype, and
  // "constructor"/"toString" shadow those members for every later consumer.
  // Object.fromEntries defines OWN properties, so neither can happen. (A
  // null-prototype object would also be safe but cannot cross the RSC
  // boundary — React rejects it outright, which is how this was caught.)
  // The read side is guarded independently by `lookupSku` in ./cart.
  const entries = new Map<string, CartCatalogue[string]>();
  for (const product of products) {
    for (const variant of product.variants) {
      entries.set(variant.sku, {
        sku: variant.sku,
        productSlug: product.slug,
        productName: product.name,
        variantLabel: variant.label,
        image: product.images[0],
        priceInPaise: variant.priceInPaise,
        mrpInPaise: variant.mrpInPaise,
        // NOT the raw stock figure — see the note on CartSku.maxPerLine.
        maxPerLine: Math.max(0, Math.min(variant.stock, MAX_PER_LINE)),
      });
    }
  }
  return Object.fromEntries(entries);
}
