import { localizeProgression } from "./progressionCopy.js";
import { ACHIEVEMENT_LOCALES, normalizeAchievementLocale } from "./catalog.js";
// Columns always follow ACHIEVEMENT_LOCALES. Every supported UI language has
// authored copy; only unsupported languages fall back to English.
const localized = (values) => Object.fromEntries(ACHIEVEMENT_LOCALES.map((locale, i) => [locale, values[i]]));
const lines = (text) => localized(text.split(" | "));

export const UI_COPY = Object.fromEntries(Object.entries({
  testUnlock: "Test unlock | Probar desbloqueo | Testar desbloqueio | Prova sblocco | Tester le déblocage | Freischaltung testen | 獲得表示をテスト | अनलॉक परीक्षण | اختبار الفتح | 测试解锁",
  continue: "Continue | Continuar | Continuar | Continua | Continuer | Weiter | 続ける | जारी रखें | متابعة | 继续",
  achievementUnlocked: "Achievement unlocked! | ¡Logro desbloqueado! | Conquista desbloqueada! | Obiettivo sbloccato! | Succès débloqué ! | Erfolg freigeschaltet! | 実績を獲得！ | उपलब्धि अनलॉक! | تم فتح إنجاز! | 成就已解锁！",
  title: "Cross-platform Transcript | Historial multiplataforma | Histórico multiplataforma | Registro multipiattaforma | Relevé multiplateforme | Plattformübergreifender Nachweis | クロスプラットフォーム修了記録 | क्रॉस-प्लेटफ़ॉर्म रिकॉर्ड | سجل عابر للمنصات | 跨平台学习记录",
  subtitle: "Achievements earned on Robots Building Education & Piyali | Logros obtenidos en Robots Building Education y Piyali | Conquistas obtidas no Robots Building Education e Piyali | Obiettivi ottenuti su Robots Building Education e Piyali | Succès obtenus sur Robots Building Education et Piyali | Erfolge in Robots Building Education & Piyali | Robots Building EducationとPiyaliで獲得した実績 | Robots Building Education और Piyali पर अर्जित उपलब्धियां | الإنجازات المكتسبة في Robots Building Education وPiyali | 在 Robots Building Education 和 Piyali 获得的成就",
  completed: "Completed | Completados | Concluídos | Completati | Terminés | Abgeschlossen | 完了 | पूरा किया गया | المكتملة | 已完成",
  uncompleted: "Uncompleted | Incompletos | Não concluídos | Non completati | Non terminés | Ausstehend | 未達成 | शेष | غير مكتملة | 未完成",
  piyali: "Piyali | Piyali | Piyali | Piyali | Piyali | Piyali | Piyali | पियाली | بيالي | Piyali",
  robots: "Robots Building Education | Robots Building Education | Robots Building Education | Robots Building Education | Robots Building Education | Robots Building Education | Robots Building Education | Robots Building Education | Robots Building Education | Robots Building Education",
  beginner: "Beginner | Principiante | Iniciante | Principiante | Débutant | Einstieg | 初級 | शुरुआती | مبتدئ | 初级",
  intermediate: "Intermediate | Intermedio | Intermediário | Intermedio | Intermédiaire | Aufbau | 中級 | मध्यम | متوسط | 中级",
  advanced: "Advanced | Avanzado | Avançado | Avanzato | Avancé | Fortgeschritten | 上級 | उन्नत | متقدم | 高级",
  completion: "Course completion | Curso completado | Curso concluído | Corso completato | Cours terminé | Kursabschluss | コース修了 | पाठ्यक्रम पूरा | إتمام الدورة | 课程完成",
  all: "All | Todos | Todos | Tutti | Tous | Alle | すべて | सभी | الكل | 全部",
  collected: "Collected | Obtenidos | Conquistados | Ottenuti | Obtenus | Gesammelt | 獲得済み | प्राप्त | المُجمّعة | 已收集",
  locked: "To discover | Por descubrir | A descobrir | Da scoprire | À découvrir | Noch zu entdecken | 未獲得 | अभी बाकी | بانتظار الاكتشاف | 待解锁",
  unlocked: "Unlocked | Desbloqueado | Desbloqueado | Sbloccato | Débloqué | Freigeschaltet | 獲得済み | अनलॉक | تم الفتح | 已解锁",
  requirement: "Completion requirement | Requisito de finalización | Requisito de conclusão | Requisito di completamento | Condition de réussite | Abschlussanforderung | 修了条件 | पूर्णता की शर्त | شرط الإتمام | 完成条件",
  earnedRequirement: "Completed learning | Aprendizaje completado | Aprendizagem concluída | Apprendimento completato | Apprentissage terminé | Abgeschlossene Lerninhalte | 完了した学び | पूरा किया गया सीखना | التعلّم المكتمل | 已完成的学习",
  test: "Test achievement | Probar logro | Testar conquista | Prova obiettivo | Tester un succès | Erfolg testen | 実績をテスト | उपलब्धि जाँचें | تجربة إنجاز | 测试成就",
  testAward: "Test reward | Logro de prueba | Conquista de teste | Premio di prova | Récompense de test | Testerfolg | テスト報酬 | परीक्षण पुरस्कार | مكافأة تجريبية | 测试奖励",
  testNote: "Test rewards sync across apps. They do not certify completed learning or unlock the final award. | Los logros de prueba se sincronizan entre apps. No certifican aprendizaje ni desbloquean el logro final. | As conquistas de teste sincronizam entre apps. Não certificam aprendizagem nem liberam a conquista final. | I premi di prova si sincronizzano tra le app. Non certificano l’apprendimento né sbloccano il premio finale. | Les récompenses de test se synchronisent entre les apps. Elles ne valident pas l’apprentissage et ne débloquent pas le succès final. | Testerfolge werden zwischen Apps synchronisiert. Sie bestätigen keinen Lernabschluss und schalten den letzten Erfolg nicht frei. | テスト報酬はアプリ間で同期されます。学習の修了を証明せず、最終報酬も解除しません。 | परीक्षण पुरस्कार ऐपों में सिंक होते हैं। वे सीखना पूरा होने का प्रमाण नहीं हैं और अंतिम पुरस्कार नहीं खोलते। | تتزامن المكافآت التجريبية بين التطبيقات، لكنها لا تثبت إتمام التعلّم ولا تفتح المكافأة النهائية. | 测试奖励会跨应用同步，但不代表已完成学习，也不会解锁最终成就。",
  testDone: "All test rewards collected | Ya tienes todos los logros de prueba | Todas as conquistas de teste obtidas | Tutti i premi di prova ottenuti | Tous les succès de test sont obtenus | Alle Testerfolge gesammelt | テスト報酬をすべて獲得しました | सभी परीक्षण पुरस्कार प्राप्त | جُمعت كل المكافآت التجريبية | 已收集所有测试奖励",
  empty: "Your transcript grows as you complete lessons, levels and courses. | Tu historial crece al completar lecciones, niveles y cursos. | Seu histórico cresce ao concluir lições, níveis e cursos. | Il tuo registro cresce completando lezioni, livelli e corsi. | Votre relevé grandit à chaque leçon, niveau et cours terminé. | Dein Lernnachweis wächst mit abgeschlossenen Lektionen, Stufen und Kursen. | レッスン、レベル、コースを修了すると記録が増えていきます。 | पाठ, स्तर और पाठ्यक्रम पूरे करने पर आपका रिकॉर्ड बढ़ता है। | ينمو سجلك بإتمام الدروس والمستويات والدورات. | 完成课时、等级和课程，逐步丰富你的学习记录。",
  close: "Close | Cerrar | Fechar | Chiudi | Fermer | Schließen | 閉じる | बंद करें | إغلاق | 关闭",
  sync: "Sync | Sincronizar | Sincronizar | Sincronizza | Synchroniser | Synchronisieren | 同期 | सिंक करें | مزامنة | 同步",
  syncPending: "Sync pending | Sincronización pendiente | Sincronização pendente | Sincronizzazione in sospeso | Synchronisation en attente | Synchronisierung ausstehend | 同期待ち | सिंक लंबित है | المزامنة معلّقة | 等待同步",
  storageWarning: "Device storage unavailable. Keep the app open until sync finishes. | El almacenamiento del dispositivo no está disponible. Mantén la app abierta hasta que termine la sincronización. | Armazenamento do dispositivo indisponível. Mantenha o app aberto até a sincronização terminar. | Memoria del dispositivo non disponibile. Tieni aperta l’app fino al termine della sincronizzazione. | Stockage de l’appareil indisponible. Gardez l’app ouverte jusqu’à la fin de la synchronisation. | Gerätespeicher nicht verfügbar. Lass die App geöffnet, bis die Synchronisierung abgeschlossen ist. | 端末に保存できません。同期が完了するまでアプリを開いたままにしてください。 | डिवाइस पर सेव नहीं हो रहा। सिंक पूरा होने तक ऐप खुला रखें। | تخزين الجهاز غير متاح. أبقِ التطبيق مفتوحًا حتى تكتمل المزامنة. | 设备存储不可用。请保持应用打开，直到同步完成。",
  syncDone: "Collection refreshed | Colección actualizada | Coleção atualizada | Collezione aggiornata | Collection actualisée | Sammlung aktualisiert | コレクションを更新しました | संग्रह अपडेट हुआ | تم تحديث المجموعة | 成就集已更新",
  syncError: "Could not sync. Your local collection is saved. | No se pudo sincronizar. Tu colección local está guardada. | Não foi possível sincronizar. Sua coleção local está salva. | Sincronizzazione non riuscita. La collezione locale è salvata. | Synchronisation impossible. Votre collection locale est enregistrée. | Synchronisierung fehlgeschlagen. Deine lokale Sammlung ist gespeichert. | 同期できませんでした。端末のコレクションは保存されています。 | सिंक नहीं हो सका। आपका स्थानीय संग्रह सुरक्षित है। | تعذّرت المزامنة. مجموعتك المحلية محفوظة. | 同步失败，本地成就集已保存。",
  local: "Saved on this device | Guardado en este dispositivo | Salvo neste dispositivo | Salvato su questo dispositivo | Enregistré sur cet appareil | Auf diesem Gerät gespeichert | この端末に保存 | इस डिवाइस पर सेव है | محفوظة على هذا الجهاز | 已保存在此设备",
  link: "Link account | Vincular cuenta | Vincular conta | Collega account | Lier un compte | Konto verbinden | アカウントを連携 | खाता जोड़ें | ربط حساب | 关联账户",
  keyLabel: "Nostr key (npub or nsec) | Clave Nostr (npub o nsec) | Chave Nostr (npub ou nsec) | Chiave Nostr (npub o nsec) | Clé Nostr (npub ou nsec) | Nostr-Schlüssel (npub oder nsec) | Nostrキー（npubまたはnsec） | Nostr कुंजी (npub या nsec) | مفتاح Nostr ‏(npub أو nsec) | Nostr 密钥（npub 或 nsec）",
  keyHint: "An npub views your collection. An nsec also lets this device publish rewards. | Una npub permite ver tu colección. Una nsec también permite publicar logros desde este dispositivo. | Uma npub permite ver sua coleção. Uma nsec também permite publicar conquistas neste dispositivo. | Una npub mostra la collezione. Una nsec permette anche di pubblicare premi da questo dispositivo. | Une npub permet de consulter la collection. Une nsec permet aussi de publier des récompenses depuis cet appareil. | Mit einer npub siehst du deine Sammlung. Mit einer nsec kann dieses Gerät auch Erfolge veröffentlichen. | npubでコレクションを閲覧できます。nsecを使うと、この端末から報酬を公開することもできます。 | npub से संग्रह देख सकते हैं। nsec से इस डिवाइस पर पुरस्कार प्रकाशित भी कर सकते हैं। | يتيح npub عرض مجموعتك، ويتيح nsec لهذا الجهاز نشر المكافآت أيضًا. | npub 可查看成就集，nsec 还允许此设备发布奖励。",
  connect: "Connect | Conectar | Conectar | Collega | Connecter | Verbinden | 接続 | जोड़ें | ربط | 连接",
  cancel: "Cancel | Cancelar | Cancelar | Annulla | Annuler | Abbrechen | キャンセル | रद्द करें | إلغاء | 取消",
  linked: "Account linked | Cuenta vinculada | Conta vinculada | Account collegato | Compte lié | Konto verbunden | 連携しました | खाता जुड़ गया | تم ربط الحساب | 账户已关联",
  invalidKey: "Enter a valid npub or nsec key. | Introduce una clave npub o nsec válida. | Insira uma chave npub ou nsec válida. | Inserisci una chiave npub o nsec valida. | Saisissez une clé npub ou nsec valide. | Gib einen gültigen npub- oder nsec-Schlüssel ein. | 有効なnpubまたはnsecキーを入力してください。 | मान्य npub या nsec कुंजी डालें। | أدخل مفتاح npub أو nsec صالحًا. | 请输入有效的 npub 或 nsec 密钥。",
  copy: "Copy public ID | Copiar ID público | Copiar ID público | Copia ID pubblico | Copier l’identifiant public | Öffentliche ID kopieren | 公開IDをコピー | सार्वजनिक ID कॉपी करें | نسخ المعرّف العام | 复制公开 ID",
  copySecret: "Copy secret key (nsec) | Copiar clave secreta (nsec) | Copiar chave secreta (nsec) | Copia chiave segreta (nsec) | Copier la clé secrète (nsec) | Geheimen Schlüssel kopieren (nsec) | 秘密鍵をコピー（nsec） | गुप्त कुंजी कॉपी करें (nsec) | نسخ المفتاح السرّي (nsec) | 复制私钥（nsec）",
  copied: "Copied | Copiado | Copiado | Copiato | Copié | Kopiert | コピーしました | कॉपी हुआ | تم النسخ | 已复制",
  copyError: "Could not copy the ID. | No se pudo copiar el ID. | Não foi possível copiar o ID. | Impossibile copiare l’ID. | Impossible de copier l’identifiant. | Die ID konnte nicht kopiert werden. | IDをコピーできませんでした。 | ID कॉपी नहीं हो सकी। | تعذّر نسخ المعرّف. | 无法复制 ID。",
  replay: "Replay celebration | Repetir celebración | Repetir celebração | Ripeti celebrazione | Rejouer la célébration | Feier wiederholen | お祝いを再生 | जश्न फिर देखें | إعادة الاحتفال | 重播庆祝动画",
  shared: "Both worlds | Ambos mundos | Ambos os mundos | Entrambi i mondi | Les deux univers | Beide Welten | 2つの世界 | दोनों दुनियाएँ | العالمان | 两个世界",
  finalTitle: "Two worlds mastered | Dos mundos conquistados | Dois mundos conquistados | Due mondi conquistati | Deux univers conquis | Zwei Welten gemeistert | 2つの世界を制覇 | दो दुनियाओं में महारत | إتقان عالمين | 掌握两个世界",
  finalDesc: "Complete a full language course in Piyali and a full coding course in Robots Building Education. | Completa un curso de idiomas en Piyali y uno de programación en Robots Building Education. | Conclua um curso de idiomas no Piyali e um de programação no Robots Building Education. | Completa un corso di lingua su Piyali e uno di programmazione su Robots Building Education. | Terminez un cours de langue sur Piyali et un cours de programmation sur Robots Building Education. | Schließe einen Sprachkurs in Piyali und einen Programmierkurs in Robots Building Education ab. | Piyaliの言語コースとRobots Building Educationのプログラミングコースを修了し、両方の修了実績を獲得する。 | Piyali में एक भाषा पाठ्यक्रम और Robots Building Education में एक प्रोग्रामिंग पाठ्यक्रम पूरा करें। दोनों पाठ्यक्रम पूर्णता पुरस्कार अर्जित करें; परीक्षण पुरस्कार नहीं गिने जाते। | أكمل دورة لغة في Piyali ودورة برمجة في Robots Building Education. | 完成Piyali的一门语言课程和Robots Building Education的一门编程课程，获得两个课程完成成就；测试奖励不计入。",
  chapter: "Path | Camino | Caminho | Percorso | Parcours | Lernpfad | 学習パス | सीखने का पथ | المسار | 路径",
  collectionLabel: "{count} of {total} collected | {count} de {total} obtenidos | {count} de {total} conquistados | {count} di {total} ottenuti | {count} sur {total} obtenus | {count} von {total} gesammelt | {total}個中{count}個獲得 | {total} में से {count} प्राप्त | {count} من {total} مُجمّعة | 已收集 {count} / {total}",
  awardError: "Could not award this reward. Try again. | No se pudo otorgar el logro. Inténtalo de nuevo. | Não foi possível conceder a conquista. Tente novamente. | Impossibile assegnare il premio. Riprova. | Impossible d’attribuer la récompense. Réessayez. | Der Erfolg konnte nicht vergeben werden. Versuche es erneut. | 報酬を付与できませんでした。もう一度お試しください。 | पुरस्कार नहीं दिया जा सका। फिर कोशिश करें। | تعذّر منح المكافأة. حاول مجددًا. | 无法授予奖励，请重试。",
}).map(([key, value]) => [key, lines(value)]));

