<?php

class Haanga_Extension_Filter_D3LineChart{
  public $is_safe = TRUE;
  static function main($obj, $varname){
  	$data = array();
  	$i = 0;
    $options = array();
  	$randId = rand();
  	$firstColumn = true;
  	$names = explode(",", $varname);
  	$j = 0;
  	$data['series']=array();
  	$data['dict']=array();
  	
  	$fieldCounter=0;
  	$varList = array();
  	foreach($names as $v){
  	  if(strpos($v,"=")){
  	    break;
  	  }
  	  $variable['name'] = $v;
  	  $variable['value'] = 'value';
  	  if(strpos($v, ".")){
  	    $aux = explode(".", $v);
  	    $variable['name'] = $aux[0];
  	    $variable['value'] = $aux[1];
  	  }
  	  if($fieldCounter > 0){array_push($data['dict'], $variable['name']);}
  	  $fieldCounter++;
  	  array_push($varList, $variable);
  	}

  	$series = array();
  	foreach($obj as $k){  	
  	  $series = array();
  	  foreach($varList as $v){
  	    $name = $v['name'];
  	    $val = $v['value'];

  	  	if($j==0){
  	  	  $series['key'] = $k->$name->$val;
  	  	  //$newItem[$j]['x'] = $value;
  	  	}else{
  	  	  $series['values'][] = $k->$name->$val;
  	  	}
  	  	$j++;
  	  } 
  	  $i++;
  	  $j=0;
 	  	array_push($data['series'], $series);
  	}
  	
  	//Getting options
  	$options['height'] = 500;
  	$options['width'] = 1000;
  	$options['padding'] = 20;
  	$options['chartProportion'] = 0.8;
  	$options['legendSpace'] = 15;
  	$options['intermediateLines'] = 4;
    for($z=$fieldCounter; $z < count($names); $z++){
      $pair = explode("=", $names[$z]);
      $key = trim($pair[0], "\" '");
      $value = trim($pair[1], "\" '");
      $options[$key] = $value;     
    }

  	$divId = uniqid("d3linechart_div");
  	$pre = "<div id='".$divId."'></div>
  	<script src='http://d3js.org/d3.v2.min.js?2.9.3'></script>
    <script type='text/javascript'>
    var options_$divId = ".json_encode($options)."; 
    var dataset_$divId = ".json_encode($data).";
    var color = d3.scale.category10();
    var stroke = function(d){
      s = ['', '5,5', '5,10', '10,5'];
      return s[d%s.length];
    }
    
    var maxValue_$divId = getMax(dataset_".$divId."['series']);
    var svg = d3.selectAll('#".$divId."').append('svg').attr('width', options_$divId.width).attr('height', options_$divId.height);
    var maxHeight_$divId = options_$divId.chartProportion*options_$divId.height;


    function getMax(d){
      maxValue = 0;
      for(var i in d){
        e = d[i];
        for(var j in e.values){
          aux = parseInt(e.values[j]);
         if(maxValue < aux){
           maxValue = aux;
         }
       }
     }
     return maxValue+1;
   }    
//Axis
  var xaxis = svg.append('g');
    xaxis.append('line').style('stroke', 'black').style('stroke-width', '2px').attr('x1',  1+options_$divId.legendSpace).attr('y1', maxHeight_$divId).attr('x2', options_$divId.width+options_$divId.padding+ options_$divId.legendSpace).attr('y2', maxHeight_$divId)
    xaxis.selectAll('line.stub')
    var labels_$divId = xaxis.selectAll('text.xaxis')
        .data(dataset_".$divId."['dict'])
        .enter().append('text').text(function(d){return d})
        .style('font-size', '12px').style('font-family', 'sans-serif')
        .attr('class', 'xaxis')        
        .attr('x', function(d, i){return options_$divId.chartProportion*i*(parseInt(options_$divId.width)/ dataset_".$divId."['series'].length) + 4*options_$divId.padding + options_$divId.legendSpace})
        .attr('y', function(d, i){return maxHeight_$divId+30;})
        .attr('transform', function(d){return 'translate(-'+(this.getBBox().width/2)+')'});

        
   var yaxis = svg.append('g');
    yaxis.append('line').style('stroke', 'black').style('stroke-width', '2px').attr('x1', 1+options_$divId.padding + options_$divId.legendSpace).attr('y1', maxHeight_$divId).attr('x2', 1+options_$divId.padding + options_$divId.legendSpace).attr('y2', 1)
   for(i=0; i<options_$divId.intermediateLines; i++){
    yaxis.append('line').style('stroke', 'grey').style('stroke-width', '1px').attr('x1', 1 + options_$divId.legendSpace).attr('y1', maxHeight_$divId*(i/options_$divId.intermediateLines)+1).attr('x2', options_$divId.width).attr('y2', maxHeight_$divId*(i/options_$divId.intermediateLines))
   } 

    
//Values
var line = d3.svg.line()
    .x(function(d, i){return options_$divId.chartProportion*i*(parseInt(options_$divId.width) / dataset_".$divId."['series'].length) + 4*options_$divId.padding + options_$divId.legendSpace})
    .y(function(d, i) { return (1-d/maxValue_$divId)*maxHeight_$divId; });

for(var k in dataset_".$divId."['series']){
  svg.append('path').attr('class', 'line')
        .datum(dataset_".$divId."['series'][k].values)
        .attr('d', line)
        .style('opacity', 0.8)
        .style('stroke', function(d, i){return color(k)})
        .style('stroke-width', '2px')
        .style('stroke-dasharray', stroke(k))
        .style('fill', 'none');
}

        d3.selectAll('rect.bar')
        .on('mouseover', function(){
        d3.select(this).style('opacity', 1); 
        }).on('mouseout', function(){
        d3.select(this).style('opacity', 0.8); 
        });
//Scale        
   for(i=0; i<options_$divId.intermediateLines; i++){
    yaxis.append('text')
         .attr('x', 1)
         .attr('y', maxHeight_$divId*(i/options_$divId.intermediateLines)+1)
         .attr('font-family', 'sans-serif')
         .attr('font-size', '10px')
         .text(maxValue_$divId*(1-i/options_$divId.intermediateLines))
         .attr('transform', 'translate(0,10)');
   } 
    </script>
    ";
    
    return $pre;
  }
}