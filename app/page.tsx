'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Plus, Send, Bot, User, Trash2, RefreshCw, Paperclip, FileText, X, Upload, Edit2, Check, X as XIcon, ChevronLeft, ChevronRight, Receipt, Database, Download, BarChart3, FileText as FileTextIcon, Calculator, CreditCard, GripVertical, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  content?: string;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  attachments?: Attachment[];
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

const recommendedActions = [
  {
    title: "凭证录入处理",
    description: "上传凭证附件，AI自动识别并录入",
    prompt: "请帮我处理这些凭证附件，自动识别并录入到财务系统中。"
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
    title: '凭证管理',
    description: '上传原始凭证，生成会计凭证',
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

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
  };

  const deleteSession = (sessionId: string) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
    if (currentSession?.id === sessionId) {
      setCurrentSession(sessions.length > 1 ? sessions[1] : null);
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
    // 模拟凭证处理
    return attachments.map(attachment => ({
      fileName: attachment.name,
      type: '发票',
      amount: Math.floor(Math.random() * 10000) + 100,
      date: new Date().toLocaleDateString(),
      status: '已录入'
    }));
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
      
      if (attachments.length > 0) {
        const results = await processVouchers(attachments);
        aiResponse = `✅ 凭证处理完成！\n\n已成功识别并录入以下凭证：\n\n${results.map(result => 
          `📄 ${result.fileName}\n   - 类型：${result.type}\n   - 金额：¥${result.amount.toLocaleString()}\n   - 日期：${result.date}\n   - 状态：${result.status}\n`
        ).join('\n')}\n\n所有凭证已自动录入财务系统，请核对信息是否正确。`;
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
        timestamp: new Date()
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
    sendMessage(prompt);
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
              onClick={() => setCurrentSession(session)}
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
        {currentSession ? (
          <>
            {/* 聊天头部 */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">{currentSession.title}</h2>
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
                        onClick={() => handleRecommendedAction(action.prompt)}
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
    </div>
  );
}
