import * as React from 'react';
import * as OriginIssuer from 'ew-origin-lib-sonnen';
import * as EwAsset from 'ew-asset-registry-lib-sonnen'; 
import * as EwUser from 'ew-user-registry-lib';
import * as General from 'ew-utils-general-lib-sonnen';
import Datepicker from 'react-datetime';

import { MarketLogic } from 'ew-market-contracts-sonnen';

import './CreateSupply.scss'
import { Moment } from 'moment';

export interface CreateSupplyProps {
    conf: General.Configuration.Entity;
    certificates: OriginIssuer.Certificate.Entity[];
    producingAssets: EwAsset.ProducingAsset.Entity[];
    currentUser: EwUser.User;
    baseUrl: string;
}

export interface CreateSupplyState {
    assetId: number;
    regionId: string;
    timeFrameStartTimestamp: number;
    timeFrameEndTimestamp: number;
    powerInWh: number;
    price: number;
}

export class CreateSupply extends React.Component<CreateSupplyProps, CreateSupplyState> {

    constructor(props: CreateSupplyProps) {
        super(props);

        this.state = {
            assetId: -1,
            regionId: '',
            timeFrameStartTimestamp: 0,
            timeFrameEndTimestamp: 0,
            powerInWh: 0,
            price: 0
        };
    }

    async createSupply(assetId: number, regionId: string,
            timeFrameStartTimestamp: number,
            timeFrameEndTimestamp: number,
            powerInWh: number,
            price: number
        ) {
        this.props.conf.blockchainProperties.activeUser = {
            address: this.props.currentUser.id
        };

        const marketLogic = new MarketLogic(
            this.props.conf.blockchainProperties.web3,
            this.props.conf.blockchainProperties.marketLogicInstance.web3Contract._address
        );

        await marketLogic.createSupply(assetId, regionId, timeFrameStartTimestamp, timeFrameEndTimestamp, powerInWh, price, {
            from: this.props.currentUser.id,
            privateKey: ''
        });
    }

    onTimeChange(propertyName) {
        return (momentOrString: Moment | string) => {
            if (typeof(momentOrString) === 'string') {
                return;
            }

            this.setState({
                [propertyName]: parseInt(momentOrString.format('x'), 10)
            } as any);
        };
    }

    render() {
        const {
            assetId,
            regionId,
            timeFrameStartTimestamp,
            timeFrameEndTimestamp,
            powerInWh,
            price
        } = this.state;

        return <div className='PageWrapper CreateSupply_wrapper'>
            <input className="CreateSupply_input" onChange={(e) => this.setState({ assetId: parseInt(e.target.value, 10) })} placeholder="Asset ID (0, 1, 2... etc.)"/>
            <br/><br/>
            <input className="CreateSupply_input" onChange={(e) => this.setState({ regionId: e.target.value ? e.target.value.trim() : e.target.value })} placeholder="Region ID (eg. Saxonia)"/>
            <br/><br/>
            <b>Timeframe start</b>
            <br/><br/>
            <Datepicker onChange={this.onTimeChange('timeFrameStartTimestamp')} />
            <br/>
            <b>Timeframe end</b>
            <br/><br/>
            <Datepicker onChange={this.onTimeChange('timeFrameEndTimestamp')} />
            <br/><br/>
            <input className="CreateSupply_input" onChange={(e) => this.setState({ powerInWh: parseInt(e.target.value, 10) * 1000 })} placeholder="Power in kW"/>            
            <br/><br/>
            <input className="CreateSupply_input" onChange={(e) => this.setState({ price: parseInt(e.target.value, 10) })} placeholder="Price in cents"/>            
            <br/><br/>
            <button onClick={() => this.createSupply(
                assetId,
                regionId,
                timeFrameStartTimestamp,
                timeFrameEndTimestamp,
                powerInWh,
                price
            )} className="CreateSupply_button">Create Supply</button>
        </div>;

    }

}