'use client';

import { useState } from 'react';
import { Receipt, ArrowLeft, Plus, Upload, Download, Search, Filter, Calendar, TrendingUp, AlertTriangle, CheckCircle, Clock, Eye, Edit, Trash2, FileText, BarChart3, PieChart, Shield, Settings, Mail, Printer, Copy, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Invoice {
  id: string;
  number: string;
  type: 'input' | 'output';
  category: 'purchase' | 'sale' | 'service' | 'expense' | 'other';
  date: string;
  dueDate?: string;
  amount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  supplier?: string;
  customer?: string;
  status: 'pending' | 'verified' | 'rejected' | 'expired' | 'duplicate';
  risk: 'low' | 'medium' | 'high' | 'critical';
  verificationStatus: 'unverified' | 'verified' | 'failed';
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  remarks?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

interface InvoiceRisk {
  id: string;
  type: 'duplicate' | 'expired' | 'invalid' | 'suspicious' | 'overdue';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  invoiceId: string;
  status: 'active' | 'resolved' | 'acknowledged';
  createdAt: string;
  resolvedAt?: string;
}

interface InvoiceStats {
  totalInvoices: number;
  totalAmount: number;
  totalTaxAmount: number;
  verifiedInvoices: number;
  pendingInvoices: number;
  riskInvoices: number;
  monthlyTrend: number;
}

// Mock 发票数据
const mockInvoices: Invoice[] = [
  {
    id: '1',
    number: 'INV-2024-001',
    type: 'output',
    category: 'sale',
    date: '2024-12-15',
    amount: 1000000,
    taxRate: 0.13,
    taxAmount: 130000,
    totalAmount: 1130000,
    customer: '客户A公司',
    status: 'verified',
    risk: 'low',
    verificationStatus: 'verified',
    paymentStatus: 'paid',
    createdAt: '2024-12-15T10:30:00Z',
    updatedAt: '2024-12-15T10:30:00Z'
  },
  {
    id: '2',
    number: 'INV-2024-002',
    type: 'input',
    category: 'purchase',
    date: '2024-12-10',
    amount: 800000,
    taxRate: 0.13,
    taxAmount: 104000,
    totalAmount: 904000,
    supplier: '供应商B公司',
    status: 'verified',
    risk: 'low',
    verificationStatus: 'verified',
    paymentStatus: 'paid',
    createdAt: '2024-12-10T14:20:00Z',
    updatedAt: '2024-12-10T14:20:00Z'
  },
  {
    id: '3',
    number: 'INV-2024-003',
    type: 'output',
    category: 'service',
    date: '2024-12-20',
    amount: 500000,
    taxRate: 0.13,
    taxAmount: 65000,
    totalAmount: 565000,
    customer: '客户C公司',
    status: 'pending',
    risk: 'medium',
    verificationStatus: 'unverified',
    paymentStatus: 'unpaid',
    remarks: '待客户确认',
    createdAt: '2024-12-20T09:15:00Z',
    updatedAt: '2024-12-20T09:15:00Z'
  },
  {
    id: '4',
    number: 'INV-2024-004',
    type: 'input',
    category: 'expense',
    date: '2024-12-05',
    amount: 300000,
    taxRate: 0.13,
    taxAmount: 39000,
    totalAmount: 339000,
    supplier: '供应商D公司',
    status: 'rejected',
    risk: 'high',
    verificationStatus: 'failed',
    paymentStatus: 'unpaid',
    remarks: '发票信息有误',
    createdAt: '2024-12-05T16:45:00Z',
    updatedAt: '2024-12-05T16:45:00Z'
  },
  {
    id: '5',
    number: 'INV-2024-005',
    type: 'input',
    category: 'purchase',
    date: '2024-11-25',
    amount: 1200000,
    taxRate: 0.13,
    taxAmount: 156000,
    totalAmount: 1356000,
    supplier: '供应商E公司',
    status: 'expired',
    risk: 'critical',
    verificationStatus: 'verified',
    paymentStatus: 'unpaid',
    remarks: '发票已过期',
    createdAt: '2024-11-25T11:30:00Z',
    updatedAt: '2024-12-01T08:00:00Z'
  },
  {
    id: '6',
    number: 'INV-2024-006',
    type: 'output',
    category: 'sale',
    date: '2024-12-18',
    amount: 750000,
    taxRate: 0.13,
    taxAmount: 97500,
    totalAmount: 847500,
    customer: '客户F公司',
    status: 'verified',
    risk: 'low',
    verificationStatus: 'verified',
    paymentStatus: 'partial',
    remarks: '已收到部分付款',
    createdAt: '2024-12-18T13:20:00Z',
    updatedAt: '2024-12-18T13:20:00Z'
  }
];

// Mock 发票风险数据
const mockInvoiceRisks: InvoiceRisk[] = [
  {
    id: '1',
    type: 'expired',
    title: '发票已过期',
    description: '供应商E公司的发票已超过认证期限',
    severity: 'critical',
    invoiceId: '5',
    status: 'active',
    createdAt: '2024-12-01T08:00:00Z'
  },
  {
    id: '2',
    type: 'invalid',
    title: '发票信息有误',
    description: '供应商D公司的发票信息与合同不符',
    severity: 'high',
    invoiceId: '4',
    status: 'active',
    createdAt: '2024-12-05T16:45:00Z'
  },
  {
    id: '3',
    type: 'suspicious',
    title: '异常发票金额',
    description: '客户C公司的发票金额超出正常范围',
    severity: 'medium',
    invoiceId: '3',
    status: 'acknowledged',
    createdAt: '2024-12-20T09:15:00Z'
  }
];

// Mock 统计数据
const mockStats: InvoiceStats = {
  totalInvoices: 156,
  totalAmount: 85000000,
  totalTaxAmount: 11050000,
  verifiedInvoices: 142,
  pendingInvoices: 8,
  riskInvoices: 6,
  monthlyTrend: 12.5
};

export default function InvoicesPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'receive' | 'issue' | 'risks' | 'analytics'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2024年12月');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showReceiveForm, setShowReceiveForm] = useState(false);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const periods = [
    '2024年12月',
    '2024年11月',
    '2024年10月',
    '2024年第四季度',
    '2024年第三季度',
    '2024年度'
  ];

  const invoiceTypes = [
    { value: 'all', label: '全部' },
    { value: 'input', label: '进项发票' },
    { value: 'output', label: '销项发票' }
  ];

  const invoiceStatuses = [
    { value: 'all', label: '全部状态' },
    { value: 'pending', label: '待处理' },
    { value: 'verified', label: '已验证' },
    { value: 'rejected', label: '已驳回' },
    { value: 'expired', label: '已过期' }
  ];

  const getInvoiceTypeLabel = (type: string) => {
    return type === 'input' ? '进项' : '销项';
  };

  const getInvoiceCategoryLabel = (category: string) => {
    switch (category) {
      case 'purchase': return '采购';
      case 'sale': return '销售';
      case 'service': return '服务';
      case 'expense': return '费用';
      case 'other': return '其他';
      default: return '未知';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'duplicate': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待处理';
      case 'verified': return '已验证';
      case 'rejected': return '已驳回';
      case 'expired': return '已过期';
      case 'duplicate': return '重复';
      default: return '未知';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskText = (risk: string) => {
    switch (risk) {
      case 'critical': return '严重';
      case 'high': return '高危';
      case 'medium': return '中等';
      case 'low': return '低危';
      default: return '未知';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid': return '已付款';
      case 'partial': return '部分付款';
      case 'unpaid': return '未付款';
      default: return '未知';
    }
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
  };

  // 筛选发票
  const filteredInvoices = mockInvoices.filter(invoice => {
    const matchesSearch = invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (invoice.supplier && invoice.supplier.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (invoice.customer && invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || invoice.type === filterType;
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const activeRisks = mockInvoiceRisks.filter(risk => risk.status === 'active');
  const criticalRisks = mockInvoiceRisks.filter(risk => risk.severity === 'critical');

  const handleReceiveInvoice = () => {
    setShowReceiveForm(true);
  };

  const handleIssueInvoice = () => {
    setShowIssueForm(true);
  };

  const handleVerifyInvoice = (invoiceId: string) => {
    alert(`正在验证发票：${invoiceId}`);
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    alert(`正在下载发票：${invoiceId}`);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleResolveRisk = (riskId: string) => {
    alert(`已处理风险：${riskId}`);
  };

  const handleUploadInvoices = () => {
    alert('请选择要上传的发票文件');
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
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Receipt className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">发票管理</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="text-gray-400 hover:text-blue-600">
                <Settings className="w-5 h-5" />
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Upload className="w-4 h-4" />
                批量上传
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 筛选器 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">报告期间</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {periods.map(period => (
                  <option key={period} value={period}>
                    {period}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">发票类型</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {invoiceTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">发票状态</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {invoiceStatuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">搜索</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="发票号码、供应商、客户..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">发票总数</p>
                <p className="text-2xl font-bold text-blue-600">
                  {mockStats.totalInvoices.toLocaleString()}
                </p>
                <p className="text-xs text-green-600">+{mockStats.monthlyTrend}% 较上月</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Receipt className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">发票金额</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(mockStats.totalAmount)}
                </p>
                <p className="text-xs text-gray-500">含税总额</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">已验证</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockStats.verifiedInvoices}
                </p>
                <p className="text-xs text-gray-500">验证率 {Math.round(mockStats.verifiedInvoices / mockStats.totalInvoices * 100)}%</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">风险发票</p>
                <p className="text-2xl font-bold text-red-600">
                  {mockStats.riskInvoices}
                </p>
                <p className="text-xs text-red-600">需要关注</p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 风险预警卡片 */}
        {criticalRisks.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-medium text-red-900">⚠️ 发票风险预警</h3>
            </div>
            <div className="space-y-2">
              {criticalRisks.map((risk) => (
                <div key={risk.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">{risk.title}</p>
                    <p className="text-xs text-red-700">{risk.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleResolveRisk(risk.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                    >
                      立即处理
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 标签页 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'overview', label: '概览', icon: BarChart3 },
                { key: 'receive', label: '收票管理', icon: Download },
                { key: 'issue', label: '开票管理', icon: Upload },
                { key: 'risks', label: '风险控制', icon: Shield },
                { key: 'analytics', label: '数据分析', icon: PieChart }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* 概览 */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* 发票列表 */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">最近发票</h3>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleReceiveInvoice}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        收票
                      </button>
                      <button
                        onClick={handleIssueInvoice}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        开票
                      </button>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            发票号码
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            类型
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            对方单位
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            金额
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            状态
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            风险等级
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            操作
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredInvoices.slice(0, 10).map((invoice) => (
                          <tr key={invoice.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {invoice.number}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                invoice.type === 'input' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {getInvoiceTypeLabel(invoice.type)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {invoice.supplier || invoice.customer}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(invoice.totalAmount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                                {getStatusText(invoice.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(invoice.risk)}`}>
                                {getRiskText(invoice.risk)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleViewInvoice(invoice)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="查看详情"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {invoice.status === 'pending' && (
                                  <button
                                    onClick={() => handleVerifyInvoice(invoice.id)}
                                    className="text-green-600 hover:text-green-900"
                                    title="验证发票"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDownloadInvoice(invoice.id)}
                                  className="text-gray-600 hover:text-gray-900"
                                  title="下载发票"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 风险概览 */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">风险概览</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {activeRisks.map((risk) => (
                      <div key={risk.id} className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-start justify-between mb-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(risk.severity)}`}>
                            {getRiskText(risk.severity)}
                          </span>
                          <span className="text-xs text-gray-500">{risk.type}</span>
                        </div>
                        <h4 className="text-sm font-medium text-red-900 mb-1">{risk.title}</h4>
                        <p className="text-xs text-red-700 mb-3">{risk.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{formatDate(risk.createdAt)}</span>
                          <button
                            onClick={() => handleResolveRisk(risk.id)}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            处理
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 收票管理 */}
            {activeTab === 'receive' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">收票管理</h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleUploadInvoices}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      批量上传
                    </button>
                    <button
                      onClick={handleReceiveInvoice}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      手动录入
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredInvoices.filter(invoice => invoice.type === 'input').map((invoice) => (
                    <div key={invoice.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-900">{invoice.number}</h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                          {getStatusText(invoice.status)}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">供应商</span>
                          <span className="text-gray-900">{invoice.supplier}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">开票日期</span>
                          <span className="text-gray-900">{formatDate(invoice.date)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">金额</span>
                          <span className="text-gray-900">{formatCurrency(invoice.amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">税额</span>
                          <span className="text-gray-900">{formatCurrency(invoice.taxAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">付款状态</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(invoice.paymentStatus)}`}>
                            {getPaymentStatusText(invoice.paymentStatus)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => handleViewInvoice(invoice)}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          查看详情
                        </button>
                        <button
                          onClick={() => handleVerifyInvoice(invoice.id)}
                          className="text-green-600 hover:text-green-800 text-xs"
                        >
                          验证
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          className="text-gray-600 hover:text-gray-800 text-xs"
                        >
                          下载
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 开票管理 */}
            {activeTab === 'issue' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">开票管理</h3>
                  <button
                    onClick={handleIssueInvoice}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    开具发票
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredInvoices.filter(invoice => invoice.type === 'output').map((invoice) => (
                    <div key={invoice.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-900">{invoice.number}</h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                          {getStatusText(invoice.status)}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">客户</span>
                          <span className="text-gray-900">{invoice.customer}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">开票日期</span>
                          <span className="text-gray-900">{formatDate(invoice.date)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">金额</span>
                          <span className="text-gray-900">{formatCurrency(invoice.amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">税额</span>
                          <span className="text-gray-900">{formatCurrency(invoice.taxAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">收款状态</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(invoice.paymentStatus)}`}>
                            {getPaymentStatusText(invoice.paymentStatus)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => handleViewInvoice(invoice)}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          查看详情
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          className="text-gray-600 hover:text-gray-800 text-xs"
                        >
                          下载
                        </button>
                        <button
                          className="text-green-600 hover:text-green-800 text-xs"
                          title="发送给客户"
                        >
                          <Mail className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 风险控制 */}
            {activeTab === 'risks' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">风险控制</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">活跃风险：</span>
                    <span className="text-sm font-medium text-red-600">{activeRisks.length}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {mockInvoiceRisks.map((risk) => (
                    <div key={risk.id} className={`p-4 rounded-lg border ${getRiskColor(risk.severity)}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-sm font-medium text-gray-900">{risk.title}</h4>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(risk.severity)}`}>
                              {getRiskText(risk.severity)}
                            </span>
                            <span className="text-xs text-gray-500">{risk.type}</span>
                          </div>
                          <p className="text-sm text-gray-600">{risk.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{formatDate(risk.createdAt)}</span>
                          <button
                            onClick={() => handleResolveRisk(risk.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                          >
                            处理
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 数据分析 */}
            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">发票数据分析</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* 发票分布 */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">发票类型分布</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-blue-500 rounded"></div>
                          <span className="text-gray-700">进项发票</span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">78</p>
                          <p className="text-xs text-gray-500">50%</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-green-500 rounded"></div>
                          <span className="text-gray-700">销项发票</span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">78</p>
                          <p className="text-xs text-gray-500">50%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 风险分布 */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">风险等级分布</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-green-500 rounded"></div>
                          <span className="text-gray-700">低风险</span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">142</p>
                          <p className="text-xs text-gray-500">91%</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                          <span className="text-gray-700">中等风险</span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-yellow-600">8</p>
                          <p className="text-xs text-gray-500">5%</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-red-500 rounded"></div>
                          <span className="text-gray-700">高风险</span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-600">6</p>
                          <p className="text-xs text-gray-500">4%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

