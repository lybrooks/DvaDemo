import React, { Component } from 'react'
import { StyleSheet, View, Image } from 'react-native'
import { connect } from 'react-redux'

import { Button } from '../../components'

import { NavigationActions } from '../../utils'

@connect()
class Mine extends Component {
  static navigationOptions = {
    tabBarLabel: 'Mine',
    tabBarIcon: ({ focused, tintColor }) => (
      <Image
        style={[styles.icon, { tintColor: focused ? tintColor : 'gray' }]}
        source={require('../../images/mine.png')}
      />
    )
  }

  goBack = () => {
    this.props.dispatch(NavigationActions.back({ routeName: 'Account' }))
  }

  render() {
    return (
      <View style={styles.container}>
        <Button text="Go Back" onPress={this.goBack} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  icon: {
    width: 25,
    height: 25
  }
})

export default Mine
