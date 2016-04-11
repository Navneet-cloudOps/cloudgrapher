!function e(t,r,n){function a(i,u){if(!r[i]){if(!t[i]){var s="function"==typeof require&&require;if(!u&&s)return s(i,!0);if(o)return o(i,!0);var c=new Error("Cannot find module '"+i+"'");throw c.code="MODULE_NOT_FOUND",c}var l=r[i]={exports:{}};t[i][0].call(l.exports,function(e){var r=t[i][1][e];return a(r?r:e)},l,l.exports,e,t,r,n)}return r[i].exports}for(var o="function"==typeof require&&require,i=0;i<n.length;i++)a(n[i]);return a}({1:[function(e,t,r){var n=e("./findedges").findEdges;r.graphOptions={nodes:{brokenImage:"images/unknown.png"},edges:{style:"arrow","color.highlight":"red"},stabilize:!0,zoomExtentOnStabilize:!0},r.collectData=function(e){"use strict";var t={nodes:[],edges:[]},r=[],a=[],o=function(e){a.push({from:this,to:e.toResource,title:e.label})};for(var i in e.Resources){var u=e.Resources[i],s=u.Properties,c=u.Type.toLowerCase().replace(/::/g,"-");r.push(i),t.nodes.push({id:i,label:i,group:c,shape:"image",image:"images/"+c+".png"}),n(s).forEach(o,i)}return t.edges=a.filter(function(e){return e&&r.indexOf(e.to)>=0}),t},r.collectCyData=function(e){"use strict";var t={},r=[],a={"AWS::EC2::SecurityGroupIngress":function(e){if("GroupId"===e.data.title);else if("SourceSecurityGroupId"===e.data.title){var t=e.data.source;e.data.source=e.data.target,e.data.target=t}return!0},"AWS::EC2::SecurityGroupEgress":function(e){if("DestinationSecurityGroupId"===e.data.title);else if("GroupId"===e.data.title){var t=e.data.source;e.data.source=e.data.target,e.data.target=t}return!0},"default":function(e,r,n){return n&&"AWS::EC2::SecurityGroup"===n.type&&"AWS::EC2::SecurityGroup"!==r.type?(t[e.data.source].data.parent=e.data.target,!1):!0},get:function(e){return this[e]||this["default"]}},o={nodes:[],edges:[]},i=0,u=function(e){r.push({data:{id:"e"+i++,source:this,target:e.toResource,title:e.label,targetProperty:e.toProperty}})};for(var s in e.Resources){var c=e.Resources[s],l={data:{id:s},classes:c.Type.toLowerCase().replace(/::/g,"-"),type:c.Type};n(c.Properties).forEach(u,s),t[s]=l,o.nodes.push(l)}return o.edges=r.filter(function(e){var r=t[e.data.source],n=t[e.data.target],o=a.get(r.type);return e&&r&&n&&o(e,r,n)}),o}},{"./findedges":3}],2:[function(e,t,r){!function(){"use strict";var t,r=$("#graph_area"),n=e("./queryparser"),a=$("#remote_input"),o=function(e){r.css("background-image",e?"":'url("images/aws-cloudformation-template.svg")')},i=new CodeMirror(document.getElementById("editor"),{value:"{}",lineNumbers:!0,mode:"application/json",foldGutter:!0,gutters:["CodeMirror-linenumbers","CodeMirror-foldgutter","CodeMirror-lint-markers"]});i.setSize("100%","800px");var u=e("./template").template({editor:{setValue:function(e){i.getDoc().setValue(e)},getValue:function(){return i.getDoc().getValue()}},cytolib:cytoscape,graphContainer:r[0],jsonproxy:$.jsonp}),s=function(e){return u.hasChanged()?e&&"beforeunload"===e.type?(e.returnValue="The current template has unsaved changes.","The current template has unsaved changes."):window.confirm("The current template has unsaved changes. Continue loading?"):void 0},c=function(e,t){!t||u.hasChanged()&&!s()||e(t,function(e){if(o(!0),"string"==typeof t){a.val()!==t&&a.val(t);var r=n.createEmbedUrl(window.location,t);$("#embed_link").html('Use <a href="'+r+'">'+r+"</a> to open directly")}else a.val(""),$("#embed_link").html("");alertify.success('Loaded template "'+e+'" successfully')},function(e,t,r){u.setData('{"Error": "Unable to load template '+e+" because of "+t+'" }',o),alertify.error('Unable to load template "'+e+'" because of '+t),console.log(r)})};$.ajax({url:"styles/main.cycss",type:"GET",dataType:"text",success:function(e){u.changeStyle(e)}});var l=function(){u.refreshGraph(),$("#embed_link").toggle(!u.hasChanged()),t=void 0};i.setOption("lint",{onUpdateLinting:function(e){!u||e&&0!==e.length||(t&&window.clearTimeout(t),t=window.setTimeout(l,300))}}),r[0].addEventListener("dragover",function(e){e.stopPropagation(),e.preventDefault(),e.dataTransfer.dropEffect="copy"},!1),r[0].addEventListener("drop",function(e){e.stopPropagation(),e.preventDefault(),c(u.fromFile,e.dataTransfer.files[0])},!1);var f=!1,p=0,d=function(){var e=a.val();return a[0].checkValidity()?(a.hide(),e):void 0};$("#remote_input").keypress(function(e){return 13===e.which?(c(u.fromURL,d()),!1):void 0}),$("#open_template").click(function(e){e.preventDefault(),$("#template_input").click()}),$("#template_input").change(function(e){c(u.fromFile,e.target.files[0])}),$("#open_url").click(function(e){e.preventDefault(),a.is(":visible")?c(u.fromURL,d()):a.show()}),$("#save_template").click(function(e){return e.preventDefault(),saveAs(new Blob([u.text(2)],{type:"text/plain;charset=utf-8"}),u.description()+".json"),!1}),$("#save_graph").click(function(e){e.preventDefault();var t=window.open("savegraph.html");return t.onload=function(){t.document.getElementById("graphPNG").src=u.base64Image()},!1}),$("#graph_layout").change(function(){u.setLayout($("#graph_layout").val())});var g=$("#container"),h=$("#editor_pane");$("#border").on("mousedown",function(e){f=!0,p=e.clientX}),$(document).on("mousemove",function(e){if(f){var t=g.width()-(e.clientX-g.offset().left);r.css("right",t),h.css("width",t)}}).on("mouseup",function(){f&&u.fitGraph(),f=!1}),$(document).ready(function(){o(),n.parser(window.location.search,{onTemplate:function(e){c(u.fromURL,e)}}),window.addEventListener("beforeunload",s)})}()},{"./queryparser":4,"./template":5}],3:[function(e,t,r){r.findEdges=function n(e,t){"use strict";var r=[];if(e instanceof Array)e.forEach(function(e){r.push(n(e,t||""))});else if("object"==typeof e)if(1===Object.keys(e).length){var a=Object.keys(e)[0];if("Ref"===a&&"string"==typeof e[a])r.push({label:t||"",toResource:e[a],toProperty:t||""});else if("Fn::Join"===a&&e[a]instanceof Array)e[a][1].forEach(function(t){r.push(n(t,e[a][1].join(e[a][0])))});else if("Fn::GetAtt"===a&&e[a]instanceof Array)r.push({label:t,toResource:e[a][0],toProperty:e[a][1]});else for(var o in e)r.push(n(e[o],o))}else for(var i in e)r.push(n(e[i],i));return[].concat.apply([],r)}},{}],4:[function(e,t,r){r.parser=function(e,t){"use strict";if(e){var r=new URI(e).search(!0);r.CFTemplateURL&&t.onTemplate&&t.onTemplate(r.CFTemplateURL)}},r.createEmbedUrl=function(e,t){"use strict";return new URI(e).search(function(e){e.CFTemplateURL=t})}},{}],5:[function(e,t,r){r.template=function(t){"use strict";var r,n,a,o=t.editor,i=e("./collectdata"),u=t.graphContainer,s=t.jsonproxy,c=t.cytolib||cytoscape,l="grid";if(!o||!o.getValue)throw"editor unavailable or doesn't support getValue";if(!c)throw"graphing library Cytoscape unavailable";var f=function(){return JSON.parse(o.getValue())},p=function(e){return e?JSON.stringify(f(),null,e):o.getValue()},d=function(e){n=e,r&&r.style(n)},g=function(e,t){if(!t&&!u)throw"No container available to show data";r=c({container:t||u,elements:e,style:n,layout:{name:l,padding:5}}),r.boxSelectionEnabled(!0)},h=function(e,t,r){if(e)try{var n="string"==typeof e?e:JSON.stringify(e,null,2),u="object"==typeof e?e:JSON.parse(e);o.setValue(n),a=p(),g(i.collectCyData(u)),t&&t()}catch(s){r&&r("Error processing data as JSON",s)}else r&&r("No data")},m=function(e,t,r){var n=new FileReader;n.onload=function(){h(n.result,function(){t&&t(e.name)},function(t,n){r&&r(e.name,t,n)})};try{n.readAsText(e)}catch(a){r&&r(e.name,a)}},y=function(){g(i.collectCyData(f()))},v=function(){var e="template";try{e=f().Description}catch(t){}return e},b=function(){return r?(r.center(),r.fit(),r.png({full:!1})):void 0},w=function(e){l=e,r&&r.layout({name:e,fit:!0,animate:!1})},E=function(e,t,r){if(!s)throw"No jsonproxy available to request URLs";e&&s({url:e,corsSupport:!0,success:function(r){h(r),t&&t(e)},error:function(t,n){var a;"parsererror"===n?(o.setValue(t.responseText),a="Unable to parse the result as valid JSON"):a="Unable to load: status "+t.status+" "+t.statusText,r&&r(e,a,t,n)}})},C=function(){r&&r.fit()},S=function(){var e=a===p();return a?!e:!1};return{setData:h,fromFile:m,fromURL:E,refreshGraph:y,setLayout:w,base64Image:b,description:v,changeStyle:d,fitGraph:C,text:p,json:f,hasChanged:S,initialData:a}}},{"./collectdata":1}]},{},[2]);
//# sourceMappingURL=edit.bundle.js.map
