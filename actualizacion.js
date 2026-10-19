
(() => {
  'use strict';

  const SAVE_KEY = 'farmer_entrepreneur_save';
  const UPDATE_KEY = 'farmer_entrepreneur_update_v3';

  // Si ya se instaló, no vuelve a borrar la partida.
  if (localStorage.getItem(UPDATE_KEY) === 'installed') {
    console.info('Actualización Mi Granja Pro ya instalada.');
    return;
  }

  // Reinicia la partida al instalar esta versión.
  localStorage.removeItem(SAVE_KEY);

  const stockLimit = level =>
    5 + Math.max(0, Math.floor((Math.max(1, Number(level) || 1) - 1) / 10)) * 5;

  const getSave = () => {
    try {
      return JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    } catch {
      return null;
    }
  };

  const save = data =>
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));

  window.GranjaUpdate = {
    version: 3,
    stockLimit,

    getAnimalStock(id) {
      const data = getSave();
      const animal = data?.animals?.[id];
      const owned = typeof animal === 'number'
        ? animal
        : Number(animal?.count) || 0;
      const limit = stockLimit(data?.level);

      return { owned, limit, remaining: Math.max(0, limit - owned) };
    },

    canBuyAnimal(id, quantity = 1) {
      const stock = this.getAnimalStock(id);
      return Number.isInteger(quantity) &&
        quantity > 0 &&
        stock.owned + quantity <= stock.limit;
    },

    getInventoryStock(id) {
      return Math.max(0, Number(getSave()?.inventory?.[id]) || 0);
    },

    getInventoryLimit() {
      return stockLimit(getSave()?.level);
    },

    install() {
      const data = getSave();
      if (!data) return false;

      data.animals ||= {};
      data.inventory ||= {};

      for (const id of Object.keys(data.animals)) {
        const animal = data.animals[id];
        if (typeof animal === 'number') {
          data.animals[id] = {
            count: Math.min(animal, stockLimit(data.level)),
            progress: 0,
            timer: 10
          };
        } else if (animal && typeof animal === 'object') {
          animal.count = Math.min(
            Math.max(0, Number(animal.count) || 0),
            stockLimit(data.level)
          );
        }
      }

      save(data);
      return true;
    }
  };

  localStorage.setItem(UPDATE_KEY, 'installed');

  console.info(
    'Actualización instalada. Límite de stock nivel 1:',
    stockLimit(1)
  );
})();
