import { ACHIEVEMENT_LOCALES } from "./catalog.js";
const rows = data => Object.fromEntries(Object.entries(data).map(([key, text]) => {
  const values = text.split(" | ");
  return [key, Object.fromEntries(ACHIEVEMENT_LOCALES.map((locale, i) => [locale, values[i]]))];
}));

export const PROGRESSION_NAMES = rows({
  tutorCount: "Tutor Trailblazer | Pionero del tutor | Desbravador do tutor | Pioniere del tutor | Pionnier du tutorat | Tutor-Pionier | チューターの開拓者 | ट्यूटर का पथप्रदर्शक | رائد المعلّم | 导师探索者",
  skillTreeCount: "Lesson Quest | Aventura de lecciones | Jornada de lições | Avventura tra le lezioni | Aventure des leçons | Lektionsabenteuer | レッスンの冒険 | पाठों की यात्रा | مغامرة الدروس | 课程冒险",
  flashcardsCount: "Word Collector | Coleccionista de palabras | Colecionador de palavras | Collezionista di parole | Collectionneur de mots | Wortsammler | ことばコレクター | शब्दों का संग्रहकर्ता | جامع الكلمات | 单词收藏家",
  questionsCount: "Code Cracker | Descifrador de código | Decifrador de código | Decifratore di codice | Décodeur | Codeknacker | コードを解く者 | कोड सुलझाने वाला | محلّل الشيفرات | 代码解谜者",
  tutor: "Tutor Triumph | Triunfo del tutor | Triunfo do tutor | Trionfo del tutor | Victoire du tutorat | Tutor-Triumph | チューターで大勝利 | ट्यूटर में विजय | انتصار المعلّم | 导师大捷",
  skillTree: "Level Explorer | Explorador de niveles | Explorador de níveis | Esploratore di livelli | Explorateur de niveaux | Level-Entdecker | レベル探検家 | स्तरों का खोजकर्ता | مستكشف المستويات | 等级探索家",
  flashcards: "Word Wizard | Mago de las palabras | Mago das palavras | Mago delle parole | Magicien des mots | Wortzauberer | ことばの魔法使い | शब्दों का जादूगर | ساحر الكلمات | 单词魔法师",
  goals: "Mission Accomplished | Misión cumplida | Missão cumprida | Missione compiuta | Mission accomplie | Mission erfüllt | ミッション達成 | मिशन पूरा | المهمة أُنجزت | 任务达成",
  repairs: "Comeback Kid | Gran regreso | Grande retorno | Grande ritorno | Retour gagnant | Starkes Comeback | 見事なカムバック | शानदार वापसी | عودة قوية | 王者归来",
  phonicsCards: "Sound Collector | Coleccionista de sonidos | Colecionador de sons | Collezionista di suoni | Collectionneur de sons | Klangsammler | 音のコレクター | ध्वनियों का संग्रहकर्ता | جامع الأصوات | 发音收藏家",
  phonicsDecks: "Sound Safari | Safari de sonidos | Safári de sons | Safari dei suoni | Safari des sons | Klang-Safari | 音のサファリ | ध्वनियों की सफारी | سفاري الأصوات | 发音探险",
  immersionChecklists: "Out in the World | Por el mundo | Pelo mundo | In giro per il mondo | À la découverte du monde | Hinaus in die Welt | 世界へ飛び出そう | दुनिया में निकलो | انطلق إلى العالم | 走向世界",
  immersionTasks: "Real-World Explorer | Explorador del mundo real | Explorador do mundo real | Esploratore del mondo reale | Explorateur du monde réel | Alltagsentdecker | 日常の探検家 | असली दुनिया का खोजकर्ता | مستكشف الواقع | 现实探索家",
  chapters: "Chapter Hopper | Viajero de capítulos | Viajante de capítulos | Viaggiatore tra capitoli | Voyageur des chapitres | Kapitelreisender | チャプターの旅人 | अध्यायों का यात्री | رحّالة الفصول | 章节旅行家",
  allChapters: "Cover to Cover | De principio a fin | Do começo ao fim | Dall’inizio alla fine | De bout en bout | Von Anfang bis Ende | 最初から最後まで | शुरू से अंत तक | من البداية إلى النهاية | 从头到尾",
  reviewVideos: "Encore! | ¡Otra vez! | Mais uma vez! | Bis! | Encore ! | Zugabe! | アンコール！ | एक बार और! | مرة أخرى! | 再来一次！",
  allVideos: "Full Replay | Repaso completo | Revisão completa | Replay completo | Rediffusion complète | Komplette Wiederholung | 全編リプレイ | पूरा रीप्ले | إعادة كاملة | 全部回放",
  reviewChecklists: "Reviewed and Ready | Repasado y listo | Revisado e pronto | Ripassato e pronto | Révisé et prêt | Wiederholt und bereit | 復習して準備万端 | दोहराया और तैयार | راجعت وأصبحت جاهزًا | 温故知新",
  allChecklists: "Nothing Missed | Sin dejar nada | Sem deixar nada | Nulla tralasciato | Rien oublié | Nichts übersehen | 取りこぼしなし | कुछ नहीं छूटा | لم يفتك شيء | 一项不漏",
  postCourse: "Beyond the Diploma | Más allá del diploma | Além do diploma | Oltre il diploma | Au-delà du diplôme | Über den Abschluss hinaus | 卒業のその先へ | डिप्लोमा के आगे | ما بعد الشهادة | 毕业之后",
  fullPiyali: "Language Legend | Leyenda de los idiomas | Lenda dos idiomas | Leggenda delle lingue | Légende des langues | Sprachlegende | 言語のレジェンド | भाषाओं का दिग्गज | أسطورة اللغات | 语言传奇",
  fullRobots: "Code Legend | Leyenda del código | Lenda do código | Leggenda del codice | Légende du code | Codelegende | コードのレジェンド | कोड का दिग्गज | أسطورة البرمجة | 编程传奇",
  conversationsCount: "Talk of the Town | La voz del momento | A voz do momento | Sulla bocca di tutti | À vous la parole | Stadtgespräch | 会話の主役 | बातचीत का सितारा | نجم المحادثة | 会话之星",
  chapter0: "Liftoff! | ¡Despegue! | Decolagem! | Decollo! | Décollage ! | Start frei! | リフトオフ！ | उड़ान शुरू! | انطلاق! | 起飞！",
  chapter1: "Hello, World! | ¡Hola, mundo! | Olá, mundo! | Ciao, mondo! | Bonjour, le monde ! | Hallo, Welt! | ハロー、ワールド！ | नमस्ते दुनिया! | مرحبًا بالعالم! | 你好，世界！",
  chapter2: "Object Champion | Campeón de los objetos | Campeão dos objetos | Campione degli oggetti | Champion des objets | Objekt-Champion | オブジェクトの王者 | ऑब्जेक्ट चैंपियन | بطل الكائنات | 对象冠军",
  chapter3: "Front Row | Primera fila | Primeira fila | Prima fila | Au premier rang | Erste Reihe | 最前列へ | पहली कतार | الصف الأول | 前端先锋",
  chapter4: "Behind the Scenes | Tras bambalinas | Nos bastidores | Dietro le quinte | Dans les coulisses | Hinter den Kulissen | 舞台裏へ | पर्दे के पीछे | خلف الكواليس | 幕后高手",
  chapter5: "App Maker | Creador de apps | Criador de apps | Creatore di app | Créateur d’apps | App-Macher | アプリメーカー | ऐप निर्माता | صانع التطبيقات | 应用创造者",
  chapterReview0: "Launch Check | Revisión de despegue | Checagem de decolagem | Controllo del decollo | Contrôle du lancement | Startkontrolle | 発射前チェック | उड़ान की जाँच | فحص الانطلاق | 起飞检查",
  chapterReview1: "Back to Basics | Vuelta a lo básico | De volta ao básico | Ritorno alle basi | Retour aux bases | Zurück zu den Grundlagen | 基本に戻ろう | मूल बातों पर वापसी | عودة إلى الأساسيات | 回归基础",
  chapterReview2: "Objects in Focus | Objetos en foco | Objetos em foco | Oggetti a fuoco | Objets en vue | Objekte im Fokus | オブジェクトに注目 | ऑब्जेक्ट पर ध्यान | الكائنات تحت المجهر | 聚焦对象",
  chapterReview3: "Frontend Rewind | Repaso del frontend | Revisão do frontend | Ripasso del frontend | Révision du frontend | Frontend-Rückblick | フロントエンドを復習 | फ्रंटएंड दोहराएँ | مراجعة الواجهة الأمامية | 前端回顾",
  chapterReview4: "Backend Rewind | Repaso del backend | Revisão do backend | Ripasso del backend | Révision du backend | Backend-Rückblick | バックエンドを復習 | बैकएंड दोहराएँ | مراجعة الواجهة الخلفية | 后端回顾",
  chapterReview5: "App Inspection | Inspección de apps | Inspeção de apps | Ispezione delle app | Inspection des apps | App-Inspektion | アプリ点検 | ऐप की जाँच | فحص التطبيقات | 应用检阅",
});

