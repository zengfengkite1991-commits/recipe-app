// 主页组件

import { useState, useMemo } from 'react';
import { Plus, Search, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RecipeCard } from './RecipeCard';
import { CategoryManager } from './CategoryManager';
import type { Recipe, Category, Unit } from '@/types';

interface HomePageProps {
  recipes: Recipe[];
  categories: Category[];
  units: Unit[];
  onCreateRecipe: () => void;
  onEnterRecipe: (recipe: Recipe) => void;
  onImport: () => void;
  onExportAll: () => void;
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
  onEditCategory: (id: string, name: string) => void;
  onAddUnit: (name: string) => void;
  onDeleteUnit: (id: string) => void;
}

export function HomePage({
  recipes,
  categories,
  units,
  onCreateRecipe,
  onEnterRecipe,
  onImport,
  onExportAll,
  onAddCategory,
  onDeleteCategory,
  onEditCategory,
  onAddUnit,
  onDeleteUnit,
}: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showUnitManager, setShowUnitManager] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');

  // 过滤菜谱
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      // 分类过滤
      if (selectedCategory && recipe.category !== categories.find(c => c.id === selectedCategory)?.name) {
        return false;
      }
      // 搜索过滤
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          recipe.name.toLowerCase().includes(query) ||
          recipe.ingredients.some((ing) =>
            ing.name.toLowerCase().includes(query)
          )
        );
      }
      return true;
    });
  }, [recipes, selectedCategory, categories, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">我的菜谱</h1>
          <p className="text-sm text-gray-500 mt-1">
            共 {recipes.length} 道菜谱
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onImport}>
            <Upload className="w-4 h-4 mr-1" />
            导入
          </Button>
          <Button variant="outline" size="sm" onClick={onExportAll}>
            <Download className="w-4 h-4 mr-1" />
            导出
          </Button>
          <Button onClick={onCreateRecipe} className="bg-orange-500 hover:bg-orange-600">
            <Plus className="w-4 h-4 mr-1" />
            创建菜谱
          </Button>
        </div>
      </div>

      {/* 搜索 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索菜谱或食材..."
          className="pl-10"
        />
      </div>

      {/* 分类和单位管理 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <CategoryManager
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onAddCategory={onAddCategory}
            onDeleteCategory={onDeleteCategory}
            onEditCategory={onEditCategory}
          />
        </div>
        
        {/* 单位管理按钮 */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={() => setShowUnitManager(!showUnitManager)}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
          >
            ⚖️ 管理单位 ({units.length}个)
            <span className="text-xs text-gray-400 ml-1">
              {showUnitManager ? '▲' : '▼'}
            </span>
          </button>
          
          {/* 单位管理面板 */}
          {showUnitManager && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              {/* 添加新单位 */}
              <div className="flex gap-2 mb-3">
                <Input
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  placeholder="输入新单位名称"
                  className="h-9 flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newUnitName.trim()) {
                      onAddUnit(newUnitName.trim());
                      setNewUnitName('');
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={() => {
                    if (newUnitName.trim()) {
                      onAddUnit(newUnitName.trim());
                      setNewUnitName('');
                    }
                  }}
                  className="h-9 px-3"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {/* 单位列表 */}
              <div className="flex flex-wrap gap-2">
                {units.map((unit) => (
                  <span
                    key={unit.id}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded text-sm"
                  >
                    {unit.name}
                    <button
                      onClick={() => {
                        if (confirm(`确定删除单位"${unit.name}"吗？`)) {
                          onDeleteUnit(unit.id);
                        }
                      }}
                      className="text-gray-400 hover:text-red-500 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 菜谱列表 */}
      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onEnter={() => onEnterRecipe(recipe)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || selectedCategory ? '没有找到匹配的菜谱' : '还没有菜谱'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || selectedCategory
              ? '尝试调整搜索条件或分类'
              : '点击"创建菜谱"开始记录你的美食创作'}
          </p>
          {!searchQuery && !selectedCategory && (
            <Button onClick={onCreateRecipe} className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-1" />
              创建第一个菜谱
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
