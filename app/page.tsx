'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Plus, Send, Bot, User, Trash2, RefreshCw, Paperclip, FileText, X, Upload, Edit2, Check, X as XIcon, ChevronLeft, ChevronRight, Receipt, Database, Download, BarChart3, FileText as FileTextIcon, Calculator, CreditCard, GripVertical, Zap, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  content?: string;
}

interface VoucherData {
  id: string;
  voucherNumber: string; // 凭证字号
  date: string; // 凭证日期
  attachments: number; // 附件数量
  attachmentFiles: Attachment[]; // 附件文件列表
  summary: string; // 摘要
  entries: VoucherEntry[]; // 会计分录
  status: 'pending' | 'confirmed' | 'rejected';
  confidence: number;
  fileName: string; // 原始文件名
}

interface VoucherEntry {
  id: string;
  account: string; // 会计科目
  debit: number; // 借方金额
  credit: number; // 贷方金额
  summary: string; // 摘要
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  attachments?: Attachment[];
  voucherData?: VoucherData[];
  needsConfirmation?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

const accountOptions = [
  '库存现金', '银行存款', '应收账款', '预付账款', '其他应收款',
  '原材料', '库存商品', '固定资产', '累计折旧', '无形资产',
  '短期借款', '应付账款', '预收账款', '应付职工薪酬', '应交税费',
  '实收资本', '资本公积', '盈余公积', '本年利润', '利润分配',
  '主营业务收入', '其他业务收入', '营业外收入',
  '主营业务成本', '其他业务成本', '营业外支出',
  '销售费用', '管理费用', '财务费用', '研发费用'
];

const recommendedActions = [
  {
    title: "会计凭证录入",
    description: "上传原始凭证，AI自动生成标准会计凭证",
    prompt: "请帮我处理这些原始凭证，自动识别并生成符合会计规范的记账凭证。"
  },
  {
    title: "财务报表分析",
    description: "分析公司财务报表，评估财务状况",
    prompt: "请帮我分析一下这个公司的财务报表，重点关注盈利能力、偿债能力和运营效率。"
  },
  {
    title: "投资风险评估",
    description: "评估投资项目的风险和收益",
    prompt: "我想投资一个项目，请帮我评估一下投资风险和预期收益。"
  },
  {
    title: "税务筹划建议",
    description: "提供合法合规的税务优化建议",
    prompt: "请为我提供一些合法的税务筹划建议，帮助我合理节税。"
  },
  {
    title: "预算编制指导",
    description: "协助制定年度预算计划",
    prompt: "请帮我制定一个详细的年度预算计划，包括收入预测和支出控制。"
  },
  {
    title: "成本控制分析",
    description: "分析成本结构，提供优化建议",
    prompt: "请帮我分析公司的成本结构，并提供成本控制的具体建议。"
  },
  {
    title: "现金流管理",
    description: "优化现金流管理策略",
    prompt: "请帮我制定一个有效的现金流管理策略，确保公司资金安全。"
  }
];

const modules = [
  {
    id: 'vouchers',
    title: '会计凭证管理',
    description: '管理记账凭证，支持凭证录入、审核、查询',
    icon: Receipt,
    color: 'bg-green-500',
    href: '/vouchers'
  },
  {
    id: 'accounts',
    title: '账目管理',
    description: '查看和管理会计科目',
    icon: Database,
    color: 'bg-blue-500',
    href: '/accounts'
  },
  {
    id: 'reports',
    title: '财务报表',
    description: '生成各类财务报表',
    icon: BarChart3,
    color: 'bg-purple-500',
    href: '/reports'
  },
  {
    id: 'invoices',
    title: '发票管理',
    description: '管理进销项发票',
    icon: FileTextIcon,
    color: 'bg-orange-500',
    href: '/invoices'
  },
  {
    id: 'tax',
    title: '税务管理',
    description: '税务计算和申报',
    icon: Calculator,
    color: 'bg-red-500',
    href: '/tax'
  }
];

// 添加财务仪表板相关的接口
interface FinancialMetrics {
  totalAssets: number;
  totalLiabilities: number;
  netProfit: number;
  revenue: number;
  cashFlow: number;
  pendingVouchers: number;
  overdueInvoices: number;
  taxDeadlines: number;
}

interface RecentVoucher {
  id: string;
  voucherNumber: string;
  date: string;
  summary: string;
  amount: number;
  status: string;
}

interface TodoItem {
  id: string;
  title: string;
  type: 'voucher' | 'invoice' | 'tax' | 'report';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  completed: boolean;
}

interface FinancialTrend {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export default function FinanceAIChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [pendingVouchers, setPendingVouchers] = useState<VoucherData[]>([]);
  const [showVoucherConfirmation, setShowVoucherConfirmation] = useState(false);
  const [isHomePage, setIsHomePage] = useState(true); // 新增：首页状态
  const [editingVoucher, setEditingVoucher] = useState<VoucherData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // 财务仪表板数据
  const [financialMetrics] = useState<FinancialMetrics>({
    totalAssets: 2500000,
    totalLiabilities: 800000,
    netProfit: 320000,
    revenue: 1800000,
    cashFlow: 450000,
    pendingVouchers: 15,
    overdueInvoices: 3,
    taxDeadlines: 2
  });

