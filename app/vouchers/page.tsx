'use client';

import { useState, useRef } from 'react';
import { Receipt, Upload, FileText, X, Database, Download, ArrowLeft, Plus, Edit2, Trash2, Save, Check, Eye } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
}

interface Voucher {
  id: string;
  originalFile: Attachment;
  voucherNumber: string;
  date: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  debitAmount: number;
  creditAmount: number;
  status: 'pending' | 'processed' | 'approved';
  createdAt: Date;
}

// Mock 会计科目数据
const accountOptions = [
  { value: '1001', label: '库存现金' },
  { value: '1002', label: '银行存款' },
  { value: '1122', label: '应收账款' },
  { value: '1403', label: '原材料' },
  { value: '1405', label: '库存商品' },
  { value: '2201', label: '应付账款' },
  { value: '2211', label: '应付职工薪酬' },
  { value: '2221', label: '应交税费' },
  { value: '4001', label: '实收资本' },
  { value: '5101', label: '主营业务收入' },
  { value: '5401', label: '主营业务成本' },
  { value: '5601', label: '销售费用' },
  { value: '5602', label: '管理费用' },
  { value: '5603', label: '财务费用' },
];

// Mock 初始凭证数据
const mockVouchers: Voucher[] = [
  {
    id: '1',
    originalFile: {
      id: 'file1',
      name: '销售发票.pdf',
      type: 'application/pdf',
      size: 1024000,
      url: '#'
    },
    voucherNumber: 'V202412001',
    date: '2024-12-01',
    description: '销售商品收入',
    debitAccount: '银行存款',
    creditAccount: '主营业务收入',
    debitAmount: 50000,
    creditAmount: 50000,
    status: 'approved',
    createdAt: new Date('2024-12-01')
  },
  {
    id: '2',
    originalFile: {
      id: 'file2',
      name: '采购发票.jpg',
      type: 'image/jpeg',
      size: 512000,
      url: '#'
    },
    voucherNumber: 'V202412002',
    date: '2024-12-01',
    description: '原材料采购',
    debitAccount: '原材料',
    creditAccount: '银行存款',
    debitAmount: 25000,
    creditAmount: 25000,
    status: 'processed',
    createdAt: new Date('2024-12-01')
  }
];

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>(mockVouchers);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [viewingVoucher, setViewingVoucher] = useState<Voucher | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 新增凭证表单状态
  const [formData, setFormData] = useState({
    originalFile: null as Attachment | null,
    description: '',
    debitAccount: '',
    creditAccount: '',
    debitAmount: '',
    creditAmount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const attachment: Attachment = {
      id: Date.now().toString(),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file)
    };

    setFormData(prev => ({ ...prev, originalFile: attachment }));
    
    // 模拟自动识别填入其他字段
    setTimeout(() => {
      const mockRecognition = {
        description: '销售商品收入',
        debitAccount: '银行存款',
        creditAccount: '主营业务收入',
        debitAmount: '50000',
        creditAmount: '50000'
      };
      
      setFormData(prev => ({
        ...prev,
        ...mockRecognition
      }));
    }, 1000);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.originalFile || !formData.description || !formData.debitAccount || 
        !formData.creditAccount || !formData.debitAmount || !formData.creditAmount) {
      alert('请填写所有必填字段');
      return;
    }

    const newVoucher: Voucher = {
      id: Date.now().toString(),
      originalFile: formData.originalFile,
      voucherNumber: `V${String(Date.now()).slice(-6)}`,
      date: formData.date,
      description: formData.description,
      debitAccount: formData.debitAccount,
      creditAccount: formData.creditAccount,
      debitAmount: parseFloat(formData.debitAmount),
      creditAmount: parseFloat(formData.creditAmount),
      status: 'pending',
      createdAt: new Date()
    };

    setVouchers(prev => [newVoucher, ...prev]);
    resetForm();
    setShowAddForm(false);
  };

  const handleEdit = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setFormData({
      originalFile: voucher.originalFile,
      description: voucher.description,
      debitAccount: voucher.debitAccount,
      creditAccount: voucher.creditAccount,
      debitAmount: voucher.debitAmount.toString(),
      creditAmount: voucher.creditAmount.toString(),
      date: voucher.date
    });
    setShowAddForm(true);
  };

  const handleUpdate = () => {
    if (!editingVoucher) return;

    const updatedVoucher: Voucher = {
      ...editingVoucher,
      description: formData.description,
      debitAccount: formData.debitAccount,
      creditAccount: formData.creditAccount,
      debitAmount: parseFloat(formData.debitAmount),
      creditAmount: parseFloat(formData.creditAmount),
      date: formData.date
    };

    setVouchers(prev => prev.map(v => v.id === editingVoucher.id ? updatedVoucher : v));
    resetForm();
    setEditingVoucher(null);
    setShowAddForm(false);
  };

  const handleDelete = (voucherId: string) => {
    if (confirm('确定要删除这个凭证吗？')) {
      setVouchers(prev => prev.filter(v => v.id !== voucherId));
    }
  };

  const resetForm = () => {
    setFormData({
      originalFile: null,
      description: '',
      debitAccount: '',
      creditAccount: '',
      debitAmount: '',
      creditAmount: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processed': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待审核';
      case 'processed': return '已处理';
      case 'approved': return '已审核';
      default: return '未知';
    }
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
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <Receipt className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">凭证管理</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">
                共 {vouchers.length} 个凭证
              </div>
              <button
                onClick={() => {
                  setShowAddForm(true);
                  setEditingVoucher(null);
                  resetForm();
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                新增凭证
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showAddForm ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                {editingVoucher ? '编辑凭证' : '新增凭证'}
              </h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingVoucher(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 左侧：原始凭证上传 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    原始凭证 <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    {formData.originalFile ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{formData.originalFile.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(formData.originalFile.size)}</p>
                          </div>
                          <button
                            onClick={() => setFormData(prev => ({ ...prev, originalFile: null }))}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-green-600">✓ 文件已上传，正在识别...</p>
                      </div>
                    ) : (
                      <div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <Upload className="w-5 h-5" />
                          选择文件
                        </button>
                        <p className="text-sm text-gray-500 mt-2">支持PDF、图片、Word、Excel等格式</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* 右侧：凭证信息 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    摘要 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="请输入凭证摘要"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    借方科目 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.debitAccount}
                    onChange={(e) => handleInputChange('debitAccount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">请选择借方科目</option>
                    {accountOptions.map(account => (
                      <option key={account.value} value={account.label}>
                        {account.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    贷方科目 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.creditAccount}
                    onChange={(e) => handleInputChange('creditAccount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">请选择贷方科目</option>
                    {accountOptions.map(account => (
                      <option key={account.value} value={account.label}>
                        {account.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      借方金额 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.debitAmount}
                      onChange={(e) => handleInputChange('debitAmount', e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      贷方金额 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.creditAmount}
                      onChange={(e) => handleInputChange('creditAmount', e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingVoucher(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={editingVoucher ? handleUpdate : handleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                {editingVoucher ? <Edit2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {editingVoucher ? '更新凭证' : '保存凭证'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">凭证列表</h2>
            </div>
            
            {vouchers.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无凭证</h3>
                <p className="text-gray-500 mb-4">点击"新增凭证"开始创建会计凭证</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  新增凭证
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        凭证号
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        日期
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        摘要
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        借方科目
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        贷方科目
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        借方金额
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        贷方金额
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        状态
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vouchers.map((voucher) => (
                      <tr key={voucher.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {voucher.voucherNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {voucher.date}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {voucher.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {voucher.debitAccount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {voucher.creditAccount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ¥{voucher.debitAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ¥{voucher.creditAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={cn("inline-flex px-2 py-1 text-xs font-semibold rounded-full", getStatusColor(voucher.status))}>
                            {getStatusText(voucher.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setViewingVoucher(voucher)}
                              className="text-blue-600 hover:text-blue-900"
                              title="查看详情"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(voucher)}
                              className="text-green-600 hover:text-green-900"
                              title="编辑"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(voucher.id)}
                              className="text-red-600 hover:text-red-900"
                              title="删除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 查看凭证详情模态框 */}
      {viewingVoucher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">凭证详情</h3>
                <button
                  onClick={() => setViewingVoucher(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">凭证号</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingVoucher.voucherNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">日期</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingVoucher.date}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">摘要</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingVoucher.description}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">借方科目</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingVoucher.debitAccount}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">贷方科目</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingVoucher.creditAccount}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">借方金额</label>
                  <p className="mt-1 text-sm text-gray-900">¥{viewingVoucher.debitAmount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">贷方金额</label>
                  <p className="mt-1 text-sm text-gray-900">¥{viewingVoucher.creditAmount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">状态</label>
                  <p className="mt-1">
                    <span className={cn("inline-flex px-2 py-1 text-xs font-semibold rounded-full", getStatusColor(viewingVoucher.status))}>
                      {getStatusText(viewingVoucher.status)}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">创建时间</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingVoucher.createdAt.toLocaleString()}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">原始凭证</label>
                  <div className="mt-1 flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{viewingVoucher.originalFile.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(viewingVoucher.originalFile.size)}</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200">
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setViewingVoucher(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  关闭
                </button>
                <button
                  onClick={() => {
                    handleEdit(viewingVoucher);
                    setViewingVoucher(null);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  编辑凭证
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
