// 菜谱卡片组件

import { ChevronRight, Clock, Utensils } from 'lucide-react';
import type { Recipe } from '@/types';

interface RecipeCardProps {
  recipe: Recipe;
  onEnter: () => void;
}

export function RecipeCard({ recipe, onEnter }: RecipeCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* 封面图 */}
      <div className="relative h-40 bg-gray-100">
        {recipe.coverImage ? (
          <img
            src={recipe.coverImage}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Utensils className="w-12 h-12" />
          </div>
        )}
        {/* 分类标签 */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 bg-black/60 text-white text-xs rounded-full">
            {recipe.category}
          </span>
        </div>
      </div>

      {/* 内容 */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 truncate flex-1">
            {recipe.name}
          </h3>
          {/* 进入按钮 */}
          <button
            onClick={onEnter}
            className="ml-2 p-1.5 bg-orange-500 text-white rounded-full hover:bg-orange-600 active:bg-orange-700 transition-colors"
            title="进入菜谱"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 统计信息 */}
        <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Utensils className="w-3.5 h-3.5" />
            {recipe.ingredients.length} 食材
          </span>
          <span className="flex items-center gap-1">
            <span>🧂</span>
            {(recipe.seasonings || []).length} 调料
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {recipe.steps.length} 步骤
          </span>
        </div>

        {/* 更新时间 */}
        <div className="mt-2 text-xs text-gray-400">
          更新于 {new Date(recipe.updatedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
