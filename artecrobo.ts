/**
 * implementation method.
 */
//% weight=10 color=#096670 icon="\uf1eb" block="_http"
//% groups=["04_IFTTT","03_ThingSpeak", "02_Weather", "01_System"]
namespace _http {

    //serial
    let _SERIAL_INIT = false
    let _WIFI_CONNECTED = false
    let _SERIAL_TX = SerialPin.P15
    let _SERIAL_RX = SerialPin.P14
    let _WIFI_SSID = ""
    let _WIFI_PASSWORD = ""
    let _IP = ""
    let cityID = ""
    let weatherKey = ""
    let aa = 0

    function WriteString(text: string): void {
        serial.writeString(text)
    }
    
    /*
    function startWork():void{
        basic.clearScreen()
        led.plot(1, 2)
        led.plot(2, 2)
        led.plot(3, 2)
    }
    */

    function _serial_init(): void {
        WriteString("123")
        let item = serial.readString()
        item = serial.readString()
        item = serial.readString()
        serial.redirect(
            _SERIAL_TX,
            _SERIAL_RX,
            BaudRate.BaudRate9600
        )
        serial.setRxBufferSize(200)
        serial.setTxBufferSize(100)
        WriteString("\r")
        item = serial.readString()
        WriteString("|1|1|\r")
        item = serial.readUntil("\r")
        item = serial.readString()
        item = serial.readString()
        item = serial.readString()
        item = serial.readString()
        _SERIAL_INIT = true
    }

    function getTimeStr(myTimes: number): string {
        let myTimeStr = ""
        let secs = myTimes % 60
        let mins = Math.trunc(myTimes / 60)
        let hours = Math.trunc(mins / 60)
        mins = mins % 60
        hours = hours % 24
        if (hours < 10)
            myTimeStr = "0" + hours
        else
            myTimeStr = "" + hours
        myTimeStr += ":"
        if (mins < 10)
            myTimeStr = myTimeStr + "0" + mins
        else
            myTimeStr = myTimeStr + mins
        myTimeStr += ":"
        if (secs < 10)
            myTimeStr = myTimeStr + "0" + secs
        else
            myTimeStr = myTimeStr + secs
        return myTimeStr
    }

    function _connect_wifi(): void {
        if (_SERIAL_INIT) {
            if (!_SERIAL_INIT) {
                _serial_init()
            }
            let item = "test"
            WriteString("|2|1|" + _WIFI_SSID + "," + _WIFI_PASSWORD + "|\r") //Send wifi account and password instructions
            item = serial.readUntil("\r")
            while (item.indexOf("|2|3|") < 0) {
                item = serial.readUntil("\r")
            }
            _IP = item.substr(5, item.length - 6)
            _WIFI_CONNECTED = true
            basic.showIcon(IconNames.Yes)
        }

    }


    /**
     * Setup  Tx Rx to micro:bit pins and WIFI SSID, password.
     * @param SSID to SSID ,eg: "yourSSID"
     * @param PASSWORD to PASSWORD ,eg: "yourPASSWORD"
     * @param receive to receive ,eg: SerialPin.P1
     * @param send to send ,eg: SerialPin.P2
    */
    //% weight=100 group="01_System"
    //% receive.fieldEditor="gridpicker" receive.fieldOptions.columns=3
    //% send.fieldEditor="gridpicker" send.fieldOptions.columns=3
    //% blockId=_WIFI_setup blockGap=5
    //% block=" setup WIFI | Pin set: | Receive data (RX): %receive| Send data (TX): %send | Wi-Fi: | Name: %SSID| Password: %PASSWORD| Start connection"
    export function _WIFI_setup(/*serial*/receive: SerialPin, send: SerialPin,
                                     /*wifi*/SSID: string, PASSWORD: string
    ):
        void {
        basic.showLeds(`
        . . . . .
        . . . . .
        . # # # .
        . . . . .
        . . . . .
        `)
        _WIFI_SSID = SSID
        _WIFI_PASSWORD = PASSWORD
        _SERIAL_TX = send
        _SERIAL_RX = receive
        _serial_init()
        _connect_wifi()
    }
/*
    //% weight=99
    //% blockId=_serial_disconnect
    //% block=" serial disconnect"
    export function _serial_disconnect(): void {
        _SERIAL_INIT = false
    }
    //% weight=98
    //% blockId=_serial_reconnect
    //% block=" serial reconnect"
    export function _serial_reconnect(): void {
        _serial_init()
    }
*/

    /**
     * connect to https://thingspeak.com/ to store the data from micro:bit
    */
    //% weight=92 
    //% blockId=saveToThingSpeak blockGap=5
    //% expandableArgumentMode"toggle" inlineInputMode=inline
    //% block="send data to ThingSpeak :| write key: %myKey field1: %field1 || field2: %field2 field3: %field3 field4: %field4 field5: %field5 field6: %field6 field7: %field7 field8: %field8"
    export function saveToThingSpeak(myKey: string, field1:number, field2?:number, field3?:number, field4?:number, field5?:number, field6?:number, field7?:number, field8?:number): void {
        _serial_init()
        basic.showLeds(`
        . . . . .
        . . . . .
        . # # # .
        . . . . .
        . . . . .
        `)
        let returnCode=""
        let myArr:number[]=[field1,field2,field3,field4,field5,field6,field7,field8]
        let myUrl = "http://api.thingspeak.com/update?api_key=" + myKey
        for(let i=0;i<myArr.length;i++)
        {
            if (myArr[i]!=null)
                myUrl+="&field"+(i+1)+"="+myArr[i]
            else
                break
        }
        serial.readString()
        WriteString("|3|1|" + myUrl + "|\r")
        for (let i = 0; i < 3; i++) {
            returnCode = serial.readUntil("|")
        }
        if (returnCode == "200")
            basic.showIcon(IconNames.Yes)
        else
            basic.showIcon(IconNames.No)
    }

    /**
     * connect to IFTTT to trig some event and notify you
    */
    //% weight=91 
    //% blockId=sendToIFTTT blockGap=5
    //% expandableArgumentMode"toggle" inlineInputMode=inline
    //% block="send data to IFTTT to trig other event:| event name: %eventName| your key: %myKey || value1: %value1 value2: %value2 value3: %value3"
    export function sendToIFTTT(eventName:string, myKey: string, value1?:number, value2?:number, value3?:number): void {
        _serial_init()
        basic.showLeds(`
        . . . . .
        . . . . .
        . # # # .
        . . . . .
        . . . . .
        `)
        let returnCode=""
        let myArr:number[]=[value1,value2,value3]
        let myUrl = "http://maker.ifttt.com/trigger/"+eventName+"/with/key/" + myKey+"?"
        for(let i=0;i<myArr.length;i++)
        {
            if (myArr[i]!=null)
                myUrl+="&value"+(i+1)+"="+myArr[i]
            else
                break
        }
        serial.readString()
        WriteString("|3|1|" + myUrl + "|\r")
        for (let i = 0; i < 3; i++) {
            returnCode = serial.readUntil("|")
        }
        if (returnCode == "200")
            basic.showIcon(IconNames.Yes)
        else
            basic.showIcon(IconNames.No)
    }
}
