'use client';

import { useState } from 'react';
import { BarChart3, ArrowLeft, Download, Eye, FileText, Calendar, TrendingUp, DollarSign, PieChart, Filter, ChevronDown, ChevronRight, Play, Pause } from 'lucide-react';
import Link from 'next/link';

interface ReportData {
  id: string;
  type: 'balance' | 'income' | 'income_quarterly' | 'cashflow' | 'cashflow_quarterly';
  period: string;
  date: string;
  status: 'generated' | 'processing' | 'error';
  downloadUrl?: string;
  interpretation?: string;
}

interface BalanceSheetData {
  assets: {
    current: { [key: string]: number };
    nonCurrent: { [key: string]: number };
  };
  liabilities: {
    current: { [key: string]: number };
    nonCurrent: { [key: string]: number };
  };
  equity: { [key: string]: number };
}

interface IncomeStatementData {
  revenue: { [key: string]: number };
  expenses: { [key: string]: number };
  netIncome: number;
}

interface CashFlowData {
  operating: { [key: string]: number };
  investing: { [key: string]: number };
  financing: { [key: string]: number };
  netCashFlow: number;
}

// Mock 报表数据
const mockReports: ReportData[] = [
  {
    id: '1',
    type: 'balance',
    period: '2024年12月',
    date: '2024-12-31',
    status: 'generated',
    downloadUrl: '#',
    interpretation: '资产总额较上期增长15%，主要得益于银行存款和应收账款的增加。负债结构合理，流动比率保持在2.1，偿债能力良好。'
  },
  {
    id: '2',
    type: 'income',
    period: '2024年12月',
    date: '2024-12-31',
    status: 'generated',
    downloadUrl: '#',
    interpretation: '营业收入同比增长20%，毛利率保持在35%，净利润增长18%。成本控制良好，管理费用率下降2个百分点。'
  },
  {
    id: '3',
    type: 'income_quarterly',
    period: '2024年第四季度',
    date: '2024-12-31',
    status: 'generated',
    downloadUrl: '#',
    interpretation: '第四季度业绩表现强劲，营收环比增长12%，净利润环比增长15%。季节性因素影响较小，业务增长稳定。'
  },
  {
    id: '4',
    type: 'cashflow',
    period: '2024年12月',
    date: '2024-12-31',
    status: 'generated',
    downloadUrl: '#',
    interpretation: '经营活动现金流净额为正，投资活动主要用于设备更新，筹资活动保持稳定。现金储备充足，流动性良好。'
  },
  {
    id: '5',
    type: 'cashflow_quarterly',
    period: '2024年第四季度',
    date: '2024-12-31',
    status: 'generated',
    downloadUrl: '#',
    interpretation: '季度现金流表现优秀，经营现金流持续改善，投资回报率提升。现金流结构合理，风险可控。'
  },
  {
    id: '6',
    type: 'balance',
    period: '2024年11月',
    date: '2024-11-30',
    status: 'generated',
    downloadUrl: '#',
    interpretation: '资产结构稳定，流动资产占比合理。负债水平适中，资产负债率保持在45%，财务风险可控。'
  },
  {
    id: '7',
    type: 'income',
    period: '2024年11月',
    date: '2024-11-30',
    status: 'generated',
    downloadUrl: '#',
    interpretation: '月度收入稳定增长，成本控制有效。毛利率略有提升，主要受益于原材料成本下降。'
  }
];

// Mock 资产负债表数据
const mockBalanceSheet: BalanceSheetData = {
  assets: {
    current: {
      '库存现金': 50000,
      '银行存款': 2500000,
      '应收账款': 800000,
      '预付账款': 200000,
      '存货': 1200000,
      '其他流动资产': 100000
    },
    nonCurrent: {
      '固定资产': 3000000,
      '无形资产': 500000,
      '长期投资': 800000,
      '其他非流动资产': 200000
    }
  },
  liabilities: {
    current: {
      '应付账款': 600000,
      '预收账款': 300000,
      '应付职工薪酬': 150000,
      '应交税费': 100000,
      '其他流动负债': 50000
    },
    nonCurrent: {
      '长期借款': 2000000,
      '长期应付款': 500000,
      '其他非流动负债': 100000
    }
  },
  equity: {
    '实收资本': 3000000,
    '资本公积': 500000,
    '盈余公积': 300000,
    '未分配利润': 1200000
  }
};

// Mock 利润表数据
const mockIncomeStatement: IncomeStatementData = {
  revenue: {
    '主营业务收入': 5000000,
    '其他业务收入': 200000,
    '投资收益': 50000,
    '营业外收入': 30000
  },
  expenses: {
    '主营业务成本': 3250000,
    '销售费用': 400000,
    '管理费用': 300000,
    '财务费用': 50000,
    '营业外支出': 20000
  },
  netIncome: 1080000
};

