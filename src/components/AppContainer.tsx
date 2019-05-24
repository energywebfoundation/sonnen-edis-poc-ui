// Copyright 2018 Energy Web Foundation
//
// This file is part of the Origin Application brought to you by the Energy Web Foundation,
// a global non-profit organization focused on accelerating blockchain technology across the energy sector, 
// incorporated in Zug, Switzerland.
//
// The Origin Application is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY and without an implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details, at <http://www.gnu.org/licenses/>.
//
// @authors: slock.it GmbH, Heiko Burkhardt, heiko.burkhardt@slock.it

import * as React from 'react';

import Web3 = require('web3');

import { Certificates } from './Certificates';
import { Route, Switch } from 'react-router-dom';
// import { Demands } from './Demands';
import { StoreState, Actions } from '../types';
import { Header } from './Header';
import { Footer } from './Footer';
// import { Legal } from './Legal';
// import { About } from './About';
import { Asset } from './Asset';
// import { Admin } from './Admin';
import * as queryString from 'query-string';
import './AppContainer.scss';
import * as General from 'ew-utils-general-lib';
import * as OriginIssuer from 'ew-origin-lib-sonnen';
import * as Market from 'ew-market-lib';
import { ProducingAsset, createBlockchainProperties, ConsumingAsset } from "ew-asset-registry-lib-sonnen";
import * as EwUser from 'ew-user-registry-lib';

interface AppContainerProps extends StoreState {
    actions: Actions;
}

const API_BASE_URL = 'http://localhost:3030';

export class AppContainer extends React.Component<AppContainerProps, {}> {

    constructor(props: AppContainerProps) {
        super(props);

        this.CertificateTable = this.CertificateTable.bind(this);
        // this.DemandTable = this.DemandTable.bind(this);
        // this.Admin = this.Admin.bind(this);
        this.Asset = this.Asset.bind(this);
    }

    async initEventHandler(conf: General.Configuration.Entity): Promise<void> {
        const currentBlockNumber: number = await conf.blockchainProperties.web3.eth.getBlockNumber();
        const certificateContractEventHandler: General.ContractEventHandler = new General.ContractEventHandler(
            conf.blockchainProperties.certificateLogicInstance,
            currentBlockNumber
        );

        certificateContractEventHandler.onEvent('LogRetireRequest', async (event: any) =>
            this.props.actions.certificateCreatedOrUpdated(
                await (new OriginIssuer.Certificate.Entity(
                    event.returnValues._certificateId,
                    this.props.configuration).sync()
                )
            )

        );

        certificateContractEventHandler.onEvent('LogCreatedCertificate', async (event: any) =>
            this.props.actions.certificateCreatedOrUpdated(
                await (new OriginIssuer.Certificate.Entity(
                    event.returnValues._certificateId,
                    this.props.configuration).sync()
                )
            )
        );

        certificateContractEventHandler.onEvent('LogCertificateOwnerChanged', async (event: any) =>
            this.props.actions.certificateCreatedOrUpdated(
                await (new OriginIssuer.Certificate.Entity(
                    event.returnValues._certificateId,
                    this.props.configuration).sync()
                )
            )
        );

        const demandContractEventHandler: General.ContractEventHandler = new General.ContractEventHandler(
            conf.blockchainProperties.marketLogicInstance,
            currentBlockNumber
        );

        // demandContractEventHandler.onEvent('LogMatcherPropertiesUpdate', async (event) => {
        //     createOrUpdateDemand(event.returnValues._id)
        // })

        demandContractEventHandler.onEvent('LogDemandFullyCreated', async (event: any) =>
            this.props.actions.demandCreatedOrUpdated(
                await (new Market.Demand.Entity(
                    event.returnValues._demandId,
                    this.props.configuration).sync()
                )
            )
        );

        // demandContractEventHandler.onEvent('LogDemandExpired', async (event: any) => {
        //     createOrUpdateDemand(event.returnValues._index)
        // })

        const assetContractEventHandler: General.ContractEventHandler = new General.ContractEventHandler(
            conf.blockchainProperties.producingAssetLogicInstance,
            currentBlockNumber
        );

        assetContractEventHandler.onEvent('LogNewMeterRead', async (event: any) =>
            this.props.actions.producingAssetCreatedOrUpdated(
                await (new ProducingAsset.Entity(
                    event.returnValues._assetId,
                    this.props.configuration
                ).sync())
            )

        );

        assetContractEventHandler.onEvent('LogAssetFullyInitialized', async (event: any) =>
            this.props.actions.producingAssetCreatedOrUpdated(
                await (new ProducingAsset.Entity(
                    event.returnValues._assetId,
                    this.props.configuration
                ).sync())
            )
        );

        assetContractEventHandler.onEvent('LogAssetSetActive', async (event: any) =>
            this.props.actions.producingAssetCreatedOrUpdated(
                await (new ProducingAsset.Entity(
                    event.returnValues._assetId,
                    this.props.configuration
                ).sync())
            )
        );

        assetContractEventHandler.onEvent('LogAssetSetInactive', async (event: any) =>
            this.props.actions.producingAssetCreatedOrUpdated(
                await (new ProducingAsset.Entity(
                    event.returnValues._assetId,
                    this.props.configuration
                ).sync())
            )
        );

        const eventHandlerManager: General.EventHandlerManager = new General.EventHandlerManager(4000, conf);
        eventHandlerManager.registerEventHandler(certificateContractEventHandler);
        eventHandlerManager.registerEventHandler(demandContractEventHandler);
        eventHandlerManager.registerEventHandler(assetContractEventHandler);
        eventHandlerManager.start();
    }

