// 单位管理组件

import { useState } from 'react';
import { Plus, X, Edit2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Unit } from '@/types';

interface UnitManagerProps {
  units: Unit[];
  selectedUnit: string;
  onSelectUnit: (id: string) => void;
  onAddUnit: (name: string) => void;
  onDeleteUnit: (id: string) => void;
  onEditUnit: (id: string, name: string) => void;
}

export function UnitManager({
  units,
  selectedUnit,
  onSelectUnit,
  onAddUnit,
  onDeleteUnit,
  onEditUnit,
}: UnitManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAdd = () => {
    if (newUnitName.trim()) {
      onAddUnit(newUnitName.trim());
      setNewUnitName('');
      setIsAdding(false);
    }
  };

  const handleEdit = (id: string) => {
    if (editingName.trim()) {
      onEditUnit(id, editingName.trim());
      setEditingId(null);
      setEditingName('');
    }
  };

  const startEdit = (unit: Unit, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(unit.id);
    setEditingName(unit.name);
  };

  return (
    <div className="relative">
      {/* 单位选择器 */}
      <select
        value={selectedUnit}
        onChange={(e) => onSelectUnit(e.target.value)}
        className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
      >
        {units.map((unit) => (
          <option key={unit.id} value={unit.name}>
            {unit.name}
          </option>
        ))}
      </select>

      {/* 管理按钮 */}
      <div className="mt-2 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
          className="h-8 text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          添加单位
        </Button>
      </div>

      {/* 添加新单位 */}
      {isAdding && (
        <div className="mt-2 flex gap-2">
          <Input
            value={newUnitName}
            onChange={(e) => setNewUnitName(e.target.value)}
            placeholder="输入单位名称"
            className="h-9 flex-1"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button size="sm" onClick={handleAdd} className="h-9 px-3">
            <Check className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* 单位列表（管理） */}
      <div className="mt-3 flex flex-wrap gap-2">
        {units.map((unit) => (
          <div key={unit.id} className="relative group">
            {editingId === unit.id ? (
              <div className="flex gap-1">
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="h-7 w-20 text-sm"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleEdit(unit.id)}
                />
                <Button
                  size="sm"
                  onClick={() => handleEdit(unit.id)}
                  className="h-7 w-7 p-0"
                >
                  <Check className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <span className="inline-flex items-center px-2 py-1 bg-gray-100 rounded text-sm">
                {unit.name}
                <span className="hidden group-hover:flex items-center gap-0.5 ml-1">
                  <button
                    onClick={(e) => startEdit(unit, e)}
                    className="p-0.5 hover:bg-gray-200 rounded"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`确定删除单位"${unit.name}"吗？`)) {
                        onDeleteUnit(unit.id);
                      }
                    }}
                    className="p-0.5 hover:bg-gray-200 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
