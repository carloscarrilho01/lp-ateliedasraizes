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

## Importante
- Se mudar os **dias/horários** de atendimento, ajuste nos **dois lugares**: no `agenda-config.js`
  (o que o cliente vê) e no `Code.gs` (`DIAS_ATENDIMENTO`, `HORA_INICIO`, `HORA_FIM`, `DUR_MIN`),
  e **reimplante** (Implantar → Gerenciar implantações → editar → Nova versão).
- A Jaqueline pode **bloquear horários** só criando um evento normal naquele horário no Google
  Agenda — o site vai tratar como ocupado.
- Para a Jaqueline receber aviso de cada novo agendamento, ative lembretes/notificações no
  calendário usado (ou peça ao estúdio para ligar um e-mail automático).
