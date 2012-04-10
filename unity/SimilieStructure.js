
var earliestDate; //year of first xml date
var cubeObject : GameObject; //must attach a cube GAmeObject to this script
private var parentStructure : GameObject; //not used
var blocksize = 5.0; //size of year edge. Currently year plank is square. Could make it rectangle and have vars for months on x/y (currently 3/4) and days on x/y (currently 7/5).

var ChronList : Array; //list of all ChronEntities (which are taken from xml)

var cube_id_count : int;
var updater : int;
//structures for storing label details for each entity
var labelData : Array; //an array of Hashtables. 
//Each Hashtable in labelData should have:
//		cubeid : id of the cube (potentially the same as the index to the Array)
//		text : text of label
//		position : position part of translate of the objects
//		type : what kind of label (entity, year, ...)
//		Rects : an array of three Rects used for drawing the label

var xOffset = 50; //used for labelling - doesnt' seem to make a big difference
var yOffset = 190;
//var guiSkin : GUISkin;
var lineBoxWidth: int = 1000;
var contentPadding : int = 5;
var lineBoxStyle : GUIStyle;
//var entityDistance;
var labelSystem;

//working
var movingCubeList : Array;
var moveRight;
var moveDist;

function isInLabelSystem(cubeid){
	row = 0;
	isin = false;
	while (row < labelSystem['all'].length){
		if (labelSystem['all'][row]['cubeid'] == cubeid) { isin = true; }
		row+=1;
	}
	return isin;
}

function calcLabelSystemLowest(){
	if ((labelSystem['alldists'][0] >= labelSystem['alldists'][1]) && (labelSystem['alldists'][0] >= labelSystem['alldists'][2])){
		labelSystem['lowestindex'] = 0;
		labelSystem['lowestdist'] = labelSystem['alldists'][0];
	} else if ((labelSystem['alldists'][1] >= labelSystem['alldists'][0] )&& (labelSystem['alldists'][1] >= labelSystem['alldists'][2])){
		labelSystem['lowestindex'] = 1;
		labelSystem['lowestdist'] = labelSystem['alldists'][1];
	} else {
		labelSystem['lowestindex'] = 2;
		labelSystem['lowestdist'] = labelSystem['alldists'][2];
	}	
}

function OnGUI() 
{
	var ldc; //copy of labelData entity
	do_update = false;
	updater+=1; //instead of updating the placement of every label every frame, we skip 99 frames in 100
	if (updater%10==0){
		if (updater%1000==0){
			updater = 0;
		}
		do_update = true;
	}
	//--entityDistance = new Array();
	if (labelData != null){

		if (updater%100==0){		
			count = 0;
			//things have moved, so recalc the distances of the labels
			labelSystem['alldists'] = new Array();
			row = 0;
			while (row < labelSystem['all'].length){
				ldc = labelSystem['all'][row];
				screenPosition = Camera.main.WorldToScreenPoint(ldc['position']); //Screenspace is defined in pixels. The bottom-left of the screen is (0,0); the right-top is (pixelWidth,pixelHeight). The z position is in world units from the camera.			
				xDistance = Vector3(screenPosition.x - (Camera.main.pixelWidth/2),screenPosition.y-(Camera.main.pixelHeight/2),0).magnitude;				
				labelSystem['alldists'].Push(xDistance);
				row+=1;
			}
			if (labelSystem['all'].length == 3){
				calcLabelSystemLowest();
			}
			
			while (count < labelData.length){
				if (labelData[count]['type'] =='day') {						
					screenPosition = Camera.main.WorldToScreenPoint(labelData[count]['position']); //Screenspace is defined in pixels. The bottom-left of the screen is (0,0); the right-top is (pixelWidth,pixelHeight). The z position is in world units from the camera.
					//recalc distances
					xDistance = Vector3(screenPosition.x - (Camera.main.pixelWidth/2),screenPosition.y-(Camera.main.pixelHeight/2),0).magnitude;				
					if (labelSystem['all'].length < 3){
						labelSystem['all'].Push(labelData[count]);
						labelSystem['alldists'].Push(xDistance);
						if (labelSystem['all'].length == 3){
							calcLabelSystemLowest();
						}
					} else if (xDistance < labelSystem['lowestdist']) {
						if (!isInLabelSystem(labelData[count]['cubeid']))
						{							
							labelSystem['all'].RemoveAt(labelSystem['lowestindex']);
							labelSystem['alldists'].RemoveAt(labelSystem['lowestindex']);
							labelSystem['all'].Push(labelData[count]);
							labelSystem['alldists'].Push(xDistance);
							calcLabelSystemLowest();						
						}
					}
				}
				count+=1;
			}
		}


		count = 0;
		while (count < labelData.length){
			screenPosition = Camera.main.WorldToScreenPoint(labelData[count]['position']); //Screenspace is defined in pixels. The bottom-left of the screen is (0,0); the right-top is (pixelWidth,pixelHeight). The z position is in world units from the camera.
			if (labelData[count]['type'] =='year') {
				renderCubeYearLabel(labelData[count]['cubeid'],labelData[count]['text'],screenPosition,labelData[count]['type'],do_update);
			}
			count+=1;
							
		}//*/
		
		row = 0;
		while (row < labelSystem['all'].length){
			ldc = labelSystem['all'][row];
			screenPosition = Camera.main.WorldToScreenPoint(ldc['position']); //Screenspace is defined in pixels. The bottom-left of the screen is (0,0); the right-top is (pixelWidth,pixelHeight). The z position is in world units from the camera.			
			renderCubeDayLabel(ldc['cubeid'],ldc['text'],screenPosition,row,true);//do_update);
			row+=1;
		}
	}
	//TODO - split renderCubeLabel into an update label boxes and a render functions
}