  const [recentVouchers] = useState<RecentVoucher[]>([
    {
      id: '1',
      voucherNumber: 'V202412001',
      date: '2024-12-01',
      summary: '销售商品收入',
      amount: 50000,
      status: '已审核'
    },
    {
      id: '2',
      voucherNumber: 'V202412002',
      date: '2024-12-01',
      summary: '原材料采购',
      amount: 25000,
      status: '待审核'
    },
    {
      id: '3',
      voucherNumber: 'V202412003',
      date: '2024-12-01',
      summary: '办公用品采购',
      amount: 3000,
      status: '已审核'
    }
  ]);

  const [todoItems] = useState<TodoItem[]>([
    {
      id: '1',
      title: '审核12月份凭证',
      type: 'voucher',
      priority: 'high',
      dueDate: '2024-12-05',
      completed: false
    },
    {
      id: '2',
      title: '处理逾期发票',
      type: 'invoice',
      priority: 'high',
      dueDate: '2024-12-03',
      completed: false
    },
    {
      id: '3',
      title: '准备税务申报',
      type: 'tax',
      priority: 'medium',
      dueDate: '2024-12-10',
      completed: false
    },
    {
      id: '4',
      title: '编制月度报表',
      type: 'report',
      priority: 'medium',
      dueDate: '2024-12-08',
      completed: false
    }
  ]);

