# 🚀 БЫСТРЫЙ ДЕПЛОЙ НА GITHUB PAGES

**Пошаговая инструкция для текущего проекта**

---

## ШАГ 1: Подготовка проекта

### 1.1. Замени плейсхолдеры на свои данные

**Выполни скрипт автоматической замены:**

```bash
cd /Users/dimailev/anti/нд/blog

# Замени значения на свои!
DOMAIN="твойдомен.ru"  # или ТВОЙUSERNAME.github.io/blog
AUTHOR="Твоё Имя"
TWITTER="@твойhandle"

# Автоматическая замена
sed -i '' "s/yourdomain.com/$DOMAIN/g" index.html
sed -i '' "s/yourdomain.com/$DOMAIN/g" assets/js/app.js
sed -i '' "s/yourdomain.com/$DOMAIN/g" feed.xml
sed -i '' "s/yourdomain.com/$DOMAIN/g" sitemap.xml
sed -i '' "s/yourdomain.com/$DOMAIN/g" robots.txt
sed -i '' "s/Your Name/$AUTHOR/g" assets/js/app.js
sed -i '' "s/@yourusername/$TWITTER/g" index.html

# Пересобери минифицированный JS
npx -y terser assets/js/app.js -o assets/js/app.min.js -c -m

echo "✅ Плейсхолдеры заменены!"
```

---

## ШАГ 2: Инициализация Git

```bash
cd /Users/dimailev/anti/нд/blog

# Инициализируй Git репозиторий
git init

# Создай .gitignore
cat > .gitignore << EOF
.DS_Store
*.log
node_modules/
.env
EOF

# Добавь все файлы
git add .

# Первый коммит
git commit -m "Initial commit: Blog ready for GitHub Pages"

echo "✅ Git инициализирован!"
```

---

## ШАГ 3: Создай репозиторий на GitHub

### Вариант 1: Через браузер