function renderCubeDayLabel( cubeid:int, text: String, cubePosn, linePosn, doUpdate )
{
	var lineContent : GUIContent;
	lineContent = GUIContent(text);
	if (doUpdate) {
		//Debug.Log(cubePosn+" : ");
		//Debug.Log(" : "+text);
		var currentWidth;
		var ratio;
		var viewWidth;
		var viewHeight;
		var windowRect : Rect;

		currentWidth = 1000;//Camera.main.pixelWidth;//lineBoxWidth;//GUI.skin.GetStyle("label").CalcSize(lineContent).x;
		//if (currentWidth > lineBoxWidth) {
		//		currentWidth = lineBoxWidth;
		//}
		viewWidth = currentWidth;
		viewHeight = GUI.skin.GetStyle("label").CalcHeight(lineContent, currentWidth);
		//Debug.Log(viewHeight + " : "+ currentWidth + " : "+ lineBoxWidth);
		//Debug.Log(Camera.main.pixelWidth + " : "+ Camera.main.pixelHeight);
		ratio = Camera.main.pixelWidth / Camera.main.pixelHeight;
		//for Year labels, show on bottom of screen
		boxWidth = viewWidth + contentPadding * 2;
		windowRect = Rect(cubePosn.x, // - (boxWidth/2), 
									linePosn * viewHeight + 25, //
									boxWidth, 
									viewHeight + contentPadding * 2); 
		
		var Rects = new Array();
		Rects.Push(windowRect);
		Rects.Push(Rect(0, 0, viewWidth + contentPadding * 2, viewHeight + contentPadding * 2));
		Rects.Push(Rect(contentPadding, contentPadding, viewWidth, viewHeight ));
		//--labelRects.Remove(cubeid);
		labelData[cubeid]['Rects'] = Rects;
		//--labelRects.Add(cubeid,Rects);
	}
	
	if (labelData != null && labelData[cubeid] != null  && labelData[cubeid]['Rects'] != null){
		GUI.BeginGroup(labelData[cubeid]['Rects'][0]);
		GUI.depth = 10;
		GUI.Box(labelData[cubeid]['Rects'][1], "", lineBoxStyle);
		GUI.Label(labelData[cubeid]['Rects'][2], lineContent); 
	
		GUI.EndGroup();		
	}

}
function renderCubeYearLabel( cubeid:int, text: String, cubePosn, labelType, doUpdate )
{
	var lineContent : GUIContent;
	lineContent = GUIContent(text);
	//ignore entities that are off the screen (or, their centre-point is)
	if (cubePosn.x < 0) return;
	if (cubePosn.x > Camera.main.pixelWidth) return;
	if (cubePosn.y < 0) return;
	if (cubePosn.y > Camera.main.pixelHeight) return;
		//
	if (doUpdate) {
		//Debug.Log(cubePosn+" : "+text);
		var currentWidth;
		var ratio;
		var viewWidth;
		var viewHeight;
		var windowRect : Rect;

		currentWidth = GUI.skin.GetStyle("label").CalcSize(lineContent).x;
		if (currentWidth > lineBoxWidth) {
				currentWidth = lineBoxWidth;
		}
		viewWidth = currentWidth;
		viewHeight = GUI.skin.GetStyle("label").CalcHeight(lineContent, currentWidth);
		ratio = Camera.main.pixelWidth / Camera.main.pixelHeight;
		//for Year labels, show on bottom of screen
		boxWidth = viewWidth + contentPadding * 2;
		windowYearRect = Rect(cubePosn.x - (boxWidth/2), 
									Camera.main.pixelHeight - 50, //
									boxWidth, 
									viewHeight + contentPadding * 2); 
		
		var Rects = new Array();
		Rects.Push(windowYearRect);
		Rects.Push(Rect(0, 0, viewWidth + contentPadding * 2, viewHeight + contentPadding * 2));
		Rects.Push(Rect(contentPadding, contentPadding, viewWidth, viewHeight ));
		//--labelRects.Remove(cubeid);
		labelData[cubeid]['Rects'] = Rects;
		//--labelRects.Add(cubeid,Rects);
	}
	
	if (labelData != null && labelData[cubeid] != null  && labelData[cubeid]['Rects'] != null){
		GUI.BeginGroup(labelData[cubeid]['Rects'][0]);
		GUI.depth = 10;
		GUI.Box(labelData[cubeid]['Rects'][1], "", lineBoxStyle);
		GUI.Label(labelData[cubeid]['Rects'][2], lineContent); 
	
		GUI.EndGroup();		
	}
	
}


