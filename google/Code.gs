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
const DIAS_MAX_ANTECEDENCIA = 60;        // até quantos dias à frente o site aceita reservar

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

// ===== Grade de horários do dia (mesma regra do agenda-config.js) =====
function grade() {
  const paraMin = h => { const [a, b] = h.split(':').map(Number); return a * 60 + b; };
  const out = [];
  for (let t = paraMin(HORA_INICIO); t + DUR_MIN <= paraMin(HORA_FIM); t += DUR_MIN) {
    out.push(('0' + Math.floor(t / 60)).slice(-2) + ':' + ('0' + (t % 60)).slice(-2));
  }
  return out;
}

function dataValida(data) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(data || ''));
}

// ===== Leitura: horários da grade que estão ocupados num dia =====
// Um horário fica ocupado se QUALQUER evento da agenda se sobrepõe a ele:
// compromisso de 2h, evento que começa "quebrado" (9h30) ou dia inteiro (folga).
// Só devolve os horários da grade, nunca os detalhes dos eventos.
function ocupadosDoDia(data) {
  if (!dataValida(data)) return [];
  const [y, m, dd] = data.split('-').map(Number);
  const eventos = calObj().getEvents(new Date(y, m - 1, dd, 0, 0, 0), new Date(y, m - 1, dd, 23, 59, 59));
  return grade().filter(function (h) {
    const [hh, mi] = h.split(':').map(Number);
    const ini = new Date(y, m - 1, dd, hh, mi, 0);
    const fim = new Date(ini.getTime() + DUR_MIN * 60000);
    return eventos.some(function (ev) { return ev.getStartTime() < fim && ev.getEndTime() > ini; });
  });
}

// ===== Escrita: cria o agendamento (com trava anti-duplicidade) =====
function agendar(d) {
  // campo isca: gente não vê nem preenche; robô preenche
  if (d && d.site) return { ok: true };

  const nome = String((d && d.nome) || '').trim().slice(0, 80);
  const telefone = String((d && d.telefone) || '').replace(/[^\d()+\- ]/g, '').trim().slice(0, 20);
  const servico = String((d && d.servico) || 'Atendimento').trim().slice(0, 60);
  const digitos = telefone.replace(/\D/g, '');

  if (nome.length < 2) return { ok: false, motivo: 'nome' };
  if (digitos.length < 10 || digitos.length > 13) return { ok: false, motivo: 'telefone' };
  if (!dataValida(d.data) || grade().indexOf(String(d.hora)) === -1) return { ok: false, motivo: 'dados' };

  const [y, m, dd] = d.data.split('-').map(Number);
  const [hh, mi]   = d.hora.split(':').map(Number);
  const inicio = new Date(y, m - 1, dd, hh, mi, 0);
  const limite = new Date(Date.now() + DIAS_MAX_ANTECEDENCIA * 86400000);

  if (inicio < new Date()) return { ok: false, motivo: 'passado' };
  if (inicio > limite) return { ok: false, motivo: 'longe' };
  if (DIAS_ATENDIMENTO.indexOf(inicio.getDay()) === -1) return { ok: false, motivo: 'fechado' };

  const lock = LockService.getScriptLock();
  try { lock.waitLock(10000); }
  catch (e) { return { ok: false, motivo: 'erro' }; }

  try {
    // conflito: alguém (ou um compromisso da Jaqueline) já ocupa esse horário?
    if (ocupadosDoDia(d.data).indexOf(d.hora) !== -1) return { ok: false, motivo: 'ocupado' };

    const fim = new Date(inicio.getTime() + DUR_MIN * 60000);
    calObj().createEvent(
      'Ateliê das Raízes — ' + servico + ' · ' + nome,
      inicio, fim,
      { description:
          'Serviço: ' + servico +
          '\nCliente: ' + nome +
          '\nWhatsApp: ' + telefone +
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
