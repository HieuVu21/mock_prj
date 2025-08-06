export interface Books {
  id: string;
  name: string;
  book_cover: string | null;
  images: Array<{
    base_url: string;
    is_gallery: boolean;
    label: string | null;
    large_url: string;
    medium_url: string;
    position: number | null;
    small_url: string;
    thumbnail_url: string;
  }>;
  list_price: number;
  original_price: number;
  description: string ;
  short_description: string | null;
  rating_average: number;
  quantity_sold: {
    text: string;
    value: number;
  };
  authors: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  categories: {
    id: number;
    name: string;
    is_leaf: boolean;
  };
  current_seller: {
    id: number;
    sku: string;
    name: string;
    link: string;
    logo: string;
    price: number;
    product_id: string;
    store_id: number;
    is_best_store: boolean;
    is_offline_installment_supported: boolean | null;
  };
  specifications?: Array<{
    name: string;
    attributes: Array<{
      code: string;
      name: string;
      value: string;
    }>;
  }>;
}