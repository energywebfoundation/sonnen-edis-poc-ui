import * as React from 'react';
import * as OriginIssuer from 'ew-origin-lib-sonnen';
import * as EwAsset from 'ew-asset-registry-lib-sonnen'; 
import * as EwUser from 'ew-user-registry-lib';
import * as General from 'ew-utils-general-lib-sonnen';
import mqtt from 'mqtt';
import { MarketLogic } from 'ew-market-contracts-sonnen';

import './CreateSupply.scss'
import moment = require('moment');
import { MQTT_HOST, MQTT_USERNAME, MQTT_PASSWORD } from './config';

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
            if (
                typeof(demandId) === 'undefined' ||
                typeof(supplyId) === 'undefined' ||
                demandId === -1 ||
                supplyId === -1
            ) {
                return;
            }

        this.props.conf.blockchainProperties.activeUser = {
            address: this.props.currentUser.id
        };

        const marketLogic = new MarketLogic(
            this.props.conf.blockchainProperties.web3,
            this.props.conf.blockchainProperties.marketLogicInstance.web3Contract._address
        );

        const demand = await marketLogic.getDemand(demandId);
        const supply = await marketLogic.getSupply(supplyId);

        console.log('createAgreement', {
            demand,
            supply
        });

        await marketLogic.createAgreement(demandId, supplyId, {
            from: this.props.currentUser.id,
            privateKey: ''
        });

        try {
            this.postToMQTT(
                parseInt(supply._assetId),
                moment(demand._dataTimeFrom, 'x').toISOString(),
                moment(demand._dateTimeTo, 'x').toISOString()
            );
        } catch (error) {  
            console.error('Error while posting to MQTT', error);
        }
    }

    postToMQTT(
        assetId: number,
        from: string,
        to: string
    ) {
        const clientId = 'mqttjs_' + Math.random().toString(16).substr(2, 8)

        const options = {
            keepalive: 10,
            clientId,
            protocolId: 'MQTT',
            protocolVersion: 4,
            clean: true,
            reconnectPeriod: 1000,
            connectTimeout: 30 * 1000,
            username: MQTT_USERNAME,
            password: MQTT_PASSWORD,
            rejectUnauthorized: false
        }

        const client = mqtt.connect(MQTT_HOST, options as any);

        client.on('error', function (err) {
            console.log(err)
            client.end()
        })

        client.on('connect', function () {
            console.log('client connected:' + clientId)
        })

        client.publish('demo', JSON.stringify({
            gridx_operator_id: 123,
            asset_id: assetId,
            timestamp_from: from,
            timestamp_to: to
        }), { qos: 0, retain: false })

        client.on('message', function (topic, message, packet) {
            console.log('Received Message:= ' + message.toString() + '\nOn topic:= ' + topic)
        })

        client.on('close', function () {
            console.log(clientId + ' disconnected')
        })
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