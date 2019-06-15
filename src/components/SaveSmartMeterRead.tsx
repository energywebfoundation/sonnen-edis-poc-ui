import * as React from 'react';
import * as OriginIssuer from 'ew-origin-lib-sonnen';
import * as EwAsset from 'ew-asset-registry-lib-sonnen'; 
import * as EwUser from 'ew-user-registry-lib';
import * as General from 'ew-utils-general-lib-sonnen';
import Datepicker from 'react-datetime';
import { SonnenProducingAssetLogic } from 'ew-asset-registry-contracts-sonnen';

import './CreateSupply.scss'
import { Moment } from 'moment';

interface Props {
    conf: General.Configuration.Entity;
    certificates: OriginIssuer.Certificate.Entity[];
    producingAssets: EwAsset.ProducingAsset.Entity[];
    currentUser: EwUser.User;
    baseUrl: string;
}

interface State {
    assetId: number;
    newMeterRead: number,
    lastSmartMeterReadFileHash: string,
    timeFrameStartTimestamp: number;
    timeFrameEndTimestamp: number;
    averagePower: number;
    powerProfileURL: string;
}

export class SaveSmartMeterRead extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            assetId: -1,
            newMeterRead: 0,
            lastSmartMeterReadFileHash: '',
            timeFrameStartTimestamp: 0,
            timeFrameEndTimestamp: 0,
            averagePower: 0,
            powerProfileURL: ''
        };
    }

    async createSupply(
        assetId: number,
        newMeterRead: number,
        lastSmartMeterReadFileHash: string,
        timeFrameStartTimestamp: number,
        timeFrameEndTimestamp: number,
        averagePower: number,
        powerProfileURL: string
    ) {
        this.props.conf.blockchainProperties.activeUser = {
            address: this.props.currentUser.id
        };

        const assetRegistry = new SonnenProducingAssetLogic(
            this.props.conf.blockchainProperties.web3,
            this.props.conf.blockchainProperties.producingAssetLogicInstance.web3Contract._address
        );

        await assetRegistry.saveSonnenSmartMeterRead(
            assetId,
            newMeterRead,
            lastSmartMeterReadFileHash,
            timeFrameStartTimestamp,
            timeFrameEndTimestamp,
            averagePower,
            powerProfileURL,
            {
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
            newMeterRead,
            lastSmartMeterReadFileHash,
            timeFrameStartTimestamp,
            timeFrameEndTimestamp,
            averagePower,
            powerProfileURL
        } = this.state;

        return <div className='PageWrapper CreateSupply_wrapper'>
            <input className="CreateSupply_input" onChange={(e) => this.setState({ assetId: parseInt(e.target.value, 10) })} placeholder="Asset ID (0, 1, 2... etc.)"/>
            <br/><br/>
            <input className="CreateSupply_input" onChange={(e) => this.setState({ newMeterRead: parseInt(e.target.value, 10) })} placeholder="New meter read in Wh (eg. 500)"/>
            <br/><br/>
            <input className="CreateSupply_input" onChange={(e) => this.setState({ lastSmartMeterReadFileHash: e.target.value ? e.target.value.trim() : e.target.value })} placeholder="lastSmartMeterReadFileHash (optional) "/>
            <br/><br/>
            <b>Timeframe start</b>
            <br/><br/>
            <Datepicker onChange={this.onTimeChange('timeFrameStartTimestamp')} />
            <br/>
            <b>Timeframe end</b>
            <br/><br/>
            <Datepicker onChange={this.onTimeChange('timeFrameEndTimestamp')} />
            <br/><br/>
            <input className="CreateSupply_input" onChange={(e) => this.setState({ averagePower: parseInt(e.target.value, 10) * 1000 })} placeholder="Average Power in kW"/>            
            <br/><br/>
            <input className="CreateSupply_input" onChange={(e) => this.setState({ powerProfileURL: e.target.value ? e.target.value.trim() : e.target.value })} placeholder="powerProfileURL (optional) "/>
            <br/><br/>
            <button onClick={() => this.createSupply(
                assetId,
                newMeterRead,
                lastSmartMeterReadFileHash,
                timeFrameStartTimestamp,
                timeFrameEndTimestamp,
                averagePower,
                powerProfileURL
            )} className="CreateSupply_button">Save Smart Meter Read</button>
        </div>;

    }

}