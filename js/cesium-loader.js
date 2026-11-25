// Cesium lazy‑loader
(function(){
  const container = document.getElementById('cesiumContainer');
  const fallback = document.getElementById('hero-webgl-container');
  if (!container) return;
  // Check WebGL availability
  const gl = document.createElement('canvas').getContext('webgl') || document.createElement('canvas').getContext('experimental-webgl');
  if (!gl) {
    // No WebGL – show fallback Three.js canvas
    fallback.style.display = 'block';
    if (window.initHeroWebGL) window.initHeroWebGL();
    return;
  }
  // Load Cesium from CDN
  const script = document.createElement('script');
  script.src = 'https://cesium.com/downloads/cesiumjs/releases/1.119/Build/Cesium/Cesium.js';
  script.async = true;
  script.onload = function(){
    // Cesium CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cesium.com/downloads/cesiumjs/releases/1.119/Build/Cesium/Widgets/widgets.css';
    document.head.appendChild(link);
    // Initialize Cesium viewer
    const viewer = new Cesium.Viewer('cesiumContainer', {
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      infoBox: false,
      fullscreenButton: false,
      selectionIndicator: false,
      imageryProvider: new Cesium.IonImageryProvider({ assetId: 2 }) // Bing Maps Aerial
    });
    // Add optional atmospheric effects
    viewer.scene.globe.enableLighting = true;
    // Hide fallback if it was visible
    fallback.style.display = 'none';
  };
  script.onerror = function(){
    // Fallback to Three.js if Cesium fails to load
    fallback.style.display = 'block';
    if (window.initHeroWebGL) window.initHeroWebGL();
  };
  document.body.appendChild(script);
})();
