export default function AboutPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-text mb-6">ℹ️ О проекте</h1>

      {/* О проекте */}
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
            авторская философия эффективности, практические методики целеполагания и современные
            возможности искусственного интеллекта. Такое сочетание позволяет не просто фиксировать
            задачи, а формировать привычку осознанно управлять своей жизнью, временем и результатами.
          </p>
          <p>
            Ежедневник стал первым шагом к созданию целой системы инструментов, посвящённых
            личной эффективности современного человека, и лёг в основу новых авторских проектов
            и будущей книги.
          </p>
        </div>
      </div>

      {/* Об авторе */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-6">
        <h2 className="text-lg font-semibold text-text mb-3">✍️ Об авторе</h2>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl flex-shrink-0">
            👨‍💼
          </div>
          <div className="text-text-light leading-relaxed space-y-3">
            <p>
              <span className="font-semibold text-text text-lg">Сергей Дегтярёв</span> — бизнес-тренер,
              автор книги «#тыжменеджер: на работе и в жизни», эксперт по личной эффективности,
              управлению командами, переговорам и развитию руководителей.
            </p>
            <p>
              Более 13 лет практического опыта в продажах, управлении и корпоративном обучении
              легли в основу его авторской философии эффективности, которая объединяет три ключевых
              направления: управление собой, коммуникацией и людьми.
            </p>
            <p className="italic border-l-4 border-primary/30 pl-3">
              «Моя миссия — делать людей эффективнее, а бизнес — успешнее. В своих проектах
              я соединяю проверенные управленческие практики, современные образовательные подходы
              и возможности искусственного интеллекта, помогая людям превращать цели в реальные результаты.»
            </p>
          </div>
        </div>
      </div>

      {/* Книга */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-6">
        <h2 className="text-lg font-semibold text-text mb-3">📚 Книга</h2>
        <p className="text-text-light mb-4">
          «#тыжменеджер: на работе и в жизни. От фантазий к достижениям»
        </p>
        <div className="space-y-2">
          <a
            href="https://books.yandex.ru/books/wKdCWqQo?username=b7175868193&utm_place=content_book_menu_item"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 bg-bg rounded-lg hover:bg-primary/10
                       hover:text-primary transition-colors group"
          >
            <span className="text-xl">📕</span>
            <span className="font-medium group-hover:text-primary">Яндекс Книги</span>
            <span className="ml-auto text-text-light text-sm">↗</span>
          </a>
          <a
            href="https://ridero.ru/books/tyzhmenedzher_na_rabote_i_v_zhizni/?ysclid=mrcf4rj3ix759370417"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 bg-bg rounded-lg hover:bg-primary/10
                       hover:text-primary transition-colors group"
          >
            <span className="text-xl">📗</span>
            <span className="font-medium group-hover:text-primary">Ridero</span>
            <span className="ml-auto text-text-light text-sm">↗</span>
          </a>
          <a
            href="https://www.litres.ru/book/sergey-degtyarev-334/tyzhmenedzher-na-rabote-i-v-zhizni-ot-fantaziy-k-dost-71919226/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 bg-bg rounded-lg hover:bg-primary/10
                       hover:text-primary transition-colors group"
          >
            <span className="text-xl">📘</span>
            <span className="font-medium group-hover:text-primary">ЛитРес</span>
            <span className="ml-auto text-text-light text-sm">↗</span>
          </a>
        </div>
      </div>

      {/* Контакты */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-6">
        <h2 className="text-lg font-semibold text-text mb-3">📬 Контакты</h2>
        <div className="space-y-2">
          <a
            href="https://t.me/degtayrevtrener"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 bg-bg rounded-lg hover:bg-blue-50
                       hover:text-blue-600 transition-colors group"
          >
            <span className="text-xl">💬</span>
            <div>
              <p className="font-medium group-hover:text-blue-600">Telegram-канал</p>
              <p className="text-xs text-text-light">@degtayrevtrener</p>
            </div>
            <span className="ml-auto text-text-light text-sm">↗</span>
          </a>
          <a
            href="https://t.me/degtyarev_trener"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 bg-bg rounded-lg hover:bg-blue-50
                       hover:text-blue-600 transition-colors group"
          >
            <span className="text-xl">✈️</span>
            <div>
              <p className="font-medium group-hover:text-blue-600">Telegram (личный)</p>
              <p className="text-xs text-text-light">@degtyarev_trener</p>
            </div>
            <span className="ml-auto text-text-light text-sm">↗</span>
          </a>
          <a
            href="https://vk.com/id22338891"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 bg-bg rounded-lg hover:bg-blue-50
                       hover:text-blue-600 transition-colors group"
          >
            <span className="text-xl">🔵</span>
            <div>
              <p className="font-medium group-hover:text-blue-600">ВКонтакте</p>
              <p className="text-xs text-text-light">Профиль автора</p>
            </div>
            <span className="ml-auto text-text-light text-sm">↗</span>
          </a>
          <a
            href="mailto:Sergey.degtayrev@yandex.ru?subject=Письмо автору %23тыжменеджер"
            className="flex items-center gap-3 px-4 py-3 bg-bg rounded-lg hover:bg-amber-50
                       hover:text-amber-600 transition-colors group"
          >
            <span className="text-xl">✉️</span>
            <div>
              <p className="font-medium group-hover:text-amber-600">Написать письмо</p>
              <p className="text-xs text-text-light">Sergey.degtayrev@yandex.ru</p>
            </div>
            <span className="ml-auto text-text-light text-sm">✉</span>
          </a>
        </div>
      </div>

      {/* Версия */}
      <div className="text-center text-text-light text-sm">
        <p>Версия 1.0.0 • Пилот</p>
        <p className="mt-1">Сделано с ❤️ для эффективных людей</p>
      </div>
    </div>
  )
}