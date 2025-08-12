'use client';

import { useState } from 'react';
import { Receipt, ArrowLeft, Plus, Calculator, FileText, AlertTriangle, CheckCircle, Clock, Download, Upload, Search, Filter, Calendar, TrendingUp, DollarSign, Shield, Settings } from 'lucide-react';
import Link from 'next/link';

interface TaxDeclaration {
  id: string;
  type: 'vat' | 'income' | 'corporate' | 'stamp' | 'customs';
  period: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'overdue';
  amount: number;
  submittedDate?: string;
  approvalDate?: string;
  remarks?: string;
}

interface Invoice {
  id: string;
  number: string;
  type: 'input' | 'output';
  date: string;
  amount: number;
  taxRate: number;
  taxAmount: number;
  supplier?: string;
  customer?: string;
  status: 'valid' | 'invalid' | 'pending';
  category: string;
}

interface TaxCalculation {
  id: string;
  period: string;
  vatPayable: number;
  vatReceivable: number;
  vatNet: number;
  incomeTax: number;
  corporateTax: number;
  totalTax: number;
  status: 'calculated' | 'reviewed' | 'approved';
}

interface TaxPlanning {
  id: string;
  title: string;
  description: string;
  potentialSavings: number;
  risk: 'low' | 'medium' | 'high';
  status: 'proposed' | 'implemented' | 'rejected';
  implementationDate?: string;
}

interface TaxRisk {
  id: string;
  type: 'overdue' | 'threshold' | 'anomaly' | 'compliance' | 'calculation';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  amount?: number;
  dueDate?: string;
  status: 'active' | 'resolved' | 'acknowledged';
  createdAt: string;
  resolvedAt?: string;
}

// Mock 税务申报数据
const mockTaxDeclarations: TaxDeclaration[] = [
  {
    id: '1',
    type: 'vat',
    period: '2024年12月',
    dueDate: '2025-01-15',
    status: 'submitted',
    amount: 125000,
    submittedDate: '2025-01-10',
    approvalDate: '2025-01-12',
    remarks: '申报成功，已通过审核'
  },
  {
    id: '2',
    type: 'income',
    period: '2024年第四季度',
    dueDate: '2025-01-31',
    status: 'pending',
    amount: 450000,
    remarks: '待申报'
  },
  {
    id: '3',
    type: 'corporate',
    period: '2024年度',
    dueDate: '2025-05-31',
    status: 'pending',
    amount: 1200000,
    remarks: '年度汇算清缴'
  },
  {
    id: '4',
    type: 'vat',
    period: '2024年11月',
    dueDate: '2024-12-15',
    status: 'approved',
    amount: 118000,
    submittedDate: '2024-12-10',
    approvalDate: '2024-12-12'
  },
  {
    id: '5',
    type: 'stamp',
    period: '2024年12月',
    dueDate: '2025-01-10',
    status: 'overdue',
    amount: 5000,
    remarks: '已逾期，需补缴滞纳金'
  }
];

// Mock 发票数据
const mockInvoices: Invoice[] = [
  {
    id: '1',
    number: 'INV-2024-001',
    type: 'output',
    date: '2024-12-15',
    amount: 1000000,
    taxRate: 0.13,
    taxAmount: 130000,
    customer: '客户A公司',
    status: 'valid',
    category: '销售商品'
  },
  {
    id: '2',
    number: 'INV-2024-002',
    type: 'input',
    date: '2024-12-10',
    amount: 800000,
    taxRate: 0.13,
    taxAmount: 104000,
    supplier: '供应商B公司',
    status: 'valid',
    category: '采购原材料'
  },
  {
    id: '3',
    number: 'INV-2024-003',
    type: 'output',
    date: '2024-12-20',
    amount: 500000,
    taxRate: 0.13,
    taxAmount: 65000,
    customer: '客户C公司',
    status: 'pending',
    category: '提供服务'
  },
  {
    id: '4',
    number: 'INV-2024-004',
    type: 'input',
    date: '2024-12-05',
    amount: 300000,
    taxRate: 0.13,
    taxAmount: 39000,
    supplier: '供应商D公司',
    status: 'invalid',
    category: '办公用品'
  }
];

// Mock 税款计算数据
const mockTaxCalculations: TaxCalculation[] = [
  {
    id: '1',
    period: '2024年12月',
    vatPayable: 130000,
    vatReceivable: 104000,
    vatNet: 26000,
    incomeTax: 450000,
    corporateTax: 1200000,
    totalTax: 1676000,
    status: 'approved'
  },
  {
    id: '2',
    period: '2024年11月',
    vatPayable: 118000,
    vatReceivable: 95000,
    vatNet: 23000,
    incomeTax: 420000,
    corporateTax: 0,
    totalTax: 443000,
    status: 'approved'
  }
];

