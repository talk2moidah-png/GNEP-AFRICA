// Guarded Data Layer Control for Cesium Viewer (Progressive Enhancement)
(function () {
    'use strict';
    var modisInput = document.getElementById('layer-gibs-modis');
    var s2Input = document.getElementById('layer-copernicus-s2');
    var container = document.getElementById('cesiumContainer');

    // Do not start polling if the Cesium container or layer controls are not present on the page
    if (!container || (!modisInput && !s2Input)) {
        return;
    }

    var attempts = 0;
    var maxAttempts = 50; // Stop polling after 10 seconds if Cesium fails or is disabled
    var waitForViewer = setInterval(function () {
        attempts += 1;
        if (window.cesiumViewer && window.Cesium) {
            clearInterval(waitForViewer);
            initLayerControls(window.cesiumViewer, window.Cesium);
        } else if (attempts >= maxAttempts) {
            clearInterval(waitForViewer);
        }
    }, 200);

    function initLayerControls(viewer, Cesium) {
        var layerMap = {};
        var providers = {};
        try {
            providers['gibs-modis'] = new Cesium.UrlTemplateImageryProvider({
                url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/2023-01-01/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg',
                credit: new Cesium.Credit('NASA GIBS MODIS Terra True Color'),
                tilingScheme: new Cesium.WebMercatorTilingScheme()
            });
            providers['copernicus-s2'] = new Cesium.UrlTemplateImageryProvider({
                url: 'https://tiles.maps.eox.at/s2cloudless/{z}/{x}/{y}.jpg',
                credit: new Cesium.Credit('Copernicus Sentinel-2 Cloudless'),
                tilingScheme: new Cesium.WebMercatorTilingScheme()
            });
        } catch (err) {
            console.warn('[GNEP Data Layers] Provider initialization skipped:', err);
            return;
        }

        function toggleLayer(key, enable) {
            if (!providers[key] || !viewer || !viewer.scene) return;
            try {
                if (enable) {
                    layerMap[key] = viewer.scene.imageryLayers.addImageryProvider(providers[key]);
                } else if (layerMap[key]) {
                    viewer.scene.imageryLayers.remove(layerMap[key]);
                    delete layerMap[key];
                }
            } catch (e) {
                console.warn('[GNEP Data Layers] Failed to toggle layer:', key, e);
            }
        }

        if (modisInput) {
            modisInput.addEventListener('change', function (e) {
                toggleLayer('gibs-modis', e.target.checked);
            });
        }
        if (s2Input) {
            s2Input.addEventListener('change', function (e) {
                toggleLayer('copernicus-s2', e.target.checked);
            });
        }
    }
})();
