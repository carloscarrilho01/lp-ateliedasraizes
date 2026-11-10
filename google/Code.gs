/*  Ateliê das Raízes — motor da agenda (Google Apps Script + Google Calendar)
 *  --------------------------------------------------------------------------
 *  Cada agendamento feito no site vira um EVENTO no Google Calendar.
 *  A trava (LockService) + a checagem de conflito garantem que nunca
 *  existem dois agendamentos no mesmo horário.
 *
 *  Como publicar: veja o arquivo google/COMO-PUBLICAR.md
 */

// ===== Configuração =====
const CAL_ID  = 'primary';               // 'primary' = agenda principal da conta.
                                         // Ou cole o ID de um calendário dedicado.
const TZ      = 'America/Sao_Paulo';
const DUR_MIN = 60;                      // duração de cada atendimento (minutos)
const DIAS_ATENDIMENTO = [2,3,4,5,6];    // 0=Dom 1=Seg 2=Ter ... 6=Sáb
const HORA_INICIO = '09:00';
const HORA_FIM    = '18:00';

// ===== Entradas HTTP =====
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action === 'ocupados' && p.data) {
    return json({ ocupados: ocupadosDoDia(p.data) });
  }
  return json({ ok: false, motivo: 'acao' });
}

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); }
  catch (_) { return json({ ok: false, motivo: 'payload' }); }
  return json(agendar(d));
}

// ===== Leitura: horários ocupados de um dia =====
function ocupadosDoDia(data) {
  const cal = calObj();
  const [y, m, dd] = data.split('-').map(Number);
  const ini = new Date(y, m - 1, dd, 0, 0, 0);
  const fim = new Date(y, m - 1, dd, 23, 59, 59);
  return cal.getEvents(ini, fim).map(function (ev) {
    return Utilities.formatDate(ev.getStartTime(), TZ, 'HH:mm');
  });
}

// ===== Escrita: cria o agendamento (com trava anti-duplicidade) =====
function agendar(d) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(10000); }
  catch (e) { return { ok: false, motivo: 'erro' }; }

  try {
    if (!d || !d.nome || String(d.nome).trim().length < 2) return { ok: false, motivo: 'nome' };
    if (!d.data || !d.hora) return { ok: false, motivo: 'dados' };

    const [y, m, dd] = d.data.split('-').map(Number);
    const [hh, mi]   = d.hora.split(':').map(Number);
    const inicio = new Date(y, m - 1, dd, hh, mi, 0);

    if (inicio < new Date()) return { ok: false, motivo: 'passado' };
    if (DIAS_ATENDIMENTO.indexOf(inicio.getDay()) === -1) return { ok: false, motivo: 'fechado' };
    if (d.hora < HORA_INICIO || d.hora >= HORA_FIM) return { ok: false, motivo: 'fora' };

    // conflito: alguém já tem esse horário?
    if (ocupadosDoDia(d.data).indexOf(d.hora) !== -1) return { ok: false, motivo: 'ocupado' };

    const fim = new Date(inicio.getTime() + DUR_MIN * 60000);
    calObj().createEvent(
      'Ateliê das Raízes — ' + (d.servico || 'Atendimento') + ' · ' + d.nome,
      inicio, fim,
      { description:
          'Serviço: ' + (d.servico || '') +
          '\nCliente: ' + d.nome +
          '\nWhatsApp: ' + (d.telefone || '—') +
          '\nAgendado pelo site.' }
    );
    return { ok: true };
  } catch (err) {
    return { ok: false, motivo: 'erro' };
  } finally {
    lock.releaseLock();
  }
}

// ===== Auxiliares =====
function calObj() {
  return CAL_ID === 'primary'
    ? CalendarApp.getDefaultCalendar()
    : CalendarApp.getCalendarById(CAL_ID);
}
function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}
