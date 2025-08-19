// src/interface/book.interface.ts
export interface Author {
  id: number;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  is_leaf?: boolean;
  createdAt?: string;
}

export interface Image {
  base_url: string;
  is_gallery?: boolean;
  label?: string | null;
  large_url?: string;
  medium_url?: string;
  position?: number | null;
  small_url?: string;
  thumbnail_url: string;
}

export interface Seller {
  id: number;
  sku: string;
  name: string;
  link: string;
  logo: string;
  price: number;
  product_id: string;
  store_id: number;
}

export interface Attribute {
  code: string;
  name: string;
  value: string;
}

export interface Specification {
  name: string;
  attributes: Attribute[];
}

// Interface chính cho một cuốn sách, dựa trên dữ liệu thật
export interface Books {
  id: string;
  name: string;
  authors: Author[];
  book_cover?: string | null;
  categories: Category;
  current_seller?: Seller;
  description: string;
  images: Image[];
  list_price: number;
  original_price: number;
  quantity_sold: {
    text: string;
    value: number;
  };
  rating_average: number;
  short_description: string;
  specifications?: Specification[];

  stock_quantity?: number;
}