export const CATEGORY_COPY = Object.fromEntries(Object.entries({
  tutor: "Tutor lessons | Lecciones del tutor | Lições do tutor | Lezioni del tutor | Leçons du tuteur | Tutor-Lektionen | チューターレッスン | ट्यूटर पाठ | دروس المعلّم | 导师课程",
  skillTree: "Skill tree | Árbol de habilidades | Árvore de habilidades | Albero delle abilità | Arbre de compétences | Fertigkeitenbaum | スキルツリー | कौशल वृक्ष | شجرة المهارات | 技能树",
  flashcards: "Flashcards | Tarjetas | Cartões | Schede | Cartes mémoire | Lernkarten | 単語カード | शब्द कार्ड | البطاقات التعليمية | 单词卡",
  conversations: "Conversations | Conversaciones | Conversas | Conversazioni | Conversations | Gespräche | 会話 | बातचीत | المحادثات | 会话",
  goals: "Personal goals | Metas personales | Metas pessoais | Obiettivi personali | Objectifs personnels | Persönliche Ziele | 個人目標 | व्यक्तिगत लक्ष्य | الأهداف الشخصية | 个人目标",
  repairs: "Repair practice | Práctica de reparación | Prática de recuperação | Pratica di recupero | Remédiation | Förderpraxis | 弱点克服の練習 | सुधार अभ्यास | ممارسة العلاج | 修复练习",
  phonics: "Phonics | Fonética | Fonética | Fonetica | Phonétique | Aussprache | 発音 | उच्चारण | الصوتيات | 语音",
  immersion: "Immersion | Inmersión | Imersão | Immersione | Immersion | Immersion | イマージョン | इमर्शन | الانغماس | 沉浸",
  chapters: "Chapters | Capítulos | Capítulos | Capitoli | Chapitres | Kapitel | チャプター | अध्याय | الفصول | 章节",
  reviews: "Chapter reviews | Repasos de capítulos | Revisões de capítulos | Ripassi dei capitoli | Révisions des chapitres | Kapitelwiederholungen | チャプター復習 | अध्याय समीक्षा | مراجعات الفصول | 章节复习",
  questions: "Coding questions | Preguntas de programación | Questões de programação | Domande di programmazione | Questions de programmation | Programmieraufgaben | プログラミング問題 | प्रोग्रामिंग प्रश्न | أسئلة البرمجة | 编程问题",
  courseCompletion: "Course completion | Curso completado | Curso concluído | Corso completato | Cours terminé | Kursabschluss | コース修了 | पाठ्यक्रम पूरा | إتمام الدورة | 课程完成",
}).map(([key, value]) => [key, lines(value)]));

