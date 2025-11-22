# 🖼️ Гайд по WebP изображениям

## ✅ ИСПРАВЛЕНО

### Проблема
- Код пытался загрузить несуществующие `.webp` файлы
- Изображения постов не отображались

### Решение
- Убран WebP fallback пока нет реальных WebP файлов
- Теперь загружаются только оригинальные JPEG/PNG

---

## 🎨 Светлая тема по умолчанию

**Изменено:**
```javascript
// Теперь светлая тема - тема по умолчанию
initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        // Default to light theme
        document.documentElement.setAttribute('data-theme', 'light');
    }
}
```

---

## 📖 Как добавить WebP поддержку (когда будет нужно)

### Шаг 1: Конвертируй изображения

#### macOS (через Homebrew):
```bash
# Установи cwebp
brew install webp

# Конвертируй все изображения
cd posts/images
for img in *.jpg *.jpeg *.png; do
    cwebp -q 80 "$img" -o "${img%.*}.webp"
done
```

#### Linux:
```bash
sudo apt install webp
# или
sudo yum install libwebp-tools

# Конвертируй
cd posts/images
for img in *.jpg *.jpeg *.png; do
    cwebp -q 80 "$img" -o "${img%.*}.webp"
done
```

#### Online инструменты:
- [Squoosh.app](https://squoosh.app/) - от Google
- [CloudConvert](https://cloudconvert.com/jpg-to-webp)

### Шаг 2: Структура файлов

```
posts/images/
├── first-post-preview.jpg   ← Оригинал (fallback)
├── first-post-preview.webp  ← WebP версия
└── ...
```

### Шаг 3: Обнови код (когда все файлы готовы)

**В `assets/js/app.js`:**

```javascript
// В функции renderPostsList() и setupSearchPage()
const previewHTML = post.preview ? `
    <div class="post-card-preview">
        <picture>
            <source srcset="${post.preview.replace(/\.(jpg|jpeg|png)$/i, '.webp')}" type="image/webp">
            <img src="${this.escapeHtml(post.preview)}" 
                 alt="${this.escapeHtml(post.title)}"
                 loading="lazy">
        </picture>
    </div>
` : '';
```

---

## 💡 Зачем нужен WebP?

### Преимущества:
- **25-35% меньше размер** чем JPEG
- **Лучшее качество** при том же размере
- **Поддержка** в 95% браузеров

### Сравнение размеров:
```
JPEG (качество 80): 150 KB
WebP (качество 80):  95 KB  ← экономия 37%
PNG (lossless):     450 KB
WebP (lossless):    280 KB  ← экономия 38%
```

### Браузерная поддержка:
- ✅ Chrome 23+
- ✅ Firefox 65+
- ✅ Safari 14+ (macOS Big Sur, iOS 14)
- ✅ Edge 18+
- ❌ IE11 (используется fallback)

---

## 🔧 Автоматизация

### CI/CD скрипт:
```bash
#!/bin/bash
# convert-to-webp.sh

IMAGE_DIR="posts/images"

for img in "$IMAGE_DIR"/*.{jpg,jpeg,png}; do
    if [ -f "$img" ]; then
        webp_file="${img%.*}.webp"
        if [ ! -f "$webp_file" ]; then
            echo "Converting: $img"
            cwebp -q 80 "$img" -o "$webp_file"
        fi
    fi
done

echo "Done! ✨"
```

### NPM Script (package.json):
```json
{
  "scripts": {
    "images:webp": "sh convert-to-webp.sh",
    "images:optimize": "imageoptim posts/images/*"
  }
}
```

---

## ⚠️ Важные заметки

1. **Не конвертируй автоматически** - сначала собери все изображения
2. **Храни оригиналы** - JPEG/PNG нужны как fallback
3. **Оптимизируй оригиналы** - сначала сожми JPEG, потом делай WebP
4. **Проверяй размеры** - иногда WebP может быть больше (редко)

---

## 📊 Рекомендуемые настройки Quality

| Тип изображения | JPEG Q | WebP Q |
|-----------------|:------:|:------:|
| Фото высокого качества | 85 | 80 |
| Обычные фото | 80 | 75 |
| Превью постов | 75 | 70 |
| Иконки/UI | PNG | WebP lossless |

---

## ✅ Проверка работы

После добавления WebP открой DevTools → Network:

```
first-post-preview.webp    ← Chrome/Firefox загружают WebP
first-post-preview.jpg     ← Safari 13/IE11 используют fallback
```

---

**Пока WebP файлов нет - используются только оригинальные изображения.** ✨

**Обнови страницу (Cmd+Shift+R) - всё должно работать!** 🎉
