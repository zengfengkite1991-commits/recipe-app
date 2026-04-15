// 菜品研发记录 - 主应用

import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { storage } from '@/services/storage';
import { importFromJSON, exportAllToJSON } from '@/services/exportService';
import type { Recipe, Category, Unit, AppSettings } from '@/types';

import { HomePage } from '@/components/HomePage';
import { RecipeForm } from '@/components/RecipeForm';
import { RecipeDetail } from '@/components/RecipeDetail';

// 页面状态
type PageState = 'home' | 'create' | 'edit' | 'detail';

function App() {
  // 页面状态
  const [pageState, setPageState] = useState<PageState>('home');
  
  // 数据状态
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  
  // 应用设置
  const [appSettings, setAppSettings] = useState<AppSettings>({ appName: '菜品研发记录' });
  const [showSettings, setShowSettings] = useState(false);
  const [editingAppName, setEditingAppName] = useState('');
  
  // 当前选中的菜谱（用于编辑或查看详情）
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  
  // 加载状态
  const [isLoading, setIsLoading] = useState(true);

  // 初始化数据
  useEffect(() => {
    const init = async () => {
      try {
        await storage.init();
        await storage.initDefaultData();
        await loadAllData();
        // 加载应用设置
        const settings = await storage.getSettings();
        setAppSettings(settings);
      } catch (error) {
        console.error('初始化失败:', error);
        toast.error('初始化失败，请刷新页面重试');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // 加载所有数据
  const loadAllData = async () => {
    try {
      const [loadedRecipes, loadedCategories, loadedUnits] = await Promise.all([
        storage.getAllRecipes(),
        storage.getAllCategories(),
        storage.getAllUnits(),
      ]);
      setRecipes(loadedRecipes);
      setCategories(loadedCategories);
      setUnits(loadedUnits);
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载数据失败');
    }
  };

  // 创建菜谱
  const handleCreateRecipe = () => {
    setCurrentRecipe(null);
    setPageState('create');
  };

  // 保存菜谱
  const handleSaveRecipe = async (recipe: Recipe) => {
    try {
      await storage.saveRecipe(recipe);
      await loadAllData();
      setPageState('home');
      toast.success(recipe.id === currentRecipe?.id ? '菜谱已更新' : '菜谱已创建');
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败，请重试');
    }
  };

  // 进入菜谱详情
  const handleEnterRecipe = (recipe: Recipe) => {
    setCurrentRecipe(recipe);
    setPageState('detail');
  };

  // 编辑菜谱
  const handleEditRecipe = () => {
    setPageState('edit');
  };

  // 删除菜谱
  const handleDeleteRecipe = async () => {
    if (!currentRecipe) return;
    try {
      await storage.deleteRecipe(currentRecipe.id);
      await loadAllData();
      setPageState('home');
      setCurrentRecipe(null);
      toast.success('菜谱已删除');
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('删除失败');
    }
  };

  // 返回主页
  const handleBackToHome = () => {
    setPageState('home');
    setCurrentRecipe(null);
  };

  // 添加分类
  const handleAddCategory = async (name: string) => {
    try {
      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        name,
      };
      await storage.saveCategory(newCategory);
      await loadAllData();
      toast.success('分类已添加');
    } catch (error) {
      toast.error('添加分类失败');
    }
  };

  // 删除分类
  const handleDeleteCategory = async (id: string) => {
    try {
      await storage.deleteCategory(id);
      await loadAllData();
      toast.success('分类已删除');
    } catch (error) {
      toast.error('删除分类失败');
    }
  };

  // 编辑分类
  const handleEditCategory = async (id: string, name: string) => {
    try {
      await storage.saveCategory({ id, name });
      await loadAllData();
      toast.success('分类已更新');
    } catch (error) {
      toast.error('更新分类失败');
    }
  };

  // 添加单位
  const handleAddUnit = async (name: string) => {
    try {
      const newUnit: Unit = {
        id: `unit-${Date.now()}`,
        name,
      };
      await storage.saveUnit(newUnit);
      await loadAllData();
      toast.success('单位已添加');
    } catch (error) {
      toast.error('添加单位失败');
    }
  };

  // 删除单位
  const handleDeleteUnit = async (id: string) => {
    try {
      await storage.deleteUnit(id);
      await loadAllData();
      toast.success('单位已删除');
    } catch (error) {
      toast.error('删除单位失败');
    }
  };

  // 导入数据
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const importedRecipes = await importFromJSON(file);
          for (const recipe of importedRecipes) {
            await storage.saveRecipe({
              ...recipe,
              id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              updatedAt: Date.now(),
            });
          }
          await loadAllData();
          toast.success(`成功导入 ${importedRecipes.length} 个菜谱`);
        } catch (error) {
          toast.error('导入失败，请检查文件格式');
        }
      }
    };
    input.click();
  };

  // 导出所有数据
  const handleExportAll = async () => {
    try {
      await exportAllToJSON(recipes);
      toast.success('导出成功');
    } catch (error) {
      toast.error('导出失败');
    }
  };

  // 打开设置
  const handleOpenSettings = () => {
    setEditingAppName(appSettings.appName);
    setShowSettings(true);
  };

  // 保存设置
  const handleSaveSettings = async () => {
    if (editingAppName.trim()) {
      const newSettings = { appName: editingAppName.trim() };
      try {
        await storage.saveSettings(newSettings);
        setAppSettings(newSettings);
        setShowSettings(false);
        toast.success('应用名称已更新');
      } catch (error) {
        toast.error('保存设置失败');
      }
    }
  };

  // 渲染内容
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>
      );
    }

    switch (pageState) {
      case 'create':
      case 'edit':
        return (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {pageState === 'create' ? '创建菜谱' : '编辑菜谱'}
              </h1>
              <button
                onClick={handleBackToHome}
                className="text-gray-500 hover:text-gray-700"
              >
                取消
              </button>
            </div>
            <RecipeForm
              recipe={currentRecipe}
              categories={categories}
              units={units}
              onSave={handleSaveRecipe}
              onCancel={handleBackToHome}
            />
          </div>
        );

      case 'detail':
        if (!currentRecipe) return null;
        return (
          <div className="max-w-3xl mx-auto">
            <RecipeDetail
              recipe={currentRecipe}
              onBack={handleBackToHome}
              onEdit={handleEditRecipe}
              onDelete={handleDeleteRecipe}
            />
          </div>
        );

      case 'home':
      default:
        return (
          <HomePage
            recipes={recipes}
            categories={categories}
            units={units}
            onCreateRecipe={handleCreateRecipe}
            onEnterRecipe={handleEnterRecipe}
            onImport={handleImport}
            onExportAll={handleExportAll}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onEditCategory={handleEditCategory}
            onAddUnit={handleAddUnit}
            onDeleteUnit={handleDeleteUnit}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🍳</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{appSettings.appName}</h1>
                <p className="text-xs text-gray-500">记录美食创意</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {pageState === 'home' && (
                <button
                  onClick={handleOpenSettings}
                  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  ⚙️ 设置
                </button>
              )}
              {pageState !== 'home' && (
                <button
                  onClick={handleBackToHome}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  返回首页
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {renderContent()}
      </main>

      {/* 底部信息 */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <p className="text-center text-sm text-gray-400">
            {appSettings.appName} - 本地存储，数据安全
          </p>
        </div>
      </footer>

      {/* 设置对话框 */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">应用设置</h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  应用名称
                </label>
                <input
                  type="text"
                  value={editingAppName}
                  onChange={(e) => setEditingAppName(e.target.value)}
                  placeholder="输入应用名称"
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  自定义应用的显示名称
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowSettings(false)}
                className="flex-1 h-10 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleSaveSettings}
                className="flex-1 h-10 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast通知 */}
      <Toaster position="top-center" />
    </div>
  );
}

export default App;
