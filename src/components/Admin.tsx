// // Copyright 2018 Energy Web Foundation
// //
// // This file is part of the Origin Application brought to you by the Energy Web Foundation,
// // a global non-profit organization focused on accelerating blockchain technology across the energy sector, 
// // incorporated in Zug, Switzerland.
// //
// // The Origin Application is free software: you can redistribute it and/or modify
// // it under the terms of the GNU General Public License as published by
// // the Free Software Foundation, either version 3 of the License, or
// // (at your option) any later version.
// // This is distributed in the hope that it will be useful,
// // but WITHOUT ANY WARRANTY and without an implied warranty of
// // MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// // GNU General Public License for more details, at <http://www.gnu.org/licenses/>.
// //
// // @authors: slock.it GmbH, Heiko Burkhardt, heiko.burkhardt@slock.it

import * as React from 'react'
import { Nav } from 'react-bootstrap'
import * as OriginIssuer from 'ew-origin-lib-sonnen';
import * as EwAsset from 'ew-asset-registry-lib-sonnen'; 
import * as EwUser from 'ew-user-registry-lib';
import * as General from 'ew-utils-general-lib-sonnen';
import {
  NavLink,
  Redirect,
  Route
} from 'react-router-dom'

import { PageContent } from '../elements/PageContent/PageContent'
import { CreateSupply } from './CreateSupply';
import { CreateDemand } from './CreateDemand';
import { CreateAgreement } from './CreateAgreement';
import { ListDemands } from './ListDemands';
import { ListSupplies } from './ListSupplies';
import { ApproveCertificate } from './ApproveCertificate';
import { SaveSmartMeterRead } from './SaveSmartMeterRead';

export interface AdminProps {
    configuration: General.Configuration.Entity;
    certificates: OriginIssuer.Certificate.Entity[];
    producingAssets: EwAsset.ProducingAsset.Entity[];
    currentUser: EwUser.User;
    baseUrl: string;
}

export class Admin extends React.Component<AdminProps, {}> {

  constructor(props) {
    super(props);

    this.CreateSupplySection = this.CreateSupplySection.bind(this);
    this.CreateDemandSection = this.CreateDemandSection.bind(this);
    this.CreateAgreementSection = this.CreateAgreementSection.bind(this);
    this.ListDemandsSection = this.ListDemandsSection.bind(this);
    this.ListSuppliesSection = this.ListSuppliesSection.bind(this);
    this.SaveSmartMeterReadSection = this.SaveSmartMeterReadSection.bind(this);
    this.ApproveCertificateSection = this.ApproveCertificateSection.bind(this);
  }

  CreateSupplySection() {
    return <CreateSupply
        baseUrl={this.props.baseUrl}
        producingAssets={this.props.producingAssets}
        certificates={this.props.certificates}
        conf={this.props.configuration}
        currentUser={this.props.currentUser}
    />;
}

CreateDemandSection() {
    return <CreateDemand
        baseUrl={this.props.baseUrl}
        producingAssets={this.props.producingAssets}
        certificates={this.props.certificates}
        conf={this.props.configuration}
        currentUser={this.props.currentUser}
    />;
}

CreateAgreementSection() {
    return <CreateAgreement
        baseUrl={this.props.baseUrl}
        producingAssets={this.props.producingAssets}
        certificates={this.props.certificates}
        conf={this.props.configuration}
        currentUser={this.props.currentUser}
    />;
}

ListDemandsSection() {
  return <ListDemands
      baseUrl={this.props.baseUrl}
      producingAssets={this.props.producingAssets}
      certificates={this.props.certificates}
      conf={this.props.configuration}
      currentUser={this.props.currentUser}
  />;
}

ListSuppliesSection() {
  return <ListSupplies
      baseUrl={this.props.baseUrl}
      producingAssets={this.props.producingAssets}
      certificates={this.props.certificates}
      conf={this.props.configuration}
      currentUser={this.props.currentUser}
  />;
}

SaveSmartMeterReadSection() {
  return <SaveSmartMeterRead
      baseUrl={this.props.baseUrl}
      producingAssets={this.props.producingAssets}
      certificates={this.props.certificates}
      conf={this.props.configuration}
      currentUser={this.props.currentUser}
  />;
}

ApproveCertificateSection() {
  return <ApproveCertificate
      baseUrl={this.props.baseUrl}
      producingAssets={this.props.producingAssets}
      certificates={this.props.certificates}
      conf={this.props.configuration}
      currentUser={this.props.currentUser}
  />;
}

  render() {
    const AdminMenu = [
      {
        key: 'create-supply',
        label: 'Create Supply',
        component: this.CreateSupplySection
      },
      {
        key: 'create-demand',
        label: 'Create Demand',
        component: this.CreateDemandSection
      },
      {
        key: 'create-agreement',
        label: 'Activate flexibility',
        component: this.CreateAgreementSection
      },
      {
        key: 'demands',
        label: 'Demands',
        component: this.ListDemandsSection
      },
      {
        key: 'supplies',
        label: 'Supplies',
        component: this.ListSuppliesSection
      },
      // {
      //   key: 'save-smart-meter-read',
      //   label: 'Save SMeter Read',
      //   component: this.SaveSmartMeterReadSection
      // },
      {
        key: 'approve-certificate',
        label: 'Approve reported data',
        component: this.ApproveCertificateSection
      }
    ]

    const { match } = this.props as any
    const baseUrl = this.props.baseUrl
    return (
      <div className='PageWrapper'>
        <div className='PageNav'>
          <Nav className='NavMenu'>
            {

              AdminMenu.map(menu => {
                return (<li><NavLink exact to={`/${baseUrl}/admin/${menu.key}`} activeClassName='active'>{menu.label}</NavLink></li>)
              })
            }
          </Nav>
        </div>

        <Route path={`/${baseUrl}/admin/:key`} render={props => {
          const key = props.match.params.key
          const matches = AdminMenu.filter(item => {
            return item.key === key
          })
          return (<PageContent menu={matches.length > 0 ? matches[0] : null} redirectPath={`${baseUrl}/admin`} />)
        }} />
        <Route exact path={`/${baseUrl}/admin`} render={props => (<Redirect to={{ pathname: `/${baseUrl}/admin/${AdminMenu[0].key}` }} />)} />

      </div>
    )
  }
}
