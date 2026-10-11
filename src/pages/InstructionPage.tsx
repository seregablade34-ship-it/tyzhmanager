import { useState } from 'react'

/* ─── Аккордеон-секция ─── */
function Section({
  icon,
  title,
  defaultOpen = false,
  highlight = false,
  children,
}: {
  icon: string
  title: string
  defaultOpen?: boolean
  highlight?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-colors ${
        highlight
          ? 'bg-primary/5 border-primary/30'
          : 'bg-surface border-border'
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <span className="flex items-center gap-2 text-lg font-semibold text-text">
          <span className="text-xl">{icon}</span>
          {title}
        </span>
        <span
          className={`text-text-light text-xl transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        >
          ▾
        </span>
      </button>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-5 pb-5 space-y-4">{children}</div>
      </div>
    </div>
  )
}

/* ─── Страница ─── */
export default function InstructionPage() {
  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4 pb-12">

      {/* Заголовок */}
      <div className="mb-2">
        <h1 className="text-3xl font-bold mb-1 text-text">📖 Инструкция</h1>
        <p className="text-text-light">
          Как начать пользоваться и краткое описание всех разделов
        </p>
      </div>

      {/* ══════ ВАЖНО ЗНАТЬ ══════ */}
      <Section icon="⚠️" title="Важно знать" defaultOpen highlight>
        <ul className="space-y-3 text-text">
          <li className="flex gap-3">
            <span className="text-lg mt-0.5">🌐</span>
            <span>
              <strong>Приложение работает онлайн.</strong> Все данные
              хранятся в облаке и доступны с любого устройства после
              входа в аккаунт.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-lg mt-0.5">🔒</span>
            <span>
              <strong>Данные защищены.</strong> Для доступа нужна
              авторизация (email + пароль). Без входа в аккаунт
              никто не увидит ваши цели и задачи.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-lg mt-0.5">🔄</span>
            <span>
              <strong>Синхронизация между устройствами.</strong> Создали
              цель на ПК — она сразу доступна на телефоне и наоборот.
              Данные едины для всех устройств.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-lg mt-0.5">💾</span>
            <span>
              <strong>Делайте резервные копии!</strong> В разделе «Настройки»
              можно скачать все данные в файл и восстановить из него.
            </span>
          </li>
        </ul>
      </Section>

      {/* ══════ УСТАНОВКА НА ТЕЛЕФОН ══════ */}
      <Section icon="📱" title="Как установить на телефон">
        <p className="text-text-light text-sm mb-2">
          #тыжменеджер — это PWA. Его не нужно скачивать из магазина.
          Добавьте сайт на главный экран — и он будет работать как
          обычное приложение.
        </p>

        <div className="space-y-2">
          <h3 className="font-semibold text-text">🤖 Android (Chrome)</h3>
          <ol className="list-decimal list-inside space-y-1.5 text-text ml-2 text-sm">
            <li>Откройте сайт в <strong>Chrome</strong></li>
            <li>Нажмите <strong>⋮</strong> (три точки) → <strong>«Установить приложение»</strong></li>
            <li>Иконка появится на главном экране 🎉</li>
          </ol>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-text">🍎 iPhone (Safari)</h3>
          <ol className="list-decimal list-inside space-y-1.5 text-text ml-2 text-sm">
            <li>Откройте сайт в <strong>Safari</strong> (важно — именно Safari!)</li>
            <li>Нажмите <strong>«Поделиться»</strong> (⬆️) → <strong>«На экран Домой»</strong></li>
            <li>Иконка появится на главном экране 🎉</li>
          </ol>
        </div>
      </Section>

      {/* ══════ УСТАНОВКА НА ПК ══════ */}
      <Section icon="💻" title="Как установить на компьютер">
        <p className="text-text-light text-sm mb-2">
          Приложение откроется в отдельном окне, без адресной строки —
          как настоящая программа.
        </p>
        <ol className="list-decimal list-inside space-y-1.5 text-text ml-2 text-sm">
          <li>Откройте сайт в <strong>Chrome</strong> или <strong>Edge</strong></li>
          <li>В адресной строке нажмите иконку <strong>«Установить»</strong> (⬇️)</li>
          <li>Появится на рабочем столе и в меню «Пуск» 🎉</li>
        </ol>
      </Section>

      {/* ══════ ОБНОВЛЕНИЕ ══════ */}
      <Section icon="🔄" title="Как обновить приложение">
        <p className="text-text-light text-sm">
          Приложение обновляется автоматически. Если видите старую
          версию — нажмите <strong>Ctrl+Shift+R</strong> (ПК)
          или очистите кэш браузера (телефон).
        </p>
      </Section>

      {/* ══════ РАЗДЕЛЫ ══════ */}

      <Section icon="📅" title="Ежедневник">
        <p className="text-text-light text-sm leading-relaxed">
          Главный экран приложения. Планируйте день: создавайте задачи,
          отмечайте выполненные, выбирайте ТОП-3 главных дел дня.
          Оценивайте уровень энергии, получайте рекомендации.
          Переносите и дублируйте задачи между днями.
        </p>
      </Section>

      <Section icon="🎯" title="Мои цели">
        <p className="text-text-light text-sm leading-relaxed">
          Единый раздел для всех целей — краткосрочных и долгосрочных.
          Ставьте цели на месяц, год или пять лет. Отслеживайте прогресс,
          статус и приоритет. При завершении цели проходите рефлексию —
          3 вопроса помогут осмыслить результат.
        </p>
      </Section>

      <Section icon="🔍" title="Метод 3П">
        <p className="text-text-light text-sm leading-relaxed mb-2">
          Авторская методика определения приоритета цели по трём критериям:
        </p>
        <ul className="space-y-2 text-text text-sm">
          <li className="flex gap-2">
            <span>🎯</span>
            <span><strong>Приближение</strong> — двигает ли задача к глобальной цели?</span>
          </li>
          <li className="flex gap-2">
            <span>⚡</span>
            <span><strong>Последствия</strong> — что случится, если не сделаю?</span>
          </li>
          <li className="flex gap-2">
            <span>💎</span>
            <span><strong>Профит</strong> — какую личную выгоду получу?</span>
          </li>
        </ul>
        <p className="text-text-light text-sm mt-3">
          После оценки приоритет автоматически устанавливается в цели:
          от ⚪ Низкого до 🔵 Абсолютного.
        </p>
      </Section>

      <Section icon="💬" title="Самокоучинг">
        <p className="text-text-light text-sm leading-relaxed">
          10 вопросов для глубокой проработки цели. Помогает понять «зачем»,
          найти мотивацию, определить первые шаги и оценить риски.
          Результаты сохраняются и привязываются к выбранной цели.
        </p>
      </Section>

      <Section icon="🪜" title="Экшен-каскадирование">
        <p className="text-text-light text-sm leading-relaxed mb-2">
          Декомпозиция целей на конкретные шаги.
        </p>
        <ul className="space-y-2 text-text text-sm">
          <li className="flex gap-2">
            <span>📥</span>
            <span><strong>Импорт целей</strong> — выберите цель из «Мои цели» и разбейте на шаги.</span>
          </li>
          <li className="flex gap-2">
            <span>🌳</span>
            <span><strong>Вложенность</strong> — каждый шаг можно дробить на подшаги.</span>
          </li>
          <li className="flex gap-2">
            <span>📅</span>
            <span><strong>В ежедневник</strong> — готовый шаг можно перенести как задачу на нужную дату.</span>
          </li>
        </ul>
      </Section>

      <Section icon="🧩" title="PP SMART">
        <p className="text-text-light text-sm leading-relaxed mb-2">
          Авторская методика постановки целей по 7 критериям:
        </p>
        <ul className="space-y-1 text-text text-sm">
          <li className="flex gap-2">
            <span>✨</span>
            <span><strong>P — Positive:</strong> цель как свершившийся факт</span>
          </li>
          <li className="flex gap-2">
            <span>💪</span>
            <span><strong>P — Proactive:</strong> личная ответственность за результат</span>
          </li>
          <li className="flex gap-2">
            <span>🎯</span>
            <span><strong>S, M, A, R, T</strong> — конкретность, измеримость, достижимость, релевантность, дедлайн</span>
          </li>
        </ul>
        <p className="text-text-light text-sm mt-3">
          Из ответов автоматически формируется итоговая формулировка цели,
          которую можно добавить в «Мои цели».
        </p>
      </Section>

      {/* Версия */}
      <div className="text-center text-sm text-text-light pt-4">
        <p>#тыжменеджер · Пилотная версия</p>
      </div>
    </div>
  )
}