// Mock 现金流量表数据
const mockCashFlow: CashFlowData = {
  operating: {
    '销售商品收到的现金': 4800000,
    '收到的税费返还': 50000,
    '购买商品支付的现金': -3100000,
    '支付给职工的现金': -400000,
    '支付的各项税费': -300000,
    '其他经营活动现金': -100000
  },
  investing: {
    '收回投资收到的现金': 200000,
    '取得投资收益收到的现金': 50000,
    '购建固定资产支付的现金': -800000,
    '投资支付的现金': -300000
  },
  financing: {
    '吸收投资收到的现金': 0,
    '取得借款收到的现金': 1000000,
    '偿还债务支付的现金': -500000,
    '分配股利支付的现金': -200000
  },
  netCashFlow: 400000
};

export default function ReportsPage() {
  const [selectedReportType, setSelectedReportType] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [showInterpretation, setShowInterpretation] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'balance' | 'income' | 'cashflow'>('list');

  const reportTypes = [
    { value: 'all', label: '全部报表', icon: BarChart3 },
    { value: 'balance', label: '资产负债表', icon: FileText },
    { value: 'income', label: '利润表', icon: TrendingUp },
    { value: 'income_quarterly', label: '利润表季报', icon: TrendingUp },
    { value: 'cashflow', label: '现金流量表', icon: DollarSign },
    { value: 'cashflow_quarterly', label: '现金流量表季报', icon: DollarSign }
  ];

  const periods = [
    { value: 'all', label: '全部期间' },
    { value: '2024年12月', label: '2024年12月' },
    { value: '2024年11月', label: '2024年11月' },
    { value: '2024年第四季度', label: '2024年第四季度' },
    { value: '2024年第三季度', label: '2024年第三季度' }
  ];

  const filteredReports = mockReports.filter(report => {
    const matchesType = selectedReportType === 'all' || report.type === selectedReportType;
    const matchesPeriod = selectedPeriod === 'all' || report.period === selectedPeriod;
    return matchesType && matchesPeriod;
  });

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'balance': return '资产负债表';
      case 'income': return '利润表';
      case 'income_quarterly': return '利润表季报';
      case 'cashflow': return '现金流量表';
      case 'cashflow_quarterly': return '现金流量表季报';
      default: return '未知';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'generated': return '已生成';
      case 'processing': return '生成中';
      case 'error': return '生成失败';
      default: return '未知';
    }
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString()}`;
  };

  const calculateTotal = (items: { [key: string]: number }) => {
    return Object.values(items).reduce((sum, value) => sum + value, 0);
  };

  const handleViewReport = (report: ReportData) => {
    setSelectedReport(report);
    setActiveTab('list');
  };

  const handleDownload = (report: ReportData) => {
    // 模拟下载功能
    console.log('下载报表:', report);
    alert(`正在下载${getReportTypeLabel(report.type)} - ${report.period}`);
  };

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
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">财务报表</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="text-gray-400 hover:text-blue-600">
                <Filter className="w-5 h-5" />
              </button>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                生成报表
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 筛选器 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">报表类型</label>
              <select
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {reportTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">报告期间</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {periods.map(period => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总报表数</p>
                <p className="text-2xl font-bold text-gray-900">{filteredReports.length}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">资产总额</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(calculateTotal(mockBalanceSheet.assets.current) + calculateTotal(mockBalanceSheet.assets.nonCurrent))}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">净利润</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(mockIncomeStatement.netIncome)}
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">现金流量净额</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(mockCashFlow.netCashFlow)}
                </p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：报表列表 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">报表列表</h2>
              </div>
              
              {filteredReports.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">暂无报表</h3>
                  <p className="text-gray-500">点击"生成报表"开始创建财务报表</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredReports.map((report) => (
                    <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {getReportTypeLabel(report.type)}
                            </h3>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                              {getStatusText(report.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {report.period} • {report.date}
                          </p>
                          {report.interpretation && (
                            <p className="text-sm text-gray-500 line-clamp-2">
                              {report.interpretation}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewReport(report)}
                            className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50"
                            title="查看报表"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowInterpretation(!showInterpretation)}
                            className="text-green-600 hover:text-green-700 p-2 rounded-lg hover:bg-green-50"
                            title="报表解读"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(report)}
                            className="text-purple-600 hover:text-purple-700 p-2 rounded-lg hover:bg-purple-50"
                            title="下载报表"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {showInterpretation && report.interpretation && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-900 mb-2">报表解读</h4>
                          <p className="text-sm text-blue-800">{report.interpretation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 右侧：报表详情 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">报表详情</h2>
              </div>
              
              <div className="p-6">
                {selectedReport ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {getReportTypeLabel(selectedReport.type)}
                      </h3>
                      <p className="text-sm text-gray-600">{selectedReport.period}</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">生成时间</span>
                        <span className="text-gray-900">{selectedReport.date}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">状态</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedReport.status)}`}>
                          {getStatusText(selectedReport.status)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setActiveTab('balance')}
                          className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                            activeTab === 'balance' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          资产负债表
                        </button>
                        <button
                          onClick={() => setActiveTab('income')}
                          className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                            activeTab === 'income' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          利润表
                        </button>
                        <button
                          onClick={() => setActiveTab('cashflow')}
                          className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                            activeTab === 'cashflow' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          现金流量表
                        </button>
                      </div>
                    </div>
                    
                    {/* 报表内容预览 */}
                    <div className="mt-4">
                      {activeTab === 'balance' && (
                        <div className="space-y-4">
                          {/* 资产部分 */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">资产</h4>
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-gray-500 mb-1">流动资产</div>
                              {Object.entries(mockBalanceSheet.assets.current).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-xs">
                                  <span className="text-gray-600 pl-2">{key}</span>
                                  <span className="text-gray-900">{formatCurrency(value)}</span>
                                </div>
                              ))}
                              <div className="flex justify-between text-xs font-medium border-t pt-1 mt-1">
                                <span className="text-gray-700">流动资产合计</span>
                                <span className="text-gray-900">{formatCurrency(calculateTotal(mockBalanceSheet.assets.current))}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-1 mt-3">
                              <div className="text-xs font-medium text-gray-500 mb-1">非流动资产</div>
                              {Object.entries(mockBalanceSheet.assets.nonCurrent).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-xs">
                                  <span className="text-gray-600 pl-2">{key}</span>
                                  <span className="text-gray-900">{formatCurrency(value)}</span>
                                </div>
                              ))}
                              <div className="flex justify-between text-xs font-medium border-t pt-1 mt-1">
                                <span className="text-gray-700">非流动资产合计</span>
                                <span className="text-gray-900">{formatCurrency(calculateTotal(mockBalanceSheet.assets.nonCurrent))}</span>
                              </div>
                            </div>
                            
                            <div className="flex justify-between text-sm font-bold border-t pt-2 mt-2">
                              <span className="text-gray-900">资产总计</span>
                              <span className="text-gray-900">{formatCurrency(calculateTotal(mockBalanceSheet.assets.current) + calculateTotal(mockBalanceSheet.assets.nonCurrent))}</span>
                            </div>
                          </div>
                          
                          {/* 负债和所有者权益部分 */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">负债和所有者权益</h4>
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-gray-500 mb-1">流动负债</div>
                              {Object.entries(mockBalanceSheet.liabilities.current).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-xs">
                                  <span className="text-gray-600 pl-2">{key}</span>
                                  <span className="text-gray-900">{formatCurrency(value)}</span>
                                </div>
                              ))}
                              <div className="flex justify-between text-xs font-medium border-t pt-1 mt-1">
                                <span className="text-gray-700">流动负债合计</span>
                                <span className="text-gray-900">{formatCurrency(calculateTotal(mockBalanceSheet.liabilities.current))}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-1 mt-3">
                              <div className="text-xs font-medium text-gray-500 mb-1">非流动负债</div>
                              {Object.entries(mockBalanceSheet.liabilities.nonCurrent).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-xs">
                                  <span className="text-gray-600 pl-2">{key}</span>
                                  <span className="text-gray-900">{formatCurrency(value)}</span>
                                </div>
                              ))}
                              <div className="flex justify-between text-xs font-medium border-t pt-1 mt-1">
                                <span className="text-gray-700">非流动负债合计</span>
                                <span className="text-gray-900">{formatCurrency(calculateTotal(mockBalanceSheet.liabilities.nonCurrent))}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-1 mt-3">
                              <div className="text-xs font-medium text-gray-500 mb-1">所有者权益</div>
                              {Object.entries(mockBalanceSheet.equity).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-xs">
                                  <span className="text-gray-600 pl-2">{key}</span>
                                  <span className="text-gray-900">{formatCurrency(value)}</span>
                                </div>
                              ))}
                              <div className="flex justify-between text-xs font-medium border-t pt-1 mt-1">
                                <span className="text-gray-700">所有者权益合计</span>
                                <span className="text-gray-900">{formatCurrency(calculateTotal(mockBalanceSheet.equity))}</span>
                              </div>
                            </div>
                            
                            <div className="flex justify-between text-sm font-bold border-t pt-2 mt-2">
                              <span className="text-gray-900">负债和所有者权益总计</span>
                              <span className="text-gray-900">{formatCurrency(calculateTotal(mockBalanceSheet.liabilities.current) + calculateTotal(mockBalanceSheet.liabilities.nonCurrent) + calculateTotal(mockBalanceSheet.equity))}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {activeTab === 'income' && (
                        <div className="space-y-4">
                          {/* 收入部分 */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">收入</h4>
                            <div className="space-y-1">
                              {Object.entries(mockIncomeStatement.revenue).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-xs">
                                  <span className="text-gray-600">{key}</span>
                                  <span className="text-gray-900">{formatCurrency(value)}</span>
                                </div>
                              ))}
                              <div className="flex justify-between text-xs font-medium border-t pt-1 mt-1">
                                <span className="text-gray-700">营业收入合计</span>
                                <span className="text-gray-900">{formatCurrency(calculateTotal(mockIncomeStatement.revenue))}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* 费用部分 */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">费用</h4>
                            <div className="space-y-1">
                              {Object.entries(mockIncomeStatement.expenses).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-xs">
                                  <span className="text-gray-600">{key}</span>
                                  <span className="text-red-600">-{formatCurrency(value)}</span>
                                </div>
                              ))}
                              <div className="flex justify-between text-xs font-medium border-t pt-1 mt-1">
                                <span className="text-gray-700">费用合计</span>
                                <span className="text-red-600">-{formatCurrency(calculateTotal(mockIncomeStatement.expenses))}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* 净利润 */}
                          <div className="flex justify-between text-sm font-bold border-t pt-2">
                            <span className="text-gray-900">净利润</span>
                            <span className="text-blue-600">{formatCurrency(mockIncomeStatement.netIncome)}</span>
                          </div>
                        </div>
                      )}
                      
                      {activeTab === 'cashflow' && (
                        <div className="space-y-4">
                          {/* 经营活动 */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">经营活动现金流量</h4>
                            <div className="space-y-1">
                              {Object.entries(mockCashFlow.operating).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-xs">
                                  <span className="text-gray-600">{key}</span>
                                  <span className={`${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {value >= 0 ? '+' : ''}{formatCurrency(value)}
                                  </span>
                                </div>
                              ))}
                              <div className="flex justify-between text-xs font-medium border-t pt-1 mt-1">
                                <span className="text-gray-700">经营活动现金流量净额</span>
                                <span className={`${calculateTotal(mockCashFlow.operating) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {calculateTotal(mockCashFlow.operating) >= 0 ? '+' : ''}{formatCurrency(calculateTotal(mockCashFlow.operating))}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* 投资活动 */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">投资活动现金流量</h4>
                            <div className="space-y-1">
                              {Object.entries(mockCashFlow.investing).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-xs">
                                  <span className="text-gray-600">{key}</span>
                                  <span className={`${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {value >= 0 ? '+' : ''}{formatCurrency(value)}
                                  </span>
                                </div>
                              ))}
                              <div className="flex justify-between text-xs font-medium border-t pt-1 mt-1">
                                <span className="text-gray-700">投资活动现金流量净额</span>
                                <span className={`${calculateTotal(mockCashFlow.investing) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {calculateTotal(mockCashFlow.investing) >= 0 ? '+' : ''}{formatCurrency(calculateTotal(mockCashFlow.investing))}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* 筹资活动 */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">筹资活动现金流量</h4>
                            <div className="space-y-1">
                              {Object.entries(mockCashFlow.financing).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-xs">
                                  <span className="text-gray-600">{key}</span>
                                  <span className={`${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {value >= 0 ? '+' : ''}{formatCurrency(value)}
                                  </span>
                                </div>
                              ))}
                              <div className="flex justify-between text-xs font-medium border-t pt-1 mt-1">
                                <span className="text-gray-700">筹资活动现金流量净额</span>
                                <span className={`${calculateTotal(mockCashFlow.financing) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {calculateTotal(mockCashFlow.financing) >= 0 ? '+' : ''}{formatCurrency(calculateTotal(mockCashFlow.financing))}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* 现金流量净额 */}
                          <div className="flex justify-between text-sm font-bold border-t pt-2">
                            <span className="text-gray-900">现金流量净额</span>
                            <span className={`${mockCashFlow.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {mockCashFlow.netCashFlow >= 0 ? '+' : ''}{formatCurrency(mockCashFlow.netCashFlow)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">选择报表</h3>
                    <p className="text-gray-500">点击左侧报表列表中的"查看"按钮查看详细内容</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
