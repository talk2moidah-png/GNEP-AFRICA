// Data Layer Control for Cesium Viewer
(function(){
  // Wait until Cesium viewer is available
  const waitForViewer = setInterval(() => {
    if (window.cesiumViewer) {
      clearInterval(waitForViewer);
      initLayerControls();
    }
  }, 200);

  function initLayerControls(){
    const viewer = window.cesiumViewer;
    const layerMap = {};

    const providers = {
      'gibs-modis': new Cesium.UrlTemplateImageryProvider({
        url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/2023-01-01/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg',
        credit: new Cesium.Credit('NASA GIBS MODIS Terra True Color'),
        tilingScheme: new Cesium.WebMercatorTilingScheme()
      }),
      'copernicus-s2': new Cesium.UrlTemplateImageryProvider({
        url: 'https://tiles.maps.eox.at/s2cloudless/{z}/{x}/{y}.jpg', // public Sentinel‑2 cloudless basemap
        credit: new Cesium.Credit('Copernicus Sentinel‑2 Cloudless'),
        tilingScheme: new Cesium.WebMercatorTilingScheme()
      })
    };

    document.getElementById('layer-gibs-modis').addEventListener('change', function(e){
      toggleLayer('gibs-modis', e.target.checked);
    });
    document.getElementById('layer-copernicus-s2').addEventListener('change', function(e){
      toggleLayer('copernicus-s2', e.target.checked);
    });

    function toggleLayer(key, enable){
      if (enable){
        const imagery = viewer.scene.imageryLayers.addImageryProvider(providers[key]);
        layerMap[key] = imagery;
      } else if (layerMap[key]){
        viewer.scene.imageryLayers.remove(layerMap[key]);
        delete layerMap[key];
      }
    }
  }
})();
