// WebDAV 同步服务
// 支持华为云盘、坚果云等 WebDAV 服务

export interface WebDAVConfig {
  serverUrl: string;
  username: string;
  password: string;
  syncPath: string;
}

class WebDAVService {
  private config: WebDAVConfig | null = null;

  // 设置配置
  setConfig(config: WebDAVConfig) {
    this.config = config;
    // 保存到本地存储
    localStorage.setItem('webdav_config', JSON.stringify(config));
  }

  // 获取配置
  getConfig(): WebDAVConfig | null {
    if (this.config) return this.config;
    const saved = localStorage.getItem('webdav_config');
    if (saved) {
      this.config = JSON.parse(saved);
      return this.config;
    }
    return null;
  }

  // 清除配置
  clearConfig() {
    this.config = null;
    localStorage.removeItem('webdav_config');
    localStorage.removeItem('webdav_use_proxy');
  }

  // 获取是否使用代理
  getUseProxy(): boolean {
    return localStorage.getItem('webdav_use_proxy') === 'true';
  }

  // 设置是否使用代理
  setUseProxy(use: boolean) {
    localStorage.setItem('webdav_use_proxy', use ? 'true' : 'false');
  }

  // 测试连接
  async testConnection(config?: WebDAVConfig, useProxy?: boolean): Promise<{ success: boolean; message: string; useProxy?: boolean }> {
    const testConfig = config || this.config;
    if (!testConfig) {
      return { success: false, message: '未配置 WebDAV' };
    }

    const shouldUseProxy = useProxy !== undefined ? useProxy : this.getUseProxy();

    try {
      const result = await this.doTestConnection(testConfig, shouldUseProxy);
      if (result.success) {
        this.setUseProxy(shouldUseProxy);
        return { ...result, useProxy: shouldUseProxy };
      }
      
      // 如果直接连接失败，尝试使用代理
      if (!shouldUseProxy) {
        console.log('[WebDAV] 直接连接失败，尝试使用代理...');
        const proxyResult = await this.doTestConnection(testConfig, true);
        if (proxyResult.success) {
          this.setUseProxy(true);
          return { ...proxyResult, useProxy: true };
        }
      }
      
      return result;
    } catch (error) {
      console.error('[WebDAV] 测试连接错误:', error);
      return { success: false, message: '网络错误，请检查服务器地址和账号密码' };
    }
  }

