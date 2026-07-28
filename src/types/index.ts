export type Locale = "en" | "es";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number | null;
  sku: string;
  material?: string | null;
  images: { url: string; altText?: string | null }[];
  collection?: { name: string; slug: string } | null;
  status: "DRAFT" | "ACTIVE" | "HIDDEN" | "ARCHIVED" | "SOLD_OUT";
  featured: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface CartLine {
  productId: string;
  variantId?: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
}

export interface AiChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface AiRecommendation {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  reason: string;
}

export type GiftRecipient =
  | "girlfriend"
  | "mother"
  | "friend"
  | "wife"
  | "daughter"
  | "myself";

export interface AdminRole {
  id: string;
  name:
    | "Owner"
    | "Administrator"
    | "Manager"
    | "Inventory Manager"
    | "Customer Support"
    | "Marketing"
    | "Content Editor"
    | "Analytics Viewer";
  permissions: string[];
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  total: number;
  createdAt: string;
}
