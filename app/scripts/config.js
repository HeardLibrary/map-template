// ACTION ITEM: Set the variables for your map in this configuration file

var config = {
  // ACTION ITEM: replace mapbox access token below with your own mapbox access token
  // and set intial map style, center, and zoom.
  accessToken: "pk.eyJ1IjoibWlza290dGUiLCJhIjoiOGp0VEpwUSJ9.sDOYAReEdCQfxFZuGDXBaQ",
  // ACTION ITEM: Replace mapbox id below with the mapbox id that corresponds to your georeferenced map.
  initialStyle: "mapbox://styles/mapbox/basic-v9",
  initialCenter: [13.38, 52.51], // Berlin
  initialZoom: 9,
  // ACTION ITEM: Replace cloudant database URL and design with
  // corresponding URL and design for your database.
  cloudantURLBase: "https://vulibrarygis.cloudant.com/map-berlin/",
  cloudantURLDesign: "_design/tour/",
}

var layers = {
  // ACTION ITEM: If you would like to incorporate multiple views into your mapping application, remove the double slashes.
  // ACTION ITEM: Remember to replace your selection  with the corresponding map.
  "1908": "vulibrarygis.l74iic1a",
  "1920": "vulibrarygis.l366jopj",
  "1936": "vulibrarygis.l369lc2l",
  "1947": "vulibrarygis.l36anlai",
  "1970": "vulibrarygis.l36db1a5"
}