1. Открой [github.com/new](https://github.com/new)
2. Repository name: `blog` (или любое другое)
3. Public
4. ❌ НЕ добавляй README, .gitignore, license
5. Create repository

### Вариант 2: Через GitHub CLI

```bash
# Установи GitHub CLI (если нет)
brew install gh

# Логин
gh auth login

# Создай репозиторий
gh repo create blog --public --source=. --remote=origin --push
```

---

## ШАГ 4: Загрузи код на GitHub

```bash
# Добавь remote
git remote add origin https://github.com/ТВОЙUSERNAME/blog.git

# Пуш
git branch -M main
git push -u origin main

echo "✅ Код на GitHub!"
```

---

## ШАГ 5: Настрой GitHub Pages

### Через веб-интерфейс:

1. Открой репозиторий: `https://github.com/ТВОЙUSERNAME/blog`
2. **Settings** (вкладка)
3. **Pages** (в меню слева)
4. **Source**: Deploy from a branch
5. **Branch**: 
   - Выбери `main`
   - Выбери `/ (root)`
6. **Save**

### Через GitHub CLI:

```bash
gh repo edit --enable-pages --pages-branch main
```

---

## ШАГ 6: Дождись деплоя

**GitHub Pages автоматически задеплоит сайт!**

1. Actions → смотри прогресс деплоя
2. Обычно занимает 1-2 минуты
3. Получишь уведомление когда готово

**URL сайта:**
```
https://ТВОЙUSERNAME.github.io/blog/
```

---

## ШАГ 7: Исправь пути (ВАЖНО!)

### 7.1. Проверь URL

Если сайт по адресу `ТВОЙUSERNAME.github.io/blog/` (не в корне), нужно исправить пути.

### 7.2. Обнови Service Worker

**Файл:** `assets/js/app.js`

Найди метод `registerServiceWorker()`:

```javascript
registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        // Добавь /blog/ в путь
        navigator.serviceWorker.register('/blog/sw.js')
            .then(reg => {
                console.log('ServiceWorker registered:', reg.scope);
            })
            .catch(err => {
                console.log('ServiceWorker registration failed:', err);
            });
    }
}
```

### 7.3. Обнови sw.js

**Файл:** `sw.js`

```javascript
const CACHE_NAME = 'blog-v1';
const BASE_PATH = '/blog';  // ДОБАВЬ ЭТУ СТРОКУ

const urlsToCache = [
  BASE_PATH + '/',
  BASE_PATH + '/index.html',
  BASE_PATH + '/assets/css/style.min.css',
  BASE_PATH + '/assets/js/app.min.js',
  BASE_PATH + '/posts/index.json',
  BASE_PATH + '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
```

### 7.4. Обнови домены в файлах

```bash
# Замени домен на актуальный GitHub Pages URL
GITHUB_URL="ТВОЙUSERNAME.github.io/blog"

sed -i '' "s/твойдомен.ru/$GITHUB_URL/g" index.html
sed -i '' "s/твойдомен.ru/$GITHUB_URL/g" assets/js/app.js
sed -i '' "s/твойдомен.ru/$GITHUB_URL/g" feed.xml
sed -i '' "s/твойдомен.ru/$GITHUB_URL/g" sitemap.xml
sed -i '' "s/твойдомен.ru/$GITHUB_URL/g" robots.txt
```

### 7.5. Пересобери и запуш

```bash
# Пересобери JS
npx -y terser assets/js/app.js -o assets/js/app.min.js -c -m

# Коммит изменений
git add .
git commit -m "Fix paths for GitHub Pages"
git push

echo "✅ Пути исправлены!"
```

---

## ШАГ 8: Проверка

### 8.1. Открой сайт

```
https://ТВОЙUSERNAME.github.io/blog/
```

### 8.2. Проверь что работает:

- [ ] Сайт открывается
- [ ] Главная страница показывает посты
- [ ] Можно открыть пост
- [ ] Поиск работает
- [ ] Тёмная тема переключается
- [ ] Навигация работает
- [ ] Контакты открываются

### 8.3. Проверь PWA:

1. Открой DevTools (F12)
2. Application → Service Workers
3. Должен быть зарегистрирован
4. Application → Manifest
5. Должен загружаться

### 8.4. Проверь в Chrome:

1. Открой сайт в Chrome
2. Справа в адресной строке должна быть кнопка "Install"
3. Нажми → сайт установится как приложение! 🎉

---

## 🎨 БОНУС: Кастомный домен

### Если хочешь свой домен (example.com):

#### 1. Купи домен
- [Namecheap](https://www.namecheap.com/)
- [Cloudflare](https://www.cloudflare.com/products/registrar/)

#### 2. Настрой в GitHub

1. Settings → Pages → Custom domain
2. Введи: `blog.example.com`
3. Save
4. Включи "Enforce HTTPS"

#### 3. Настрой DNS у регистратора

Добавь CNAME запись:
```
Type: CNAME
Name: blog
Value: ТВОЙUSERNAME.github.io
```

#### 4. Дождись propagation (5-60 минут)

#### 5. Обнови домены в коде

```bash
sed -i '' "s/ТВОЙUSERNAME.github.io\/blog/blog.example.com/g" index.html
sed -i '' "s/ТВОЙUSERNAME.github.io\/blog/blog.example.com/g" assets/js/app.js
# ... и т.д.

# Убери /blog/ из путей
sed -i '' "s/\/blog\//\//g" assets/js/app.js
sed -i '' "s/const BASE_PATH = '\/blog'/const BASE_PATH = ''/g" sw.js

git add .
git commit -m "Update to custom domain"
git push
```

---

## 🔄 КАК ОБНОВЛЯТЬ САЙТ

### После любых изменений:

```bash
cd /Users/dimailev/anti/нд/blog

# 1. Внеси изменения (добавь пост, отредактируй что-то)

# 2. Коммит
git add .
git commit -m "Описание изменений"

# 3. Пуш
git push

# GitHub Pages автоматически обновится через 1-2 минуты!
```

---

## 📝 ЧЕКЛИСТ ДЕПЛОЯ

### Перед первым деплоем:
- [ ] Заменены все `yourdomain.com`
- [ ] Заменено `Your Name`
- [ ] Заменён `@yourusername`
- [ ] Настроены контакты
- [ ] Есть несколько постов
- [ ] Пересобран `app.min.js`

### Git и GitHub:
- [ ] Git инициализирован
- [ ] Создан репозиторий на GitHub
- [ ] Код запушен
- [ ] GitHub Pages включен

### После деплоя:
- [ ] Сайт открывается
- [ ] Исправлены пути (если в `/blog/`)
- [ ] Service Worker работает
- [ ] PWA устанавливается
- [ ] Всё работает корректно

---

## ❗ TROUBLESHOOTING

### Сайт показывает 404

**Проверь:**
1. GitHub Pages включен (Settings → Pages)
2. Source установлен на `main` / `root`
3. Подожди 2-3 минуты
4. Очисти кэш браузера

### Service Worker не работает

**Причина:** Неправильные пути

**Решение:**
- Добавь `/blog/` к путям в `app.js` и `sw.js`
- Пересобери
- Запуш

### Стили не применяются

**Проверь:**
1. Пути к CSS правильные
2. Файл `style.min.css` существует
3. DevTools → Network → проверь загрузку

### PWA не устанавливается

**Проверь:**
1. HTTPS включен ✅ (GitHub Pages автоматически)
2. Manifest.json загружается
3. Иконки существуют
4. Service Worker зарегистрирован

---

## 🎉 ГОТОВО!

**Твой блог теперь онлайн!** 🌐

**Что дальше:**
1. Поделись ссылкой в соцсетях
2. Добавь в GitHub profile
3. Пиши контент! 📝

**Ссылка на сайт:**
```
https://ТВОЙUSERNAME.github.io/blog/
```

---

## 📚 ПОЛЕЗНЫЕ КОМАНДЫ

```bash
# Проверить статус
git status

# Посмотреть историю
git log --oneline

# Откатить изменения
git reset --hard HEAD

# Создать новую ветку
git checkout -b feature-name

# Слить ветку
git checkout main
git merge feature-name

# Посмотреть remote
git remote -v
```

---

**Вопросы? Проблемы? Пиши!** 💬

**Удачи с блогом!** 🚀✨