  const [financialTrends] = useState<FinancialTrend[]>([
    { month: '8月', revenue: 1500000, expenses: 1200000, profit: 300000 },
    { month: '9月', revenue: 1600000, expenses: 1250000, profit: 350000 },
    { month: '10月', revenue: 1700000, expenses: 1300000, profit: 400000 },
    { month: '11月', revenue: 1800000, expenses: 1350000, profit: 450000 },
    { month: '12月', revenue: 1800000, expenses: 1480000, profit: 320000 }
  ]);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: `新对话 ${sessions.length + 1}`,
      messages: [],
      createdAt: new Date()
    };
    setSessions([newSession, ...sessions]);
    setCurrentSession(newSession);
    setAttachments([]);
    setIsHomePage(false); // 进入会话界面
  };

  const deleteSession = (sessionId: string) => {
    const newSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(newSessions);
    
    if (currentSession?.id === sessionId) {
      if (newSessions.length > 0) {
        setCurrentSession(newSessions[0]);
      } else {
        setCurrentSession(null);
        setIsHomePage(true); // 所有会话删除后回到首页
      }
    }
  };

  const startEditingTitle = (session: ChatSession) => {
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
    setTimeout(() => {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }, 100);
  };

  const saveTitle = () => {
    if (!editingSessionId || !editingTitle.trim()) return;
    
    const updatedSessions = sessions.map(session => 
      session.id === editingSessionId 
        ? { ...session, title: editingTitle.trim() }
        : session
    );
    
    setSessions(updatedSessions);
    
    if (currentSession?.id === editingSessionId) {
      setCurrentSession({ ...currentSession, title: editingTitle.trim() });
    }
    
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const cancelEditing = () => {
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveTitle();
    } else if (e.key === 'Escape') {
      cancelEditing();
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
      setAttachments(prev => [...prev, attachment]);
    });
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  const processVouchers = async (attachments: Attachment[]) => {
    // 模拟凭证处理 - 符合会计凭证规范
    const mockAccounts = [
      '库存现金', '银行存款', '应收账款', '预付账款', '其他应收款',
      '原材料', '库存商品', '固定资产', '累计折旧', '无形资产',
      '短期借款', '应付账款', '预收账款', '应付职工薪酬', '应交税费',
      '实收资本', '资本公积', '盈余公积', '本年利润', '利润分配',
      '主营业务收入', '其他业务收入', '营业外收入',
      '主营业务成本', '其他业务成本', '营业外支出',
      '销售费用', '管理费用', '财务费用', '研发费用'
    ];
    
    const mockSummaries = [
      '办公用品采购',
      '差旅费报销',
      '业务招待费',
      '交通费支出',
      '通讯费支出',
      '广告宣传费',
      '培训费支出',
      '水电费支出',
      '房租费支出',
      '维修费支出',
      '保险费支出',
      '咨询费支出',
      '技术服务费',
      '材料采购',
      '商品销售',
      '工资发放',
      '税费缴纳',
      '利息收入',
      '利息支出'
    ];

    return attachments.map((attachment, index) => {
      const voucherNumber = `记${String(Date.now()).slice(-6)}-${String(index + 1).padStart(3, '0')}`;
      const date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString();
      const summary = mockSummaries[Math.floor(Math.random() * mockSummaries.length)];
      const confidence = Math.floor(Math.random() * 20) + 80; // 80-100% 置信度
      
      // 生成会计分录（至少一借一贷）
      const entries: VoucherEntry[] = [];
      const totalAmount = Math.floor(Math.random() * 5000) + 100;
      
      // 根据摘要类型生成相应的会计分录
      if (summary.includes('采购') || summary.includes('支出')) {
        // 费用类凭证
        entries.push({
          id: `entry_${Date.now()}_${index}_1`,
          account: '管理费用',
          debit: totalAmount,
          credit: 0,
          summary: summary
        });
        entries.push({
          id: `entry_${Date.now()}_${index}_2`,
          account: '银行存款',
          debit: 0,
          credit: totalAmount,
          summary: summary
        });
      } else if (summary.includes('销售')) {
        // 收入类凭证
        entries.push({
          id: `entry_${Date.now()}_${index}_1`,
          account: '银行存款',
          debit: totalAmount,
          credit: 0,
          summary: summary
        });
        entries.push({
          id: `entry_${Date.now()}_${index}_2`,
          account: '主营业务收入',
          debit: 0,
          credit: totalAmount,
          summary: summary
        });
      } else if (summary.includes('工资')) {
        // 工资类凭证
        entries.push({
          id: `entry_${Date.now()}_${index}_1`,
          account: '应付职工薪酬',
          debit: totalAmount,
          credit: 0,
          summary: summary
        });
        entries.push({
          id: `entry_${Date.now()}_${index}_2`,
          account: '银行存款',
          debit: 0,
          credit: totalAmount,
          summary: summary
        });
      } else {
        // 默认凭证
        entries.push({
          id: `entry_${Date.now()}_${index}_1`,
          account: '其他应收款',
          debit: totalAmount,
          credit: 0,
          summary: summary
        });
        entries.push({
          id: `entry_${Date.now()}_${index}_2`,
          account: '银行存款',
          debit: 0,
          credit: totalAmount,
          summary: summary
        });
      }

      return {
        id: `voucher_${Date.now()}_${index}`,
        voucherNumber: voucherNumber,
        date: date,
        attachments: 1,
        attachmentFiles: [attachment],
        summary: summary,
        entries: entries,
        status: 'pending' as const,
        confidence: confidence,
        fileName: attachment.name
      };
    });
  };

  const sendMessage = (content: string) => {
    if (!currentSession || (!content.trim() && attachments.length === 0)) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };

    const updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, userMessage]
    };

    setSessions(sessions.map(s => s.id === currentSession.id ? updatedSession : s));
    setCurrentSession(updatedSession);
    setInputMessage('');
    setIsLoading(true);

    // 模拟AI响应
    setTimeout(async () => {
      let aiResponse = '';
      let voucherResults: VoucherData[] = [];
      
      if (attachments.length > 0) {
        voucherResults = await processVouchers(attachments);
        setPendingVouchers(voucherResults);
        setShowVoucherConfirmation(true);
        
        aiResponse = `🔍 凭证识别完成！\n\n已成功识别以下凭证信息：\n\n${voucherResults.map(result => 
          `📄 ${result.fileName}\n   - 凭证字号：${result.voucherNumber}\n   - 日期：${result.date}\n   - 摘要：${result.summary}\n   - 附件：${result.attachments}张\n   - 置信度：${result.confidence}%\n   - 会计分录：\n${result.entries.map(entry => 
            `     ${entry.account} ${entry.debit > 0 ? `借 ${entry.debit.toLocaleString()}` : `贷 ${entry.credit.toLocaleString()}`}`
          ).join('\n')}\n`
        ).join('\n')}\n\n请确认以下信息是否正确，确认后将录入到财务系统中。`;
      } else {
        const aiResponses = [
          "根据您的问题，我建议从以下几个方面进行分析：首先，我们需要查看相关的财务数据；其次，进行市场环境分析；最后，制定相应的策略。",
          "这是一个很好的财务问题。让我为您详细分析一下：1. 风险评估 2. 收益预测 3. 市场趋势 4. 建议方案。",
          "基于您提供的信息，我的专业建议是：重点关注现金流管理，优化成本结构，并建立完善的风险控制体系。",
          "从财务角度来说，这个项目需要考虑：投资回报率、风险系数、市场前景等因素。我建议进行更深入的分析。",
          "关于税务筹划，我建议：1. 合理利用税收优惠政策 2. 优化企业结构 3. 合规经营 4. 定期咨询专业税务师。"
        ];
        aiResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        role: 'assistant',
        timestamp: new Date(),
        voucherData: attachments.length > 0 ? voucherResults : undefined,
        needsConfirmation: attachments.length > 0
      };

      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, aiMessage]
      };

      setSessions(sessions.map(s => s.id === currentSession.id ? finalSession : s));
      setCurrentSession(finalSession);
      setIsLoading(false);
      setAttachments([]);
    }, 2000);
  };

  const handleRecommendedAction = (prompt: string) => {
    setInputMessage(prompt);
    // 聚焦到输入框
    setTimeout(() => {
      const inputElement = document.querySelector('textarea[name="message"]') as HTMLTextAreaElement;
      if (inputElement) {
        inputElement.focus();
      }
    }, 100);
  };

  const handleVoucherConfirmation = (voucherId: string, action: 'confirm' | 'reject') => {
    setPendingVouchers(prev => prev.map(voucher => 
      voucher.id === voucherId 
        ? { ...voucher, status: action === 'confirm' ? 'confirmed' : 'rejected' }
        : voucher
    ));
  };

  const handleConfirmAllVouchers = () => {
    const confirmedVouchers = pendingVouchers.map(voucher => ({ ...voucher, status: 'confirmed' as const }));
    
    // 添加确认消息
    const confirmationMessage: Message = {
      id: Date.now().toString(),
      content: `✅ 凭证确认完成！\n\n已成功录入以下凭证到财务系统：\n\n${confirmedVouchers.map(voucher => 
        `📄 ${voucher.fileName}\n   - 凭证字号：${voucher.voucherNumber}\n   - 摘要：${voucher.summary}\n   - 状态：已录入\n`
      ).join('\n')}\n\n所有凭证已成功录入财务系统，您可以在凭证管理模块中查看。`,
      role: 'assistant',
      timestamp: new Date()
    };

    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        messages: [...currentSession.messages, confirmationMessage]
      };
      setSessions(sessions.map(s => s.id === currentSession.id ? updatedSession : s));
      setCurrentSession(updatedSession);
    }

    setPendingVouchers([]);
    setShowVoucherConfirmation(false);
  };

  const handleRejectAllVouchers = () => {
    setPendingVouchers([]);
    setShowVoucherConfirmation(false);
    
    // 添加拒绝消息
    const rejectionMessage: Message = {
      id: Date.now().toString(),
      content: '❌ 已取消凭证录入。\n\n如需重新处理，请重新上传凭证附件。',
      role: 'assistant',
      timestamp: new Date()
    };

    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        messages: [...currentSession.messages, rejectionMessage]
      };
      setSessions(sessions.map(s => s.id === currentSession.id ? updatedSession : s));
      setCurrentSession(updatedSession);
    }
  };

  const goToHomePage = () => {
    setIsHomePage(true);
    setCurrentSession(null);
    setAttachments([]);
    setPendingVouchers([]);
    setShowVoucherConfirmation(false);
  };

  const handleEditVoucher = (voucher: VoucherData) => {
    setEditingVoucher(voucher);
    setShowEditModal(true);
  };

  const handleSaveVoucherEdit = () => {
    if (!editingVoucher) return;
    
    // 更新pendingVouchers中的凭证
    setPendingVouchers(prev => 
      prev.map(v => v.id === editingVoucher.id ? {
        ...editingVoucher,
        attachments: editingVoucher.attachmentFiles.length
      } : v)
    );
    
    setShowEditModal(false);
    setEditingVoucher(null);
  };

  const handleCancelVoucherEdit = () => {
    setShowEditModal(false);
    setEditingVoucher(null);
  };

  const handleVoucherEditChange = (field: keyof VoucherData, value: any) => {
    if (!editingVoucher) return;
    setEditingVoucher({ ...editingVoucher, [field]: value });
  };

  const handleEntryEditChange = (entryId: string, field: keyof VoucherEntry, value: any) => {
    if (!editingVoucher) return;
    
    const updatedEntries = editingVoucher.entries.map(entry => 
      entry.id === entryId ? { ...entry, [field]: value } : entry
    );
    
    setEditingVoucher({ ...editingVoucher, entries: updatedEntries });
  };

  const addEntryToVoucher = () => {
    if (!editingVoucher) return;
    
    const newEntry: VoucherEntry = {
      id: `entry_${Date.now()}_${Math.random()}`,
      account: '',
      debit: 0,
      credit: 0,
      summary: ''
    };
    
    setEditingVoucher({
      ...editingVoucher,
      entries: [...editingVoucher.entries, newEntry]
    });
  };

  const removeEntryFromVoucher = (entryId: string) => {
    if (!editingVoucher || editingVoucher.entries.length <= 2) return;
    
    const updatedEntries = editingVoucher.entries.filter(entry => entry.id !== entryId);
    setEditingVoucher({ ...editingVoucher, entries: updatedEntries });
  };

  const getTotalDebit = (entries: VoucherEntry[]) => {
    return entries.reduce((sum, entry) => sum + entry.debit, 0);
  };

  const getTotalCredit = (entries: VoucherEntry[]) => {
    return entries.reduce((sum, entry) => sum + entry.credit, 0);
  };

  const handleFileUploadForEdit = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !editingVoucher) return;

    Array.from(files).forEach(file => {
      const attachment: Attachment = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file)
      };
      setEditingVoucher(prev => prev ? {
        ...prev,
        attachmentFiles: [...prev.attachmentFiles, attachment],
        attachments: prev.attachmentFiles.length + 1
      } : null);
    });
  };

  const removeAttachmentFromVoucher = (attachmentId: string) => {
    if (!editingVoucher) return;
    
    setEditingVoucher({
      ...editingVoucher,
      attachmentFiles: editingVoucher.attachmentFiles.filter(att => att.id !== attachmentId),
      attachments: editingVoucher.attachmentFiles.length - 1
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth > 200 && newWidth < 500) {
      setRightSidebarWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 左侧边栏 */}
      <div className={cn(
        "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
        leftSidebarCollapsed ? "w-16" : "w-80"
      )}>
        {/* 头部 */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {leftSidebarCollapsed ? (
            <div className="flex items-center justify-center w-full">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
          ) : (
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-blue-600" />
              财务AI助手
            </h1>
          )}
          <button
            onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
            className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
            title={leftSidebarCollapsed ? "展开侧边栏" : "收起侧边栏"}
          >
            {leftSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
        
        {leftSidebarCollapsed ? (
          <div className="p-2">
            <button
              onClick={createNewSession}
              className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              title="新建对话"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-4">
            <button
              onClick={createNewSession}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              新建对话
            </button>
          </div>
        )}

        {/* 对话列表 */}
        <div className="flex-1 overflow-y-auto">
          {!leftSidebarCollapsed && (
            <div className="px-4 pb-2">
              <h3 className="text-sm font-medium text-gray-700 mb-3">对话记录</h3>
            </div>
          )}
          
          {sessions.map((session) => (
            <div
              key={session.id}
              className={cn(
                "border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors",
                leftSidebarCollapsed ? "p-2" : "p-4",
                currentSession?.id === session.id && "bg-blue-50 border-blue-200"
              )}
              onClick={() => {
                setCurrentSession(session);
                setIsHomePage(false);
              }}
            >
              {leftSidebarCollapsed ? (
                // 收起状态：只显示图标
                <div className="flex flex-col items-center justify-center">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center mb-1",
                    currentSession?.id === session.id ? "bg-blue-600" : "bg-gray-200"
                  )}>
                    <MessageCircle className={cn(
                      "w-4 h-4",
                      currentSession?.id === session.id ? "text-white" : "text-gray-600"
                    )} />
                  </div>
                  <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                </div>
              ) : (
                // 展开状态：显示完整内容
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    {editingSessionId === session.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          ref={titleInputRef}
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={handleTitleKeyPress}
                          onBlur={saveTitle}
                          className="flex-1 text-sm font-medium text-gray-900 bg-white border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          maxLength={50}
                        />
                        <button
                          onClick={saveTitle}
                          className="text-green-600 hover:text-green-700 p-1"
                          title="保存"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="text-red-600 hover:text-red-700 p-1"
                          title="取消"
                        >
                          <XIcon className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group">
                        <h3 className="text-sm font-medium text-gray-900 truncate flex-1">
                          {session.title}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditingTitle(session);
                          }}
                          className="text-gray-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100 p-1"
                          title="编辑标题"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {session.messages.length} 条消息
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="删除对话"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* MCP功能区域 */}
        <div className="border-t border-gray-200">
          {!leftSidebarCollapsed && (
            <div className="px-4 py-2">
              <h3 className="text-sm font-medium text-gray-700 mb-3">AI助手功能</h3>
            </div>
          )}
          
          {leftSidebarCollapsed ? (
            <div className="p-2">
              <a
                href="/mcp-apps"
                className="flex flex-col items-center justify-center p-2 text-center text-xs text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                title="第三方服务集成管理"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-500 mb-1">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-400"></div>
              </a>
            </div>
          ) : (
            <div className="px-4 pb-4">
              <a
                href="/mcp-apps"
                className="flex items-center gap-3 p-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                title="第三方服务集成管理"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-500">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">财务MCP</div>
                  <div className="text-xs text-gray-500 truncate">第三方服务集成管理</div>
                </div>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col">
        {isHomePage ? (
          // 首页内容
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex gap-6">
              {/* 左侧主要内容区域 */}
              <div className="flex-1 space-y-6">
                {/* 财务仪表板 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">财务概览</h3>
                  
                  {/* 关键指标 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600 font-medium">总资产</p>
                          <p className="text-xl font-bold text-blue-900">¥{financialMetrics.totalAssets.toLocaleString()}</p>
                        </div>
                        <Database className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600 font-medium">净利润</p>
                          <p className="text-xl font-bold text-green-900">¥{financialMetrics.netProfit.toLocaleString()}</p>
                        </div>
                        <BarChart3 className="w-8 h-8 text-green-600" />
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-purple-600 font-medium">营业收入</p>
                          <p className="text-xl font-bold text-purple-900">¥{financialMetrics.revenue.toLocaleString()}</p>
                        </div>
                        <CreditCard className="w-8 h-8 text-purple-600" />
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-orange-600 font-medium">现金流</p>
                          <p className="text-xl font-bold text-orange-900">¥{financialMetrics.cashFlow.toLocaleString()}</p>
                        </div>
                        <Calculator className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>

                  {/* 待办事项和提醒 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">待办事项</h4>
                      <div className="space-y-2">
                        {todoItems.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              item.priority === 'high' ? 'bg-red-500' : 
                              item.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                            )} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 truncate">{item.title}</p>
                              <p className="text-xs text-gray-500">截止: {item.dueDate}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">重要提醒</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 p-2 bg-red-50 rounded-lg">
                          <Receipt className="w-4 h-4 text-red-600" />
                          <div>
                            <p className="text-sm text-red-900 font-medium">{financialMetrics.pendingVouchers} 张凭证待审核</p>
                            <p className="text-xs text-red-600">需要及时处理</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
                          <FileTextIcon className="w-4 h-4 text-yellow-600" />
                          <div>
                            <p className="text-sm text-yellow-900 font-medium">{financialMetrics.overdueInvoices} 张发票逾期</p>
                            <p className="text-xs text-yellow-600">需要跟进处理</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                          <Calculator className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="text-sm text-blue-900 font-medium">{financialMetrics.taxDeadlines} 个税务截止日期</p>
                            <p className="text-xs text-blue-600">需要提前准备</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 最近凭证 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">最近凭证</h3>
                    <a href="/vouchers" className="text-sm text-blue-600 hover:text-blue-700">查看全部</a>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">凭证号</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">日期</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">摘要</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">金额</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {recentVouchers.map((voucher) => (
                          <tr key={voucher.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900">{voucher.voucherNumber}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{voucher.date}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{voucher.summary}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">¥{voucher.amount.toLocaleString()}</td>
                            <td className="px-4 py-2">
                              <span className={cn(
                                "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                                voucher.status === '已审核' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              )}>
                                {voucher.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 财务趋势图 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">财务趋势</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {financialTrends.slice(-3).map((trend, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">{trend.month}</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">收入:</span>
                            <span className="text-green-600 font-medium">¥{trend.revenue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">支出:</span>
                            <span className="text-red-600 font-medium">¥{trend.expenses.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm font-medium">
                            <span className="text-gray-700">利润:</span>
                            <span className={cn(
                              trend.profit >= 0 ? 'text-green-600' : 'text-red-600'
                            )}>¥{trend.profit.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 右侧AI助手推荐区域 */}
              <div className="w-80 flex-shrink-0">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">AI助手推荐</h3>
                    <button
                      onClick={createNewSession}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      新建会话
                    </button>
                  </div>
                  <div className="space-y-3">
                    {recommendedActions.map((action, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors group"
                        onClick={() => {
                          createNewSession();
                          setTimeout(() => {
                            setInputMessage(action.prompt);
                            // 聚焦到输入框
                            const inputElement = document.querySelector('textarea[name="message"]') as HTMLTextAreaElement;
                            if (inputElement) {
                              inputElement.focus();
                            }
                          }, 100);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Zap className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{action.title}</h4>
                            <p className="text-sm text-gray-600">{action.description}</p>
                          </div>
                          <div className="text-gray-400 group-hover:text-blue-600 transition-colors">
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : currentSession ? (
          // 会话界面
          <>
            {/* 聊天头部 */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={goToHomePage}
                    className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                    title="返回首页"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-lg font-semibold text-gray-800">{currentSession.title}</h2>
                </div>
                <button
                  onClick={() => startEditingTitle(currentSession)}
                  className="text-gray-400 hover:text-blue-600 transition-colors p-2"
                  title="编辑对话标题"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentSession.messages.length === 0 && (
                <div className="text-center py-8">
                  <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">欢迎使用财务AI助手</h3>
                  <p className="text-gray-500 mb-6">我可以帮助您进行财务分析、投资评估、税务筹划等工作，还可以处理凭证附件</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                    {recommendedActions.map((action, index) => (
                      <div
                        key={index}
                        className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
                        onClick={() => {
                          setInputMessage(action.prompt);
                          // 聚焦到输入框
                          const inputElement = document.querySelector('textarea[name="message"]') as HTMLTextAreaElement;
                          if (inputElement) {
                            inputElement.focus();
                          }
                        }}
                      >
                        <h4 className="font-medium text-gray-900 mb-1">{action.title}</h4>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentSession.messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={cn(
                      "max-w-[70%] p-3 rounded-lg",
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.attachments.map((attachment) => (
                          <div key={attachment.id} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span className="text-xs text-blue-800">{attachment.name}</span>
                            <span className="text-xs text-blue-600">({formatFileSize(attachment.size)})</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <p className={cn(
                      "text-xs mt-1",
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    )}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>

                  {message.role === 'user' && (
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 text-gray-900 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span className="text-sm">AI正在思考中...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 凭证确认组件 */}
              {showVoucherConfirmation && pendingVouchers.length > 0 && (
                <div className="bg-white border border-blue-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Check className="w-5 h-5 text-blue-600" />
                      凭证确认
                    </h3>
                    <span className="text-sm text-gray-500">
                      请确认以下凭证信息是否正确
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    {pendingVouchers.map((voucher) => (
                      <div
                        key={voucher.id}
                        className={cn(
                          "border rounded-lg p-3 transition-colors",
                          voucher.status === 'confirmed' ? "border-green-200 bg-green-50" :
                          voucher.status === 'rejected' ? "border-red-200 bg-red-50" :
                          "border-gray-200 bg-gray-50"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span className="font-medium text-gray-900">{voucher.fileName}</span>
                              <span className={cn(
                                "px-2 py-1 text-xs rounded-full",
                                voucher.confidence >= 90 ? "bg-green-100 text-green-800" :
                                voucher.confidence >= 80 ? "bg-yellow-100 text-yellow-800" :
                                "bg-red-100 text-red-800"
                              )}>
                                置信度: {voucher.confidence}%
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-600">凭证字号:</span>
                                <span className="ml-1 text-gray-900">{voucher.voucherNumber}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">日期:</span>
                                <span className="ml-1 text-gray-900">{voucher.date}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">附件:</span>
                                <span className="ml-1 text-gray-900">{voucher.attachments}张</span>
                              </div>
                              <div>
                                <span className="text-gray-600">摘要:</span>
                                <span className="ml-1 text-gray-900">{voucher.summary}</span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-gray-600">附件文件:</span>
                                <div className="mt-1 space-y-1">
                                  {voucher.attachmentFiles.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs bg-blue-50 p-1 rounded">
                                      <FileText className="w-3 h-3 text-blue-600" />
                                      <span className="text-gray-700">{file.name}</span>
                                      <span className="text-gray-500">({formatFileSize(file.size)})</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="col-span-2">
                                <span className="text-gray-600">会计分录:</span>
                                <div className="mt-1 space-y-1">
                                  {voucher.entries.map((entry, idx) => (
                                    <div key={entry.id} className="text-xs bg-gray-100 p-1 rounded">
                                      {entry.account} {entry.debit > 0 ? `借 ${entry.debit.toLocaleString()}` : `贷 ${entry.credit.toLocaleString()}`}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            {voucher.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleEditVoucher(voucher)}
                                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                >
                                  编辑
                                </button>
                                <button
                                  onClick={() => handleVoucherConfirmation(voucher.id, 'confirm')}
                                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                                >
                                  确认
                                </button>
                                <button
                                  onClick={() => handleVoucherConfirmation(voucher.id, 'reject')}
                                  className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                                >
                                  拒绝
                                </button>
                              </>
                            )}
                            {voucher.status === 'confirmed' && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                已确认
                              </span>
                            )}
                            {voucher.status === 'rejected' && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                已拒绝
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      已确认: {pendingVouchers.filter(v => v.status === 'confirmed').length} / 
                      已拒绝: {pendingVouchers.filter(v => v.status === 'rejected').length} / 
                      待处理: {pendingVouchers.filter(v => v.status === 'pending').length}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleRejectAllVouchers}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        全部取消
                      </button>
                      <button
                        onClick={handleConfirmAllVouchers}
                        disabled={pendingVouchers.every(v => v.status === 'pending')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        确认录入
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 附件列表 */}
            {attachments.length > 0 && (
              <div className="bg-gray-50 border-t border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">已选择的附件 ({attachments.length})</h4>
                  <button
                    onClick={() => setAttachments([])}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    清空全部
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200"
                    >
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700 max-w-32 truncate">{attachment.name}</span>
                      <span className="text-xs text-gray-500">{formatFileSize(attachment.size)}</span>
                      <button
                        onClick={() => removeAttachment(attachment.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 输入框 */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2"
                  title="上传凭证附件"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputMessage)}
                  placeholder={attachments.length > 0 ? "输入备注信息（可选）..." : "输入您的财务问题或上传凭证附件..."}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  onClick={() => sendMessage(inputMessage)}
                  disabled={(!inputMessage.trim() && attachments.length === 0) || isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              
              <div className="mt-2 text-xs text-gray-500">
                支持的文件格式：PDF、图片、Word、Excel等凭证文件
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">开始新的对话</h3>
              <p className="text-gray-500 mb-4">点击"新建对话"开始与AI助手交流</p>
              <button
                onClick={createNewSession}
                className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                新建对话
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 右侧边栏 - 功能模块 */}
      <div className={cn(
        "bg-white border-l border-gray-200 flex flex-col transition-all duration-300",
        rightSidebarCollapsed ? "w-16" : `w-[${rightSidebarWidth}px]`
      )} style={{ width: rightSidebarCollapsed ? '64px' : `${rightSidebarWidth}px` }}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {rightSidebarCollapsed ? (
            <div className="flex items-center justify-center w-full">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          ) : (
            <h2 className="text-lg font-semibold text-gray-800">功能模块</h2>
          )}
          <button
            onClick={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
            className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
            title={rightSidebarCollapsed ? "展开功能模块" : "收起功能模块"}
          >
            {rightSidebarCollapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {rightSidebarCollapsed ? (
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-2">
              {modules.map((module) => (
                <a
                  key={module.id}
                  href={module.href}
                  className="flex flex-col items-center justify-center p-2 text-center text-xs text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  title={module.description}
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-1", module.color)}>
                    <module.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                </a>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {modules.map((module) => (
                <a
                  key={module.id}
                  href={module.href}
                  className="flex items-center gap-3 p-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  title={module.description}
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", module.color)}>
                    <module.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">{module.title}</div>
                    <div className="text-xs text-gray-500 truncate">{module.description}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 调整宽度的拖拽条 */}
      {!rightSidebarCollapsed && (
        <div
          className="w-1 bg-gray-200 hover:bg-gray-300 cursor-col-resize flex items-center justify-center"
          onMouseDown={handleMouseDown}
        >
          <GripVertical className="w-3 h-3 text-gray-400" />
        </div>
      )}

      {/* 编辑凭证模态框 */}
      {showEditModal && editingVoucher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">编辑凭证</h2>
              <button
                onClick={handleCancelVoucherEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* 基本信息 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      凭证字号
                    </label>
                    <input
                      type="text"
                      value={editingVoucher.voucherNumber}
                      onChange={(e) => handleVoucherEditChange('voucherNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      日期
                    </label>
                    <input
                      type="date"
                      value={editingVoucher.date}
                      onChange={(e) => handleVoucherEditChange('date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      摘要
                    </label>
                    <input
                      type="text"
                      value={editingVoucher.summary}
                      onChange={(e) => handleVoucherEditChange('summary', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      附件管理
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileUploadForEdit}
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
                    {editingVoucher.attachmentFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">已上传的附件:</h4>
                        {editingVoucher.attachmentFiles.map((attachment) => (
                          <div key={attachment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <div>
                                <p className="text-sm text-gray-900">{attachment.name}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeAttachmentFromVoucher(attachment.id)}
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
                          ¥{getTotalDebit(editingVoucher.entries).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">贷方合计:</span>
                        <p className="text-lg font-semibold text-green-600">
                          ¥{getTotalCredit(editingVoucher.entries).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="text-sm text-gray-600">差额:</span>
                      <p className={cn(
                        "text-lg font-semibold",
                        Math.abs(getTotalDebit(editingVoucher.entries) - getTotalCredit(editingVoucher.entries)) < 0.01
                          ? "text-green-600"
                          : "text-red-600"
                      )}>
                        ¥{(getTotalDebit(editingVoucher.entries) - getTotalCredit(editingVoucher.entries)).toLocaleString()}
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
                    onClick={addEntryToVoucher}
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
                          会计科目
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
                      {editingVoucher.entries.map((entry, index) => (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 border-b border-gray-200">
                            <select
                              value={entry.account}
                              onChange={(e) => handleEntryEditChange(entry.id, 'account', e.target.value)}
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
                              onChange={(e) => handleEntryEditChange(entry.id, 'summary', e.target.value)}
                              placeholder="摘要"
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </td>
                          <td className="px-4 py-3 border-b border-gray-200">
                            <input
                              type="number"
                              value={entry.debit}
                              onChange={(e) => handleEntryEditChange(entry.id, 'debit', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              step="0.01"
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </td>
                          <td className="px-4 py-3 border-b border-gray-200">
                            <input
                              type="number"
                              value={entry.credit}
                              onChange={(e) => handleEntryEditChange(entry.id, 'credit', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              step="0.01"
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </td>
                          <td className="px-4 py-3 border-b border-gray-200">
                            {editingVoucher.entries.length > 2 && (
                              <button
                                onClick={() => removeEntryFromVoucher(entry.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                删除
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={handleCancelVoucherEdit}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveVoucherEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
