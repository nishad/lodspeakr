$(document).ready(function(){
    var relPos = "../lodspeakr/components/";
    var templateBuffer = "";
    var queryBuffer = "";
    
    $("#query-test-button").on('click', function(e){
      var query = $("#query-editor").val();
      var endpoint = $("#endpoint-list>option:selected").val();
      $("#results").empty();
      $("#query-test-button").addClass('disabled').html('<img src="../img/wait.gif"/>');
      executeQuery(query, endpoint);
    });
    $(".component-li").on({
        mouseenter: function(){
          $(this).children(".lodspk-delete-component").removeClass("hide");
        },
        mouseleave: function(){
          $(".lodspk-delete-component").addClass("hide");
        }
    });   

 function executePost(url, data, message){
      $.ajax({
         type: 'POST',
         url: url,
         data: data,
         success: function(data){if(data.success == true){
           $(message.id).removeClass('hide').addClass('alert-success').html(message.success).show().delay(2000).fadeOut("slow").removeClass('alert-success');
           if(message.triggerElement != undefined && message.triggerEvent != undefined ){
             $(message.triggerElement).trigger(message.triggerEvent);
           }else{
             setTimeout(window.location.reload(), 2000);
           }
         }else{
           $(message.id).removeClass('hide').addClass('alert-error').html(message.failure).show().delay(2000).fadeOut("slow").removeClass('alert-error');         
         }
         },
         error: function(data){
           $(message.id).removeClass('hide').addClass('alert-error').html(message.error).show().delay(2000).fadeOut("slow").removeClass('alert-error');
         },
         dataType: 'json'
     });
 }   
    
 $(".new-button").on("click", function(e){
     var componentName = prompt("Please enter the name of the new component","newComponent");
     if(componentName != null){
       var url   = "components/create/"+$(this).attr("data-type")+"/"+componentName;
       var data  = {content: $("#template-editor").val()};
       var msgId = "#component-msg";
       executePost(url, data, {id:msgId, success: "Saved!", failure: "Can't create new component. Probably permissions problem or component already exists", error: "Error creating a new component!"});
     }
 });

  $(".new-file-button").on("click", function(e){
     var componentName = prompt("Please enter the name of the new component","newComponent");
     if(componentName != null){
       var url   = "components/add/"+$(this).attr("data-component")+"/"+componentName;
       var data  = {content: $("#template-editor").val()};
       var msgId = "#component-msg";
       executePost(url, data, {id:msgId, success: "Saved!", failure: "Can't create new file. Probably permissions problem or file already exists", error: "Error creating a new file!"});
     }
  });
  
  $(".lodspk-delete-component").on({
      click: function(){
        var componentName = $(this).attr("data-component-name");
        var componentType = $(this).attr("data-component-type");
        var url = "components/delete/"+componentType+"/"+componentName;
        if (confirm("Are you sure you want to delete this component?")) {
          executePost(url, data, {id:msgId, success: "Component deleted!", failure: "Can't delete component. Probably permissions problem", error: "Error deleting component!"});      
        }
      }
  });
  
  
 
 $(".lodspk-component").on("click", function(e){
     var componentType = $(this).attr("data-component-type");
     var componentName = $(this).attr("data-component-name");
     var dataParent = ".lodspk-component[data-component-type="+componentType+"][data-component-name="+componentName+"]";
     var url="components/details/"+componentType+"/"+componentName;
     templateBuffer = "";
     queryBuffer = "";
     $("#template-editor").val("");
     $("#query-editor").val("");
  $.get(url, function(data){
      $("#template-list").empty()
      $("#query-list").empty()
      $.each(data.views, function(i, item){
          var viewUrl = relPos+componentType+"/"+componentName+"/"+item;
          var viewFileUrl = componentType+"/"+componentName+"/"+item;
          $("#template-list").append("<li class='file-li'><button type='button' class='close hide lodspk-delete-file' data-parent='"+dataParent+"' data-file='"+viewFileUrl+"' style='align:left'>x</button><a class='lodspk-template' href='#template-save-button' data-url='"+viewUrl+"'>"+item+"</a></li>") ;
      });
      $.each(data.models, function(i, item){
          var modelUrl = relPos+componentType+"/"+componentName+"/queries/"+item;
          var modelFileUrl = componentType+"/"+componentName+"/queries/"+item;
          $("#query-list").append("<li class='file-li'><button type='button' class='close hide lodspk-delete-file' data-parent='"+dataParent+"' data-file='"+modelFileUrl+"' style='align:left'>x</button><a href='#query-save-button' class='lodspk-query' data-url='"+modelUrl+"'>"+item+"</a></li>")        
      });
      updateEvents();
      $(".new-file-button").removeClass("hide");
      $(".new-file-button-view").attr("data-component", componentType+"/"+componentName );
      $(".new-file-button-model").attr("data-component", componentType+"/"+componentName+"/queries" );
  });
 });
 
 function executeQuery(q, e){
   $.ajax({
       dataType: 'jsonp',
       data: {
         query: q,
         format: 'application/sparql-results+json'
       },
       url: e,
       success: function(data){
         var variables = new Array();
         var header = $("<tr></tr>");
         $(data.head.vars).each(function(i, item){
             variables.push(item);
             header.append("<td><strong>"+item+"</strong></td>");
         });
         $("#results").append(header);
         $(data.results.bindings).each(function(i, item){
             var row = $("<tr></tr>");
             $.each(variables, function(j, jtem){
                 row.append("<td>"+item[jtem].value+"</td>");
             });
             $("#results").append(row);
         });
         $("#query-test-button").removeClass('disabled').html('Test this query against');
       },
       error: function(e){
         $("#results-msg").html("An error occurred when sending a query to the endpoint").show().delay(2000).fadeOut("slow");
         $("#query-test-button").removeClass('disabled').html('Test this query against');
       },
       timeout: 20000,
   });
 }
 
 function updateEvents(){
   $(".lodspk-delete-file").on({
       click: function(){
         var fileName = $(this).attr("data-file");
         var url = "components/remove/"+fileName;
         var msgId = "#component-msg";
         if (confirm("Are you sure you want to delete this component?")) {
           executePost(url, "", {id:msgId, success: "File deleted!", failure: "Can't delete file. Probably permissions problem", error: "Error deleting file!", triggerElement:  $(this).attr("data-parent"), triggerEvent: 'click'});      
         }
       }
   });
   

   $(".file-li").on({
       mouseenter: function(){
         $(this).children(".lodspk-delete-file").removeClass("hide");
       },
       mouseleave: function(){
         $(".lodspk-delete-file").addClass("hide");
       }
   });   
   $(".lodspk-template").on("click", function(e){
       var fileUrl = $(this).attr("data-url");
       $.ajax({
           cache: false,
           url: fileUrl, 
           success: function(data){
           $("#template-editor").val(data);
           templateBuffer = data;
           $("#template-save-button").attr("data-url", fileUrl).addClass("disabled");
       }
       });
   });
   $(".lodspk-query").on("click", function(e){
       var fileUrl = $(this).attr("data-url");
       $.ajax({
           cache: false,
           url: fileUrl, 
           success: function(data){
           $("#query-editor").val(data);
           queryBuffer = data;
           $("#query-save-button").attr("data-url", fileUrl).addClass("disabled");
       }
       });
   });
   //Turn 'save' buttons disable when no change has been made
   $("#query-editor").on("keyup", function(e){
     if($("#query-editor").val() == queryBuffer){
       $("#query-save-button").addClass("disabled");
     }else{
       $("#query-save-button").removeClass("disabled");     
     }
   });
   $("#template-editor").on("keyup", function(e){
     if($("#template-editor").val() == templateBuffer){
       $("#template-save-button").addClass("disabled");
     }else{
       $("#template-save-button").removeClass("disabled");     
     }
   }); 
   //Save action
   $("#template-save-button").on("click", function(e){
       if(!$("#template-save-button").hasClass("disabled")){
         var url = "components/save/"+$("#template-save-button").attr("data-url").replace(relPos, "");
         $.ajax({
             type: 'POST',
             url: url,
             data: {content: $("#template-editor").val()},
             success: function(data){if(data.success == true){
               $("#template-msg").removeClass('hide').html("Saved!").show().delay(2000).fadeOut("slow");
             }},
             dataType: 'json'
         });
         
         templateBuffer=$("#template-save-button").val();
         $("#template-save-button").addClass('disabled');
       }
   });
   $("#query-save-button").on("click", function(e){
       if(!$("#query-save-button").hasClass("disabled")){
         var url = "components/save/"+$("#query-save-button").attr("data-url").replace(relPos, "");
         $.ajax({
             type: 'POST',
             url: url,
             data: {content: $("#query-editor").val()},
             success: function(data){if(data.success == true){
               $("#query-msg").removeClass('hide').html("Saved!").show().delay(2000).fadeOut("slow");
             }else{
               $("#query-msg").removeClass('hide').addClass('alert-fail').html("Error saving content").show().delay(2000).fadeOut("slow").removeClass('alert-fail');             
             }
             },
             error: function(data){if(data.success == true){
               $("#query-msg").removeClass('hide').addClass('alert-fail').html("An error ocurred in the server!").show().delay(2000).fadeOut("slow").removeClass('alert-fail');
             }},
             dataType: 'json'
         });
         
         queryBuffer=$("#query-save-button").val();
         $("#query-save-button").addClass('disabled');
       }
   });
 }
});
