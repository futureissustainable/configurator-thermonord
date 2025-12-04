// State management
const state = {
  currentScreen: 1,
  totalScreens: 4,
  selections: {
    status: null,
    timeline: null,
    budget: null,
    scope: null
  },
  history: []
};

// Progress and navigation functions
function updateProgress() {
  const progressFill = document.getElementById('progressFill');
  const progress = ((state.currentScreen - 1) / state.totalScreens) * 100;
  progressFill.style.width = `${progress}%`;

  document.querySelectorAll('.progress-step').forEach((step, index) => {
    const stepNum = index + 1;
    step.classList.remove('active', 'completed');
    if (stepNum === state.currentScreen) {
      step.classList.add('active');
    } else if (stepNum < state.currentScreen) {
      step.classList.add('completed');
    }
  });
}

function updateBackButton() {
  const backBtn = document.getElementById('backBtn');
  if (state.history.length > 0) {
    backBtn.classList.remove('hidden');
  } else {
    backBtn.classList.add('hidden');
  }
}

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });

  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add('active');
  }
}

function selectOption(element, category, value) {
  element.parentElement.querySelectorAll('.option-card').forEach(card => {
    card.classList.remove('selected');
  });

  element.classList.add('selected');
  state.selections[category] = value;
  state.history.push(state.currentScreen);

  setTimeout(() => {
    state.currentScreen++;
    updateProgress();

    // After last question (screen 4), go to configurator
    if (state.currentScreen > state.totalScreens) {
      showConfigurator();
    } else {
      showScreen(`screen${state.currentScreen}`);
    }
    updateBackButton();
  }, 300);
}

function showFailScreen(type) {
  state.history.push(state.currentScreen);
  showScreen(`fail-${type}`);
  updateBackButton();
}

function goBack() {
  if (state.history.length > 0) {
    const prevScreen = state.history.pop();
    state.currentScreen = prevScreen;
    updateProgress();
    showHeader();
    showScreen(`screen${prevScreen}`);
    updateBackButton();
  }
}

function goToForm() {
  const params = new URLSearchParams();
  Object.entries(state.selections).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  if (typeof WindowConfigurator !== 'undefined') {
    const configData = WindowConfigurator.getFormData();
    if (configData.products) params.set('PRODUCTS', configData.products);
    if (configData.total) params.set('TOTAL', configData.total);
    if (configData.count) params.set('PRODUCT_COUNT', configData.count);
  }

  window.location.href = `/form?${params.toString()}`;
}

function showConfigurator() {
  // Hide header when showing configurator
  document.querySelector('.header').style.display = 'none';
  showScreen('configurator-screen');
  updateBackButton();
  WindowConfigurator.init();
}

function showHeader() {
  document.querySelector('.header').style.display = 'flex';
}

