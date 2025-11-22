# ⚡ Быстрый старт

## Добавить новый пост

### 1. Создайте файл `.md` в `posts/`

```markdown
# Мой новый пост

Текст поста с поддержкой **жирного**, *курсива* и [ссылок](url).

## Подзаголовок

- Список
- Пункты

![Изображение](posts/images/photo.jpg)
```

### 2. Обновите `posts/index.json`

```json
{
  "slug": "my-post",
  "title": "Название",
  "excerpt": "Краткое описание...",
  "date": "2025-11-20",
  "preview": "posts/images/preview.jpg"
}
```

### 3. Готово! ✅

---

## Редактировать контакты

Откройте `assets/js/app.js` → найдите `renderContacts()` → измените ссылки и текст

---

## Изменить цвета

Откройте `assets/css/style.css` → измените переменные в `:root`:

```css
--bg-primary: #ffffff;
--text-primary: #1a1a1a;
--accent-color: #0066ff;
```

---

## Запустить локально

```bash
python3 -m http.server 8000
# Откройте http://localhost:8000
```
