# FitLife — PWA inicial

Este é o ponto de partida do aplicativo FitLife em React + Vite + PWA.

## O que já está no protótipo
- Interface mobile-first escura, verde e responsiva.
- Navegação inferior: Início, Jejum, Alimentação, Treinos e Água.
- Registros básicos salvos localmente no aparelho com localStorage.
- Cronômetro inicial de jejum, metas simples de hidratação, lista inicial de refeições/compras e exercícios.
- Manifesto PWA e service worker para cache do app.

## Importante: contas e sincronização
O projeto inclui o início da integração com Supabase Auth, mas **ainda não há sincronização real entre celulares nem compartilhamento entre contas**. Para isso, precisamos criar o projeto Supabase, configurar as variáveis e implementar tabelas com Row Level Security (RLS), convites e sincronização offline com fila de alterações. Não coloque chaves `service_role` no aplicativo.

## Configuração
1. Instale Node.js LTS.
2. Na pasta do projeto: `npm install`
3. Copie `.env.example` para `.env` e preencha as credenciais do Supabase.
4. Rode `npm run dev` para testar.
5. Rode `npm run build` para gerar `dist/`.

Sem credenciais Supabase, o protótipo abre em modo local, sem login e sem sincronização.

## Publicação e instalação PWA
Publique a pasta `dist/` em hospedagem HTTPS (por exemplo, Vercel ou Netlify). O HTTPS é obrigatório para o Service Worker funcionar fora de `localhost`.

### iPhone / iPad
1. Abra o endereço publicado no Safari (não dentro do Instagram/WhatsApp).
2. Toque em Compartilhar.
3. Escolha **Adicionar à Tela de Início** e confirme.
4. Abra o FitLife pelo novo ícone.

O iOS não oferece o mesmo evento de instalação automática do Chrome/Android; por isso o app mostra instruções próprias no Safari.

### Android
1. Abra o endereço publicado no Chrome.
2. Use **Instalar app** no aviso do FitLife ou no menu do navegador.
3. Confirme e abra pelo ícone instalado.

### Teste inicial
- Confirme que o ícone e o nome FitLife aparecem corretamente.
- Feche o navegador e abra pelo ícone da tela inicial.
- Navegue pelas cinco abas e registre um item em água, refeições e treinos.
- Feche e reabra o app para verificar se os dados locais continuam salvos.
- Ative o modo avião e teste a abertura novamente. O cache inicial será validado nessa etapa; isso ainda não significa que todos os recursos e fontes externas funcionem offline.

## Próximas etapas antes de uso real
- Corrigir/validar autenticação por e-mail e recuperação de senha.
- Perfis individuais com peso, metas e histórico privados.
- Espaço compartilhado via convite para cardápios e compras.
- Banco de dados com RLS.
- Sincronização offline robusta e resolução de conflitos.
- Planejador de jejum por hora de início e término, incluindo fusos e pausas.
- Calendário de alimentação dia/semana/mês, receitas, porções e macros.
- Planejador semanal de exercícios e check-off de realizados.
- Histórico de água por dia (reset diário sem apagar o histórico).
- Testes em iOS Safari e Android Chrome.
