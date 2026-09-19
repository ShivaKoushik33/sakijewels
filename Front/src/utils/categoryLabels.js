// How category types are named on screen. The stored values never change —
// renaming a category here does not touch a single product.
const TYPE_LABEL_OVERRIDES = {
  EARINGS_JUMKA: "Ear Rings",
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
