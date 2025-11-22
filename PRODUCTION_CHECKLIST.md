# ⚡ Production Checklist

Перед публикацией блога на production сервере выполните эти шаги:

## 1. ⚙️ Конфигурация

### Обновите URLs
- [ ] `index.html` - замените `yourdomain.com` на свой домен
- [ ] `sitemap.xml` - обновите все URL
- [ ] `robots.txt` - обновите sitemap URL
- [ ] Open Graph tags - замените URLs изображений

### Создайте производственные файлы
```bash
# Минификация CSS
npx clean-css-cli -o assets/css/style.min.css assets/css/style.css

# Минификация JS
npx terser assets/js/app.js -o assets/js/app.min.js -c -m

# Обновите ссылки в index.html на .min версии
```

## 2. 🖼️ Оптимизация изображений

### Сжатие
```bash
# Установите squoosh-cli
npm install -g @squoosh/cli

# Конвертируйте в WebP
squoosh-cli --webp '{"quality":80}' posts/images/*.jpg

# Или используйте онлайн инструменты:
# - TinyPNG.com
# - Squoosh.app
```

### Создайте Open Graph изображение
- Размер: 1200x630px
- Формат: JPG или PNG
- Сохраните как `assets/og-image.jpg`

## 3. 🔒 Безопасность

### Обновите SRI хэш
Если вы обновляете версию Marked.js:
```bash
# Получите SRI хэш
curl -s https://cdn.jsdelivr.net/npm/marked@11.1.1/marked.min.js | \
openssl dgst -sha256 -binary | openssl base64 -A
```

### HTTPS
- [ ] Убедитесь, что сайт доступен по HTTPS
- [ ] Настройте редирект HTTP → HTTPS

## 4. 📊 Analytics (опционально)

### Google Analytics
Добавьте перед `</head>`:
```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Yandex Metrika
```html
<!-- Yandex.Metrika counter -->
<script type="text/javascript" >
   (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
   m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
   (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
   ym(XXXXXXXX, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true });
</script>
```

## 5. 🌐 Hosting

### GitHub Pages
```bash
# 1. Создайте репозиторий
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/repo.git
git push -u origin main

# 2. Settings → Pages → Source: main branch
```

### Netlify
```bash
# Просто перетащите папку blog на netlify.com/drop
# Или используйте CLI:
npx netlify-cli deploy --prod
```

### Vercel
```bash
npx vercel --prod
```

## 6. 🗺️ Sitemap & SEO

### Google Search Console
1. Перейдите на [search.google.com/search-console](https://search.google.com/search-console)
2. Добавьте свой сайт
3. Отправьте sitemap: `yourdomain.com/sitemap.xml`

### Bing Webmaster Tools
1. [www.bing.com/webmasters](https://www.bing.com/webmasters)
2. Добавьте сайт
3. Импортируйте из Google Search Console (проще)

## 7. ⚡ Performance

### Проверьте скорость
- [ ] [PageSpeed Insights](https://pagespeed.web.dev/)
- [ ] [GTmetrix](https://gtmetrix.com/)
- [ ] [WebPageTest](https://www.webpagetest.org/)

### Цели:
- Performance: 95+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 95+

### CDN (опционально)
Для еще лучшей производительности используйте CDN:
- Cloudflare (бесплатно)
- Netlify CDN (бесплатно)

## 8. 📱 Тестирование

### Браузеры
- [ ] Chrome/Edge (последняя версия)
- [ ] Firefox (последняя версия)
- [ ] Safari (если есть Mac)
- [ ] Мобильный Safari (iOS)
- [ ] Chrome Mobile (Android)

### Устройства
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

### Функции
- [ ] Навигация работает
- [ ] Поиск работает
- [ ] Темная тема переключается
- [ ] Изображения загружаются
- [ ] Markdown рендерится правильно
- [ ] Scroll to top работает
- [ ] Мобильная навигация

## 9. ♿ Accessibility

### Проверьте
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Screen reader (NVDA/JAWS на Windows, VoiceOver на Mac)
- [ ] Контрастность цветов (используйте [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/))
- [ ] Alt текст для всех изображений

## 10. 🔄 Backup

### Перед деплоем
```bash
# Создайте git tag для релиза
git tag -a v1.0 -m "First production release"
git push origin v1.0

# Экспортируйте базу данных постов
cp posts/index.json posts/index.backup.json
```

## 11. 📧 Обновите контакты

- [ ] Email в `assets/js/app.js`
- [ ] Социальные сети
- [ ] Footer текст

## 12. 🎉 Launch!

### После запуска
1. Проверьте все ссылки
2. Тест на реальных пользователях
3. Мониторьте analytics
4. Собирайте обратную связь

### Продвижение
- [ ] Поделитесь в социальных сетях
- [ ] Добавьте в bio/подпись
- [ ] Расскажите друзьям

---

## ✅ Финальный чеклист

- [ ] URLs обновлены
- [ ] Производственные файлы минифицированы
- [ ] Изображения оптимизированы
- [ ] HTTPS настроен
- [ ] Analytics добавлен (опционально)
- [ ] Sitemap отправлен в Google
- [ ] Performance проверен (95+)
- [ ] Кроссбраузерность протестирована
- [ ] Accessibility проверен
- [ ] Backup создан
- [ ] Контакты обновлены

**Готово к запуску? Поехали! 🚀**
