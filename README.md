# Interface Web para Controle Residencial MQTT

Este projeto implementa uma interface web estática para controlar dispositivos conectados a um ESP32, utilizando o broker MQTT HiveMQ Cloud.

A interface foi extraída e adaptada de um código originalmente embarcado em um ESP32.

## Estrutura do Projeto

- `login.html`: Página de login (autenticação simulada no lado do cliente).
- `index.html`: Painel de controle principal com os dispositivos.
- `css/`: Contém os arquivos de estilo:
    - `login_style.css`: Estilos para a página de login.
    - `panel_style.css`: Estilos para o painel de controle.
- `js/`: Contém os arquivos JavaScript:
    - `login_script.js`: Lógica para a página de login.
    - `panel_script.js`: Lógica para o painel de controle, incluindo a comunicação MQTT via WebSocket.

## Funcionalidades

- Página de login com credenciais fixas (usuário: `Bruno`, senha: `11052001`) para simular o acesso.
- Painel de controle que exibe os cômodos: Sala, Cozinha, Banheiro, Lavabo, Escada, Garagem.
- Botões de toggle para ligar/desligar dispositivos em cada cômodo.
- Comunicação em tempo real com o broker MQTT (HiveMQ Cloud) para enviar comandos e receber atualizações de estado.
- Ícones visuais para cada cômodo e feedback de status (LIGADO/DESLIGADO).
- Botão de logout que limpa o token de autenticação simulado e redireciona para a página de login.

## Configuração MQTT (em `js/panel_script.js`)

- **Broker**: `832faee362a249b4929eeafa3ac41d6e.s1.eu.hivemq.cloud`
- **Porta (WSS)**: `8884`
- **Usuário**: `hivemq.webclient.1746800566955`
- **Senha**: `K>2<FWaR9iO#7:3Hmvwb`
- **Tópicos de Comando**: `casa/{nome_do_comodo}/comando` (ex: `casa/sala/comando`)
- **Tópicos de Status**: `casa/{nome_do_comodo}/status` (ex: `casa/sala/status`)

## Como Usar

1.  Certifique-se de que seu ESP32 está programado com o firmware original, conectado à internet e ao broker MQTT HiveMQ Cloud com as credenciais acima.
2.  Hospede estes arquivos em um servidor web estático (como GitHub Pages).
3.  Acesse `login.html` no seu navegador.
4.  Faça login com as credenciais mencionadas.
5.  Você será redirecionado para `index.html`, onde poderá controlar os dispositivos.

## Considerações de Segurança

As credenciais MQTT estão diretamente no arquivo `js/panel_script.js`. Em um ambiente de produção real, isso não é seguro. Considere métodos mais seguros para gerenciar credenciais se este projeto for expandido ou exposto publicamente de forma crítica.

## Para Publicar no GitHub Pages

1.  Crie um novo repositório no GitHub (ex: `smart-home-interface`).
2.  Clone o repositório para sua máquina local.
3.  Copie todos os arquivos e pastas (`login.html`, `index.html`, `css/`, `js/`, `README.md`) para o diretório do repositório clonado.
4.  Adicione, comite e envie os arquivos para o GitHub:
    ```bash
    git add .
    git commit -m "Versão inicial da interface web"
    git push origin main
    ```
5.  No seu repositório GitHub, vá para "Settings" > "Pages".
6.  Em "Branch", selecione `main` (ou o branch que você usou) e a pasta `/ (root)`. Clique em "Save".
7.  Aguarde alguns minutos para o site ser publicado. O link será algo como `https://SEU_USUARIO_GITHUB.github.io/NOME_DO_REPOSITORIO/` (ou `https://SEU_USUARIO_GITHUB.github.io/NOME_DO_REPOSITORIO/login.html` para iniciar pela página de login).