export const FAMILY_COPY = Object.fromEntries(Object.entries({
  voice: "Find your voice | Encuentra tu voz | Encontre sua voz | Trova la tua voce | Trouvez votre voix | Finde deine Stimme | 自分の声を見つけよう | अपनी आवाज़ खोजें | اكتشف صوتك | 找到自己的声音",
  memory: "Garden of words | Jardín de palabras | Jardim de palavras | Giardino delle parole | Jardin des mots | Wortgarten | ことばの庭 | शब्दों का बगीचा | حديقة الكلمات | 词语花园",
  discovery: "Beyond the horizon | Más allá del horizonte | Além do horizonte | Oltre l’orizzonte | Au-delà de l’horizon | Hinter dem Horizont | 地平線の向こうへ | क्षितिज के पार | وراء الأفق | 地平线之外",
  journey: "Take flight | Alza el vuelo | Levante voo | Spicca il volo | Prenez votre envol | Heb ab | 羽ばたこう | उड़ान भरें | حلّق عاليًا | 展翅起飞",
  builder: "Ideas into orbit | Ideas en órbita | Ideias em órbita | Idee in orbita | Des idées en orbite | Ideen in der Umlaufbahn | アイデアを軌道へ | विचारों की उड़ान | أفكار في المدار | 让创意启航",
  completion: "A world unlocked | Un mundo desbloqueado | Um mundo desbloqueado | Un mondo sbloccato | Un monde débloqué | Eine neue Welt | 新たな世界へ | एक नई दुनिया | عالم جديد | 解锁新世界",
}).map(([key, value]) => [key, lines(value)]));