// Window Configurator Module
const WindowConfigurator = (function() {
  const productTypes = [
    { name: "Ramă Fixă", price: 245, image: "https://cdn.prod.website-files.com/6911a9ea752f8b71a4122002/691302224093ef3c30939e72_Thermonord%20Tripan%20FIX.avif", hasOpening: false, typeId: 'fixed' },
    { name: "Ramă Fereastră (Deschidere Clasică)", price: 485, image: "https://cdn.prod.website-files.com/6911a9ea752f8b71a4122002/691302227d7c4d41b1078486_Thermonord%20Tripan%20GEAM%20CLASIC.avif", hasOpening: true, typeId: 'classic' },
    { name: "Ramă Fereastră (Oscilobatantă)", price: 515, image: "https://cdn.prod.website-files.com/6911a9ea752f8b71a4122002/69130220a3a0f59d430752dc_Thermonord%20Tripan%20OSCILOBATANT.avif", hasOpening: true, typeId: 'tilt_turn' },
    { name: "Ramă Ușă Intrare", price: 580, image: "https://cdn.prod.website-files.com/6911a9ea752f8b71a4122002/691302227033c8b97f33857b_Thermonord%20Tripan%20USA.avif", hasOpening: true, typeId: 'door_simple' },
    { name: "Ramă Ușă Glisantă", price: 695, image: "https://cdn.prod.website-files.com/6911a9ea752f8b71a4122002/69130222c4dd8d5da11bdab3_Thermonord%20Tripan%20SLIDE.avif", hasOpening: true, typeId: 'slide' },
  ];

  const glassTypes = [
    { name: "Fără sticlă", price: 0 },
    { name: "Tripan Securizat + Laminat", price: 0 }
  ];

  const colorOptions = [
    { name: "Antracit" },
    { name: "Altă culoare (Comandă specială)" }
  ];

  let products = [];

  function init() {
    products = [{
      id: Date.now().toString(),
      type: productTypes[0].name,
      typeId: productTypes[0].typeId,
      price: productTypes[0].price,
      image: productTypes[0].image,
      hasOpening: productTypes[0].hasOpening,
      opening: "Stânga",
      color: colorOptions[0].name,
      glassType: glassTypes[1].name,
      width: 0,
      height: 0
    }];
    render();
  }

  function render() {
    renderProducts();
    renderVisuals();
    updateSummary();
  }

  function renderProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;

    container.innerHTML = products.map((product, index) => {
      const currentProductType = productTypes.find(t => t.name === product.type);
      const isCustomColor = product.color === "Altă culoare (Comandă specială)";

      return `
      <div class="product-card" id="card-${product.id}">
        <div class="product-header">
          <div class="product-number">${index + 1}</div>
          <div class="product-title">Produs ${index + 1}</div>
          ${products.length > 1 ? `
            <button class="icon-btn" style="margin-left: auto;" onclick="WindowConfigurator.removeProduct('${product.id}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          ` : ''}
        </div>

        <div class="input-group">
          <div class="input-row">
            <select onchange="WindowConfigurator.updateProductType('${product.id}', this.value)">
              ${productTypes.map(type => `
                <option value="${type.name}" ${product.type === type.name ? 'selected' : ''}>
                  ${type.name}
                </option>
              `).join('')}
            </select>
            <button class="icon-btn" onclick="window.open('https://cdn.prod.website-files.com/6911a9ea752f8b71a4122002/691479db3bd4cdcdba58b6eb_RAME%20Thermonord%20GENESIS%2090.pdf', '_blank')">?</button>
          </div>

          <div class="input-row">
            <select onchange="WindowConfigurator.updateGlassType('${product.id}', this.value)">
              ${glassTypes.map(glass => `
                <option value="${glass.name}" ${product.glassType === glass.name ? 'selected' : ''}>
                  ${glass.name}
                </option>
              `).join('')}
            </select>
            <button class="icon-btn" onclick="window.open('https://cdn.prod.website-files.com/6911a9ea752f8b71a4122002/691479db3bd4cdcdba58b6e1_GLASS%20Thermonord%20Tripan%20Securizat%20%2B%20Laminat.pdf', '_blank')">?</button>
          </div>

          <hr class="divider">

          <select onchange="WindowConfigurator.updateColor('${product.id}', this.value)">
            ${colorOptions.map(color => `
              <option value="${color.name}" ${product.color === color.name ? 'selected' : ''}>
                ${color.name}
              </option>
            `).join('')}
          </select>

          ${isCustomColor ? `
            <input type="text"
                   placeholder="Specificați culoarea (ex: RAL 7016)"
                   value="${product.customColorNote || ''}"
                   oninput="WindowConfigurator.updateProduct('${product.id}', 'customColorNote', this.value)">
          ` : ''}

          ${currentProductType && currentProductType.hasOpening ? `
            <select onchange="WindowConfigurator.updateOpening('${product.id}', this.value)">
              <option value="Stânga" ${product.opening === 'Stânga' ? 'selected' : ''}>Deschidere stânga</option>
              <option value="Dreapta" ${product.opening === 'Dreapta' ? 'selected' : ''}>Deschidere dreapta</option>
            </select>
          ` : ''}

          <div class="grid-2">
            <div class="input-wrapper">
              <input type="number" value="${product.width || ''}" oninput="WindowConfigurator.updateProduct('${product.id}', 'width', this.value)" placeholder="Lățime">
              <span class="input-suffix">cm</span>
            </div>
            <div class="input-wrapper">
              <input type="number" value="${product.height || ''}" oninput="WindowConfigurator.updateProduct('${product.id}', 'height', this.value)" placeholder="Înălțime">
              <span class="input-suffix">cm</span>
            </div>
          </div>
        </div>
      </div>
    `}).join('');
  }

  function renderVisuals() {
    const container = document.getElementById('visuals-container');
    if (!container) return;

    while(container.children.length > products.length) {
      container.removeChild(container.lastChild);
    }
    while(container.children.length < products.length) {
      const div = document.createElement('div');
      div.className = 'visual-card';
      div.innerHTML = `<img src="" alt=""> <canvas style="display:none;"></canvas>`;
      container.appendChild(div);
    }

    Array.from(container.children).forEach((div, index) => {
      const product = products[index];
      const img = div.querySelector('img');
      const canvas = div.querySelector('canvas');

      const hasBothDimensions = product.width > 0 && product.height > 0;

      if (hasBothDimensions) {
        div.classList.add('visible');
        img.style.display = 'none';
        canvas.style.display = 'block';
        drawWindowDiagram(canvas, product);
      } else {
        div.classList.remove('visible');
        img.style.display = 'none';
        canvas.style.display = 'none';
      }
    });
  }

  function drawWindowDiagram(canvas, product) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(0, 0, w, h);

    const mainColor = '#ffffff';
    const frameFillColor = '#1a1a1a';
    const handleColor = '#888888';
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';

    const inputW = parseFloat(product.width);
    const inputH = parseFloat(product.height);
    const padding = 40;

    let drawW, drawH;
    const availableW = w - (padding * 2);
    const availableH = h - (padding * 2);
    const inputRatio = inputW / inputH;
    const canvasRatio = availableW / availableH;

    if (inputRatio > canvasRatio) {
      drawW = availableW;
      drawH = availableW / inputRatio;
    } else {
      drawH = availableH;
      drawW = availableH * inputRatio;
    }

    const startX = (w - drawW) / 2;
    const startY = (h - drawH) / 2;

    const frameThick = Math.min(drawW, drawH) * 0.06;
    const innerX = startX + frameThick;
    const innerY = startY + frameThick;
    const innerW = drawW - (frameThick * 2);
    const innerH = drawH - (frameThick * 2);

    ctx.fillStyle = frameFillColor;
    ctx.fillRect(startX, startY, drawW, drawH);

    const glassGradient = ctx.createLinearGradient(innerX, innerY, innerX, innerY + innerH);
    glassGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    glassGradient.addColorStop(1, 'rgba(200, 200, 220, 0.05)');
    ctx.fillStyle = glassGradient;
    ctx.fillRect(innerX, innerY, innerW, innerH);

    ctx.strokeStyle = mainColor;
    ctx.strokeRect(startX, startY, drawW, drawH);

    if (product.typeId === 'slide') {
      const midX = innerX + (innerW / 2);
      ctx.strokeRect(innerX, innerY, innerW / 2, innerH);
      ctx.strokeRect(midX, innerY, innerW / 2, innerH);
      ctx.beginPath();
      ctx.moveTo(startX, startY + drawH - (frameThick/3));
      ctx.lineTo(startX + drawW, startY + drawH - (frameThick/3));
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.stroke();
      ctx.strokeStyle = mainColor;
    } else {
      ctx.strokeRect(innerX, innerY, innerW, innerH);
    }

    if (product.hasOpening) {
      ctx.beginPath();
      const isLeft = product.opening === 'Stânga';

      if (['classic', 'door_simple', 'door_osc', 'tilt_turn'].includes(product.typeId)) {
        if (isLeft) {
          ctx.moveTo(innerX, innerY);
          ctx.lineTo(innerX + innerW, innerY + (innerH / 2));
          ctx.lineTo(innerX, innerY + innerH);
        } else {
          ctx.moveTo(innerX + innerW, innerY);
          ctx.lineTo(innerX, innerY + (innerH / 2));
          ctx.lineTo(innerX + innerW, innerY + innerH);
        }
      }

      if (['door_osc', 'tilt_turn'].includes(product.typeId)) {
        ctx.moveTo(innerX, innerY + innerH);
        ctx.lineTo(innerX + (innerW / 2), innerY);
        ctx.lineTo(innerX + innerW, innerY + innerH);
      }
      ctx.stroke();

      if (product.typeId === 'slide') {
        const arrowY = innerY + (innerH / 2);
        const arrowLen = Math.min(innerW, innerH) * 0.15;
        const arrowHeadSize = arrowLen * 0.4;

        let arrowStartX, arrowEndX;

        if (isLeft) {
          const paneCenter = innerX + (innerW/4);
          arrowStartX = paneCenter - (arrowLen/2);
          arrowEndX = paneCenter + (arrowLen/2);

          ctx.beginPath();
          ctx.moveTo(arrowStartX, arrowY);
          ctx.lineTo(arrowEndX, arrowY);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(arrowEndX, arrowY);
          ctx.lineTo(arrowEndX - arrowHeadSize, arrowY - (arrowHeadSize/2));
          ctx.lineTo(arrowEndX - arrowHeadSize, arrowY + (arrowHeadSize/2));
          ctx.fillStyle = mainColor;
          ctx.fill();
        } else {
          const paneCenter = innerX + innerW - (innerW/4);
          arrowStartX = paneCenter + (arrowLen/2);
          arrowEndX = paneCenter - (arrowLen/2);

          ctx.beginPath();
          ctx.moveTo(arrowStartX, arrowY);
          ctx.lineTo(arrowEndX, arrowY);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(arrowEndX, arrowY);
          ctx.lineTo(arrowEndX + arrowHeadSize, arrowY - (arrowHeadSize/2));
          ctx.lineTo(arrowEndX + arrowHeadSize, arrowY + (arrowHeadSize/2));
          ctx.fillStyle = mainColor;
          ctx.fill();
        }
      }

      ctx.fillStyle = handleColor;

      if (product.typeId === 'slide') {
        const handleH = innerH * 0.4;
        const handleW = Math.max(4, innerW * 0.015);
        const handleY = innerY + (innerH / 2) - (handleH / 2);
        let handleX;

        if (isLeft) {
          handleX = innerX + (innerW/4) - (handleW/2);
        } else {
          handleX = innerX + innerW - (innerW/4) - (handleW/2);
        }

        ctx.beginPath();
        ctx.roundRect(handleX, handleY, handleW, handleH, handleW);
        ctx.fill();
      } else {
        const handleH = Math.max(20, innerH * 0.15);
        const handleW = handleH / 4;
        const handleY = innerY + (innerH / 2) - (handleH / 2);
        let handleX;

        if (isLeft) {
          handleX = innerX + innerW - (handleW * 1.5);
        } else {
          handleX = innerX + (handleW * 0.5);
        }

        ctx.beginPath();
        ctx.roundRect(handleX, handleY, handleW, handleH, handleW/2);
        ctx.fill();
      }
    }
  }

  function addProduct() {
    products.push({
      id: Date.now().toString(),
      type: productTypes[0].name,
      typeId: productTypes[0].typeId,
      price: productTypes[0].price,
      image: productTypes[0].image,
      hasOpening: productTypes[0].hasOpening,
      opening: "Stânga",
      color: colorOptions[0].name,
      glassType: glassTypes[1].name,
      width: 0,
      height: 0
    });
    render();
  }

  function removeProduct(id) {
    products = products.filter(p => p.id !== id);
    render();
  }

  function updateProduct(id, field, value) {
    products = products.map(p => {
      if (p.id === id) {
        const finalVal = (field === 'width' || field === 'height') ? Number(value) : value;
        return { ...p, [field]: finalVal };
      }
      return p;
    });
    renderVisuals();
    updateSummary();
  }

  function updateProductType(id, typeName) {
    const selectedType = productTypes.find(t => t.name === typeName);
    products = products.map(p => {
      if (p.id === id) {
        return {
          ...p,
          type: typeName,
          typeId: selectedType.typeId,
          price: selectedType.price,
          image: selectedType.image,
          hasOpening: selectedType.hasOpening
        };
      }
      return p;
    });
    render();
  }

  function updateGlassType(id, glassName) {
    products = products.map(p => {
      if (p.id === id) return { ...p, glassType: glassName };
      return p;
    });
    updateSummary();
  }

  function updateColor(id, colorName) {
    products = products.map(p => {
      if (p.id === id) return { ...p, color: colorName };
      return p;
    });
    renderProducts();
    updateSummary();
  }

  function updateOpening(id, openingDir) {
    products = products.map(p => {
      if (p.id === id) return { ...p, opening: openingDir };
      return p;
    });
    renderVisuals();
    updateSummary();
  }

  function updateSummary() {
    const summaryContainer = document.getElementById('summary-items');
    if (!summaryContainer) return;

    summaryContainer.innerHTML = products.map((product, index) => {
      const sqm = (product.width * product.height) / 10000;
      const itemTotal = sqm * product.price;
      const openingText = product.hasOpening ? ` - ${product.opening}` : '';

      let colorDisplay = product.color;
      if (product.color.includes("Altă culoare") && product.customColorNote) {
        colorDisplay = `Custom: ${product.customColorNote}`;
      }

      return `<div class="summary-item">${index + 1}. ${product.type}<br><span class="summary-details">${product.glassType} - ${colorDisplay}${openingText} - L:${product.width}cm x H:${product.height}cm - ${itemTotal.toFixed(2)} EUR</span></div>`;
    }).join('');

    const total = products.reduce((sum, product) => {
      const sqm = (product.width * product.height) / 10000;
      return sum + (sqm * product.price);
    }, 0);

    document.getElementById('total').textContent = total.toFixed(2);
  }

  function getFormData() {
    const productsString = products.map((product, index) => {
      const sqm = (product.width * product.height) / 10000;
      const itemTotal = sqm * product.price;
      const openingText = product.hasOpening ? ` - ${product.opening}` : '';

      let colorDisplay = product.color;
      if (product.color.includes("Altă culoare") && product.customColorNote) {
        colorDisplay = `Custom: ${product.customColorNote}`;
      }

      return `${index + 1}. ${product.type} - ${product.glassType} - ${colorDisplay}${openingText} - L:${product.width}cm x H:${product.height}cm - ${itemTotal.toFixed(2)} EUR`;
    }).join('\n');

    const total = products.reduce((sum, product) => {
      const sqm = (product.width * product.height) / 10000;
      return sum + (sqm * product.price);
    }, 0);

    return {
      products: productsString,
      total: total.toFixed(2),
      count: products.length.toString()
    };
  }

  return {
    init,
    addProduct,
    removeProduct,
    updateProduct,
    updateProductType,
    updateGlassType,
    updateColor,
    updateOpening,
    getFormData
  };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  updateProgress();
});
