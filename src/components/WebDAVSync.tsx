// WebDAV 同步组件

import { useState, useEffect } from 'react';
import { Cloud, CloudOff, Upload, Download, Settings, Check, X, RefreshCw, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { webdav, type WebDAVConfig } from '@/services/webdav';
import { storage } from '@/services/storage';
import { toast } from 'sonner';

interface WebDAVSyncProps {
  onSyncComplete?: () => void;
}

export function WebDAVSync({ onSyncComplete }: WebDAVSyncProps) {
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<WebDAVConfig | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [useProxy, setUseProxy] = useState(false);
  const [showProxyInfo, setShowProxyInfo] = useState(false);

  // 表单状态
  const [serverUrl, setServerUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [syncPath, setSyncPath] = useState('recipe-app');

  // 加载配置
  useEffect(() => {
    const savedConfig = webdav.getConfig();
    const savedUseProxy = webdav.getUseProxy();
    setUseProxy(savedUseProxy);
    
    if (savedConfig) {
      setConfig(savedConfig);
      setServerUrl(savedConfig.serverUrl);
      setUsername(savedConfig.username);
      setPassword(savedConfig.password);
      setSyncPath(savedConfig.syncPath);
      testConnection(savedConfig, savedUseProxy);
    }
  }, []);

  // 测试连接
  const testConnection = async (testConfig?: WebDAVConfig, proxy?: boolean) => {
    const result = await webdav.testConnection(testConfig, proxy);
    setIsConnected(result.success);
    if (result.useProxy !== undefined) {
      setUseProxy(result.useProxy);
    }
    return result;
  };

  // 保存配置
  const handleSaveConfig = async () => {
    if (!serverUrl || !username || !password) {
      toast.error('请填写完整信息');
      return;
    }

    // 确保 URL 格式正确
    let cleanUrl = serverUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    // 确保以 / 结尾
    if (!cleanUrl.endsWith('/')) {
      cleanUrl += '/';
    }

    const newConfig: WebDAVConfig = {
      serverUrl: cleanUrl,
      username: username.trim(),
      password: password,
      syncPath: (syncPath || 'recipe-app').trim(),
    };

    toast.loading('正在测试连接...', { id: 'test-connection' });
    const result = await testConnection(newConfig, useProxy);
    toast.dismiss('test-connection');
    
    if (result.success) {
      webdav.setConfig(newConfig);
      setConfig(newConfig);
      setShowConfig(false);
      toast.success('WebDAV 配置成功' + (result.useProxy ? '（使用代理）' : ''));
    } else {
      toast.error(result.message);
      // 如果是 CORS 错误，提示使用代理
      if (result.message.includes('CORS') || result.message.includes('代理')) {
        setShowProxyInfo(true);
      }
    }
  };

  // 清除配置
  const handleClearConfig = () => {
    webdav.clearConfig();
    setConfig(null);
    setIsConnected(false);
    setServerUrl('');
    setUsername('');
    setPassword('');
    setUseProxy(false);
    toast.success('配置已清除');
  };

  // 上传到云端
  const handleUpload = async () => {
    setIsSyncing(true);
    try {
      const data = await storage.exportAllData();
      const content = JSON.stringify(data, null, 2);
      const filename = `recipes_backup_${new Date().toISOString().slice(0, 10)}_${Date.now()}.json`;
      
      const result = await webdav.uploadFile(filename, content);
      if (result.success) {
        toast.success('数据已上传到云端');
        onSyncComplete?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('上传失败');
    } finally {
      setIsSyncing(false);
    }
  };

  // 从云端下载
  const handleDownload = async () => {
    setIsSyncing(true);
    try {
      const result = await webdav.listFiles();
      if (!result.success || !result.files || result.files.length === 0) {
        toast.error('云端没有备份文件');
        setIsSyncing(false);
        return;
      }

      // 获取最新的备份文件
      const latestFile = result.files.sort().reverse()[0];
      toast.loading(`正在下载 ${latestFile}...`, { id: 'download' });
      
      const downloadResult = await webdav.downloadFile(latestFile);
      toast.dismiss('download');
      
      if (downloadResult.success && downloadResult.data) {
        const data = JSON.parse(downloadResult.data);
        await storage.importData(data);
        toast.success('数据已从云端恢复');
        onSyncComplete?.();
      } else {
        toast.error(downloadResult.message);
      }
    } catch (error) {
      toast.error('下载失败');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* 状态显示 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Cloud className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-600">
                已连接云端{useProxy && '（代理）'}
              </span>
            </>
          ) : (
            <>
              <CloudOff className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500">未配置云端同步</span>
            </>
          )}
        </div>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
        >
          <Settings className="w-4 h-4" />
          {config ? '修改配置' : '配置同步'}
        </button>
      </div>

      {/* 配置面板 */}
      {showConfig && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-3">
          {/* 服务器地址 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WebDAV 服务器地址
            </label>
            <Input
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="https://dav.jianguoyun.com/dav/"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              坚果云: https://dav.jianguoyun.com/dav/
            </p>
          </div>

          {/* 用户名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              用户名
            </label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="您的邮箱或用户名"
              className="w-full"
            />
          </div>

          {/* 密码 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              密码/应用密码
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="您的密码"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              坚果云需要使用"第三方应用密码"，不是登录密码
            </p>
          </div>

          {/* 同步目录 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              同步目录
            </label>
            <Input
              value={syncPath}
              onChange={(e) => setSyncPath(e.target.value)}
              placeholder="recipe-app"
              className="w-full"
            />
          </div>

          {/* 代理模式 */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="use-proxy"
              checked={useProxy}
              onChange={(e) => setUseProxy(e.target.checked)}
              className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
            />
            <label htmlFor="use-proxy" className="text-sm text-gray-700">
              使用代理模式（解决 CORS 问题）
            </label>
            <button
              onClick={() => setShowProxyInfo(!showProxyInfo)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          {/* 代理说明 */}
          {showProxyInfo && (
            <div className="p-3 bg-blue-50 rounded text-sm text-blue-700">
              <p className="font-medium mb-1">什么是代理模式？</p>
              <p className="mb-2">
                由于浏览器安全限制，直接访问 WebDAV 服务器可能会被阻止。
                代理模式通过第三方服务器转发请求，可以解决这个问题。
              </p>
              <p className="text-xs text-blue-600">
                注意：代理服务器只能看到加密后的数据，无法读取您的菜谱内容。
              </p>
            </div>
          )}

          {/* 坚果云说明 */}
          <div className="p-3 bg-yellow-50 rounded text-sm">
            <p className="font-medium text-yellow-800 mb-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              坚果云配置说明
            </p>
            <ol className="list-decimal list-inside text-yellow-700 space-y-1">
              <li>登录坚果云网页版</li>
              <li>点击右上角头像 → 「安全选项」</li>
              <li>找到「第三方应用管理」→ 「添加应用」</li>
              <li>复制生成的应用密码（不是登录密码）</li>
              <li>如果连接失败，请勾选"使用代理模式"</li>
            </ol>
          </div>

          {/* 按钮 */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowConfig(false)}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-1" />
              取消
            </Button>
            {config && (
              <Button
                variant="outline"
                onClick={handleClearConfig}
                className="flex-1 text-red-500"
              >
                清除配置
              </Button>
            )}
            <Button
              onClick={handleSaveConfig}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              <Check className="w-4 h-4 mr-1" />
              保存并测试
            </Button>
          </div>
        </div>
      )}

      {/* 同步按钮 */}
      {isConnected && !showConfig && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={isSyncing}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-1" />
            从云端恢复
          </Button>
          <Button
            onClick={handleUpload}
            disabled={isSyncing}
            className="flex-1 bg-orange-500 hover:bg-orange-600"
          >
            {isSyncing ? (
              <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-1" />
            )}
            备份到云端
          </Button>
        </div>
      )}

      {/* 使用说明 */}
      {!config && !showConfig && (
        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
          <p className="font-medium text-blue-700 mb-1">💡 推荐的云盘：</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>坚果云</strong>（推荐）- 稳定可靠，免费版够用</li>
            <li>华为云盘 - 需要开启 WebDAV</li>
            <li>ownCloud / Nextcloud - 自建云盘</li>
          </ul>
        </div>
      )}
    </div>
  );
}
