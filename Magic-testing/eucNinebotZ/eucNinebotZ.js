//m_euc ninebot one Z10
euc.tmp={count:0,loop:0};
euc.cmd=function(no){
	switch (no) {
//    case "live":return [90,165,1,62,20,01,176,32,219,254]; //Current Amperage with sign if v[80] > 32768 I = v[80] - 65536 else I = v[80] in Amperes * 100
    case "live" :return [0x5a,0xa5,0x01,0x3e,0x14,0x01,0xb0,0x20,0xdb,0xfe]; //Current Amperage with sign if v[80] > 32768 I = v[80] - 65536 else I = v[80] in Amperes * 100
    case "live1":return [0x5a,0xa5,0x01,0x3e,0x14,0x01,0x68,0x02,0x41,0xff]; //Current Amperage with sign if v[80] > 32768 I = v[80] - 65536 else I = v[80] in Amperes * 100
    case "live2":return [0x5a,0xa5,0x01,0x3e,0x14,0x01,0x10,0x0e,0x8d,0xff]; //Current Amperage with sign if v[80] > 32768 I = v[80] - 65536 else I = v[80] in Amperes * 100
    case "live3":return [0x5a,0xa5,0x01,0x3e,0x14,0x01,0x1a,0x02,0x8f,0xff]; //Current Amperage with sign if v[80] > 32768 I = v[80] - 65536 else I = v[80] in Amperes * 100
    }
};
//
euc.wri=function(i) {if (set.bt===2) console.log("not connected yet"); if (i=="end") euc.off(); return;};
euc.conn=function(mac){
	
    if ( global["\xFF"].BLE_GATTS!="undefined") {
		if (set.def.cli) print("ble allready connected"); 
		if (global["\xFF"].BLE_GATTS.connected) 
		global["\xFF"].BLE_GATTS.disconnect();
		this.tgl();
		return;
    }
	if (euc.reconnect) {clearTimeout(euc.reconnect); euc.reconnect=0;}
	NRF.connect(mac,{minInterval:7.5, maxInterval:15})
		.then(function(g) {
			return g.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
		}).then(function(s) {
			euc.serv=s;
			return euc.serv.getCharacteristic("6e400002-b5a3-f393-e0a9-e50e24dcca9e"); // write
		}).then(function(wc) {
			euc.wCha=wc;//write
			return euc.serv.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9e");//read
		}).then(function(rc) {
			euc.rCha=rc;
			//read
			euc.rCha.on('characteristicvaluechanged', function(event) {
				euc.alert=0;
				//print("eucNBZin :",event.target.value.buffer);
				if (event.target.value.buffer[0]==90 && event.target.value.buffer.length==20) {
					//print("o",event.target.value.buffer);
					//batt
					/*dash.live.bat=event.target.value.getUint16(15, true);
					batL.unshift(dash.live.bat);
					if (20<batL.length) batL.pop();
					dash.live.batC = (50 <= dash.live.bat)? 0 : (dash.live.bat <= dash.live.batL)? 2 : 1;	
					if ( dash.live.hapB && dash.live.batC ==2 )  euc.alert ++; 
					*/
					//speed
					dash.live.spd=event.target.value.getUint16(17, true)/100;
					dash.live.spdC = ( dash.live.spd1 <= dash.live.spd )? 2 : ( dash.live.spd2 <= dash.live.spd )? 1 : 0 ;	
					if ( dash.live.hapS && dash.live.spdC == 2 ) 
						euc.alert = 1 + Math.round((dash.live.spd-dash.live.spd1) / dash.live.spdS) ; 	
				}else  if (event.target.value.buffer[1] && event.target.value.buffer.length==20){
					//print("l",event.target.value.buffer);
					dash.live.trpT=event.target.value.getUint32(1, true)/1000;
					euc.log.trp.forEach(function(val,pos){ if (!val) euc.log.trp[pos]=dash.live.trpT;});
					dash.live.trpL=event.target.value.getUint32(1, true)/1000;
					dash.live.time=(event.target.value.getUint16(7, true)/60)|0;
					//temp
					dash.live.tmp=event.target.value.getUint16(9, true)/10;
					dash.live.tmpC=(dash.live.tmpH - 5 <= dash.live.tmp )? (dash.live.tmpH <= dash.live.tmp )?2:1:0;
					if (dash.live.hapT && dash.live.tmpC==2) euc.alert++; 	
					//volt
					dash.live.volt=(event.target.value.getUint16(11, true)/100);
					dash.live.bat=Math.round(100*(dash.live.volt*7.13 - dash.live.batE ) / (dash.live.batF-dash.live.batE));
					batL.unshift(dash.live.bat);
					if (20<batL.length) batL.pop();
					dash.live.batC = (50 <= dash.live.bat)? 0 : (dash.live.bat <= dash.live.batL)? 2 : 1;	
					if ( dash.live.hapB && dash.live.batC ==2 )  euc.alert ++; 
					//print(dash.live.volt);
					//amp
					dash.live.amp=event.target.value.getInt16(13, true)/100;
					ampL.unshift(Math.round(dash.live.amp));
					if (20<ampL.length) ampL.pop();
					dash.live.ampC = ( dash.live.ampH <= dash.live.amp || dash.live.amp <= dash.live.ampL )? 2 : ( dash.live.amp  <= -0.5 || 15 <= dash.live.amp)? 1 : 0;
					if (dash.live.hapA && dash.live.ampC==2) {
						if (dash.live.ampH<=dash.live.amp)	euc.alert =  euc.alert + 1 + Math.round( (dash.live.amp - dash.live.ampH) / dash.live.ampS) ;
						else euc.alert =  euc.alert + 1 + Math.round(-(dash.live.amp - dash.live.ampL) / dash.live.ampS) ;
					}
					dash.live.spd=event.target.value.getUint16(15, true)/100;
					if (dash.live.spdM < dash.live.spd) dash.live.spdM = dash.live.spd;
					dash.live.spdC = ( dash.live.spd <= dash.live.spd1 )? 0 : ( dash.live.spd2 <= dash.live.spd )? 2 : 1 ;	
					if ( dash.live.hapS && dash.live.spdC == 2 ) euc.alert = 1 + Math.round((dash.live.spd-dash.live.spd2) / dash.live.ampS) ; 	
					//average
					dash.live.spdA=(event.target.value.getUint16(17, true))/100;
					//dash.live.spdM=(event.target.value.getUint16(19, true))/100;
				} else return;
				//haptic
				if (!euc.buzz && euc.alert) {  
						if (!w.gfx.isOn&&(dash.live.spdC||dash.live.ampC||dash.live.alrm)) face.go(set.dash[set.def.dash.face],0);
						//else face.off(6000);
						euc.buzz=1;
						if (20 <= euc.alert) euc.alert = 20;
						var a=[];
						while (5 <= euc.alert) {
							a.push(200,500);
							euc.alert = euc.alert - 5;
						}
						for (let i = 0; i < euc.alert ; i++) a.push(200,150);
						digitalPulse(ew.pin.BUZZ,0,a);  
						setTimeout(() => { euc.buzz = 0; }, 3000);
				}
			});
			//on disconnect
			global["\u00ff"].BLE_GATTS.device.on('gattserverdisconnected', function(reason) {
				euc.off(reason);
			});
			euc.rCha.startNotifications();	
			return  rc;
		}).then(function(c) {
			//connected 
			if (set.bt===2) console.log("EUC: Connected"); 
			euc.state="READY"; //connected
			buzzer([90,40,150,40,90]);
			dash.live.lock=0;
			//write function
			euc.wri=function(cmd){
			//print ("lala",cmd,euc.cmd(cmd));
				if (euc.state==="OFF"||cmd==="end") {
					euc.busy=1;
					if (euc.loop) {clearTimeout(euc.loop); euc.loop=0;}
					if (global['\xFF'].BLE_GATTS && global['\xFF'].BLE_GATTS.connected) {
						euc.loop=setTimeout(()=>{
							euc.loop=0;
							global["\xFF"].BLE_GATTS.disconnect().catch(function(err)  {
								if (set.bt===2) console.log("EUC OUT disconnect failed:", err);
							});
						},300);
					}else {
						euc.state="OFF";
						euc.off("not connected");
						return;						}
				} else {
					euc.wCha.writeValue(euc.cmd(cmd)).then(function() {
						if (!euc.busy) { 
							euc.loop=setTimeout(function(t,o){
								euc.loop=0;
								euc.wri("live");	
							},50);
						}
					}).catch(function(err)  {
						euc.off("writefail");	
					});
				}
			};
			if (!setter.read("dash","slot"+setter.read("dash","slot")+"Mac")) {
				dash.live.mac=euc.mac; dash.live.batF=4.14;
				euc.updateDash(require("Storage").readJSON("dash.json",1).slot);
				setter.write("dash","slot"+setter.read("dash","slot")+"Mac",euc.mac);
			}
			euc.busy=0;
			setTimeout(() => {euc.wri("live");euc.run=1;}, 500);
		//reconnect
		}).catch(function(err)  {
			euc.off(err);
	});
};

