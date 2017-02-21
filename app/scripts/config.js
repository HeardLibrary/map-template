// ACTION ITEM: Set the variables for your map in this configuration file

var config = {
  // ACTION ITEM: replace mapbox access token below with your own mapbox access token
  // and set intial map style, center, and zoom.
  accessToken: "pk.eyJ1IjoicmFtb25hMjAyMCIsImEiOiI2ZjQzZTA4N2QxNjA5NzM2YjVhZTMwY2M1YmI2M2I2YSJ9.U1IwzOSQO-xjLU7NPxo-Dw",
  // ACTION ITEM: Replace mapbox id below with the mapbox id that corresponds to your georeferenced map.
  initialStyle: "mapbox://styles/ramona2020/civ45jd8x000b2jobbs53k0ua",
  initialCenter: [-71.06, 42.36], // Boston
  initialZoom: 12,
  // ACTION ITEM: Replace cloudant database URL and design with
  // corresponding URL and design for your database.
  cloudantURLBase: "https://ramonav.cloudant.com/mapping-boston/",
  cloudantURLDesign: "_design/tour/",
}

var layers = {
  // ACTION ITEM: If you would like to incorporate multiple views into your mapping application, remove the double slashes.
  // ACTION ITEM: Remember to replace your selection  with the corresponding map.
  Somerville: "mapbox://ramona2020.4tm1idpm"
}
