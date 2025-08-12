'use client';

import { useState } from 'react';
import { Database, ArrowLeft, Plus, Search, Filter, Download, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

interface Account {
  id: string;
  code: string;
  name: string;
  category: string;
  balance: number;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  status: 'active' | 'inactive';
  lastUpdated: string;
}

interface TimelineItem {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'balance' | 'transaction' | 'adjustment';
  amount?: number;
}

const mockAccounts: Account[] = [
  { id: '1', code: '1001', name: '库存现金', category: '流动资产', balance: 50000, type: 'asset', status: 'active', lastUpdated: '2024-12-01' },
  { id: '2', code: '1002', name: '银行存款', category: '流动资产', balance: 2500000, type: 'asset', status: 'active', lastUpdated: '2024-12-01' },
  { id: '3', code: '1012', name: '其他货币资金', category: '流动资产', balance: 100000, type: 'asset', status: 'active', lastUpdated: '2024-12-01' },
  { id: '4', code: '1101', name: '短期投资', category: '流动资产', balance: 0, type: 'asset', status: 'active', lastUpdated: '2024-12-01' },
  { id: '5', code: '1121', name: '应收票据', category: '流动资产', balance: 150000, type: 'asset', status: 'active', lastUpdated: '2024-12-01' },
  { id: '6', code: '1122', name: '应收账款', category: '流动资产', balance: 800000, type: 'asset', status: 'active', lastUpdated: '2024-12-01' },
  { id: '7', code: '1123', name: '预付账款', category: '流动资产', balance: 200000, type: 'asset', status: 'active', lastUpdated: '2024-12-01' },
  { id: '8', code: '1131', name: '应收股利', category: '流动资产', balance: 0, type: 'asset', status: 'active', lastUpdated: '2024-12-01' },
  { id: '9', code: '1132', name: '应收利息', category: '流动资产', balance: 0, type: 'asset', status: 'active', lastUpdated: '2024-12-01' },
  { id: '10', code: '1221', name: '其他应收款', category: '流动资产', balance: 50000, type: 'asset', status: 'active', lastUpdated: '2024-12-01' },
  { id: '11', code: '1231', name: '坏账准备', category: '流动资产', balance: -40000, type: 'asset', status: 'active', lastUpdated: '2024-12-01' },
  { id: '12', code: '1401', name: '材料采购', category: '流动资产', balance: 0, type: 'asset', status: 'active', lastUpdated: '2024-12-01' },
  { id: '13', code: '1402', name: '在途物资', category: '流动资产', balance: 0, type: 'asset', status: 'active', lastUpdated: '2024-12-01' },
  { id: '14', code: '1403', name: '原材料', category: '流动资产', balance: 1200000, type: 'asset', status: 'active', lastUpdated: '2024-12-01' },
  { id: '15', code: '1404', name: '材料成本差异', category: '流动资产', balance: 50000, type: 'asset', status: 'active', lastUpdated: '2024-12-01' },
];

// Mock 时间轴数据
const mockTimeline: TimelineItem[] = [
  {
    id: '1',
    date: '2024-12-01',
    title: '期末结账',
    description: '完成12月份期末结账，更新所有科目余额',
    type: 'balance',
    amount: 0
  },
  {
    id: '2',
    date: '2024-11-30',
    title: '银行存款调整',
    description: '银行对账单调整，银行存款余额增加5,000元',
    type: 'adjustment',
    amount: 5000
  },
  {
    id: '3',
    date: '2024-11-28',
    title: '应收账款收回',
    description: '客户A公司支付应收账款200,000元',
    type: 'transaction',
    amount: 200000
  },
  {
    id: '4',
    date: '2024-11-25',
    title: '原材料采购',
    description: '采购原材料一批，价值150,000元',
    type: 'transaction',
    amount: 150000
  },
  {
    id: '5',
    date: '2024-11-20',
    title: '销售收入',
    description: '销售商品收入500,000元',
    type: 'transaction',
    amount: 500000
  },
  {
    id: '6',
    date: '2024-11-15',
    title: '坏账准备调整',
    description: '根据应收账款账龄分析，调整坏账准备',
    type: 'adjustment',
    amount: -10000
  },
  {
    id: '7',
    date: '2024-11-10',
    title: '固定资产折旧',
    description: '计提本月固定资产折旧费用',
    type: 'adjustment',
    amount: -25000
  },
  {
    id: '8',
    date: '2024-11-05',
    title: '工资发放',
    description: '发放员工工资及社保费用',
    type: 'transaction',
    amount: -80000
  }
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [timeline, setTimeline] = useState<TimelineItem[]>(mockTimeline);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [showTimeline, setShowTimeline] = useState(true);

  const categories = ['all', '流动资产', '非流动资产', '流动负债', '非流动负债', '所有者权益', '收入', '费用'];
  const types = ['all', 'asset', 'liability', 'equity', 'revenue', 'expense'];

  // 生成月份选项（最近12个月）
  const generateMonthOptions = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
      const monthLabel = `${year}年${month}月`;
      months.push({ key: monthKey, label: monthLabel });
    }
    
    return months;
  };

  const monthOptions = generateMonthOptions();

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.code.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || account.category === selectedCategory;
    const matchesType = selectedType === 'all' || account.type === selectedType;
    
    // 按月筛选
    if (selectedMonth !== 'all') {
      const accountDate = new Date(account.lastUpdated);
      const accountMonth = `${accountDate.getFullYear()}-${(accountDate.getMonth() + 1).toString().padStart(2, '0')}`;
      if (accountMonth !== selectedMonth) return false;
    }
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const filteredTimeline = selectedMonth === 'all' 
    ? timeline 
    : timeline.filter(item => {
        const itemDate = new Date(item.date);
        const itemMonth = `${itemDate.getFullYear()}-${(itemDate.getMonth() + 1).toString().padStart(2, '0')}`;
        return itemMonth === selectedMonth;
      });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'asset': return 'text-green-600 bg-green-50';
      case 'liability': return 'text-red-600 bg-red-50';
      case 'equity': return 'text-blue-600 bg-blue-50';
      case 'revenue': return 'text-purple-600 bg-purple-50';
      case 'expense': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'asset': return '资产';
      case 'liability': return '负债';
      case 'equity': return '权益';
      case 'revenue': return '收入';
      case 'expense': return '费用';
      default: return '未知';
    }
  };

  const getTimelineTypeColor = (type: string) => {
    switch (type) {
      case 'balance': return 'bg-blue-500';
      case 'transaction': return 'bg-green-500';
      case 'adjustment': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getTimelineTypeText = (type: string) => {
    switch (type) {
      case 'balance': return '结账';
      case 'transaction': return '交易';
      case 'adjustment': return '调整';
      default: return '其他';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const totalBalance = filteredAccounts.reduce((sum, account) => sum + account.balance, 0);

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
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Database className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">账目管理</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowTimeline(!showTimeline)}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  showTimeline 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Clock className="w-4 h-4" />
                {showTimeline ? '隐藏时间轴' : '显示时间轴'}
              </button>
              <button className="text-gray-400 hover:text-blue-600">
                <Download className="w-5 h-5" />
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                新增科目
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`grid gap-8 ${showTimeline ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {/* 左侧：账目管理内容 */}
          <div className={`${showTimeline ? 'lg:col-span-2' : ''}`}>
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">总科目数</p>
                    <p className="text-2xl font-bold text-gray-900">{filteredAccounts.length}</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Database className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">资产总额</p>
                    <p className="text-2xl font-bold text-green-600">
                      ¥{filteredAccounts.filter(a => a.type === 'asset').reduce((sum, a) => sum + a.balance, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Database className="w-4 h-4 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">负债总额</p>
                    <p className="text-2xl font-bold text-red-600">
                      ¥{filteredAccounts.filter(a => a.type === 'liability').reduce((sum, a) => sum + a.balance, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <Database className="w-4 h-4 text-red-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">权益总额</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ¥{filteredAccounts.filter(a => a.type === 'equity').reduce((sum, a) => sum + a.balance, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Database className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* 筛选和搜索 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="搜索科目代码或名称..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? '全部分类' : category}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {types.map(type => (
                      <option key={type} value={type}>
                        {type === 'all' ? '全部类型' : getTypeText(type)}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">全部月份</option>
                    {monthOptions.map(month => (
                      <option key={month.key} value={month.key}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 科目列表 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">会计科目</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        科目代码
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        科目名称
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        分类
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        类型
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        余额
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        状态
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAccounts.map((account) => (
                      <tr key={account.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {account.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {account.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {account.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(account.type)}`}>
                            {getTypeText(account.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                          <span className={account.balance >= 0 ? 'text-gray-900' : 'text-red-600'}>
                            ¥{account.balance.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            account.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {account.status === 'active' ? '启用' : '停用'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 右侧：时间轴 */}
          {showTimeline && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">账目时间轴</h2>
                    <Calendar className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-6">
                    {filteredTimeline.map((item, index) => (
                      <div key={item.id} className="relative">
                        {/* 时间轴连接线 */}
                        {index < filteredTimeline.length - 1 && (
                          <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                        )}
                        
                        <div className="flex items-start space-x-4">
                          {/* 时间轴圆点 */}
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getTimelineTypeColor(item.type)}`}>
                            <span className="text-white text-xs font-medium">
                              {getTimelineTypeText(item.type)}
                            </span>
                          </div>
                          
                          {/* 内容 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
                              <span className="text-xs text-gray-500">{formatDate(item.date)}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                            {item.amount !== undefined && (
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">金额</span>
                                <span className={`text-sm font-medium ${
                                  item.amount >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {item.amount >= 0 ? '+' : ''}¥{item.amount.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {filteredTimeline.length === 0 && (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">暂无时间轴数据</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
