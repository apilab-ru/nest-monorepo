## Description
Swagger http://localhost:3000/swagger/
Debugger chrome://inspect

### FilmsApi 
https://developers.themoviedb.org/3/getting-started/introduction

### AnimeApi 
Последние добавленные переводы:
http://smotret-anime.ru/api/translations/
 
Последние переводы онгоингов:
http://smotret-anime.ru/api/translations/?feed=recent
 
Список всех переводов (в начале самые старые, удобно для полного сканирования):
http://smotret-anime.ru/api/translations/?feed=id

При полном сканировании, не используйте параметр offset. Используйте afterId (offset работает очень медленно когда счет идет на сотни тысяч переводов). Пример:
http://smotret-anime.ru/api/translations/?feed=id&afterId=10000

Один перевод:
http://smotret-anime.ru/api/translations/905760

Список аниме:
http://smotret-anime.ru/api/series/
 
Можно выбрать только определенные поля:
http://smotret-anime.ru/api/series/?fields=id,title,typeTitle,posterUrlSmall

Расширенный фильтр как на сайте:
http://smotret-anime.ru/api/series?chips=genre@=8,35;genre_op=and
(для https://smotret-anime.ru/catalog/filter/genre@=8,35;genre_op=and)
(к сожалению данные для вариантов пока не добавили в API, прямо сейчас их можно посмотреть на сайте выбирая различные фильтры, а также в site.ccsData исходного кода https://smotret-anime.ru/catalog)

Можно фильтровать по параметрам, например:
http://smotret-anime.ru/api/series/?myAnimeListId=24133
 
Или искать по названию:
http://smotret-anime.ru/api/series/?query=gate
 
Есть "читабельный" вид:
http://smotret-anime.ru/api/series/?pretty=1
 
Через limit и offset можно регулировать количество элементов "на странице" и смещение от начала:
http://smotret-anime.ru/api/series/?limit=1&offset=10
 
Информация о конкретном аниме и список эпизодов:
http://smotret-anime.ru/api/series/9866
 
Информация о конкретном эпизоде и список переводов:
http://smotret-anime.ru/api/episodes/102173
