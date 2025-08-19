'use client';

import { useState, useRef } from 'react';
import { Receipt, Upload, FileText, X, ArrowLeft, Plus, Edit2, Trash2, Save, Eye, Minus } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface VoucherEntry {
  id: string;
  account: string;
  debit: number;
  credit: number;
  summary: string;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface Voucher {
  id: string;
  voucherNumber: string;
  date: string;
  summary: string;
  entries: VoucherEntry[];
  attachments: Attachment[];
  status: 'pending' | 'processed' | 'approved';
}

const accountOptions = [
  '库存现金', '银行存款', '应收账款', '原材料', '库存商品',
  '应付账款', '应付职工薪酬', '应交税费', '实收资本',
  '主营业务收入', '主营业务成本', '销售费用', '管理费用', '财务费用'
];

const mockVouchers: Voucher[] = [
  {
    id: '1',
    voucherNumber: 'V202412001',
    date: '2024-12-01',
    summary: '销售商品收入',
    entries: [
      { id: '1', account: '银行存款', debit: 50000, credit: 0, summary: '销售商品收入' },
      { id: '2', account: '主营业务收入', debit: 0, credit: 50000, summary: '销售商品收入' }
    ],
    attachments: [
      {
        id: '1',
        name: '销售发票.pdf',
        type: 'application/pdf',
        size: 1024000,
        url: '#'
      }
    ],
    status: 'approved'
  }
];

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>(mockVouchers);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [viewingVoucher, setViewingVoucher] = useState<Voucher | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    summary: '',
    date: new Date().toISOString().split('T')[0],
    entries: [
      { id: '1', account: '', debit: 0, credit: 0, summary: '' },
      { id: '2', account: '', debit: 0, credit: 0, summary: '' }
    ] as VoucherEntry[],
    attachments: [] as Attachment[]
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEntryChange = (entryId: string, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      entries: prev.entries.map(entry => 
        entry.id === entryId ? { ...entry, [field]: value } : entry
      )
    }));
  };

  const addEntry = () => {
    const newEntry: VoucherEntry = {
      id: Date.now().toString(),
      account: '',
      debit: 0,
      credit: 0,
      summary: formData.summary
    };
    setFormData(prev => ({
      ...prev,
      entries: [...prev.entries, newEntry]
    }));
  };

  const removeEntry = (entryId: string) => {
    if (formData.entries.length <= 2) return;
    setFormData(prev => ({
      ...prev,
      entries: prev.entries.filter(entry => entry.id !== entryId)
    }));
  };

  const validateEntries = () => {
    const totalDebit = formData.entries.reduce((sum, entry) => sum + entry.debit, 0);
    const totalCredit = formData.entries.reduce((sum, entry) => sum + entry.credit, 0);
    return Math.abs(totalDebit - totalCredit) < 0.01;
  };

  const handleSubmit = () => {
    if (!formData.summary || !validateEntries()) {
      alert('请填写摘要并确保借贷平衡');
      return;
    }

    const newVoucher: Voucher = {
      id: Date.now().toString(),
      voucherNumber: `V${String(Date.now()).slice(-6)}`,
      date: formData.date,
      summary: formData.summary,
      entries: formData.entries.filter(entry => entry.account && (entry.debit > 0 || entry.credit > 0)),
      attachments: formData.attachments || [],
      status: 'pending'
    };

    setVouchers(prev => [newVoucher, ...prev]);
    resetForm();
    setShowAddForm(false);
  };

  const handleEdit = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setFormData({
      summary: voucher.summary,
      date: voucher.date,
      entries: voucher.entries.length > 0 ? voucher.entries : [
        { id: '1', account: '', debit: 0, credit: 0, summary: voucher.summary },
        { id: '2', account: '', debit: 0, credit: 0, summary: voucher.summary }
      ],
      attachments: voucher.attachments || []
    });
    setShowAddForm(true);
  };

  const handleUpdate = () => {
    if (!editingVoucher) return;

    if (!validateEntries()) {
      alert('借贷不平衡，请检查会计分录');
      return;
    }

    const updatedVoucher: Voucher = {
      ...editingVoucher,
      summary: formData.summary,
      date: formData.date,
      entries: formData.entries.filter(entry => entry.account && (entry.debit > 0 || entry.credit > 0)),
      attachments: formData.attachments
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
      summary: '',
      date: new Date().toISOString().split('T')[0],
      entries: [
        { id: '1', account: '', debit: 0, credit: 0, summary: '' },
        { id: '2', account: '', debit: 0, credit: 0, summary: '' }
      ],
      attachments: []
    });
  };

  const getTotalDebit = (entries: VoucherEntry[]) => {
    return entries.reduce((sum, entry) => sum + entry.debit, 0);
  };

  const getTotalCredit = (entries: VoucherEntry[]) => {
    return entries.reduce((sum, entry) => sum + entry.credit, 0);
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const attachment: Attachment = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file)
      };
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, attachment]
      }));
    });
  };

  const removeAttachment = (attachmentId: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att.id !== attachmentId)
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
                <h1 className="text-xl font-semibold text-gray-900">会计凭证管理</h1>
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
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* 基本信息 */}
              <div className="space-y-4">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    摘要 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.summary}
                    onChange={(e) => handleInputChange('summary', e.target.value)}
                    placeholder="请输入凭证摘要"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    附件上传
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex flex-col items-center justify-center py-4 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Upload className="w-8 h-8 mb-2" />
                      <span className="text-sm">点击上传附件</span>
                      <span className="text-xs text-gray-500 mt-1">支持 PDF、Word、Excel、图片等格式</span>
                    </button>
                  </div>
                  
                  {/* 已上传的附件列表 */}
                  {formData.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">已上传的附件:</h4>
                      {formData.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <div>
                              <p className="text-sm text-gray-900">{attachment.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeAttachment(attachment.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 借贷平衡检查 */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">借贷平衡检查</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">借方合计:</span>
                      <p className="text-lg font-semibold text-red-600">
                        ¥{getTotalDebit(formData.entries).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">贷方合计:</span>
                      <p className="text-lg font-semibold text-green-600">
                        ¥{getTotalCredit(formData.entries).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-sm text-gray-600">差额:</span>
                    <p className={cn(
                      "text-lg font-semibold",
                      Math.abs(getTotalDebit(formData.entries) - getTotalCredit(formData.entries)) < 0.01
                        ? "text-green-600"
                        : "text-red-600"
                    )}>
                      ¥{(getTotalDebit(formData.entries) - getTotalCredit(formData.entries)).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 会计分录表格 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">会计分录</h3>
                <button
                  onClick={addEntry}
                  className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  添加分录
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        序号
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        会计科目 <span className="text-red-500">*</span>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        摘要
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        借方金额
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        贷方金额
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.entries.map((entry, index) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200">
                          <select
                            value={entry.account}
                            onChange={(e) => handleEntryChange(entry.id, 'account', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          >
                            <option value="">请选择科目</option>
                            {accountOptions.map(account => (
                              <option key={account} value={account}>
                                {account}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200">
                          <input
                            type="text"
                            value={entry.summary}
                            onChange={(e) => handleEntryChange(entry.id, 'summary', e.target.value)}
                            placeholder="摘要"
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200">
                          <input
                            type="number"
                            value={entry.debit}
                            onChange={(e) => handleEntryChange(entry.id, 'debit', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            step="0.01"
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200">
                          <input
                            type="number"
                            value={entry.credit}
                            onChange={(e) => handleEntryChange(entry.id, 'credit', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            step="0.01"
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200">
                          {formData.entries.length > 2 && (
                            <button
                              onClick={() => removeEntry(entry.id)}
                              className="text-red-600 hover:text-red-700"
                              title="删除分录"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowAddForm(false);
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
                <Save className="w-4 h-4" />
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
                        借方合计
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        贷方合计
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        附件
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
                          {voucher.summary}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ¥{getTotalDebit(voucher.entries).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ¥{getTotalCredit(voucher.entries).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {voucher.attachments.length > 0 ? (
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span>{voucher.attachments.length}个</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">无</span>
                          )}
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
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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
              <div className="grid grid-cols-2 gap-4 mb-6">
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
                  <p className="mt-1 text-sm text-gray-900">{viewingVoucher.summary}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">状态</label>
                  <p className="mt-1">
                    <span className={cn("inline-flex px-2 py-1 text-xs font-semibold rounded-full", getStatusColor(viewingVoucher.status))}>
                      {getStatusText(viewingVoucher.status)}
                    </span>
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">附件</label>
                  <div className="mt-1">
                    {viewingVoucher.attachments.length > 0 ? (
                      <div className="space-y-2">
                        {viewingVoucher.attachments.map((attachment) => (
                          <div key={attachment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <div>
                                <p className="text-sm text-gray-900">{attachment.name}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                              </div>
                            </div>
                            <a
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              查看
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">无附件</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 会计分录表格 */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">会计分录</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          序号
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          会计科目
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          摘要
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          借方金额
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          贷方金额
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {viewingVoucher.entries.map((entry, index) => (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900 border-b border-gray-200">
                            {index + 1}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 border-b border-gray-200">
                            {entry.account}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 border-b border-gray-200">
                            {entry.summary}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 border-b border-gray-200">
                            {entry.debit > 0 ? `¥${entry.debit.toLocaleString()}` : '-'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 border-b border-gray-200">
                            {entry.credit > 0 ? `¥${entry.credit.toLocaleString()}` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900 border-t border-gray-200" colSpan={3}>
                          合计
                        </td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900 border-t border-gray-200">
                          ¥{getTotalDebit(viewingVoucher.entries).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900 border-t border-gray-200">
                          ¥{getTotalCredit(viewingVoucher.entries).toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200">
              <div className="flex items-center justify-end">
                <button
                  onClick={() => setViewingVoucher(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
