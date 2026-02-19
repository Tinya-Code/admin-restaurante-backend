export class Category {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  menu_id?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
