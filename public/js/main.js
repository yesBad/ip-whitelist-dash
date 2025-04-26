function setActiveCategory(category) {
  document.querySelectorAll('[data-category]').forEach((btn) => {
    btn.classList.remove('bg-blue-600', 'text-white');
    btn.classList.add('bg-gray-800', 'text-gray-400');
  });

  const activeBtn = document.querySelector(`[data-category="${category}"]`);
  if (activeBtn) {
    activeBtn.classList.add('bg-blue-600', 'text-white');
    activeBtn.classList.remove('bg-gray-800', 'text-gray-400');
  }

  fetch(`/categories/${category}`)
    .then(res => res.json())
    .then(data => {
      const grid = document.getElementById('feature-grid');
      grid.innerHTML = '';

      data.forEach((feature) => {
        const card = document.createElement('a');
        card.href = feature.url;
        card.innerHTML = `
          <div class="bg-white/5 backdrop-blur-xl rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out border border-white/10 aspect-auto h-full transform hover:scale-105 active:scale-95">
            <img src="${feature.icon}" alt="${feature.feature} icon" class="w-12 h-12 mb-4 text-indigo-400" />
            <h3 class="text-xl font-bold mb-2 text-white">${feature.feature}</h3>
            <p class="text-gray-300">${feature.desc.replace(/\n/g, '<br/>')}</p>
          </div>`;
        grid.appendChild(card);
      });
    });
}
