import React, { PureComponent } from 'react'
import {
  BackHandler,
  Animated,
  Easing,
  Platform,
  StatusBar,
  Linking,
  DeviceEventEmitter
} from 'react-native'
import DeviceInfo from 'react-native-device-info'
import {
  createStackNavigator,
  createBottomTabNavigator,
  NavigationActions
} from 'react-navigation'
import {
  reduxifyNavigator,
  createReactNavigationReduxMiddleware,
  createNavigationReducer
} from 'react-navigation-redux-helpers'
import { connect } from 'react-redux'
import codePush from 'react-native-code-push'
import Loading from './containers/Loading'
import Login from './containers/Login'
import Message from './containers/Message'
import Home from './containers/Home'
import Account from './containers/Account'
import Course from './containers/Course'
import Detail from './containers/Detail'
import Mine from './containers/Mine'
// 状态栏颜色导航栏样式
StatusBar.setBarStyle('light-content')
StatusBar.setHidden(false)
StatusBar.setTranslucent(true)
Platform.OS == 'android' && StatusBar.setBackgroundColor('rgba(0, 0, 0, 0.20)')

const HomeNavigator = createBottomTabNavigator({
  Home: { screen: Home },
  Message: { screen: Message },
  Course: { screen: Course },
  Mine: { screen: Mine }
})

HomeNavigator.navigationOptions = ({ navigation }) => ({
  title: navigation.state.routeName,
  headerStyle: {
    backgroundColor: '#209F68',
    ...Platform.select({
      android: {
        paddingTop:
          DeviceInfo.getSystemVersion() >= '5.0.0'
            ? StatusBar.currentHeight
            : 0,
        height:
          DeviceInfo.getSystemVersion() >= '5.0.0'
            ? 46 + StatusBar.currentHeight
            : 46
      }
    })
  },
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: 'bold'
  }
})

const MainNavigator = createStackNavigator(
  {
    HomeNavigator: { screen: HomeNavigator },
    Detail: { screen: Detail }
  },
  {
    headerMode: 'float'
  }
)

const AppNavigator = createStackNavigator(
  {
    Main: { screen: MainNavigator },
    Login: { screen: Login }
  },
  {
    headerMode: 'none',
    mode: 'modal',
    navigationOptions: {
      gesturesEnabled: false,
      headerTintColor: 'white',
      headerStyle: {},
      headerTruncatedBackTitle: '返回',
      headerMode: Platform.OS === 'ios' ? 'screen' : 'float'
    },
    transitionConfig: () => ({
      transitionSpec: {
        duration: 300,
        easing: Easing.out(Easing.poly(4)),
        timing: Animated.timing
      },
      screenInterpolator: sceneProps => {
        const { layout, position, scene } = sceneProps
        const { index } = scene

        const height = layout.initHeight
        const translateY = position.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [height, 0, 0]
        })

        const opacity = position.interpolate({
          inputRange: [index - 1, index - 0.99, index],
          outputRange: [0, 1, 1]
        })

        return { opacity, transform: [{ translateY }] }
      }
    })
  }
)

export const routerReducer = createNavigationReducer(AppNavigator)

export const routerMiddleware = createReactNavigationReduxMiddleware(
  'root',
  state => state.router
)

const App = reduxifyNavigator(AppNavigator, 'root')

function getActiveRouteName(navigationState) {
  if (!navigationState) {
    return null
  }
  const route = navigationState.routes[navigationState.index]
  if (route.routes) {
    return getActiveRouteName(route)
  }
  return route.routeName
}

@connect(({ app, router }) => ({ app, router }))
class Router extends PureComponent {
  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this.backHandle)
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backHandle)
  }

  backHandle = () => {
    const currentScreen = getActiveRouteName(this.props.router)
    if (currentScreen === 'Login') {
      return true
    }
    if (currentScreen !== 'Home') {
      this.props.dispatch(NavigationActions.back())
      return true
    }
    return false
  }

  render() {
    const { app, dispatch, router } = this.props
    if (app.loading) return <Loading />

    return <App dispatch={dispatch} state={router} />
  }
}

Router = codePush(
  {
    checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
    installMode: codePush.InstallMode.ON_NEXT_RESUME
    // updateDialog: {
    //   appendReleaseDescription: true,
    //   descriptionPrefix: '\n\n更新内容:\n',
    //   mandatoryContinueButtonLabel: '继续',
    //   mandatoryUpdateMessage: '找到一个更新，需要立即安装',
    //   optionalIgnoreButtonLabel: '忽略',
    //   optionalInstallButtonLabel: '安装',
    //   optionalUpdateMessage: '找到一个更新，现在安装？',
    //   title: '有一个更新'
    // }
  },
  status => {
    switch (status) {
      case codePush.SyncStatus.DOWNLOADING_PACKAGE:
        // Show "downloading" modal
        // Toast.show('正在下载更新...')

        break
      case codePush.SyncStatus.INSTALLING_UPDATE:
        // Hide "downloading" modal
        // Toast.show('正在升级...')

        break
      case codePush.SyncStatus.UPDATE_INSTALLED:
        // Toast.show('更新成功')

        break
    }
  },
  ({ receivedBytes, totalBytes }) => {
    /* Update download modal progress */
  }
)(Router)
export default Router
