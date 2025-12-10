// ============================================
// THERMONORD Configurator - New Flow
// ============================================

// Frame types with pricing (with glass / without glass)
const frameTypes = [
  {
    id: 'fixed',
    name: 'Ramă Fixă',
    priceWithGlass: 245,
    priceNoGlass: 145,
    benefit: 'Fără deschidere',
    hasOpening: false,
    image: 'https://cdn.prod.website-files.com/6911a9ea752f8b71a4122002/6936a01229532b19ecc8c7e3_GEAM%20FIX.avif'
  },
  {
    id: 'classic',
    name: 'Fereastră Clasică',
    priceWithGlass: 485,
    priceNoGlass: 285,
    benefit: 'Deschidere laterală',
    hasOpening: true,
    image: 'https://cdn.prod.website-files.com/6911a9ea752f8b71a4122002/6936a013c2a9c19c34419641_GEAM%20CLASIC.avif'
  },
  {
    id: 'tilt_turn',
    name: 'Oscilobatantă',
    priceWithGlass: 515,
    priceNoGlass: 315,
    benefit: 'Deschidere + ventilație',
    hasOpening: true,
    image: 'https://cdn.prod.website-files.com/6911a9ea752f8b71a4122002/6936a013b86458b58644ee1c_GEAM%20OSCILO.avif'
  },
  {
    id: 'door_simple',
    name: 'Ușă Intrare',
    priceWithGlass: 580,
    priceNoGlass: 380,
    benefit: 'Clasică, sigură',
    hasOpening: true,
    image: 'https://cdn.prod.website-files.com/6911a9ea752f8b71a4122002/6936a0137aaa35d972df7ada_USA%20CLASICA.avif'
  },
  {
    id: 'slide',
    name: 'Ușă Glisantă',
    priceWithGlass: 695,
    priceNoGlass: 495,
    benefit: 'Deschidere panoramică',
    hasOpening: true,
    image: 'https://cdn.prod.website-files.com/6911a9ea752f8b71a4122002/6936a01110b71c03a7f7cfef_GEAM%20SLIDE.avif'
  }
];

// State management
const state = {
  currentScreen: 'screen-frame',
  history: [],

  // Product configuration
  hasGlass: true,  // Default to with glass (recommended)
  frameType: null,

  // Current product being configured
  currentProduct: {
    width: null,
    height: null,
    color: 'Antracit',
    customColor: '',
    opening: 'Dreapta',
    quantity: 1
  },

  // Cart
  cart: [],
  editingProductIndex: null,

  // Qualification
  projectType: null,
  timeline: null,
  scope: null
};

// ============================================
// Screen Navigation
// ============================================

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });

  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add('active');
  }

  state.currentScreen = screenId;
  updateProgress();
  updateBackButton();
  updateHeader();
}

function goToScreen(screenId) {
  state.history.push(state.currentScreen);
  showScreen(screenId);
}

function goBack() {
  if (state.history.length > 0) {
    const prevScreen = state.history.pop();
    showScreen(prevScreen);
  }
}

function updateBackButton() {
  const backBtn = document.getElementById('backBtn');
  const hideOnScreens = ['screen-frame', 'screen-success', 'screen-email'];

  if (state.history.length > 0 && !hideOnScreens.includes(state.currentScreen)) {
    backBtn.classList.remove('hidden');
  } else {
    backBtn.classList.add('hidden');
  }
}

function updateHeader() {
  const header = document.getElementById('mainHeader');
  const hideOnScreens = ['screen-configurator', 'screen-cart', 'screen-email', 'screen-success'];

  if (hideOnScreens.includes(state.currentScreen)) {
    header.style.display = 'none';
  } else {
    header.style.display = 'flex';
  }
}

