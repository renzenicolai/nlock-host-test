"use strict";

const fs = require('fs');
const { NFC, CONNECT_MODE_DIRECT } = require("@aapeli/nfc-pcsc");
const { DesfireCard, DesfireKeySettings } = require("@nicolaielectronics/desfire.js");
const Atr = require("./parseAtr.js");

const nfc = new NFC();

async function testDesfireCard(desfire) {
    try {
        // This block of code functions as a test for some of the library functions

        console.log("Select PICC application");
        await desfire.selectApplication(0x000000); // Select PICC

        console.log("Authenticate to PICC application with default DES key");
        await desfire.authenticateLegacy(0x00, desfire.default_des_key); // Authenticate using default key
        
        let newAesMasterKey = Buffer.from([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);

        /*console.log("Change AES key for PICC application");
        await desfire.changeKeyAes(42, 0, newAesMasterKey);

        console.log("Authenticate to PICC application with new AES key");
        await desfire.ev1AuthenticateAes(0, newAesMasterKey);*/

        console.log("Get card version");
        let version = await desfire.getVersion();
        version.print();

        console.log("DES Get card UID");
        let uid = await desfire.ev1GetCardUid();
        console.log("Card UID: ", uid);

        console.log("Format card");
        await desfire.formatPicc();

        console.log("Create application");
        await desfire.createApplication(1234, desfire.constants.keySettings.factoryDefault, 2, desfire.constants.keyType.AES);
        //desfire.createApplication(5678, desfire.constants.keySettings.factoryDefault, 2, desfire.constants.keyType.DES);

        console.log("Read list of applications");
        let applications = await desfire.getApplicationIdentifiers();
        console.log("Applications: ", applications);

        console.log("Select 1234 application");
        await desfire.selectApplication(1234); 

        console.log("Authenticate to 1234 application with default AES key");
        await desfire.ev1AuthenticateAes(0, desfire.default_aes_key);

        console.log("AES Get card UID");
        uid = await desfire.ev1GetCardUid();
        console.log("Card UID: ", uid);

        console.log("AES Get card UID");
        uid = await desfire.ev1GetCardUid();
        console.log("Card UID: ", uid);

        console.log("AES Get card UID");
        uid = await desfire.ev1GetCardUid();
        console.log("Card UID: ", uid);

        console.log("Get key settings");
        console.log(await desfire.getKeySettings());

        /*console.log("Change key settings");
        let settings = new DesfireKeySettings();
        settings.allowCreateDeleteWithoutMk = false;
        console.log(await desfire.changeKeySettings(settings));

        console.log("Get key settings");
        console.log(await desfire.getKeySettings());*/

        console.log("Get key version (default key)");
        let keyVersion = await desfire.getKeyVersion(0);
        console.log("Key version:", keyVersion);

        let newAesKey = Buffer.from([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);

        console.log("Change AES key for 1234 application");
        await desfire.changeKeyAes(42, 0, newAesKey);

        console.log("Authenticate to 1234 application with new AES key");
        await desfire.ev1AuthenticateAes(0, newAesKey);

        console.log("Get key version (new AES key)");
        keyVersion = await desfire.getKeyVersion(0);
        console.log("Key version:", keyVersion);

        console.log("Get card UID");
        uid = await desfire.ev1GetCardUid();
        console.log("Card UID: ", uid);

        console.log("Setting new AES key for 1234 application key 1");
        let otherNewAesKey = Buffer.from([16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]);
        await desfire.changeKeyAes(42, 1, otherNewAesKey, desfire.default_aes_key);

        console.log("Get card UID");
        uid = await desfire.ev1GetCardUid();
        console.log("Card UID: ", uid);

        console.log("Get card UID");
        uid = await desfire.ev1GetCardUid();
        console.log("Card UID: ", uid);

        console.log("Create file (plain)");
        await desfire.createStandardDataFile(0, false, false, 0, 0, 0, 0, 16);

        console.log("Write data to file (cmac)");
        await desfire.writeDataCmac(0, Buffer.from("Hello world", "utf-8"), 0);

        console.log("Read data from file (cmac)");
        let fileContents = await desfire.readDataCmac(0, 0, 16);
        console.log("File contents:", fileContents.toString("utf-8"));

        console.log("Create file (encrypted)");
        await desfire.createStandardDataFile(1, false, true, 0, 0, 0, 0, 16);

        console.log("Write data to file (encrypted)");
        await desfire.writeDataEncrypted(1, Buffer.from("Hello encrypted", "utf-8"), 0);

        console.log("Read data from file (encrypted)");
        fileContents = await desfire.readDataEncrypted(1, 0, 16);
        console.log("File contents:", fileContents.toString("utf-8"));

        console.log("Get file identifiers");
        let files = await desfire.getFileIdentifiers();
        console.log("Files: ", files);

        console.log("Get card UID");
        uid = await desfire.ev1GetCardUid();
        console.log("Card UID: ", uid);
        
        /*console.log("Select 5678 application");
        await desfire.selectApplication(5678); 

        console.log("Authenticate to 5678 application with default DES key");
        await desfire.authenticateLegacy(0x00, desfire.default_des_key);
        
        console.log("Setting new DES key for 5678 application");
        let newDesKey = Buffer.from([0,0,0,0,0,0,0,0]);
        await desfire.changeKeyDes(42, 0, newDesKey);

        console.log("Authenticate to 5678 application with new DES key");
        await desfire.ev1AuthenticateAes(0, newDesKey);

        console.log("Get key version (new DES key)");
        keyVersion = await desfire.getKeyVersion(0);
        console.log("Key version:", keyVersion);

        console.log("Get card UID");
        uid = await desfire.ev1GetCardUid();
        console.log("Card UID: ", uid);

        console.log("Setting new AES key for 5678 application key 1");
        let otherNewDesKey = Buffer.from([16,18,20,22,24,26,28,30]);
        await desfire.changeKeyDes(42, 1, otherNewDesKey, desfire.default_des_key);
        
        console.log("Get key version (new DES key 2)");
        keyVersion = await desfire.getKeyVersion(1);
        console.log("Key version:", keyVersion);*/
        
        console.log("Delete application");
        desfire.deleteApplication(1234);

        console.log("Read list of applications");
        let applications2 = await desfire.getApplicationIdentifiers();
        console.log("Applications: ", applications2);

        console.log("Get free memory");
        let freeMemory = await desfire.ev1FreeMem();
        console.log("Free memory: ", freeMemory, "bytes");
    } catch (error) {
        console.error("Desfire error", error);
    }
}

class GenericCard {
    constructor(reader, card) {
        this._reader = reader;
        this._card = card;
        this.uid = null;
    }

    // Standard smartcard commands

    async getUid() {
        const packet = Buffer.from([0xff, 0xca, 0x00, 0x00, 0x00]);
        const response = await this._reader.transmit(packet, 12);

        if (response.length < 2) {
            this.uid = null;
            throw new Error("Response soo short");
        }

        const statusCode = response.slice(-2).readUInt16BE(0);

        if (statusCode !== 0x9000) {
            this.uid = null;
            throw new Error("Error response from card");
        }

        this.uid = response.slice(0, -2).toString('hex');
        return this.uid;
    }
    
    // Android app commmands
    async testApp(aid) {
      const packet = Buffer.from([
          0x00, // Class
          0xa4, // INS
          0x04, // P1
          0x00, // P2
          aid.length, // Lc
          ...aid, // AID
          0x00, // Le
      ]);
      console.log("REQUEST", packet);
      const response = await this._reader.transmit(packet, 40);

      console.log("RESPONSE", response);
      
      if (response.length < 2) {
          throw new Error("Response soo short");
      }

      const statusCode = response.slice(-2).readUInt16BE(0);

      if (statusCode !== 0x9000) {
          throw new Error("Error response from card: 0x" + statusCode.toString(16));
      }

      let result = response.slice(0, -2).toString('hex');
      console.log("Result from card:", result);
    }
    
    wrap(cmd, dataIn) {
        if (dataIn.length > 0) {
            return Buffer.from([0x90, cmd, 0x00, 0x00, dataIn.length, ...dataIn, 0x00]);
        } else {
            return Buffer.from([0x90, cmd, 0x00, 0x00, 0x00]);
        }
    }

    async communicateApp(cmd = 0x00, data = Buffer.from([])) {
      const packet = Buffer.from([
          0x00, // Class
          cmd, // INS
          0x00, // P1
          0x00, // P2
          data.length, // Lc
          ...data,
          0x00, // Le
      ]);
      
      console.log("REQUEST", packet, packet.length);
      const response = await this._reader.transmit(packet, 40);
      console.log("RESPONSE", response, response.length);
      
      if (response.length < 2) {
          throw new Error("Response soo short");
      }

      const statusCode = response.slice(-2).readUInt16BE(0);

      if (statusCode !== 0x9000) {
          throw new Error("Error response from card: 0x" + statusCode.toString(16));
      }

      let result = response.slice(0, -2);
      return result;
    }
}

class NfcReader {
    constructor(reader, onEnd) {
        this.androidAtr    = Buffer.from([0x3b, 0x80, 0x80, 0x01, 0x01]);
        this.tlvAtr        = Buffer.from([0x3b, 0x8d, 0x80, 0x01, 0x80]);
        this._reader = reader;
        this._onEnd = onEnd;
        this._reader.autoProcessing = false;
        this._reader.on("end", () => {
            if (typeof this._onEnd === "function") {
                this._onEnd(this, reader.name);
            }
        });
        this._reader.on("card", this._onCard.bind(this));
        this._reader.on("card.off", this._onCardRemoved.bind(this));
        this._reader.on("error", (err) => {
            if (err.message.startsWith("Not found response. Tag not compatible with AID")) {
                console.log(this._reader.name + ": Card is not compatible with this application.");
            } else {
                console.error(this._reader.name + " error:", err);
            }
        });
        
        this.card = null;
        this.cardPresent = false;
    };

    async _onCard(card) {
      let atr = new Atr(card.atr);
      if (atr.isDesfire()) {
        this.card = new DesfireCard(this._reader, card);
        await this.card.getUid();
        console.log(this._reader.name + ": Desfire card " + this.card.uid + " attached");
      } else {
        this.card = new GenericCard(this._reader, card);
        try {
            await this.card.getUid();
            console.log(this._reader.name + ": Other card " + this.card.uid + "attached");
        } catch (exception) {
            console.log(this._reader.name + ": Other card without UID attached");
        }
        
        // To-do: check ATR to find out if it's an Android device or something else
        
        try {
          let aid = Buffer.from("42000000000001", 'hex'); // NLock Android app
          await this.card.testApp(aid);
        } catch (error) {
          console.log("Failed to select Android app", error);
          return;
        }
        
        try {
          var response = await this.card.communicateApp(0x86, Buffer.from("helloWorld"));
          console.log("Auth 1 response", response.toString("ascii"));
        } catch (error) {
          console.log("Failed to communicate (auth 1)", error);
          return;
        }
        
        try {
          var response = await this.card.communicateApp(0x87, Buffer.from("putChallengeHere"));
          console.log("Auth 2 response", response.toString("ascii"));
        } catch (error) {
          console.log("Failed to communicate (auth 2)", error);
          return;
        }
      }
    }
    
    async _onCardRemoved(card) {
        this.card = null;
        this.cardPresent = false;
        console.log(this._reader.name + ": card removed");
    }
}

let readers = {};

function onReaderEnd(nfcReader, name) {
    console.log("Reader removed:", name);
    delete readers[name];
}

nfc.on("reader", async reader => {
    if (reader.name in readers) {
        console.error("Error: reader attached but already registered", reader.name);
    }
    readers[reader.name] = new NfcReader(reader, onReaderEnd);
    console.log("Reader attached:", reader.name);
});

nfc.on("error", err => {
    console.error("NFC error", err);
});
