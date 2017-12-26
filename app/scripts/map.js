// code adapted from https://www.mapbox.com/mapbox.js/example/v1.0.0/markers-with-image-slideshow/

mapboxgl.accessToken = config.accessToken;

var map = new mapboxgl.Map({
  container: 'map',
  style: config.initialStyle,
  center: config.initialCenter,
  zoom: config.initialZoom
});

map.on('style.load', function() {
  map.addSource("points", {
    "type": "geojson",
    "data": {
      "type": "FeatureCollection",
      "features": []
    }
  });

  Object.keys(layers).forEach(function(key) {

    var regexname = /\D*(\d*)/;
    var name = regexname.exec(key)[1];

    map.addSource(name, {
      type: 'raster',
      url: layers[key]
    });

    map.addLayer({
      'id': name,
      'type': 'raster',
      'source': name,
      'layout': {
        'visibility': 'none'
      }
    });

  });

  map.addLayer({
    "id": "points",
    "type": "symbol",
    "source": "points",
    "layout": {
      "icon-image": "{marker-symbol}-15",
      "text-field": "{title}",
      "text-size": 10,
      "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
      "text-offset": [0, 0.6],
      "text-anchor": "top"
    }
  });

  // Add zoom and rotation controls to the map.
  var nav = new mapboxgl.NavigationControl();
  map.addControl(nav,
    'top-left');
  // See https://www.mapbox.com/mapbox-gl-js/example/popup-on-click/
  // Use the same approach as above to indicate that the symbols are clickable
  // by changing the cursor style to 'pointer'.
  map.on('mousemove', function(e) {
    var features = map.queryRenderedFeatures(e.point, {
      layers: ['points']
    });
    map.getCanvas().style.cursor = (features.length) ? 'pointer' :
      '';
  });
});

// See https://www.mapbox.com/mapbox-gl-js/example/popup-on-click/
// When a click event occurs near a place, open a popup at the location of
// the feature, with description HTML from its properties.
map.on('click', function(e) {
  var features = map.queryRenderedFeatures(e.point, {
    layers: ['points']
  });

  if (!features.length) {
    return;
  }

  var feature = features[0];
  var images = JSON.parse(feature.properties.images);
  var slideshowContent = '';

  if (typeof images !== "undefined") {
    for (var i = 0; i < images.length; i++) {
      var img = images[i];

      slideshowContent += '<div class="image' + (i === 0 ? ' active' :
          '') +
        '">' +
        formatMedia(img) +
        '<div class="caption">' + img.description + '</div>' +
        '</div>';
    }
  }

  // Adds corresponding HTML element to format the media formats appropriately.
  // The list of acceptable formats may be expanded as necessary.
  function formatMedia(img) {
    if (img.format === "YouTube") {
      return "<iframe width='175' src='" + img.url +
        "' frameborder='0' allowfullscreen=''></iframe>";
    }
    if (img.format === "Image") {
      return "<img src='" + img.url + "'/>";
    }
  }

  // Create custom popup content
  var popupContent = '<div id="' + feature.properties.id +
    '" class="popup">' +
    '<h4>' + feature.properties.title + '</h4>' +
    '<div class="slideshow">' +
    slideshowContent +
    '</div>' +
    '<div class="cycle">' +
    '<a href="#" class="prev">&laquo; Previous</a>' +
    '<a href="#" class="next">Next &raquo;</a>' +
    '</div>';
  '</div>';

  // Populate the popup and set its coordinates
  // based on the feature found.
  var popup = new mapboxgl.Popup()
    .setLngLat(feature.geometry.coordinates)
    .setHTML(popupContent)
    .addTo(map);
});

// This example uses jQuery to make selecting items in the slideshow easier.
// Download it from http://jquery.com
$('#map').on('click', '.popup .cycle a', function() {
  var $slideshow = $('.slideshow'),
    $newSlide;

  if ($(this).hasClass('prev')) {
    $newSlide = $slideshow.find('.active').prev();
    if ($newSlide.index() < 0) {
      $newSlide = $('.image').last();
    }
  } else {
    $newSlide = $slideshow.find('.active').next();
    if ($newSlide.index() < 0) {
      $newSlide = $('.image').first();
    }
  }

  $slideshow.find('.active').removeClass('active').hide();
  $newSlide.addClass('active').show();
  return false;
});

