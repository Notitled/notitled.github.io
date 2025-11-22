# 📋 Инструкция по редактированию контактов

## Где находятся контакты?

Контакты хранятся в файле `assets/js/app.js` в функции `renderContacts()`.

## Как редактировать?

### Шаг 1: Откройте файл

Откройте `assets/js/app.js` в любом текстовом редакторе.

### Шаг 2: Найдите функцию

Найдите функцию `renderContacts()` (примерно строка 224):

```javascript
renderContacts() {
    return `
        <div class="contacts-page">
            <h1>Контакты</h1>
            
            <div class="contact-item">
                <label>Email</label>
                <div class="contact-value">
                    <a href="mailto:your.email@example.com">your.email@example.com</a>
                </div>
            </div>
            
            // ... остальные контакты
        </div>
    `;
}
```

### Шаг 3: Замените данные

Измените ссылки и текст на свои:

```javascript
// Email
<a href="mailto:your.email@example.com">your.email@example.com</a>
//           ↓↓↓ ИЗМЕНИТЕ ТУТ ↓↓↓
<a href="mailto:ivan@example.com">ivan@example.com</a>

// Telegram
<a href="https://t.me/yourusername">@yourusername</a>
//                     ↓↓↓ ИЗМЕНИТЕ ТУТ ↓↓↓
<a href="https://t.me/ivan_dev">@ivan_dev</a>

// И так далее для каждого контакта
```

### Шаг 4: Добавить/удалить контакты

**Добавить новый контакт:**

```javascript
<div class="contact-item">
    <label>Ваша соцсеть</label>
    <div class="contact-value">
        <a href="https://example.com/profile" target="_blank" rel="noopener">Ваш профиль</a>
    </div>
</div>
```

**Удалить контакт:**

Просто удалите весь блок `<div class="contact-item">...</div>`

### Шаг 5: Сохраните файл

Сохраните изменения и обновите страницу в браузере!

## 📝 Примеры популярных соцсетей

### VK
```html
<div class="contact-item">
    <label>VK</label>
    <div class="contact-value">
        <a href="https://vk.com/yourid" target="_blank" rel="noopener">vk.com/yourid</a>
    </div>
</div>
```

### Instagram
```html
<div class="contact-item">
    <label>Instagram</label>
    <div class="contact-value">
        <a href="https://instagram.com/username" target="_blank" rel="noopener">@username</a>
    </div>
</div>
```

### Discord
```html
<div class="contact-item">
    <label>Discord</label>
    <div class="contact-value">
        username#1234
    </div>
</div>
```

### Личный сайт
```html
<div class="contact-item">
    <label>Сайт</label>
    <div class="contact-value">
        <a href="https://yourwebsite.com" target="_blank" rel="noopener">yourwebsite.com</a>
    </div>
</div>
```

## ⚠️ Важно

- Для внешних ссылок используйте `target="_blank" rel="noopener"`
- Для email используйте `href="mailto:..."`
- Сохраняйте структуру HTML — не удаляйте закрывающие теги!
- После изменений просто обновите страницу (Ctrl+R / Cmd+R)
