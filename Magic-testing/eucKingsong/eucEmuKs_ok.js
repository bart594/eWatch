//NRF.setConnectionInterval({minInterval:100, maxInterval:200});
//atc
//if (euc.state!=="READY") return;
euc.emuF=1;
euc.emuR=function(evt){
	if (evt.data==[170, 85, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 155, 20, 90, 90]){
		set.bt=4;
		handleInfoEvent({"src":"BT","title":"EUC","body":"Phone connected"});
		//euc.emuW([0xAA,0x55,0x00,0x00,0X00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x40,0x00,0xf5,0x14,0x5A,0x5A]);
		euc.emuW([0xAA,0x55,0x0f,0x20,0X00,0x00,0x04,0x00,0x3B,0xB4,0x08,0x00,0xa4,0x06,0x02,0xe0,0xa9,0x14,0x5A,0x5A]);
		//setTimeout(()=>{euc.emuU();},1000);
	} else euc.wri(evt.data);
};
NRF.setAddress("fd:23:d4:c5:b5:2a public");
//

NRF.setServices({
	0xffe0: {
		0xffe1: {
			value : [0x00],
			maxLen : 20,
            writable:true,
			onWrite : function(evt) {
				euc.emuR(evt);
			},
   			readable:true,
  			notify:true,
           description:"Key Press State"
		}
  }
}, { advertise: ['0xFFF0'], uart:false });

euc.emuW= function(o) {
	NRF.updateServices({
		0xffe0: {
			0xffe1: {
				value : o,
				notify:true
			}
		},
	});
};

/*
NRF.setAdvertising([[
0x02,0x01,0x06,
0x03,0x02,0xf0,0xff,
0x05,0x12,0x60,0x00,0x0c,0x00,
0x07,0xFF,0x48,0x43,0x2D,0x30,0x38,0x00,
]],{ name:"K-S18AA1"});

*/

/*
NRF.setAdvertising([[
0x02,0x01,0x06,
0x03,0x02,0xf0,0xff,
0x05,0x12,0x60,0x00,0x0c,0x00,
 ]],{ name:set.def.name});
*/

NRF.restart();