function updateProgress() {
  const progressFill = document.getElementById('progressFill');
  const screenOrder = ['screen-frame', 'screen-configurator'];
  const currentIndex = screenOrder.indexOf(state.currentScreen);

  let progress = 0;
  if (currentIndex >= 0) {
    progress = ((currentIndex) / (screenOrder.length - 1)) * 100;
  }

  progressFill.style.width = `${progress}%`;

  document.querySelectorAll('.progress-step').forEach((step, index) => {
    step.classList.remove('active', 'completed');
    if (index === currentIndex) {
      step.classList.add('active');
    } else if (index < currentIndex) {
      step.classList.add('completed');
    }
  });
}

// ============================================
// Glass Toggle (in Configurator)
// ============================================

function setGlass(hasGlass) {
  state.hasGlass = hasGlass;

  // Update toggle buttons visual state
  document.querySelectorAll('.control-section .toggle-btn[data-value="with-glass"], .control-section .toggle-btn[data-value="no-glass"]').forEach(btn => {
    btn.classList.remove('active');
    if ((btn.dataset.value === 'with-glass' && hasGlass) || (btn.dataset.value === 'no-glass' && !hasGlass)) {
      btn.classList.add('active');
    }
  });

  // Update price and preview
  updateConfig();
  renderPreview();
}

// ============================================
// Screen 1: Frame Type Selection
// ============================================

function renderFrameGrid() {
  const grid = document.getElementById('frameGrid');
  if (!grid) return;

  grid.innerHTML = frameTypes.map(frame => {
    // Show price with glass (default) and price range
    const priceFrom = frame.priceNoGlass;
    const priceTo = frame.priceWithGlass;

    return `
      <div class="frame-card" onclick="selectFrameType('${frame.id}')" data-frame="${frame.id}">
        <div class="frame-image">
          <img src="${frame.image}" alt="${frame.name}" loading="lazy">
        </div>
        <div class="frame-info">
          <div class="frame-name">${frame.name}</div>
          <div class="frame-price">de la €${priceFrom}/m²</div>
          <div class="frame-benefit">${frame.benefit}</div>
        </div>
      </div>
    `;
  }).join('');
}

function selectFrameType(frameId) {
  const frame = frameTypes.find(f => f.id === frameId);
  if (!frame) return;

  state.frameType = frame;

  // Visual feedback
  document.querySelectorAll('.frame-card').forEach(card => {
    card.classList.remove('selected');
  });
  const selectedCard = document.querySelector(`.frame-card[data-frame="${frameId}"]`);
  if (selectedCard) {
    selectedCard.classList.add('selected');
  }

  // Advance after brief delay
  setTimeout(() => {
    goToScreen('screen-configurator');
    initConfigurator();
  }, 300);
}

// ============================================
// Screen 2: Configurator
// ============================================

function initConfigurator() {
  // Update header bar with just frame name
  const headerText = document.getElementById('configHeaderText');
  headerText.textContent = state.frameType.name;

  // Show/hide opening direction based on frame type
  const openingSection = document.getElementById('openingSection');
  if (state.frameType.hasOpening) {
    openingSection.style.display = 'block';
  } else {
    openingSection.style.display = 'none';
  }

  // Update glass toggle buttons based on current state
  document.querySelectorAll('.control-section .toggle-btn[data-value="with-glass"], .control-section .toggle-btn[data-value="no-glass"]').forEach(btn => {
    btn.classList.remove('active');
    if ((btn.dataset.value === 'with-glass' && state.hasGlass) || (btn.dataset.value === 'no-glass' && !state.hasGlass)) {
      btn.classList.add('active');
    }
  });

  // Reset current product if not editing
  if (state.editingProductIndex === null) {
    state.currentProduct = {
      width: null,
      height: null,
      color: 'Antracit',
      customColor: '',
      opening: 'Dreapta',
      quantity: 1
    };

    // Clear inputs
    document.getElementById('inputWidth').value = '';
    document.getElementById('inputHeight').value = '';
    document.getElementById('selectColor').value = 'Antracit';
    document.getElementById('inputCustomColor').value = '';
    document.getElementById('inputCustomColor').classList.add('hidden');
    document.getElementById('quantityValue').textContent = '1';

    // Reset opening buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.value === 'Dreapta') {
        btn.classList.add('active');
      }
    });
  } else {
    // Populate with existing product data for editing
    const product = state.cart[state.editingProductIndex];
    state.currentProduct = { ...product };

    document.getElementById('inputWidth').value = product.width || '';
    document.getElementById('inputHeight').value = product.height || '';
    document.getElementById('selectColor').value = product.color;
    document.getElementById('inputCustomColor').value = product.customColor || '';
    document.getElementById('quantityValue').textContent = product.quantity;

    if (product.color === 'Altă culoare') {
      document.getElementById('inputCustomColor').classList.remove('hidden');
    }

    document.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.value === product.opening) {
        btn.classList.add('active');
      }
    });
  }

  updateConfig();
  renderPreview();
}

