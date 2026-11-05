-- =====================================================================
-- NIMBUS QUIZ — Desafio Contraceptivo: 10 perguntas oficiais
-- Rode DEPOIS do schema.sql. ATENÇÃO: apaga as perguntas atuais (e, por
-- cascata, as respostas já dadas) antes de inserir. Não rode no meio do evento.
--
-- Para editar uma pergunta, altere o JSON abaixo:
--   "q"           = enunciado
--   "correct"     = alternativa correta
--   "wrong"       = lista de alternativas erradas
--   "explanation" = explicação mostrada depois que o aluno responde (até 600 letras)
-- A ordem das alternativas é embaralhada pelo jogo, então não importa a ordem aqui.
-- Evite aspas duplas (") dentro dos textos.
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
      {"q": "Qual método contraceptivo também ajuda a prevenir infecções sexualmente transmissíveis (ISTs)?", "correct": "Preservativo (camisinha).", "wrong": ["Pílula anticoncepcional.", "DIU hormonal.", "Implante contraceptivo."], "explanation": "O preservativo ajuda a prevenir a gravidez e reduz o risco de transmissão de diversas ISTs quando utilizado corretamente."},

      {"q": "Qual é a principal função da pílula anticoncepcional?", "correct": "Impedir ou dificultar a ovulação, dependendo da formulação.", "wrong": ["Impedir a transmissão de todas as ISTs.", "Eliminar os espermatozoides do organismo.", "Aumentar a produção de óvulos."], "explanation": "A maioria das pílulas atua principalmente impedindo a ovulação. Algumas também dificultam a passagem dos espermatozoides pelo muco cervical."},

      {"q": "O que é o DIU?", "correct": "Um dispositivo colocado dentro do útero para prevenir a gravidez.", "wrong": ["Um medicamento aplicado por injeção.", "Um preservativo utilizado durante a relação sexual.", "Um adesivo hormonal colocado sobre a pele."], "explanation": "O DIU é um dispositivo colocado no útero por um profissional de saúde. Existem modelos de cobre e hormonais."},

      {"q": "Qual das alternativas apresenta um método contraceptivo de longa duração e reversível?", "correct": "Implante contraceptivo.", "wrong": ["Camisinha.", "Pílula anticoncepcional.", "Espermicida."], "explanation": "O implante é colocado sob a pele do braço e libera hormônio para prevenir a gravidez. Sua ação é reversível após a retirada."},

      {"q": "Qual é a diferença entre o DIU de cobre e o DIU hormonal?", "correct": "O DIU de cobre não contém hormônios, enquanto o hormonal libera levonorgestrel.", "wrong": ["O DIU de cobre contém hormônios, enquanto o hormonal não contém.", "Os dois possuem exatamente a mesma composição.", "O DIU hormonal contém cobre, enquanto o outro libera hormônios."], "explanation": "O DIU de cobre utiliza a ação do cobre para prejudicar os espermatozoides. Já o hormonal libera levonorgestrel, que dificulta a passagem dos espermatozoides pelo muco cervical."},

      {"q": "Para que serve a contracepção de emergência, conhecida como pílula do dia seguinte?", "correct": "Para prevenir uma gravidez após uma relação sexual desprotegida ou falha do método contraceptivo.", "wrong": ["Para interromper uma gravidez já estabelecida.", "Para prevenir ISTs.", "Para substituir permanentemente a pílula anticoncepcional de uso regular."], "explanation": "A contracepção de emergência pode evitar uma gravidez após uma situação de risco, principalmente impedindo ou atrasando a ovulação. Não interrompe uma gravidez já estabelecida."},

      {"q": "O que significa utilizar a dupla proteção?", "correct": "Combinar um método contraceptivo com o uso do preservativo.", "wrong": ["Utilizar dois preservativos ao mesmo tempo.", "Utilizar dois tipos de pílulas anticoncepcionais.", "Utilizar dois métodos hormonais simultaneamente."], "explanation": "A dupla proteção combina um método contraceptivo, como a pílula ou o DIU, com o preservativo, ajudando a prevenir gravidez e ISTs."},

      {"q": "Utilizar dois preservativos ao mesmo tempo aumenta a proteção?", "correct": "Não, pois o atrito entre eles pode aumentar o risco de rompimento.", "wrong": ["Sim, porque duplica a barreira de proteção.", "Sim, mas somente quando são de materiais diferentes.", "Sim, desde que sejam utilizados apenas durante parte da relação sexual."], "explanation": "Utilizar dois preservativos simultaneamente não aumenta a proteção. O atrito entre eles pode favorecer o rompimento."},

      {"q": "Por que o método da tabelinha pode apresentar falhas?", "correct": "Porque o período fértil pode variar de um ciclo menstrual para outro.", "wrong": ["Porque todas as pessoas ovulam exatamente no mesmo dia.", "Porque o método impede a ovulação.", "Porque o método elimina os espermatozoides."], "explanation": "O período fértil pode variar ao longo dos ciclos menstruais. Por isso, prever os dias férteis apenas pelo calendário pode ser impreciso."},

      {"q": "Qual afirmação sobre os métodos contraceptivos está correta?", "correct": "A escolha do método deve considerar as características, as necessidades e as condições de saúde de cada pessoa.", "wrong": ["Todos os métodos contraceptivos apresentam a mesma eficácia.", "Os métodos hormonais são indicados para todas as pessoas, sem necessidade de avaliação.", "Todos os métodos contraceptivos também protegem contra ISTs."], "explanation": "Cada método possui características, vantagens e limitações. A escolha deve considerar as necessidades e condições de saúde de cada pessoa, com orientação profissional."}
    ]
    $json$::jsonb)
  loop
    pos := pos + 1;

    insert into public.questions (text, explanation, position)
    values (item->>'q', item->>'explanation', pos)
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