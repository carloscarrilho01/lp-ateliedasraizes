/* ============================================================
   Ateliê das Raízes — Configuração da agenda (Google Calendar)
   ------------------------------------------------------------
   Para ligar a agenda ao Google Calendar, siga o passo a passo
   em google/COMO-PUBLICAR.md e cole a URL gerada abaixo.

   Enquanto a URL não estiver colada, o site roda em MODO
   DEMONSTRAÇÃO (os agendamentos ficam só neste navegador, para
   você testar a tela).
   ============================================================ */
window.ATELIE_AGENDA = {
  // --- Ligação com o Google Calendar (cole a URL /exec do Apps Script) ---
  appsScriptUrl: "https://script.google.com/macros/s/AKfycbwEl2CDSEm3LEMr4y-OsEWC5Odfz1KvTOLhrH7dbCSQVJdLG5z7ujXM3DhmeoduLM4DtQ/exec",

  // --- Regras de atendimento (ajuste para a rotina da Jaqueline) ---
  //  Dias: 0=Dom 1=Seg 2=Ter 3=Qua 4=Qui 5=Sex 6=Sáb
  diasAtendimento: [2, 3, 4, 5, 6],   // Ter a Sáb  <-- PLACEHOLDER
  horaInicio: "09:00",                //            <-- PLACEHOLDER
  horaFim:    "18:00",                //            <-- PLACEHOLDER
  duracaoMin: 60                      // minutos por horário <-- PLACEHOLDER
  // IMPORTANTE: se mudar dias/horas aqui, ajuste também as mesmas
  // regras no topo de google/Code.gs e reimplante o Apps Script.
};
