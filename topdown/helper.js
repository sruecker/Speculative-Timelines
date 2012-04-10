function add_year_cal(raph,cols,year,xbase,ybase){
	raph.image("year_frame-i.png",xbase,ybase,300,300);
	raph.text(xbase+312,ybase+156,String(year)).rotate(90).scale(1.50,1.50).attr({"fill":"#727272"});
	cols--;
	while (cols > 0){
		xbase += 324;
		raph.image("year_frame-i.png",xbase,ybase,300,300);
		if (cols > 1)
			raph.text(xbase+312,ybase+156,String(year)).rotate(90).scale(1.50,1.50).attr({"fill":"#727272"});
		cols--;
	}
}