  // 实际测试连接
  private async doTestConnection(config: WebDAVConfig, useProxy: boolean): Promise<{ success: boolean; message: string }> {
    const url = this.buildUrl(config.serverUrl, config.syncPath, useProxy);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

      const response = await fetch(url, {
        method: 'PROPFIND',
        headers: {
          'Authorization': 'Basic ' + btoa(unescape(encodeURIComponent(config.username + ':' + config.password))),
          'Depth': '0',
          'Content-Type': 'text/xml',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok || response.status === 207) {
        return { success: true, message: '连接成功' };
      } else if (response.status === 401) {
        return { success: false, message: '用户名或密码错误' };
      } else if (response.status === 404) {
        // 目录不存在，尝试创建
        return { success: true, message: '连接成功（将自动创建目录）' };
      } else {
        return { success: false, message: `连接失败: HTTP ${response.status}` };
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return { success: false, message: '网络错误，可能是 CORS 限制，请尝试使用代理模式' };
      }
      throw error;
    }
  }

  // 上传文件
  async uploadFile(filename: string, content: string): Promise<{ success: boolean; message: string }> {
    if (!this.config) {
      return { success: false, message: '未配置 WebDAV' };
    }

    try {
      // 确保目录存在
      await this.ensureDirectory();

      const url = this.buildUrl(this.config.serverUrl, this.config.syncPath + '/' + filename, this.getUseProxy());
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': 'Basic ' + btoa(unescape(encodeURIComponent(this.config.username + ':' + this.config.password))),
          'Content-Type': 'application/json',
        },
        body: content,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok || response.status === 201 || response.status === 204) {
        return { success: true, message: '上传成功' };
      } else if (response.status === 401) {
        return { success: false, message: '认证失败，请检查账号密码' };
      } else {
        return { success: false, message: `上传失败: HTTP ${response.status}` };
      }
    } catch (error) {
      console.error('[WebDAV] 上传错误:', error);
      if (error instanceof TypeError) {
        return { success: false, message: '网络错误，请检查网络连接或尝试使用代理模式' };
      }
      return { success: false, message: '上传失败: ' + String(error) };
    }
  }

  // 下载文件
  async downloadFile(filename: string): Promise<{ success: boolean; data?: string; message: string }> {
    if (!this.config) {
      return { success: false, message: '未配置 WebDAV' };
    }

    try {
      const url = this.buildUrl(this.config.serverUrl, this.config.syncPath + '/' + filename, this.getUseProxy());
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + btoa(unescape(encodeURIComponent(this.config.username + ':' + this.config.password))),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.text();
        return { success: true, data, message: '下载成功' };
      } else if (response.status === 404) {
        return { success: false, message: '文件不存在' };
      } else if (response.status === 401) {
        return { success: false, message: '认证失败' };
      } else {
        return { success: false, message: `下载失败: HTTP ${response.status}` };
      }
    } catch (error) {
      console.error('[WebDAV] 下载错误:', error);
      return { success: false, message: '网络错误' };
    }
  }

  // 获取文件列表
  async listFiles(): Promise<{ success: boolean; files?: string[]; message: string }> {
    if (!this.config) {
      return { success: false, message: '未配置 WebDAV' };
    }

    try {
      const url = this.buildUrl(this.config.serverUrl, this.config.syncPath, this.getUseProxy());
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(url, {
        method: 'PROPFIND',
        headers: {
          'Authorization': 'Basic ' + btoa(unescape(encodeURIComponent(this.config.username + ':' + this.config.password))),
          'Depth': '1',
          'Content-Type': 'text/xml',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok || response.status === 207) {
        const xml = await response.text();
        const files = this.parseFileList(xml);
        return { success: true, files, message: '获取成功' };
      } else if (response.status === 404) {
        // 目录不存在，返回空列表
        return { success: true, files: [], message: '目录为空' };
      } else {
        return { success: false, message: `获取失败: HTTP ${response.status}` };
      }
    } catch (error) {
      console.error('[WebDAV] 获取列表错误:', error);
      return { success: false, message: '网络错误' };
    }
  }

  // 确保目录存在
  private async ensureDirectory(): Promise<void> {
    if (!this.config) return;

    const url = this.buildUrl(this.config.serverUrl, this.config.syncPath, this.getUseProxy());
    try {
      const response = await fetch(url, {
        method: 'MKCOL',
        headers: {
          'Authorization': 'Basic ' + btoa(unescape(encodeURIComponent(this.config.username + ':' + this.config.password))),
        },
      });
      // 405 表示目录已存在，也是成功的
      if (!response.ok && response.status !== 405 && response.status !== 201) {
        console.warn('[WebDAV] 创建目录失败:', response.status);
      }
    } catch (error) {
      console.warn('[WebDAV] 创建目录错误:', error);
    }
  }

  // 解析文件列表
  private parseFileList(xml: string): string[] {
    const files: string[] = [];
    
    // 尝试不同的命名空间
    const patterns = [
      /<d:href>([^<]+)<\/d:href>/g,
      /<D:href>([^<]+)<\/D:href>/g,
      /<href>([^<]+)<\/href>/g,
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(xml)) !== null) {
        const path = decodeURIComponent(match[1]);
        const filename = path.split('/').pop();
        if (filename && filename.endsWith('.json') && filename !== '.json') {
          files.push(filename);
        }
      }
    }
    
    // 去重
    return [...new Set(files)];
  }

  // 构建完整 URL
  private buildUrl(serverUrl: string, path: string, useProxy: boolean): string {
    let url = serverUrl.replace(/\/$/, '');
    
    // 处理路径
    const cleanPath = path.replace(/^\//, '');
    url += '/' + cleanPath;
    
    // 如果使用代理
    if (useProxy) {
      // 使用 allorigins 代理
      return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    }
    
    return url;
  }
}

export const webdav = new WebDAVService();