function setPresetDimensions(width, height) {
  document.getElementById('inputWidth').value = width;
  document.getElementById('inputHeight').value = height;
  state.currentProduct.width = width;
  state.currentProduct.height = height;

  // Highlight active preset
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent === `${width}×${height}`) {
      btn.classList.add('active');
    }
  });

  updateConfig();
}

function setOpening(direction) {
  state.currentProduct.opening = direction;

  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.value === direction) {
      btn.classList.add('active');
    }
  });

  renderPreview();
}

function adjustQuantity(delta) {
  const newQty = Math.max(1, state.currentProduct.quantity + delta);
  state.currentProduct.quantity = newQty;
  document.getElementById('quantityValue').textContent = newQty;
  updateConfig();
}

function updateConfig() {
  const width = parseFloat(document.getElementById('inputWidth').value) || 0;
  const height = parseFloat(document.getElementById('inputHeight').value) || 0;
  const color = document.getElementById('selectColor').value;
  const customColor = document.getElementById('inputCustomColor').value;

  state.currentProduct.width = width;
  state.currentProduct.height = height;
  state.currentProduct.color = color;
  state.currentProduct.customColor = customColor;

  // Show/hide custom color input
  const customColorInput = document.getElementById('inputCustomColor');
  if (color === 'Altă culoare') {
    customColorInput.classList.remove('hidden');
  } else {
    customColorInput.classList.add('hidden');
  }

  // Calculate and display price
  const priceDisplay = document.getElementById('priceDisplay');
  const priceValue = document.getElementById('priceValue');
  const addBtn = document.getElementById('addProductBtn');

  if (width > 0 && height > 0) {
    const sqm = (width * height) / 10000;
    const unitPrice = state.hasGlass ? state.frameType.priceWithGlass : state.frameType.priceNoGlass;
    const total = sqm * unitPrice * state.currentProduct.quantity;

    priceValue.textContent = formatPrice(total);
    priceDisplay.classList.remove('hidden');
    addBtn.disabled = false;
  } else {
    priceDisplay.classList.add('hidden');
    addBtn.disabled = true;
  }

  // Clear preset highlights if dimensions don't match
  const presets = [[60, 60], [80, 120], [100, 150], [120, 180]];
  const matchesPreset = presets.some(([w, h]) => w === width && h === height);
  if (!matchesPreset) {
    document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
  }

  renderPreview();
}