export const TUTOR_REACH_COPY = Object.fromEntries(Object.entries({
  activity: "Tutor lessons | Lecciones del tutor | Lições do tutor | Lezioni del tutor | Leçons du tuteur | Tutor-Lektionen | チューターレッスン | ट्यूटर पाठ | دروس المعلّم | 导师课程",
  desc: "Reach {level} in Tutor lessons. | Alcanza {level} en las lecciones del tutor. | Alcance {level} nas lições do tutor. | Raggiungi {level} nelle lezioni del tutor. | Atteignez {level} dans les leçons du tuteur. | Erreiche {level} in Tutor-Lektionen. | チューターレッスンで{level}に到達する。 | ट्यूटर पाठ में {level} तक पहुँचें। | بلغ {level} في دروس المعلّم. | 在导师课时中达到{level}。",
}).map(([key, text]) => [key, lines(text)]));

const TUTOR_REACH_TITLES = Object.fromEntries(Object.entries({
  A2: "Ready for Takeoff | Listo para despegar | Pronto para decolar | Pronto al decollo | Prêt au décollage | Bereit zum Abheben | 離陸準備完了 | उड़ान के लिए तैयार | جاهز للإقلاع | 准备起飞",
  B1: "Spread Your Wings | Abre tus alas | Abra suas asas | Apri le ali | Déployez vos ailes | Breite deine Flügel aus | 翼を広げよう | अपने पंख फैलाएँ | افرد جناحيك | 展翅高飞",
  B2: "Flying High | Volando alto | Voando alto | Volando alto | En plein vol | Hoch hinaus | 高く羽ばたこう | ऊँची उड़ान | حلّق عاليًا | 翱翔天际",
}).map(([key,text])=>[key,lines(text)]));

export function achievementText(key, language, values = {}) {
  const template = UI_COPY[key]?.[normalizeAchievementLocale(language)] || "";
  return template.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ""));
}

export function localizeAchievement(item, language) {
  const locale = normalizeAchievementLocale(language);
  const base = { ...item, familyTitle: FAMILY_COPY[item.family][locale], tierTitle: UI_COPY[item.tier][locale] };
  if (item.progression) return { ...base, ...localizeProgression(item, locale) };
  if (item.tier === "completion") return { ...base, title: UI_COPY.finalTitle[locale], desc: UI_COPY.finalDesc[locale] };
  return { ...base, title: `${TUTOR_REACH_TITLES[item.requirement.level][locale]} · ${item.requirement.level}`, desc: TUTOR_REACH_COPY.desc[locale].replaceAll("{level}", item.requirement.level) };
}
