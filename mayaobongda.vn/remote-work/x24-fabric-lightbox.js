(function () {
  'use strict';

  var triggers = Array.prototype.slice.call(
    document.querySelectorAll('.x24-fabric-card-media img')
  );

  if (!triggers.length) {
    return;
  }

  var dialog = document.createElement('div');
  dialog.className = 'x24-fabric-lightbox';
  dialog.hidden = true;
  dialog.innerHTML =
    '<div class="x24-fabric-lightbox__toolbar">' +
      '<button class="x24-fabric-lightbox__button" type="button" data-action="zoom-out" aria-label="Thu nhỏ ảnh">−</button>' +
      '<span class="x24-fabric-lightbox__zoom" aria-live="polite">100%</span>' +
      '<button class="x24-fabric-lightbox__button" type="button" data-action="zoom-in" aria-label="Phóng to ảnh">+</button>' +
      '<button class="x24-fabric-lightbox__button" type="button" data-action="reset" aria-label="Đưa ảnh về kích thước ban đầu">↺</button>' +
      '<button class="x24-fabric-lightbox__button" type="button" data-action="close" aria-label="Đóng ảnh">×</button>' +
    '</div>' +
    '<div class="x24-fabric-lightbox__stage">' +
      '<img class="x24-fabric-lightbox__image" alt="" draggable="false">' +
    '</div>' +
    '<p class="x24-fabric-lightbox__hint">Dùng nút +/− hoặc con lăn để thu phóng. Kéo ảnh khi đã phóng to.</p>';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-label', 'Xem ảnh chất liệu vải');
  document.body.appendChild(dialog);

  var stage = dialog.querySelector('.x24-fabric-lightbox__stage');
  var image = dialog.querySelector('.x24-fabric-lightbox__image');
  var zoomLabel = dialog.querySelector('.x24-fabric-lightbox__zoom');
  var zoomInButton = dialog.querySelector('[data-action="zoom-in"]');
  var zoomOutButton = dialog.querySelector('[data-action="zoom-out"]');
  var closeButton = dialog.querySelector('[data-action="close"]');
  var scale = 1;
  var translateX = 0;
  var translateY = 0;
  var dragStart = null;
  var opener = null;

  function render() {
    image.style.transform =
      'translate3d(' + translateX + 'px, ' + translateY + 'px, 0) scale(' + scale + ')';
    zoomLabel.textContent = Math.round(scale * 100) + '%';
    zoomOutButton.disabled = scale <= 1;
    zoomInButton.disabled = scale >= 4;
  }

  function setScale(nextScale) {
    scale = Math.min(4, Math.max(1, Math.round(nextScale * 4) / 4));
    if (scale === 1) {
      translateX = 0;
      translateY = 0;
    }
    render();
  }

  function reset() {
    scale = 1;
    translateX = 0;
    translateY = 0;
    render();
  }

  function open(trigger) {
    opener = trigger;
    image.src = trigger.currentSrc || trigger.src;
    image.alt = trigger.alt || 'Ảnh chất liệu vải';
    reset();
    dialog.hidden = false;
    document.body.classList.add('x24-fabric-lightbox-open');
    closeButton.focus();
  }

  function close() {
    dialog.hidden = true;
    document.body.classList.remove('x24-fabric-lightbox-open');
    image.removeAttribute('src');
    if (opener) {
      opener.focus();
    }
  }

  triggers.forEach(function (trigger) {
    trigger.setAttribute('role', 'button');
    trigger.setAttribute('tabindex', '0');
    trigger.setAttribute('aria-label', 'Xem ảnh lớn: ' + (trigger.alt || 'chất liệu vải'));

    trigger.addEventListener('click', function () {
      open(trigger);
    });

    trigger.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open(trigger);
      }
    });
  });

  dialog.addEventListener('click', function (event) {
    var action = event.target.closest('[data-action]');
    if (action) {
      if (action.dataset.action === 'zoom-in') {
        setScale(scale + 0.5);
      } else if (action.dataset.action === 'zoom-out') {
        setScale(scale - 0.5);
      } else if (action.dataset.action === 'reset') {
        reset();
      } else if (action.dataset.action === 'close') {
        close();
      }
      return;
    }

    if (event.target === dialog || event.target === stage) {
      close();
    }
  });

  stage.addEventListener('wheel', function (event) {
    event.preventDefault();
    setScale(scale + (event.deltaY < 0 ? 0.25 : -0.25));
  }, { passive: false });

  stage.addEventListener('pointerdown', function (event) {
    if (scale <= 1) {
      return;
    }
    dragStart = {
      pointerId: event.pointerId,
      x: event.clientX - translateX,
      y: event.clientY - translateY
    };
    image.classList.add('is-dragging');
    stage.setPointerCapture(event.pointerId);
  });

  stage.addEventListener('pointermove', function (event) {
    if (!dragStart || dragStart.pointerId !== event.pointerId) {
      return;
    }
    translateX = event.clientX - dragStart.x;
    translateY = event.clientY - dragStart.y;
    render();
  });

  function stopDragging(event) {
    if (!dragStart || dragStart.pointerId !== event.pointerId) {
      return;
    }
    dragStart = null;
    image.classList.remove('is-dragging');
  }

  stage.addEventListener('pointerup', stopDragging);
  stage.addEventListener('pointercancel', stopDragging);
  image.addEventListener('dblclick', reset);

  document.addEventListener('keydown', function (event) {
    if (dialog.hidden) {
      return;
    }
    if (event.key === 'Escape') {
      close();
    } else if (event.key === '+' || event.key === '=') {
      setScale(scale + 0.5);
    } else if (event.key === '-') {
      setScale(scale - 0.5);
    } else if (event.key === '0') {
      reset();
    }
  });
})();
