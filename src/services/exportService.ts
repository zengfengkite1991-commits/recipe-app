// 导出服务 - PDF和XLSX

import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import type { Recipe } from '@/types';

// 导出单个菜谱为PDF（使用html2canvas渲染HTML为图片）
export async function exportRecipeToPDF(recipe: Recipe): Promise<void> {
  // 创建临时容器用于渲染PDF内容
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 794px;
    background: white;
    padding: 40px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "PingFang SC", "Microsoft YaHei", sans-serif;
    color: #333;
    line-height: 1.6;
    z-index: -1;
  `;

  // 构建HTML内容
  const htmlContent = `
    <div style="max-width: 714px; margin: 0 auto;">
      <!-- 标题 -->
      <h1 style="text-align: center; font-size: 28px; color: #f97316; margin-bottom: 10px; font-weight: bold;">
        ${escapeHtml(recipe.name)}
      </h1>
      
      <!-- 分类 -->
      <p style="text-align: center; color: #666; margin-bottom: 20px; font-size: 14px;">
        分类：${escapeHtml(recipe.category)}
      </p>

      <!-- 封面图片 -->
      ${recipe.coverImage ? `
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${recipe.coverImage}" style="max-width: 100%; max-height: 300px; border-radius: 8px;" />
        </div>
      ` : ''}

      <!-- 食材 -->
      ${recipe.ingredients.length > 0 ? `
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; color: #333; border-bottom: 2px solid #f97316; padding-bottom: 8px; margin-bottom: 15px;">
            食材
          </h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            ${recipe.ingredients.map((ing, i) => `
              <div style="background: #f9fafb; padding: 10px 15px; border-radius: 6px; font-size: 14px;">
                <span style="color: #f97316; font-weight: bold;">${i + 1}.</span>
                <span style="font-weight: 500;">${escapeHtml(ing.name)}</span>
                <span style="color: #666; margin-left: 8px;">
                  ${ing.amount ? escapeHtml(ing.amount) + ' ' : ''}${escapeHtml(ing.unit)}
                </span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- 调料 -->
      ${recipe.seasonings && recipe.seasonings.length > 0 ? `
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; color: #333; border-bottom: 2px solid #f97316; padding-bottom: 8px; margin-bottom: 15px;">
            调料
          </h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            ${recipe.seasonings.map((sea, i) => `
              <div style="background: #f9fafb; padding: 10px 15px; border-radius: 6px; font-size: 14px;">
                <span style="color: #f97316; font-weight: bold;">${i + 1}.</span>
                <span style="font-weight: 500;">${escapeHtml(sea.name)}</span>
                <span style="color: #666; margin-left: 8px;">
                  ${sea.amount ? escapeHtml(sea.amount) + ' ' : ''}${escapeHtml(sea.unit)}
                </span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- 制作步骤 -->
      ${recipe.steps.length > 0 ? `
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; color: #333; border-bottom: 2px solid #f97316; padding-bottom: 8px; margin-bottom: 15px;">
            制作步骤
          </h2>
          <div style="space-y: 20px;">
            ${recipe.steps.map((step) => `
              <div style="margin-bottom: 20px; padding: 15px; background: #f9fafb; border-radius: 8px;">
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                  <span style="flex-shrink: 0; width: 28px; height: 28px; background: #f97316; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">
                    ${step.order}
                  </span>
                  <div style="flex: 1;">
                    <p style="margin: 0; font-size: 14px; line-height: 1.8; color: #333;">
                      ${escapeHtml(step.description).replace(/\n/g, '<br>')}
                    </p>
                    ${step.image ? `
                      <div style="margin-top: 12px;">
                        <img src="${step.image}" style="max-width: 200px; max-height: 150px; border-radius: 6px;" />
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- 页脚 -->
      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #999; font-size: 12px;">
        由 菜品研发记录 生成 · ${new Date().toLocaleDateString('zh-CN')}
      </div>
    </div>
  `;

  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  try {
    // 动态导入 html2canvas
    const html2canvas = (await import('html2canvas')).default;
    
    // 渲染为canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    // 创建PDF
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    
    let position = 0;
    let heightLeft = imgHeight;
    
    // 如果内容超过一页，需要分页
    while (heightLeft > 0) {
      pdf.addImage(
        imgData,
        'JPEG',
        0,
        position,
        imgWidth * ratio,
        imgHeight * ratio
      );
      
      heightLeft -= pdfHeight / ratio;
      position -= pdfHeight;
      
      if (heightLeft > 0) {
        pdf.addPage();
      }
    }

    // 保存PDF
    pdf.save(`${recipe.name}_菜谱.pdf`);
  } finally {
    // 清理临时元素
    document.body.removeChild(container);
  }
}

// HTML转义函数，防止XSS
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 导出单个菜谱为XLSX
export async function exportRecipeToXLSX(recipe: Recipe): Promise<void> {
  const workbook = XLSX.utils.book_new();

  // 基本信息工作表
  const basicInfo = [
    ['菜谱名称', recipe.name],
    ['分类', recipe.category],
    ['创建时间', new Date(recipe.createdAt).toLocaleString()],
    ['更新时间', new Date(recipe.updatedAt).toLocaleString()],
  ];
  const basicSheet = XLSX.utils.aoa_to_sheet(basicInfo);
  XLSX.utils.book_append_sheet(workbook, basicSheet, '基本信息');

  // 食材工作表
  const ingredientData = [
    ['食材名称', '份量', '单位'],
    ...recipe.ingredients.map(ing => [ing.name, ing.amount, ing.unit]),
  ];
  const ingredientSheet = XLSX.utils.aoa_to_sheet(ingredientData);
  XLSX.utils.book_append_sheet(workbook, ingredientSheet, '食材');

  // 调料工作表
  const seasoningData = [
    ['调料名称', '份量', '单位'],
    ...(recipe.seasonings || []).map(sea => [sea.name, sea.amount, sea.unit]),
  ];
  const seasoningSheet = XLSX.utils.aoa_to_sheet(seasoningData);
  XLSX.utils.book_append_sheet(workbook, seasoningSheet, '调料');

  // 步骤工作表
  const stepData = [
    ['步骤序号', '操作说明'],
    ...recipe.steps.map(step => [step.order, step.description]),
  ];
  const stepSheet = XLSX.utils.aoa_to_sheet(stepData);
  XLSX.utils.book_append_sheet(workbook, stepSheet, '制作步骤');

  // 保存文件
  XLSX.writeFile(workbook, `${recipe.name}_菜谱.xlsx`);
}

// 导出所有菜谱为JSON
export async function exportAllToJSON(recipes: Recipe[]): Promise<void> {
  const dataStr = JSON.stringify(recipes, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `菜谱备份_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 导入JSON文件
export async function importFromJSON(file: File): Promise<Recipe[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data as Recipe[]);
      } catch (error) {
        reject(new Error('无效的JSON文件'));
      }
    };
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsText(file);
  });
}

// 分享菜谱（使用Web Share API）
export async function shareRecipe(recipe: Recipe): Promise<void> {
  const ingredients = recipe.ingredients.map(i => i.name).join('、');
  const seasonings = (recipe.seasonings || []).map(s => s.name).join('、');
  const shareData = {
    title: recipe.name,
    text: `查看我的菜谱：${recipe.name}\n分类：${recipe.category}\n食材：${ingredients}${seasonings ? '\n调料：' + seasonings : ''}`,
    url: window.location.href,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (error) {
      console.error('分享失败:', error);
      // 降级：复制到剪贴板
      await copyToClipboard(shareData.text);
    }
  } else {
    // 复制到剪贴板
    await copyToClipboard(shareData.text);
  }
}

// 复制到剪贴板
async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    alert('菜谱信息已复制到剪贴板');
  } catch (error) {
    console.error('复制失败:', error);
    alert('复制失败，请手动复制');
  }
}
