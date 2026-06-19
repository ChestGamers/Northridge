const keys = document.querySelectorAll('.key');
const popupBg = document.querySelector('.info__bg');
const popup = document.querySelector('.info');
const tooltip = document.querySelector('.tooltip');

keys.forEach(key => {
    key.addEventListener('click', function() {
        popup.querySelector('.info__photo').src = this.dataset.photo;
        popup.querySelector('.info_title').innerText = this.dataset.title;
        popup.querySelector('.info__text').innerText = this.dataset.description;
        popupBg.classList.add('active');
    });

    key.addEventListener('mousemove', function(e) {
        tooltip.style.display = 'block';
        tooltip.innerText = this.dataset.title;
        tooltip.style.left = (e.clientX + 10) + 'px';
        tooltip.style.top = (e.clientY + 10) + 'px';
    });

    key.addEventListener('mouseleave', () => tooltip.style.display = 'none');
});

document.querySelector('.info__close').addEventListener('click', () => popupBg.classList.remove('active'));
