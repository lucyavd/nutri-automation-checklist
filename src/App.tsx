import { useState } from 'react';
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronDown, ClipboardCopy,
  ExternalLink, Leaf, MessageCircle, RotateCcw, Sparkles
} from 'lucide-react';
import { getDiagnosis, getSelectedAnswer, questions, resultCatalog, type Area } from './diagnostic';

const buttonMain = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#345E49] px-6 py-3 font-semibold text-white shadow-[0_5px_18px_rgba(52,94,73,.16)] transition hover:bg-[#254A37] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#345E49] disabled:cursor-not-allowed disabled:bg-[#B3C2B4] disabled:shadow-none';
const buttonSoft = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#D6E0D4] bg-white px-4 py-2.5 font-semibold text-[#345E49] transition hover:bg-[#EDF3EC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#345E49]';
const panel = 'rounded-[26px] border border-[#E0E6DC] bg-white shadow-[0_12px_45px_rgba(41,63,43,.045)]';

const links = [
  { label: 'Написать в Telegram', href: 'https://t.me/ludmila_avdeeva', className: 'bg-[#273B35] hover:bg-[#172E26]' },
  { label: 'Написать ВКонтакте', href: 'https://vk.com/ludmila_avdeeva', className: 'bg-[#3569A3] hover:bg-[#245C98]' }
];

function ResultDetails({ area, compact = false }: { area: Area; compact?: boolean }) {
  const info = resultCatalog[area];
  return (
    <div className="space-y-4">
      {!compact && (
        <>
          <p className="text-lg leading-relaxed text-[#394A3D]">{info.description}</p>
          <p className="font-medium leading-relaxed text-[#345E49]">{info.funnyLine}</p>
        </>
      )}
      {compact && <p className="leading-relaxed text-[#526055]">{info.description} {info.funnyLine}</p>}
      <div className={compact ? 'space-y-3' : 'space-y-4 rounded-2xl bg-[#F4F8F1] p-4 sm:p-5'}>
        <div>
          <h3 className="mb-1.5 font-bold text-[#233B2D]">С чего начать</h3>
          <p className="leading-relaxed text-[#4A554C]">{info.next}</p>
        </div>
        <div>
          <h3 className="mb-1.5 font-bold text-[#233B2D]">Как можно решить</h3>
          <p className="leading-relaxed text-[#4A554C]">{info.solution}</p>
        </div>
        {info.note && <p className="border-t border-[#DDE7D8] pt-3 text-sm leading-relaxed text-[#647367]">{info.note}</p>}
      </div>
    </div>
  );
}

