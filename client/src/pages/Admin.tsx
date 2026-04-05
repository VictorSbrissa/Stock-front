import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, ArrowLeft, Loader2 } from 'lucide-react';

interface Tenant {
  id: string;
  connectionString: string;
  criadoEm: string;
}

interface User {
  id: string;
  username: string;
  email: string;
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const { hasRole } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProvisioningDialogOpen, setIsProvisioningDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [newTenantId, setNewTenantId] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!hasRole('Admin')) {
      setLocation('/');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // Carregar tenants
      const tenantsResponse = await api.get('/admin/tenants');
      setTenants(tenantsResponse.data);

      // Carregar usuários
      const usersResponse = await api.get('/admin/users');
      setUsers(usersResponse.data);
    } catch (error: any) {
      toast.error('Erro ao carregar dados de administração');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProvisionTenant = async () => {
    if (!newTenantId.trim()) {
      toast.error('ID do tenant é obrigatório');
      return;
    }

    setIsProcessing(true);
    try {
      await api.post('/admin/provision-tenant', {
        tenantId: newTenantId,
      });
      toast.success(`Tenant "${newTenantId}" provisionado com sucesso!`);
      setNewTenantId('');
      setIsProvisioningDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao provisionar tenant');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) {
      toast.error('Selecione um usuário e uma role');
      return;
    }

    setIsProcessing(true);
    try {
      await api.post('/admin/assign-role', {
        username: selectedUser.username,
        roleName: selectedRole,
      });
      toast.success(`Role "${selectedRole}" atribuída ao usuário "${selectedUser.username}"`);
      setSelectedUser(null);
      setSelectedRole('');
      setIsRoleDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao atribuir role');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Administração</h1>
              <p className="text-sm text-muted-foreground">Gerenciar tenants e permissões</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Tenants Section */}
            <div>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>Tenants</CardTitle>
                    <CardDescription>Gerenciar tenants da aplicação</CardDescription>
                  </div>
                  <Dialog open={isProvisioningDialogOpen} onOpenChange={setIsProvisioningDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Novo Tenant
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Provisionar Novo Tenant</DialogTitle>
                        <DialogDescription>
                          Crie um novo tenant com seu próprio banco de dados isolado
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="tenantId" className="text-sm font-medium">
                            ID do Tenant *
                          </label>
                          <Input
                            id="tenantId"
                            placeholder="ex: acme-corp"
                            value={newTenantId}
                            onChange={(e) => setNewTenantId(e.target.value)}
                            disabled={isProcessing}
                          />
                          <p className="text-xs text-muted-foreground">
                            Use apenas letras, números e hífens
                          </p>
                        </div>
                        <div className="flex gap-3 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => setIsProvisioningDialogOpen(false)}
                            disabled={isProcessing}
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={handleProvisionTenant}
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Provisionando...
                              </>
                            ) : (
                              'Provisionar'
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {tenants.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Nenhum tenant provisionado</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tenants.map((tenant) => (
                        <div
                          key={tenant.id}
                          className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50"
                        >
                          <p className="font-medium text-sm">{tenant.id}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Criado em: {new Date(tenant.criadoEm).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Roles Section */}
            <div>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>Atribuir Roles</CardTitle>
                    <CardDescription>Gerenciar permissões de usuários</CardDescription>
                  </div>
                  <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Atribuir Role
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Atribuir Role a Usuário</DialogTitle>
                        <DialogDescription>
                          Selecione um usuário e uma role para atribuir
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="user" className="text-sm font-medium">
                            Usuário *
                          </label>
                          <select
                            id="user"
                            value={selectedUser?.id || ''}
                            onChange={(e) => {
                              const user = users.find((u) => u.id === e.target.value);
                              setSelectedUser(user || null);
                            }}
                            disabled={isProcessing}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background"
                          >
                            <option value="">Selecione um usuário</option>
                            {users.map((user) => (
                              <option key={user.id} value={user.id}>
                                {user.username} ({user.email})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="role" className="text-sm font-medium">
                            Role *
                          </label>
                          <select
                            id="role"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            disabled={isProcessing}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background"
                          >
                            <option value="">Selecione uma role</option>
                            <option value="Admin">Admin</option>
                            <option value="UsuarioComum">Usuário Comum</option>
                          </select>
                        </div>
                        <div className="flex gap-3 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => setIsRoleDialogOpen(false)}
                            disabled={isProcessing}
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={handleAssignRole}
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Atribuindo...
                              </>
                            ) : (
                              'Atribuir'
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {users.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Nenhum usuário encontrado</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Usuário</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-right">Ação</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.username}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setSelectedRole('');
                                    setIsRoleDialogOpen(true);
                                  }}
                                >
                                  Atribuir
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
