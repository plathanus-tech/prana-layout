document.addEventListener('DOMContentLoaded', function() {
  const cardHeaders = document.querySelectorAll('.card-header');
  let selectedCard = null;

  cardHeaders.forEach(header => {
    header.addEventListener('click', function() {
      const card = this.closest('.service-card');

      if (selectedCard && selectedCard !== card) {
        selectedCard.classList.remove('selected');
        const radio = selectedCard.querySelector('.radio');
        if (radio) radio.style.backgroundColor = '';
      }

      card.classList.toggle('selected');
      const radio = card.querySelector('.radio');

      if (card.classList.contains('selected')) {
        radio.style.backgroundColor = '#B25557';
        radio.style.borderColor = '#B25557';
        selectedCard = card;
      } else {
        radio.style.backgroundColor = '';
        radio.style.borderColor = '#CCC';
        selectedCard = null;
      }
    });
  });

  const button = document.querySelector('.button-primary');
  if (button) {
    button.addEventListener('click', function() {
      if (selectedCard) {
        const serviceName = selectedCard.querySelector('.card-name').textContent;
        console.log('Serviço selecionado:', serviceName);
        alert('Você selecionou: ' + serviceName);
      } else {
        alert('Por favor, selecione um serviço primeiro');
      }
    });
  }
});