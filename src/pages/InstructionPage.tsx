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
          ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
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

      {/* ══════ ВАЖНО ЗНАТЬ — открыт ══════ */}
      <Section icon="⚠️" title="Важно знать" defaultOpen highlight>
        <ul className="space-y-3 text-text">
          <li className="flex gap-3">
            <span className="text-lg mt-0.5">📴</span>
            <span>
              <strong>Приложение работает офлайн.</strong> После первого
              открытия все данные сохраняются на вашем устройстве. Интернет
              нужен только для первой загрузки.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-lg mt-0.5">🔒</span>
            <span>
              <strong>Данные хранятся только на устройстве.</strong> Без
              регистрации, без облака, без слежки. Ваши цели — только ваши.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-lg mt-0.5">🚫</span>
            <span>
              <strong>Нет синхронизации между устройствами.</strong> Данные
              на телефоне и компьютере не связаны. Если вы создали цель на
              ПК — на телефоне её не будет, и наоборот. Синхронизация
              появится в будущих версиях.
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
        <p className="text-text-light text-sm">
          #тыжменеджер — это PWA. Его не нужно скачивать из магазина.
          Добавьте сайт на главный экран — и он будет работать как обычное
          приложение.
        </p>

        <div className="space-y-2">
          <h3 className="font-semibold text-text">🤖 Android (Chrome)</h3>
          <ol className="list-decimal list-inside space-y-1.5 text-text ml-2 text-sm">
            <li>
              Откройте{' '}
              <a href="https://tyzhmanager-2gki.vercel.app" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                tyzhmanager-2gki.vercel.app
              </a>{' '}
              в <strong>Chrome</strong>
            </li>
            <li>Нажмите <strong>⋮</strong> (три точки) в правом верхнем углу</li>
            <li>Выберите <strong>«Установить приложение»</strong> или <strong>«Добавить на главный экран»</strong></li>
            <li>Нажмите <strong>«Установить»</strong></li>
            <li>Иконка появится на главном экране 🎉</li>
          </ol>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-text">🍎 iPhone (Safari)</h3>
          <ol className="list-decimal list-inside space-y-1.5 text-text ml-2 text-sm">
            <li>
              Откройте{' '}
              <a href="https://tyzhmanager-2gki.vercel.app" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                tyzhmanager-2gki.vercel.app
              </a>{' '}
              в <strong>Safari</strong> (важно — именно Safari!)
            </li>
            <li>Нажмите <strong>«Поделиться»</strong> (квадрат со стрелкой ⬆️) внизу экрана</li>
            <li>Выберите <strong>«На экран «Домой»»</strong></li>
            <li>Нажмите <strong>«Добавить»</strong></li>
            <li>Иконка появится на главном экране 🎉</li>
          </ol>
        </div>
      </Section>

      {/* ══════ УСТАНОВКА НА ПК ══════ */}
      <Section icon="💻" title="Как установить на компьютер">
        <p className="text-text-light text-sm">
          Приложение откроется в отдельном окне, без адресной строки — как
          настоящая программа.
        </p>

        <div className="space-y-2">
          <h3 className="font-semibold text-text">Google Chrome</h3>
          <ol className="list-decimal list-inside space-y-1.5 text-text ml-2 text-sm">
            <li>
              Откройте{' '}
              <a href="https://tyzhmanager-2gki.vercel.app" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                tyzhmanager-2gki.vercel.app
              </a>
            </li>
            <li>В адресной строке справа нажмите иконку <strong>«Установить»</strong> (монитор с ⬇️)</li>
            <li>Или: <strong>⋮</strong> → <strong>«Установить #тыжменеджер»</strong></li>
            <li>Появится на рабочем столе и в меню «Пуск» 🎉</li>
          </ol>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-text">Microsoft Edge</h3>
          <ol className="list-decimal list-inside space-y-1.5 text-text ml-2 text-sm">
            <li>
              Откройте{' '}
              <a href="https://tyzhmanager-2gki.vercel.app" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                tyzhmanager-2gki.vercel.app
              </a>
            </li>
            <li>В адресной строке нажмите <strong>«Доступно приложение»</strong></li>
            <li>Или: <strong>⋯</strong> → <strong>«Приложения»</strong> → <strong>«Установить этот сайт как приложение»</strong></li>
            <li>Появится на рабочем столе и в меню «Пуск» 🎉</li>
          </ol>
        </div>
      </Section>

      {/* ══════ ОБНОВЛЕНИЕ ПРИЛОЖЕНИЯ ══════ */}
      <Section icon="🔄" title="Как обновить приложение">
        <p className="text-text-light text-sm mb-3">
          Приложение обновляется автоматически. Но если вы видите «Загрузка...»
          или старую версию — выполните ручное обновление.
        </p>

        <div className="space-y-2">
          <h3 className="font-semibold text-text">📱 На телефоне (Android / iPhone)</h3>
          <ol className="list-decimal list-inside space-y-1.5 text-text ml-2 text-sm">
            <li>Закройте приложение полностью (смахните из списка запущенных)</li>
            <li>Откройте <strong>браузер</strong> (Chrome / Safari)</li>
            <li>Перейдите в <strong>Настройки браузера</strong> → <strong>Конфиденциальность</strong></li>
            <li>Нажмите <strong>«Очистить данные»</strong> → выберите <strong>«Кэш»</strong></li>
            <li>Откройте приложение заново — загрузится новая версия</li>
          </ol>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-text">💻 На компьютере</h3>
          <ol className="list-decimal list-inside space-y-1.5 text-text ml-2 text-sm">
            <li>Откройте приложение в браузере</li>
            <li>Нажмите <strong>Ctrl + Shift + R</strong> (жёсткая перезагрузка)</li>
            <li>Если не помогло: нажмите <strong>F12</strong> → вкладка <strong>Application</strong></li>
            <li>В разделе <strong>Storage</strong> нажмите <strong>«Clear site data»</strong></li>
            <li>Перезагрузите страницу — <strong>F5</strong></li>
          </ol>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-3 mt-2">
          <p className="text-sm text-text">
            💡 <strong>Важно:</strong> очистка кэша <strong>НЕ удаляет</strong> ваши
            данные (задачи, цели, стратегии). Данные хранятся отдельно в IndexedDB
            и останутся на месте.
          </p>
        </div>
      </Section>

      {/* ══════ РАЗДЕЛЫ ══════ */}
      <Section icon="📅" title="Ежедневник">
        <p className="text-text-light text-sm leading-relaxed">
          Главный экран приложения. Здесь вы планируете свой день:
          создаёте задачи, отмечаете выполненные, выбираете ТОП-3
          главных задач дня. Есть шкала энергии с рекомендациями,
          мотивационные цитаты и календарь для навигации по датам.
        </p>
      </Section>

      <Section icon="🎯" title="Стратегия 5 лет">
        <p className="text-text-light text-sm leading-relaxed">
          Долгосрочное планирование. Запишите свои цели на ближайшие
          5 лет (2025–2030). Каждый год — отдельный блок. Цели можно
          переносить в «Цели на год» для детальной проработки.
        </p>
      </Section>

      <Section icon="🔍" title="Цели на год">
        <p className="text-text-light text-sm leading-relaxed">
          Фокусные цели текущего года. Можно импортировать из стратегии
          или создать новые. Каждую цель можно разбить по месяцам,
          отслеживать прогресс и статус выполнения.
        </p>
      </Section>

      <Section icon="⚖️" title="Оценка целей">
        <p className="text-text-light text-sm leading-relaxed">
          Набор инструментов для принятия решений: Квадрат Декарта
          (стоит ли делать?), Матрица Эйзенхауэра (срочно/важно),
          Метод 3П (Авторская методика для определения приоритета цели),
          Мини-самокоучинг (Авторский подход — через 10 вопросов
          для глубокой проработки цели).
        </p>
      </Section>

      {/* ══════ ЭКШЕН-КАСКАДИРОВАНИЕ — обновлено ══════ */}
      <Section icon="🪜" title="Экшен-каскадирование">
        <p className="text-text-light text-sm leading-relaxed mb-3">
          Инструмент декомпозиции целей на конкретные шаги.
        </p>
        <ul className="space-y-2 text-text text-sm">
          <li className="flex gap-2">
            <span>📥</span>
            <span>
              <strong>Импорт целей</strong> — выберите цель из «Стратегии 5 лет»
              или «Целей на год» и разбейте её на шаги прямо здесь.
            </span>
          </li>
          <li className="flex gap-2">
            <span>🧱</span>
            <span>
              <strong>3-блочная карточка шага:</strong> описание задачи,
              действия и намерения, выбор даты выполнения.
            </span>
          </li>
          <li className="flex gap-2">
            <span>🌳</span>
            <span>
              <strong>Вложенность</strong> — каждый шаг можно дробить
              дальше на подшаги, создавая дерево задач от крупных к мелким.
            </span>
          </li>
          <li className="flex gap-2">
            <span>📅</span>
            <span>
              <strong>Кнопка «В ежедневник»</strong> — готовый шаг можно
              одним нажатием перенести как задачу в ежедневник на нужную дату.
            </span>
          </li>
          <li className="flex gap-2">
            <span>📊</span>
            <span>
              <strong>Прогресс</strong> — отмечайте выполненные шаги
              и отслеживайте общий процент готовности цели.
            </span>
          </li>
        </ul>
      </Section>

      {/* ══════ PP SMART — обновлено ══════ */}
      <Section icon="🧩" title="PP SMART">
        <p className="text-text-light text-sm leading-relaxed mb-3">
          Авторская методика постановки целей по 7 критериям.
        </p>
        <ul className="space-y-2 text-text text-sm">
          <li className="flex gap-2">
            <span>✨</span>
            <span>
              <strong>P — Positive:</strong> формулировка цели в прошедшем
              времени, как уже свершившийся факт.
            </span>
          </li>
          <li className="flex gap-2">
            <span>💪</span>
            <span>
              <strong>P — Proactive:</strong> личная ответственность —
              что именно ВЫ делаете для достижения.
            </span>
          </li>
          <li className="flex gap-2">
            <span>🎯</span>
            <span>
              <strong>S, M, A, R, T</strong> — конкретность, измеримость,
              достижимость, релевантность, ограниченность по времени.
            </span>
          </li>
          <li className="flex gap-2">
            <span>📝</span>
            <span>
              <strong>Автоформулировка</strong> — из ваших ответов система
              автоматически собирает итоговую формулировку цели.
            </span>
          </li>
          <li className="flex gap-2">
            <span>📥</span>
            <span>
              <strong>Импорт и экспорт</strong> — можно привязать PP SMART
              к существующей цели, или создать свободный PP SMART и затем
              добавить его как новую цель в «Стратегию» или «Цели на год».
            </span>
          </li>
        </ul>
      </Section>

      {/* ══════ ДОСТИЖЕНИЯ — обновлено ══════ */}
      <Section icon="🏆" title="Достижения">
        <p className="text-text-light text-sm leading-relaxed">
          Система геймификации с бейджами и рангами. Получайте значки
          за первые цели, серии продуктивных дней (комбо 3/7/14/30 дней),
          использование инструментов оценки и каскадирования.
          Набирайте очки опыта (XP) и повышайте ранг:
          Новичок → Практик → Стратег → Мастер → Легенда.
        </p>
      </Section>

      <Section icon="📊" title="Статистика">
        <p className="text-text-light text-sm leading-relaxed">
          Аналитика вашей продуктивности: количество выполненных задач,
          процент выполнения, график энергии, текущее комбо, прогресс
          по целям. Переключайте периоды: неделя, 2 недели, месяц, всё время.
        </p>
      </Section>

      <Section icon="⚙️" title="Настройки">
        <p className="text-text-light text-sm leading-relaxed">
          Управление приложением: добавление своих мотивационных цитат,
          экспорт данных (резервная копия в JSON), импорт данных из
          файла, переключение тёмной темы, полная очистка данных.
        </p>
      </Section>

      <Section icon="ℹ️" title="О проекте">
        <p className="text-text-light text-sm leading-relaxed">
          Информация об авторе, ссылки на книги и Telegram, планы
          развития проекта, возможность поддержать разработку.
        </p>
      </Section>

      {/* ══════ FAQ ══════ */}
      <Section icon="❓" title="Частые вопросы">
        <div className="space-y-4">
          <div>
            <p className="font-medium text-text text-sm">
              Пропадут ли мои данные, если я закрою браузер?
            </p>
            <p className="text-text-light text-sm mt-1">
              Нет. Данные сохраняются в памяти вашего браузера (IndexedDB).
              Они останутся, даже если вы закроете вкладку или перезагрузите
              компьютер.
            </p>
          </div>
          <div>
            <p className="font-medium text-text text-sm">
              Когда данные могут пропасть?
            </p>
            <p className="text-text-light text-sm mt-1">
              Если вы очистите историю/данные браузера, переустановите
              браузер или используете режим «Инкогнито». Регулярно
              делайте резервные копии в «Настройках».
            </p>
          </div>
          <div>
            <p className="font-medium text-text text-sm">
              Могу ли я пользоваться на телефоне и на ПК одновременно?
            </p>
            <p className="text-text-light text-sm mt-1">
              Да, но данные не синхронизируются. На каждом устройстве будут
              свои данные. Синхронизация запланирована в будущих обновлениях.
            </p>
          </div>
          <div>
            <p className="font-medium text-text text-sm">
              Как перенести данные на другое устройство?
            </p>
            <p className="text-text-light text-sm mt-1">
              «Настройки» → «Скачать мои данные» → перекиньте файл
              (мессенджер, почта, облако) → «Настройки» → «Загрузить
              данные» на новом устройстве.
            </p>
          </div>
        </div>
      </Section>

      {/* Версия */}
      <div className="text-center text-sm text-text-light pt-4">
        <p>#тыжменеджер · Пилотная версия</p>
      </div>
    </div>
  )
}