// How category types are named on screen. The stored values never change —
// renaming a category here does not touch a single product.
const TYPE_LABEL_OVERRIDES = {
  ONE_GRAM_GOLD_NECKLACES: "Necklaces",
  PEARL_NECKLACES: "Pearl & Ruby jewellery",
  RUBY_NECKLACES: "Rings",
  EARINGS_JUMKA: "Jhumkas",
  PENDANTS: "More categories",
  FASHION_NECKLACES: "Chains",
  FASHION_EARINGS_JUMKA: "Ear Rings",
  BRACELET_BANGLES: "Bracelets",
};

export const formatTypeLabel = (type) => {
  if (!type) return "";
  if (TYPE_LABEL_OVERRIDES[type]) return TYPE_LABEL_OVERRIDES[type];
  return type
    .replace(/^FASHION_/, "")
    .replaceAll("_", " ");
};
