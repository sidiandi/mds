require.config({
  shim: {
    "jquery.hotkeys": [
      "jquery"
    ]
  },
  paths: {
    "golden-layout": "../bower_components/golden-layout/dist/goldenlayout.min",
    jquery: "../bower_components/jquery/dist/jquery",
    "jquery-throttle-debounce": "../bower_components/jquery-throttle-debounce/jquery.ba-throttle-debounce",
    "jquery-ui": "../bower_components/jquery-ui/jquery-ui",
    "jquery.hotkeys": "../bower_components/jquery.hotkeys/jquery.hotkeys",
    requirejs: "../bower_components/requirejs/require",
    app: "../app"
  },
  packages: [

  ]
});

requirejs(['app/main']);
