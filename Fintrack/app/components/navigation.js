import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native'
import * as SplashScreen from "expo-splash-screen"
import { AuthProvider } from '../context/auth'
import NavigationScreen from './navigationScreen'

const Navigation = () => {    
  // SplashScreen.preventAutoHideAsync();
  // setTimeout(SplashScreen.hideAsync, 2000);

  return (
    <NavigationContainer independent={true} >          
      <AuthProvider>
        <NavigationScreen />
      </AuthProvider>
    </NavigationContainer>
  )
}

export default Navigation