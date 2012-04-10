class CubeEntity {
	var Chron;
	var proseLabel;
	var cubePosition;
	var cubeType;
	var cubeid;
	
	public function CubeEntity () {
	}


}


class ChronEntity {

	private var proseLabel;
	private var fromDate;
	private var toDate;
	private var dateType;
	
	public function ChronEntity(chronStruct) {
		this.ProcessXMLChronstruct(chronStruct);
	}
	public function GetDateStyle() { return this.dateType; }
	public function GetSingleDate() { return this.fromDate; } //from is used for date if only one
	public function GetProseLabel() { return this.proseLabel; }
	
	
	function ProcessXMLChronstruct(chronStruct) {
	// given a CHRONSTRUCT entity (input param)
	// find DATE, DATERANGE, or DATESTRUCT (and the associated CHRONPROSE)
	// 
	// and ..  extract date 
	
			var hasDate = false;
			var hasProse = false;
			var prose = "";
			var date;
			var fromdate;
			var todate;
			var curEntity;
			for (subdex = 0; subdex < chronStruct['children'].length; subdex++)
			{
				curEntity = chronStruct['children'][subdex];
				if (curEntity['name'] == "DATE")
				{
					hasDate = true;
					for(var cdex:String in curEntity['attributes'].Keys)
					{
						if ( cdex == "VALUE"){							
							date= SimilieStructCalc.DateFromInputString(curEntity['attributes'][cdex]);
							//Debug.Log(date);
						}		
					}		
					this.dateType = "DATE";
					this.fromDate = date;
				}
				if (curEntity['name'] == "DATERANGE")
				{
					hasDate = true;
					for(var cdex:String in curEntity['attributes'].Keys)
					{
						if ( cdex == "FROM")
						{							
							fromdate = SimilieStructCalc.DateFromInputString(curEntity['attributes'][cdex]);
						}
						if ( cdex == "TO")
						{							
							todate = SimilieStructCalc.DateFromInputString(curEntity['attributes'][cdex]);
							//year_trans = todate[0] - earliestDate;
						}
					}
					this.dateType = "DATERANGE";
					this.fromDate = fromdate;
				}
				if (curEntity['name'] == "DATESTRUCT")
				{
					hasDate = true;
					//TODO !!!
					this.dateType = "DATESTRUCT";
				}
				if (curEntity['name'] == "CHRONPROSE")
				{
					hasProse = true;
					if (prose != ""){
						prose += " : ";
					}
					prose += curEntity['innerText'] ;
				}
			}
			//todo : throw exceptions when no date or prose? or just be silent?
			if (!hasDate){
				Debug.Log ("err: xml: no date "+" "+chronStruct['innerText']);
			}
			else {
				if (!hasProse){
					Debug.Log ("err: xml: no prose "+" "+chronStruct['innerText']);
					prose = "(no text)";
				}
				
				//so... TODO
				
				this.proseLabel = prose;
			}
		
	}
}