// Get the points from Cloudant using JSONP
// http://stackoverflow.com/questions/14220321/how-to-return-the-response-from-an-ajax-call
$(function() {

  // list views from Cloudant that we want to offer as layers
  var cloudantViews = [];
  $.getJSON(config.cloudantURLBase + config.cloudantURLDesign,
    function(result) {
      var viewsList = result.views;
      for (var v in viewsList) {
        cloudantViews.push(v);
      }

      // put each view into the dropdown menu
      $.each(cloudantViews, function(i, viewname) {
        $('#layers-dropdown').append('<option value="' +
          viewname +
          '">' +
          viewname + '</option>');
      });
    });

  // when the user selects from the dropdown, change the layer
  $('#layers-dropdown').change(function() {
    var selection_label = $('#layers-dropdown option:selected').text();
    var selection_value = $('#layers-dropdown').val();
    if (selection_value !== 'default') {
      var thisCloudantView = selection_value;
      getLayer(processLayer, thisCloudantView);
    }
    $("#searchText").val(""); // empty the searchbox when choosing a layer
  });
});

$("#search").submit(function(event) {
  event.preventDefault();
  var searchText = $("#searchText").val();
  $('#layers-dropdown').val("default"); // reset the dropdown to default value
  searchPoints(getPoints, searchText);
});

function getLayer(callback, cloudantView) {
  var thisCloudantURL = config.cloudantURLBase + config.cloudantURLDesign +
    "_view/" + cloudantView + "?callback=?";
  $.getJSON(thisCloudantURL, function(result) {
    var points = result.rows;
    var geoJSON = [];
    for (var i in points) {
      geoJSON["locations"] = geoJSON.push(points[i].value);
    }
    var featureCollection = {
      "type": "FeatureCollection",
      "features": geoJSON
    };
    callback(featureCollection);
  });
}

// See http://stackoverflow.com/questions/19916894/wait-for-multiple-getjson-calls-to-finish
function searchPoints(callback, cloudantSearch) {
  var cloudantURLBase = config.cloudantURLBase + config.cloudantURLDesign +
    "_search/ids?q=";
  var cloudantURLcallback = "&callback=?";
  var thisCloudantURL = cloudantURLBase + cloudantSearch +
    cloudantURLcallback;
  $.getJSON(thisCloudantURL, function(result) {
    var ids = [];
    var rows = result.rows;
    if (rows.length > 0) {
      callback(rows);
    } else {
      showAlert('alert-noresults');
    }
  });
}

function getPoints(cloudantIDs) {
  var geoJSON = [];
  if (typeof cloudantIDs !== "undefined") {
    for (var i in cloudantIDs) {
      geoJSON.push(getPoint(cloudantIDs[i].id));
    }
  }

  function getPoint(id) {
    var url = config.cloudantURLBase + id;
    return $.getJSON(url); // this returns a "promise"
  }

  $.when.apply($, geoJSON).done(function() {
    // This callback will be called with multiple arguments,
    // one for each AJAX call
    // Each argument is an array with the following structure: [data, statusText, jqXHR]
    var geoJSON = [];
    // If a single object comes back, it will be as an object not an array of objects.
    if (Array.isArray(arguments[0])) {
      for (var i in arguments) {
        geoJSON.push(arguments[i][0]);
      }
      var featureCollection = {
        "type": "FeatureCollection",
        "features": geoJSON
      };
      processLayer(featureCollection);
    } else if (typeof arguments[0] !== 'undefined') {
      geoJSON.push(arguments[0]);
      var featureCollection = {
        "type": "FeatureCollection",
        "features": geoJSON
      };
      processLayer(featureCollection);
    }
  });
}

function processLayer(result) {
  // Add features to the map
  // TODO: Iterate through all maps, turning all layers visiblility: none

  var selection_label = $('#layers-dropdown option:selected').text();
  if (layers[selection_label] != "undefined") {
    var unselected = $('#layers-dropdown option:not(:selected)');
    // TODO: remove hardcoded '5'
    for (var i = 1; i < 5; i++) {
      map.setLayoutProperty(unselected[i]['innerHTML'], 'visibility',
        'none');
    }
    map.setLayoutProperty(selection_label, 'visibility', 'visible');
  } else new_id = config.initialStyle;
  map.getSource('points').setData(result);
}

// Show and hide the alert box
function showAlert(alert_id) {
  $("#" + alert_id).css({
    "display": "block"
  }).addClass("in");
  window.setTimeout(function() {
    hideAlert(alert_id);
  }, 4000);
}

function hideAlert(alert_id) {
  $("#" + alert_id).removeClass("in").css({
    "display": "none"
  });
}
