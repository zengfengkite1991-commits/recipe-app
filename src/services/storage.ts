// 本地存储服务 - IndexedDB

import type { Recipe, Category, Unit, AppSettings } from '@/types';

const DB_NAME = 'RecipeDB';
const DB_VERSION = 2; // 升级版本以支持新存储

class StorageService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 菜谱存储
        if (!db.objectStoreNames.contains('recipes')) {
          const recipeStore = db.createObjectStore('recipes', { keyPath: 'id' });
          recipeStore.createIndex('category', 'category', { unique: false });
        }

        // 分类存储
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }

        // 单位存储
        if (!db.objectStoreNames.contains('units')) {
          db.createObjectStore('units', { keyPath: 'id' });
        }

        // 设置存储 (v2新增)
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  // 菜谱操作
  async getAllRecipes(): Promise<Recipe[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['recipes'], 'readonly');
      const store = transaction.objectStore('recipes');
      const request = store.getAll();

      request.onsuccess = () => {
        const recipes = request.result as Recipe[];
        resolve(recipes.sort((a, b) => b.updatedAt - a.updatedAt));
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getRecipeById(id: string): Promise<Recipe | null> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['recipes'], 'readonly');
      const store = transaction.objectStore('recipes');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async saveRecipe(recipe: Recipe): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['recipes'], 'readwrite');
      const store = transaction.objectStore('recipes');
      const request = store.put(recipe);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteRecipe(id: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['recipes'], 'readwrite');
      const store = transaction.objectStore('recipes');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 分类操作
  async getAllCategories(): Promise<Category[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['categories'], 'readonly');
      const store = transaction.objectStore('categories');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result as Category[]);
      request.onerror = () => reject(request.error);
    });
  }

  async saveCategory(category: Category): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['categories'], 'readwrite');
      const store = transaction.objectStore('categories');
      const request = store.put(category);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteCategory(id: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['categories'], 'readwrite');
      const store = transaction.objectStore('categories');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 单位操作
  async getAllUnits(): Promise<Unit[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['units'], 'readonly');
      const store = transaction.objectStore('units');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result as Unit[]);
      request.onerror = () => reject(request.error);
    });
  }

  async saveUnit(unit: Unit): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['units'], 'readwrite');
      const store = transaction.objectStore('units');
      const request = store.put(unit);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteUnit(id: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['units'], 'readwrite');
      const store = transaction.objectStore('units');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 初始化默认数据
  async initDefaultData(): Promise<void> {
    const categories = await this.getAllCategories();
    if (categories.length === 0) {
      const defaultCategories: Category[] = [
        { id: 'cat-1', name: '饭类' },
        { id: 'cat-2', name: '粉类' },
        { id: 'cat-3', name: '小食' },
        { id: 'cat-4', name: '主菜' },
        { id: 'cat-5', name: '冷食' },
      ];
      for (const cat of defaultCategories) {
        await this.saveCategory(cat);
      }
    }

    const units = await this.getAllUnits();
    if (units.length === 0) {
      const defaultUnits: Unit[] = [
        { id: 'unit-1', name: '克' },
        { id: 'unit-2', name: '千克' },
        { id: 'unit-3', name: '毫升' },
        { id: 'unit-4', name: '升' },
        { id: 'unit-5', name: '个' },
        { id: 'unit-6', name: '勺' },
        { id: 'unit-7', name: '适量' },
        { id: 'unit-8', name: '少许' },
      ];
      for (const unit of defaultUnits) {
        await this.saveUnit(unit);
      }
    }
  }

  // 导出所有数据
  async exportAllData(): Promise<{ recipes: Recipe[]; categories: Category[]; units: Unit[] }> {
    const [recipes, categories, units] = await Promise.all([
      this.getAllRecipes(),
      this.getAllCategories(),
      this.getAllUnits(),
    ]);
    return { recipes, categories, units };
  }

  // 导入数据
  async importData(data: { recipes?: Recipe[]; categories?: Category[]; units?: Unit[] }): Promise<void> {
    if (data.categories) {
      for (const cat of data.categories) {
        await this.saveCategory(cat);
      }
    }
    if (data.units) {
      for (const unit of data.units) {
        await this.saveUnit(unit);
      }
    }
    if (data.recipes) {
      for (const recipe of data.recipes) {
        await this.saveRecipe(recipe);
      }
    }
  }

  // 清空所有数据
  async clearAllData(): Promise<void> {
    if (!this.db) await this.init();
    const transaction = this.db!.transaction(['recipes', 'categories', 'units'], 'readwrite');
    transaction.objectStore('recipes').clear();
    transaction.objectStore('categories').clear();
    transaction.objectStore('units').clear();
  }

  // 设置操作
  async getSettings(): Promise<AppSettings> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get('app');

      request.onsuccess = () => {
        const settings = request.result as AppSettings | undefined;
        resolve(settings || { appName: '菜品研发记录' });
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.put({ ...settings, key: 'app' });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const storage = new StorageService();