//instYearCube and the Month and Day functions are close enough that they could be merged into one function. 

function instYearCube(yearval,layerName)
{
	year_trans = SimilieStructCalc.calcCubePlace(yearval,0,0,blocksize,earliestDate,0,0);
							
	var currentCube : GameObject = Instantiate(cubeObject) as GameObject; //TODO maybe use a GameObject-Pool of cubes to avoid mass instantiation?
	currentCube.name = "Name"+yearval;
	//currentCube.layer = LayerMask.NameToLayer(layerName); //TODO : raises error
	//currentCube.label = 				//TODO : use this for holding the label?		
	var xtrans = currentCube.GetComponent(Transform);  
	xtrans.Translate(year_trans); //move the cube to the right year-space
	xtrans.localScale = Vector3(blocksize,0.5,blocksize); //flatten cube into a thin plane
	
	//lets try and add a label to this year cubeObject
	//TODO working on this
	newLabel = new Hashtable();
	newLabel['text'] = ""+(yearval);
	newLabel['type'] = 'year';	
	newLabel['position'] = xtrans.position; 
	newLabel['cubeid'] = cube_id_count;
	labelData.Push(newLabel);
	cube_id_count += 1; 
	
}
function instMonthCube(yearval,monthval,layerName)
{
	monthsizex = blocksize *0.33*.9;
	monthsizez = blocksize *0.25*.9;
	mon_trans = SimilieStructCalc.calcCubePlace(yearval,monthval,0,blocksize,earliestDate,monthsizex,monthsizez);
							
	var currentCube : GameObject = Instantiate(cubeObject) as GameObject;
	currentCube.name = "Name"+yearval;
	//currentCube.layer = LayerMask.NameToLayer(layerName); //TODO : raises error
	//currentCube.tag = "Tag"+year;					//TODO : not sure what to do with this		
	var xtrans = currentCube.GetComponent(Transform);  
	xtrans.Translate(mon_trans); //move the cube to the right year-space
	xtrans.localScale = Vector3(monthsizex,1,monthsizez); //flatten cube into a thin plane, 1/12 size
	//var xrend = currentCube.GetComponent(Renderer);  
	var color : Color = Color(0.2, 0.3, 0.4, 0.5);
	currentCube.renderer.material.color = color;//new Color(.8,0.2,0,0.6);//Color.red; /* (1,1,1,1)*/
	
	//TODO working
	var makeUncertain = false;
	randval = Random.value;
	if (randval < 0.2){
		Debug.Log("M two");
		makeUncertain = true;
	}
	if (makeUncertain)
	{
		xtrans.Translate(Vector3(0,0.1,0)); //raise a little bit to avoid overlap
		//var tex : Texture2D ;
		//tex = Resources.Load("cubeTexture");// as Texture2D;
		var Jmaterial = new Material (Shader.Find ("Transparent/Diffuse"));
		Jmaterial.color.a = 0.4;
		// assign the material to the renderer
		currentCube.renderer.material = Jmaterial;
		//currentCube.renderer.material = Jmaterial;
		//currentCube.renderer.material.mainTexture = tex;
		
		var moveCube : GameObject = Instantiate(cubeObject) as GameObject;
		var tex : Texture2D ;
		tex = Resources.Load("Textures/Lorem",Texture2D);// as Texture2D;
		var Kmaterial = new Material ( Shader.Find ("Transparent/Diffuse"));
		Kmaterial.SetColor ("_Color", Color(0.5,0.5,0.5,1.0));
		Debug.Log(Kmaterial.GetColor("_Color"));
		Kmaterial.SetTexture("_MainTex",tex);
		Kmaterial.SetTextureScale("_MainTex",Vector2(4,4));
		
		moveCube.renderer.material = Kmaterial;
		//currentCube.renderer.material.mainTexture = tex;
		
		daysizex = blocksize *0.33*.9 *(1.0/7)*.9;
		daysizez = blocksize *0.25*.9 *(1.0/5)*.9;
		day_trans = SimilieStructCalc.calcCubePlace(yearval,monthval,1,blocksize,earliestDate,daysizex,daysizez);
		//moveCube.name = "Name"+yearval;
		var Gtrans = moveCube.GetComponent(Transform);  
		Gtrans.Translate(day_trans); //move the cube to the right year-space
		Gtrans.localScale = Vector3(daysizex*1.5,0.02,daysizez*1.5); //flatten cube into a thin plane, 1/50 size but a bit wider/longer
		Gtrans.Translate(Vector3(0,0.7,0)); //move above the month box
		moveCube.renderer.material.color = Color(0.0,0.2,0.8,0.6);//Color.red; /* (1,1,1,1)*/
		movingCubeList.Push(moveCube);
		return false;//todo replace
	}	
	return true;
}
function instDayCube(yearval,monthval,dayval,layerName,labelText)
{
	daysizex = blocksize *0.33*.9 *(1.0/7)*.9;
	daysizez = blocksize *0.25*.9 *(1.0/5)*.9;
	day_trans = SimilieStructCalc.calcCubePlace(yearval,monthval,dayval,blocksize,earliestDate,daysizex,daysizez);
			
	//TODO mucking about in here
	var maketransparent = true;//false;
	if (monthval == 20){
		return; //todo working
	}
	if (dayval == 1){
		Debug.Log("one");
		maketransparent = true;
	}
	var currentCube : GameObject = Instantiate(cubeObject) as GameObject;
	if (maketransparent)
	{
		var tex : Texture2D ;
		tex = Resources.Load("cubeTexture");// as Texture2D;
		var Jmaterial = new Material (Shader.Find ("Transparent/Diffuse"));
		Jmaterial.color = Color.green;
		// assign the material to the renderer
		currentCube.renderer.material = Jmaterial;
		currentCube.renderer.material.mainTexture = tex;
		
	}
	else{
		currentCube.renderer.material.shader = Shader.Find("Transparent/Diffuse");
	}
	currentCube.name = "Name"+yearval;
	//currentCube.layer = LayerMask.NameToLayer(layerName); //TODO : raises error
	//currentCube.tag = "Tag"+year;					//TODO : not sure what to do with this		
	var xtrans = currentCube.GetComponent(Transform);  
	xtrans.Translate(day_trans); //move the cube to the right year-space
	xtrans.localScale = Vector3(daysizex,1.4,daysizez); //flatten cube into a thin plane, 1/12 size
	//var xrend = currentCube.GetComponent(Renderer);  
	currentCube.renderer.material.color = Color(0.0,0.2,0.8,0.6);//Color.red; /* (1,1,1,1)*/
		
	//adding prose
	newLabel = new Hashtable();
	newLabel['text'] = labelText;
	newLabel['type'] = 'day';	
	newLabel['position'] = xtrans.position; 
	newLabel['cubeid'] = cube_id_count;
	labelData.Push(newLabel);
	cube_id_count += 1; 
	//Debug.Log("ld len "+labelData.length);
}




