export default function AboutPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-text mb-6">ℹ️ О проекте</h1>

      <div className="bg-surface border border-border rounded-xl p-5 mb-6">
        <h2 className="text-lg font-semibold text-text mb-3">
          📖 #тыжменеджер — дневник целей эффективного человека
        </h2>
        <div className="text-text-light leading-relaxed space-y-3">
          <p>
            «#тыжменеджер — дневник целей эффективного человека» — это инструмент для тех,
            кто хочет перестать откладывать жизнь на потом и начать системно достигать своих целей.
          </p>
          <p>
            Ежедневник помогает превратить идеи в конкретный план действий: определить личные
            и профессиональные цели, выстроить стратегию развития на годы вперёд, расставить
            приоритеты, отслеживать прогресс и регулярно возвращаться к тому, что действительно важно.
          </p>
          <p>
            Проект создан на основе книги «#тыжменеджер: на работе и в жизни». В нём объединены
            авторская философия эффективности, практические методики целеполагания. Данное сочетание
            позволяет не просто фиксировать задачи, а формировать привычку осознанно управлять
            своей жизнью, временем и результатами.
          </p>
          <p>
            Ежедневник стал первым шагом к созданию целой системы инструментов, посвящённых
            личной эффективности современного человека, и лёг в основу новых авторских проектов
            и будущей книги.
          </p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5 mb-6">
        <h2 className="text-lg font-semibold text-text mb-3">👤 Об авторе</h2>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl flex-shrink-0">
            👨‍💼
          </div>
          <div className="text-text-light leading-relaxed space-y-3">
            <p>
              Привет! Меня зовут <span className="font-semibold text-text">Сергей Дегтярёв</span>.
              Я — бизнес-тренер и автор книги{' '}
              <span className="font-semibold text-text">«#тыжменеджер: на работе и в жизни»</span>.
            </p>
            <p>
              «#тыжменеджер» — это мой авторский проект, который родился из практического опыта.
              Я хотел создать инструмент, который объединит лучшие практики для работы с целями
              в удобном цифровом формате.
            </p>
            <p>
              📚 <span className="font-medium text-text">Моя книга:</span>{' '}
              «#тыжменеджер: на работе и в жизни». Это руководство для руководителей и всех,
              кто хочет достигать целей и эффективно управлять командой и своей жизнью.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5 mb-6">
        <h2 className="text-lg font-semibold text-text mb-3">🛠️ Реализация проекта</h2>
        <div className="text-text-light leading-relaxed space-y-3">
          <p>
            Веб-приложение разработано{' '}
            <span className="font-semibold text-text">Сергеем Дегтярёвым</span> с использованием
            искусственного интеллекта (вайбкодинг).
          </p>
          <p>
            Вайбкодинг — это современный подход к разработке, при котором автор проекта
            формулирует идеи, логику и требования, а ИИ помогает воплотить их в код.
            Все решения по архитектуре, дизайну, функциональности и контенту приняты автором.
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">React</span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">TypeScript</span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">Tailwind CSS</span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">Supabase</span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">PWA</span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">Yandex Cloud</span>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5 mb-6">
        <h2 className="text-lg font-semibold text-text mb-3">📚 Где купить книгу</h2>
        <div className="space-y-2">
          <a
            href="https://books.yandex.ru/books/wKdCWqQo?username=b7175868193&utm_place=content_book_menu_item"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 bg-bg rounded-lg hover:bg-primary/10 transition-colors group"
          >
            <span className="text-xl">📕</span>
            <span className="font-medium text-text group-hover:text-primary">Яндекс Книги</span>
            <span className="ml-auto text-text-light text-sm">↗</span>
          </a>
          <a
            href="https://ridero.ru/books/tyzhmenedzher_na_rabote_i_v_zhizni/?ysclid=mrcf4rj3ix759370417"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 bg-bg rounded-lg hover:bg-primary/10 transition-colors group"
          >
            <span className="text-xl">📗</span>
            <span className="font-medium text-text group-hover:text-primary">Ridero</span>
            <span className="ml-auto text-text-light text-sm">↗</span>
          </a>
          <a
            href="https://www.litres.ru/book/sergey-degtyarev-334/tyzhmenedzher-na-rabote-i-v-zhizni-ot-fantaziy-k-dost-71919226/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 bg-bg rounded-lg hover:bg-primary/10 transition-colors group"
          >
            <span className="text-xl">📘</span>
            <span className="font-medium text-text group-hover:text-primary">ЛитРес</span>
            <span className="ml-auto text-text-light text-sm">↗</span>
          </a>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5 mb-6">
        <h2 className="text-lg font-semibold text-text mb-3">📬 Контакты</h2>
        <div className="space-y-2">
          <a href="https://t.me/degtayrevtrener" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 bg-bg rounded-lg hover:bg-primary/10 transition-colors group">
            <span className="text-xl">💬</span>
            <div>
              <p className="font-medium text-text group-hover:text-primary">Telegram-канал</p>
              <p className="text-xs text-text-light">@degtayrevtrener</p>
            </div>
            <span className="ml-auto text-text-light text-sm">↗</span>
          </a>
          <a href="https://t.me/degtyarev_trener" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 bg-bg rounded-lg hover:bg-primary/10 transition-colors group">
            <span className="text-xl">✈️</span>
            <div>
              <p className="font-medium text-text group-hover:text-primary">Telegram (личный)</p>
              <p className="text-xs text-text-light">@degtyarev_trener</p>
            </div>
            <span className="ml-auto text-text-light text-sm">↗</span>
          </a>
          <a href="https://vk.com/id22338891" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 bg-bg rounded-lg hover:bg-primary/10 transition-colors group">
            <span className="text-xl">🔵</span>
            <div>
              <p className="font-medium text-text group-hover:text-primary">ВКонтакте</p>
              <p className="text-xs text-text-light">Профиль автора</p>
            </div>
            <span className="ml-auto text-text-light text-sm">↗</span>
          </a>
          <a href="mailto:Sergey.degtayrev@yandex.ru?subject=Письмо автору %23тыжменеджер"
            className="flex items-center gap-3 px-4 py-3 bg-bg rounded-lg hover:bg-primary/10 transition-colors group">
            <span className="text-xl">✉️</span>
            <div>
              <p className="font-medium text-text group-hover:text-primary">Написать письмо</p>
              <p className="text-xs text-text-light">Sergey.degtayrev@yandex.ru</p>
            </div>
            <span className="ml-auto text-text-light text-sm">↗</span>
          </a>
        </div>
      </div>

      <div className="text-center text-text-light text-sm">
        <p>Версия 1.0.0 • Пилот</p>
        <p className="mt-1">Сделано с ❤️ для эффективных людей</p>
      </div>
    </div>
  )
}