
static function DateFromInputString(dateString){
//given an xml string holding a date, return the date (year,month,day) as ints
//format is yyyy-mm-dd where mm or dd may be null. all are numeric
	if  (dateString == String.Empty){
		return Array( 0, 0, 0);
	}
	firstDash = dateString.IndexOf("-"); //should always be 4, since year always exists
	secondDash = dateString.IndexOf("-",firstDash+1); //typically 7, sometimes 5
	if ((firstDash == -1) || (secondDash == -1)){
	//TODO throw exception? return 0,0,0 ?
		Debug.Log("error, missing dash on "+dateString);
		return Array( 0, 0, 0);
	}
	year = dateString.Substring(0,firstDash) as String;
	month = dateString.Substring(firstDash+1,secondDash-firstDash-1) as String;
	day = dateString.Substring(secondDash+1) as String;
	if (year == '') year = '0';	
	if (month == '') month = '0';	
	if (day == '') day = '0';	
	return Array( parseInt(year),  parseInt(month),  parseInt(day) );
}

static function calcCubePlace(year,month,day,yearsize,yearzero,monthsizex,monthsizez){
//a 10% gap between year blocks
	year_jump = year - yearzero;
	year_x = year_jump * 1.1 * yearsize;
	adj_x = year_x + yearsize/2; 
	adj_z = yearsize/2;
	if (month != 0){
		//x
		//
		if (month%3 == 1){ adj_x -= yearsize/(3*0.95); }
		if (month%3 == 0){ adj_x += yearsize/(3*0.95);}
		//z
		adj_z += yearsize*(3.0/8); //push to top of block
		//move the cube to the right month z-space
		if        (month<=3){ adj_z += 0- yearsize*(0.0/4); } 
		else if (month<=6){ adj_z += 0- yearsize*(1.0/4); } 
		else if (month<=9){ adj_z += 0- yearsize*(2.0/4); } 
		else                     { adj_z -= yearsize*(3.0/4); } 
	}	
	if (day != 0){
		//x
		//		
		if (day%7 == 1){ adj_x -= yearsize*3/(21*1.1); }
		if (day%7 == 2){ adj_x -= yearsize*2/(21*1.1);}
		if (day%7 == 3){ adj_x -= yearsize/(21*1.1); }
		if (day%7 == 5){ adj_x += yearsize/(21*1.1);}
		if (day%7 == 6){ adj_x += yearsize*2/(21*1.1); }
		if (day%7 == 0){ adj_x += yearsize*3/(21*1.1);}
		//z
		adj_z += yearsize*(4.0/40)*0.90; //push to top of block
		//move the cube to the right month z-space
		if        (day<=7 ){ adj_z += 0- yearsize*(0.0/20)*0.90; } 
		else if (day<=14){ adj_z += 0- yearsize*(1.0/20)*0.90; } 
		else if (day<=21){ adj_z += 0- yearsize*(2.0/20)*0.90; } 
		else if (day<=28){ adj_z += 0- yearsize*(3.0/20)*0.90; } 
		else                     { adj_z -= yearsize*(4.0/20)*0.90; } 
	
	}
	return Vector3(adj_x  , 0, adj_z);
}
