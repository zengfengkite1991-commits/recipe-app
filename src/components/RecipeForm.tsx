// 菜谱表单组件

import { useState, useRef } from 'react';
import { Plus, X, Camera, ImageIcon, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Recipe, Ingredient, Seasoning, Step, Category, Unit } from '@/types';
import { compressCoverImage, compressStepImage } from '@/services/imageCompression';

interface RecipeFormProps {
  recipe?: Recipe | null;
  categories: Category[];
  units: Unit[];
  onSave: (recipe: Recipe) => void;
  onCancel: () => void;
}

export function RecipeForm({ recipe, categories, units, onSave, onCancel }: RecipeFormProps) {
  // 基础信息
  const [name, setName] = useState(recipe?.name || '');
  const [category, setCategory] = useState(recipe?.category || (categories[0]?.name ?? ''));
  const [coverImage, setCoverImage] = useState(recipe?.coverImage || '');

  // 食材
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe?.ingredients || []
  );

  // 调料
  const [seasonings, setSeasonings] = useState<Seasoning[]>(
    recipe?.seasonings || []
  );

  // 步骤
  const [steps, setSteps] = useState<Step[]>(
    recipe?.steps || []
  );

  // 新食材输入
  const [newIngredient, setNewIngredient] = useState({ name: '', amount: '', unit: units[0]?.name ?? '克', cost: '' });

  // 新调料输入
  const [newSeasoning, setNewSeasoning] = useState({ name: '', amount: '', unit: units[0]?.name ?? '克', cost: '' });

  // 新步骤输入
  const [newStep, setNewStep] = useState({ description: '', image: '' });

  // 研发思路
  const [developmentNotes, setDevelopmentNotes] = useState(recipe?.developmentNotes || '');

  // 文件输入引用
  const coverInputRef = useRef<HTMLInputElement>(null);
  const stepInputRef = useRef<HTMLInputElement>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);

  // 处理封面图片上传
  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressCoverImage(file);
        setCoverImage(compressed);
      } catch (error) {
        alert('图片上传失败，请重试');
      }
    }
  };

  // 处理步骤图片上传
  const handleStepImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentStepIndex !== null) {
      try {
        const compressed = await compressStepImage(file);
        if (currentStepIndex === -1) {
          // 新步骤
          setNewStep({ ...newStep, image: compressed });
        } else {
          // 编辑现有步骤
          const updatedSteps = [...steps];
          updatedSteps[currentStepIndex].image = compressed;
          setSteps(updatedSteps);
        }
      } catch (error) {
        alert('图片上传失败，请重试');
      }
    }
  };

  // 计算总成本
  const totalCost = [...ingredients, ...seasonings].reduce((sum, item) => {
    const cost = parseFloat(item.cost || '0');
    return sum + (isNaN(cost) ? 0 : cost);
  }, 0);

  // 添加食材
  const addIngredient = () => {
    if (newIngredient.name.trim()) {
      setIngredients([
        ...ingredients,
        {
          id: Date.now().toString(),
          name: newIngredient.name.trim(),
          amount: newIngredient.amount.trim(),
          unit: newIngredient.unit,
          cost: newIngredient.cost.trim(),
        },
      ]);
      setNewIngredient({ name: '', amount: '', unit: units[0]?.name ?? '克', cost: '' });
    }
  };

  // 删除食材
  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter((ing) => ing.id !== id));
  };

  // 添加调料
  const addSeasoning = () => {
    if (newSeasoning.name.trim()) {
      setSeasonings([
        ...seasonings,
        {
          id: Date.now().toString(),
          name: newSeasoning.name.trim(),
          amount: newSeasoning.amount.trim(),
          unit: newSeasoning.unit,
          cost: newSeasoning.cost.trim(),
        },
      ]);
      setNewSeasoning({ name: '', amount: '', unit: units[0]?.name ?? '克', cost: '' });
    }
  };

  // 删除调料
  const removeSeasoning = (id: string) => {
    setSeasonings(seasonings.filter((sea) => sea.id !== id));
  };

  // 添加步骤
  const addStep = () => {
    if (newStep.description.trim()) {
      setSteps([
        ...steps,
        {
          id: Date.now().toString(),
          order: steps.length + 1,
          description: newStep.description.trim(),
          image: newStep.image || undefined,
        },
      ]);
      setNewStep({ description: '', image: '' });
    }
  };

  // 删除步骤
  const removeStep = (id: string) => {
    const filtered = steps.filter((s) => s.id !== id);
    // 重新排序
    const reordered = filtered.map((s, idx) => ({ ...s, order: idx + 1 }));
    setSteps(reordered);
  };

  // 移动步骤
  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newSteps = [...steps];
      [newSteps[index], newSteps[index - 1]] = [newSteps[index - 1], newSteps[index]];
      newSteps.forEach((s, idx) => (s.order = idx + 1));
      setSteps(newSteps);
    } else if (direction === 'down' && index < steps.length - 1) {
      const newSteps = [...steps];
      [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
      newSteps.forEach((s, idx) => (s.order = idx + 1));
      setSteps(newSteps);
    }
  };

  // 保存菜谱
  const handleSave = () => {
    if (!name.trim()) {
      alert('请输入菜谱名称');
      return;
    }

    const now = Date.now();
    const savedRecipe: Recipe = {
      id: recipe?.id || Date.now().toString(),
      name: name.trim(),
      category,
      coverImage: coverImage || undefined,
      ingredients,
      seasonings,
      steps,
      developmentNotes: developmentNotes.trim() || undefined,
      createdAt: recipe?.createdAt || now,
      updatedAt: now,
    };

    onSave(savedRecipe);
  };

  return (
    <div className="space-y-8">
      {/* 第一部分：基础信息 */}
      <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">基础信息</h2>
        
        <div className="space-y-4">
          {/* 菜名 */}
          <div>
            <Label htmlFor="recipe-name">菜谱名称</Label>
            <Input
              id="recipe-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入菜谱名称"
              className="mt-1"
            />
          </div>

          {/* 分类 */}
          <div>
            <Label htmlFor="recipe-category">分类</Label>
            <select
              id="recipe-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* 封面图片 */}
          <div>
            <Label>封面图片</Label>
            <div className="mt-2">
              {coverImage ? (
                <div className="relative inline-block">
                  <img
                    src={coverImage}
                    alt="封面"
                    className="w-48 h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setCoverImage('')}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => coverInputRef.current?.click()}
                  className="w-48 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-orange-500 hover:text-orange-500 transition-colors"
                >
                  <Camera className="w-8 h-8 mb-2" />
                  <span className="text-sm">点击上传封面</span>
                </button>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverImageUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 第二部分：食材 */}
      <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">食材</h2>

        {/* 食材列表 */}
        <div className="space-y-2 mb-4">
          {ingredients.map((ing) => (
            <div
              key={ing.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <GripVertical className="w-4 h-4 text-gray-400" />
              <span className="flex-1 font-medium">{ing.name}</span>
              <span className="text-gray-600">
                {ing.amount && `${ing.amount} `}{ing.unit}
              </span>
              {ing.cost && (
                <span className="text-orange-600 font-medium">
                  ¥{ing.cost}
                </span>
              )}
              <button
                onClick={() => removeIngredient(ing.id)}
                className="p-1 text-red-500 hover:bg-red-50 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* 添加食材 */}
        <div className="flex gap-2">
          <Input
            value={newIngredient.name}
            onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
            placeholder="食材名称"
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
          />
          <Input
            value={newIngredient.amount}
            onChange={(e) => setNewIngredient({ ...newIngredient, amount: e.target.value })}
            placeholder="份量"
            className="w-16"
            onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
          />
          <div className="relative w-24">
            <Input
              value={newIngredient.unit}
              onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
              placeholder="单位"
              className="w-full pr-8"
              onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
            />
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  setNewIngredient({ ...newIngredient, unit: e.target.value });
                }
              }}
              className="absolute right-0 top-0 h-10 w-8 px-1 border border-l-0 border-gray-300 rounded-r-lg text-sm bg-gray-50 cursor-pointer"
              title="选择常用单位"
            >
              <option value="">▼</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.name}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            value={newIngredient.cost}
            onChange={(e) => setNewIngredient({ ...newIngredient, cost: e.target.value })}
            placeholder="成本¥"
            className="w-20"
            type="number"
            min="0"
            step="0.01"
            onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
          />
          <Button onClick={addIngredient} className="px-3">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* 第三部分：调料 */}
      <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">调料</h2>

        {/* 调料列表 */}
        <div className="space-y-2 mb-4">
          {seasonings.map((sea) => (
            <div
              key={sea.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <GripVertical className="w-4 h-4 text-gray-400" />
              <span className="flex-1 font-medium">{sea.name}</span>
              <span className="text-gray-600">
                {sea.amount && `${sea.amount} `}{sea.unit}
              </span>
              {sea.cost && (
                <span className="text-orange-600 font-medium">
                  ¥{sea.cost}
                </span>
              )}
              <button
                onClick={() => removeSeasoning(sea.id)}
                className="p-1 text-red-500 hover:bg-red-50 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* 添加调料 */}
        <div className="flex gap-2">
          <Input
            value={newSeasoning.name}
            onChange={(e) => setNewSeasoning({ ...newSeasoning, name: e.target.value })}
            placeholder="调料名称"
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && addSeasoning()}
          />
          <Input
            value={newSeasoning.amount}
            onChange={(e) => setNewSeasoning({ ...newSeasoning, amount: e.target.value })}
            placeholder="份量"
            className="w-16"
            onKeyDown={(e) => e.key === 'Enter' && addSeasoning()}
          />
          <div className="relative w-24">
            <Input
              value={newSeasoning.unit}
              onChange={(e) => setNewSeasoning({ ...newSeasoning, unit: e.target.value })}
              placeholder="单位"
              className="w-full pr-8"
              onKeyDown={(e) => e.key === 'Enter' && addSeasoning()}
            />
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  setNewSeasoning({ ...newSeasoning, unit: e.target.value });
                }
              }}
              className="absolute right-0 top-0 h-10 w-8 px-1 border border-l-0 border-gray-300 rounded-r-lg text-sm bg-gray-50 cursor-pointer"
              title="选择常用单位"
            >
              <option value="">▼</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.name}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            value={newSeasoning.cost}
            onChange={(e) => setNewSeasoning({ ...newSeasoning, cost: e.target.value })}
            placeholder="成本¥"
            className="w-20"
            type="number"
            min="0"
            step="0.01"
            onKeyDown={(e) => e.key === 'Enter' && addSeasoning()}
          />
          <Button onClick={addSeasoning} className="px-3">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* 第三部分：制作步骤 */}
      <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">制作步骤</h2>

        {/* 步骤列表 */}
        <div className="space-y-4 mb-6">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-start gap-3">
                {/* 排序控制 */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveStep(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {step.order}
                  </span>
                  <button
                    onClick={() => moveStep(index, 'down')}
                    disabled={index === steps.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* 内容 */}
                <div className="flex-1">
                  <p className="text-gray-800 mb-3">{step.description}</p>
                  {step.image && (
                    <img
                      src={step.image}
                      alt={`步骤${step.order}`}
                      className="w-32 h-24 object-cover rounded-lg"
                    />
                  )}
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setCurrentStepIndex(index);
                      stepInputRef.current?.click();
                    }}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeStep(step.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 添加新步骤 */}
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">添加新步骤</h3>
          <div className="space-y-3">
            <Textarea
              value={newStep.description}
              onChange={(e) => setNewStep({ ...newStep, description: e.target.value })}
              placeholder="描述这个步骤的操作..."
              rows={3}
            />
            
            {/* 步骤图片 */}
            <div className="flex items-center gap-3">
              {newStep.image ? (
                <div className="relative inline-block">
                  <img
                    src={newStep.image}
                    alt="步骤图"
                    className="w-24 h-16 object-cover rounded"
                  />
                  <button
                    onClick={() => setNewStep({ ...newStep, image: '' })}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setCurrentStepIndex(-1);
                    stepInputRef.current?.click();
                  }}
                  className="w-24 h-16 border border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 hover:border-orange-500 hover:text-orange-500"
                >
                  <Camera className="w-5 h-5" />
                  <span className="text-xs mt-1">添加图片</span>
                </button>
              )}
              
              <Button onClick={addStep} className="ml-auto">
                <Plus className="w-4 h-4 mr-1" />
                添加步骤
              </Button>
            </div>
          </div>
        </div>

        <input
          ref={stepInputRef}
          type="file"
          accept="image/*"
          onChange={handleStepImageUpload}
          className="hidden"
        />
      </section>

      {/* 成本汇总 */}
      {(ingredients.length > 0 || seasonings.length > 0) && (
        <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">成本核算</h2>
          <div className="space-y-3">
            {ingredients.length > 0 && (
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">食材成本</span>
                <span className="font-semibold text-gray-900">
                  ¥{ingredients.reduce((sum, ing) => sum + (parseFloat(ing.cost || '0') || 0), 0).toFixed(2)}
                </span>
              </div>
            )}
            {seasonings.length > 0 && (
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">调料成本</span>
                <span className="font-semibold text-gray-900">
                  ¥{seasonings.reduce((sum, sea) => sum + (parseFloat(sea.cost || '0') || 0), 0).toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <span className="font-semibold text-gray-900">总成本</span>
              <span className="text-xl font-bold text-orange-600">
                ¥{totalCost.toFixed(2)}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* 研发思路 */}
      <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">研发思路</h2>
        <Textarea
          value={developmentNotes}
          onChange={(e) => setDevelopmentNotes(e.target.value)}
          placeholder="记录这道菜的研发过程、灵感来源、改进方向..."
          rows={6}
          className="w-full"
        />
        <p className="mt-2 text-xs text-gray-400">
          提示：可记录创意灵感、试做心得、改进计划等
        </p>
      </section>

      {/* 底部按钮 */}
      <div className="flex gap-4 pt-4 pb-8">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          取消
        </Button>
        <Button onClick={handleSave} className="flex-1 bg-orange-500 hover:bg-orange-600">
          保存菜谱
        </Button>
      </div>
    </div>
  );
}
