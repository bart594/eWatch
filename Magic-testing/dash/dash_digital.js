//dash digital

face[0] = {
	offms: (set.def.off[face.appCurr])?set.def.off[face.appCurr]:10000,
	old:set.def.bpp?0:1,
	g:w.gfx,
	spd:[],
	init: function(){
		this.buff={spd:-1,spdL:-1,spdM:-1,amp:-10,tmp:-1,bat:-1,volt:-1,buzz:-1,alrm:-1,conn:"OFF",lock:2,trpL:-1,bar:0};
		if ( euc.day[0] < Date().getHours() && Date().getHours() < euc.day[1] ) euc.night=0; else euc.night=1;
        if (this.old&&face.appPrev.startsWith("dash_")) {
			this.g.setColor(0,0);this.g.flip();	
		}else this.g.clear();
		this.spdC=[0,0,7,7];
		this.ampC=[1,2992,7,7];
		this.tmpC=[1,2992,7,7];
		this.batC=[4,1,7,7];
		this.batL=new Uint8Array(20);
		this.ampL = new Uint8Array(20);
		this.al=new Uint8Array(20);
		//this.ampL.fill(1,0,1);
		this.fact=dash.live.spdF*((set.def.dash.mph)?0.625:1);		
		this.trpF=dash.live.trpF*((set.def.dash.mph)?0.625:1);
		this.run=true;
		this.pos={};
		this.pos.topl=[0,20,119,70];
		this.pos.topr=[122,20,239,70];
		this.pos.pwm=[0,196,239,217];
		this.pos.spd=[43,72,197,190];
		this.pos.alrm=[0,196,239,217];
		this.pos.btn1=[0,72,40,132];
		this.pos.btn2=[0,135,40,193];
		this.pos.btn3=[200,72,239,132];
		this.pos.btn4=[200,135,239,193];
		this.pos.btm=[0,196,239,217];
		this.pos.bar=[0,240,239,280];

	},
	show : function(o){
		if (!this.run) return;
		if (euc.state=="READY") {
			//this.g.setColor(0,0);
			//this.g.fillRect(0,0,0,0);
			//if (this.old)this.g.flip();
			if (this.buff.spd != Math.round(dash.live.spd)) this.spdF();
			// alarm events time graph
			if (5<=this.buff.spd && this.al!=almL) this.alF();
			else if (5<=this.buff.spd && !euc.buzz && dash.live.maker=="Kingsong") this.pwrF();
			else if (!this.buff.bar) { this.buff.bar=1; this.barF();}
			//tmp/amp block
			if (!set.def.dash.amp||set.def.dash.amp==2) {
				if (this.buff.amp!=Math.round(dash.live.amp)) this.ampF();
			}else 
				if (this.buff.tmp!=Math.round(dash.live.tmp))	this.tmpF();
			//alarm block
			if (this.buff.buzz!=euc.buzz) this.buzF(); 
			//spdMspeed block
			if (this.buff.spdM!=dash.live.spdM.toFixed(1)) this.spMF(); 
			//buzzer/health block
			if (dash.live.maker=="Kingsong") {
				if (this.buff.spdL!=dash.live.spdL) this.spLF();
			}else if (this.buff.alrm!=dash.live.alrm) this.alrF();	
			//tmp/amp field
			if (set.def.dash.amp){
				if (this.ampL!=ampL) this.amLF();				
			}else if (this.buff.tmp!=dash.live.tmp.toFixed(1)) this.tmFF();
			//batery field
			//batery field
			if (!set.def.dash.bat){
				if (this.buff.volt!=dash.live.volt.toFixed(2)) this.vltF();
			}else if (set.def.dash.bat==1) {
				if (dash.live.bat!=this.bat) this.batF();
			}else if (this.batL!=batL) this.baLF();			
			//Mileage
			if (this.buff.trpL!=dash.live.trpL.toFixed(2)) this.mileage();    
		//rest
		} else  {
			if (euc.state!=this.buff.conn) {
				this.buff.conn=euc.state;
				this.g.setColor(0,0);
				this.g.fillRect(0,0,239,279);
				this.g.setColor(1,15);
				this.g.setFont("Vector",50);
				this.g.drawString(euc.state,(125-this.g.stringWidth(euc.state)/2),95);
				if (this.old)this.g.flip();
				this.buff.spd=-1;this.buff.amp=-1;this.buff.tmp=-1;this.bat=-1;this.buff.trpL=-1;this.buff.conn=0;this.buff.lock=2;
				this.buff.buzz=-1;this.buff.volt=-1;this.buff.spdM=-1;this.buff.alrm=-1;this.buff.spdL=-1;this.buff.spdM=-1;this.buff.bar=0;
				this.ampL.fill(1,0,1);this.batL.fill(1,0,1);
				this.run=true;
			}
		}
		if (!this.old)this.g.flip();
		//refresh 
		this.tid=setTimeout(function(t){
			t.tid=-1;
			t.show();
		},200,this);
	},
	spdF: function(){
		"ram";
		this.buff.spd=Math.round(dash.live.spd);
		this.g.setColor(0,(dash.live.spdC==1)?0:this.spdC[dash.live.spdC]);
		
		this.g.fillRect(this.pos.spd[0],this.pos.spd[1],this.pos.spd[2],this.pos.spd[3]);
		this.g.setColor(1,(dash.live.spdC==1)?13:15);
		if (100 <= this.buff.spd) {
			if (150 < this.buff.spd)  this.buff.spd=150;
			this.g.setFontVector(80);
		}else 
			this.g.setFontVector(130);
		//this.g.drawString((set.def.dashSpd)?dash.live.spd:Math.round(dash.live.spd/1.6),129-(this.g.stringWidth((set.def.dashSpd)?dash.live.spd:Math.round(dash.live.spd/1.6))/2),57); 
		this.g.drawString(Math.round(this.buff.spd*this.fact),129-(this.g.stringWidth(Math.round(this.buff.spd*this.fact))/2),this.pos.spd[1]); 
		if (this.old)this.g.flip();
		if (this.buff.spd==0) { 
			this.buff.bar=1;
			this.barF();
		}
	},
	alF: function(){
		"ram";
		this.al.set(almL);
		//print(this.al,almL);
		this.g.setColor(0,1);
		this.g.clearRect(this.pos.alrm[0],this.pos.alrm[1],this.pos.alrm[2],this.pos.alrm[3]);
		this.g.setColor(1,15);
		//graph
		//this.al.forEach(function(val,i){
		for (let i in this.al ){
			w.gfx.fillRect(237-(i*12),(this.al[i])?181:191,237-((i*12)+8),this.pos.alrm[1]);
		}
		//});
		if (this.old)this.g.flip();
	},
	ampF: function(){
		this.buff.amp=Math.round(dash.live.amp);
		this.g.setColor(0,this.ampC[dash.live.ampC]);
		this.g.fillRect(this.pos.btn1[0],this.pos.btn1[1],this.pos.btn1[2],this.pos.btn1[3]);
		this.g.setColor(1,15);
		this.g.setFontVector(12);
		this.g.drawString("AMP", 8,this.pos.btn1[1]+5);
		this.g.setFontVector(32);
		this.g.drawString(this.buff.amp|0, 22-(this.g.stringWidth(this.buff.amp|0)/2),this.pos.btn1[1]+20); 
		if (this.old)this.g.flip();
	},
	tmpF: function(){
		this.buff.tmp=Math.round(dash.live.tmp);
		this.g.setColor(0,this.tmpC[dash.live.tmpC]);
		this.g.fillRect(this.pos.btn1[0],this.pos.btn1[1],this.pos.btn1[2],this.pos.btn1[3]);
		this.g.setColor(1,15);
		this.g.setFontVector(11);
		this.g.drawString("TEMP", 6,this.pos.btn1[1]+5);
		let temp=(set.def.dash.farn)?Math.round(this.buff.tmp*1.8+32):Math.round(this.buff.tmp);
		this.g.setFontVector((100<temp)?20:32);
		this.g.drawString(temp,22-(this.g.stringWidth(temp)/2),this.pos.btn1[1]+20); 
		//this.g.drawString(Math.round(this.buff.tmp), 22-(this.g.stringWidth(Math.round(this.buff.tmp))/2),80); 
		if (this.old)this.g.flip();
	},
	buzF: function(){
		this.buff.buzz=euc.buzz;
		this.g.setFontVector(35);
		this.g.setColor(0,(this.buff.buzz)?7:1);
		this.g.fillRect(this.pos.btn2[0],this.pos.btn2[1],this.pos.btn2[2],this.pos.btn2[3]);
		this.g.setColor(1,(this.buff.buzz)?15:0);
		this.g.drawString("!", 19,this.pos.btn2[1]); 
		if (this.old)this.g.flip();
	},
	spMF: function(){
		this.buff.spdM=dash.live.spdM.toFixed(1);
		this.g.setColor(0,1);
		this.g.fillRect(this.pos.btn3[0],this.pos.btn3[1],this.pos.btn3[2],this.pos.btn3[3]);
		this.g.setColor(1,15);
		this.g.setFontVector(12);
		this.g.drawString("TOP", 208,this.pos.btn3[1]+5);
		this.g.setFontVector(32);
		this.g.drawString(Math.round(this.buff.spdM*this.fact), 222-(this.g.stringWidth(Math.round(this.buff.spdM*this.fact))/2),this.pos.btn3[1]+20); 
		if (this.old)this.g.flip();
	},	
	spLF: function(){
		this.buff.spdL=dash.live.spdL;
		this.g.setColor(0,(dash.live.lim[3]<=this.buff.spdL)?1:7);	
		this.g.fillRect(this.pos.btn4[0],this.pos.btn4[1],this.pos.btn4[2],this.pos.btn4[3]); 
		this.g.setColor(1,15);
		this.g.setFontVector(11);
		this.g.drawString("LIMIT", 205,this.pos.btn4[1]+5);
		this.g.setFontVector(32);
		this.g.drawString(Math.round(this.buff.spdL*this.fact), 202,this.pos.btn4[1]+20); 
		if (this.old)this.g.flip();
	},	
	alrF: function(){
		this.buff.alrm=dash.live.alrm;
		this.g.setColor(0,1);
		this.g.fillRect(this.pos.btn4[0],this.pos.btn4[1],this.pos.btn4[2],this.pos.btn4[3]); 
		this.g.setColor(1,0);
		this.g.setFontVector(35);
		this.g.drawString("B", 212,this.pos.btn4[1]); 
		if (this.old)this.g.flip();
	},	
	tmFF: function(){
		this.buff.tmp=dash.live.tmp.toFixed(1);
		this.g.setColor(0,this.tmpC[dash.live.tmpC]);
		this.g.fillRect(this.pos.topl[0],this.pos.topl[1],this.pos.topl[2],this.pos.topl[3]);       
		this.g.setColor(1,15);
		this.g.setFontVector(50);
		let temp=(set.def.dash.farn)?this.buff.tmp*1.8+32:this.buff.tmp;
		temp=(temp<100)?Number(temp).toFixed(1):Math.round(temp);
		let size=this.g.stringWidth(temp);
		this.g.drawString(temp, 0,this.pos.topl[1]+3); 

		this.g.setFontVector(16);
		this.g.drawString((set.def.dash.farn)?"°F":"°C",size-1,this.pos.topl[1]+5); 
		if (this.old)this.g.flip();
	},	
	amLF: function(){
		this.ampL.set(ampL);
		this.g.setColor(1,(1<dash.live.ampC)?7:1);
		this.g.fillRect(this.pos.topl[0],this.pos.topl[1],this.pos.topl[2],this.pos.topl[3]);       
		this.g.setColor(0,15);
		for (let i in this.ampL ){
			w.gfx.fillRect(118-(i*6),(this.ampL[i]<200)?this.pos.topl[1]+50-(this.ampL[i]*1.2):this.pos.topl[1]+1,118-(i*6)-1,(this.ampL[i]<200)?this.pos.topl[1]+50:(this.pos.topl[1]+255-this.ampL[i])*2);
		}
		if (this.old)this.g.flip();
	},	
	pwrF: function(){
		this.g.setColor(0,1);
		//this.g.setColor(0,7);
		this.g.fillRect(this.pos.pwm[0],this.pos.pwm[1],this.pos.pwm[2],this.pos.pwm[3]); 
		//this.g.fillRect(dash.live.pwr*2.4,176,239,197); 
		this.g.setColor(1,(50<=dash.live.pwr)?(80<=dash.live.pwr)?7:13:15);
		this.g.setFontVector(25);
		this.g.drawString(((dash.live.pwr/dash.live.spd)*10).toFixed(1),3,this.pos.pwm[1]);
		this.g.fillRect(80,182,80+dash.live.pwr*1.6,192); 
		w.gfx.flip();
	},
	vltF: function(){
		this.buff.volt=dash.live.volt.toFixed(2);
		this.g.setColor(0,this.batC[dash.live.batC]);
		this.g.fillRect(this.pos.topr[0],this.pos.topr[1],this.pos.topr[2],this.pos.topr[3]);       
		this.g.setColor(1,15);
		this.g.setFontVector((this.buff.volt<100)?40:35);
		this.g.drawString(this.buff.volt,(this.buff.volt<100)?135:125,this.pos.topr[1]); 
		this.g.setFontVector(13);
		this.g.drawString("VOLT",202,this.pos.topr[1]+38);
		if (this.old)this.g.flip();
	},	
	batF: function(){
		this.buff.bat=dash.live.bat;
		this.g.setColor(0,this.batC[dash.live.batC]);
		this.g.fillRect(this.pos.topr[0],this.pos.topr[1],this.pos.topr[2],this.pos.topr[3]);       
		this.g.setColor(1,15);
		this.g.setFontVector(50);
		this.g.drawString(this.buff.bat,225-(this.g.stringWidth(this.buff.bat)),this.pos.topr[1]+3);
		this.g.setFontVector(20);
		this.g.drawString("%",227,this.pos.topr[1]+8);
		if (this.old)this.g.flip();
	},
	baLF: function(){
		this.batL.set(batL);
		this.g.setColor(0,this.batC[dash.live.batC]);
		this.g.fillRect(this.pos.topr[0],this.pos.topr[1],this.pos.topr[2],this.pos.topr[3]);       
		this.g.setColor(1,15);
		//graph
		//this.batL.forEach(function(val,i){
		for (let i in this.batL ){
			w.gfx.fillRect(238-(i*6),this.pos.topr[3]-(this.batL[i]/2),238-(i*6)-1,this.pos.topr[3]);
		}
		//	w.gfx.fillRect(238-(i*6),50-(val/2),238-(i*6)-1,50);
		//});
		if (this.old)this.g.flip();
	},	
	mileage: function(){
		this.buff.trpL=dash.live.trpL.toFixed(2);
		this.g.setColor(0,0);
		this.g.fillRect(this.pos.bar[0],this.pos.bar[1],this.pos.bar[2],this.pos.bar[3]);
		//this.g.fillRect(0,203,239,279);
		this.g.setColor(1,14);
		this.g.setFontVector(35);
		this.g.drawString((this.buff.trpL*this.trpF).toFixed(2),0,this.pos.bar[1]); 
		if (!set.def.dash.clck) {//clock
			let d=(Date()).toString().split(' ');
			let t=(d[4]).toString().split(':');
			this.time=(t[0]+":"+t[1]);
			this.g.drawString(this.time, this.pos.bar[2]-(this.g.stringWidth(this.time)),this.pos.bar[1]); //temp
		}else 	
			this.g.drawString(Math.round(dash.live.trpT*this.trpF),240-(this.g.stringWidth(Math.round(dash.live.trpT*this.trpF))),this.pos.bar[1]); 
		if (this.old)this.g.flip();
	},
	barF: function(){
		this.g.setColor(1,1);
		this.g.fillRect(this.pos.btm[0],this.pos.btm[1],this.pos.btm[2],this.pos.btm[3]); //mileage
		this.g.setColor(0,15);
		this.g.setFontVector(16); //mileage
			this.g.drawString("TRIP",2,this.pos.btm[1]); 
			this.g.drawString((set.def.dash.mph)?"MPH":"KPH",105,this.pos.btm[1]);
			this.g.drawString((!set.def.dash.clck)?"CLOCK":"TOTAL",181,this.pos.btm[1]); 
		if (this.old)this.g.flip();
	},
	tid:-1,
	run:false,
	clear : function(){
		this.run=false;
		if (this.tid>=0) clearTimeout(this.tid);
		this.tid=-1;
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
		face.pageCurr=0;
		if (euc.state=="OFF") 
			face.go("main",0); 
		else {
			face.go(set.dash[set.def.dash.face],-1);
		}
		return true;
	},
	clear: function(){
		return true;
	},
};	

