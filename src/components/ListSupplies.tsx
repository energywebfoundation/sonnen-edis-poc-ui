import * as React from 'react';
import * as OriginIssuer from 'ew-origin-lib-sonnen';
import * as EwAsset from 'ew-asset-registry-lib-sonnen'; 
import * as EwUser from 'ew-user-registry-lib';
import * as General from 'ew-utils-general-lib-sonnen';
import { OrganizationFilter } from './OrganizationFilter'
import { Table } from '../elements/Table/Table'
import TableUtils from '../elements/utils/TableUtils'
import FadeIn from 'react-fade-in'
import {
    NavLink,
    withRouter
} from 'react-router-dom'
import { MarketLogic } from 'ew-market-contracts-sonnen';

import './CreateSupply.scss'
import moment = require('moment');

interface Props {
    conf: General.Configuration.Entity;
    certificates: OriginIssuer.Certificate.Entity[];
    producingAssets: EwAsset.ProducingAsset.Entity[];
    currentUser: EwUser.User;
    baseUrl: string;
}

interface State {
    supplies: any[]
}

export class ListSupplies extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            supplies: []
        };
    }

    getMarketLogic() {
        return new MarketLogic(
          this.props.conf.blockchainProperties.web3,
          this.props.conf.blockchainProperties.marketLogicInstance.web3Contract._address
        );
      }
    
    async getSupplies() {
        const supplies = [];
        const marketLogic = this.getMarketLogic();
        const listLength = await marketLogic.getAllSupplyListLength();

        for (let i = 0; i < listLength; i++) {
            supplies.push(await marketLogic.getSupply(i));
        }

        console.log({
            demands: supplies
        })

        return supplies;
    }

    async componentDidMount() {
        this.setState({
            supplies: await this.getSupplies()
        })
    }

    render() {
        const {
            
        } = this.state;

        let total = null
        let totalDemand = 0

        const defaultWidth = 106
        const getKey = TableUtils.getKey
        const generateHeader = (label, width = defaultWidth, right = false, body = false) => (TableUtils.generateHeader(label, width, right, body))
        const generateFooter = TableUtils.generateFooter



        const TableFooter = [
            {
                label: 'Total',
                key: 'total',
                colspan: 7,
            },
            generateFooter('Power in kW', true)
        ]

        const data = this.state.supplies.map((supply, id) => {
            return [
                id,
                supply._assetId,
                supply._regionId,
                moment(supply._dateTimeFrom, 'x').format("DD MMM YYYY HH:mm"),
                moment(supply._dateTimeTo, 'x').format("DD MMM YYYY HH:mm"),
                supply._price,
                supply._matchedPower / 1000,
                supply._power / 1000
            ];
        });

        const TableHeader = [
            generateHeader('Supply ID'),
            generateHeader('Asset ID'),
            generateHeader('Region ID'),
            generateHeader('Timeframe Start Time'),
            generateHeader('Timeframe End Time'),
            generateHeader('Price in cents'),
            generateHeader('Matched Power in kW'),
            generateHeader('Power in kW', defaultWidth, true, true)
        ]

        return <div className='ForSaleWrapper'>
            <Table classNames={['bare-font', 'bare-padding']} header={TableHeader} footer={TableFooter} actions={false} data={data} />
        </div>
    }

}