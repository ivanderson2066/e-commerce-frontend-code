export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  category: string;
  stock: number;
  featured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
}

export const categories: Category[] = [
  {
    id: "1",
    name: "Cuidados com a Pele",
    slug: "cuidados-pele",
    image: "/modern-living-room.png",
    description: "Produtos naturais para uma pele radiante.",
  },
  {
    id: "2",
    name: "Cabelos",
    slug: "cabelos",
    image: "/modern-lighting.png",
    description: "Tratamentos naturais para cabelos saudáveis.",
  },
  {
    id: "3",
    name: "Maquiagem",
    slug: "maquiagem",
    image: "/cozy-living-room.png",
    description: "Beleza natural e consciente.",
  },
  {
    id: "4",
    name: "Corpo & Banho",
    slug: "corpo-banho",
    image: "/diverse-textiles.png",
    description: "Cuidados completos para o corpo.",
  },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Sérum Vitamina C Orgânico",
    price: 89.90,
    description: "Sérum facial com vitamina C pura e ácido hialurônico. Ilumina, hidrata e combate os sinais de envelhecimento. Fórmula vegana e cruelty-free.",
    images: [
      "/minimalist-armchair.png",
      "/armchair-detail.jpg",
    ],
    category: "cuidados-pele",
    stock: 15,
    featured: true,
  },
  {
    id: "2",
    name: "Shampoo Sólido de Alecrim",
    price: 42.00,
    description: "Shampoo sólido natural com óleo essencial de alecrim. Estimula o crescimento capilar e fortalece os fios. Zero plástico, 100% natural.",
    images: [
      "/elegant-floor-lamp.png",
      "/lamp-detail.jpg",
    ],
    category: "cabelos",
    stock: 30,
    featured: true,
  },
  {
    id: "3",
    name: "Batom Vegano Nude Rose",
    price: 38.00,
    description: "Batom cremoso com pigmentação intensa e acabamento acetinado. Fórmula enriquecida com manteiga de karité e vitamina E.",
    images: [
      "/ceramic-vase.png",
      "/vase-detail.jpg",
    ],
    category: "maquiagem",
    stock: 25,
    featured: false,
  },
  {
    id: "4",
    name: "Óleo Corporal de Lavanda",
    price: 65.00,
    description: "Óleo corporal hidratante com lavanda francesa. Acalma a pele e proporciona relaxamento profundo. Ideal para massagens.",
    images: [
      "/wool-throw.jpg",
      "/throw-texture.jpg",
    ],
    category: "corpo-banho",
    stock: 20,
    featured: true,
  },
  {
    id: "5",
    name: "Máscara Facial de Argila Verde",
    price: 52.00,
    description: "Máscara purificante com argila verde e extratos botânicos. Remove impurezas, controla oleosidade e minimiza poros.",
    images: [
      "/modern-living-room-coffee-table.png",
      "/wood-texture.png",
    ],
    category: "cuidados-pele",
    stock: 18,
    featured: false,
  },
  {
    id: "6",
    name: "Condicionador Natural de Coco",
    price: 48.00,
    description: "Condicionador cremoso com óleo de coco e proteínas vegetais. Nutre profundamente e desembaraça sem pesar.",
    images: [
      "/elegant-pendant-light.png",
      "/glowing-light-bulb.png",
    ],
    category: "cabelos",
    stock: 22,
    featured: false,
  },
  {
    id: "7",
    name: "Blush Mineral Natural",
    price: 45.00,
    description: "Blush em pó mineral com pigmentos naturais. Proporciona um rubor saudável e natural. Livre de parabenos e talco.",
    images: [
      "/minimalist-interior.png",
      "/cozy-living-room.png",
    ],
    category: "maquiagem",
    stock: 28,
    featured: true,
  },
  {
    id: "8",
    name: "Sabonete Artesanal de Mel",
    price: 28.00,
    description: "Sabonete artesanal com mel orgânico e aveia. Limpa suavemente enquanto hidrata e acalma a pele sensível.",
    images: [
      "/diverse-textiles.png",
      "/throw-texture.jpg",
    ],
    category: "corpo-banho",
    stock: 40,
    featured: false,
  },
];
