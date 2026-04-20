// 菜谱详情组件

import { useState } from 'react';
import { ArrowLeft, Share2, FileSpreadsheet, FileText, FileJson, Edit2, Trash2, Utensils, Clock, X, DollarSign, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Recipe, ExportFormat } from '@/types';
import { exportRecipeToPDF, exportRecipeToXLSX, exportAllToJSON, shareRecipe } from '@/services/exportService';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function RecipeDetail({ recipe, onBack, onEdit, onDelete }: RecipeDetailProps) {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedFormats, setSelectedFormats] = useState<ExportFormat[]>([]);

  // 计算成本
  const ingredientCost = recipe.ingredients.reduce((sum, ing) => sum + (parseFloat(ing.cost || '0') || 0), 0);
  const seasoningCost = (recipe.seasonings || []).reduce((sum, sea) => sum + (parseFloat(sea.cost || '0') || 0), 0);
  const totalCost = ingredientCost + seasoningCost;

  // 切换导出格式选择
  const toggleFormat = (format: ExportFormat) => {
    setSelectedFormats(prev => 
      prev.includes(format) 
        ? prev.filter(f => f !== format)
        : [...prev, format]
    );
  };

  // 执行导出
  const handleExport = async () => {
    if (selectedFormats.length === 0) {
      alert('请至少选择一种导出格式');
      return;
    }

    for (const format of selectedFormats) {
      try {
        switch (format) {
          case 'pdf':
            await exportRecipeToPDF(recipe);
            break;
          case 'xlsx':
            await exportRecipeToXLSX(recipe);
            break;
          case 'json':
            await exportAllToJSON([recipe]);
            break;
        }
      } catch (error) {
        console.error(`导出${format}失败:`, error);
      }
    }
    
    setShowExportDialog(false);
    setSelectedFormats([]);
  };

  // 分享
  const handleShare = async () => {
    try {
      await shareRecipe(recipe);
    } catch (error) {
      alert('分享失败');
    }
  };

  // 删除确认
  const handleDelete = () => {
    if (confirm(`确定删除菜谱"${recipe.name}"吗？此操作不可恢复。`)) {
      onDelete();
    }
  };

  return (
    <div className="space-y-6">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="pl-0">
          <ArrowLeft className="w-5 h-5 mr-1" />
          返回
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-1" />
            分享
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit2 className="w-4 h-4 mr-1" />
            编辑
          </Button>
          <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-500 hover:text-red-600">
            <Trash2 className="w-4 h-4 mr-1" />
            删除
          </Button>
        </div>
      </div>

      {/* 封面和基本信息 */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
        {recipe.coverImage && (
          <div className="w-full h-56 sm:h-72">
            <img
              src={recipe.coverImage}
              alt={recipe.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full mb-2">
                {recipe.category}
              </span>
              <h1 className="text-2xl font-bold text-gray-900">{recipe.name}</h1>
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Utensils className="w-4 h-4" />
              {recipe.ingredients.length} 种食材
            </span>
            <span className="flex items-center gap-1">
              <span className="text-gray-400">🧂</span>
              {(recipe.seasonings || []).length} 种调料
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {recipe.steps.length} 个步骤
            </span>
            <span>
              更新于 {new Date(recipe.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* 食材 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">食材</h2>
        {recipe.ingredients.length > 0 ? (
          <div className="space-y-3">
            {recipe.ingredients.map((ing) => (
              <div
                key={ing.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="font-medium text-gray-800">{ing.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">
                    {ing.amount && `${ing.amount} `}
                    <span className="text-gray-400">{ing.unit}</span>
                  </span>
                  {ing.cost && (
                    <span className="text-orange-600 font-medium">¥{ing.cost}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">暂无食材信息</p>
        )}
      </div>

      {/* 调料 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">调料</h2>
        {(recipe.seasonings || []).length > 0 ? (
          <div className="space-y-3">
            {recipe.seasonings!.map((sea) => (
              <div
                key={sea.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="font-medium text-gray-800">{sea.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">
                    {sea.amount && `${sea.amount} `}
                    <span className="text-gray-400">{sea.unit}</span>
                  </span>
                  {sea.cost && (
                    <span className="text-orange-600 font-medium">¥{sea.cost}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">暂无调料信息</p>
        )}
      </div>

      {/* 制作步骤 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">制作步骤</h2>
        {recipe.steps.length > 0 ? (
          <div className="space-y-6">
            {recipe.steps.map((step) => (
              <div key={step.id} className="flex gap-4">
                <div className="flex-shrink-0">
                  <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-medium">
                    {step.order}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 leading-relaxed">{step.description}</p>
                  {step.image && (
                    <div className="mt-3">
                      <img
                        src={step.image}
                        alt={`步骤${step.order}`}
                        className="w-full max-w-md rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">暂无步骤信息</p>
        )}
      </div>

      {/* 成本汇总 */}
      {(ingredientCost > 0 || seasoningCost > 0) && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-orange-500" />
            成本核算
          </h2>
          <div className="space-y-3">
            {ingredientCost > 0 && (
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">食材成本</span>
                <span className="font-semibold">¥{ingredientCost.toFixed(2)}</span>
              </div>
            )}
            {seasoningCost > 0 && (
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">调料成本</span>
                <span className="font-semibold">¥{seasoningCost.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <span className="font-semibold text-gray-900">总成本</span>
              <span className="text-xl font-bold text-orange-600">¥{totalCost.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 研发思路 */}
      {recipe.developmentNotes && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            研发思路
          </h2>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {recipe.developmentNotes}
            </p>
          </div>
        </div>
      )}

      {/* 导出选项 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">导出菜谱</h2>
        <Button onClick={() => setShowExportDialog(true)} className="w-full bg-orange-500 hover:bg-orange-600">
          选择导出格式
        </Button>
      </div>

      {/* 导出格式选择对话框 */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">选择导出格式</h3>
              <button 
                onClick={() => {
                  setShowExportDialog(false);
                  setSelectedFormats([]);
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3 mb-6">
              <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                selectedFormats.includes('json') ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="checkbox"
                  checked={selectedFormats.includes('json')}
                  onChange={() => toggleFormat('json')}
                  className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                />
                <FileJson className="w-6 h-6 text-blue-500" />
                <div className="flex-1">
                  <span className="font-medium">源文件 (JSON)</span>
                  <p className="text-sm text-gray-500">用于备份和恢复数据</p>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                selectedFormats.includes('xlsx') ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="checkbox"
                  checked={selectedFormats.includes('xlsx')}
                  onChange={() => toggleFormat('xlsx')}
                  className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                />
                <FileSpreadsheet className="w-6 h-6 text-green-500" />
                <div className="flex-1">
                  <span className="font-medium">表格 (XLSX)</span>
                  <p className="text-sm text-gray-500">Excel格式，便于编辑和打印</p>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                selectedFormats.includes('pdf') ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="checkbox"
                  checked={selectedFormats.includes('pdf')}
                  onChange={() => toggleFormat('pdf')}
                  className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                />
                <FileText className="w-6 h-6 text-red-500" />
                <div className="flex-1">
                  <span className="font-medium">PDF文档</span>
                  <p className="text-sm text-gray-500">高清图片，适合分享和存档</p>
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowExportDialog(false);
                  setSelectedFormats([]);
                }}
                className="flex-1"
              >
                取消
              </Button>
              <Button 
                onClick={handleExport}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                导出 ({selectedFormats.length})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