export const PROGRESSION_TASKS = rows({
  learningCount: "Complete {n} {activity}. | Completa {n} {activity}. | Complete {n} {activity}. | Completa {n} {activity}. | Terminez {n} {activity}. | Schließe {n} {activity} ab. | {activity}を{n}個完了する。 | {activity} के {n} कार्य पूरे करें। | أكمل {n} من {activity}. | 完成{n}个{activity}。",
  questionsCount: "Solve {n} coding questions. | Resuelve {n} preguntas de programación. | Resolva {n} questões de programação. | Risolvi {n} domande di programmazione. | Résolvez {n} questions de programmation. | Löse {n} Programmierfragen. | プログラミング問題を{n}問解く。 | {n} प्रोग्रामिंग प्रश्न हल करें। | حلّ {n} أسئلة برمجة. | 解答{n}道编程问题。",
  level: "Complete all {activity} at {level} or higher. | Completa todo el contenido de {activity} en {level} o superior. | Complete todo o conteúdo de {activity} em {level} ou superior. | Completa tutti i contenuti di {activity} a {level} o superiore. | Terminez tous les contenus de {activity} à {level} ou au-dessus. | Schließe alle {activity} auf {level} oder höher ab. | {level}以上の{activity}をすべて完了する。 | {level} या उससे ऊपर के स्तर पर {activity} के सभी कार्य पूरे करें। | أكمل كل {activity} بمستوى {level} أو أعلى. | 完成{level}或更高等级的全部{activity}。",
  levelTask: "Complete a plan at {level} or higher in {activity}. | Completa un plan de {activity} en {level} o superior. | Complete um plano de {activity} em {level} ou superior. | Completa un piano di {activity} a {level} o superiore. | Terminez un plan de {activity} à {level} ou au-dessus. | Schließe einen Plan für {activity} auf {level} oder höher ab. | {level}以上の{activity}プランを完了する。 | {level} या उससे ऊपर के स्तर पर {activity} की योजना पूरी करें। | أكمل خطة {activity} بمستوى {level} أو أعلى. | 完成一个{level}或更高等级的{activity}计划。",
  count: "Complete {n} {activity}. | Completa {n} {activity}. | Complete {n} {activity}. | Completa {n} {activity}. | Terminez {n} {activity}. | Schließe {n} {activity} ab. | {activity}を{n}個完了する。 | {activity} के {n} कार्य पूरे करें। | أكمل {n} من {activity}. | 完成{n}个{activity}。",
  set: "Complete all {activity}. | Completa todo el contenido de {activity}. | Complete todo o conteúdo de {activity}. | Completa tutti i contenuti di {activity}. | Terminez tous les contenus de {activity}. | Schließe alle {activity} ab. | {activity}をすべて完了する。 | {activity} के सभी कार्य पूरे करें। | أكمل كل {activity}. | 完成全部{activity}。",
  decks: "Complete {n} phonics decks. | Completa {n} barajas de fonética. | Complete {n} baralhos de fonética. | Completa {n} mazzi di fonetica. | Terminez {n} jeux de phonétique. | Schließe {n} Aussprache-Kartensätze ab. | 発音デッキを{n}組完了する。 | {n} उच्चारण डेक पूरे करें। | أكمل {n} مجموعات صوتيات. | 完成{n}个语音卡组。",
  videos: "Watch a chapter review video. | Mira un video de repaso de un capítulo. | Assista a um vídeo de revisão de capítulo. | Guarda un video di ripasso di un capitolo. | Regardez une vidéo de révision de chapitre. | Sieh dir ein Kapitel-Wiederholungsvideo an. | チャプターの復習動画を視聴する。 | एक अध्याय का समीक्षा वीडियो देखें। | شاهد فيديو مراجعة فصل. | 看完一个章节复习视频。",
  postCourse: "Solve {n} post-course questions. | Resuelve {n} preguntas después del curso. | Resolva {n} questões após o curso. | Risolvi {n} domande dopo il corso. | Résolvez {n} questions après le cours. | Löse {n} Fragen nach dem Kurs. | 修了後の問題を{n}問解く。 | पाठ्यक्रम के बाद {n} प्रश्न हल करें। | حلّ {n} أسئلة بعد الدورة. | 解答{n}道毕业后问题。",
  fullPiyali: "Complete all C2 lessons, Tutor lessons and flashcards in one language; earlier level awards are included. | Completa todas las lecciones, lecciones del tutor y tarjetas de C2 en un idioma; se incluyen los logros de niveles anteriores. | Complete todas as lições, lições do tutor e cartões de C2 em um idioma; as conquistas dos níveis anteriores estão incluídas. | Completa tutte le lezioni, lezioni del tutor e schede di C2 in una lingua; sono inclusi i traguardi dei livelli precedenti. | Terminez toutes les leçons, leçons du tuteur et cartes C2 dans une langue ; les réussites des niveaux précédents sont incluses. | Schließe alle C2-Lektionen, Tutor-Lektionen und Lernkarten in einer Sprache ab; Auszeichnungen früherer Niveaus sind enthalten. | 1つの言語でC2の全レッスン、チューターレッスン、単語カードを完了する。下位レベルの実績も獲得できる。 | एक भाषा में C2 के सभी पाठ, ट्यूटर पाठ और शब्द कार्ड पूरे करें; निचले स्तरों की उपलब्धियाँ भी शामिल हैं। | أكمل كل دروس C2 ودروس المعلّم والبطاقات في لغة واحدة؛ تشمل الإنجازات للمستويات السابقة. | 在一种语言中完成C2的全部课程、导师课时和单词卡，同时获得较低等级的成就。",
  fullRobots: "Complete a coding course, including every chapter and review. | Completa un curso de programación con todos sus capítulos y repasos. | Complete um curso de programação com todos os capítulos e revisões. | Completa un corso di programmazione con tutti i capitoli e ripassi. | Terminez un cours de programmation avec tous ses chapitres et révisions. | Schließe einen Programmierkurs mit allen Kapiteln und Wiederholungen ab. | 全チャプターと復習を含むプログラミングコースを修了する。 | सभी अध्यायों और समीक्षाओं सहित एक प्रोग्रामिंग पाठ्यक्रम पूरा करें। | أكمل دورة برمجة بكل فصولها ومراجعاتها. | 完成一门编程课程的全部章节和复习。",
  conversationCount: "Complete {n} conversation goals. | Completa {n} metas de conversación. | Complete {n} metas de conversa. | Completa {n} obiettivi di conversazione. | Réussissez {n} objectifs de conversation. | Erfülle {n} Gesprächsziele. | 会話の目標を{n}個達成する。 | बातचीत के {n} लक्ष्य पूरे करें। | أنجز {n} أهداف محادثة. | 完成{n}个会话目标。",
  chapterComplete: "Complete Chapter {chapter}. | Completa el capítulo {chapter}. | Complete o capítulo {chapter}. | Completa il capitolo {chapter}. | Terminez le chapitre {chapter}. | Schließe Kapitel {chapter} ab. | チャプター{chapter}を完了する。 | अध्याय {chapter} पूरा करें। | أكمل الفصل {chapter}. | 完成第{chapter}章。",
  chapterReview: "Watch the Chapter {chapter} review and complete its checklist. | Mira el repaso del capítulo {chapter} y completa su lista. | Assista à revisão do capítulo {chapter} e complete sua lista. | Guarda il ripasso del capitolo {chapter} e completa la sua lista. | Regardez la révision du chapitre {chapter} et terminez sa liste. | Sieh dir die Wiederholung zu Kapitel {chapter} an und schließe die Checkliste ab. | チャプター{chapter}の復習動画を見てチェックリストを完了する。 | अध्याय {chapter} की समीक्षा देखें और उसकी सूची पूरी करें। | شاهد مراجعة الفصل {chapter} وأكمل قائمته. | 看完第{chapter}章复习并完成清单。",
});

