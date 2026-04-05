import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import ClientForm from '@/components/clients/ClientForm';

interface Cliente {
    id: number;
    nome: string;
    email?: string;
    telefone?: string;
    ativo: boolean;
    criadoEm: string;
}

export default function Clients() {
    const [, setLocation] = useLocation();
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;

    // Carregar clientes
    useEffect(() => {
        loadClientes();
    }, []);

    const loadClientes = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/clientes');
            setClientes(response.data);
        } catch (error: any) {
            toast.error('Erro ao carregar clientes');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateOrUpdate = async (data: Omit<Cliente, 'id' | 'criadoEm'>) => {
        try {
            if (selectedCliente) {
                // Atualizar
                await api.put(`/clientes/${selectedCliente.id}`, data);
                toast.success('Cliente atualizado com sucesso!');
            } else {
                // Criar
                await api.post('/clientes', data);
                toast.success('Cliente criado com sucesso!');
            }
            setIsDialogOpen(false);
            setSelectedCliente(null);
            loadClientes();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erro ao salvar cliente');
        }
    };

    const handleDelete = async () => {
        if (!selectedCliente) return;

        try {
            await api.delete(`/clientes/${selectedCliente.id}`);
            toast.success('Cliente deletado com sucesso!');
            setIsDeleteDialogOpen(false);
            setSelectedCliente(null);
            loadClientes();
        } catch (error: any) {
            toast.error('Erro ao deletar cliente');
        }
    };

    const handleOpenDialog = (cliente?: Cliente) => {
        setSelectedCliente(cliente || null);
        setIsDialogOpen(true);
    };

    // ===== FILTRAR CLIENTES =====
    const filteredClientes = clientes.filter(
        (cliente) =>
            cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cliente.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ===== PAGINAÇÃO =====
    const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedClientes = filteredClientes.slice(startIndex, endIndex);

    // Reset para página 1 quando filtro muda
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

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
                            <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
                            <p className="text-sm text-muted-foreground">Gerenciar clientes do seu negócio</p>
                        </div>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => handleOpenDialog()} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Novo Cliente
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {selectedCliente ? 'Editar Cliente' : 'Novo Cliente'}
                                </DialogTitle>
                                <DialogDescription>
                                    {selectedCliente
                                        ? 'Atualize as informações do cliente'
                                        : 'Preencha os dados do novo cliente'}
                                </DialogDescription>
                            </DialogHeader>
                            <ClientForm
                                cliente={selectedCliente || undefined}
                                onSubmit={handleCreateOrUpdate}
                                onCancel={() => {
                                    setIsDialogOpen(false);
                                    setSelectedCliente(null);
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Search Bar */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <Input
                            placeholder="Buscar por nome ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-md"
                        />
                    </CardContent>
                </Card>

                {/* Clientes Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Clientes</CardTitle>
                        <CardDescription>
                            Total: {filteredClientes.length} cliente(s)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : filteredClientes.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">Nenhum cliente encontrado</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nome</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Telefone</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Data de Criação</TableHead>
                                                <TableHead className="text-right">Ações</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedClientes.map((cliente) => (
                                                <TableRow key={cliente.id}>
                                                    <TableCell className="font-medium">{cliente.nome}</TableCell>
                                                    <TableCell>{cliente.email || '-'}</TableCell>
                                                    <TableCell>{cliente.telefone || '-'}</TableCell>
                                                    <TableCell>
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cliente.ativo
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-red-100 text-red-800'
                                                                }`}
                                                        >
                                                            {cliente.ativo ? 'Ativo' : 'Inativo'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(cliente.criadoEm).toLocaleDateString('pt-BR')}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleOpenDialog(cliente)}
                                                                className="gap-1"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedCliente(cliente);
                                                                    setIsDeleteDialogOpen(true);
                                                                }}
                                                                className="gap-1 text-destructive hover:text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination Controls */}
                                {filteredClientes.length > 0 && (
                                    <div className="flex items-center justify-between mt-4 px-4 py-3 border-t border-border">
                                        <div className="text-sm text-muted-foreground">
                                            Mostrando {startIndex + 1} a {Math.min(endIndex, filteredClientes.length)} de {filteredClientes.length} clientes
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                            >
                                                Anterior
                                            </Button>
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                    <Button
                                                        key={page}
                                                        variant={currentPage === page ? 'default' : 'outline'}
                                                        size="sm"
                                                        onClick={() => setCurrentPage(page)}
                                                        className="w-8 h-8 p-0"
                                                    >
                                                        {page}
                                                    </Button>
                                                ))}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                disabled={currentPage === totalPages}
                                            >
                                                Próximo
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </main>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Deletar Cliente</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja deletar o cliente "{selectedCliente?.nome}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-3 justify-end">
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Deletar
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}