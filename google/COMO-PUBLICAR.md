# Ligar a agenda do site ao Google Calendar

Você faz isso **uma vez**, na conta Google da Jaqueline (ou na que vai ser dona da agenda).
Leva ~5 minutos. No fim, você cola uma URL no arquivo `agenda-config.js` e está no ar.

## Passo a passo

1. Entre em **https://script.google.com** (logado na conta Google da agenda).
2. Clique em **Novo projeto**.
3. Apague o conteúdo padrão e **cole todo o conteúdo do arquivo `Code.gs`** (que está nesta pasta).
4. (Opcional) Se quiser usar um calendário separado só pro ateliê em vez da agenda principal:
   - Crie o calendário no Google Agenda, abra as configurações dele e copie o **ID do calendário**.
   - No topo do `Code.gs`, troque `const CAL_ID = 'primary';` por `const CAL_ID = 'o-id-aqui';`
5. Clique em **Salvar** (ícone de disquete).
6. Clique em **Implantar → Nova implantação**.
7. Em "Selecionar tipo" (engrenagem), escolha **App da Web**.
8. Configure:
   - **Executar como:** Eu (a própria conta)
   - **Quem pode acessar:** **Qualquer pessoa**
9. Clique em **Implantar**. O Google vai pedir pra **autorizar** o acesso ao seu Calendar — aceite
   (pode aparecer um aviso "app não verificado" → *Avançado → Acessar o projeto*; é seguro, é o seu
   próprio script).
10. Copie a **URL do app da Web** (termina em `/exec`).

## Colar no site

Abra `agenda-config.js` (na pasta do site) e cole a URL no campo `appsScriptUrl`:

```js
window.ATELIE_AGENDA = {
  appsScriptUrl: "https://script.google.com/macros/s/XXXXXXXX/exec",  // <- aqui
  ...
};
```

Salve. Pronto: os agendamentos do site passam a cair no Google Calendar, e horários ocupados
somem da tela automaticamente.

## Aviso no WhatsApp da Jaqueline a cada agendamento

Cada reserva manda uma mensagem para o WhatsApp dela (e uma cópia por e-mail) com serviço, dia,
horário, nome da cliente e um link para responder direto. O envio usa o **CallMeBot**, serviço
gratuito para avisos no próprio WhatsApp. Configuração, uma vez, no celular da Jaqueline:

1. Em **callmebot.com** (seção WhatsApp API), pegue o número do robô do CallMeBot e salve como
   contato "CallMeBot" no celular dela.
2. Do WhatsApp dela, mande para esse contato: `I allow callmebot to send me messages`
3. Em até 2 minutos chega a resposta com a **apikey** (um número).
4. No Apps Script: **Configurações do projeto (engrenagem) → Propriedades do script → Adicionar**:
   - `WHATSAPP_AVISO` = `5511961712240` (o número dela, com 55 e DDD, só dígitos)
   - `CALLMEBOT_APIKEY` = a apikey recebida
   - `EMAIL_AVISO` = (opcional) e-mail para a cópia
5. No editor, escolha a função **testarAviso** e clique em **Executar**. O Google pede para
   autorizar "enviar e-mail" e "conectar a serviço externo" (é o aviso). A mensagem de teste
   deve chegar no WhatsApp dela.
6. Reimplante (Implantar → Gerenciar implantações → editar → Nova versão).

Observações:
- O CallMeBot é gratuito e serve para avisos pessoais, não para mandar mensagem às clientes.
  Se um dia ele ficar fora do ar, a reserva continua entrando na agenda e o e-mail continua chegando.
- Para algo oficial e com o número do ateliê como remetente, o caminho é a API do WhatsApp
  Business (Meta), que pede cadastro de empresa e tem custo por conversa.

## Importante
- **Atualizou o `Code.gs`?** Cole a versão nova no Apps Script e faça **Implantar → Gerenciar implantações → editar (lápis) → Versão: Nova versão → Implantar**. A URL `/exec` continua a mesma; sem isso o site segue usando o código antigo.
- Confira o **fuso do projeto** no Apps Script (Configurações do projeto → Fuso horário: `(GMT-03:00) São Paulo`), para os horários baterem com a agenda.
- Se mudar os **dias/horários** de atendimento, ajuste nos **dois lugares**: no `agenda-config.js`
  (o que o cliente vê) e no `Code.gs` (`DIAS_ATENDIMENTO`, `HORA_INICIO`, `HORA_FIM`, `DUR_MIN`),
  e **reimplante** (Implantar → Gerenciar implantações → editar → Nova versão).
- A Jaqueline pode **bloquear horários** só criando um evento normal naquele horário no Google
  Agenda — o site vai tratar como ocupado.
- Para a Jaqueline receber aviso de cada novo agendamento, ative lembretes/notificações no
  calendário usado (ou peça ao estúdio para ligar um e-mail automático).
