// 菜品研发记录 - 类型定义

// 食材
export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
}

// 调料
export interface Seasoning {
  id: string;
  name: string;
  amount: string;
  unit: string;
}

// 制作步骤
export interface Step {
  id: string;
  order: number;
  description: string;
  image?: string; // base64图片
}

// 应用设置
export interface AppSettings {
  appName: string;
}

// 菜谱
export interface Recipe {
  id: string;
  name: string;
  category: string;
  coverImage?: string; // base64封面图
  ingredients: Ingredient[];
  seasonings: Seasoning[];
  steps: Step[];
  createdAt: number;
  updatedAt: number;
}

// 分类
export interface Category {
  id: string;
  name: string;
}

// 单位
export interface Unit {
  id: string;
  name: string;
}

// 应用状态
export interface AppState {
  recipes: Recipe[];
  categories: Category[];
  units: Unit[];
}

// 导出格式
export type ExportFormat = 'json' | 'xlsx' | 'pdf';
