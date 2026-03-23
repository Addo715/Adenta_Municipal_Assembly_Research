// ============================================================
// STUDY AREA MAP - GHANA WITH ALL DISTRICTS + ADENTA HIGHLIGHTED
// Google Earth Engine | With Google Drive Export
// ============================================================

// 1. LOAD ADMINISTRATIVE BOUNDARIES
var countries = ee.FeatureCollection('FAO/GAUL/2015/level0');
var districts  = ee.FeatureCollection('FAO/GAUL/2015/level2');

// 2. FILTER GHANA AND ALL ITS DISTRICTS
var ghana = countries.filter(ee.Filter.eq('ADM0_NAME', 'Ghana'));

var ghanaDistricts = districts.filter(
  ee.Filter.eq('ADM0_NAME', 'Ghana')
);

// 3. FILTER ADENTA MUNICIPAL ASSEMBLY
var adenta = districts.filter(
  ee.Filter.and(
    ee.Filter.eq('ADM0_NAME', 'Ghana'),
    ee.Filter.or(
      ee.Filter.eq('ADM2_NAME', 'Adentan'),
      ee.Filter.eq('ADM2_NAME', 'Adenta'),
      ee.Filter.eq('ADM2_NAME', 'Adenta Municipal')
    )
  )
);

// DEBUG: Check if Adenta was found
print('Adenta found (should be > 0):', adenta.size());
print('Adenta name:', adenta.aggregate_array('ADM2_NAME'));

// If size = 0, uncomment to search all district names:
// print('All Ghana districts:', ghanaDistricts.aggregate_array('ADM2_NAME'));

// ── STEP 4: PAINT LAYERS ────────────────────────────────────

var ghanaFill = ee.Image().byte().paint({
  featureCollection: ghana, color: 1
});

var districtBorders = ee.Image().byte().paint({
  featureCollection: ghanaDistricts, color: 1, width: 1
});

var ghanaOutline = ee.Image().byte().paint({
  featureCollection: ghana, color: 1, width: 2
});

var adentaFill = ee.Image().byte().paint({
  featureCollection: adenta, color: 1
});

var adentaBorder = ee.Image().byte().paint({
  featureCollection: adenta, color: 1, width: 2
});

// ── STEP 5: SET MAP VIEW ────────────────────────────────────
Map.setCenter(-1.0, 7.9, 7);
Map.setOptions('ROADMAP');

// ── STEP 6: ADD LAYERS ──────────────────────────────────────
Map.addLayer(ghanaFill,
  {palette: ['#A8D5A2'], min: 0, max: 1}, 'Ghana Fill');

Map.addLayer(districtBorders,
  {palette: ['#888888'], min: 0, max: 1}, 'District Boundaries');

Map.addLayer(ghanaOutline,
  {palette: ['#2E6B2E'], min: 0, max: 1}, 'Ghana Outer Border');

Map.addLayer(adentaFill,
  {palette: ['#FFF176'], min: 0, max: 1}, 'Adenta Municipal Assembly');

Map.addLayer(adentaBorder,
  {palette: ['#E65100'], min: 0, max: 1}, 'Adenta Border');

// ── STEP 7: PRINT INFO ──────────────────────────────────────
print('Total Ghana districts:', ghanaDistricts.size());
print('Adenta centroid:', adenta.geometry().centroid());

// ============================================================
// EXPORTS TO GOOGLE DRIVE
// After running the script, go to the "Tasks" tab (top right)
// in GEE and click RUN next to each export task
// ============================================================

// ── EXPORT 1: MAP IMAGE (PNG/GeoTIFF) TO GOOGLE DRIVE ──────
// This saves the full styled Ghana + Adenta map as an image
var exportImage = ghanaFill
  .visualize({palette: ['#A8D5A2'], min: 0, max: 1})
  .blend(districtBorders.visualize({palette: ['#888888'], min: 0, max: 1}))
  .blend(ghanaOutline.visualize({palette: ['#2E6B2E'], min: 0, max: 1}))
  .blend(adentaFill.visualize({palette: ['#FFF176'], min: 0, max: 1}))
  .blend(adentaBorder.visualize({palette: ['#E65100'], min: 0, max: 1}));

Export.image.toDrive({
  image: exportImage,
  description: 'Ghana_Districts_Adenta_Map',   // file name in Drive
  folder: 'GEE_Adenta_Exports',               // folder in your Drive
  region: ghana.geometry().bounds(),
  scale: 500,                                  // 500m = good for full Ghana
  maxPixels: 1e13,
  crs: 'EPSG:4326',
  fileFormat: 'GeoTIFF'                        // change to 'PNG' if preferred
});

// ── EXPORT 2: GHANA BOUNDARY AS SHAPEFILE TO GOOGLE DRIVE ──
Export.table.toDrive({
  collection: ghana,
  description: 'Ghana_Boundary_Shapefile',
  folder: 'GEE_Adenta_Exports',
  fileFormat: 'SHP'
});

// ── EXPORT 3: ALL GHANA DISTRICTS AS SHAPEFILE ─────────────
Export.table.toDrive({
  collection: ghanaDistricts,
  description: 'Ghana_All_Districts_Shapefile',
  folder: 'GEE_Adenta_Exports',
  fileFormat: 'SHP'
});

// ── EXPORT 4: ADENTA BOUNDARY AS SHAPEFILE ─────────────────
Export.table.toDrive({
  collection: adenta,
  description: 'Adenta_Municipal_Boundary',
  folder: 'GEE_Adenta_Exports',
  fileFormat: 'SHP'
});

// ── EXPORT 5: HIGH RESOLUTION ADENTA ONLY MAP ──────────────
// Zoomed in export of just Adenta at higher resolution
var adentaExportImage = ghanaFill
  .visualize({palette: ['#A8D5A2'], min: 0, max: 1})
  .blend(districtBorders.visualize({palette: ['#888888'], min: 0, max: 1}))
  .blend(adentaFill.visualize({palette: ['#FFF176'], min: 0, max: 1}))
  .blend(adentaBorder.visualize({palette: ['#E65100'], min: 0, max: 1}));

Export.image.toDrive({
  image: adentaExportImage,
  description: 'Adenta_Municipal_Map_HighRes',
  folder: 'GEE_Adenta_Exports',
  region: adenta.geometry().bounds(),          // zoomed to Adenta only
  scale: 30,                                   // 30m = high resolution
  maxPixels: 1e13,
  crs: 'EPSG:32630',                           // UTM Zone 30N (best for Ghana)
  fileFormat: 'GeoTIFF'
});

print('── EXPORT INSTRUCTIONS ──');
print('1. Click the TASKS tab on the top right of GEE');
print('2. You will see 5 export tasks listed');
print('3. Click RUN next to each one');
print('4. Files will save to GEE_Adenta_Exports folder in your Google Drive');