// 分类管理组件

import { useState } from 'react';
import { Plus, X, Edit2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Category } from '@/types';

interface CategoryManagerProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
  onEditCategory: (id: string, name: string) => void;
}

export function CategoryManager({
  categories,
  selectedCategory,
  onSelectCategory,
  onAddCategory,
  onDeleteCategory,
  onEditCategory,
}: CategoryManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAdd = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName('');
      setIsAdding(false);
    }
  };

  const handleEdit = (id: string) => {
    if (editingName.trim()) {
      onEditCategory(id, editingName.trim());
      setEditingId(null);
      setEditingName('');
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">菜品分类</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
          className="h-8 px-2"
        >
          <Plus className="w-4 h-4 mr-1" />
          添加
        </Button>
      </div>

      {/* 添加新分类 */}
      {isAdding && (
        <div className="flex gap-2">
          <Input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="输入分类名称"
            className="h-9"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button size="sm" onClick={handleAdd} className="h-9 px-3">
            <Check className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* 分类列表 */}
      <div className="flex flex-wrap gap-2">
        {/* 全部 */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
            selectedCategory === null
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          全部
        </button>

        {categories.map((cat) => (
          <div key={cat.id} className="relative group">
            {editingId === cat.id ? (
              <div className="flex gap-1">
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="h-8 w-24 text-sm"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleEdit(cat.id)}
                />
                <Button
                  size="sm"
                  onClick={() => handleEdit(cat.id)}
                  className="h-8 w-8 p-0"
                >
                  <Check className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <button
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors flex items-center gap-1 ${
                  selectedCategory === cat.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name}
                {/* 编辑和删除按钮（悬停显示） */}
                <span className="hidden group-hover:flex items-center gap-0.5 ml-1">
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(cat);
                    }}
                    className="p-0.5 hover:bg-white/20 rounded"
                  >
                    <Edit2 className="w-3 h-3" />
                  </span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`确定删除分类"${cat.name}"吗？`)) {
                        onDeleteCategory(cat.id);
                      }
                    }}
                    className="p-0.5 hover:bg-white/20 rounded"
                  >
                    <X className="w-3 h-3" />
                  </span>
                </span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