const PROGRESSION_ACTIVITIES = rows({
  phonicsCards: "phonics cards | tarjetas de fonética | cartões de fonética | schede di fonetica | cartes de phonétique | Aussprachekarten | 発音カード | उच्चारण कार्ड | بطاقات الصوتيات | 语音卡",
  immersionChecklists: "immersion checklists | listas de inmersión | listas de imersão | liste di immersione | listes d’immersion | Immersions-Checklisten | イマージョンチェックリスト | इमर्शन सूचियाँ | قوائم الانغماس | 沉浸清单",
  immersionTasks: "immersion tasks | tareas de inmersión | tarefas de imersão | attività di immersione | tâches d’immersion | Immersionsaufgaben | イマージョン課題 | इमर्शन कार्य | مهام الانغماس | 沉浸任务",
  chapters: "chapters | capítulos | capítulos | capitoli | chapitres | Kapitel | チャプター | अध्याय | الفصول | 章节",
  allChapters: "chapters in one course | capítulos de un curso | capítulos de um curso | capitoli di un corso | chapitres d’un cours | Kapitel eines Kurses | 1つのコースのチャプター | एक पाठ्यक्रम के अध्याय | فصول دورة واحدة | 一门课程的章节",
  allVideos: "review videos in one course | videos de repaso de un curso | vídeos de revisão de um curso | video di ripasso di un corso | vidéos de révision d’un cours | Wiederholungsvideos eines Kurses | 1つのコースの復習動画 | एक पाठ्यक्रम के समीक्षा वीडियो | فيديوهات مراجعة دورة واحدة | 一门课程的复习视频",
  reviewChecklists: "review checklists | listas de repaso | listas de revisão | liste di ripasso | listes de révision | Wiederholungs-Checklisten | 復習チェックリスト | समीक्षा सूचियाँ | قوائم المراجعة | 复习清单",
  allChecklists: "review checklists in one course | listas de repaso de un curso | listas de revisão de um curso | liste di ripasso di un corso | listes de révision d’un cours | Wiederholungs-Checklisten eines Kurses | 1つのコースの復習チェックリスト | एक पाठ्यक्रम की समीक्षा सूचियाँ | قوائم مراجعة دورة واحدة | 一门课程的复习清单",
  tutor: "Tutor lessons | lecciones del tutor | lições do tutor | lezioni del tutor | leçons du tuteur | Tutor-Lektionen | チューターのレッスン | ट्यूटर पाठ | دروس المعلّم | 导师课时",
  skillTree: "lessons | lecciones | lições | lezioni | leçons | Lektionen | レッスン | पाठ | الدروس | 课程",
  flashcards: "flashcards | tarjetas | cartões | schede | cartes | Lernkarten | 単語カード | शब्द कार्ड | البطاقات | 单词卡",
  goals: "personal goal practice | práctica de metas personales | prática de metas pessoais | pratica degli obiettivi personali | pratique des objectifs personnels | persönlicher Zielpraxis | 個人目標の練習 | व्यक्तिगत लक्ष्य अभ्यास | ممارسة الأهداف الشخصية | 个人目标练习",
  repairs: "repair practice | práctica de reparación | prática de recuperação | pratica di recupero | pratique de remédiation | Förderpraxis | 弱点克服の練習 | सुधार अभ्यास | ممارسة العلاج | 修复练习",
});
const SINGULAR_ACTIVITIES = rows({
  chapters: "chapter | capítulo | capítulo | capitolo | chapitre | Kapitel | チャプター | अध्याय | الفصول | 章节",
  immersionChecklists: "immersion checklist | lista de inmersión | lista de imersão | lista di immersione | liste d’immersion | Immersions-Checkliste | イマージョンチェックリスト | इमर्शन सूची | قوائم الانغماس | 沉浸清单",
  reviewChecklists: "review checklist | lista de repaso | lista de revisão | lista di ripasso | liste de révision | Wiederholungs-Checkliste | 復習チェックリスト | समीक्षा सूची | قوائم المراجعة | 复习清单",
});
const CHAPTER_LABEL = rows({chapter: "Chapter {chapter} | Capítulo {chapter} | Capítulo {chapter} | Capitolo {chapter} | Chapitre {chapter} | Kapitel {chapter} | チャプター{chapter} | अध्याय {chapter} | الفصل {chapter} | 第{chapter}章"});
const PROGRESSION_SINGULAR_TASKS = rows({
  decks: "Complete one phonics deck. | Completa una baraja de fonética. | Complete um baralho de fonética. | Completa un mazzo di fonetica. | Terminez un jeu de phonétique. | Schließe einen Aussprache-Kartensatz ab. | 発音デッキを1組完了する。 | एक उच्चारण डेक पूरा करें। | أكمل مجموعة صوتيات واحدة. | 完成一个语音卡组。",
  postCourse: "Solve one post-course question. | Resuelve una pregunta después del curso. | Resolva uma questão após o curso. | Risolvi una domanda dopo il corso. | Résolvez une question après le cours. | Löse eine Frage nach dem Kurs. | 修了後の問題を1問解く。 | पाठ्यक्रम के बाद एक प्रश्न हल करें। | حلّ سؤالًا بعد الدورة. | 解答一道毕业后问题。",
});

export function localizeProgression(item, locale) {
  const n = new Intl.NumberFormat(locale, locale === "ar" ? { numberingSystem: "arab" } : {}).format(item.target);
  const name = PROGRESSION_NAMES[item.name][locale];
  const chapter = item.chapterNumber === undefined ? "" : new Intl.NumberFormat(locale).format(item.chapterNumber);
  const detail = chapter !== "" ? CHAPTER_LABEL.chapter[locale].replace("{chapter}", chapter) : item.level || (item.requirement.target ? n : "");
  const values = { activity: (item.target === 1 ? SINGULAR_ACTIVITIES[item.name]?.[locale] : null) || PROGRESSION_ACTIVITIES[item.name.replace(/Count$/, "")]?.[locale] || name, level: item.level, n, chapter, app: item.sourceName };
  return {
    title: `${name}${detail ? ` · ${detail}` : ""}`,
    desc: (item.target === 1 && PROGRESSION_SINGULAR_TASKS[item.task] ? PROGRESSION_SINGULAR_TASKS[item.task][locale] : PROGRESSION_TASKS[item.task][locale]).replace(/\{(\w+)\}/g, (_, key) => values[key]),
  };
}
