import * as React from 'react';
import * as OriginIssuer from 'ew-origin-lib-sonnen';
import * as EwAsset from 'ew-asset-registry-lib-sonnen'; 
import * as EwUser from 'ew-user-registry-lib';
import * as General from 'ew-utils-general-lib-sonnen';

import { MarketLogic } from 'ew-market-contracts-sonnen';

import './CreateSupply.scss'

export interface CreateAgreementProps {
    conf: General.Configuration.Entity;
    certificates: OriginIssuer.Certificate.Entity[];
    producingAssets: EwAsset.ProducingAsset.Entity[];
    currentUser: EwUser.User;
    baseUrl: string;
}

export interface CreateAgreementState {
    demandId: number,
    supplyId: number
}

export class CreateAgreement extends React.Component<CreateAgreementProps, CreateAgreementState> {

    constructor(props: CreateAgreementProps) {
        super(props);

        this.state = {
            demandId: -1,
            supplyId: -1
        };
    }

    async createAgreement(
            demandId: number,
            supplyId: number
        ) {
        this.props.conf.blockchainProperties.activeUser = {
            address: this.props.currentUser.id
        };

        const marketLogic = new MarketLogic(
            this.props.conf.blockchainProperties.web3,
            this.props.conf.blockchainProperties.marketLogicInstance.web3Contract._address
        );

        await marketLogic.createAgreement(demandId, supplyId, {
            from: this.props.currentUser.id,
            privateKey: ''
        });
    }

    render() {
        const {
            demandId,
            supplyId
        } = this.state;

        return <div className='PageWrapper CreateSupply_wrapper'>
            <input className="CreateSupply_input" onChange={(e) => this.setState({ demandId: parseInt(e.target.value, 10) })} placeholder="Demand ID (eg. 0, 1, 2... etc.)"/>
            <br/><br/>
            <input className="CreateSupply_input" onChange={(e) => this.setState({ supplyId: parseInt(e.target.value, 10) })} placeholder="Supply ID (eg. 0, 1, 2... etc.)"/>            
            <br/><br/>

            <button onClick={() => this.createAgreement(
                demandId,
                supplyId
            )} className="CreateSupply_button">Create Agreement</button>
        </div>

    }

}