// Mock 税务筹划数据
const mockTaxPlanning: TaxPlanning[] = [
  {
    id: '1',
    title: '研发费用加计扣除',
    description: '申请研发费用加计扣除75%，预计可节省企业所得税',
    potentialSavings: 150000,
    risk: 'low',
    status: 'implemented',
    implementationDate: '2024-06-01'
  },
  {
    id: '2',
    title: '高新技术企业认定',
    description: '申请高新技术企业认定，享受15%优惠税率',
    potentialSavings: 300000,
    risk: 'medium',
    status: 'proposed'
  },
  {
    id: '3',
    title: '固定资产加速折旧',
    description: '对符合条件的固定资产采用加速折旧方法',
    potentialSavings: 80000,
    risk: 'low',
    status: 'implemented',
    implementationDate: '2024-03-01'
  }
];

// Mock 税务风险预警数据
const mockTaxRisks: TaxRisk[] = [
  {
    id: '1',
    type: 'overdue',
    title: '印花税申报逾期',
    description: '2024年12月印花税申报已逾期，需立即补缴并缴纳滞纳金',
    severity: 'critical',
    amount: 5000,
    dueDate: '2025-01-10',
    status: 'active',
    createdAt: '2025-01-11'
  },
  {
    id: '2',
    type: 'threshold',
    title: '增值税税负率异常',
    description: '本月增值税税负率为2.6%，低于行业平均水平3.5%，可能存在税务风险',
    severity: 'high',
    status: 'active',
    createdAt: '2025-01-08'
  },
  {
    id: '3',
    type: 'anomaly',
    title: '进项税额异常增长',
    description: '本月进项税额较上月增长45%，超出正常波动范围，建议核查发票真实性',
    severity: 'medium',
    amount: 104000,
    status: 'active',
    createdAt: '2025-01-05'
  },
  {
    id: '4',
    type: 'compliance',
    title: '发票认证率偏低',
    description: '本月发票认证率为85%，低于标准要求90%，需及时处理未认证发票',
    severity: 'medium',
    status: 'acknowledged',
    createdAt: '2025-01-03'
  },
  {
    id: '5',
    type: 'calculation',
    title: '企业所得税预缴不足',
    description: '根据收入增长情况，建议增加企业所得税预缴金额，避免年度汇算时补税',
    severity: 'low',
    amount: 200000,
    status: 'resolved',
    createdAt: '2024-12-28',
    resolvedAt: '2025-01-02'
  }
];

