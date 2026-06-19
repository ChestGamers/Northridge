const tooltip = document.querySelector('.tooltip');
const keys = document.querySelectorAll('.key');
const popupBg = document.querySelector('.info__bg');
const popup = document.querySelector('.info');
const popupClose = document.querySelector('.info__close');

// Инициализация Panzoom
const panzoomElement = document.getElementById('panzoom-element');
const panzoom = Panzoom(panzoomElement, {
    maxScale: 6,
    minScale: 0.1,
    contain: 'outside',
    startScale: 1
});

// Настройка зума колесиком на ПК
panzoomElement.parentElement.addEventListener('wheel', function(e) {
    const currentScale = panzoom.getScale();

    if (currentScale <= 0.1 && e.deltaY > 0) {
        // Даем скроллить саму страницу вниз
    } else if (window.scrollY > 0 && e.deltaY < 0) {
        // Даем странице сначала вернуться наверх
    } else {
        e.preventDefault();
        panzoom.zoomWithWheel(e);
    }
}, { passive: false });

// Автоматический счетчик ключей по типам
function updateCounters() {
    const totalKeys = keys.length;
    let lootCount = 0;
    let questCount = 0;

    keys.forEach(key => {
        if (key.dataset.type === 'loot') lootCount++;
        if (key.dataset.type === 'quest') questCount++;
    });

    document.getElementById('count-all').innerText = totalKeys;
    document.getElementById('count-loot').innerText = lootCount;
    document.getElementById('count-quest').innerText = questCount;
}

updateCounters();

let touchStartX = 0;
let touchStartY = 0;
const scrollThreshold = 10; 
let activeMobileKey = null; 

const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

keys.forEach(key => {
    // Открытие окна инфо (Для ПК)
    key.addEventListener('click', function(e) {
        e.stopPropagation();
        if (isTouchDevice) return; 
        openFullPopup(this);
    });

    // Логика наведения мышки для ПК
    if (!isTouchDevice) {
        key.addEventListener('mousemove', function(e) {
            tooltip.innerText = this.dataset.title;
            tooltip.style.top = (e.clientY + 20) + 'px';
            tooltip.style.left = (e.clientX + 20) + 'px';
        });

        key.addEventListener('mouseenter', function() { tooltip.style.display = 'block'; });
        key.addEventListener('mouseleave', function() { tooltip.style.display = 'none'; });
    }

    // Умная логика для мобилок (1-й тап — тултип, 2-й — окно)
    if (isTouchDevice) {
        key.addEventListener('touchstart', function(e) {
            e.stopPropagation();
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        }, { passive: true });

        key.addEventListener('touchend', function(e) {
            e.preventDefault(); 
            e.stopPropagation();
            
            const touch = e.changedTouches[0];
            const moveX = Math.abs(touch.clientX - touchStartX);
            const moveY = Math.abs(touch.clientY - touchStartY);

            if (moveX < scrollThreshold && moveY < scrollThreshold) {
                if (activeMobileKey === this) {
                    openFullPopup(this);
                } else {
                    tooltip.style.display = 'none'; 
                    activeMobileKey = this; 
                    tooltip.innerText = this.dataset.title;
                    tooltip.style.display = 'block';
                    
                    const rect = this.getBoundingClientRect();
                    tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
                    
                    if (rect.top < 60) {
                        tooltip.style.top = (rect.bottom + 10) + 'px'; 
                    } else {
                        tooltip.style.top = (rect.top - 45) + 'px'; 
                    }
                }
            }
        }, { passive: false }); 
    }
});

// Функция открытия попапа
function openFullPopup(keyElement) {
    activeMobileKey = null; 
    tooltip.style.display = 'none';
    
    const photoPath = keyElement.dataset.photo.replace(/\\/g, '/');
    
    popup.querySelector('.info__photo').setAttribute('src', photoPath);
    popup.querySelector('.info_title').innerText = keyElement.dataset.title;
    popup.querySelector('.info__text').innerText = keyElement.dataset.description;
    popupBg.classList.add('active');
    
    popup.scrollTop = 0;
}

const closePopup = () => {
    popupBg.classList.remove('active');
    activeMobileKey = null; 
    tooltip.style.display = 'none';
};

// Сброс подсказок при тапе мимо или сдвиге карты
document.addEventListener('touchstart', (e) => {
    if (!e.target.closest('.filter-btn') && !e.target.closest('.info')) {
        tooltip.style.display = 'none';
        activeMobileKey = null;
    }
}, { passive: true });

panzoomElement.addEventListener('panzoompan', () => {
    tooltip.style.display = 'none';
    activeMobileKey = null;
});

// Фильтрация кнопок (Исправлена под работу с тегами <image>)
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        e.stopPropagation(); 
        tooltip.style.display = 'none';
        activeMobileKey = null;
        
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');

        const filterValue = this.dataset.filter;
        keys.forEach(key => {
            if (filterValue === 'all' || key.dataset.type === filterValue) {
                key.style.display = 'block'; // Снова показываем иконку
            } else {
                key.style.display = 'none';  // Полностью убираем иконку с карты
            }
        });
    });
});

popupBg.addEventListener('click', (e) => { if(e.target === popupBg) closePopup(); });
if (popupClose) popupClose.addEventListener('click', closePopup);

// Блокировщик скролла страницы при зуме карты на мобильных
document.addEventListener('touchmove', function(e) {
    if (e.target.closest('.info')) return; 
    const currentScale = panzoom.getScale();
    if (currentScale > 0.1) e.preventDefault();
}, { passive: false });
