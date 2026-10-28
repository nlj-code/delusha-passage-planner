/* Delusha Passage Planner — Main Application (Chart, UI, Gestures, Offline State) */

(function () {
  'use strict';

  const STORAGE_KEY = 'passplan_passage_planner_v2';
  const MED_BOUNDS = { minLon: -8, maxLon: 38, minLat: 29, maxLat: 47 };
  const FULL_LON_SPAN = MED_BOUNDS.maxLon - MED_BOUNDS.minLon; // 46 deg
  const MAX_LON_SPAN = FULL_LON_SPAN * 1.4; // ~64.4 deg
  const MIN_LON_SPAN = FULL_LON_SPAN / 60; // ~0.7667 deg (~15 nm view)

  // Preset Mediterranean ports from specification
  const PRESET_PORTS = [
    { id: 'porto-montenegro', name: 'Porto Montenegro', country: 'Montenegro', lat: 42.433, lon: 18.692 },
    { id: 'kotor', name: 'Kotor', country: 'Montenegro', lat: 42.424, lon: 18.769 },
    { id: 'budva', name: 'Budva', country: 'Montenegro', lat: 42.278, lon: 18.837 },
    { id: 'dubrovnik', name: 'Dubrovnik', country: 'Croatia', lat: 42.660, lon: 18.080 },
    { id: 'korcula', name: 'Korčula', country: 'Croatia', lat: 42.962, lon: 17.135 },
    { id: 'hvar', name: 'Hvar', country: 'Croatia', lat: 43.172, lon: 16.441 },
    { id: 'split', name: 'Split', country: 'Croatia', lat: 43.503, lon: 16.437 },
    { id: 'sibenik', name: 'Šibenik', country: 'Croatia', lat: 43.734, lon: 15.889 },
    { id: 'zadar', name: 'Zadar', country: 'Croatia', lat: 44.117, lon: 15.224 },
    { id: 'venice', name: 'Venice', country: 'Italy', lat: 45.430, lon: 12.340 },
    { id: 'bari', name: 'Bari', country: 'Italy', lat: 41.130, lon: 16.870 },
    { id: 'brindisi', name: 'Brindisi', country: 'Italy', lat: 40.645, lon: 17.950 },
    { id: 'corfu', name: 'Corfu', country: 'Greece', lat: 39.650, lon: 19.850 },
    { id: 'paxos', name: 'Paxos', country: 'Greece', lat: 39.196, lon: 20.186 },
    { id: 'preveza', name: 'Preveza', country: 'Greece', lat: 38.958, lon: 20.752 },
    { id: 'lefkada', name: 'Lefkada', country: 'Greece', lat: 38.833, lon: 20.712 },
    { id: 'fiskardo', name: 'Fiskardo', country: 'Greece', lat: 38.459, lon: 20.577 },
    { id: 'argostoli', name: 'Argostoli', country: 'Greece', lat: 38.180, lon: 20.490 },
    { id: 'zakynthos', name: 'Zakynthos', country: 'Greece', lat: 37.780, lon: 20.900 },
    { id: 'pylos', name: 'Pylos', country: 'Greece', lat: 36.913, lon: 21.696 },
    { id: 'kalamata', name: 'Kalamata', country: 'Greece', lat: 37.020, lon: 22.110 },
    { id: 'monemvasia', name: 'Monemvasia', country: 'Greece', lat: 36.687, lon: 23.057 },
    { id: 'hydra', name: 'Hydra', country: 'Greece', lat: 37.350, lon: 23.467 },
    { id: 'athens-alimos', name: 'Athens (Alimos)', country: 'Greece', lat: 37.910, lon: 23.710 },
    { id: 'mykonos', name: 'Mykonos', country: 'Greece', lat: 37.450, lon: 25.330 },
    { id: 'paros', name: 'Paros', country: 'Greece', lat: 37.085, lon: 25.150 },
    { id: 'santorini', name: 'Santorini', country: 'Greece', lat: 36.420, lon: 25.430 },
    { id: 'chania', name: 'Chania', country: 'Greece', lat: 35.520, lon: 24.020 },
    { id: 'heraklion', name: 'Heraklion', country: 'Greece', lat: 35.345, lon: 25.140 },
    { id: 'rhodes', name: 'Rhodes', country: 'Greece', lat: 36.450, lon: 28.230 },
    { id: 'bodrum', name: 'Bodrum', country: 'Türkiye', lat: 37.030, lon: 27.430 },
    { id: 'gocek', name: 'Göcek', country: 'Türkiye', lat: 36.750, lon: 28.940 },
    { id: 'kas', name: 'Kaş', country: 'Türkiye', lat: 36.198, lon: 29.640 },
    { id: 'limassol', name: 'Limassol', country: 'Cyprus', lat: 34.670, lon: 33.040 },
    { id: 'valletta', name: 'Valletta', country: 'Malta', lat: 35.900, lon: 14.510 },
    { id: 'syracuse', name: 'Syracuse', country: 'Italy', lat: 37.060, lon: 15.290 },
    { id: 'taormina', name: 'Taormina', country: 'Italy', lat: 37.820, lon: 15.270 },
    { id: 'messina', name: 'Messina', country: 'Italy', lat: 38.190, lon: 15.560 },
    { id: 'lipari', name: 'Lipari', country: 'Italy', lat: 38.465, lon: 14.960 },
    { id: 'palermo', name: 'Palermo', country: 'Italy', lat: 38.120, lon: 13.370 },
    { id: 'capri', name: 'Capri', country: 'Italy', lat: 40.556, lon: 14.240 },
    { id: 'amalfi', name: 'Amalfi', country: 'Italy', lat: 40.633, lon: 14.600 },
    { id: 'naples', name: 'Naples', country: 'Italy', lat: 40.835, lon: 14.250 },
    { id: 'ponza', name: 'Ponza', country: 'Italy', lat: 40.895, lon: 12.965 },
    { id: 'porto-cervo', name: 'Porto Cervo', country: 'Italy', lat: 41.135, lon: 9.540 },
    { id: 'cagliari', name: 'Cagliari', country: 'Italy', lat: 39.210, lon: 9.110 },
    { id: 'bonifacio', name: 'Bonifacio', country: 'France', lat: 41.387, lon: 9.160 },
    { id: 'ajaccio', name: 'Ajaccio', country: 'France', lat: 41.920, lon: 8.740 },
    { id: 'calvi', name: 'Calvi', country: 'France', lat: 42.567, lon: 8.757 },
    { id: 'portofino', name: 'Portofino', country: 'Italy', lat: 44.300, lon: 9.210 },
    { id: 'genoa', name: 'Genoa', country: 'Italy', lat: 44.410, lon: 8.920 },
    { id: 'monaco', name: 'Monaco', country: 'Monaco', lat: 43.735, lon: 7.425 },
    { id: 'antibes', name: 'Antibes', country: 'France', lat: 43.585, lon: 7.130 },
    { id: 'cannes', name: 'Cannes', country: 'France', lat: 43.550, lon: 7.015 },
    { id: 'saint-tropez', name: 'Saint-Tropez', country: 'France', lat: 43.270, lon: 6.640 },
    { id: 'marseille', name: 'Marseille', country: 'France', lat: 43.295, lon: 5.360 },
    { id: 'barcelona', name: 'Barcelona', country: 'Spain', lat: 41.375, lon: 2.180 },
    { id: 'mahon', name: 'Mahón', country: 'Spain', lat: 39.885, lon: 4.270 },
    { id: 'palma', name: 'Palma', country: 'Spain', lat: 39.565, lon: 2.635 },
    { id: 'ibiza', name: 'Ibiza', country: 'Spain', lat: 38.910, lon: 1.440 },
    { id: 'javea', name: 'Jávea', country: 'Spain', lat: 38.795, lon: 0.190 },
    { id: 'valencia', name: 'Valencia', country: 'Spain', lat: 39.450, lon: -0.320 },
    { id: 'cartagena', name: 'Cartagena', country: 'Spain', lat: 37.590, lon: -0.980 },
    { id: 'malaga', name: 'Málaga', country: 'Spain', lat: 36.715, lon: -4.415 },
    { id: 'gibraltar', name: 'Gibraltar', country: 'Gibraltar', lat: 36.140, lon: -5.355 },
    { id: 'tunis', name: 'Tunis', country: 'Tunisia', lat: 36.810, lon: 10.300 }
  ];

  // Mercator projection helpers (in degrees)
  const RAD = Math.PI / 180;
  const DEG = 180 / Math.PI;

  function latToMercY(lat) {
    const clamped = Math.max(-85, Math.min(85, lat));
    return DEG * Math.log(Math.tan(Math.PI / 4 + (clamped * RAD) / 2));
  }

  function mercYToLat(y) {
    return DEG * (2 * Math.atan(Math.exp(y * RAD)) - Math.PI / 2);
  }

  function haversineNm(lat1, lon1, lat2, lon2) {
    const R = 3440.065;
    const dLat = (lat2 - lat1) * RAD;
    const dLon = (lon2 - lon1) * RAD;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * RAD) * Math.cos(lat2 * RAD) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(Math.min(1, a)));
  }

  // Formatting helpers per specification
  function formatTime(hours) {
    if (!Number.isFinite(hours) || hours <= 0) return '0h 0m';
    const totalMinutes = Math.round(hours * 60);
    if (totalMinutes < 24 * 60) {
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      return `${h}h ${m}m`;
    } else {
      const totalHours = Math.round(hours);
      const d = Math.floor(totalHours / 24);
      const h = totalHours % 24;
      return `${d}d ${h}h`;
    }
  }

  function formatLegDistance(nm) {
    return nm.toFixed(1);
  }

  function formatTotalDistance(nm) {
    if (nm <= 0) return '0';
    if (nm < 100) return nm.toFixed(1);
    return Math.round(nm).toLocaleString('en-US');
  }

  function formatPosition(lat, lon) {
    const latH = lat >= 0 ? 'N' : 'S';
    const lonH = lon >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(2)}°${latH} ${Math.abs(lon).toFixed(2)}°${lonH}`;
  }

  // Decode delta-encoded coastline once and precompute Mercator coordinates + bounding boxes
  const rawDeltaRings = self.MED_COASTLINE_DELTA || [];
  const plainRings = [];
  const mercRings = [];

  for (let r = 0; r < rawDeltaRings.length; r++) {
    const flat = rawDeltaRings[r];
    const pts = [];
    const mPts = new Float32Array(flat.length);
    let x = 0;
    let y = 0;
    let minX = Infinity;
    let maxX = -Infinity;
    let minMY = Infinity;
    let maxMY = -Infinity;
    for (let i = 0; i < flat.length; i += 2) {
      x += flat[i];
      y += flat[i + 1];
      const lon = x / 1000;
      const lat = y / 1000;
      const my = latToMercY(lat);
      pts.push([lon, lat]);
      mPts[i] = lon;
      mPts[i + 1] = my;
      if (lon < minX) minX = lon;
      if (lon > maxX) maxX = lon;
      if (my < minMY) minMY = my;
      if (my > maxMY) maxMY = my;
    }
    plainRings.push(pts);
    mercRings.push({
      coords: mPts,
      minX,
      maxX,
      minMY,
      maxMY,
      span: Math.max(maxX - minX, maxMY - minMY)
    });
  }

  // Precompute Mercator Y for preset ports
  for (const p of PRESET_PORTS) {
    p.mercY = latToMercY(p.lat);
  }

  // App state
  const state = {
    stops: [], // [{ uid, name, lat, lon, portId: string|null, isGps?: boolean }]
    speed: 8,
    waypointCounter: 1,
    allowCorinth: false,
    themeMode: 'light', // 'light' (DAY) | 'dark' (NIGHT)
    legs: [], // [{ key, status: 'routing'|'ready', track: [[lat,lon],...], distanceNm }]
    legCache: new Map(), // cacheKey -> { track, distanceNm }
    workerReady: false,
    hoveredPortId: null,
    gpsPosition: null, // { lat, lon, accuracy, timestamp }
    gpsWatchId: null,
    gpsActive: false
  };

  // Viewport state in Mercator degrees
  const view = {
    centerX: (MED_BOUNDS.minLon + MED_BOUNDS.maxLon) / 2, // 15°E
    centerY: (latToMercY(MED_BOUNDS.minLat) + latToMercY(MED_BOUNDS.maxLat)) / 2,
    degPerPx: 0.05,
    width: 800,
    height: 600
  };

  // DOM Elements
  const canvas = document.getElementById('chart-canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const chartContainer = document.getElementById('chart-container');
  const workerBadge = document.getElementById('worker-status');
  const btnZoomIn = document.getElementById('btn-zoom-in');
  const btnZoomOut = document.getElementById('btn-zoom-out');
  const btnFit = document.getElementById('btn-fit');
  const btnTheme = document.getElementById('btn-theme');
  const btnGps = document.getElementById('btn-gps');
  const toggleCorinth = document.getElementById('toggle-corinth');
  const corinthToggleWrap = document.getElementById('corinth-toggle-wrap');

  const speedReadout = document.getElementById('speed-readout');
  const speedSlider = document.getElementById('speed-slider');
  const speedInput = document.getElementById('speed-input');
  const presetBtns = document.querySelectorAll('.preset-btn');

  const tileTotalNm = document.getElementById('tile-total-nm');
  const tileTotalTime = document.getElementById('tile-total-time');
  const tileTotalLegs = document.getElementById('tile-total-legs');

  const legsTbody = document.getElementById('legs-tbody');
  const legsEmpty = document.getElementById('legs-empty');
  const btnUndo = document.getElementById('btn-undo');
  const btnReverse = document.getElementById('btn-reverse');
  const btnClear = document.getElementById('btn-clear');
  const portSelect = document.getElementById('port-select');

  // Theme management: 2-state toggle (DAY / NIGHT), default DAY ('light')
  function isDarkActive() {
    return state.themeMode === 'dark';
  }

  function applyTheme() {
    const dark = isDarkActive();
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    if (btnTheme) {
      btnTheme.textContent = dark ? 'NIGHT' : 'DAY';
      btnTheme.title = 'Toggle Day / Night Chart Mode';
    }
    requestDraw();
  }

  function getPalette() {
    if (isDarkActive()) {
      return {
        sea: '#0b192c',
        land: '#1c2836',
        coast: '#3d526b',
        gridLine: 'rgba(148, 163, 184, 0.14)',
        gridLabelBg: 'rgba(11, 25, 44, 0.82)',
        gridLabelText: '#94a3b8',
        portFill: '#1e293b',
        portStroke: '#cbd5e1',
        portText: '#cbd5e1',
        portHalo: 'rgba(11, 25, 44, 0.9)',
        activePortFill: '#fb923c',
        activePortStroke: '#fff7ed',
        activePortText: '#ffffff',
        waypointFill: '#2dd4bf',
        waypointStroke: '#042f2e',
        waypointText: '#5eead4',
        routeLine: '#fb923c',
        routeCasing: 'rgba(11, 25, 44, 0.85)',
        routePillBg: '#1e293b',
        routePillBorder: '#fb923c',
        routePillText: '#fb923c',
        gpsFill: '#38bdf8',
        gpsRing: 'rgba(56, 189, 248, 0.28)'
      };
    }
    return {
      sea: '#d5e8f2',
      land: '#ebe2cc',
      coast: '#8b7759',
      gridLine: 'rgba(15, 37, 55, 0.11)',
      gridLabelBg: 'rgba(213, 232, 242, 0.85)',
      gridLabelText: '#3b5973',
      portFill: '#ffffff',
      portStroke: '#1b364d',
      portText: '#0f2537',
      portHalo: 'rgba(235, 226, 204, 0.92)',
      activePortFill: '#ea580c',
      activePortStroke: '#ffffff',
      activePortText: '#0f2537',
      waypointFill: '#0d9488',
      waypointStroke: '#ffffff',
      waypointText: '#0f524c',
      routeLine: '#ea580c',
      routeCasing: 'rgba(255, 255, 255, 0.78)',
      routePillBg: '#0f2537',
      routePillBorder: '#ea580c',
      routePillText: '#ffffff',
      gpsFill: '#0284c7',
      gpsRing: 'rgba(2, 132, 199, 0.24)'
    };
  }

  // Persistence
  function saveState() {
    try {
      const payload = {
        stops: state.stops.map((s) => ({
          uid: s.uid,
          name: s.name,
          lat: s.lat,
          lon: s.lon,
          portId: s.portId || null,
          isGps: !!s.isGps
        })),
        speed: state.speed,
        waypointCounter: state.waypointCounter,
        allowCorinth: state.allowCorinth,
        themeMode: state.themeMode
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (_) {
      // Ignore storage quota errors
    }
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (Array.isArray(data.stops)) {
        state.stops = data.stops
          .filter((s) => s && typeof s.lat === 'number' && typeof s.lon === 'number')
          .map((s, idx) => ({
            uid: s.uid || `stop-${Date.now()}-${idx}`,
            name: String(s.name || `Stop ${idx + 1}`),
            lat: s.lat,
            lon: s.lon,
            portId: s.portId || null,
            isGps: !!s.isGps
          }));
      }
      if (typeof data.speed === 'number' && data.speed >= 1 && data.speed <= 25) {
        state.speed = data.speed;
      }
      if (typeof data.waypointCounter === 'number' && data.waypointCounter >= 1) {
        state.waypointCounter = Math.floor(data.waypointCounter);
      }
      if (typeof data.allowCorinth === 'boolean') {
        state.allowCorinth = data.allowCorinth;
      }
      if (['light', 'dark'].includes(data.themeMode)) {
        state.themeMode = data.themeMode;
      } else {
        state.themeMode = 'light';
      }
    } catch (_) {
      // Ignore malformed storage
    }
  }

  // Web Worker setup for off-main-thread routing
  let routerWorker = null;
  let nextReqId = 1;

  function initRouterWorker() {
    routerWorker = new Worker('./router-worker.js');
    routerWorker.onmessage = function (e) {
      const msg = e.data;
      if (!msg) return;
      if (msg.type === 'ready') {
        state.workerReady = true;
        if (workerBadge) {
          workerBadge.textContent = 'OFFLINE ROUTER READY';
          workerBadge.classList.add('ready');
        }
      } else if (msg.type === 'routeResult') {
        state.legCache.set(msg.cacheKey, {
          track: msg.track,
          distanceNm: msg.distanceNm
        });
        let updated = false;
        for (const leg of state.legs) {
          if (leg.key === msg.cacheKey && leg.status !== 'ready') {
            leg.status = 'ready';
            leg.track = msg.track;
            leg.distanceNm = msg.distanceNm;
            updated = true;
          }
        }
        if (updated) {
          updatePanelUI();
          requestDraw();
          if (pendingFitAfterRoute) {
            const allReady = state.legs.every((l) => l.status === 'ready');
            if (allReady) {
              pendingFitAfterRoute = false;
              fitViewToRoute();
            }
          }
        }
      }
    };
    routerWorker.postMessage({ type: 'init', rings: plainRings });
  }

  let pendingFitAfterRoute = false;

  function makeLegCacheKey(s1, s2, allowCorinth) {
    return `${s1.lat.toFixed(4)},${s1.lon.toFixed(4)}->${s2.lat.toFixed(4)},${s2.lon.toFixed(4)}|c:${
      allowCorinth ? 1 : 0
    }`;
  }

  function recomputeLegs() {
    const newLegs = [];
    for (let i = 1; i < state.stops.length; i++) {
      const s1 = state.stops[i - 1];
      const s2 = state.stops[i];
      const key = makeLegCacheKey(s1, s2, state.allowCorinth);
      const cached = state.legCache.get(key);
      if (cached) {
        newLegs.push({
          key,
          status: 'ready',
          track: cached.track,
          distanceNm: cached.distanceNm
        });
      } else {
        const straightTrack = [
          [s1.lat, s1.lon],
          [s2.lat, s2.lon]
        ];
        const straightNm = haversineNm(s1.lat, s1.lon, s2.lat, s2.lon);
        newLegs.push({
          key,
          status: 'routing',
          track: straightTrack,
          distanceNm: straightNm
        });
        if (routerWorker) {
          routerWorker.postMessage({
            type: 'route',
            id: nextReqId++,
            cacheKey: key,
            lat1: s1.lat,
            lon1: s1.lon,
            lat2: s2.lat,
            lon2: s2.lon,
            allowCorinth: state.allowCorinth
          });
        }
      }
    }
    state.legs = newLegs;
    saveState();
    updatePanelUI();
    requestDraw();
  }

  // Coordinate conversions between Geographic/Mercator and Screen Pixels
  function lonToScreenX(lon) {
    return (lon - view.centerX) / view.degPerPx + view.width / 2;
  }

  function mercYToScreenY(my) {
    return (view.centerY - my) / view.degPerPx + view.height / 2;
  }

  function latToScreenY(lat) {
    return mercYToScreenY(latToMercY(lat));
  }

  function screenXToLon(sx) {
    return view.centerX + (sx - view.width / 2) * view.degPerPx;
  }

  function screenYToMercY(sy) {
    return view.centerY - (sy - view.height / 2) * view.degPerPx;
  }

  function screenYToLat(sy) {
    return mercYToLat(screenYToMercY(sy));
  }

  function clampView() {
    const minDegPerPx = MIN_LON_SPAN / Math.max(1, view.width);
    const maxDegPerPx = MAX_LON_SPAN / Math.max(1, view.width);
    view.degPerPx = Math.max(minDegPerPx, Math.min(maxDegPerPx, view.degPerPx));

    const minCenterLon = -12;
    const maxCenterLon = 42;
    view.centerX = Math.max(minCenterLon, Math.min(maxCenterLon, view.centerX));

    const minCenterMY = latToMercY(26);
    const maxCenterMY = latToMercY(50);
    view.centerY = Math.max(minCenterMY, Math.min(maxCenterMY, view.centerY));
  }

  function fitMedView() {
    const lonSpan = MED_BOUNDS.maxLon - MED_BOUNDS.minLon;
    const myMin = latToMercY(MED_BOUNDS.minLat);
    const myMax = latToMercY(MED_BOUNDS.maxLat);
    const mySpan = myMax - myMin;

    view.centerX = (MED_BOUNDS.minLon + MED_BOUNDS.maxLon) / 2;
    view.centerY = (myMin + myMax) / 2;
    const degPerPxX = (lonSpan * 1.04) / Math.max(1, view.width);
    const degPerPxY = (mySpan * 1.04) / Math.max(1, view.height);
    view.degPerPx = Math.max(degPerPxX, degPerPxY);
    clampView();
    requestDraw();
  }

  function fitViewToRoute() {
    if (state.stops.length === 0) {
      fitMedView();
      return;
    }
    if (state.stops.length === 1) {
      const s = state.stops[0];
      view.centerX = s.lon;
      view.centerY = latToMercY(s.lat);
      view.degPerPx = Math.max(MIN_LON_SPAN * 4, 6) / Math.max(1, view.width);
      clampView();
      requestDraw();
      return;
    }

    let minLon = Infinity;
    let maxLon = -Infinity;
    let minMY = Infinity;
    let maxMY = -Infinity;

    const includePt = (lat, lon) => {
      const my = latToMercY(lat);
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
      if (my < minMY) minMY = my;
      if (my > maxMY) maxMY = my;
    };

    for (const s of state.stops) includePt(s.lat, s.lon);
    for (const leg of state.legs) {
      for (const [lat, lon] of leg.track) includePt(lat, lon);
    }

    // 25% padding per specification
    const lonSpan = Math.max(0.5, (maxLon - minLon) * 1.5);
    const mySpan = Math.max(0.5, (maxMY - minMY) * 1.5);
    view.centerX = (minLon + maxLon) / 2;
    view.centerY = (minMY + maxMY) / 2;
    view.degPerPx = Math.max(lonSpan / Math.max(1, view.width), mySpan / Math.max(1, view.height));
    clampView();
    requestDraw();
  }

  function zoomAroundPoint(factor, screenX, screenY) {
    const anchorLon = screenXToLon(screenX);
    const anchorMY = screenYToMercY(screenY);
    view.degPerPx *= factor;
    clampView();
    view.centerX = anchorLon - (screenX - view.width / 2) * view.degPerPx;
    view.centerY = anchorMY + (screenY - view.height / 2) * view.degPerPx;
    clampView();
    requestDraw();
  }

  // High-DPI Canvas Rendering
  let drawPending = false;
  function requestDraw() {
    if (!drawPending) {
      drawPending = true;
      requestAnimationFrame(drawChart);
    }
  }

  function getMidpointOnTrack(track) {
    if (track.length === 0) return [0, 0];
    if (track.length === 1) return track[0];
    let total = 0;
    const segLens = [];
    for (let i = 1; i < track.length; i++) {
      const d = haversineNm(track[i - 1][0], track[i - 1][1], track[i][0], track[i][1]);
      segLens.push(d);
      total += d;
    }
    const half = total / 2;
    let acc = 0;
    for (let i = 0; i < segLens.length; i++) {
      if (acc + segLens[i] >= half && segLens[i] > 0) {
        const t = (half - acc) / segLens[i];
        return [
          track[i][0] + (track[i + 1][0] - track[i][0]) * t,
          track[i][1] + (track[i + 1][1] - track[i][1]) * t
        ];
      }
      acc += segLens[i];
    }
    return track[Math.floor(track.length / 2)];
  }

  function drawChart() {
    drawPending = false;
    const dpr = window.devicePixelRatio || 1;
    const w = view.width;
    const h = view.height;
    if (w <= 0 || h <= 0) return;

    const pal = getPalette();
    ctx.save();
    ctx.scale(dpr, dpr);

    // 1. Fill Sea background
    ctx.fillStyle = pal.sea;
    ctx.fillRect(0, 0, w, h);

    // Viewport bounds in Mercator degrees for culling
    const viewMinLon = screenXToLon(0);
    const viewMaxLon = screenXToLon(w);
    const viewMaxMY = screenYToMercY(0);
    const viewMinMY = screenYToMercY(h);
    const minVisibleSpanDeg = view.degPerPx * 0.6;

    // 2. Draw Land Polygons (even-odd rule) & Coastline Stroke
    ctx.beginPath();
    for (let r = 0; r < mercRings.length; r++) {
      const ring = mercRings[r];
      if (
        ring.maxX < viewMinLon ||
        ring.minX > viewMaxLon ||
        ring.maxMY < viewMinMY ||
        ring.minMY > viewMaxMY
      ) {
        continue;
      }
      if (ring.span < minVisibleSpanDeg) continue;

      const coords = ring.coords;
      const sx0 = (coords[0] - view.centerX) / view.degPerPx + w / 2;
      const sy0 = (view.centerY - coords[1]) / view.degPerPx + h / 2;
      ctx.moveTo(sx0, sy0);
      for (let i = 2; i < coords.length; i += 2) {
        const sx = (coords[i] - view.centerX) / view.degPerPx + w / 2;
        const sy = (view.centerY - coords[i + 1]) / view.degPerPx + h / 2;
        ctx.lineTo(sx, sy);
      }
      ctx.closePath();
    }
    ctx.fillStyle = pal.land;
    ctx.fill('evenodd');
    ctx.lineWidth = 1.0;
    ctx.strokeStyle = pal.coast;
    ctx.stroke();

    // 3. Lat/Long Graticule Grid & Edge Labels (5°, 2°, 1°, or 0.5°)
    const lonSpan = viewMaxLon - viewMinLon;
    const gridStep = lonSpan > 22 ? 5 : lonSpan > 10 ? 2 : lonSpan > 4 ? 1 : 0.5;

    ctx.strokeStyle = pal.gridLine;
    ctx.lineWidth = 1;
    ctx.font = '500 11px "IBM Plex Mono", monospace';

    const firstLon = Math.ceil(viewMinLon / gridStep) * gridStep;
    const minLatVis = Math.max(-80, mercYToLat(viewMinMY));
    const maxLatVis = Math.min(80, mercYToLat(viewMaxMY));
    const firstLat = Math.ceil(minLatVis / gridStep) * gridStep;

    ctx.beginPath();
    for (let lon = firstLon; lon <= viewMaxLon; lon += gridStep) {
      const sx = Math.round(lonToScreenX(lon)) + 0.5;
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, h);
    }
    for (let lat = firstLat; lat <= maxLatVis; lat += gridStep) {
      const sy = Math.round(latToScreenY(lat)) + 0.5;
      ctx.moveTo(0, sy);
      ctx.lineTo(w, sy);
    }
    ctx.stroke();

    // Longitude labels along top edge
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let lon = firstLon; lon <= viewMaxLon; lon += gridStep) {
      const sx = lonToScreenX(lon);
      if (sx < 34 || sx > w - 34) continue;
      const absLon = Math.abs(lon);
      const numStr = gridStep < 1 ? absLon.toFixed(1).replace(/\.0$/, '') : String(Math.round(absLon));
      const hemi = Math.abs(lon) < 1e-6 ? '' : lon > 0 ? 'E' : 'W';
      const lbl = `${numStr}°${hemi}`;
      const tw = ctx.measureText(lbl).width + 8;
      ctx.fillStyle = pal.gridLabelBg;
      ctx.fillRect(sx - tw / 2, 4, tw, 16);
      ctx.fillStyle = pal.gridLabelText;
      ctx.fillText(lbl, sx, 6);
    }

    // Latitude labels along left edge
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    for (let lat = firstLat; lat <= maxLatVis; lat += gridStep) {
      const sy = latToScreenY(lat);
      if (sy < 26 || sy > h - 20) continue;
      const absLat = Math.abs(lat);
      const numStr = gridStep < 1 ? absLat.toFixed(1).replace(/\.0$/, '') : String(Math.round(absLat));
      const hemi = lat >= 0 ? 'N' : 'S';
      const lbl = `${numStr}°${hemi}`;
      const tw = ctx.measureText(lbl).width + 8;
      ctx.fillStyle = pal.gridLabelBg;
      ctx.fillRect(4, sy - 8, tw, 16);
      ctx.fillStyle = pal.gridLabelText;
      ctx.fillText(lbl, 8, sy);
    }

    // 4. Draw Route Polylines (in Screen Coordinates for crisp constant width)
    for (let i = 0; i < state.legs.length; i++) {
      const leg = state.legs[i];
      const track = leg.track;
      if (!track || track.length < 2) continue;

      ctx.save();
      ctx.beginPath();
      for (let k = 0; k < track.length; k++) {
        const sx = lonToScreenX(track[k][1]);
        const sy = latToScreenY(track[k][0]);
        if (k === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }

      if (leg.status === 'routing') {
        ctx.setLineDash([6, 5]);
        ctx.strokeStyle = pal.routeLine;
        ctx.lineWidth = 2.2;
        ctx.stroke();
      } else {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = pal.routeCasing;
        ctx.lineWidth = 5.0;
        ctx.stroke();

        ctx.strokeStyle = pal.routeLine;
        ctx.lineWidth = 2.75;
        ctx.stroke();
      }
      ctx.restore();
    }

    // 5. Draw Preset Ports (Constant Screen Size)
    const activePortIds = new Set();
    for (const s of state.stops) {
      if (s.portId) activePortIds.add(s.portId);
    }

    const showAllPortLabels = lonSpan <= 17;
    ctx.font = '600 12px "Barlow Condensed", sans-serif';

    for (const p of PRESET_PORTS) {
      const sx = lonToScreenX(p.lon);
      const sy = mercYToScreenY(p.mercY);
      if (sx < -40 || sx > w + 40 || sy < -20 || sy > h + 20) continue;

      const isActive = activePortIds.has(p.id);
      const isHovered = state.hoveredPortId === p.id;
      const radius = isActive ? 5.5 : isHovered ? 5.0 : 3.6;

      ctx.beginPath();
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? pal.activePortFill : pal.portFill;
      ctx.fill();
      ctx.lineWidth = isActive ? 2.0 : 1.5;
      ctx.strokeStyle = isActive ? pal.activePortStroke : pal.portStroke;
      ctx.stroke();

      if (isActive || isHovered || showAllPortLabels) {
        ctx.save();
        ctx.font = isActive
          ? '700 13px "Barlow Condensed", sans-serif'
          : '600 12px "Barlow Condensed", sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 3.2;
        ctx.strokeStyle = pal.portHalo;
        ctx.strokeText(p.name, sx + radius + 4, sy);
        ctx.fillStyle = isActive ? pal.routeLine : pal.portText;
        ctx.fillText(p.name, sx + radius + 4, sy);
        ctx.restore();
      }
    }

    // 6. Draw Custom Waypoints & Stop Sequence Badges
    for (let i = 0; i < state.stops.length; i++) {
      const s = state.stops[i];
      const sx = lonToScreenX(s.lon);
      const sy = latToScreenY(s.lat);
      if (sx < -50 || sx > w + 50 || sy < -30 || sy > h + 30) continue;

      if (!s.portId) {
        // Custom waypoint or GPS stop: draw teal marker + constant-size label
        ctx.beginPath();
        ctx.arc(sx, sy, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = pal.waypointFill;
        ctx.fill();
        ctx.lineWidth = 2.0;
        ctx.strokeStyle = pal.waypointStroke;
        ctx.stroke();

        ctx.save();
        ctx.font = '700 12.5px "Barlow Condensed", sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 3.2;
        ctx.strokeStyle = pal.portHalo;
        ctx.strokeText(s.name, sx + 9, sy);
        ctx.fillStyle = pal.waypointText;
        ctx.fillText(s.name, sx + 9, sy);
        ctx.restore();
      }
    }

    // 7. Draw Leg Distance Midpoint Pills
    for (let i = 0; i < state.legs.length; i++) {
      const leg = state.legs[i];
      const [midLat, midLon] = getMidpointOnTrack(leg.track);
      const mx = lonToScreenX(midLon);
      const my = latToScreenY(midLat);
      if (mx < -50 || mx > w + 50 || my < -20 || my > h + 20) continue;

      const labelText =
        leg.status === 'routing' ? 'Routing…' : `${Math.round(leg.distanceNm)} nm`;
      ctx.save();
      ctx.font = '600 11px "IBM Plex Mono", monospace';
      const textW = ctx.measureText(labelText).width;
      const pw = textW + 12;
      const ph = 19;
      const px = mx - pw / 2;
      const py = my - ph / 2;

      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(px, py, pw, ph, 5);
      } else {
        ctx.rect(px, py, pw, ph);
      }
      ctx.fillStyle = pal.routePillBg;
      ctx.fill();
      ctx.lineWidth = 1.25;
      ctx.strokeStyle = pal.routePillBorder;
      ctx.stroke();

      ctx.fillStyle = pal.routePillText;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, mx, my + 0.5);
      ctx.restore();
    }

    // 8. Draw Live GPS Vessel Position Marker (if available)
    if (state.gpsPosition) {
      const gx = lonToScreenX(state.gpsPosition.lon);
      const gy = latToScreenY(state.gpsPosition.lat);
      if (gx >= -30 && gx <= w + 30 && gy >= -30 && gy <= h + 30) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(gx, gy, 13, 0, Math.PI * 2);
        ctx.fillStyle = pal.gpsRing;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(gx, gy, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = pal.gpsFill;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        ctx.restore();
      }
    }

    ctx.restore();
  }

  // Populate Add Port alphabetical dropdown
  function populatePortDropdown() {
    const sorted = [...PRESET_PORTS].sort((a, b) => a.name.localeCompare(b.name, 'en'));
    portSelect.innerHTML = '<option value="">+ Add port to route (Name · Country)…</option>';
    for (const p of sorted) {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.name} · ${p.country}`;
      portSelect.appendChild(opt);
    }
  }

  // Stop manipulation actions
  function addPortStop(port, shouldFit = false) {
    if (!port) return;
    const last = state.stops[state.stops.length - 1];
    // Specification: "The same port cannot be added twice in a row."
    if (last && last.portId === port.id) return;

    state.stops.push({
      uid: `stop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: port.name,
      lat: port.lat,
      lon: port.lon,
      portId: port.id
    });

    if (shouldFit) {
      pendingFitAfterRoute = true;
      fitViewToRoute();
    }
    recomputeLegs();
  }

  function addCustomWaypoint(lat, lon, customName = null, isGps = false) {
    const clampedLat = Math.max(MED_BOUNDS.minLat, Math.min(MED_BOUNDS.maxLat, lat));
    const clampedLon = Math.max(MED_BOUNDS.minLon, Math.min(MED_BOUNDS.maxLon, lon));
    const name = customName || `Waypoint ${state.waypointCounter++}`;
    state.stops.push({
      uid: `wp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      lat: Number(clampedLat.toFixed(4)),
      lon: Number(clampedLon.toFixed(4)),
      portId: null,
      isGps
    });
    recomputeLegs();
  }

  function removeStopAtIndex(idx) {
    if (idx < 0 || idx >= state.stops.length) return;
    state.stops.splice(idx, 1);
    // Prevent adjacent duplicate ports after middle stop deletion
    for (let i = state.stops.length - 1; i >= 1; i--) {
      if (state.stops[i].portId && state.stops[i].portId === state.stops[i - 1].portId) {
        state.stops.splice(i, 1);
      }
    }
    if (state.stops.length === 0) {
      state.waypointCounter = 1;
    }
    recomputeLegs();
  }

  function undoLastStop() {
    if (state.stops.length === 0) return;
    state.stops.pop();
    if (state.stops.length === 0) {
      state.waypointCounter = 1;
    }
    recomputeLegs();
  }

  function reverseRoute() {
    if (state.stops.length < 2) return;
    state.stops.reverse();
    recomputeLegs();
  }

  function clearRoute() {
    state.stops = [];
    state.legs = [];
    state.waypointCounter = 1;
    saveState();
    updatePanelUI();
    fitMedView();
  }

  // Update Speed, Totals, and Legs Table UI
  function setSpeed(newSpeed) {
    const val = Math.max(1, Math.min(25, Math.round(newSpeed * 10) / 10));
    state.speed = val;
    saveState();
    updateSpeedControlsUI();
    updateTotalsAndTableTimes();
  }

  function updateSpeedControlsUI() {
    speedReadout.textContent = `${state.speed % 1 === 0 ? state.speed.toFixed(1) : state.speed.toFixed(1)} kn`;
    speedInput.value = state.speed;
    const sliderVal = Math.max(3, Math.min(16, state.speed));
    speedSlider.value = sliderVal;
    presetBtns.forEach((btn) => {
      const p = parseFloat(btn.getAttribute('data-speed'));
      btn.classList.toggle('active', Math.abs(p - state.speed) < 0.01);
    });
  }

  function updateTotalsAndTableTimes() {
    let totalNm = 0;
    let anyRouting = false;
    for (const leg of state.legs) {
      totalNm += leg.distanceNm;
      if (leg.status === 'routing') anyRouting = true;
    }
    const totalHours = state.legs.length > 0 ? totalNm / state.speed : 0;

    tileTotalNm.textContent = anyRouting ? '…' : formatTotalDistance(totalNm);
    tileTotalTime.textContent = anyRouting ? 'Routing…' : formatTime(totalHours);
    tileTotalLegs.textContent = String(state.legs.length);

    // Update time cells in existing table rows without rebuilding DOM
    const timeCells = legsTbody.querySelectorAll('[data-leg-time-idx]');
    timeCells.forEach((cell) => {
      const legIdx = parseInt(cell.getAttribute('data-leg-time-idx'), 10);
      const leg = state.legs[legIdx];
      if (!leg) return;
      cell.textContent =
        leg.status === 'routing' ? '…' : formatTime(leg.distanceNm / state.speed);
    });
  }

  // Check whether any leg on the current route could possibly benefit from the Corinth Canal
  function isRouteCorinthCandidate() {
    if (state.stops.length < 2) return false;
    const CORINTH_NW = [37.965, 22.935];
    const CORINTH_SE = [37.905, 23.025];
    const CAPE_MATAPAN = [36.35, 22.48];
    const CAPE_MALEAS = [36.38, 23.20];

    for (let i = 1; i < state.stops.length; i++) {
      const a = state.stops[i - 1];
      const b = state.stops[i];
      // Must have one endpoint west of the Isthmus and one east of the Isthmus, and at least one north of Southern Peloponnese
      const crossesIsthmusLon =
        (a.lon <= 23.02 && b.lon >= 22.93) || (b.lon <= 23.02 && a.lon >= 22.93);
      if (!crossesIsthmusLon) continue;
      if (a.lat < 36.45 && b.lat < 36.45) continue;

      const viaCanal = Math.min(
        haversineNm(a.lat, a.lon, CORINTH_NW[0], CORINTH_NW[1]) +
          4.2 +
          haversineNm(CORINTH_SE[0], CORINTH_SE[1], b.lat, b.lon),
        haversineNm(a.lat, a.lon, CORINTH_SE[0], CORINTH_SE[1]) +
          4.2 +
          haversineNm(CORINTH_NW[0], CORINTH_NW[1], b.lat, b.lon)
      );
      const viaSouthPeloponnese = Math.min(
        haversineNm(a.lat, a.lon, CAPE_MATAPAN[0], CAPE_MATAPAN[1]) +
          35 +
          haversineNm(CAPE_MALEAS[0], CAPE_MALEAS[1], b.lat, b.lon),
        haversineNm(a.lat, a.lon, CAPE_MALEAS[0], CAPE_MALEAS[1]) +
          35 +
          haversineNm(CAPE_MATAPAN[0], CAPE_MATAPAN[1], b.lat, b.lon)
      );

      if (viaCanal < viaSouthPeloponnese) return true;
    }
    return false;
  }

  function updatePanelUI() {
    updateSpeedControlsUI();

    if (toggleCorinth) {
      toggleCorinth.checked = state.allowCorinth;
    }
    if (corinthToggleWrap) {
      corinthToggleWrap.style.display = isRouteCorinthCandidate() ? 'inline-flex' : 'none';
    }

    btnUndo.disabled = state.stops.length === 0;
    btnReverse.disabled = state.stops.length < 2;
    btnClear.disabled = state.stops.length === 0;

    legsTbody.innerHTML = '';
    if (state.stops.length === 0) {
      legsEmpty.style.display = 'block';
    } else {
      legsEmpty.style.display = 'none';
      for (let i = 0; i < state.stops.length; i++) {
        const stop = state.stops[i];
        const leg = i > 0 ? state.legs[i - 1] : null;
        const tr = document.createElement('tr');

        // Stop Name + Position cell
        const tdStop = document.createElement('td');
        tdStop.className = 'col-stop';

        const topRow = document.createElement('div');
        topRow.className = 'stop-title-row';

        const numBadge = document.createElement('span');
        numBadge.className = `stop-num ${stop.portId ? 'is-port' : 'is-wp'}`;
        numBadge.textContent = String(i + 1);
        topRow.appendChild(numBadge);

        const nameSpan = document.createElement('span');
        nameSpan.className = 'stop-name';
        nameSpan.textContent = stop.name;

        // Custom waypoints can be renamed on tap
        if (!stop.portId) {
          nameSpan.classList.add('editable-wp');
          nameSpan.title = 'Tap to rename waypoint';
          nameSpan.addEventListener('click', () => {
            const nextName = window.prompt('Rename waypoint:', stop.name);
            if (nextName && nextName.trim()) {
              stop.name = nextName.trim();
              saveState();
              updatePanelUI();
              requestDraw();
            }
          });
        }
        topRow.appendChild(nameSpan);

        if (i === 0) {
          const startTag = document.createElement('span');
          startTag.className = 'start-badge';
          startTag.textContent = 'Start';
          topRow.appendChild(startTag);
        }

        const posDiv = document.createElement('div');
        posDiv.className = 'stop-coords';
        posDiv.textContent = formatPosition(stop.lat, stop.lon);

        tdStop.appendChild(topRow);
        tdStop.appendChild(posDiv);

        // Distance cell
        const tdDist = document.createElement('td');
        tdDist.className = 'col-dist mono';
        if (i === 0) {
          tdDist.textContent = '—';
        } else if (leg.status === 'routing') {
          tdDist.textContent = 'Routing…';
          tdDist.classList.add('routing-text');
        } else {
          tdDist.textContent = `${formatLegDistance(leg.distanceNm)} nm`;
        }

        // Time cell
        const tdTime = document.createElement('td');
        tdTime.className = 'col-time mono';
        if (i === 0) {
          tdTime.textContent = '—';
        } else {
          tdTime.setAttribute('data-leg-time-idx', String(i - 1));
          tdTime.textContent =
            leg.status === 'routing' ? '…' : formatTime(leg.distanceNm / state.speed);
        }

        // Remove button cell
        const tdRemove = document.createElement('td');
        tdRemove.className = 'col-remove';
        const btnRm = document.createElement('button');
        btnRm.type = 'button';
        btnRm.className = 'remove-stop-btn';
        btnRm.title = `Remove ${stop.name}`;
        btnRm.textContent = '×';
        btnRm.addEventListener('click', () => removeStopAtIndex(i));
        tdRemove.appendChild(btnRm);

        tr.appendChild(tdStop);
        tr.appendChild(tdDist);
        tr.appendChild(tdTime);
        tr.appendChild(tdRemove);
        legsTbody.appendChild(tr);
      }
    }

    updateTotalsAndTableTimes();
  }

  // Hit-testing for Port markers in screen coordinates
  function findPortAtScreenXY(sx, sy, hitRadiusPx = 15) {
    let bestPort = null;
    let bestDistSq = hitRadiusPx * hitRadiusPx;
    for (const p of PRESET_PORTS) {
      const px = lonToScreenX(p.lon);
      const py = mercYToScreenY(p.mercY);
      const dSq = (sx - px) * (sx - px) + (sy - py) * (sy - py);
      if (dSq <= bestDistSq) {
        bestDistSq = dSq;
        bestPort = p;
      }
    }
    return bestPort;
  }

  function handleChartTap(sx, sy) {
    const hitPort = findPortAtScreenXY(sx, sy, 16);
    if (hitPort) {
      addPortStop(hitPort, false);
    } else {
      const lon = screenXToLon(sx);
      const lat = screenYToLat(sy);
      addCustomWaypoint(lat, lon);
    }
  }

  // Pointer & Touch Gestures (Pan, Pinch-Zoom around midpoint, < 5px Tap rule)
  function initChartInteractions() {
    let isMouseDragging = false;
    let mouseStartX = 0;
    let mouseStartY = 0;
    let mouseLastX = 0;
    let mouseLastY = 0;
    let mouseMovedDist = 0;

    canvas.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      isMouseDragging = true;
      const rect = canvas.getBoundingClientRect();
      mouseStartX = mouseLastX = e.clientX - rect.left;
      mouseStartY = mouseLastY = e.clientY - rect.top;
      mouseMovedDist = 0;
    });

    window.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;

      if (!isMouseDragging) {
        if (sx >= 0 && sx <= view.width && sy >= 0 && sy <= view.height) {
          const hovered = findPortAtScreenXY(sx, sy, 12);
          const hid = hovered ? hovered.id : null;
          if (hid !== state.hoveredPortId) {
            state.hoveredPortId = hid;
            canvas.style.cursor = hid ? 'pointer' : 'crosshair';
            requestDraw();
          }
        }
        return;
      }

      const dx = sx - mouseLastX;
      const dy = sy - mouseLastY;
      mouseLastX = sx;
      mouseLastY = sy;
      mouseMovedDist = Math.hypot(sx - mouseStartX, sy - mouseStartY);

      if (mouseMovedDist >= 2) {
        view.centerX -= dx * view.degPerPx;
        view.centerY += dy * view.degPerPx;
        clampView();
        requestDraw();
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (!isMouseDragging) return;
      isMouseDragging = false;
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const totalMove = Math.hypot(sx - mouseStartX, sy - mouseStartY);
      // Specification: "A tap counts as a tap only if the finger moves less than 5 px; otherwise it pans."
      if (totalMove < 5 && sx >= 0 && sx <= view.width && sy >= 0 && sy <= view.height) {
        handleChartTap(sx, sy);
      }
    });

    canvas.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        const factor = e.deltaY > 0 ? 1.18 : 1 / 1.18;
        zoomAroundPoint(factor, sx, sy);
      },
      { passive: false }
    );

    // Touch events (1-finger pan/tap, 2-finger pinch-zoom around midpoint)
    let touchMode = 'none'; // 'one' | 'pinch'
    let touchStartX = 0;
    let touchStartY = 0;
    let touchLastX = 0;
    let touchLastY = 0;
    let maxTouchMove = 0;
    let pinchLastDist = 0;
    let pinchLastMidX = 0;
    let pinchLastMidY = 0;

    canvas.addEventListener(
      'touchstart',
      (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        if (e.touches.length === 1) {
          touchMode = 'one';
          const t = e.touches[0];
          touchStartX = touchLastX = t.clientX - rect.left;
          touchStartY = touchLastY = t.clientY - rect.top;
          maxTouchMove = 0;
        } else if (e.touches.length >= 2) {
          touchMode = 'pinch';
          maxTouchMove = 999; // Disqualify tap
          const t1 = e.touches[0];
          const t2 = e.touches[1];
          const x1 = t1.clientX - rect.left;
          const y1 = t1.clientY - rect.top;
          const x2 = t2.clientX - rect.left;
          const y2 = t2.clientY - rect.top;
          pinchLastDist = Math.hypot(x2 - x1, y2 - y1);
          pinchLastMidX = (x1 + x2) / 2;
          pinchLastMidY = (y1 + y2) / 2;
        }
      },
      { passive: false }
    );

    canvas.addEventListener(
      'touchmove',
      (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        if (touchMode === 'one' && e.touches.length === 1) {
          const t = e.touches[0];
          const sx = t.clientX - rect.left;
          const sy = t.clientY - rect.top;
          const dx = sx - touchLastX;
          const dy = sy - touchLastY;
          touchLastX = sx;
          touchLastY = sy;
          const distFromStart = Math.hypot(sx - touchStartX, sy - touchStartY);
          if (distFromStart > maxTouchMove) maxTouchMove = distFromStart;

          if (maxTouchMove >= 5) {
            view.centerX -= dx * view.degPerPx;
            view.centerY += dy * view.degPerPx;
            clampView();
            requestDraw();
          }
        } else if (e.touches.length >= 2) {
          touchMode = 'pinch';
          const t1 = e.touches[0];
          const t2 = e.touches[1];
          const x1 = t1.clientX - rect.left;
          const y1 = t1.clientY - rect.top;
          const x2 = t2.clientX - rect.left;
          const y2 = t2.clientY - rect.top;
          const dist = Math.hypot(x2 - x1, y2 - y1);
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;

          if (pinchLastDist > 8 && dist > 8) {
            // Pan midpoint delta first
            const dx = midX - pinchLastMidX;
            const dy = midY - pinchLastMidY;
            view.centerX -= dx * view.degPerPx;
            view.centerY += dy * view.degPerPx;
            // Zoom around midpoint
            const factor = pinchLastDist / dist;
            zoomAroundPoint(factor, midX, midY);
          }
          pinchLastDist = dist;
          pinchLastMidX = midX;
          pinchLastMidY = midY;
        }
      },
      { passive: false }
    );

    canvas.addEventListener(
      'touchend',
      (e) => {
        e.preventDefault();
        if (touchMode === 'one' && e.touches.length === 0 && maxTouchMove < 5) {
          handleChartTap(touchLastX, touchLastY);
        }
        if (e.touches.length === 1) {
          const rect = canvas.getBoundingClientRect();
          touchMode = 'one';
          touchLastX = e.touches[0].clientX - rect.left;
          touchLastY = e.touches[0].clientY - rect.top;
          maxTouchMove = 999; // Prevent accidental tap after pinch release
        } else if (e.touches.length === 0) {
          touchMode = 'none';
        }
      },
      { passive: false }
    );
  }

  // Live GPS tracking & Start/Waypoint addition
  function handleGpsAction() {
    if (!('geolocation' in navigator)) {
      window.alert('Geolocation is not supported on this device/browser.');
      return;
    }

    if (!state.gpsActive) {
      btnGps.textContent = 'GPS…';
      state.gpsWatchId = navigator.geolocation.watchPosition(
        (pos) => {
          const wasFirstFix = !state.gpsPosition;
          state.gpsPosition = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp
          };
          state.gpsActive = true;
          btnGps.classList.add('active');
          btnGps.textContent = '+ GPS STOP';
          btnGps.title = 'Add current GPS position to route';
          requestDraw();
          if (wasFirstFix) {
            addGpsPositionToRoute();
          }
        },
        (err) => {
          btnGps.textContent = '📍 GPS';
          window.alert(`Unable to read GPS location: ${err.message}`);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
      );
    } else if (state.gpsPosition) {
      addGpsPositionToRoute();
    }
  }

  function addGpsPositionToRoute() {
    if (!state.gpsPosition) return;
    const { lat, lon } = state.gpsPosition;
    if (
      lat < MED_BOUNDS.minLat ||
      lat > MED_BOUNDS.maxLat ||
      lon < MED_BOUNDS.minLon ||
      lon > MED_BOUNDS.maxLon
    ) {
      const proceed = window.confirm(
        `Current GPS position (${formatPosition(
          lat,
          lon
        )}) is outside the Mediterranean chart bounds. Clamp to chart edge and add anyway?`
      );
      if (!proceed) return;
    }
    addCustomWaypoint(lat, lon, 'Vessel GPS', true);
    fitViewToRoute();
  }

  // Resize handling
  function handleResize() {
    const rect = chartContainer.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(100, Math.floor(rect.width));
    const h = Math.max(100, Math.floor(rect.height));
    const wasUnset = view.width === 800 && view.height === 600 && !canvas.hasAttribute('data-sized');
    view.width = w;
    view.height = h;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    canvas.setAttribute('data-sized', '1');

    if (wasUnset) {
      if (state.stops.length > 0) fitViewToRoute();
      else fitMedView();
    } else {
      clampView();
      requestDraw();
    }
  }

  // Wire UI Events
  function bindUIEvents() {
    btnZoomIn.addEventListener('click', () => {
      zoomAroundPoint(1 / 1.45, view.width / 2, view.height / 2);
    });
    btnZoomOut.addEventListener('click', () => {
      zoomAroundPoint(1.45, view.width / 2, view.height / 2);
    });
    btnFit.addEventListener('click', () => {
      fitViewToRoute();
    });

    if (btnTheme) {
      btnTheme.addEventListener('click', () => {
        state.themeMode = state.themeMode === 'dark' ? 'light' : 'dark';
        saveState();
        applyTheme();
      });
    }

    if (btnGps) {
      btnGps.addEventListener('click', handleGpsAction);
    }

    if (toggleCorinth) {
      toggleCorinth.addEventListener('change', () => {
        state.allowCorinth = toggleCorinth.checked;
        recomputeLegs();
      });
    }

    speedSlider.addEventListener('input', () => {
      setSpeed(parseFloat(speedSlider.value));
    });

    speedInput.addEventListener('change', () => {
      const val = parseFloat(speedInput.value);
      if (Number.isFinite(val)) {
        setSpeed(val);
      } else {
        updateSpeedControlsUI();
      }
    });

    presetBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = parseFloat(btn.getAttribute('data-speed'));
        if (Number.isFinite(val)) setSpeed(val);
      });
    });

    btnUndo.addEventListener('click', undoLastStop);
    btnReverse.addEventListener('click', reverseRoute);
    btnClear.addEventListener('click', clearRoute);

    portSelect.addEventListener('change', () => {
      const portId = portSelect.value;
      if (!portId) return;
      const port = PRESET_PORTS.find((p) => p.id === portId);
      portSelect.value = '';
      if (port) {
        addPortStop(port, true);
      }
    });

    window.addEventListener('resize', handleResize);
  }

  // Register Offline Service Worker
  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      });
    }
  }

  // Initialize application
  function init() {
    loadState();
    populatePortDropdown();
    applyTheme();
    bindUIEvents();
    initChartInteractions();
    initRouterWorker();
    handleResize();
    recomputeLegs();
    registerServiceWorker();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