function formatPrice(amount) {
  return '€' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function renderPreview() {
  const canvas = document.getElementById('previewCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';

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

  const inputW = state.currentProduct.width || 100;
  const inputH = state.currentProduct.height || 100;
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

  // Draw frame
  ctx.fillStyle = frameFillColor;
  ctx.fillRect(startX, startY, drawW, drawH);

  // Draw glass (if has glass)
  if (state.hasGlass) {
    const glassGradient = ctx.createLinearGradient(innerX, innerY, innerX, innerY + innerH);
    glassGradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    glassGradient.addColorStop(1, 'rgba(200, 200, 220, 0.08)');
    ctx.fillStyle = glassGradient;
    ctx.fillRect(innerX, innerY, innerW, innerH);
  }

  ctx.strokeStyle = mainColor;
  ctx.strokeRect(startX, startY, drawW, drawH);

  const typeId = state.frameType?.id || 'fixed';

  if (typeId === 'slide') {
    const midX = innerX + (innerW / 2);
    ctx.strokeRect(innerX, innerY, innerW / 2, innerH);
    ctx.strokeRect(midX, innerY, innerW / 2, innerH);
    ctx.beginPath();
    ctx.moveTo(startX, startY + drawH - (frameThick / 3));
    ctx.lineTo(startX + drawW, startY + drawH - (frameThick / 3));
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.stroke();
    ctx.strokeStyle = mainColor;
  } else {
    ctx.strokeRect(innerX, innerY, innerW, innerH);
  }

  // Draw opening indicators
  if (state.frameType?.hasOpening) {
    ctx.beginPath();
    const isLeft = state.currentProduct.opening === 'Stânga';

    if (['classic', 'door_simple', 'tilt_turn'].includes(typeId)) {
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

    if (typeId === 'tilt_turn') {
      ctx.moveTo(innerX, innerY + innerH);
      ctx.lineTo(innerX + (innerW / 2), innerY);
      ctx.lineTo(innerX + innerW, innerY + innerH);
    }
    ctx.stroke();

    // Sliding door arrows
    if (typeId === 'slide') {
      const arrowY = innerY + (innerH / 2);
      const arrowLen = Math.min(innerW, innerH) * 0.15;
      const arrowHeadSize = arrowLen * 0.4;

      let arrowStartX, arrowEndX;

      if (isLeft) {
        const paneCenter = innerX + (innerW / 4);
        arrowStartX = paneCenter - (arrowLen / 2);
        arrowEndX = paneCenter + (arrowLen / 2);

        ctx.beginPath();
        ctx.moveTo(arrowStartX, arrowY);
        ctx.lineTo(arrowEndX, arrowY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(arrowEndX, arrowY);
        ctx.lineTo(arrowEndX - arrowHeadSize, arrowY - (arrowHeadSize / 2));
        ctx.lineTo(arrowEndX - arrowHeadSize, arrowY + (arrowHeadSize / 2));
        ctx.fillStyle = mainColor;
        ctx.fill();
      } else {
        const paneCenter = innerX + innerW - (innerW / 4);
        arrowStartX = paneCenter + (arrowLen / 2);
        arrowEndX = paneCenter - (arrowLen / 2);

        ctx.beginPath();
        ctx.moveTo(arrowStartX, arrowY);
        ctx.lineTo(arrowEndX, arrowY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(arrowEndX, arrowY);
        ctx.lineTo(arrowEndX + arrowHeadSize, arrowY - (arrowHeadSize / 2));
        ctx.lineTo(arrowEndX + arrowHeadSize, arrowY + (arrowHeadSize / 2));
        ctx.fillStyle = mainColor;
        ctx.fill();
      }
    }

    // Draw handle
    ctx.fillStyle = handleColor;

    if (typeId === 'slide') {
      const handleH = innerH * 0.4;
      const handleW = Math.max(4, innerW * 0.015);
      const handleY = innerY + (innerH / 2) - (handleH / 2);
      let handleX;

      if (isLeft) {
        handleX = innerX + (innerW / 4) - (handleW / 2);
      } else {
        handleX = innerX + innerW - (innerW / 4) - (handleW / 2);
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
      ctx.roundRect(handleX, handleY, handleW, handleH, handleW / 2);
      ctx.fill();
    }
  }

  // Draw dimensions
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '12px Geist, sans-serif';
  ctx.textAlign = 'center';

  // Width dimension
  ctx.fillText(`${inputW} cm`, startX + drawW / 2, startY + drawH + 25);

  // Height dimension
  ctx.save();
  ctx.translate(startX - 15, startY + drawH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(`${inputH} cm`, 0, 0);
  ctx.restore();
}

// ============================================
// Cart Management
// ============================================

function addToCart() {
  const sqm = (state.currentProduct.width * state.currentProduct.height) / 10000;
  const unitPrice = state.hasGlass ? state.frameType.priceWithGlass : state.frameType.priceNoGlass;
  const calculatedPrice = sqm * unitPrice * state.currentProduct.quantity;

  const product = {
    frameType: state.frameType,
    frameId: state.frameType.id,
    frameName: state.frameType.name,
    hasGlass: state.hasGlass,
    width: state.currentProduct.width,
    height: state.currentProduct.height,
    color: state.currentProduct.color,
    customColor: state.currentProduct.customColor,
    opening: state.frameType.hasOpening ? state.currentProduct.opening : null,
    quantity: state.currentProduct.quantity,
    calculatedPrice: calculatedPrice
  };

  if (state.editingProductIndex !== null) {
    // Update existing product
    state.cart[state.editingProductIndex] = product;
    state.editingProductIndex = null;
  } else {
    // Add new product
    state.cart.push(product);
  }

  goToScreen('screen-cart');
  renderCart();
}

function renderCart() {
  const container = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');

  if (state.cart.length === 0) {
    container.innerHTML = '<div class="cart-empty">Coșul este gol</div>';
    totalEl.textContent = '€0';
    return;
  }

  container.innerHTML = state.cart.map((product, index) => {
    const glassText = product.hasGlass ? 'Cu sticlă' : 'Fără sticlă';
    const openingText = product.opening ? ` · ${product.opening}` : '';
    const colorText = product.color === 'Altă culoare' && product.customColor
      ? product.customColor
      : product.color;

    return `
      <div class="cart-item">
        <div class="cart-item-main">
          <div class="cart-item-title">
            ${product.frameName} × ${product.quantity}
          </div>
          <div class="cart-item-details">
            ${product.width}×${product.height} cm · ${glassText} · ${colorText}${openingText}
          </div>
        </div>
        <div class="cart-item-price">${formatPrice(product.calculatedPrice)}</div>
        <div class="cart-item-actions">
          <button class="cart-action-btn" onclick="editProduct(${index})">Editează</button>
          <button class="cart-action-btn" onclick="removeProduct(${index})">Șterge</button>
        </div>
      </div>
    `;
  }).join('');

  // Calculate total
  const total = state.cart.reduce((sum, p) => sum + p.calculatedPrice, 0);
  totalEl.textContent = formatPrice(total);

  // Show/hide incentive message based on total
  const incentiveEl = document.getElementById('cartIncentive');
  const incentiveUnlockedEl = document.getElementById('cartIncentiveUnlocked');
  if (incentiveEl && incentiveUnlockedEl) {
    if (total > 0 && total < 5000) {
      incentiveEl.classList.remove('hidden');
      incentiveUnlockedEl.classList.add('hidden');
    } else if (total >= 5000) {
      incentiveEl.classList.add('hidden');
      incentiveUnlockedEl.classList.remove('hidden');
    } else {
      incentiveEl.classList.add('hidden');
      incentiveUnlockedEl.classList.add('hidden');
    }
  }

  // Populate hidden form inputs for Webflow
  const productsString = state.cart.map((product) => {
    const glassText = product.hasGlass ? 'Cu sticlă' : 'Fără sticlă';
    const openingText = product.opening ? ` - ${product.opening}` : '';
    const colorText = product.color === 'Altă culoare' && product.customColor
      ? product.customColor
      : product.color;
    return `${product.quantity}x ${product.frameName} - ${glassText} - ${colorText}${openingText} - ${product.width}x${product.height}cm - €${product.calculatedPrice.toFixed(2)}`;
  }).join(' | ');

  // Populate the form fields with cart data
  populateFormFields(productsString, total);
}

function populateFormFields(productsString, total) {
  let formProducts = document.getElementById('formProducts');
  let formTotal = document.getElementById('formTotal');

  // If fields don't exist, try to initialize form and retry
  if (!formProducts || !formTotal) {
    console.log('[Cart] Form fields not found, initializing form...');
    initWebflowForm();

    // Check again after a short delay (form might need time to initialize)
    setTimeout(() => {
      formProducts = document.getElementById('formProducts');
      formTotal = document.getElementById('formTotal');

      if (formProducts) {
        formProducts.value = productsString;
        console.log('[Cart] Set formProducts (delayed):', productsString);
      }
      if (formTotal) {
        formTotal.value = total.toFixed(2);
        console.log('[Cart] Set formTotal (delayed):', total.toFixed(2));
      }
    }, 200);
    return;
  }

  formProducts.value = productsString;
  formTotal.value = total.toFixed(2);
  console.log('[Cart] Set form fields - products:', productsString, 'total:', total.toFixed(2));
}

function editProduct(index) {
  const product = state.cart[index];

  // Set state for editing
  state.editingProductIndex = index;
  state.hasGlass = product.hasGlass;
  state.frameType = product.frameType;
  state.currentProduct = {
    width: product.width,
    height: product.height,
    color: product.color,
    customColor: product.customColor,
    opening: product.opening || 'Dreapta',
    quantity: product.quantity
  };

  goToScreen('screen-configurator');
  initConfigurator();
}

function removeProduct(index) {
  state.cart.splice(index, 1);
  renderCart();
}

function addAnotherProduct() {
  // Reset for new product
  state.editingProductIndex = null;
  state.hasGlass = true;  // Reset to default (with glass)
  state.frameType = null;
  state.currentProduct = {
    width: null,
    height: null,
    color: 'Antracit',
    customColor: '',
    opening: 'Dreapta',
    quantity: 1
  };

  goToScreen('screen-frame');
}

// ============================================
// Qualification Questions
// ============================================

function goToQualification() {
  // Go directly to form with all UTMs
  submitToForm();
}

function selectProjectType(type) {
  state.projectType = type;

  // Visual feedback
  document.querySelectorAll('#screen-q1 .option-card').forEach(card => {
    card.classList.remove('selected');
  });
  const selectedCard = document.querySelector(`#screen-q1 .option-card[data-value="${type}"]`);
  if (selectedCard) {
    selectedCard.classList.add('selected');
  }

  setTimeout(() => {
    goToScreen('screen-q2');
  }, 300);
}

function showEmailCapture() {
  goToScreen('screen-email');
}

function selectTimeline(timeline) {
  state.timeline = timeline;

  // Visual feedback
  document.querySelectorAll('#screen-q2 .option-card').forEach(card => {
    card.classList.remove('selected');
  });
  const selectedCard = document.querySelector(`#screen-q2 .option-card[data-value="${timeline}"]`);
  if (selectedCard) {
    selectedCard.classList.add('selected');
  }

  setTimeout(() => {
    goToScreen('screen-q3');
    autoHighlightScope();
  }, 300);
}

function autoHighlightScope() {
  // Calculate total quantity in cart
  const totalQty = state.cart.reduce((sum, p) => sum + p.quantity, 0);

  // Remove all highlights first
  document.querySelectorAll('#screen-q3 .option-card').forEach(card => {
    card.classList.remove('suggested');
  });

  // Add suggested class based on quantity
  let suggestedId = 'scope-small';
  if (totalQty > 15) {
    suggestedId = 'scope-large';
  } else if (totalQty > 5) {
    suggestedId = 'scope-medium';
  }

  const suggestedCard = document.getElementById(suggestedId);
  if (suggestedCard) {
    suggestedCard.classList.add('suggested');
  }
}

function selectScope(scope) {
  state.scope = scope;

  // Visual feedback
  document.querySelectorAll('#screen-q3 .option-card').forEach(card => {
    card.classList.remove('selected');
  });
  const selectedCard = document.querySelector(`#screen-q3 .option-card[data-value="${scope}"]`);
  if (selectedCard) {
    selectedCard.classList.add('selected');
  }

  setTimeout(() => {
    submitToForm();
  }, 300);
}

// ============================================
// Form Submission
// ============================================

function submitToForm() {
  const params = new URLSearchParams();

  // Products data - format: "2x Oscilobatantă - Cu sticlă - Antracit - Dreapta - 120x180cm - €1,854.00"
  const productsString = state.cart.map((product) => {
    const glassText = product.hasGlass ? 'Cu sticlă' : 'Fără sticlă';
    const openingText = product.opening ? ` - ${product.opening}` : '';
    const colorText = product.color === 'Altă culoare' && product.customColor
      ? product.customColor
      : product.color;

    return `${product.quantity}x ${product.frameName} - ${glassText} - ${colorText}${openingText} - ${product.width}x${product.height}cm - €${product.calculatedPrice.toFixed(2)}`;
  }).join(' | ');

  const total = state.cart.reduce((sum, p) => sum + p.calculatedPrice, 0);

  params.set('PRODUCTS', productsString);
  params.set('TOTAL', total.toFixed(2));

  window.location.href = `/design/form?${params.toString()}`;
}

function submitEmail(event) {
  event.preventDefault();
  const email = document.getElementById('emailInput').value;

  // Here you would normally send the email to your backend
  console.log('Email captured:', email);

  // Show success or redirect
  goToScreen('screen-success');
}

// ============================================
// Webflow Form Integration
// ============================================

function initWebflowForm() {
  console.log('[Form] Looking for cart-form-block...');

  // Find the Webflow form block by ID
  const formBlock = document.getElementById('cart-form-block');
  if (!formBlock) {
    console.log('[Form] cart-form-block not found, retrying in 100ms...');
    setTimeout(initWebflowForm, 100);
    return;
  }
  console.log('[Form] Found formBlock:', formBlock);

  // Find the cart container where we want to place the form
  const cartContainer = document.querySelector('#screen-cart .cart-container');
  if (!cartContainer) {
    console.log('[Form] ERROR: #screen-cart .cart-container not found!');
    return;
  }
  console.log('[Form] Found cart-container:', cartContainer);

  // Check if already moved
  if (formBlock.parentElement === cartContainer) {
    console.log('[Form] Already moved, skipping.');
    return;
  }

  // Move the entire form block into the cart screen
  cartContainer.appendChild(formBlock);
  console.log('[Form] SUCCESS: Moved form into cart-container!');

  // Get the form element
  const form = document.getElementById('cart-form');
  if (!form) return;

  // Clear ALL Webflow fields - we'll create everything ourselves
  const formWrapper = form.querySelector('.form-wrap, #cart-form-wrapper');
  if (formWrapper) {
    formWrapper.innerHTML = '';
  } else {
    // No wrapper, clear form directly but keep form attributes
    while (form.firstChild) {
      if (form.firstChild.classList && form.firstChild.classList.contains('w-form-done')) break;
      form.removeChild(form.firstChild);
    }
  }

  // Create form container
  const container = formWrapper || form;
  container.className = 'cart-form-fields';

  // Create all form fields via JS
  const fields = [
    { type: 'text', name: 'name', id: 'name', placeholder: 'Nume complet', required: true },
    { type: 'email', name: 'email', id: 'email', placeholder: 'Email', required: true },
    { type: 'tel', name: 'phone', id: 'phone', placeholder: 'Telefon', required: true },
    { type: 'select', name: 'timeline', id: 'timeline', placeholder: 'Când aveți nevoie?', options: [
      { value: '', label: 'Când aveți nevoie?', disabled: true, selected: true },
      { value: 'Urgent (< 2 săptămâni)', label: 'Urgent (< 2 săptămâni)' },
      { value: '1-2 luni', label: '1-2 luni' },
      { value: '3-6 luni', label: '3-6 luni' },
      { value: 'Doar explorez', label: 'Doar explorez' }
    ]}
  ];

  fields.forEach(field => {
    if (field.type === 'select') {
      const select = document.createElement('select');
      select.name = field.name;
      select.id = field.id;
      select.setAttribute('data-name', field.name);
      select.className = 'form-field form-select';
      field.options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        if (opt.disabled) option.disabled = true;
        if (opt.selected) option.selected = true;
        select.appendChild(option);
      });
      container.appendChild(select);
    } else {
      const input = document.createElement('input');
      input.type = field.type;
      input.name = field.name;
      input.id = field.id;
      input.setAttribute('data-name', field.name);
      input.placeholder = field.placeholder;
      input.className = 'form-field';
      if (field.required) input.required = true;
      container.appendChild(input);
    }
  });

  // Hidden fields for cart data - visible but tiny (Webflow needs to "see" them)
  const hiddenProducts = document.createElement('input');
  hiddenProducts.type = 'text';
  hiddenProducts.name = 'products';
  hiddenProducts.id = 'formProducts';
  hiddenProducts.setAttribute('data-name', 'products');
  hiddenProducts.className = 'form-field';
  hiddenProducts.style.cssText = 'height:1px;padding:0;margin:0;border:0;opacity:0.01;position:absolute;';
  container.appendChild(hiddenProducts);

  const hiddenTotal = document.createElement('input');
  hiddenTotal.type = 'text';
  hiddenTotal.name = 'total';
  hiddenTotal.id = 'formTotal';
  hiddenTotal.setAttribute('data-name', 'total');
  hiddenTotal.className = 'form-field';
  hiddenTotal.style.cssText = 'height:1px;padding:0;margin:0;border:0;opacity:0.01;position:absolute;';
  container.appendChild(hiddenTotal);

  // Create submit button
  const submitBtn = document.createElement('input');
  submitBtn.type = 'submit';
  submitBtn.value = 'PRIMEȘTE OFERTA';
  submitBtn.id = 'btn-submit';
  submitBtn.className = 'form-submit';
  container.appendChild(submitBtn);

  // Add submit event listener to inject cart data right before submission
  form.addEventListener('submit', function(e) {
    console.log('[Form] Submit triggered, injecting cart data...');

    const productsString = state.cart.map((product) => {
      const glassText = product.hasGlass ? 'Cu sticlă' : 'Fără sticlă';
      const openingText = product.opening ? ` - ${product.opening}` : '';
      const colorText = product.color === 'Altă culoare' && product.customColor
        ? product.customColor
        : product.color;
      return `${product.quantity}x ${product.frameName} - ${glassText} - ${colorText}${openingText} - ${product.width}x${product.height}cm - €${product.calculatedPrice.toFixed(2)}`;
    }).join(' | ');

    const total = state.cart.reduce((sum, p) => sum + p.calculatedPrice, 0);

    hiddenProducts.value = productsString;
    hiddenTotal.value = total.toFixed(2);

    console.log('[Form] Injected products:', productsString);
    console.log('[Form] Injected total:', total.toFixed(2));
  });

  console.log('[Form] Created all form fields via JS');

  // Remove the outer Webflow container if it's now empty
  const outerContainer = document.querySelector('.w-layout-blockcontainer.w-container');
  if (outerContainer && outerContainer.children.length === 0) {
    outerContainer.remove();
    console.log('[Form] Removed empty outer container');
  }
}

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  updateProgress();
  updateBackButton();
  updateHeader();

  // Render frame grid on initial load (now the first screen)
  renderFrameGrid();

  // Initialize Webflow form integration
  initWebflowForm();

  // Handle window resize for canvas
  window.addEventListener('resize', () => {
    if (state.currentScreen === 'screen-configurator') {
      renderPreview();
    }
  });
});
