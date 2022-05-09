//Vteran euc module 
//euc.conn(euc.mac);
//euc.wri("lightsOn")
//commands
config_send=0;
if (euc.last_trip==undefined) euc.last_trip = 0;
euc.tmp={count:0,loop:0};
euc.cmd=function(no){
	switch (no) {
    case "regular_package":return [0x52,0xFF,0xFF]; 
    case "debug_package":return [0x44,0xFF,0xFF];
    case "config_package": return [0x43,euc.dash.mode_config,euc.dash.street_mode_config];	
    }
};
//start
euc.conn=function(mac){
  	//check
	if ( global["\xFF"].BLE_GATTS!="undefined") {
		if (set.def.cli) print("ble allready connected"); 
		if (global["\xFF"].BLE_GATTS.connected) {global["\xFF"].BLE_GATTS.disconnect();return;}
	}
	if (euc.reconnect) {clearTimeout(euc.reconnect); euc.reconnect=0;}
  //connect 
	NRF.connect(mac,{minInterval:7.5, maxInterval:15})
	.then(function(g) {
	   return g.getPrimaryService(0xffe0);
	}).then(function(s) {
	  return s.getCharacteristic(0xffe1);
	//read
	}).then(function(c) {
		this.need=0;
		c.on('characteristicvaluechanged', function(event) {
			this.event=new Uint8Array(event.target.value.buffer);
			euc.alert=0;
			//print(this.event);
if  ( this.event[0]===0x52) {
		//print("regular packet");
		//print( event.target.value.buffer);
    euc.dash.mode = (this.event[1]);
    euc.dash.assist_level = (this.event[2]);   
    euc.dash.bat  = this.event[3];
    euc.dash.batC = (80 <= euc.dash.bat)? 0 : (euc.dash.bat <= euc.dash.batL)? 2 : 1;	
		if ( euc.dash.hapB && euc.dash.batC ==2 )  euc.alert ++; 
					
		batL.unshift(euc.dash.bat);
		if (20<batL.length) batL.pop();
		euc.dash.volt = ((this.event[5] << 8 | this.event[4])/100);
		euc.dash.amp  = ((this.event[7] << 8 | this.event[6])/100).toFixed(0);
		if (euc.dash.ampR) euc.dash.amp=-euc.dash.amp;
		ampL.unshift(euc.dash.amp);
		if (20<ampL.length) ampL.pop();
		euc.dash.ampC = ( euc.dash.ampH <= euc.dash.amp || euc.dash.amp <= euc.dash.ampL )? 2 : ( euc.dash.amp  <= 0 || 15 <= euc.dash.amp)? 1 : 0;
		if (euc.dash.hapA) euc.alert =  euc.alert + 1 + Math.round( (euc.dash.amp - euc.dash.ampH) / euc.dash.ampS);		
    euc.dash.battery_power =  (euc.dash.volt*euc.dash.amp).toFixed(0);
    euc.dash.battery_powerC = (euc.dash.battery_power > 2000 )? 2 : (euc.dash.battery_power > 1000 )? 1 :0 ;
  	batterypowerL.unshift(euc.dash.battery_power);
		if (20<batterypowerL.length) batterypowerL.pop();
    euc.dash.spd  = ((this.event[9] << 8 | this.event[8]) / 10);
		euc.dash.spdC = ( euc.dash.spd <= euc.dash.spd1 )? 0 : ( euc.dash.spd2 <= euc.dash.spd )? 2 : 1 ;	
		if ( euc.dash.hapS && euc.dash.spdC == 2 ) 
	
    euc.alert = 1 + Math.round((euc.dash.spd-euc.dash.spd2) / euc.dash.ampS) ; 		
		if (euc.dash.spdM < euc.dash.spd) euc.dash.spdM = euc.dash.spd;

    euc.dash.trpL = (((this.event[12] << 16 | this.event[11] << 8 | this.event[10]) * 1000))/100000 ;
		
    if (euc.dash.trpL != euc.last_trip){
		euc.dash.trpT += euc.dash.trpL-euc.last_trip;
		euc.last_trip = euc.dash.trpL;
		}
    euc.dash.trpT = (((this.event[12] << 16 | this.event[11] << 8 | this.event[10]) * 1000))/100000 ;

		euc.log.trp.forEach(function(val,pos){ if (!val) euc.log.trp[pos]=euc.dash.trpT;});
		
    euc.dash.time = ((this.event[15] << 16 | this.event[14] << 8  | this.event[13])/60).toFixed(0);
		euc.dash.system_state = this.event[16];
		euc.dash.street_mode = this.event[17]; 
		}else if(this.event[0]===0x44){
	  //print("debug packet");
	  //print( event.target.value.buffer);
		euc.dash.duty=(this.event[1]);
		euc.dash.cadence=(this.event[2]);
		euc.dash.cadenceC = ( euc.dash.cadence > 80 )? 2 : (   euc.dash.cadence > 50 )? 1 :0 ;
		euc.dash.rpm= (this.event[4] << 8 | this.event[3]);
		euc.dash.motor_amp=(((this.event[6] << 8 | this.event[5]) / 100)).toFixed(0);
		euc.dash.motor_power = (euc.dash.volt*euc.dash.motor_amp).toFixed(0);
    euc.dash.motor_powerC = ( euc.dash.motor_power > 2000 )? 2 : (   euc.dash.motor_power > 1000 )? 1 :0 ;  
		euc.dash.wh_used=((this.event[9] << 16 | this.event[8] << 8 | this.event[7])/100).toFixed(1);
		euc.dash.adc_delta=(this.event[11] << 8 | this.event[10]);
    euc.dash.kg=(euc.dash.adc_delta*3/100).toFixed(1);  
		euc.dash.pedal_torque=(this.event[13] << 8 | this.event[12]);
		euc.dash.pedal_power=(((euc.dash.pedal_torque * euc.dash.cadence) / 955)).toFixed(0);
    euc.dash.pedal_powerC = ( euc.dash.pedal_power > 400 )? 2 : (   euc.dash.pedal_power > 250 )? 1 :0 ;
    pedalpowerL.unshift(euc.dash.pedal_power);
		if (20<pedalpowerL.length) pedalpowerL.pop(); 
    euc.dash.debug_data_1 = (this.event[15] << 8 | this.event[14]);
    euc.dash.debug_data_2 = (this.event[17] << 8 | this.event[16]);  
	}
			//alerts
			if (euc.alert && !euc.buzz) {  
				euc.buzz=1;
				if (w.gfx.isOn) face.off(10000);
				if (20<=euc.alert) euc.alert=20;
				var a=[];
				while (5 <= euc.alert) {
					a.push(150,500);
					euc.alert=euc.alert-5;
				}
				var i;
				for (i = 0; i < euc.alert ; i++) {
					a.push(150,150);
				}
				digitalPulse(ew.pin.BUZZ,0,a);    
				setTimeout(() => {euc.buzz=0; }, 3000);
			}
			//screen on
			//if ((1<euc.dash.spdC||1<euc.dash.ampC||euc.dash.alrm)&&!w.gfx.isOn ){
			//	face.go(set.dash[set.def.dash.face],0);
			//}
		});
		//on disconnect
		global["\u00ff"].BLE_GATTS.device.on('gattserverdisconnected', function(reason) {
		euc.off(reason);
		});
    //c.startNotifications();
    return  c;
	//wri te
	}).then(function(c) {
			//connected 
			if (set.def.cli) console.log("eBike: Connected"); 
			euc.state="READY"; //connected
			buzzer([90,40,150,40,90]);
			euc.dash.lock=0;
      c.startNotifications();
			//write function
		  if (euc.busy) {euc.busy=setTimeout(()=>{euc.busy=0;},100);return;} 
		  euc.busy=setTimeout(()=>{euc.busy=0;},1000);	
      euc.wri=function(cmd){
      //print(cmd);
		if (euc.state==="OFF"||cmd==="end") {
					euc.busy=1;
					if (euc.loop) {clearTimeout(euc.loop); euc.loop=0;}
					c.stopNotifications();
					if (global['\xFF'].BLE_GATTS && global['\xFF'].BLE_GATTS.connected) {
						euc.loop=setTimeout(()=>{
							euc.loop=0;
							global["\xFF"].BLE_GATTS.disconnect().catch(function(err)  {
								console.log("EUC OUT disconnect failed:", err);
							});
						},300);
					}else {
					euc.state="OFF";
					euc.off("not connected");
					return;						}
		     } else if (cmd==="clearMeter"){
            euc.dash.trpL =0;
			      euc.dash.trpT =0;
		     }else if (cmd=="config"){
           setTimeout(()=>{config_send=1;},50);
         }else {
			      c.writeValue(euc.cmd(cmd)).then(function() {
            if (!euc.busy){ 
            euc.loop=setTimeout(function(t,o){
            if(!(euc.tmp.count & 0x01)){
            euc.wri("regular_package");}
            else if(config_send){
            euc.wri("config_package");config_send = 0;}
            else 
            euc.wri("debug_package");  
		        euc.tmp.count++;
          },100);
					}
					}).catch(function(err)  {
						euc.off("writefail");	
					});
				}
			};
			if (!set.read("dash","slot"+set.read("dash","slot")+"Mac")) {
				euc.dash.mac=euc.mac; 
				euc.updateDash(require("Storage").readJSON("dash.json",1).slot);
				set.write("dash","slot"+set.read("dash","slot")+"Mac",euc.mac);
			}			
			euc.busy=0;
			setTimeout(() => {euc.wri("regular_package");euc.run=1;}, 500);
	//reconect
	}).catch(function(err)  {
		euc.off(err);
	});
};
//catch
euc.off=function(err){
    if (euc.loop) {clearTimeout(euc.tmp.loop);euc.tmp.loop=0;}
	if (euc.reconnect) {clearTimeout(euc.reconnect);euc.reconnect=0;}
	if (euc.state!="OFF") {
        euc.seq=1;
		if (set.def.cli) 
			console.log("eBike: Restarting");
		if ( err==="Connection Timeout"  )  {
			if (set.def.cli) console.log("reason :timeout");
			if ( set.def.dash.rtr < euc.run) {
				euc.tgl();
				return;
			}
			euc.run=euc.run+1;
			if (euc.dash.lock==1) buzzer(250);
			else buzzer([250,200,250,200,250]);
			euc.reconnect=setTimeout(() => {
				euc.reconnect=0;
				euc.conn(euc.mac); 
			}, 5000);
		}
		else if ( err==="Disconnected"|| err==="Not connected")  {
			if (set.def.cli) console.log("reason :",err);
			euc.state="FAR";
			euc.reconnect=setTimeout(() => {
				euc.reconnect=0;
				euc.conn(euc.mac); 
			}, 500);
		}
		else {
			if (set.def.cli) console.log("reason :",err);
			euc.state="RETRY";
			euc.reconnect=setTimeout(() => {
				euc.reconnect=0;
				euc.conn(euc.mac); 
			}, 1000);
		}
	} else {
		if (set.def.cli) console.log("eBike OUT:",err);
		global["\xFF"].bleHdl=[];
	  euc.run=0;
		euc.tmp=0;
		euc.busy=0;
		if (euc.busy) {clearTimeout(euc.busy);euc.busy=0;}
		euc.off=function(err){if (set.def.cli) console.log("eBike off, not connected",err);};
		euc.wri=function(err){if (set.def.cli) console.log("eBike write, not connected",err);};
		euc.conn=function(err){if (set.def.cli) console.log("eBike conn, not connected",err);};
		euc.cmd=function(err){if (set.def.cli) console.log("eBike cmd, not connected",err);};
		NRF.setTxPower(set.def.rfTX);	
    }
};
