import * as React from 'react';
import * as OriginIssuer from 'ew-origin-lib-sonnen';
import * as EwAsset from 'ew-asset-registry-lib-sonnen'; 
import * as EwUser from 'ew-user-registry-lib';
import * as General from 'ew-utils-general-lib-sonnen';
import Datepicker from 'react-datetime';
import { MarketLogic } from 'ew-market-contracts-sonnen';

import './CreateSupply.scss'
import { Moment } from 'moment';

export interface CreateDemandProps {
    conf: General.Configuration.Entity;
    certificates: OriginIssuer.Certificate.Entity[];
    producingAssets: EwAsset.ProducingAsset.Entity[];
    currentUser: EwUser.User;
    baseUrl: string;
}

export interface CreateDemandState {
    regionId: string;
    timeFrameStartTimestamp: number;
    timeFrameEndTimestamp: number;
    powerInWh: number;
}

export class CreateDemand extends React.Component<CreateDemandProps, CreateDemandState> {

    constructor(props: CreateDemandProps) {
        super(props);

        this.state = {
            regionId: '',
            timeFrameStartTimestamp: 0,
            timeFrameEndTimestamp: 0,
            powerInWh: 0
        };

        this.onTimeChange = this.onTimeChange.bind(this);
    }

    async createDemand(
            regionId: string,
            timeFrameStartTimestamp: number,
            timeFrameEndTimestamp: number,
            powerInWh: number,
        ) {
        this.props.conf.blockchainProperties.activeUser = {
            address: this.props.currentUser.id
        };

        const marketLogic = new MarketLogic(
            this.props.conf.blockchainProperties.web3,
            this.props.conf.blockchainProperties.marketLogicInstance.web3Contract._address
        );

        await marketLogic.createDemand(regionId, timeFrameStartTimestamp, timeFrameEndTimestamp, powerInWh, {
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
            regionId,
            timeFrameStartTimestamp,
            timeFrameEndTimestamp,
            powerInWh
        } = this.state;

        return <div className='PageWrapper CreateSupply_wrapper'>
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
            <button onClick={() => this.createDemand(
                regionId,
                timeFrameStartTimestamp,
                timeFrameEndTimestamp,
                powerInWh
            )} className="CreateSupply_button">Create Demand</button>
        </div>

    }

}