function GetLowestDate(){
// Scan ChronList and return lowest year
	var lowest:int;
	var index:int;	
	var thisYear:int;
	//TODO check ChronList is valid, has entries...
	lowest = ChronList[0].fromDate[0];
	for (index = 0; index < ChronList.length; index++)
	{		
		if (ChronList[index].GetDateStyle() == "DATE" || ChronList[index].GetDateStyle() == "DATERANGE" ) {
			thisYear = ChronList[index].GetSingleDate()[0];
			if (thisYear < lowest) {
				lowest = thisYear;
			}
		}
	}		
	return lowest;
}

function RecurBuildChronList(childArray,level ){
// Recursively parse Array looking for any CHRONSTRUCT entities. (They should all be at the same level, but who knows)
// whenever found, add to ChronList as a ChronEntity
	var index:int;
	var curEvent:Hashtable;
	for (index = 0; index < childArray.length; index++)
	{
		curEvent  = childArray[index];
		if (curEvent['name'] == "CHRONSTRUCT")
		{
			newChronEntity = new ChronEntity(curEvent);
			ChronList.Push(newChronEntity);			
		}
		RecurBuildChronList(childArray[index]['children'],level+1);
	}		
}

function BuildDateChronProse(layerName){
// Scan ChronList and instantiate cubes matching all dates
	var index:int;
	total = 0; //set a max on elements to load TODO kill after debug
	for (index = 0; index < ChronList.length; index++)
	{		
		if (ChronList[index].GetDateStyle() == "DATE" || ChronList[index].GetDateStyle() == "DATERANGE" ) {
			total +=1;
			thisDate = ChronList[index].GetSingleDate();
			instYearCube(thisDate[0],layerName);
			result = instMonthCube(thisDate[0],thisDate[1],layerName);
			if (result)
				instDayCube(thisDate[0],thisDate[1],thisDate[2],layerName,ChronList[index].GetProseLabel());
		}
		//breakout
		if (total > 100) {index = ChronList.length;}
	}		
}

