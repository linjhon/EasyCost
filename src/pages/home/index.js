import React from 'react'
import { StyleSheet, View, Button, Text, Image, ScrollView, TouchableOpacity } from 'react-native'
import Navigation from './Navigation'
import CostInfo from './CostInfo'
import HeaderContainer from './HeaderContainer'
import BillList from './BillList'
import DayList from './DayList'
import Indicator, { Ready, Complete } from './Indicator'
import PullTableView from './PullTableView'
import NoBill from './NoBill'
import { fetchAllBillByDay, fetchAllBillByWeek, fetchAllBillByMonth, deleteBill } from '../../realm'
import { transformDay, getFormatDay, toDate } from '../../util/Date'
import analysisIcon from '../../static/icon/analysis.png'
import settingIcon from '../../static/icon/setting.png'

console.log('+new Date()', +new Date())

export default class Home extends React.Component {
  // 禁用默认的导航栏
  static navigationOptions = () => ({
    header: null
  })

  constructor(props) {
    super(props)
    this.state = {
      day: new Date(),
      bills: [],
      budget: 0,
      monthCost: 0,
      weekCost: 0
    }
  }

  componentDidMount() {
    this.loadData()
  }

  navigateToChargeAccount = () => {
    this.props.navigation.navigate('ChargeBill', { page: 'Home', callback: () => this.loadData() })
  }
  navigateToAnalysis = () => {
    this.props.navigation.navigate('Analysis')
  }
  navigateToSetting = () => {
    this.props.navigation.navigate('Setting')
  }

  loadData = async () => {
    const bills = await fetchAllBillByDay(this.state.day)
    const weekCost = (await fetchAllBillByWeek(this.state.day)).reduce((res, bill) => res + +bill.money, 0)
    const monthCost = (await fetchAllBillByMonth(this.state.day)).reduce((res, bill) => res + +bill.money, 0)
    this.setState({ bills, weekCost, monthCost })
  }

  deleteBillById = async id => {
    await deleteBill(id)
    this.loadData()
  }

  changeCurDate = async day => {
    this.setState({ day: toDate(day) })
    this.setState({ bills: await fetchAllBillByDay(toDate(day)) })
  }

  renderNavigation = () => {
    return (
      <Navigation>
        <Image source={analysisIcon} style={{ height: 24, width: 26 }} onPress={this.navigateToAnalysis} />
        <View
          style={{ borderColor: '#FFF', borderWidth: 1, borderRadius: 30, paddingHorizontal: 12, paddingVertical: 3 }}
        >
          <Text style={{ fontSize: 16, color: '#FFF' }}>{transformDay(this.state.day)}</Text>
        </View>
        <Image source={settingIcon} style={{ height: 26, width: 26 }} onPress={this.navigateToSetting} />
      </Navigation>
    )
  }

  render() {
    const { day, bills, weekCost, monthCost, budget } = this.state
    return (
      <View style={Styles.container}>
        <HeaderContainer onRenderNavigation={this.renderNavigation}>
          <CostInfo weekCost={weekCost} monthCost={monthCost} budget={budget} />
        </HeaderContainer>
        <View style={Styles.content}>
          <TouchableOpacity style={Styles.addButton} onPress={this.navigateToChargeAccount}>
            <Text style={{ color: '#FFFFFF', fontSize: 22 }}>新记一笔</Text>
          </TouchableOpacity>
          <PullTableView
            onRenderIndicator={indicator => (
              <Indicator style={{ position: 'absolute', top: -48 }}>{indicator ? <Ready /> : <Complete />}</Indicator>
            )}
            onPullEnd={this.navigateToChargeAccount}
          >
            <DayList onChange={this.changeCurDate} />
            {bills.length !== 0 ? (
              <BillList dayBills={bills} onDelete={this.deleteBillById} />
            ) : (
              <NoBill key={day} title={'今天还没有记账消费哟！！！'} style={{ marginTop: 36 }} />
            )}
          </PullTableView>
        </View>
      </View>
    )
  }
}

const Styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    flex: 1
  },
  addButton: {
    backgroundColor: '#92C34A',
    margin: 8,
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center'
  }
})
