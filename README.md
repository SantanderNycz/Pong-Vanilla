# Pong-Vanilla

Uma implementação simples do clássico jogo Pong, construída com foco em clareza de código, modularidade e facilidade de extensão. Este projeto serviu como base para o desenvolvimento do **eri-pongson v2**, no qual foram adicionadas várias melhorias e funcionalidades.

## 🎮 Visão Geral  
- Dois jogadores (ou jogador vs. IA) controlam paletas para rebater uma bola no campo de jogo.  
- O objetivo é fazer a bola ultrapassar o limite do adversário para marcar ponto.  
- Código escrito para facilitar leitura e extensão, sendo ideal como ponto de partida (como foi para o eri-pongson v2).

## 🧩 Funcionalidades Principais  
- Mecânica básica de rebote da bola nas paredes e paletas.  
- Controle das paletas via teclado (configurável).  
- Sistema de pontuação simples.  
- Interface gráfica minimalista para foco na lógica do jogo.  
- Arquitetura projetada para permitir fácil modificação: novas entidades (bola, paleta, IA), novos modos de jogo, melhorias visuais.

## 📌 Relação com o eri-pongson v2  
Este projeto foi usado como **base** para o desenvolvimento do **eri-pongson v2**:  
- A lógica de colisão, movimento da bola e paletas foi herdada deste repositório.  
- No eri-pongson v2 foram adicionados: IA adaptativa, modo multijogador via rede, power-ups, efeitos de som/visuais e design de níveis.  
- Se você está explorando este repositório para entender a lógica original ou derivar seus próprios addons/mods, saber que ele foi usado como fundação para uma versão mais avançada ajuda a entender as decisões de estrutura e organização.

## 🛠️ Como Usar  
1. Clone o repositório:  
   ```bash
   git clone https://github.com/SantanderNycz/Pong-Vanilla.git
   cd Pong-Vanilla

2. Instale dependências (caso existam — ver package.json)
```bash
npm install
```

3. Execute em modo de desenvolvimento:
```bash
npm run dev
```

4. Abra no navegador apontando para http://localhost:PORT (port configurável).

5. Divirta-se — ou use como base para seu próprio projeto / modificação.

## 🧠 Arquitetura & Organização

/app, /components, /hooks, /lib, /public, /styles — pastas organizadas para separar lógica de UI, hooks reutilizáveis, lib de utilitários, assets públicos e estilos. 
GitHub

tsconfig.json – configurado para projeto em TypeScript.

next.config.mjs – (caso seja usado Next.js ou similar) para configuração de build/rota.

Estilo e estrutura simplificados, para servir de base clara para extensões.

## 🚀 Como Expandir

Algumas ideias de extensão que foram exploradas ou podem ser exploradas:

Adicionar modo single-player com IA básica ou avançada.

Introduzir power-ups (ex: paleta maior, bola mais rápida).

Criar modo rede/multijogador online.

Melhorar visuais: animações, partículas, som de impacto.

Modularizar ainda mais a lógica (ex: padrão entidade-componente ou sistema de eventos).

Migrar para canvas/webGL para performance extra ou efeitos visuais avançados.

## 📫 Contato

Se quiser discutir modificações, extensões ou usar como base para seu próprio jogo, entre em contato via GitHub:
@SantanderNycz