export default function TaxPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'declaration' | 'invoice' | 'calculation' | 'planning'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2024年12月');
  const [showDeclarationForm, setShowDeclarationForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [selectedDeclaration, setSelectedDeclaration] = useState<TaxDeclaration | null>(null);

  const taxTypes = [
    { value: 'vat', label: '增值税', icon: Receipt },
    { value: 'income', label: '个人所得税', icon: TrendingUp },
    { value: 'corporate', label: '企业所得税', icon: DollarSign },
    { value: 'stamp', label: '印花税', icon: FileText },
    { value: 'customs', label: '关税', icon: Shield }
  ];

  const periods = [
    '2024年12月',
    '2024年11月',
    '2024年10月',
    '2024年第四季度',
    '2024年第三季度',
    '2024年度'
  ];

  const getTaxTypeLabel = (type: string) => {
    switch (type) {
      case 'vat': return '增值税';
      case 'income': return '个人所得税';
      case 'corporate': return '企业所得税';
      case 'stamp': return '印花税';
      case 'customs': return '关税';
      default: return '未知';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待申报';
      case 'submitted': return '已申报';
      case 'approved': return '已通过';
      case 'rejected': return '已驳回';
      case 'overdue': return '已逾期';
      default: return '未知';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'submitted': return FileText;
      case 'approved': return CheckCircle;
      case 'rejected': return AlertTriangle;
      case 'overdue': return AlertTriangle;
      default: return Clock;
    }
  };

  const getRiskTypeLabel = (type: string) => {
    switch (type) {
      case 'overdue': return '逾期风险';
      case 'threshold': return '阈值风险';
      case 'anomaly': return '异常风险';
      case 'compliance': return '合规风险';
      case 'calculation': return '计算风险';
      default: return '未知风险';
    }
  };

  const getRiskSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskSeverityText = (severity: string) => {
    switch (severity) {
      case 'critical': return '严重';
      case 'high': return '高危';
      case 'medium': return '中等';
      case 'low': return '低危';
      default: return '未知';
    }
  };

  const getRiskStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-50 border-red-200';
      case 'acknowledged': return 'bg-yellow-50 border-yellow-200';
      case 'resolved': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
  };

  const filteredDeclarations = mockTaxDeclarations.filter(declaration => 
    declaration.period === selectedPeriod
  );

  const filteredInvoices = mockInvoices.filter(invoice => 
    invoice.date.startsWith('2024-12')
  );

  const currentCalculation = mockTaxCalculations.find(calc => 
    calc.period === selectedPeriod
  );

  const handleSubmitDeclaration = (declaration: TaxDeclaration) => {
    // 模拟提交申报
    console.log('提交税务申报:', declaration);
    alert(`已提交${getTaxTypeLabel(declaration.type)}申报`);
  };

  const handleDownloadDeclaration = (declaration: TaxDeclaration) => {
    alert(`正在下载${getTaxTypeLabel(declaration.type)}申报表`);
  };

  const handleUploadInvoice = () => {
    alert('请选择要上传的发票文件');
  };

  const handleAcknowledgeRisk = (riskId: string) => {
    alert(`已确认风险预警：${riskId}`);
  };

  const handleResolveRisk = (riskId: string) => {
    alert(`已处理风险预警：${riskId}`);
  };

  const activeRisks = mockTaxRisks.filter(risk => risk.status === 'active');
  const criticalRisks = mockTaxRisks.filter(risk => risk.severity === 'critical');

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
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Receipt className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">税务管理</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="text-gray-400 hover:text-blue-600">
                <Settings className="w-5 h-5" />
              </button>
              <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                税务计算
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
              <label className="block text-sm font-medium text-gray-700 mb-2">报告期间</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {periods.map(period => (
                  <option key={period} value={period}>
                    {period}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end gap-3">
              <button
                onClick={() => setShowDeclarationForm(true)}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                新增申报
              </button>
              <button
                onClick={handleUploadInvoice}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                上传发票
              </button>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">本月应缴税款</p>
                <p className="text-2xl font-bold text-red-600">
                  {currentCalculation ? formatCurrency(currentCalculation.totalTax) : '¥0'}
                </p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">增值税净额</p>
                <p className="text-2xl font-bold text-orange-600">
                  {currentCalculation ? formatCurrency(currentCalculation.vatNet) : '¥0'}
                </p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Receipt className="w-4 h-4 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">待申报项目</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {filteredDeclarations.filter(d => d.status === 'pending').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">税务筹划收益</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(mockTaxPlanning.reduce((sum, plan) => sum + plan.potentialSavings, 0))}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 风险预警卡片 */}
        {criticalRisks.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-medium text-red-900">⚠️ 严重风险预警</h3>
            </div>
            <div className="space-y-2">
              {criticalRisks.map((risk) => (
                <div key={risk.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">{risk.title}</p>
                    <p className="text-xs text-red-700">{risk.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {risk.amount && (
                      <span className="text-sm font-medium text-red-900">
                        {formatCurrency(risk.amount)}
                      </span>
                    )}
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
                { key: 'overview', label: '概览', icon: TrendingUp },
                { key: 'declaration', label: '税务申报', icon: FileText },
                { key: 'invoice', label: '发票管理', icon: Receipt },
                { key: 'calculation', label: '税款计算', icon: Calculator },
                { key: 'planning', label: '税务筹划', icon: Shield }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-orange-500 text-orange-600'
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
                {/* 风险预警概览 */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">风险预警概览</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">活跃风险：</span>
                      <span className="text-sm font-medium text-red-600">{activeRisks.length}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeRisks.slice(0, 6).map((risk) => (
                      <div key={risk.id} className={`p-4 rounded-lg border ${getRiskStatusColor(risk.status)}`}>
                        <div className="flex items-start justify-between mb-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskSeverityColor(risk.severity)}`}>
                            {getRiskSeverityText(risk.severity)}
                          </span>
                          <span className="text-xs text-gray-500">{getRiskTypeLabel(risk.type)}</span>
                        </div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">{risk.title}</h4>
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{risk.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{formatDate(risk.createdAt)}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleAcknowledgeRisk(risk.id)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              确认
                            </button>
                            <button
                              onClick={() => handleResolveRisk(risk.id)}
                              className="text-xs text-green-600 hover:text-green-800"
                            >
                              处理
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {activeRisks.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Shield className="w-12 h-12 mx-auto mb-2 text-green-500" />
                      <p>暂无风险预警</p>
                    </div>
                  )}
                </div>

                {/* 税务申报状态和税款计算概览 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* 税务申报状态 */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">税务申报状态</h3>
                    <div className="space-y-3">
                      {filteredDeclarations.map((declaration) => {
                        const StatusIcon = getStatusIcon(declaration.status);
                        return (
                          <div key={declaration.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <StatusIcon className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {getTaxTypeLabel(declaration.type)}
                                </p>
                                <p className="text-xs text-gray-500">{declaration.period}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(declaration.status)}`}>
                                {getStatusText(declaration.status)}
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {formatCurrency(declaration.amount)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 税款计算概览 */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">税款计算概览</h3>
                    {currentCalculation && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-600">增值税应缴</p>
                            <p className="text-lg font-bold text-blue-600">{formatCurrency(currentCalculation.vatPayable)}</p>
                          </div>
                          <div className="p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-gray-600">增值税可抵</p>
                            <p className="text-lg font-bold text-green-600">{formatCurrency(currentCalculation.vatReceivable)}</p>
                          </div>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-lg">
                          <p className="text-sm text-gray-600">增值税净额</p>
                          <p className="text-xl font-bold text-orange-600">{formatCurrency(currentCalculation.vatNet)}</p>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg">
                          <p className="text-sm text-gray-600">总应缴税款</p>
                          <p className="text-xl font-bold text-red-600">{formatCurrency(currentCalculation.totalTax)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 税务申报 */}
            {activeTab === 'declaration' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">税务申报管理</h3>
                  <button
                    onClick={() => setShowDeclarationForm(true)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    新增申报
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          申报类型
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          申报期间
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          申报金额
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          截止日期
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          状态
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredDeclarations.map((declaration) => (
                        <tr key={declaration.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {getTaxTypeLabel(declaration.type)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {declaration.period}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(declaration.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(declaration.dueDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(declaration.status)}`}>
                              {getStatusText(declaration.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <div className="flex items-center justify-center gap-2">
                              {declaration.status === 'pending' && (
                                <button
                                  onClick={() => handleSubmitDeclaration(declaration)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  申报
                                </button>
                              )}
                              <button
                                onClick={() => handleDownloadDeclaration(declaration)}
                                className="text-green-600 hover:text-green-900"
                              >
                                下载
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 发票管理 */}
            {activeTab === 'invoice' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">发票管理</h3>
                  <button
                    onClick={handleUploadInvoice}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    上传发票
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredInvoices.map((invoice) => (
                    <div key={invoice.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-900">{invoice.number}</h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          invoice.status === 'valid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'invalid' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.status === 'valid' ? '有效' : invoice.status === 'invalid' ? '无效' : '待验证'}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">类型</span>
                          <span className="text-gray-900">{invoice.type === 'input' ? '进项' : '销项'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">日期</span>
                          <span className="text-gray-900">{formatDate(invoice.date)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">金额</span>
                          <span className="text-gray-900">{formatCurrency(invoice.amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">税率</span>
                          <span className="text-gray-900">{(invoice.taxRate * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">税额</span>
                          <span className="text-gray-900">{formatCurrency(invoice.taxAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">对方</span>
                          <span className="text-gray-900">{invoice.supplier || invoice.customer}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 税款计算 */}
            {activeTab === 'calculation' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">税款计算详情</h3>
                
                {currentCalculation && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 增值税计算 */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">增值税计算</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                          <span className="text-gray-700">销项税额</span>
                          <span className="text-blue-600 font-medium">{formatCurrency(currentCalculation.vatPayable)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <span className="text-gray-700">进项税额</span>
                          <span className="text-green-600 font-medium">{formatCurrency(currentCalculation.vatReceivable)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border-t">
                          <span className="text-gray-900 font-medium">应缴增值税</span>
                          <span className="text-orange-600 font-bold text-lg">{formatCurrency(currentCalculation.vatNet)}</span>
                        </div>
                      </div>
                    </div>

                    {/* 其他税种 */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">其他税种</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                          <span className="text-gray-700">个人所得税</span>
                          <span className="text-purple-600 font-medium">{formatCurrency(currentCalculation.incomeTax)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                          <span className="text-gray-700">企业所得税</span>
                          <span className="text-red-600 font-medium">{formatCurrency(currentCalculation.corporateTax)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border-t">
                          <span className="text-gray-900 font-medium">总应缴税款</span>
                          <span className="text-gray-900 font-bold text-lg">{formatCurrency(currentCalculation.totalTax)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 税务筹划 */}
            {activeTab === 'planning' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">税务筹划方案</h3>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    新增筹划
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockTaxPlanning.map((plan) => (
                    <div key={plan.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-medium text-gray-900">{plan.title}</h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          plan.status === 'implemented' ? 'bg-green-100 text-green-800' :
                          plan.status === 'proposed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {plan.status === 'implemented' ? '已实施' : plan.status === 'proposed' ? '建议中' : '已拒绝'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">预期收益</span>
                          <span className="text-green-600 font-medium">{formatCurrency(plan.potentialSavings)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">风险等级</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            plan.risk === 'low' ? 'bg-green-100 text-green-800' :
                            plan.risk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {plan.risk === 'low' ? '低风险' : plan.risk === 'medium' ? '中风险' : '高风险'}
                          </span>
                        </div>
                        {plan.implementationDate && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">实施日期</span>
                            <span className="text-sm text-gray-900">{formatDate(plan.implementationDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
