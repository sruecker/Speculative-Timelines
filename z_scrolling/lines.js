platform = 500; //height of eye above lower edge of screen
focal = 600; //distance from eye to screen
gap = 100; //distance between each month line	

function setgap(val){
	gap = val;
}
function setfocal(val){
	focal = val;
}
function setplatform(val){
	platform = val;
}

function get_opacity(base,distance){
	opacity = base;
	if (distance > 12) { opacity = 0.0; }
	if (distance > 11) { opacity *= 0.3; }
	if (distance > 10) { opacity *= 0.3; }
	return opacity;
}
function get_fontsize(base,distance){
	fontsize = base;
	if (distance > 11) { return 6; }
	if (distance > 9) { return 8; }
	if (distance > 7) { return 9; }
	if (distance > 5) { return 10; }
	if (distance > 2) { return 12; }
	if (distance > 0) { return 14; }
	if (distance > -2) { return 18; }
	//if (distance > -2) { return 22; }	
	//if (distance > -4) { return 26; }	
	return 18;
}

function get_line_data(distance){
	v0 =  0 + (-600* (focal/ (focal+(distance*gap)) ));
	v1 =  0 + (600* (focal/ (focal+(distance*gap)) ));
	u =  (platform *(focal/ (focal+(distance*gap)) ));
	//the following are returned
	length = v1 - v0;
	drop = u;
	indent = (1200 - length)/2;
	data = {'length':length,'drop':drop,'indent':indent,'opacity':get_opacity(1.0,distance)};
	return data
}

function get_box_data(distance,boxheight,boxwidth,x){
	indent =  600 + ((x-600)* (focal/ (focal+(distance*gap)) ));
	lastedge =  600 + ((x+boxwidth-600)* (focal/ (focal+(distance*gap)) ));
	newwidth = lastedge - indent;
	u =  (platform *(focal/ (focal+(distance*gap)) ));
	newheight = ((boxheight) *(focal/ (focal+(distance*gap)) ));
	titleheight = ((boxheight+20) *(focal/ (focal+(distance*gap)) ));
	//the following are returned
	drop = u - newheight +1 ;
	opacity = get_opacity(0.8,distance);
	fontsize = get_fontsize(14,distance);
	data = {'height':newheight,'titleheight':titleheight,'width':newwidth,'drop':drop,'indent':indent,'opacity':opacity,'fontsize':fontsize};
	return data;
}

function monthline(title, mlid, distance){
	data = get_line_data(distance);
	opacity = get_opacity(1.0,distance);
	$('<div/>', {id: 'ml_'+mlid, height:1, width:data.length, }).appendTo('#holder');
	$('#ml_'+mlid).css({background:'#000',	position:'fixed',	top:data.drop+'px',
	left:data.indent+'px', opacity:opacity });
	//the text
	$('<div/>', {    id: 'mlt_'+mlid, height:20, text:title }).appendTo('#holder');
	textdrop = data.drop-10;
	textindent = data.indent + data.length + 10;	
	$('#mlt_'+mlid).css({position:'fixed',	top:textdrop+'px', left:textindent+'px', opacity:opacity });
}

function eventbox(params){
	ebid = params.ebid;
	title = params.title;
	distance = params.natural_distance;
	text = params.text;
	who = params.who;
	opacity = get_opacity(0.8,distance);
	fontsize = get_fontsize(14,distance);
	data = get_box_data(distance,params.height,params.width,params.x);
	$('<div/>', {id: 'eb_'+ebid, height:data.height, width:data.width, text:text}).appendTo('#holder');
	$('#eb_'+ebid).css({background:'#6A9FD9',	position:'fixed',	top:data.drop+'px', color:'#fff', 'font-family':'Arial', 'font-size':12, overflow:'hidden',
	left:data.indent+'px', opacity:opacity,  'padding-left':2,  'padding-right':2,  'font-size':fontsize});

	h = (data.titleheight-data.height);
	d = (data.drop-h);
	$('<div/>', {id: 'ebt_'+ebid, height:h, width:data.width+4, text:params.title}).appendTo('#holder');
	$('#ebt_'+ebid).css({background:'#5a87b8',	position:'fixed',	top:d+'px',   color:'#fff', 'font-family':'Arial', 'font-size':12, overflow:'hidden',
	left:data.indent+'px', opacity:opacity,  'font-size':fontsize});
		if (distance < -3) {
			$('#eb_'+event_dataset[eevent].ebid).hide();
			$('#ebt_'+event_dataset[eevent].ebid).hide();
		}
	
	//*/
}

