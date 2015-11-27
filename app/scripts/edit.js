/* jshint devel:true */
/* global cytoscape, saveAs, require, CodeMirror, alertify */

(function(){'use strict';
  var collector = require('./collectdata');
  var myCodeMirror = new CodeMirror(document.getElementById('editor'), {
    value: '{}',
    lineNumbers: true,
    mode: 'application/json',
    foldGutter: true,
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
    lint: {
      onUpdateLinting: function (annotations) {
        if (template && (! annotations || annotations.length === 0)) {
          template.show( collector.collectCyData(JSON.parse (myCodeMirror.getDoc().getValue() )));
        }
      }
    }
  });
  myCodeMirror.setSize('100%','800px');
  var graph;
  var graphStyleP = $.ajax({ url: 'styles/main.cycss', type: 'GET', dataType: 'text' });
  var isResizing = false,
  lastDownX = 0;

  var template = {

    load: function(file){
      var reader = new FileReader();
      reader.onload = function () {
        template.setData(reader.result);
      };
      reader.readAsText(file);
    },
    setData: function(data) {
      if(data) {
        try {
          var dataString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
          var dataObject = typeof data === 'object' ? data : JSON.parse(data);

          myCodeMirror.getDoc().setValue(dataString);
          template.show( collector.collectCyData( dataObject ) );
          $('#graph_area').css('background-image','');
        }
        catch (e) {
          console.log('ERROR processing data as JSON - ' + e );
          alertify.error(e);
        }
      }
    },
    show: function(data) {
      graph = cytoscape({
        container: document.getElementById('graph_area'),
        elements: data,
        style: graphStyleP,
        layout: {
          name: 'cose',
          padding: 5
        }
      });
      graph.boxSelectionEnabled(true);
    },
    description: function() {
      var description = 'template';
      try {
        description = JSON.parse(template.content()).Description;
      } catch (e) {}
      return description;
    },
    base64Image: function () {
      graph.center(); graph.fit();
      return graph.png({full: false});
    },
    content: function() { return myCodeMirror.getDoc().getValue(); },
      setLayout: function(name) {graph.layout( { 'name': name });},
    fromURL: function(url, success) {
      if ( url ) {
      $.jsonp({
        url: url,
        corsSupport: true,
        success: function (data) {
          template.setData(data);
          if (success) {
            success(data);
          }
        },
        error: function(data, textStatus) {
          console.log(textStatus );
          console.log( data);
          if (textStatus === 'parsererror') {
            myCodeMirror.getDoc().setValue(data.responseText);
            alertify.closeLogOnClick(true).error('Unable to parse result from ' + url + ' as valid JSON');
          }
          else {
          var message = 'ERROR: ' + data.status + ' ' + data.statusText + ': ' + url;
          alertify.closeLogOnClick(true).error(message);
          }
        }
        // error, etc.
      });
      }
    },
    fromURLInput: function(input) {
      var url = input.val();
      if (input[0].checkValidity()) {
        input.hide();
        template.fromURL( url, function() {
          alertify.success(url);
        });
      }
      else {
        return false;
      }
    }
  };

  var saveImage = function() {
    var saveWindow = window.open('savegraph.html');
    saveWindow.onload = function() {
      saveWindow.document.getElementById('graphPNG').src = template.base64Image();
    };
  };
  var saveTemplate = function() {
    var prettyDoc = JSON.stringify(JSON.parse(template.content()), null, 2);
    var blob = new Blob([prettyDoc], {type: 'text/plain;charset=utf-8'});
    saveAs(blob, template.description() + '.json');
  };
  var mainRow = document.getElementById('graph_area');
  mainRow.addEventListener('dragover', function(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
  }, false);
  mainRow.addEventListener('drop', function(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    template.load(evt.dataTransfer.files[0]);
  }, false);
  $('#graph_area').css('background-image','url("images/aws-cloudformation-template.svg")');
  $('#open_template').click(function(event){ event.preventDefault(); $('#template_input').click(); });
  $('#open_url').click(function(event) {
    event.preventDefault();
    var remoteInput = $('#remote_input');

    if (remoteInput.is(':visible')) {
      template.fromURLInput(remoteInput);
    }
    else {
      remoteInput.show();
    }
  });
  $('#template_input').change(function(event){ template.load(event.target.files[0]); });
  $('#save_template').click(function(event){ event.preventDefault(); saveTemplate(); return false;});
  $('#save_graph').click(function(event){ event.preventDefault(); saveImage(); return false;});
  $('#graph_layout').change(function() { template.setLayout( $('#graph_layout').val() ); });

  $('#remote_input').keypress(function(e){
    var remoteInput = $('#remote_input');
    if (e.which === 13){
      template.fromURLInput(remoteInput);
      return false;
    }
  });
  var container = $('#container'),
  left = $('#graph_area'),
    right = $('#editor_pane'),
    handle = $('#border');

  handle.on('mousedown', function (e) {
    isResizing = true;
    lastDownX = e.clientX;
  });

  $(document).on('mousemove', function (e) {
    // we don't want to do anything if we aren't resizing.
    if (!isResizing) {
      return;
    }

    var offsetRight = container.width() - (e.clientX - container.offset().left);

    left.css('right', offsetRight);
    right.css('width', offsetRight);
  }).on('mouseup', function () {
    if (isResizing && graph) {
      graph.fit();
    }
    // stop resizing
    isResizing = false;
  });
})();
