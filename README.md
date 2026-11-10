# Ateliê das Raízes — Landing Page

Site institucional de uma página do **Ateliê das Raízes** (Jaqueline Moreira — terapia capilar
integrativa, São Paulo). HTML/CSS/JS em arquivo único, responsivo, com agenda de horários ligada
ao Google Calendar.

## Estrutura

```
index.html          # o site completo (CSS e JS embutidos)
agenda-config.js    # configuração da agenda (URL do Apps Script + horários)
img/                # imagens do site
google/
  Code.gs           # motor da agenda (Google Apps Script + Google Calendar)
  COMO-PUBLICAR.md  # passo a passo para ligar a agenda
```

## Agenda / agendamento

O cliente escolhe **serviço → dia → horário**. Cada reserva vira um evento no Google Calendar,
e uma trava no Apps Script (`LockService` + checagem de conflito) garante que **não há dois
agendamentos no mesmo horário**. Para ligar/ajustar, veja `google/COMO-PUBLICAR.md`.

## Rodar localmente

É um site estático: abra o `index.html` no navegador (ou sirva a pasta com qualquer servidor
estático). Sem build.

---

Feito pelo estúdio. Ajustes de dias/horários: `agenda-config.js` **e** `google/Code.gs`.