UIc.start(1,0);
UI.ele.coord("main","_main",1);
UI.ele.coord("main","_main",2);
UI.ele.coord("main","_bar",6);
UIc.end();



UIc.main._main=(i)=>{
	if (i==2){
		if (set.def.dash.bat==undefined || 1 < set.def.dash.bat) set.def.dash.bat=0; else set.def.dash.bat++;
		face[0].buff.bat=-1;face[0].buff.volt=-1;face[0].batL.fill(1,0,1);
		buzzer(buz.ok);
	}else if (i==1){
		if (set.def.dash.amp==undefined) set.def.dash.amp=0;
		if (set.def.dash.amp<2) set.def.dash.amp++; else set.def.dash.amp=0;
		face[0].buff.tmp=-1;face[0].buff.amp=-1;face[0].ampL.fill(1,0,1);
		buzzer(buz.ok);
	}
};
UIc.main._bar=(i)=>{
	if (set.def.dash.clck==undefined) set.def.dash.clck=0;
	set.def.dash.clck=1-set.def.dash.clck;
	face[0].buff.trpL=-1;face[0].barF();
	buzzer(buz.ok);
};
//
tcNext.replaceWith((x,y)=>{
	buzzer(buz.ok);
	if ( euc.state!="OFF")
		face.go('dash'+require("Storage").readJSON("dash.json",1)['slot'+require("Storage").readJSON("dash.json",1).slot+'Maker'],0);
	else 
		buzzer(buz.na);
});
tcBack.replaceWith((x,y)=>{
	buzzer(buz.ok);
	face.go("main",0);
});