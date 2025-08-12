'use client';

import { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Settings, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Download, 
  Upload, 
  Search, 
  Filter, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Shield, 
  Database,
  CreditCard,
  FileText,
  Calculator,
  Globe,
  Zap,
  LinkIcon,
  Unlink,
  Play,
  Pause,
  Eye,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Wifi,
  WifiOff,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  X
} from 'lucide-react';
import Link from 'next/link';

// MCP应用接口定义
interface MCPApp {
  id: string;
  name: string;
  description: string;
  category: 'bank' | 'tax' | 'invoice' | 'payment' | 'accounting' | 'market' | 'erp';
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  icon: string;
  color: string;
  lastSync?: string;
  syncStatus: 'success' | 'error' | 'pending' | 'never';
  dataCount: number;
  apiEndpoint?: string;
  credentials?: {
    apiKey?: string;
    username?: string;
    lastVerified?: string;
  };
  features: string[];
  isEnabled: boolean;
  isConfigured: boolean;
  errorMessage?: string;
  syncInterval: number; // 同步间隔（分钟）
  lastDataUpdate?: string;
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

// 同步任务接口
interface SyncTask {
  id: string;
  appId: string;
  type: 'full' | 'incremental' | 'manual';
  status: 'running' | 'completed' | 'failed' | 'pending';
  progress: number;
  startTime: string;
  endTime?: string;
  recordsProcessed: number;
  recordsTotal: number;
  errorMessage?: string;
}

// Mock数据
const mockMCPApps: MCPApp[] = [
  {
    id: 'bank-icbc',
    name: '工商银行',
    description: '工商银行账户查询和交易管理',
    category: 'bank',
    status: 'connected',
    icon: '🏦',
    color: 'bg-green-500',
    lastSync: '2024-01-15T10:30:00Z',
    syncStatus: 'success',
    dataCount: 1250,
    apiEndpoint: 'https://api.icbc.com.cn/v1',
    credentials: {
      apiKey: 'icbc_****_****',
      lastVerified: '2024-01-15T09:00:00Z'
    },
    features: ['账户查询', '交易记录', '余额监控', '自动对账'],
    isEnabled: true,
    isConfigured: true,
    syncInterval: 30,
    lastDataUpdate: '2024-01-15T10:30:00Z',
    dataQuality: 'excellent'
  },
  {
    id: 'tax-national',
    name: '国家税务总局',
    description: '税务申报和查询服务',
    category: 'tax',
    status: 'connected',
    icon: '🏛️',
    color: 'bg-blue-500',
    lastSync: '2024-01-15T08:00:00Z',
    syncStatus: 'success',
    dataCount: 89,
    apiEndpoint: 'https://api.chinatax.gov.cn/v1',
    credentials: {
      username: 'company_****',
      lastVerified: '2024-01-15T07:30:00Z'
    },
    features: ['税务查询', '自动申报', '政策查询', '风险监控'],
    isEnabled: true,
    isConfigured: true,
    syncInterval: 60,
    lastDataUpdate: '2024-01-15T08:00:00Z',
    dataQuality: 'excellent'
  },
  {
    id: 'invoice-golden',
    name: '金税发票',
    description: '增值税发票开具和管理',
    category: 'invoice',
    status: 'connected',
    icon: '��',
    color: 'bg-orange-500',
    lastSync: '2024-01-15T11:15:00Z',
    syncStatus: 'success',
    dataCount: 456,
    apiEndpoint: 'https://api.goldentax.com/v1',
    credentials: {
      apiKey: 'golden_****_****',
      lastVerified: '2024-01-15T10:45:00Z'
    },
    features: ['发票开具', '发票查询', '发票验证', '批量处理'],
    isEnabled: true,
    isConfigured: true,
    syncInterval: 15,
    lastDataUpdate: '2024-01-15T11:15:00Z',
    dataQuality: 'excellent'
  },
  {
    id: 'payment-alipay',
    name: '支付宝',
    description: '在线支付和收款管理',
    category: 'payment',
    status: 'connected',
    icon: '💳',
    color: 'bg-blue-600',
    lastSync: '2024-01-15T12:00:00Z',
    syncStatus: 'success',
    dataCount: 789,
    apiEndpoint: 'https://api.alipay.com/v1',
    credentials: {
      apiKey: 'alipay_****_****',
      lastVerified: '2024-01-15T11:30:00Z'
    },
    features: ['支付处理', '收款管理', '退款处理', '手续费计算'],
    isEnabled: true,
    isConfigured: true,
    syncInterval: 10,
    lastDataUpdate: '2024-01-15T12:00:00Z',
    dataQuality: 'excellent'
  },
  {
    id: 'accounting-kingdee',
    name: '金蝶云',
    description: '金蝶云会计软件集成',
    category: 'accounting',
    status: 'connected',
    icon: '📊',
    color: 'bg-purple-500',
    lastSync: '2024-01-15T09:45:00Z',
    syncStatus: 'success',
    dataCount: 2340,
    apiEndpoint: 'https://api.kingdee.com/v1',
    credentials: {
      username: 'company_****',
      lastVerified: '2024-01-15T09:15:00Z'
    },
    features: ['凭证同步', '科目管理', '报表生成', '数据导出'],
    isEnabled: true,
    isConfigured: true,
    syncInterval: 45,
    lastDataUpdate: '2024-01-15T09:45:00Z',
    dataQuality: 'excellent'
  },
  {
    id: 'market-forex',
    name: '外汇行情',
    description: '实时汇率和外汇数据',
    category: 'market',
    status: 'connected',
    icon: '🌍',
    color: 'bg-indigo-500',
    lastSync: '2024-01-15T13:00:00Z',
    syncStatus: 'success',
    dataCount: 156,
    apiEndpoint: 'https://api.forex.com/v1',
    credentials: {
      apiKey: 'forex_****_****',
      lastVerified: '2024-01-15T12:30:00Z'
    },
    features: ['汇率查询', '历史数据', '趋势分析', '汇率预警'],
    isEnabled: true,
    isConfigured: true,
    syncInterval: 5,
    lastDataUpdate: '2024-01-15T13:00:00Z',
    dataQuality: 'excellent'
  },
  {
    id: 'erp-sap',
    name: 'SAP ERP',
    description: 'SAP企业资源规划系统',
    category: 'erp',
    status: 'disconnected',
    icon: '🏢',
    color: 'bg-gray-500',
    lastSync: '2024-01-10T16:00:00Z',
    syncStatus: 'error',
    dataCount: 0,
    features: ['数据同步', '业务流程', '库存管理', '采购管理'],
    isEnabled: false,
    isConfigured: false,
    errorMessage: '连接超时，请检查网络设置',
    syncInterval: 60,
    dataQuality: 'poor'
  }
];

const mockSyncTasks: SyncTask[] = [
  {
    id: 'sync-1',
    appId: 'bank-icbc',
    type: 'incremental',
    status: 'completed',
    progress: 100,
    startTime: '2024-01-15T10:25:00Z',
    endTime: '2024-01-15T10:30:00Z',
    recordsProcessed: 25,
    recordsTotal: 25
  },
  {
    id: 'sync-2',
    appId: 'tax-national',
    type: 'full',
    status: 'running',
    progress: 65,
    startTime: '2024-01-15T10:35:00Z',
    recordsProcessed: 58,
    recordsTotal: 89
  },
  {
    id: 'sync-3',
    appId: 'invoice-golden',
    type: 'manual',
    status: 'pending',
    progress: 0,
    startTime: '2024-01-15T11:20:00Z',
    recordsProcessed: 0,
    recordsTotal: 0
  }
];

export default function MCPAppsPage() {
  const [apps, setApps] = useState<MCPApp[]>(mockMCPApps);
  const [syncTasks, setSyncTasks] = useState<SyncTask[]>(mockSyncTasks);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfigureModal, setShowConfigureModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<MCPApp | null>(null);
  const [activeTab, setActiveTab] = useState<'apps' | 'sync' | 'logs' | 'settings'>('apps');

  // 工具函数
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'disconnected': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4" />;
      case 'disconnected': return <WifiOff className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <WifiOff className="w-4 h-4" />;
    }
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      case 'never': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getDataQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return '刚刚';
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}小时前`;
    return `${Math.floor(diffInMinutes / 1440)}天前`;
  };

  // 事件处理函数
  const handleConnect = (appId: string) => {
    setApps(prev => prev.map(app => 
      app.id === appId 
        ? { ...app, status: 'connected', isEnabled: true }
        : app
    ));
  };

  const handleDisconnect = (appId: string) => {
    setApps(prev => prev.map(app => 
      app.id === appId 
        ? { ...app, status: 'disconnected', isEnabled: false }
        : app
    ));
  };

  const handleSync = (appId: string) => {
    const newTask: SyncTask = {
      id: `sync-${Date.now()}`,
      appId,
      type: 'manual',
      status: 'running',
      progress: 0,
      startTime: new Date().toISOString(),
      recordsProcessed: 0,
      recordsTotal: 0
    };
    setSyncTasks(prev => [newTask, ...prev]);
    
    // 模拟同步过程
    setTimeout(() => {
      setSyncTasks(prev => prev.map(task => 
        task.id === newTask.id 
          ? { ...task, status: 'completed', progress: 100, endTime: new Date().toISOString() }
          : task
      ));
      
      setApps(prev => prev.map(app => 
        app.id === appId 
          ? { 
              ...app, 
              lastSync: new Date().toISOString(),
              syncStatus: 'success',
              lastDataUpdate: new Date().toISOString()
            }
          : app
      ));
    }, 3000);
  };

  const handleConfigure = (app: MCPApp) => {
    setSelectedApp(app);
    setShowConfigureModal(true);
  };

  // 过滤应用
  const filteredApps = apps.filter(app => {
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', name: '全部', icon: '📱' },
    { id: 'bank', name: '银行', icon: '🏦' },
    { id: 'tax', name: '税务', icon: '🏛️' },
    { id: 'invoice', name: '发票', icon: '🧾' },
    { id: 'payment', name: '支付', icon: '💳' },
    { id: 'accounting', name: '会计', icon: '📊' },
    { id: 'market', name: '市场', icon: '🌍' },
    { id: 'erp', name: 'ERP', icon: '🏢' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-400 hover:text-gray-600">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">财务MCP应用中心</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                添加应用
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">已连接应用</p>
                <p className="text-2xl font-bold text-gray-900">
                  {apps.filter(app => app.status === 'connected').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">同步任务</p>
                <p className="text-2xl font-bold text-gray-900">
                  {syncTasks.filter(task => task.status === 'running').length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <RefreshCw className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">数据总量</p>
                <p className="text-2xl font-bold text-gray-900">
                  {apps.reduce((sum, app) => sum + app.dataCount, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Database className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">连接状态</p>
                <p className="text-2xl font-bold text-gray-900">
                  {apps.filter(app => app.status === 'connected').length}/{apps.length}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 标签页 */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'apps', name: '应用管理', icon: <Database className="w-4 h-4" /> },
                { id: 'sync', name: '同步任务', icon: <RefreshCw className="w-4 h-4" /> },
                { id: 'logs', name: '操作日志', icon: <FileText className="w-4 h-4" /> },
                { id: 'settings', name: '系统设置', icon: <Settings className="w-4 h-4" /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'apps' && (
              <div>
                {/* 搜索和过滤 */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="搜索应用..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <span className="mr-1">{category.icon}</span>
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 应用列表 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredApps.map(app => (
                    <div key={app.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${app.color}`}>
                            {app.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{app.name}</h3>
                            <p className="text-sm text-gray-600">{app.description}</p>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                          {getStatusIcon(app.status)}
                          {app.status === 'connected' ? '已连接' : 
                           app.status === 'disconnected' ? '未连接' :
                           app.status === 'error' ? '错误' : '连接中'}
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">同步状态:</span>
                          <span className={`font-medium ${getSyncStatusColor(app.syncStatus)}`}>
                            {app.syncStatus === 'success' ? '成功' :
                             app.syncStatus === 'error' ? '失败' :
                             app.syncStatus === 'pending' ? '进行中' : '从未同步'}
                          </span>
                        </div>
                        
                        {app.lastSync && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">最后同步:</span>
                            <span className="text-gray-900">{formatRelativeTime(app.lastSync)}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">数据量:</span>
                          <span className="text-gray-900">{app.dataCount.toLocaleString()} 条</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">数据质量:</span>
                          <span className={`font-medium ${getDataQualityColor(app.dataQuality)}`}>
                            {app.dataQuality === 'excellent' ? '优秀' :
                             app.dataQuality === 'good' ? '良好' :
                             app.dataQuality === 'fair' ? '一般' : '较差'}
                          </span>
                        </div>
                      </div>

                      {app.errorMessage && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-700">{app.errorMessage}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {app.status === 'connected' ? (
                          <>
                            <button
                              onClick={() => handleSync(app.id)}
                              className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                            >
                              <RefreshCw className="w-4 h-4" />
                              同步
                            </button>
                            <button
                              onClick={() => handleDisconnect(app.id)}
                              className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              断开
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleConnect(app.id)}
                            className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            连接
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleConfigure(app)}
                          className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          配置
                        </button>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex flex-wrap gap-1">
                          {app.features.slice(0, 3).map((feature, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              {feature}
                            </span>
                          ))}
                          {app.features.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              +{app.features.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'sync' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">同步任务</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    全部同步
                  </button>
                </div>
                
                <div className="space-y-4">
                  {syncTasks.map(task => {
                    const app = apps.find(a => a.id === task.appId);
                    return (
                      <div key={task.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${app?.color || 'bg-gray-500'}`}>
                              {app?.icon || '📱'}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{app?.name || '未知应用'}</h4>
                              <p className="text-sm text-gray-600">
                                {task.type === 'full' ? '全量同步' : 
                                 task.type === 'incremental' ? '增量同步' : '手动同步'}
                              </p>
                            </div>
                          </div>
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            task.status === 'completed' ? 'bg-green-100 text-green-700' :
                            task.status === 'running' ? 'bg-blue-100 text-blue-700' :
                            task.status === 'failed' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {task.status === 'completed' ? <CheckCircle className="w-3 h-3" /> :
                             task.status === 'running' ? <RefreshCw className="w-3 h-3 animate-spin" /> :
                             task.status === 'failed' ? <AlertTriangle className="w-3 h-3" /> :
                             <Clock className="w-3 h-3" />}
                            {task.status === 'completed' ? '已完成' :
                             task.status === 'running' ? '进行中' :
                             task.status === 'failed' ? '失败' : '等待中'}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">进度:</span>
                            <span className="text-gray-900">{task.progress}%</span>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                task.status === 'completed' ? 'bg-green-500' :
                                task.status === 'running' ? 'bg-blue-500' :
                                task.status === 'failed' ? 'bg-red-500' : 'bg-gray-400'
                              }`}
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                          
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>开始时间: {formatDate(task.startTime)}</span>
                            {task.endTime && <span>结束时间: {formatDate(task.endTime)}</span>}
                          </div>
                          
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>处理记录: {task.recordsProcessed.toLocaleString()}</span>
                            <span>总记录: {task.recordsTotal.toLocaleString()}</span>
                          </div>
                          
                          {task.errorMessage && (
                            <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                              {task.errorMessage}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'logs' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">操作日志</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-600">操作日志功能正在开发中...</p>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">系统设置</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-600">系统设置功能正在开发中...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 配置模态框 */}
      {showConfigureModal && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">配置 {selectedApp.name}</h3>
              <button
                onClick={() => setShowConfigureModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API端点
                </label>
                <input
                  type="text"
                  value={selectedApp.apiEndpoint || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://api.example.com/v1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API密钥
                </label>
                <input
                  type="password"
                  value={selectedApp.credentials?.apiKey || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="输入API密钥"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  同步间隔（分钟）
                </label>
                <input
                  type="number"
                  value={selectedApp.syncInterval}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="1440"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowConfigureModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => setShowConfigureModal(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
