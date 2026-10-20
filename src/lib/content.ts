// Marketing copy for the homepage. Product and category data lives in
// ~/lib/products.data.ts, because it is shop data rather than page copy.
// Contact details, URLs and shipping rates live in ~/config/site.ts.

export const navLinks = [
  { label: "Shop", href: "/shop" },
  { label: "Our Story", href: "/#story" },
  { label: "Benefits", href: "/#benefits" },
  { label: "Recipes", href: "/#recipes" },
  { label: "Contact", href: "/#contact" },
];

export const recipes = [
  {
    name: "Jaggery Chai",
    note: "A healthier twist to your daily tea.",
    image: "/images/recipe-chai.jpg",
  },
  {
    name: "Jaggery Ladoo",
    note: "Nutritious and delicious.",
    image: "/images/recipe-ladoo.jpg",
  },
  {
    name: "Jaggery Pancakes",
    note: "Healthy breakfast for the family.",
    image: "/images/recipe-pancakes.jpg",
  },
];

export const reviews = [
  {
    quote:
      "Great quality and authentic taste. It reminds me of homemade jaggery from my village.",
    name: "Amit S.",
    city: "Mumbai",
  },
  {
    quote:
      "I've switched to jaggery for my family and the health benefits are amazing. Highly recommended!",
    name: "Priya K.",
    city: "Bengaluru",
  },
  {
    quote: "Clean, fresh and full of natural goodness. Perfect for daily use.",
    name: "Rahul M.",
    city: "Pune",
  },
  {
    quote:
      "The powder dissolves easily in milk. My kids don't miss sugar at all.",
    name: "Sneha R.",
    city: "Nashik",
  },
];
