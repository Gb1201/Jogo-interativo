-- =====================================================================
-- NIMBUS QUIZ — Perguntas de exemplo (10 perguntas)
-- Rode DEPOIS do schema.sql. ATENÇÃO: apaga as perguntas atuais (e, por
-- cascata, as respostas já dadas) antes de inserir. Não rode no meio do evento.
--
-- Para usar suas perguntas: edite o JSON abaixo.
--   "q"       = enunciado
--   "correct" = alternativa correta
--   "wrong"   = lista de alternativas erradas (2 a 5 itens)
-- Não use apóstrofo (') dentro dos textos; use aspas duplas escapadas ou reescreva.
-- =====================================================================

do $$
declare
  item   jsonb;
  q_id   bigint;
  opt    text;
  pos    integer := 0;
begin
  delete from public.questions;

  for item in
    select * from jsonb_array_elements($json$
    [
      {"q": "Qual é o maior planeta do Sistema Solar?",
       "correct": "Júpiter", "wrong": ["Saturno", "Netuno", "Terra"]},

      {"q": "Qual é a capital do Brasil?",
       "correct": "Brasília", "wrong": ["Rio de Janeiro", "São Paulo", "Salvador"]},

      {"q": "Qual gás as plantas absorvem durante a fotossíntese?",
       "correct": "Dióxido de carbono", "wrong": ["Oxigênio", "Nitrogênio", "Hélio"]},

      {"q": "Quanto é 7 × 8?",
       "correct": "56", "wrong": ["54", "49", "64"]},

      {"q": "Quem pintou a Mona Lisa?",
       "correct": "Leonardo da Vinci", "wrong": ["Michelangelo", "Van Gogh", "Pablo Picasso"]},

      {"q": "Qual oceano banha o litoral do Brasil?",
       "correct": "Oceano Atlântico", "wrong": ["Oceano Pacífico", "Oceano Índico", "Oceano Ártico"]},

      {"q": "Em qual continente fica o Egito?",
       "correct": "África", "wrong": ["Ásia", "Europa", "América do Sul"]},

      {"q": "Quanto é 144 ÷ 12?",
       "correct": "12", "wrong": ["14", "11", "13"]},

      {"q": "Qual é o maior mamífero do mundo?",
       "correct": "Baleia-azul", "wrong": ["Elefante africano", "Girafa", "Tubarão-baleia"]},

      {"q": "Qual é a fórmula química da água?",
       "correct": "H₂O", "wrong": ["CO₂", "O₂", "NaCl"]}
    ]
    $json$::jsonb)
  loop
    pos := pos + 1;

    insert into public.questions (text, position)
    values (item->>'q', pos)
    returning id into q_id;

    insert into public.options (question_id, text, is_correct)
    values (q_id, item->>'correct', true);

    for opt in select jsonb_array_elements_text(item->'wrong') loop
      insert into public.options (question_id, text, is_correct)
      values (q_id, opt, false);
    end loop;
  end loop;
end
$$;
