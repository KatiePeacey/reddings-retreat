function scrollGallery(direction) {
  var track = document.getElementById('galleryTrack');
  var tile = track.querySelector('.gallery-tile');
  if (!track || !tile) return;
  var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 18);
  var step = tile.getBoundingClientRect().width + gap;
  track.scrollBy({ left: direction * step, behavior: 'smooth' });
}

function openLightbox(src, alt) {
  var lb = document.getElementById('lightbox');
  var img = document.getElementById('lightboxImg');
  img.src = src;
  img.alt = alt || '';
  lb.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function toggleNav() {
  var nav = document.getElementById('navLinks');
  var btn = document.querySelector('.burger');
  var isOpen = nav.classList.toggle('nav-open');
  if (btn) btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

/* ---- Availability calendar ---- */
/* Busy dates are pre-fetched from Airbnb's iCal feeds by a scheduled
   GitHub Actions workflow (see .github/workflows/update-availability.yml)
   and written to data/availability.json. That keeps this a fully static
   site — no server or database needed at request time. */

var availState = {
  stay: 'warren',
  viewYear: new Date().getFullYear(),
  viewMonth: new Date().getMonth(), // 0-based
  busy: [], // [{start:'YYYYMMDD', end:'YYYYMMDD'}, ...]
  allBusy: null // full {warren:[...], burrow:[...], farmhouse:[...]} once loaded
};

function setAvailStay(stay, btn) {
  availState.stay = stay;
  document.querySelectorAll('.avail-tab').forEach(function (t) { t.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  applyAvailBusyDates();
}

function shiftAvailMonth(delta) {
  availState.viewMonth += delta;
  if (availState.viewMonth < 0) { availState.viewMonth = 11; availState.viewYear--; }
  if (availState.viewMonth > 11) { availState.viewMonth = 0; availState.viewYear++; }
  renderAvailCalendar();
}

function loadAvailBusyDates() {
  fetch('data/availability.json', { cache: 'no-store' })
    .then(function (res) { return res.ok ? res.json() : {}; })
    .then(function (data) {
      availState.allBusy = data || {};
      applyAvailBusyDates();
    })
    .catch(function () {
      availState.allBusy = {};
      applyAvailBusyDates();
    });
}

function applyAvailBusyDates() {
  availState.busy = (availState.allBusy && availState.allBusy[availState.stay]) || [];
  renderAvailCalendar();
}

function icalToDate(s) {
  // s = 'YYYYMMDD'
  return new Date(parseInt(s.substring(0, 4), 10), parseInt(s.substring(4, 6), 10) - 1, parseInt(s.substring(6, 8), 10));
}

function isDateBusy(y, m, d) {
  var target = new Date(y, m, d).getTime();
  for (var i = 0; i < availState.busy.length; i++) {
    var start = icalToDate(availState.busy[i].start).getTime();
    var end = icalToDate(availState.busy[i].end).getTime();
    if (target >= start && target < end) return true;
  }
  return false;
}

function renderAvailCalendar() {
  var monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var y = availState.viewYear, m = availState.viewMonth;
  var label = document.getElementById('availMonthLabel');
  if (label) label.textContent = monthNames[m] + ' ' + y;

  var grid = document.getElementById('availCalGrid');
  if (!grid) return;
  grid.innerHTML = '';

  var firstDay = new Date(y, m, 1).getDay(); // 0=Sun
  var leadingBlanks = (firstDay === 0) ? 6 : firstDay - 1; // Monday-start
  var daysInMonth = new Date(y, m + 1, 0).getDate();
  var today = new Date();

  for (var i = 0; i < leadingBlanks; i++) {
    var blank = document.createElement('span');
    blank.className = 'day empty';
    grid.appendChild(blank);
  }

  for (var d = 1; d <= daysInMonth; d++) {
    var cell = document.createElement('span');
    cell.className = 'day';
    cell.textContent = d;
    if (isDateBusy(y, m, d)) cell.className += ' busy';
    if (y === today.getFullYear() && m === today.getMonth() && d === today.getDate()) {
      cell.className += ' today';
    }
    grid.appendChild(cell);
  }
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
  document.getElementById('lightboxImg').src = '';
  document.body.style.overflow = '';
}

document.getElementById('year').textContent = new Date().getFullYear();

document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('availCalGrid')) {
    loadAvailBusyDates();
  }
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeLightbox();
});

document.querySelectorAll('.stay-thumbs img, .gallery-tile img, .stay-card-photo img').forEach(function (img) {
  img.addEventListener('click', function (e) {
    e.stopPropagation();
    openLightbox(img.src, img.alt);
  });
});

document.querySelectorAll('#navLinks a').forEach(function (link) {
  link.addEventListener('click', function () {
    document.getElementById('navLinks').classList.remove('nav-open');
    var btn = document.querySelector('.burger');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  });
});
