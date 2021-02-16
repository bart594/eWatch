//kingsong  set advanced
face[0] = {
	offms: 5000,
	g:w.gfx,
	init: function(){
        //info
        this.g.flip();
		this.g.setColor(0,col("black"));
		this.g.fillRect(0,196,239,239);
		this.g.setColor(1,col("white"));
		this.g.setFont("Vector",20);
		this.g.drawString("ADVANCED",120-(this.g.stringWidth("ADVANCED")/2),214); 
		this.g.flip(); 
		//ride mode
		this.b3=euc.dash.mode;
		if (this.b3==0) {
			this.b3t="HARD";this.b3c=col("raf4");
		}else if (this.b3==1) {
			this.b3t="MED";this.b3c=col("olive");
		}else if (this.b3==2) {
			this.b3t="SOFT";this.b3c=col("raf");
		}
		this.g.setColor(0,this.b3c);
		this.g.fillRect(0,0,118,97);
		this.g.setColor(1,col("white"));
		this.g.setFont("Vector",18);	
		this.g.drawString("MODE",60-(this.g.stringWidth("MODE")/2),15); 
		this.g.setFont("Vector",30);	
		this.g.drawString(this.b3t,60-(this.g.stringWidth(this.b3t)/2),50); 
		this.g.flip();

		//calibrate
		this.g.setColor(0,(this.b2)?col("raf"):col("dgray"));
		this.g.fillRect(122,0,239,97);
		this.g.setColor(1,col("white"));
		this.g.setFont("Vector",18);	
		this.g.drawString("CALIBRATE",185-(this.g.stringWidth("CALIBRATE")/2),37); 
		this.g.flip();
		//limits
		this.g.setColor(0,(this.b2)?col("raf"):col("dgray"));
		this.g.fillRect(0,100,118,195);
		this.g.setColor(1,col("white"));
		this.g.setFont("Vector",16);	
		this.g.drawString("LIMMITS",60-(this.g.stringWidth("LIMMITS")/2),110); 
		this.g.setFont("Vector",20);	
		this.g.drawString(euc.dash.spd1,40-(this.g.stringWidth(euc.dash.spd1)/2),140);
		this.g.drawString(euc.dash.spd2,40-(this.g.stringWidth(euc.dash.spd2)/2),170); 
		this.g.drawString(euc.dash.spd3,80-(this.g.stringWidth(euc.dash.spd3)/2),140); 
		this.g.drawString(euc.dash.spdT,80-(this.g.stringWidth(euc.dash.spdT)/2),170); 
		this.g.flip();
		this.b1=0;
		this.b2=0;
		this.b3=0;
		this.b4=0;
		this.info=0;
		this.firstrun=1;
		this.run=true;
	},
	show : function(){
		if (euc.state!=="READY") {face.go(set.dash[set.def.dash],0);return;}
		if (!this.run) return; 
		
        this.tid=setTimeout(function(t,o){
		  t.tid=-1;
		  t.show();
        },100,this);
	},
	tid:-1,
	run:false,
	clear : function(){
		//this.g.clear();
		this.run=false;
		if (this.tid>=0) clearTimeout(this.tid);this.tid=-1;
   		if (this.itid) clearTimeout(this.itid);this.itid=0;
		return true;
	},
	off: function(){
		this.g.off();
		this.clear();
	}
};
//loop face
face[1] = {
	offms:1000,
	init: function(){
		return true;
	},
	show : function(){
		face.go("dashSetKingsong",0);
		return true;
	},
	clear: function(){
		return true;
	},
};	
//touch
touchHandler[0]=function(e,x,y){ 
	switch (e) {
	case 5: //tap event
		if (x<=120&&y<=100) { //ride mode
			if (euc.dash.mode==0) euc.wri("rideMed");
			else if (euc.dash.mode==1) euc.wri("rideSoft");
			else if (euc.dash.mode==2) euc.wri("rideHard");
			digitalPulse(D16,1,[30,50,30]);		
		}else if (120<=x<=239&&y<=100) { //buzz
			face.go("dashSetKsAdvCalibrate",0);
			return;
		}else if (x<=120&&100<=y<=200) { //auto off
			euc.dash.aOff=1-euc.dash.aOff;
			digitalPulse(D16,1,[30,50,30]);		
		}else if (120<=x<=239&&100<=y<=200) { //lock
			euc.dash.horn=1-euc.dash.horn;
			digitalPulse(D16,1,[30,50,30]);						
		}else digitalPulse(D16,1,[30,50,30]);
		this.timeout();
		break;
	case 1: //slide down event
		//face.go("main",0);
		face.go(set.dash[set.def.dash],0);
		return;	 
	case 2: //slide up event
		if (y>200&&x<50) { //toggles full/current brightness on a left down corner swipe up. 
			if (w.gfx.bri.lv!==7) {this.bri=w.gfx.bri.lv;w.gfx.bri.set(7);}
			else w.gfx.bri.set(this.bri);
			digitalPulse(D16,1,[30,50,30]);
		}else if (y>190) {
			if (Boolean(require("Storage").read("settings"))) {face.go("settings",0);return;}  
		} else {digitalPulse(D16,1,40);}
		this.timeout();
		break;
	case 3: //slide left event
		digitalPulse(D16,1,40);    
		this.timeout();
		break;
	case 4: //slide right event (back action)
		face.go("dashSetKsOpt",0);
		return;
	case 12: //long press event
		digitalPulse(D16,1,[100]);
		this.timeout();
		break;
  }
};
