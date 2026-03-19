export const mockCards = [
  {
    id: 1,
    name: "Charizard ex",
    set: ["Obsidian Flames", "Paldean Fates"],
    type: "Pokémon",
    stock: 2,
    imageUrl: "https://images.pokemontcg.io/sv3/125_hires.png",
    playability: 5
  },
  {
    id: 2,
    name: "Iono",
    set: ["Paldea Evolved", "Shiny Treasure ex"],
    type: "Supporter",
    stock: 12,
    imageUrl: "https://images.pokemontcg.io/sv2/185_hires.png",
    playability: 5
  },
  {
    id: 3,
    name: "Rare Candy",
    set: ["Scarlet & Violet", "Pokémon GO"],
    type: "Item",
    stock: 20,
    imageUrl: "https://images.pokemontcg.io/sv1/191_hires.png",
    playability: 4
  },
  {
    id: 4,
    name: "Arven",
    set: ["Scarlet & Violet", "Obsidian Flames"],
    type: "Supporter",
    stock: 8,
    imageUrl: "https://images.pokemontcg.io/sv1/166_hires.png",
    playability: 5
  },
  {
    id: 5,
    name: "Nest Ball",
    set: ["Scarlet & Violet", "Sun & Moon"],
    type: "Item",
    stock: 15,
    imageUrl: "https://images.pokemontcg.io/sv1/181_hires.png",
    playability: 5
  },
  {
    id: 6,
    name: "Artazon",
    set: ["Paldea Evolved"],
    type: "Stadium",
    stock: 6,
    imageUrl: "https://images.pokemontcg.io/sv2/171_hires.png",
    playability: 3
  },
  {
    id: 7,
    name: "Super Rod",
    set: ["Paldea Evolved", "Neo Genesis"],
    type: "Item",
    stock: 4,
    imageUrl: "https://images.pokemontcg.io/sv2/188_hires.png",
    playability: 4
  },
  {
    id: 8,
    name: "Gardevoir ex",
    set: ["Scarlet & Violet"],
    type: "Pokémon",
    stock: 3,
    imageUrl: "https://images.pokemontcg.io/sv1/86_hires.png",
    playability: 4
  }
];

export const mockOrders = [
  { id: "ORD-001", user: "Niels Van der planken", items: ["Iono x2", "Nest Ball x4"], status: "Pending" },
  { id: "ORD-002", user: "Ash Ketchum", items: ["Charizard ex x1"], status: "Completed" },
  { id: "ORD-003", user: "Misty Waterflower", items: ["Super Rod x2", "Rare Candy x4"], status: "Processing" }
];

export const mockPlayers = [
  { id: "P-001", name: "Niels Van der planken", email: "niels@example.com", status: "Active" },
  { id: "P-002", name: "Ash Ketchum", email: "ash@pallet.com", status: "Active" },
  { id: "P-003", name: "Brock Harrison", email: "brock@pewter.com", status: "Waitlist" },
  { id: "P-004", name: "Misty Waterflower", email: "misty@cerulean.com", status: "Active" }
];