euc.off=function(err){
	//if (set.bt===2) console.log("EUC:", err);
	//  global.error.push("EUC :"+err);
	if (euc.tmp.loop) {clearInterval(euc.tmp.loop);euc.tmp.loop=0;}
	if (euc.reconnect) {clearTimeout(euc.reconnect); euc.reconnect=0;}
	if (euc.state!="OFF") {
		if (set.bt===2) console.log("EUC: Restarting");
		if ( err==="Connection Timeout"  )  {
			if (set.bt===2) console.log("reason :timeout");
			euc.state="LOST";
			if ( set.def.dash.rtr < euc.run) {
				euc.tgl();
				return;
			}
			euc.run=euc.run+1;
			if (dash.live.lock==1) buzzer(250);
			else  buzzer([250,200,250,200,250]);
			euc.reconnect=setTimeout(() => {
				euc.reconnect=0;
				euc.conn(euc.mac); 
			}, 5000);
		}else if ( err==="Disconnected"|| err==="Not connected")  {
			if (set.bt===2) console.log("reason :",err);
			euc.state="FAR";
			euc.reconnect=setTimeout(() => {
				euc.reconnect=0;
				euc.conn(euc.mac); 
			}, 500);
		} else {
			if (set.bt===2) console.log("reason :",err);
			euc.state="RETRY";
			euc.reconnect=setTimeout(() => {
				euc.reconnect=0;
				euc.conn(euc.mac); 
			}, 1500);
		}
	} else {
		if (set.bt===2) console.log("EUC OUT:",err);
		euc.off=function(err){if (set.bt===2) console.log("EUC off, not connected",err);};
		euc.wri=function(err){if (set.bt===2) console.log("EUC write, not connected",err);};
		euc.conn=function(err){if (set.bt===2) console.log("EUC conn, not connected",err);};
		euc.cmd=function(err){if (set.bt===2) console.log("EUC cmd, not connected",err);};
		euc.run=0;
		euc.tmp=0;
		euc.busy=0;
		euc.serv=0;euc.wCha=0;euc.rCha=0;
		global["\xFF"].bleHdl=[];
		NRF.setTxPower(set.def.rfTX);	
		if ( global["\xFF"].BLE_GATTS&&global["\xFF"].BLE_GATTS.connected ) {
			if (set.bt===2) console.log("ble still connected"); 
			global["\xFF"].BLE_GATTS.disconnect();return;
		}
  }
};