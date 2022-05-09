//Dash Scan
face[0] = { 
	offms: (set.def.off[face.appCurr])?set.def.off[face.appCurr]:5000,
  g:w.gfx, 
  init: function(o){ 
    this.g.setColor(0,0);
    this.g.fillRect(0,205,239,239);
    this.g.setColor(1,15);
    this.g.setFont("Vector",20);
	this.g.drawString("SCAN FOR",120-(this.g.stringWidth("SCAN FOR")/2),217);
    this.g.flip();
	this.page(1);

  },
  show : function(o){
	return;
  },
  page : function(n) {
	this.set=n;
    this.g.setColor(0,1);
    this.g.fillRect(0,0,239,96);
    this.g.setColor(1,15);
	this.g.setFont("Vector",28);
  	this.g.drawString((n==1)?"eBIKE":"eBIKE",120-(this.g.stringWidth((n==1)?"eBIKE":"eBIKE")/2),38); 
	this.g.setFont("Vector",16);
    this.g.drawString((n==1)?"eTomic":"eTomic",120-(this.g.stringWidth((n==1)?"eTomic":"eTomic")/2),73);
    this.g.flip();
	this.g.setColor(0,0);	
	this.g.drawLine(0,97,239,97);
	this.g.drawLine(0,98,239,98);
    this.g.flip();
   this.g.setColor(0,0);
	this.g.fillRect(0,196,239,204);
	this.g.setColor(1,3);
    this.g.fillRect(75,200,165,204);
    this.g.flip();
    this.g.setColor(1,15);
    if (n===1) this.g.fillRect(75,200,98,204);
    else if (n===2) this.g.fillRect(98,200,120,204);
    else if (n===3) this.g.fillRect(120,200,142,204);
    else this.g.fillRect(142,200,165,204);
	this.g.flip();
	this.g.setColor(0,0);
    this.g.fillRect(0,205,239,239);
    this.g.setColor(1,15);
    this.g.setFont("Vector",20);
	this.g.drawString("SCAN FOR",120-(this.g.stringWidth("SCAN FOR")/2),217);
	this.g.flip();

  },
  ntfy: function(txt1,txt0,size,clr,bt){
            this.g.setColor(0,clr);
			this.g.fillRect(0,198,239,239);
			this.g.setColor(1,15);
			this.g.setFont("Vector",size);
     		this.g.drawString((bt)?txt1:txt0,120-(this.g.stringWidth((bt)?txt1:txt0)/2),214); 
			this.g.flip();
			if (this.ntid) clearTimeout(this.ntid);
			this.ntid=setTimeout(function(t){
                t.ntid=0;
				t.g.setColor(0,0);
				t.g.fillRect(0,205,239,239);
				t.g.setColor(1,15);
				t.g.setFont("Vector",20);
		        t.g.drawString("SCAN FOR",120-(t.g.stringWidth("SCAN FOR")/2),217); 
				t.g.flip();
				t.g.setColor(0,0);
				t.g.fillRect(0,196,239,204);
				t.g.setColor(1,3);
				t.g.fillRect(75,200,165,204);
				t.g.flip();
				t.g.setColor(1,15);
				if (face[0].set===1) t.g.fillRect(75,200,105,204);
				else if (face[0].set===2) t.g.fillRect(105,200,135,204);
				else t.g.fillRect(135,200,165,204);
				t.g.flip(); 
			},1000,this);
  },
  tid:-1,
  run:false,
  clear : function(){  
    this.run=false;
	if (this.ntid) clearTimeout(this.ntid); this.ntid=0;
    if (this.tid>=0) clearTimeout(this.tid); this.tid=-1;
    return true;
  },
  off: function(){
    this.g.off();
    this.clear();
  }
};
face[1] = {
  offms:1000,
  init: function(){
  return true;
  },//only use this part of the face to set redirection.
  show : function(){
    face.go("dashGarage",0);
    return true;
  },
   clear: function(){
   return true;
  },
   off: function(){
   this.clear();
  }
};	
touchHandler[0]=function(e,x,y){ 
	this.timeout();
  switch (e) {
  case 5: case 12: //tap event//long press event
	
    if(0<y&&y<100) {
		buzzer([30,50,30]);
		if ( face[0].set === 1 ) { //eBike
			if (!Boolean(require("Storage").read('eBike'))) {face[0].ntfy("INSTALL MODULE","",20,7,1); return; }
			set.write("dash","slot"+require("Storage").readJSON("dash.json",1).slot+"Maker","eBike");
			set.write("dash","slot"+require("Storage").readJSON("dash.json",1).slot+"Name","eTomic");
			euc.dash.name=0;
			euc.dash.maker="eBike";
			face.go('w_scan',0,'ffe0'); return;
		}
    }else buzzer(40); 
    break;
  case 1: //slide down event
    face.go(set.dash[set.def.dash.face],0);
	return;	 
  case 2: //slide up event
    if (y>200&&x<50) { //toggles full/current brightness on a left down corner swipe up. 
      if (w.gfx.bri.lv!==7) {this.bri=w.gfx.bri.lv;w.gfx.bri.set(7);}
      else w.gfx.bri.set(this.bri);
      buzzer([30,50,30]);
      
    }else {face.go("settings",0);return;}  
	
    break;
  case 3: //slide left event
	if ( face[0].set < 1 ) {
		if (face[0].ntid) clearTimeout(face[0].ntid); face[0].ntid=0;
		face[0].set ++ ;
		face[0].page(face[0].set);
    }else buzzer(40);    
	
    break;
  case 4: //slide right event (back action)
    if ( 1 < face[0].set ) {
		if (face[0].ntid) clearTimeout(face[0].ntid); face[0].ntid=0;
 		face[0].set -- ;
		face[0].page(face[0].set); 
        
    } else {
      face.go("dashGarage",0);
      return;
    }
    break;
  }
};
