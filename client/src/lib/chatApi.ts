import api from './api';

export interface Mensagem {
    id: string;
    tipo: 'usuario' | 'ia';
    texto: string;
    timestamp: Date;
}

export async function enviarPergunta(pergunta: string): Promise<string> {
    const response = await api.post('/ai/chat', { pergunta });
    return response.data.resposta;
}