    async initConf(originIssuerContractLookupAddress: string): Promise<General.Configuration.Entity> {
        let web3: any = null;
        const params: any = queryString.parse((this.props as any).location.search);

        if (params.rpc) {
            web3 = new Web3(params.rpc);
        } else if ((window as any).ethereum) {
            web3 = new Web3((window as any).ethereum);
            try {
                // Request account access if needed
                await (window as any).ethereum.enable();
            } catch (error) {
                // User denied account access...
            }
        } else if ((window as any).web3) {
            web3 = new Web3(web3.currentProvider);
        }

        const blockchainProperties: General.Configuration.BlockchainProperties = await OriginIssuer
            .createBlockchainProperties(null, web3, originIssuerContractLookupAddress);

        blockchainProperties.producingAssetLogicInstance = await this.getProducingAssetLogicInstance(originIssuerContractLookupAddress, web3)

        console.log(blockchainProperties);

        return {
            blockchainProperties,
            offChainDataSource: {
                baseUrl: API_BASE_URL
            },

            logger: null
        };

    }

    async getProducingAssetLogicInstance(originIssuerContractLookupAddress : string, web3 : Web3) {
        const response = await fetch(`${API_BASE_URL}/OriginContractLookupAssetLookupMapping/${originIssuerContractLookupAddress.toLowerCase()}`)
              
        const json = await response.json();

        const assetBlockchainProperties: General.Configuration.BlockchainProperties = await createBlockchainProperties(null, web3, json.assetContractLookup) as any;

        return assetBlockchainProperties.producingAssetLogicInstance;
    }

    async componentDidMount(): Promise<void> {

        const conf: General.Configuration.Entity = await this.initConf((this.props as any).match.params.contractAddress);
        this.props.actions.configurationUpdated(conf);
        const accounts: string[] = await conf.blockchainProperties.web3.eth.getAccounts();

        const currentUser: EwUser.User = accounts.length > 0 ?
            await (new EwUser.User(accounts[0], conf as any)).sync() :
            null;

        (await ProducingAsset.getAllAssets(conf))
            .forEach((p: ProducingAsset.Entity) =>
                this.props.actions.producingAssetCreatedOrUpdated(p)
            );

        (await ConsumingAsset.getAllAssets(conf))
            .forEach((c: ConsumingAsset.Entity) =>
                this.props.actions.consumingAssetCreatedOrUpdated(c)
            );

        // (await Demand.GET_ALL_ACTIVE_DEMANDS(conf.blockchainProperties)).forEach((d: Demand) =>
        //     this.props.actions.demandCreatedOrUpdated(d)
        // );

        (await OriginIssuer.Certificate.getAllCertificates(conf))
            .forEach((certificate: OriginIssuer.Certificate.Entity) =>
                this.props.actions.certificateCreatedOrUpdated(certificate)
            );

        this.props.actions.currentUserUpdated(currentUser !== null && currentUser.active ? currentUser : null);

        // this.initEventHandler(conf);

    }

    Asset() {
        return <Asset
            certificates={this.props.certificates}
            producingAssets={this.props.producingAssets}
            demands={this.props.demands}
            consumingAssets={this.props.consumingAssets}
            conf={this.props.configuration}
            currentUser={this.props.currentUser}
            baseUrl={(this.props as any).match.params.contractAddress}
        />;
    }

    CertificateTable() {
        return <Certificates
            baseUrl={(this.props as any).match.params.contractAddress}
            producingAssets={this.props.producingAssets}
            certificates={this.props.certificates}
            conf={this.props.configuration}
            currentUser={this.props.currentUser}
        />;
    }

    // DemandTable() {
    //     return <Demands
    //         conf={this.props.conf}
    //         demands={this.props.demands}
    //         consumingAssets={this.props.consumingAssets}
    //         producingAssets={this.props.producingAssets}
    //         currentUser={this.props.currentUser}
    //         baseUrl={(this.props as any).match.params.contractAddress}
    //     />;
    // }

    // Admin() {
    //     return <Admin
    //         conf={this.props.conf}
    //         currentUser={this.props.currentUser}
    //         baseUrl={(this.props as any).match.params.contractAddress}
    //     />;
    // }

    render(): JSX.Element {

        if (this.props.configuration == null) {
            return <div><p>loading...</p></div>;
        }

        return <div className={`AppWrapper ${false ? 'Profile--open' : ''}`}>
            <Header currentUser={this.props.currentUser} baseUrl={(this.props as any).match.params.contractAddress} />
            <Switch>

                <Route path={'/' + (this.props as any).match.params.contractAddress + '/assets/'} component={this.Asset} />
                <Route path={'/' + (this.props as any).match.params.contractAddress + '/certificates'} component={this.CertificateTable} />
                {/* <Route path={'/' + (this.props as any).match.params.contractAddress + '/admin/'} component={this.Admin} />
                
                <Route path={'/' + (this.props as any).match.params.contractAddress + '/demands'} component={this.DemandTable} />
          
                <Route path={'/' + (this.props as any).match.params.contractAddress + '/legal'} component={Legal} />
                <Route path={'/' + (this.props as any).match.params.contractAddress + '/about'} component={About} /> */}
                <Route path={'/' + (this.props as any).match.params.contractAddress} component={this.Asset} />

            </Switch>
            {/* <Footer cooContractAddress={(this.props as any).match.params.contractAddress} /> */}
        </div>;

    }

}