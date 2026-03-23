// ============================================================
// ADENTA MUNICIPAL ASSEMBLY - ZOOMED IN MAP
// Google Earth Engine | With Google Drive Export
// ============================================================

// 1. LOAD BOUNDARIES
var districts = ee.FeatureCollection('FAO/GAUL/2015/level2');

// 2. FILTER ADENTA MUNICIPAL ASSEMBLY
var adenta = districts.filter(
  ee.Filter.and(
    ee.Filter.eq('ADM0_NAME', 'Ghana'),
    ee.Filter.or(
      ee.Filter.eq('ADM2_NAME', 'Adentan'),
      ee.Filter.eq('ADM2_NAME', 'Adenta')
    )
  )
);

var adentaGeom = adenta.geometry();

// 3. CREATE FILL AND BORDER LAYERS
var adentaFill = ee.Image().byte().paint({
  featureCollection: adenta,
  color: 1
});

var adentaBorder = ee.Image().byte().paint({
  featureCollection: adenta,
  color: 1,
  width: 3
});

// 4. CENTER MAP ON ADENTA (zoomed in)
Map.centerObject(adentaGeom, 13);
Map.setOptions('ROADMAP'); // Clean white background for export

// 5. ADD LAYERS - ALL YELLOW THEME
// Light yellow fill (semi-transparent)
Map.addLayer(adentaFill,
  {palette: ['#FFF176'], min: 0, max: 1, opacity: 0.6},
  'Adenta Fill (Light Yellow)');

// Darker yellow border so boundary is visible
Map.addLayer(adentaBorder,
  {palette: ['#F9A825'], min: 0, max: 1},
  'Adenta Boundary (Dark Yellow)');

// 6. PRINT BOUNDARY INFO
print('Adenta Municipal Assembly:', adenta);
print('Area (sq km):', adentaGeom.area().divide(1e6));
print('Adenta name check:', adenta.aggregate_array('ADM2_NAME'));

// ============================================================
// EXPORTS TO GOOGLE DRIVE
// After running, go to the TASKS tab and click RUN
// on each task to send files to your Google Drive
// ============================================================

// ── EXPORT 1: ADENTA MAP IMAGE (GeoTIFF) ───────────────────
// Saves the full styled Adenta map as an image file
var adentaMapExport = adentaFill
  .visualize({palette: ['#FFF176'], min: 0, max: 1})
  .blend(adentaBorder.visualize({palette: ['#F9A825'], min: 0, max: 1}));

Export.image.toDrive({
  image: adentaMapExport,
  description: 'Adenta_Municipal_Map_Image',   // file name in Drive
  folder: 'GEE_Adenta_Exports',               // folder in your Google Drive
  region: adentaGeom.bounds(),
  scale: 30,                                   // 30m high resolution
  maxPixels: 1e13,
  crs: 'EPSG:32630',                           // UTM Zone 30N - best for Ghana
  fileFormat: 'GeoTIFF'
});

// ── EXPORT 2: ADENTA MAP AS PNG ─────────────────────────────
// PNG version - easier to insert directly into Word/PowerPoint
Export.image.toDrive({
  image: adentaMapExport,
  description: 'Adenta_Municipal_Map_PNG',
  folder: 'GEE_Adenta_Exports',
  region: adentaGeom.bounds(),
  scale: 30,
  maxPixels: 1e13,
  crs: 'EPSG:32630',
  fileFormat: 'PNG'                            // PNG for easy insertion into docs
});

// ── EXPORT 3: ADENTA BOUNDARY AS SHAPEFILE ─────────────────
// Shapefile to use in ArcGIS or QGIS
Export.table.toDrive({
  collection: adenta,
  description: 'Adenta_Municipal_Boundary_SHP',
  folder: 'GEE_Adenta_Exports',
  fileFormat: 'SHP'
});

// ── EXPORT 4: ADENTA BOUNDARY AS KML ───────────────────────
// KML to open in Google Earth Pro
Export.table.toDrive({
  collection: adenta,
  description: 'Adenta_Municipal_Boundary_KML',
  folder: 'GEE_Adenta_Exports',
  fileFormat: 'KML'
});

// ── EXPORT 5: ADENTA BOUNDARY AS CSV ───────────────────────
// CSV with coordinates and attributes
Export.table.toDrive({
  collection: adenta,
  description: 'Adenta_Municipal_Boundary_CSV',
  folder: 'GEE_Adenta_Exports',
  fileFormat: 'CSV'
});

print('── EXPORT INSTRUCTIONS ──');
print('1. Click the TASKS tab on the top right of GEE');
print('2. You will see 5 export tasks listed');
print('3. Click RUN next to each task');
print('4. All files will save to GEE_Adenta_Exports in your Google Drive');
print('── COLOR REFERENCE ──');
print('Fill color  : #FFF176 (Light Yellow)');
print('Border color: #F9A825 (Dark Yellow)');