function Build() {
	
	Debug.Log("Build function - build cubes from the file just loaded.");
	// when building the structure either on this function or dynamically 
	// the objects should be placed on the SimilieLayer layer.
	
	// parentStructure = transform;
	
	//var currentCube : GameObject = Instantiate(cubeObject) as GameObject;
	//currentCube.name = "Name";
	//currentCube.tag = "Tag";
	
	// currentCube.layer = LayerMask.NameToLayer("SimilieLayer"); // LayerFibonacci 
	// currentCube.transform.parent = parentStructure.transform;
	
	//***** MB
	cube_id_count = 0;
	updater = 0;
	labelData = new Array();
	ChronList = new Array();
	movingCubeList = new Array();
	moveRight = true;
	moveDist = 0.0;
	labelSystem = new Hashtable();
	labelSystem['lowestdist'] = 10000;
	labelSystem['alldists'] = new Array();
	labelSystem['lowestindex'] = 0;
	labelSystem['all'] = new Array();

	
	for(var lyr:String in fileStructure.Keys){
	//todo : if there's more than one open file, should grab layer name from it?
		RecurBuildChronList(fileStructure[lyr]['root'][0]['children'],0);
				
		earliestDate = GetLowestDate();
		BuildDateChronProse("SimileLayer");

		
	}
	Debug.Log("Build function - finished building.");
	
}

function Update () {
	if (movingCubeList){
		var index:int;
		for (index = 0; index < movingCubeList.length; index++)
		{
			curCube  = movingCubeList[index];
			if (moveRight){
				curCube.GetComponent(Transform).Translate( Vector3(0.03000,0,0) ); 
			}else{
				curCube.GetComponent(Transform).Translate( Vector3(-0.03000,0,0) ); 
			}
		}
		if (moveRight){
			moveDist += 0.03000;
			if (moveDist > 1.4)
				moveRight = false;
		}else{
			moveDist -= 0.03000;
			if (moveDist < 0.1)
				moveRight = true;
		}
	}
}