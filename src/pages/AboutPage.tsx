const DONATE_URL = 'https://pay.cloudtips.ru/p/a385148f'

export default function AboutPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8 pb-12">

      {/* Заголовок */}
      <div>
        <h1 className="text-3xl font-bold mb-2 text-text">ℹ️ О проекте</h1>
        <p className="text-text-light">
          #тыжменеджер — дневник целей эффективного человека
        </p>
      </div>

      {/* ══════ Об авторе ══════ */}
      <section className="bg-surface border border-border rounded-2xl p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-text">👤 Об авторе</h2>

        <p className="text-text leading-relaxed">
          Привет! Меня зовут <strong>Сергей Дегтярёв</strong>. Я — бизнес-тренер,
          автор книг и методик по управлению и личной эффективности.
        </p>

        <p className="text-text leading-relaxed">
          «#тыжменеджер» — это мой авторский проект, который родился из
          практического опыта обучения руководителей и команд. Я хотел создать
          инструмент, который объединит лучшие управленческие практики в удобном
          цифровом формате.
        </p>

        <div>
          <p className="font-medium text-text mb-2">📚 Мои книги:</p>
          <ul className="space-y-1 ml-1 text-text">
            <li>• «#тыжменеджер» — настольная книга начинающего руководителя</li>
            <li>• «Управление по-взрослому» — для опытных управленцев</li>
            <li>• «Цели по-взрослому» — практическое руководство по целеполаганию</li>
          </ul>
        </div>

        <div>
          <p className="font-medium text-text mb-3">📬 Связаться со мной:</p>
          <div className="flex flex-wrap gap-2">
            <a
              href="https://t.me/degtayrevtrener"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-bg transition text-text"
            >
              📢 Telegram-канал
            </a>
            <a
              href="https://t.me/degtyarev_trener"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-bg transition text-text"
            >
              💬 Telegram личный
            </a>
            <a
              href="https://vk.com/id22338891"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-bg transition text-text"
            >
              🌐 VK
            </a>
            <a
              href="mailto:Sergey.degtayrev@yandex.ru"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-bg transition text-text"
            >
              ✉️ Почта
            </a>
          </div>
        </div>
      </section>

      {/* ══════ Будущее проекта ══════ */}
      <section className="bg-surface border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-xl">
            🚀
          </div>
          <h2 className="text-2xl font-semibold text-text">Будущее проекта</h2>
        </div>

        <p className="text-text leading-relaxed">
          «#тыжменеджер» создается как долгосрочный авторский проект.
        </p>

        <p className="text-text leading-relaxed">
          Моя цель — превратить его из электронного ежедневника в полноценную
          экосистему личной и командной эффективности, которая объединит лучшие
          управленческие практики и возможности искусственного интеллекта.
        </p>

        <div>
          <p className="font-medium text-text mb-3">В планах развития:</p>
          <ul className="space-y-3 text-text">
            <li className="flex gap-3">
              <span className="text-xl leading-none mt-0.5">🤖</span>
              <span>
                ИИ-помощник, который поможет формулировать цели, строить планы
                действий, давать рекомендации и сопровождать пользователя на пути
                к результату.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-xl leading-none mt-0.5">☁️</span>
              <span>Облачная синхронизация между устройствами.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-xl leading-none mt-0.5">📱</span>
              <span>Полноценные приложения для iPhone и Android.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-xl leading-none mt-0.5">👥</span>
              <span>Командный режим для руководителей и команд.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-xl leading-none mt-0.5">📊</span>
              <span>Новые инструменты анализа прогресса и достижения целей.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-xl leading-none mt-0.5">📚</span>
              <span>Интеграция новых методик и идей.</span>
            </li>
          </ul>
        </div>

        <p className="text-text leading-relaxed">
          Я хочу создать инструмент, который действительно помогает людям
          становиться эффективнее каждый день.
        </p>
      </section>

      {/* ══════ Поддержать развитие ══════ */}
      <section className="bg-surface border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-xl">
            ❤️
          </div>
          <h2 className="text-2xl font-semibold text-text">Поддержать развитие проекта</h2>
        </div>

        <p className="text-text leading-relaxed">
          Проект «#тыжменеджер» развивается независимо и постоянно совершенствуется.
        </p>

        <p className="text-text leading-relaxed">
          Разработка новых функций, поддержка серверной инфраструктуры, интеграция
          искусственного интеллекта и создание мобильных приложений требуют
          времени, ресурсов и инвестиций.
        </p>

        <p className="text-text leading-relaxed">
          Если ежедневник оказался для вас полезным и вы хотите помочь его
          развитию, вы можете поддержать проект любой комфортной суммой.
        </p>

        <a
          href={DONATE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition w-full sm:w-auto"
        >
          ❤️ Поддержать развитие проекта
        </a>

        <p className="text-sm text-text-light">
          Каждая поддержка помогает быстрее реализовывать новые возможности и
          делать инструмент еще полезнее для всех пользователей.
        </p>

        <p className="font-medium text-text">
          Спасибо, что помогаете создавать будущее «#тыжменеджер» ❤️
        </p>
      </section>

      {/* Версия */}
      <div className="text-center text-sm text-text-light pt-4">
        <p>#тыжменеджер · Пилотная версия</p>
      </div>

    </div>
  )
}