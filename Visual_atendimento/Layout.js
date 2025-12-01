import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  LayoutDashboard, 
  MessageCircle, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
  Bell,
  Palette,
  FileText,
  Key,
  Zap,
  History,
  MessagesSquare
} from "lucide-react";
import NotificationCenter from '@/components/notifications/NotificationCenter';
import NotificationGenerator from '@/components/notifications/NotificationGenerator';

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69260470b8978dee91937d1a/9d2ceea12_Logos-VisualImpretexedesign.png";

const navigation = [
  { name: 'Dashboard', href: 'Dashboard', icon: LayoutDashboard, permission: null },
  { name: 'Atendimentos', href: 'Conversations', icon: MessageCircle, permission: 'view_conversations' },
  { name: 'Chat Interno', href: 'InternalChat', icon: MessagesSquare, permission: 'view_conversations' },
  { name: 'Catálogo', href: 'Products', icon: Package, permission: 'view_products' },
  { name: 'Desenvolvimentos', href: 'Developments', icon: FileText, permission: 'view_developments' },
  { name: 'Pedidos', href: 'Orders', icon: ShoppingCart, permission: 'view_orders' },
  { name: 'Clientes', href: 'Customers', icon: Users, permission: 'view_customers' },
  { name: 'Acessos Clientes', href: 'ClientAccessManager', icon: Key, permission: 'manage_customers' },
  { name: 'Equipe', href: 'UserManagement', icon: User, permission: 'manage_users' },
  { name: 'Automações', href: 'Automations', icon: Zap, permission: 'manage_automations' },
  { name: 'Cadastros Gerais', href: 'CadastrosGerais', icon: Settings, permission: 'manage_settings' },
  { name: 'Histórico', href: 'ActivityLogs', icon: History, permission: 'manage_settings' },
  { name: 'Notificações', href: 'Notifications', icon: Bell, permission: null },
];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Carregar usuário atual
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Carregar conversas para badge
  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations-count'],
    queryFn: () => base44.entities.Conversation.filter(
      { status: 'waiting' },
      '-last_message_at',
      100
    ),
    refetchInterval: 10000
  });

  const waitingCount = conversations.length;

  // Carregar notificações não lidas
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => base44.entities.Notification.filter(
      { is_read: false },
      '-created_date',
      100
    ),
    refetchInterval: 30000
  });

  const notificationCount = notifications.length;

  const handleLogout = () => {
    base44.auth.logout();
  };

  // Full screen pages without sidebar
  const fullScreenPages = ['Conversations', 'ClientPortal', 'InternalChat'];
  const isFullScreen = fullScreenPages.includes(currentPageName);

  if (isFullScreen) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
            <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2">
              <img 
                src={LOGO_URL} 
                alt="Visual Etiquetas" 
                className="h-8 w-auto object-contain"
              />
            </Link>
            <button 
              className="lg:hidden p-1 hover:bg-slate-100 rounded"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
                      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                          // Check permission - admin sees all, others need specific permission
                          const hasPermission = 
                            currentUser?.role === 'admin' || 
                            item.permission === null || 
                            currentUser?.permissions?.includes(item.permission);

                          if (!hasPermission) return null;

                          const isActive = currentPageName === item.href;
                          const Icon = item.icon;
                          const showBadge = (item.href === 'Conversations' && waitingCount > 0) || 
                            (item.href === 'Notifications' && notificationCount > 0);

                          return (
                            <Link
                              key={item.href}
                              to={createPageUrl(item.href)}
                              onClick={() => setSidebarOpen(false)}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
                                isActive 
                                  ? "bg-slate-900 text-white" 
                                  : "text-slate-600 hover:bg-slate-100"
                              )}
                            >
                              <Icon className="w-5 h-5" />
                              <span className="font-medium">{item.name}</span>
                              {showBadge && (
                                <Badge className="ml-auto bg-red-500 text-white border-0 text-xs px-1.5">
                                  {item.href === 'Conversations' ? waitingCount : notificationCount}
                                </Badge>
                              )}
                            </Link>
                          );
                        })}
                      </nav>

          {/* User section */}
          <div className="p-4 border-t border-slate-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center">
                    <span className="font-semibold text-slate-600 text-sm">
                      {currentUser?.full_name?.charAt(0) || currentUser?.email?.charAt(0) || "?"}
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-slate-900 text-sm truncate">
                      {currentUser?.full_name || 'Usuário'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {currentUser?.email}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{currentUser?.full_name}</p>
                  <p className="text-xs text-slate-500">{currentUser?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Meu perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-sm border-b border-slate-200 px-4 flex items-center justify-between lg:px-6">
          <button 
            className="p-2 hover:bg-slate-100 rounded-lg lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <NotificationCenter />
          </div>
        </header>

        {/* Gerador de notificações automáticas */}
        <NotificationGenerator />

        {/* Page content */}
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}