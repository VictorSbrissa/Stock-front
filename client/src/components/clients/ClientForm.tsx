import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

interface Cliente {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  ativo: boolean;
  criadoEm: string;
}

interface ClientFormProps {
  cliente?: Cliente;
  onSubmit: (data: Omit<Cliente, 'id' | 'criadoEm'>) => Promise<void>;
  onCancel: () => void;
}

export default function ClientForm({ cliente, onSubmit, onCancel }: ClientFormProps) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    ativo: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (cliente) {
      setFormData({
        nome: cliente.nome,
        email: cliente.email || '',
        telefone: cliente.telefone || '',
        ativo: cliente.ativo,
      });
    }
  }, [cliente]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="nome" className="text-sm font-medium">
          Nome *
        </label>
        <Input
          id="nome"
          name="nome"
          placeholder="Nome do cliente"
          value={formData.nome}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="email@exemplo.com"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="telefone" className="text-sm font-medium">
          Telefone
        </label>
        <Input
          id="telefone"
          name="telefone"
          placeholder="(11) 99999-9999"
          value={formData.telefone}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="ativo"
          name="ativo"
          checked={formData.ativo}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({ ...prev, ativo: checked as boolean }))
          }
          disabled={isLoading}
        />
        <label htmlFor="ativo" className="text-sm font-medium cursor-pointer">
          Cliente Ativo
        </label>
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
