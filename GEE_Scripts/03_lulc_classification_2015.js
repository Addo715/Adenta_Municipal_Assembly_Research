
//Add landsat 7 collection
var landsat8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_TOA")
               .filterDate('2015-01-01','2015-12-30')
               .filterMetadata('CLOUD_COVER','less_than', 7)
               .filterBounds(AOI)
               .median()
               .clip(AOI)
               

//visualization parameters

var vis_params = {
  bands:['B4', 'B3', 'B2'],
  min: 0,
  max: 3000,
  gamma:1.4
};
Map.addLayer(landsat8, vis_params, "Landsat8 Composite" )
Map.centerObject(AOI, 10);
 
 
//traning data 
var label = 'Class';
var bands = ['B1', 'B2', 'B3', 'B4', 'B5', 'B7', 'B8', 'B9', 'B10', 'B11'];
var input = landsat8.select(bands);

var training = Vegetation.merge(Bareland).merge(Waterbody).merge(Builtup).merge(Farmland);
print(training);

//Sample regions to create training data and test dataset

var trainImage = input.sampleRegions({
  collection: training,
  properties: [label],
  scale: 30
});
print(trainImage);

var trainingData = trainImage.randomColumn();
var trainSet = trainingData.filter(ee.Filter.lessThan('random', 0.8));  // Training data
var testSet = trainingData.filter(ee.Filter.greaterThanOrEquals('random', 0.8));  // Validation data

//Classification Model
var classifier = ee.Classifier.smileCart().train(trainSet, label, bands);

//Image Classification
var classified = input.classify(classifier);

//Classification results

Map.addLayer(classified, {
  palette: ['blue', 'yellow', 'green', 'lightgreen', 'red'],
  min: 0, max:4
  }, 'Land Cover 2015'); 


//   export of the file from GEE to google drive 

// FIRST CONVERT RASTER TO VECTOR
var vector = classified.reduceToVectors({
  geometry: AOI,
  scale: 30,
  geometryType: 'polygon',
  eightConnected: false,
  labelProperty: 'class',
  maxPixels: 1e13
});

// EXPORT AS SHAPEFILE (.shp, .shx, .prj, .dbf, .cpg)
Export.table.toDrive({
  collection: vector,
  description: 'LULC_Adenta_2015_SHP',
  folder: 'GEE_Adenta_LULC',
  fileNamePrefix: 'LULC_Adenta_2015',
  fileFormat: 'SHP'
});

// EXPORT AS GEOTIFF RASTER (.tif)
Export.image.toDrive({
  image: classified,
  description: 'LULC_Adenta_2015_TIF',
  folder: 'GEE_Adenta_LULC',
  fileNamePrefix: 'LULC_Adenta_2015',
  region: AOI,
  scale: 30,
  maxPixels: 1e13,
  fileFormat: 'GeoTIFF'
});

print('── TASKS TAB → CLICK RUN ON BOTH EXPORTS ──');
print('SHP  → LULC_Adenta_2015.shp');
print('TIFF → LULC_Adenta_2015.tif');
print('Both saved to GEE_Adenta_LULC in Google Drive');