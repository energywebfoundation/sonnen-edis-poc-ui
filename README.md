## To run the pilot you will need:

* [Backend pilot repository](https://github.com/energywebfoundation/sonnen-edis-poc-lib) 
* Frontend pilot repository (this repository)
* [Npm](https://www.npmjs.com) installed
* [MetaMask](https://metamask.io) installed

## Run the UI

1. Open `sonnen-edis-poc-ui` folder in your terminal
2. Run `npm start`

## Open UI in the browser

1. Navigate to `sonnen-edis-poc-lib/config/contractConfig.json`
2. Copy the address under the key `OriginContractLookup`
3. In the browser open http://localhost:3000/OriginContractLookup (where `OriginContractLookup` is substituted with an address (e.g. http://localhost:3000/0xE377ae7241f76aC5Cdb89f5DEbc0dBE82f9c2C03))
4. Change MetaMask's network from "Main Ethereum Network" to "Localhost 8545"