function App() {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copyManual, setCopyManual] = useState(false);
  const completed = step === questions.length;
  const question = questions[step];
  const diagnosis = getDiagnosis(answers);
  const main = diagnosis.main;

  const summary = [
    'Привет, Люда. Я прошла чек-лист «А это точно должна делать ты?».',
    '',
    'Мои ответы:',
    ...questions.map((item, i) => (i + 1) + '. ' + item.title + '\n' + getSelectedAnswer(answers, i)),
    '',
    'Результат: ' + diagnosis.headline,
    ...(main ? ['Основная задача: ' + resultCatalog[main].title, 'С чего начать: ' + resultCatalog[main].next] : []),
    ...(diagnosis.additional.length ? ['Другие задачи: ' + diagnosis.additional.map(area => resultCatalog[area].title).join('; ')] : []),
    '',
    'Хочу обсудить, какие процессы в моей программе можно упростить.'
  ].join('\n');

  function navigate(target: number) {
    setStep(target);
    setCopied(false);
    setCopyManual(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function reset() {
    setAnswers({});
    navigate(0);
  }

  async function copyAnswers() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setCopyManual(false);
    } catch {
      setCopied(false);
      setCopyManual(true);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F7F1] px-4 py-5 text-[#253B2C] sm:py-9">
      <div className="mx-auto max-w-[760px] space-y-5">
        {!completed ? (
          <>
            <header className="relative overflow-hidden rounded-[26px] border border-[#DDE6D8] bg-[#EAF0E6] p-6 sm:p-9">
              <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#D6E6D3] opacity-75" />
              <div className="pointer-events-none absolute -bottom-28 -right-4 h-52 w-52 rounded-full border-[24px] border-[#DFEBDD] opacity-70" />
              <div className="relative">
                {step === 0 ? (
                  <>
                <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#C8D8C6] bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#47644C]">
                  <Leaf size={15} aria-hidden="true" />
                  Интерактивный чек-лист для нутрициологов
                </p>
                <h1 className="max-w-xl font-serif text-4xl font-bold leading-[1.12] tracking-tight sm:text-[46px]">А это точно должна делать ты?</h1>
                <p className="mt-5 max-w-xl leading-relaxed text-[#455748]">
                  Ведение клуба, марафона или мини-курса — это не только работа с участниками. Ещё есть доступы, материалы, напоминания и десятки организационных мелочей.
                </p>
                <p className="mt-3 max-w-xl leading-relaxed text-[#455748]">
                  Ответь на 7 вопросов и узнай, какие задачи можно доверить боту или приложению, а какие действительно требуют твоего участия.
                </p>
                <p className="mt-4 text-sm font-medium text-[#5B725E]">Без регистрации. Ответы никуда не отправляются.</p>
                  </>
                ) : (
                  <>
                    <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#47644C]">
                      <Leaf size={15} aria-hidden="true" /> Чек-лист для нутрициологов
                    </p>
                    <p className="font-serif text-2xl font-bold">А это точно должна делать ты?</p>
                  </>
                )}
              </div>
            </header>

            <section className={panel + ' p-5 sm:p-8'} aria-labelledby="question-title">
              <div className="mb-6 flex items-center justify-between gap-4 text-sm">
                <span className="font-bold text-[#335D46]">Вопрос {step + 1} из {questions.length}</span>
                <span className="font-medium text-[#708072]">{Math.round(step / questions.length * 100)}% пройдено</span>
              </div>
              <div className="mb-7 h-2 overflow-hidden rounded-full bg-[#E8EFE5]" role="progressbar" aria-label="Прогресс чек-листа" aria-valuemin={0} aria-valuemax={7} aria-valuenow={step}>
                <div className="h-full rounded-full bg-[#63866A] transition-all" style={{width: (step / questions.length * 100)+'%'}} />
              </div>
              <fieldset key={step}>
                <legend id="question-title" className="mb-3 text-2xl font-bold leading-snug sm:text-[28px]">{question.title}</legend>
                <p className="mb-5 text-sm text-[#6A786B]">Выбери один наиболее подходящий вариант.</p>
                <div className="space-y-3">
                  {question.choices.map(opt => {
                    const active = answers[step] === opt.id;
                    return (
                      <label key={opt.id} className={'flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-4 transition focus-within:ring-2 focus-within:ring-[#4D7957] ' + (active ? 'border-[#7EA288] bg-[#EDF5EB] shadow-sm' : 'border-[#E3E9E0] bg-[#FBFCFA] hover:border-[#B1CCB3] hover:bg-[#F5F9F3]')}>
                        <input type="radio" name="answer" className="mt-0.5 h-5 w-5 shrink-0 accent-[#345E49]" checked={active} onChange={() => setAnswers(prev => ({...prev,[step]:opt.id}))} />
                        <span className="min-w-0 flex-1 leading-relaxed">{opt.text}</span>
                        {active && <Check size={19} className="mt-0.5 shrink-0 text-[#345E49]" aria-hidden="true" />}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              <div className="mt-7 flex items-center justify-between gap-3">
                {step > 0 ? (
                  <button type="button" onClick={() => navigate(step - 1)} className={buttonSoft}>
                    <ArrowLeft size={18} aria-hidden="true" /> Назад
                  </button>
                ) : <span className="text-xs text-[#819083]">7 коротких вопросов</span>}
                <button type="button" disabled={!answers[step]} onClick={() => navigate(step + 1)} className={buttonMain}>
                  {step === questions.length - 1 ? 'Узнать результат' : 'Дальше'}
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </div>
            </section>
          </>
        ) : (
          <>
            <header className="rounded-[26px] border border-[#D1E1CF] bg-[#EAF0E6] p-6 sm:p-8">
              <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#47664F]">
                <Sparkles size={17} aria-hidden="true" /> Твой результат
              </div>
              <h1 className="font-serif text-3xl font-bold leading-tight sm:text-4xl">{diagnosis.headline}</h1>
              {(main === null || diagnosis.headline !== resultCatalog[main].title) && (
                <p className="mt-4 leading-relaxed text-[#4A5B4C]">{diagnosis.insight}</p>
              )}
              <p className="mt-3 text-xs text-[#667869]">Вывод основан на твоих ответах, а не на проверке твоих рабочих систем.</p>
            </header>

            {main ? (
              <section id="main-result" className={panel + ' space-y-5 p-5 sm:p-8'}>
                {diagnosis.headline !== resultCatalog[main].title && (
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#EFF4EB] px-3 py-2 text-sm font-semibold text-[#46674C]">
                    <CheckCircle2 size={17} aria-hidden="true" />
                    Главная задача: {resultCatalog[main].title}
                  </div>
                )}
                <ResultDetails area={main} />
                <a href="#contact" className="inline-flex items-center gap-1.5 font-semibold text-[#345E49] underline underline-offset-4 hover:text-[#203E2D]">
                  Обсудить мою задачу <ArrowRight size={17} aria-hidden="true" />
                </a>
              </section>
            ) : (
              <section id="main-result" className={panel + ' p-5 sm:p-8'}>
                <h2 className="mb-3 text-xl font-bold">И это тоже результат</h2>
                <p className="leading-relaxed text-[#4B594B]">Возможно, тебе уже удобно работать в своей системе. Не обязательно менять её только потому, что появился новый инструмент. Если какая-то конкретная задача всё же мешает — её можно обсудить отдельно.</p>
              </section>
            )}

            <section id="contact" className="scroll-mt-5 rounded-[26px] border border-[#D8E4D0] bg-[#E9F0E4] p-5 sm:p-8">
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#5F7764]">Если захочешь обсудить решение</p>
              <h2 className="mb-3 font-serif text-2xl font-bold sm:text-3xl">Привет, меня зовут Люда</h2>
              <p className="leading-relaxed text-[#4B5B4D]">
                Я разрабатываю чат-ботов, мини-приложения и приложения для клубов. Помогаю организовать работу с участниками так, чтобы не приходилось постоянно заниматься одними и теми же техническими и организационными вопросами.
              </p>
              <p className="mt-3 leading-relaxed text-[#4B5B4D]">
                Необязательно создавать большое приложение. Иногда достаточно небольшого бота — всё зависит от задачи.
              </p>
              <h3 className="mt-5 text-xl font-bold">Хочешь обсудить, что можно упростить в твоей программе?</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#637466]">Можешь отправить мне свои ответы, чтобы не объяснять всю ситуацию заново.</p>
              <button type="button" onClick={copyAnswers} className={buttonSoft + ' mt-4 w-full'}>
                {copied ? <Check size={18} aria-hidden="true" /> : <ClipboardCopy size={18} aria-hidden="true" />}
                {copied ? 'Ответы скопированы' : 'Скопировать мои ответы'}
              </button>
              {copyManual && (
                <div className="mt-3">
                  <p className="mb-2 text-sm text-[#536653]">Автоматическое копирование недоступно. Выдели текст ниже и скопируй его вручную.</p>
                  <textarea aria-label="Мои ответы для копирования" readOnly value={summary} onFocus={event => event.currentTarget.select()} className="h-36 w-full resize-y rounded-xl border border-[#C8D7C2] bg-white p-3 text-sm" />
                </div>
              )}
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {links.map(link => (
                  <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className={'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold text-white transition ' + link.className}>
                    <MessageCircle size={17} aria-hidden="true" />
                    {link.label}
                    <ExternalLink size={14} aria-hidden="true" />
                  </a>
                ))}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[#68786A]">Ничего не отправляется автоматически. Если копируешь ответы, вставь их в удобном мессенджере самостоятельно.</p>
            </section>

            {diagnosis.additional.length > 0 && (
              <section id="additional-results" className={panel + ' p-5 sm:p-7'}>
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold text-[#2D4833] [&::-webkit-details-marker]:hidden">
                    <span>Ещё стоит обратить внимание ({diagnosis.additional.length})</span>
                    <ChevronDown size={20} className="shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-[#6C7A6D]">Не обязательно менять всё одновременно. К этим задачам можно вернуться позже.</p>
                  <div className="mt-5 space-y-5">
                    {diagnosis.additional.map(area => (
                      <article key={area} className="space-y-3 border-t border-[#E4E9E0] pt-5">
                        <h3 className="text-xl font-bold">{resultCatalog[area].title}</h3>
                        <ResultDetails area={area} compact />
                      </article>
                    ))}
                  </div>
                </details>
              </section>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-6 text-sm">
              <span className="text-[#748074]">Не всё нужно автоматизировать. Иногда достаточно навести порядок.</span>
              <button type="button" onClick={reset} className="inline-flex items-center gap-2 font-semibold text-[#345E49] hover:underline">
                <RotateCcw size={17} aria-hidden="true" /> Пройти ещё раз
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default App;
