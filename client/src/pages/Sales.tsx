import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SaleForm from '@/components/sales/SaleForm';

interface Cliente {
    id: number;
    nome: string;
}

interface Venda {
    id: number;
    clienteId: number;
    cliente: Cliente | null;
    dataVenda: string;
    valorTotal: number;
    valorPago: number;
    statusPagamento: 0 | 1 | 2;
}

export default function Sales() {
    const [, setLocation] = useLocation();
    const [vendas, setVendas] = useState<Venda[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedVenda, setSelectedVenda] = useState<Venda | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [filterClientName, setFilterClientName] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [activeTab, setActiveTab] = useState<string>('visao-geral');
    const [periodType, setPeriodType] = useState<'hoje' | 'semana' | 'mes' | 'personalizado'>('hoje');
    const [customStartDate, setCustomStartDate] = useState<string>('');
    const [customEndDate, setCustomEndDate] = useState<string>('');
    const [chartViewMode, setChartViewMode] = useState<'semanal' | 'mensal'>('semanal');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;

    // Carregar vendas
    useEffect(() => {
        loadVendas();
    }, []);

    const loadVendas = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/vendas');
            setVendas(response.data);
        } catch (error: any) {
            toast.error('Erro ao carregar vendas');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateOrUpdate = async (data: any) => {
        try {
            if (selectedVenda) {
                // Atualizar
                await api.put(`/vendas/${selectedVenda.id}`, data);
                toast.success('Venda atualizada com sucesso!');
            } else {
                // Criar
                await api.post('/vendas', data);
                toast.success('Venda criada com sucesso!');
            }
            setIsDialogOpen(false);
            setSelectedVenda(null);
            loadVendas();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erro ao salvar venda');
        }
    };

    const handleDelete = async () => {
        if (!selectedVenda) return;

        try {
            await api.delete(`/vendas/${selectedVenda.id}`);
            toast.success('Venda deletada com sucesso!');
            setIsDeleteDialogOpen(false);
            setSelectedVenda(null);
            loadVendas();
        } catch (error: any) {
            toast.error('Erro ao deletar venda');
        }
    };

    const handleOpenDialog = (venda?: Venda) => {
        setSelectedVenda(venda || null);
        setIsDialogOpen(true);
    };

    // ===== FILTRAR E ORDENAR VENDAS =====
    const filteredVendas = vendas
        .filter((venda) => {
            if (filterStatus) {
                const vendaStatus = typeof venda.statusPagamento === 'number'
                    ? (venda.statusPagamento === 0 ? 'PAGO' : 'PENDENTE')
                    : venda.statusPagamento;
                if (vendaStatus !== filterStatus) return false;
            }

            if (filterClientName) {
                const clienteName = venda.cliente?.nome || `Cliente #${venda.clienteId}`;
                if (!clienteName.toLowerCase().includes(filterClientName.toLowerCase())) return false;
            }

            return true;
        })
        .sort((a, b) => {
            const dateA = new Date(a.dataVenda).getTime();
            const dateB = new Date(b.dataVenda).getTime();
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

    // ===== PAGINAÇÃO =====
    const totalPages = Math.ceil(filteredVendas.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedVendas = filteredVendas.slice(startIndex, endIndex);

    // Reset para página 1 quando filtros mudam
    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus, filterClientName, sortOrder]);

    const getStatusColor = (status: number | string) => {
        const statusStr = typeof status === 'number' ? (status === 0 ? 'PAGO' : 'PENDENTE') : status;
        switch (statusStr) {
            case 'PAGO':
            case 0:
                return 'bg-green-100 text-green-800';
            case 'PENDENTE':
            case 1:
                return 'bg-yellow-100 text-yellow-800';
            case 'CANCELADO':
            case 2:
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: number | string) => {
        if (typeof status === 'number') {
            return status === 0 ? 'Pago' : status === 1 ? 'Pendente' : 'Cancelado';
        }
        return status;
    };

    // Calcular período para filtro
    const getPeriodDates = () => {
        const end = new Date();
        const start = new Date();

        switch (periodType) {
            case 'hoje':
                start.setDate(end.getDate());
                break;
            case 'semana':
                start.setDate(end.getDate() - 6);
                break;
            case 'mes':
                start.setDate(end.getDate() - 29);
                break;
            case 'personalizado':
                if (customStartDate && customEndDate) {
                    return {
                        start: new Date(customStartDate),
                        end: new Date(customEndDate),
                    };
                }
                start.setDate(end.getDate());
                break;
        }

        return { start, end };
    };

    const { start: periodStart, end: periodEnd } = getPeriodDates();
    const startStr = periodStart.toISOString().split('T')[0];
    const endStr = periodEnd.toISOString().split('T')[0];

    // Filtrar vendas pelo período
    const vendasPeriodo = vendas.filter(v => {
        const vendaDate = v.dataVenda.split('T')[0];
        return vendaDate >= startStr && vendaDate <= endStr;
    });

    const totalVendasPeriodo = vendasPeriodo.length;
    const totalFaturadoPeriodo = vendasPeriodo.reduce((sum, v) => sum + v.valorTotal, 0);
    const totalPagoPeriodo = vendasPeriodo.reduce((sum, v) => sum + v.valorPago, 0);
    const totalPendentePeriodo = totalFaturadoPeriodo - totalPagoPeriodo;

    // Calcular estatísticas do dia
    const today = new Date().toISOString().split('T')[0];
    const vendasHoje = vendas.filter(v => v.dataVenda.split('T')[0] === today);
    const totalVendasHoje = vendasHoje.length;
    const totalFaturadoHoje = vendasHoje.reduce((sum, v) => sum + v.valorTotal, 0);
    const totalPagoHoje = vendasHoje.reduce((sum, v) => sum + v.valorPago, 0);
    const totalPendenteHoje = totalFaturadoHoje - totalPagoHoje;

    // Calcular dados do gráfico (semanal ou mensal)
    const getChartData = () => {
        const data = [];
        const daysToShow = chartViewMode === 'semanal' ? 6 : 29;

        for (let i = daysToShow; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });

            const vendasDia = vendas.filter(v => v.dataVenda.split('T')[0] === dateStr);
            const totalFaturado = vendasDia.reduce((sum, v) => sum + v.valorTotal, 0);
            const totalPago = vendasDia.reduce((sum, v) => sum + v.valorPago, 0);

            data.push({
                dia: dayName,
                data: dateStr,
                vendas: vendasDia.length,
                faturado: parseFloat(totalFaturado.toFixed(2)),
                pago: parseFloat(totalPago.toFixed(2)),
            });
        }
        return data;
    };

    // Retornar o toolTipo do Gráfico
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const item = payload[0].payload;

            const faturado = item.faturado || 0;
            const pago = item.pago || 0;

            const dataFormatada = item.data.split('-').reverse().join('/');

            return (
                <div className="bg-white p-3 rounded-lg shadow-md border">
                    <p className="text-sm font-semibold mb-2">
                        📅 {dataFormatada}
                    </p>

                    <div className="flex flex-col gap-1">
                        <span className="text-blue-600 font-medium">
                            💰 Faturado: R$ {faturado.toFixed(2).replace('.', ',')}
                        </span>

                        <span className="text-green-600 font-medium">
                            ✅ Pago: R$ {pago.toFixed(2).replace('.', ',')}
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    };

    const chartData = getChartData();

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
                            <h1 className="text-2xl font-bold text-slate-900">Vendas</h1>
                            <p className="text-sm text-muted-foreground">Gerenciar vendas e pagamentos</p>
                        </div>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => handleOpenDialog()} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Nova Venda
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {selectedVenda ? 'Editar Venda' : 'Nova Venda'}
                                </DialogTitle>
                                <DialogDescription>
                                    {selectedVenda
                                        ? 'Atualize os dados da venda'
                                        : 'Preencha os dados da nova venda'}
                                </DialogDescription>
                            </DialogHeader>
                            <SaleForm
                                sale={selectedVenda || undefined}
                                onSubmit={handleCreateOrUpdate}
                                onCancel={() => {
                                    setIsDialogOpen(false);
                                    setSelectedVenda(null);
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
                        <TabsTrigger value="extrato">Extrato</TabsTrigger>
                    </TabsList>

                    {/* Aba: Visão Geral */}
                    <TabsContent value="visao-geral" className="space-y-6">
                        {/* Filter Bar */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Buscar por Cliente</label>
                                        <Input
                                            placeholder="Digite o nome do cliente..."
                                            value={filterClientName}
                                            onChange={(e) => setFilterClientName(e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Filtrar por Status</label>
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                                        >
                                            <option value="">Todos os Status</option>
                                            <option value="PAGO">Pago</option>
                                            <option value="PENDENTE">Pendente</option>
                                            <option value="CANCELADO">Cancelado</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Ordenar por Data</label>
                                        <select
                                            value={sortOrder}
                                            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                                            className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                                        >
                                            <option value="desc">Mais Recentes</option>
                                            <option value="asc">Mais Antigas</option>
                                        </select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Vendas Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Lista de Vendas</CardTitle>
                                <CardDescription>
                                    Total: {filteredVendas.length} venda(s)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    </div>
                                ) : filteredVendas.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-muted-foreground">Nenhuma venda encontrada</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Cliente</TableHead>
                                                        <TableHead>Data</TableHead>
                                                        <TableHead>Valor Total</TableHead>
                                                        <TableHead>Valor Pago</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead className="text-right">Ações</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {paginatedVendas.map((venda) => (
                                                        <TableRow key={venda.id}>
                                                            <TableCell className="font-medium">{venda.cliente?.nome || `Cliente #${venda.clienteId}`}</TableCell>
                                                            <TableCell>
                                                                {new Date(venda.dataVenda).toLocaleDateString('pt-BR')}
                                                            </TableCell>
                                                            <TableCell>
                                                                R$ {venda.valorTotal.toFixed(2).replace('.', ',')}
                                                            </TableCell>
                                                            <TableCell>
                                                                R$ {venda.valorPago.toFixed(2).replace('.', ',')}
                                                            </TableCell>
                                                            <TableCell>
                                                                <span
                                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                                        venda.statusPagamento
                                                                    )
                                                                        }`}
                                                                >
                                                                    {getStatusText(venda.statusPagamento)}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleOpenDialog(venda)}
                                                                        className="gap-1"
                                                                    >
                                                                        <Edit2 className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            setSelectedVenda(venda);
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
                                        {filteredVendas.length > 0 && (
                                            <div className="flex items-center justify-between mt-4 px-4 py-3 border-t border-border">
                                                <div className="text-sm text-muted-foreground">
                                                    Mostrando {startIndex + 1} a {Math.min(endIndex, filteredVendas.length)} de {filteredVendas.length} vendas
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
                    </TabsContent>

                    {/* Aba: Extrato */}
                    <TabsContent value="extrato" className="space-y-6">
                        {/* Period Selector */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Período</label>
                                        <select
                                            value={periodType}
                                            onChange={(e) => setPeriodType(e.target.value as any)}
                                            className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                                        >
                                            <option value="hoje">Hoje</option>
                                            <option value="semana">Esta Semana</option>
                                            <option value="mes">Este Mês</option>
                                            <option value="personalizado">Personalizado</option>
                                        </select>
                                    </div>
                                    {periodType === 'personalizado' && (
                                        <>
                                            <div>
                                                <label className="text-sm font-medium">Data Início</label>
                                                <input
                                                    type="date"
                                                    value={customStartDate}
                                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium">Data Fim</label>
                                                <input
                                                    type="date"
                                                    value={customEndDate}
                                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Card: Total de Vendas */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Total de Vendas</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{totalVendasPeriodo}</div>
                                </CardContent>
                            </Card>

                            {/* Card: Total Faturado */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Faturado</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">R$ {totalFaturadoPeriodo.toFixed(2).replace('.', ',')}</div>
                                </CardContent>
                            </Card>

                            {/* Card: Total Pago */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Pago</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-green-600">R$ {totalPagoPeriodo.toFixed(2).replace('.', ',')}</div>
                                </CardContent>
                            </Card>

                            {/* Card: Total Pendente */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Pendente</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-yellow-600">R$ {totalPendentePeriodo.toFixed(2).replace('.', ',')}</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Gráfico com Seletor */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Faturamento e Pagamentos</CardTitle>
                                        <CardDescription>
                                            {chartViewMode === 'semanal' ? 'Últimos 7 dias' : 'Últimos 30 dias'}
                                        </CardDescription>
                                    </div>
                                    <div>
                                        <select
                                            value={chartViewMode}
                                            onChange={(e) => setChartViewMode(e.target.value as 'semanal' | 'mensal')}
                                            className="px-3 py-2 border border-input rounded-md bg-background text-sm"
                                        >
                                            <option value="semanal">Semanal (7 dias)</option>
                                            <option value="mensal">Mensal (30 dias)</option>
                                        </select>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="dia" />
                                        <YAxis />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey="faturado" fill="#3b82f6" name="Total Faturado" />
                                        <Bar dataKey="pago" fill="#10b981" name="Total Pago" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Deletar Venda</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja deletar esta venda? Esta ação não pode ser desfeita.
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