import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import api from '@/lib/api';
import { Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
  statusPagamento: 'PENDENTE' | 'PAGO' | 'CANCELADO';
}

interface SaleFormProps {
    sale?: Venda;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
}

export default function SaleForm({ sale, onSubmit, onCancel }: SaleFormProps) {
    const [formData, setFormData] = useState<{
        idCliente: number;
        dataVenda: string;
        valorTotal: number;
        valorPago: number;
        statusPagamento: 'PENDENTE' | 'PAGO' | 'CANCELADO';
    }>({
        idCliente: 0,
        dataVenda: new Date().toISOString().split('T')[0],
        valorTotal: 0,
        valorPago: 0,
        statusPagamento: 'PENDENTE',
    });
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingClientes, setIsLoadingClientes] = useState(true);
    const [openCombobox, setOpenCombobox] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [inputValorTotal, setInputValorTotal] = useState('');
    const [inputValorPago, setInputValorPago] = useState('');

    useEffect(() => {
        loadClientes();
    }, []);

    useEffect(() => {
        if (sale) {
            setFormData({
                idCliente: sale.idCliente,
                dataVenda: sale.dataVenda.split('T')[0],
                valorTotal: sale.valorTotal,
                valorPago: sale.valorPago,
                statusPagamento: sale.statusPagamento,
            });
        }
    }, [sale]);

    const loadClientes = async () => {
        try {
            setIsLoadingClientes(true);
            const response = await api.get('/clientes');
            setClientes(response.data);
        } catch (error) {
            toast.error('Erro ao carregar clientes');
        } finally {
            setIsLoadingClientes(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.idCliente) {
            toast.error('Selecione um cliente');
            return;
        }

        if (formData.valorTotal <= 0) {
            toast.error('Valor total deve ser maior que zero');
            return;
        }

        setIsLoading(true);
        try {
            // Converter para o formato esperado pela API
            const payload = {
                clienteId: formData.idCliente,
                dataVenda: formData.dataVenda,
                valorTotal: formData.valorTotal,
                valorPago: formData.valorPago,
                statusPagamento: formData.statusPagamento === 'PAGO' ? 0 : 1,
            };
            await onSubmit(payload);
        } finally {
            setIsLoading(false);
        }
    };


    // Formatar valor em Real BR
    const formatCurrency = (value: number | string): string => {
        let numValue: number;

        if (typeof value === 'number') {
            numValue = value;
        } else {
            const numbers = value.replace(/\D/g, '');
            if (!numbers) return '';
            numValue = parseInt(numbers, 10) / 100;
        }

        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(numValue);
    };


    // Converter valor formatado para número
    const parseCurrency = (value: string): number => {
        const numbers = value.replace(/\D/g, '');
        return numbers ? parseInt(numbers, 10) / 100 : 0;
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'idCliente' ? parseInt(value) :
                name === 'valorTotal' || name === 'valorPago' ? parseFloat(value) :
                    value,
        }));
    };

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numValue = parseCurrency(value);
        const formattedValue = formatCurrency(numValue);

        if (name === 'valorTotal') {
            setInputValorTotal(formattedValue);
            setFormData((prev) => ({
                ...prev,
                valorTotal: numValue,
            }));
        } else if (name === 'valorPago') {
            // Validar se Valor Pago nao excede Valor Total
            if (numValue > formData.valorTotal && formData.valorTotal > 0) {
                toast.error('Valor Pago nao pode ser maior que Valor Total');
                return;
            }

            setInputValorPago(formattedValue);
            setFormData((prev) => {
                let newStatus = prev.statusPagamento;
                if (numValue === prev.valorTotal && numValue > 0) {
                    newStatus = 'PAGO';
                } else if (numValue < prev.valorTotal && numValue > 0) {
                    newStatus = 'PENDENTE';
                }

                return {
                    ...prev,
                    valorPago: numValue,
                    statusPagamento: newStatus,
                };
            });
        }
    };


    const selectedCliente = clientes.find(c => c.id === formData.idCliente);

    // Filtrar clientes baseado na busca
    const filteredClientes = clientes.filter(cliente =>
        cliente.nome.toLowerCase().includes(searchValue.toLowerCase())
    );

    // Limitar a 3 sugestões iniciais
    const displayedClientes = filteredClientes.slice(0, 3);


    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="idCliente" className="text-sm font-medium">
                    Cliente *
                </label>
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCombobox}
                            className="w-full justify-between"
                            disabled={isLoading || isLoadingClientes}
                        >
                            {selectedCliente ? selectedCliente.nome : 'Selecione um cliente...'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                        <Command filter={() => 1}>
                            <CommandInput
                                placeholder="Buscar cliente..."
                                value={searchValue}
                                onValueChange={setSearchValue}
                                className="text-left"
                            />
                            {filteredClientes.length === 0 && <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>}
                            <CommandList>
                                <CommandGroup>
                                    {displayedClientes.map((cliente) => (
                                        <CommandItem
                                            key={cliente.id}
                                            value={cliente.id.toString()}
                                            onSelect={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    idCliente: cliente.id
                                                }));
                                                setOpenCombobox(false);
                                                setSearchValue('');
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    'mr-2 h-4 w-4',
                                                    formData.idCliente === cliente.id ? 'opacity-100' : 'opacity-0'
                                                )}
                                            />
                                            {cliente.nome}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            <div className="space-y-2">
                <label htmlFor="dataVenda" className="text-sm font-medium">
                    Data da Venda *
                </label>
                <Input
                    id="dataVenda"
                    name="dataVenda"
                    type="date"
                    value={formData.dataVenda}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="valorTotal" className="text-sm font-medium">
                        Valor Total *
                    </label>
                    <Input
                        id="valorTotal"
                        name="valorTotal"
                        type="text"
                        placeholder="R$ 0,00"
                        value={inputValorTotal}
                        onChange={handleCurrencyChange}
                        disabled={isLoading}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="valorPago" className="text-sm font-medium">
                        Valor Pago *
                    </label>
                    <Input
                        id="valorPago"
                        name="valorPago"
                        type="text"
                        placeholder="R$ 0,00"
                        value={inputValorPago}
                        onChange={handleCurrencyChange}
                        disabled={isLoading}
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="statusPagamento" className="text-sm font-medium">
                    Status de Pagamento *
                </label>
                <div className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm flex items-center">
                    {formData.statusPagamento === 'PENDENTE' && 'Pendente'}
                    {formData.statusPagamento === 'PAGO' && 'Pago'}
                    {formData.statusPagamento === 'CANCELADO' && 'Cancelado'}
                </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        'Salvar'
                    )}
                </Button>
            </div>
        </form>
    );
}
